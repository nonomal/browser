import { Component, HostBinding, Input } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

import { Icon, isIcon } from "./icon";

@Component({
  selector: "bit-icon",
  template: ``,
})
export class BitIconComponent {
  @Input() set icon(icon: Icon) {
    if (!isIcon(icon)) {
      this.innerHtml = "";
      return;
    }

    const svg = icon.svg;
    this.innerHtml = this.domSanitizer.bypassSecurityTrustHtml(svg);
  }

  @HostBinding() innerHtml: SafeHtml;

  constructor(private domSanitizer: DomSanitizer) {}
}
