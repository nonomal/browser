import { EventCollectionService as EventCollectionServiceAbstraction } from "../../abstractions/event/event-collection.service";
import { EventUploadService } from "../../abstractions/event/event-upload.service";
import { OrganizationService } from "../../admin-console/abstractions/organization/organization.service.abstraction";
import { EventType } from "../../enums";
import { EventData } from "../../models/data/event.data";
import { StateService } from "../../platform/abstractions/state.service";
import { CipherService } from "../../vault/abstractions/cipher.service";

export class EventCollectionService implements EventCollectionServiceAbstraction {
  constructor(
    private cipherService: CipherService,
    private stateService: StateService,
    private organizationService: OrganizationService,
    private eventUploadService: EventUploadService,
  ) {}

  async collect(
    eventType: EventType,
    cipherId: string = null,
    uploadImmediately = false,
    organizationId: string = null,
  ): Promise<any> {
    const authed = await this.stateService.getIsAuthenticated();
    if (!authed) {
      return;
    }
    const organizations = await this.organizationService.getAll();
    if (organizations == null) {
      return;
    }
    const orgIds = new Set<string>(organizations.filter((o) => o.useEvents).map((o) => o.id));
    if (orgIds.size === 0) {
      return;
    }
    if (cipherId != null) {
      const cipher = await this.cipherService.get(cipherId);
      if (cipher == null || cipher.organizationId == null || !orgIds.has(cipher.organizationId)) {
        return;
      }
    }
    if (organizationId != null) {
      if (!orgIds.has(organizationId)) {
        return;
      }
    }
    let eventCollection = await this.stateService.getEventCollection();
    if (eventCollection == null) {
      eventCollection = [];
    }
    const event = new EventData();
    event.type = eventType;
    event.cipherId = cipherId;
    event.date = new Date().toISOString();
    event.organizationId = organizationId;
    eventCollection.push(event);
    await this.stateService.setEventCollection(eventCollection);
    if (uploadImmediately) {
      await this.eventUploadService.uploadEvents();
    }
  }
}
