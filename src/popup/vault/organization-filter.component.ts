import { animate, state, style, transition, trigger } from "@angular/animations";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { Organization } from "jslib-common/models/domain/organization";

import { OrganizationFilterService } from "../services/organization-filter.service";

@Component({
  selector: "app-org-filter",
  templateUrl: "organization-filter.component.html",
  animations: [
    trigger("transformPanel", [
      state(
        "void",
        style({
          opacity: 0,
        })
      ),
      transition(
        "void => open",
        animate(
          "100ms linear",
          style({
            opacity: 1,
          })
        )
      ),
      transition("* => void", animate("100ms linear", style({ opacity: 0 }))),
    ]),
  ],
})
export class OrganizationFilterComponent implements OnInit {
  @Output() onVaultSelectionChanged = new EventEmitter();

  isOpen = false;
  loaded = false;
  showOrganizations = true;
  organizations: Organization[];
  vaultFilter: string;
  vaultFilterDisplay = "";
  overlayPostition: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
  ];

  constructor(
    private organizationService: OrganizationService,
    private organizationFilterService: OrganizationFilterService,
    private i18nService: I18nService
  ) {}
  async ngOnInit() {
    this.vaultFilter = this.organizationFilterService.getVaultFilter();
    this.organizations = await this.organizationService.getAll();
    if (this.organizations.length > 0) {
      this.showOrganizations = true;
    }
    if (this.vaultFilter === "myVault") {
      this.vaultFilterDisplay = this.i18nService.t(this.organizationFilterService.myVault);
    } else if (this.vaultFilter === "allVaults" || this.vaultFilter == null) {
      this.vaultFilterDisplay = this.i18nService.t(this.organizationFilterService.allVaults);
    } else {
      this.vaultFilterDisplay = this.organizations.find((o) => o.id === this.vaultFilter).name;
    }
    this.loaded = true;
  }
  toggle() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  selectOrganization(organization: Organization) {
    this.vaultFilterDisplay = organization.name;
    this.organizationFilterService.setVaultFilter(organization.id);
    this.onVaultSelectionChanged.emit();
    this.close();
  }
  selectAllVaults() {
    this.vaultFilterDisplay = this.i18nService.t(this.organizationFilterService.allVaults);
    this.organizationFilterService.setVaultFilter(this.organizationFilterService.allVaults);
    this.onVaultSelectionChanged.emit();
    this.close();
  }
  selectMyVault() {
    this.vaultFilterDisplay = this.i18nService.t(this.organizationFilterService.myVault);
    this.organizationFilterService.setVaultFilter(this.organizationFilterService.myVault);
    this.onVaultSelectionChanged.emit();
    this.close();
  }
}
