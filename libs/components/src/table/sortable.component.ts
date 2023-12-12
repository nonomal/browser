import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Component, HostBinding, Input, OnInit } from "@angular/core";

import type { SortFn } from "./table-data-source";
import { TableComponent } from "./table.component";

@Component({
  selector: "th[bitSortable]",
  template: `
    <button [ngClass]="classList" [attr.aria-pressed]="isActive" (click)="setActive()">
      <ng-content></ng-content>
      <i class="bwi tw-ml-2" [ngClass]="icon"></i>
    </button>
  `,
})
export class SortableComponent implements OnInit {
  /**
   * Mark the column as sortable and specify the key to sort by
   */
  @Input() bitSortable: string;

  private _default: boolean;
  /**
   * Mark the column as the default sort column
   */
  @Input() set default(value: boolean | "") {
    this._default = coerceBooleanProperty(value);
  }

  /**
   * Custom sorting function
   *
   * @example
   * fn = (a, b) => a.name.localeCompare(b.name)
   */
  @Input() fn: SortFn;

  constructor(private table: TableComponent) {}

  ngOnInit(): void {
    if (this._default && !this.isActive) {
      this.setActive();
    }
  }

  @HostBinding("attr.aria-sort") get ariaSort() {
    if (!this.isActive) {
      return undefined;
    }
    return this.sort.direction === "asc" ? "ascending" : "descending";
  }

  protected setActive() {
    if (this.table.dataSource) {
      const direction = this.isActive && this.direction === "asc" ? "desc" : "asc";
      this.table.dataSource.sort = { column: this.bitSortable, direction: direction, fn: this.fn };
    }
  }

  private get sort() {
    return this.table.dataSource?.sort;
  }

  get isActive() {
    return this.sort?.column === this.bitSortable;
  }

  get direction() {
    return this.sort?.direction;
  }

  get icon() {
    if (!this.isActive) {
      return "bwi-up-down-btn";
    }
    return this.direction === "asc" ? "bwi-up-solid" : "bwi-down-solid";
  }

  get classList() {
    return [
      "tw-group",
      "tw-min-w-max",

      // Offset to border and padding
      "-tw-m-1.5",
      "tw-font-bold",

      // Below is copied from BitIconButtonComponent
      "tw-border",
      "tw-border-solid",
      "tw-rounded",
      "tw-transition",
      "hover:tw-no-underline",
      "focus:tw-outline-none",

      "tw-bg-transparent",
      "!tw-text-muted",
      "tw-border-transparent",
      "hover:tw-bg-transparent-hover",
      "hover:tw-border-primary-700",
      "focus-visible:before:tw-ring-primary-700",
      "disabled:tw-opacity-60",
      "disabled:hover:tw-border-transparent",
      "disabled:hover:tw-bg-transparent",

      // Workaround for box-shadow with transparent offset issue:
      // https://github.com/tailwindlabs/tailwindcss/issues/3595
      // Remove `before:` and use regular `tw-ring` when browser no longer has bug, or better:
      // switch to `outline` with `outline-offset` when Safari supports border radius on outline.
      // Using `box-shadow` to create outlines is a hack and as such `outline` should be preferred.
      "tw-relative",
      "before:tw-content-['']",
      "before:tw-block",
      "before:tw-absolute",
      "before:-tw-inset-[3px]",
      "before:tw-rounded-md",
      "before:tw-transition",
      "before:tw-ring",
      "before:tw-ring-transparent",
      "focus-visible:tw-z-10",
    ];
  }
}
