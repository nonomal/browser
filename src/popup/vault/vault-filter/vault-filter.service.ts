import { VaultFilterService as BaseVaultFilterService } from "jslib-angular/modules/vault-filter/vault-filter.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { FolderService } from "jslib-common/abstractions/folder.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { CipherView } from "jslib-common/models/view/cipherView";

export class VaultFilterService extends BaseVaultFilterService {
  allVaults = "allVaults";
  myVault = "myVault";
  selectedFilter: string;
  selectedOrganizationId: string;
  myVaultOnly = false;

  constructor(
    stateService: StateService,
    organizationService: OrganizationService,
    folderService: FolderService,
    cipherService: CipherService,
    collectionService: CollectionService,
    policyService: PolicyService
  ) {
    super(
      stateService,
      organizationService,
      folderService,
      cipherService,
      collectionService,
      policyService
    );
    this.selectedFilter = this.allVaults;
  }

  getVaultFilter() {
    console.log("selected filter: " + this.selectedFilter);
    return this.selectedFilter;
  }

  setVaultFilter(filter: string) {
    if (filter === this.allVaults) {
      this.myVaultOnly = false;
      this.selectedOrganizationId = null;
    } else if (filter === this.myVault) {
      this.myVaultOnly = true;
      this.selectedOrganizationId = null;
    } else {
      this.myVaultOnly = false;
      this.selectedOrganizationId = filter;
    }
    this.selectedFilter = filter;
  }

  clear() {
    console.log("clearing vault selection");
    this.setVaultFilter(this.allVaults);
  }

  filterCipherForSelectedVault(cipher: CipherView) {
    if (!this.selectedOrganizationId && !this.myVaultOnly) {
      return false;
    }
    if (this.selectedOrganizationId) {
      if (cipher.organizationId === this.selectedOrganizationId) {
        return false;
      }
    } else if (this.myVaultOnly) {
      if (!cipher.organizationId) {
        return false;
      }
    }
    return true;
  }
}
