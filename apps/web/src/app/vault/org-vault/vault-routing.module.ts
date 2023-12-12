import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { canAccessVaultTab } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";

import { OrganizationPermissionsGuard } from "../../admin-console/organizations/guards/org-permissions.guard";

import { VaultComponent } from "./vault.component";
const routes: Routes = [
  {
    path: "",
    component: VaultComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: { titleId: "vaults", organizationPermissions: canAccessVaultTab },
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VaultRoutingModule {}
