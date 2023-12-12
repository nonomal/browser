import { Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";

import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { PolicyRequest } from "@bitwarden/common/admin-console/models/request/policy.request";
import { VaultTimeoutAction } from "@bitwarden/common/enums/vault-timeout-action.enum";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import {
  BasePolicy,
  BasePolicyComponent,
} from "@bitwarden/web-vault/app/admin-console/organizations/policies/base-policy.component";

export class MaximumVaultTimeoutPolicy extends BasePolicy {
  name = "maximumVaultTimeout";
  description = "maximumVaultTimeoutDesc";
  type = PolicyType.MaximumVaultTimeout;
  component = MaximumVaultTimeoutPolicyComponent;
}

@Component({
  selector: "policy-maximum-timeout",
  templateUrl: "maximum-vault-timeout.component.html",
})
export class MaximumVaultTimeoutPolicyComponent extends BasePolicyComponent {
  vaultTimeoutActionOptions: { name: string; value: string }[];
  data = this.formBuilder.group({
    hours: new FormControl<number>(null),
    minutes: new FormControl<number>(null),
    action: new FormControl<string>(null),
  });

  constructor(
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
  ) {
    super();
    this.vaultTimeoutActionOptions = [
      { name: i18nService.t("userPreference"), value: null },
      { name: i18nService.t(VaultTimeoutAction.Lock), value: VaultTimeoutAction.Lock },
      { name: i18nService.t(VaultTimeoutAction.LogOut), value: VaultTimeoutAction.LogOut },
    ];
  }

  loadData() {
    const minutes = this.policyResponse.data?.minutes;
    const action = this.policyResponse.data?.action;

    this.data.patchValue({
      hours: minutes ? Math.floor(minutes / 60) : null,
      minutes: minutes ? minutes % 60 : null,
      action: action,
    });
  }

  buildRequestData() {
    if (this.data.value.hours == null && this.data.value.minutes == null) {
      return null;
    }

    return {
      minutes: this.data.value.hours * 60 + this.data.value.minutes,
      action: this.data.value.action,
    };
  }

  buildRequest(policiesEnabledMap: Map<PolicyType, boolean>): Promise<PolicyRequest> {
    const singleOrgEnabled = policiesEnabledMap.get(PolicyType.SingleOrg) ?? false;
    if (this.enabled.value && !singleOrgEnabled) {
      throw new Error(this.i18nService.t("requireSsoPolicyReqError"));
    }

    const data = this.buildRequestData();
    if (data?.minutes == null || data?.minutes <= 0) {
      throw new Error(this.i18nService.t("invalidMaximumVaultTimeout"));
    }

    return super.buildRequest(policiesEnabledMap);
  }
}
