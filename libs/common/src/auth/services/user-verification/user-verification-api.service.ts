import { ApiService } from "../../../abstractions/api.service";
import { UserVerificationApiServiceAbstraction } from "../../abstractions/user-verification/user-verification-api.service.abstraction";
import { VerifyOTPRequest } from "../../models/request/verify-otp.request";

export class UserVerificationApiService implements UserVerificationApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

  postAccountVerifyOTP(request: VerifyOTPRequest): Promise<void> {
    return this.apiService.send("POST", "/accounts/verify-otp", request, true, false);
  }
  async postAccountRequestOTP(): Promise<void> {
    return this.apiService.send("POST", "/accounts/request-otp", null, true, false);
  }
}
