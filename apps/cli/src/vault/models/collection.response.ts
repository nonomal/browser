import { CollectionWithIdExport } from "@bitwarden/common/models/export/collection-with-id.export";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

import { BaseResponse } from "../../models/response/base.response";

export class CollectionResponse extends CollectionWithIdExport implements BaseResponse {
  object: string;

  constructor(o: CollectionView) {
    super();
    this.object = "collection";
    this.build(o);
  }
}
