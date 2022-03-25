import { Location } from "@angular/common";
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { FolderService } from "jslib-common/abstractions/folder.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SearchService } from "jslib-common/abstractions/search.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { CipherType } from "jslib-common/enums/cipherType";
import { Organization } from "jslib-common/models/domain/organization";
import { TreeNode } from "jslib-common/models/domain/treeNode";
import { CipherView } from "jslib-common/models/view/cipherView";
import { CollectionView } from "jslib-common/models/view/collectionView";
import { FolderView } from "jslib-common/models/view/folderView";

import { BrowserGroupingsComponentState } from "src/models/browserGroupingsComponentState";

import { BrowserApi } from "../../browser/browserApi";
import { StateService } from "../../services/abstractions/state.service";
import { OrganizationFilterService } from "../services/organization-filter.service";
import { PopupUtilsService } from "../services/popup-utils.service";

const ComponentId = "VaultComponent";

@Component({
  selector: "app-groupings",
  templateUrl: "groupings.component.html",
})
export class GroupingsComponent implements OnInit, OnDestroy {
  get showNoFolderCiphers(): boolean {
    return (
      this.noFolderCiphers != null &&
      this.noFolderCiphers.length < this.noFolderListSize &&
      this.collections.length === 0
    );
  }

  get folderCount(): number {
    return this.nestedFolders.length - (this.showNoFolderCiphers ? 0 : 1);
  }
  folders: FolderView[];
  nestedFolders: TreeNode<FolderView>[];
  collections: CollectionView[];
  nestedCollections: TreeNode<CollectionView>[];
  loaded = false;
  cipherType = CipherType;
  ciphers: CipherView[];
  favoriteCiphers: CipherView[];
  noFolderCiphers: CipherView[];
  folderCounts = new Map<string, number>();
  collectionCounts = new Map<string, number>();
  typeCounts = new Map<CipherType, number>();
  searchText: string;
  state: BrowserGroupingsComponentState;
  showLeftHeader = true;
  searchPending = false;
  searchTypeSearch = false;
  deletedCount = 0;
  vaultFilter = "";
  showOrganizations = false;
  organizations: Organization[];
  selectedOrganization: string = null;

  private loadedTimeout: number;
  private selectedTimeout: number;
  private preventSelected = false;
  private noFolderListSize = 100;
  private searchTimeout: any = null;
  private hasSearched = false;
  private hasLoadedAllCiphers = false;
  private allCiphers: CipherView[] = null;

  constructor(
    private collectionService: CollectionService,
    private folderService: FolderService,
    private cipherService: CipherService,
    private organizationService: OrganizationService,
    private stateService: StateService,
    private router: Router,
    private ngZone: NgZone,
    private broadcasterService: BroadcasterService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private popupUtils: PopupUtilsService,
    private syncService: SyncService,
    private platformUtilsService: PlatformUtilsService,
    private searchService: SearchService,
    private location: Location,
    private browserStateService: StateService,
    private organizationFilterService: OrganizationFilterService
  ) {
    this.noFolderListSize = 100;
  }

