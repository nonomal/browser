import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

export interface AccessTokenDetails {
  subTitle: string;
  expirationDate?: Date;
  accessToken: string;
}

@Component({
  templateUrl: "./access-token-dialog.component.html",
})
export class AccessTokenDialogComponent implements OnInit {
  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: AccessTokenDetails,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    // TODO remove null checks once strictNullChecks in TypeScript is turned on.
    if (!this.data.subTitle || !this.data.accessToken) {
      this.dialogRef.close();
      throw new Error("The access token dialog was not called with the appropriate values.");
    }
  }

  copyAccessToken(): void {
    this.platformUtilsService.copyToClipboard(this.data.accessToken);
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("accessTokenCreatedAndCopied"),
    );
    this.dialogRef.close();
  }
}
