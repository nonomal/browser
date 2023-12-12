import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, map, Observable, startWith, Subject, switchMap, takeUntil } from "rxjs";

import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import { ServiceAccountProjectAccessPolicyView } from "../../models/view/access-policy.view";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";
import {
  AccessSelectorComponent,
  AccessSelectorRowView,
} from "../../shared/access-policies/access-selector.component";

@Component({
  selector: "sm-service-account-projects",
  templateUrl: "./service-account-projects.component.html",
})
export class ServiceAccountProjectsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private serviceAccountId: string;
  private organizationId: string;

  protected rows$: Observable<AccessSelectorRowView[]> =
    this.accessPolicyService.serviceAccountGrantedPolicyChanges$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(([_, params]) =>
        this.accessPolicyService.getGrantedPolicies(params.serviceAccountId, params.organizationId),
      ),
      map((policies) => {
        return policies.map((policy) => {
          return {
            type: "project",
            name: policy.grantedProjectName,
            id: policy.grantedProjectId,
            accessPolicyId: policy.id,
            read: policy.read,
            write: policy.write,
            icon: AccessSelectorComponent.projectIcon,
            static: false,
          } as AccessSelectorRowView;
        });
      }),
    );

  protected handleCreateAccessPolicies(selected: SelectItemView[]) {
    const serviceAccountProjectAccessPolicyView = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "project")
      .map((filtered) => {
        const view = new ServiceAccountProjectAccessPolicyView();
        view.serviceAccountId = this.serviceAccountId;
        view.grantedProjectId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    return this.accessPolicyService.createGrantedPolicies(
      this.organizationId,
      this.serviceAccountId,
      serviceAccountProjectAccessPolicyView,
    );
  }

  protected async handleUpdateAccessPolicy(policy: AccessSelectorRowView) {
    try {
      return await this.accessPolicyService.updateAccessPolicy(
        AccessSelectorComponent.getBaseAccessPolicyView(policy),
      );
    } catch (e) {
      this.validationService.showError(e);
    }
  }

  protected async handleDeleteAccessPolicy(policy: AccessSelectorRowView) {
    try {
      await this.accessPolicyService.deleteAccessPolicy(policy.accessPolicyId);
    } catch (e) {
      this.validationService.showError(e);
    }
  }

  constructor(
    private route: ActivatedRoute,
    private validationService: ValidationService,
    private accessPolicyService: AccessPolicyService,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organizationId = params.organizationId;
      this.serviceAccountId = params.serviceAccountId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
