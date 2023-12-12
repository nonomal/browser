import { BaseResponse } from "../../../../models/response/base.response";
import { EncString } from "../../../../platform/models/domain/enc-string";

export interface ITrustedDeviceUserDecryptionOptionServerResponse {
  HasAdminApproval: boolean;
  HasLoginApprovingDevice: boolean;
  HasManageResetPasswordPermission: boolean;
  EncryptedPrivateKey?: string;
  EncryptedUserKey?: string;
}

export class TrustedDeviceUserDecryptionOptionResponse extends BaseResponse {
  hasAdminApproval: boolean;
  hasLoginApprovingDevice: boolean;
  hasManageResetPasswordPermission: boolean;
  encryptedPrivateKey: EncString;
  encryptedUserKey: EncString;

  constructor(response: any) {
    super(response);
    this.hasAdminApproval = this.getResponseProperty("HasAdminApproval");

    this.hasLoginApprovingDevice = this.getResponseProperty("HasLoginApprovingDevice");
    this.hasManageResetPasswordPermission = this.getResponseProperty(
      "HasManageResetPasswordPermission",
    );

    if (response.EncryptedPrivateKey) {
      this.encryptedPrivateKey = new EncString(this.getResponseProperty("EncryptedPrivateKey"));
    }
    if (response.EncryptedUserKey) {
      this.encryptedUserKey = new EncString(this.getResponseProperty("EncryptedUserKey"));
    }
  }
}
