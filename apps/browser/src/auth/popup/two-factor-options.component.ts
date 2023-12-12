import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { TwoFactorOptionsComponent as BaseTwoFactorOptionsComponent } from "@bitwarden/angular/auth/components/two-factor-options.component";
import { TwoFactorService } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Component({
  selector: "app-two-factor-options",
  templateUrl: "two-factor-options.component.html",
})
export class TwoFactorOptionsComponent extends BaseTwoFactorOptionsComponent {
  constructor(
    twoFactorService: TwoFactorService,
    router: Router,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    private activatedRoute: ActivatedRoute,
  ) {
    super(twoFactorService, router, i18nService, platformUtilsService, window);
  }

  close() {
    this.navigateTo2FA();
  }

  choose(p: any) {
    super.choose(p);
    this.twoFactorService.setSelectedProvider(p.type);

    this.navigateTo2FA();
  }

  navigateTo2FA() {
    const sso = this.activatedRoute.snapshot.queryParamMap.get("sso") === "true";

    if (sso) {
      // Persist SSO flag back to the 2FA comp if it exists
      // in order for successful login logic to work properly for
      // SSO + 2FA in browser extension
      this.router.navigate(["2fa"], { queryParams: { sso: true } });
    } else {
      this.router.navigate(["2fa"]);
    }
  }
}