  async ngOnInit() {
    this.searchTypeSearch = !this.platformUtilsService.isSafari();
    this.showLeftHeader = !(
      this.popupUtils.inSidebar(window) && this.platformUtilsService.isFirefox()
    );
    await this.browserStateService.setBrowserCipherComponentState(null);

    this.broadcasterService.subscribe(ComponentId, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "syncCompleted":
            window.setTimeout(() => {
              this.load();
            }, 500);
            break;
          default:
            break;
        }

        this.changeDetectorRef.detectChanges();
      });
    });

    const restoredScopeState = await this.restoreState();
    this.route.queryParams.pipe(first()).subscribe(async (params) => {
      this.state = await this.browserStateService.getBrowserGroupingComponentState();
      if (this.state?.searchText) {
        this.searchText = this.state.searchText;
      } else if (params.searchText) {
        this.searchText = params.searchText;
        this.location.replaceState("vault");
      }

      if (!this.syncService.syncInProgress) {
        this.load();
      } else {
        this.loadedTimeout = window.setTimeout(() => {
          if (!this.loaded) {
            this.load();
          }
        }, 5000);
      }

      if (!this.syncService.syncInProgress || restoredScopeState) {
        window.setTimeout(() => this.popupUtils.setContentScrollY(window, this.state?.scrollY), 0);
      }
    });
  }

  ngOnDestroy() {
    if (this.loadedTimeout != null) {
      window.clearTimeout(this.loadedTimeout);
    }
    if (this.selectedTimeout != null) {
      window.clearTimeout(this.selectedTimeout);
    }
    this.saveState();
    this.broadcasterService.unsubscribe(ComponentId);
  }

  async load() {
    this.vaultFilter = this.organizationFilterService.getVaultFilter();

    await this.loadFolders();
    await this.loadCollections();
    await this.loadOrganizations();
    await this.loadCiphers();

    if (this.showNoFolderCiphers && this.nestedFolders.length > 0) {
      // Remove "No Folder" from folder listing
      this.nestedFolders = this.nestedFolders.slice(0, this.nestedFolders.length - 1);
    }

    this.loaded = true;
  }

  async loadCiphers() {
    this.allCiphers = await this.cipherService.getAllDecrypted();
    if (!this.hasLoadedAllCiphers) {
      this.hasLoadedAllCiphers = !this.searchService.isSearchable(this.searchText);
    }
    await this.search(null);
    this.getCounts();
  }

  async loadCollections(organizationId?: string) {
    const collections = await this.collectionService.getAllDecrypted();
    if (organizationId != null) {
      this.collections = collections.filter((c) => c.organizationId === organizationId);
    } else {
      this.collections = collections;
    }
    this.nestedCollections = await this.collectionService.getAllNested(this.collections);
  }

  async loadFolders(organizationId?: string) {
    const folders = await this.folderService.getAllDecrypted();
    if (organizationId != null) {
      const ciphers = await this.cipherService.getAllDecrypted();
      const orgCiphers = ciphers.filter((c) => c.organizationId == organizationId);
      this.folders = folders.filter(
        (f) =>
          f.id != null &&
          (orgCiphers.filter((oc) => oc.folderId == f.id).length > 0 ||
            ciphers.filter((c) => c.folderId == f.id).length < 1)
      );
    } else {
      this.folders = folders;
    }
    this.nestedFolders = await this.folderService.getAllNested(this.folders);
  }

  async loadOrganizations() {
    this.showOrganizations = await this.organizationService.hasOrganizations();
    if (!this.showOrganizations) {
      return;
    }
    this.organizations = await this.organizationService.getAll();
  }

  async search(timeout: number = null) {
    this.searchPending = false;
    if (this.searchTimeout != null) {
      clearTimeout(this.searchTimeout);
    }
    const filterDeleted = (c: CipherView) => !c.isDeleted;
    if (timeout == null) {
      this.hasSearched = this.searchService.isSearchable(this.searchText);
      this.ciphers = await this.searchService.searchCiphers(
        this.searchText,
        filterDeleted,
        this.allCiphers
      );
      return;
    }
    this.searchPending = true;
    this.searchTimeout = setTimeout(async () => {
      this.hasSearched = this.searchService.isSearchable(this.searchText);
      if (!this.hasLoadedAllCiphers && !this.hasSearched) {
        await this.loadCiphers();
      } else {
        this.ciphers = await this.searchService.searchCiphers(
          this.searchText,
          filterDeleted,
          this.allCiphers
        );
      }
      this.searchPending = false;
    }, timeout);
  }

  async selectType(type: CipherType) {
    this.router.navigate(["/ciphers"], { queryParams: { type: type } });
  }

  async selectFolder(folder: FolderView) {
    this.router.navigate(["/ciphers"], { queryParams: { folderId: folder.id || "none" } });
  }

  async selectCollection(collection: CollectionView) {
    this.router.navigate(["/ciphers"], { queryParams: { collectionId: collection.id } });
  }

  async selectTrash() {
    this.router.navigate(["/ciphers"], { queryParams: { deleted: true } });
  }

  async selectCipher(cipher: CipherView) {
    this.selectedTimeout = window.setTimeout(() => {
      if (!this.preventSelected) {
        this.router.navigate(["/view-cipher"], { queryParams: { cipherId: cipher.id } });
      }
      this.preventSelected = false;
    }, 200);
  }

  async launchCipher(cipher: CipherView) {
    if (cipher.type !== CipherType.Login || !cipher.login.canLaunch) {
      return;
    }

    if (this.selectedTimeout != null) {
      window.clearTimeout(this.selectedTimeout);
    }
    this.preventSelected = true;
    await this.cipherService.updateLastLaunchedDate(cipher.id);
    BrowserApi.createNewTab(cipher.login.launchUri);
    if (this.popupUtils.inPopup(window)) {
      BrowserApi.closePopup(window);
    }
  }

  async addCipher() {
    this.router.navigate(["/add-cipher"]);
  }

  async vaultFilterChanged() {
    this.vaultFilter = this.organizationFilterService.getVaultFilter();
    if (this.vaultFilter === "myVault") {
      this.selectedOrganization = null;
    } else if (this.vaultFilter === "allVaults" || this.vaultFilter == null) {
      this.vaultFilter = this.organizationFilterService.allVaults;
      this.selectedOrganization = null;
    } else {
      this.selectedOrganization = this.vaultFilter;
    }
    await this.reloadCollectionsAndFolders();
    if (this.vaultFilter == null) {
      this.vaultFilter = this.organizationFilterService.allVaults;
    }

    this.getCounts();
  }

  getCounts() {
    let favoriteCiphers: CipherView[] = null;
    let noFolderCiphers: CipherView[] = null;
    const folderCounts = new Map<string, number>();
    const collectionCounts = new Map<string, number>();
    const typeCounts = new Map<CipherType, number>();

    this.deletedCount = this.allCiphers.filter(
      (c) => c.isDeleted && !this.organizationFilterService.filterCipher(c)
    ).length;

    this.ciphers?.forEach((c) => {
      if (!this.organizationFilterService.filterCipher(c)) {
        if (c.isDeleted) {
          return;
        }
        if (c.favorite) {
          if (favoriteCiphers == null) {
            favoriteCiphers = [];
          }
          favoriteCiphers.push(c);
        }

        if (c.folderId == null) {
          if (noFolderCiphers == null) {
            noFolderCiphers = [];
          }
          noFolderCiphers.push(c);
        }

        if (typeCounts.has(c.type)) {
          typeCounts.set(c.type, typeCounts.get(c.type) + 1);
        } else {
          typeCounts.set(c.type, 1);
        }

        if (folderCounts.has(c.folderId)) {
          folderCounts.set(c.folderId, folderCounts.get(c.folderId) + 1);
        } else {
          folderCounts.set(c.folderId, 1);
        }

        if (c.collectionIds != null) {
          c.collectionIds.forEach((colId) => {
            if (collectionCounts.has(colId)) {
              collectionCounts.set(colId, collectionCounts.get(colId) + 1);
            } else {
              collectionCounts.set(colId, 1);
            }
          });
        }
      }
    });

    this.favoriteCiphers = favoriteCiphers;
    this.noFolderCiphers = noFolderCiphers;
    this.typeCounts = typeCounts;
    this.folderCounts = folderCounts;
    this.collectionCounts = collectionCounts;
  }

  showSearching() {
    return (
      this.hasSearched || (!this.searchPending && this.searchService.isSearchable(this.searchText))
    );
  }

  closeOnEsc(e: KeyboardEvent) {
    // If input not empty, use browser default behavior of clearing input instead
    if (e.key === "Escape" && (this.searchText == null || this.searchText === "")) {
      BrowserApi.closePopup(window);
    }
  }

  private async reloadCollectionsAndFolders() {
    await this.loadCollections(this.selectedOrganization);
    await this.loadFolders(this.selectedOrganization);
  }

  private async saveState() {
    this.state = {
      scrollY: this.popupUtils.getContentScrollY(window),
      searchText: this.searchText,
      favoriteCiphers: this.favoriteCiphers,
      noFolderCiphers: this.noFolderCiphers,
      ciphers: this.ciphers,
      collectionCounts: this.collectionCounts,
      folderCounts: this.folderCounts,
      typeCounts: this.typeCounts,
      folders: this.folders,
      collections: this.collections,
      deletedCount: this.deletedCount,
    };
    await this.browserStateService.setBrowserGroupingComponentState(this.state);
  }

  private async restoreState(): Promise<boolean> {
    this.state = await this.browserStateService.getBrowserGroupingComponentState();
    if (this.state == null) {
      return false;
    }

    if (this.state.favoriteCiphers != null) {
      this.favoriteCiphers = this.state.favoriteCiphers;
    }
    if (this.state.noFolderCiphers != null) {
      this.noFolderCiphers = this.state.noFolderCiphers;
    }
    if (this.state.ciphers != null) {
      this.ciphers = this.state.ciphers;
    }
    if (this.state.collectionCounts != null) {
      this.collectionCounts = this.state.collectionCounts;
    }
    if (this.state.folderCounts != null) {
      this.folderCounts = this.state.folderCounts;
    }
    if (this.state.typeCounts != null) {
      this.typeCounts = this.state.typeCounts;
    }
    if (this.state.folders != null) {
      this.folders = this.state.folders;
    }
    if (this.state.collections != null) {
      this.collections = this.state.collections;
    }
    if (this.state.deletedCount != null) {
      this.deletedCount = this.state.deletedCount;
    }

    return true;
  }
}
