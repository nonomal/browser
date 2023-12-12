import { View } from "@bitwarden/common/models/view/view";

import { PendingOrganizationAuthRequestResponse } from "../services/auth-requests";

export class PendingAuthRequestView implements View {
  id: string;
  userId: string;
  organizationUserId: string;
  email: string;
  publicKey: string;
  requestDeviceIdentifier: string;
  requestDeviceType: string;
  requestIpAddress: string;
  creationDate: Date;

  static fromResponse(response: PendingOrganizationAuthRequestResponse): PendingAuthRequestView {
    const view = Object.assign(new PendingAuthRequestView(), response) as PendingAuthRequestView;

    view.creationDate = new Date(response.creationDate);

    return view;
  }
}
