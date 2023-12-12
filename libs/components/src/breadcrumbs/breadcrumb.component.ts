import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { QueryParamsHandling } from "@angular/router";

@Component({
  selector: "bit-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
})
export class BreadcrumbComponent {
  @Input()
  icon?: string;

  @Input()
  route?: string | any[] = undefined;

  @Input()
  queryParams?: Record<string, string> = {};

  @Input()
  queryParamsHandling?: QueryParamsHandling;

  @Output()
  click = new EventEmitter();

  @ViewChild(TemplateRef, { static: true }) content: TemplateRef<unknown>;

  onClick(args: unknown) {
    this.click.next(args);
  }
}
