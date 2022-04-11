import { Injectable } from "@angular/core";

import { CipherView } from "jslib-common/models/view/cipherView";

@Injectable()
export class VaultSelectService {
  allVaults = "allVaults";
  myVault = "myVault";
  selectedFilter: string;
  selectedOrganizationId: string;
  myVaultOnly = false;

  constructor() {
    this.selectedFilter = this.allVaults;
  }

  getVaultFilter() {
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
    this.setVaultFilter(this.allVaults);
  }

  filterCipher(cipher: CipherView) {
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
