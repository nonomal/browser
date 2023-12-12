import { Component } from "@angular/core";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { SimpleDialogOptions, DialogService } from "../..";
import { ButtonModule } from "../../../button";
import { CalloutModule } from "../../../callout";
import { I18nMockService } from "../../../utils/i18n-mock.service";
import { DialogModule } from "../../dialog.module";

@Component({
  template: `
    <div *ngFor="let group of dialogs">
      <h2>{{ group.title }}</h2>
      <div class="tw-mb-4 tw-flex tw-flex-row tw-gap-2">
        <button
          *ngFor="let dialog of group.dialogs"
          bitButton
          (click)="openSimpleConfigurableDialog(dialog)"
        >
          {{ dialog.title }}
        </button>
      </div>
    </div>

    <bit-callout *ngIf="showCallout" [type]="calloutType" title="Dialog Close Result">
      {{ dialogCloseResult }}
    </bit-callout>
  `,
})
class StoryDialogComponent {
  protected dialogs: { title: string; dialogs: SimpleDialogOptions[] }[] = [
    {
      title: "Regular",
      dialogs: [
        {
          title: this.i18nService.t("primaryTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "primary",
        },
        {
          title: this.i18nService.t("successTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "success",
        },
        {
          title: this.i18nService.t("infoTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "info",
        },
        {
          title: this.i18nService.t("warningTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "warning",
        },
        {
          title: this.i18nService.t("dangerTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "danger",
        },
      ],
    },
    {
      title: "Custom",
      dialogs: [
        {
          title: this.i18nService.t("primaryTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "primary",
          acceptButtonText: "Ok",
          cancelButtonText: null,
        },
        {
          title: this.i18nService.t("primaryTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "primary",
          acceptButtonText: this.i18nService.t("accept"),
          cancelButtonText: this.i18nService.t("decline"),
        },
        {
          title: this.i18nService.t("primaryTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "primary",
          acceptButtonText: "Ok",
        },
      ],
    },
    {
      title: "Icon",
      dialogs: [
        {
          title: this.i18nService.t("primaryTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "primary",
          icon: "bwi-family",
        },
      ],
    },
    {
      title: "Additional",
      dialogs: [
        {
          title: this.i18nService.t("primaryTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          type: "primary",
          disableClose: true,
        },
        {
          title: this.i18nService.t("asyncTypeSimpleDialog"),
          content: this.i18nService.t("dialogContent"),
          acceptAction: () => {
            return new Promise((resolve) => setTimeout(resolve, 10000));
          },
          type: "primary",
        },
      ],
    },
  ];

  showCallout = false;
  calloutType = "info";
  dialogCloseResult: boolean;

  constructor(
    public dialogService: DialogService,
    private i18nService: I18nService,
  ) {}

  async openSimpleConfigurableDialog(opts: SimpleDialogOptions) {
    this.dialogCloseResult = await this.dialogService.openSimpleDialog(opts);

    this.showCallout = true;
    if (this.dialogCloseResult) {
      this.calloutType = "success";
    } else {
      this.calloutType = "info";
    }
  }
}

export default {
  title: "Component Library/Dialogs/Service/SimpleConfigurable",
  component: StoryDialogComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonModule, DialogModule, CalloutModule],
    }),
    applicationConfig({
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              primaryTypeSimpleDialog: "Primary Type Simple Dialog",
              successTypeSimpleDialog: "Success Type Simple Dialog",
              infoTypeSimpleDialog: "Info Type Simple Dialog",
              warningTypeSimpleDialog: "Warning Type Simple Dialog",
              dangerTypeSimpleDialog: "Danger Type Simple Dialog",
              asyncTypeSimpleDialog: "Async",
              dialogContent: "Dialog content goes here",
              yes: "Yes",
              no: "No",
              ok: "Ok",
              cancel: "Cancel",
              accept: "Accept",
              decline: "Decline",
            });
          },
        },
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library",
    },
  },
} as Meta;

type Story = StoryObj<StoryDialogComponent>;

export const Default: Story = {};
