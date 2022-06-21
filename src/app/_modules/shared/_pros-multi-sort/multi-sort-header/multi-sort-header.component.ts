import {
  Component,
  Input,
  ChangeDetectorRef,
  Optional,
  Inject,
  HostListener,
  HostBinding,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ElementRef
} from '@angular/core';
import { matSortAnimations, MatSortHeader, MatSortHeaderIntl } from '@angular/material/sort';
import { MultiSortDirective } from '../multi-sort.directive';
import { FocusMonitor } from '@angular/cdk/a11y';

/** Column definition associated with a `MatSortHeader`. */
interface C2MatSortHeaderColumnDef {
  name: string;
}

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: '[pros-multi-sort-header]',
  exportAs: 'prosMultiSortHeader',
  templateUrl: './multi-sort-header.component.html',
  styleUrls: ['./multi-sort-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    matSortAnimations.indicator,
    matSortAnimations.leftPointer,
    matSortAnimations.rightPointer,
    matSortAnimations.arrowOpacity,
    matSortAnimations.arrowPosition,
    matSortAnimations.allowChildren
  ]
})
export class MultiSortHeaderComponent extends MatSortHeader {
  start = 'asc' as 'asc' | 'desc';
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('pros-multi-sort-header') id: string;

  constructor(public _intl: MatSortHeaderIntl,
    changeDetectorRef: ChangeDetectorRef,
    @Optional() public _sort: MultiSortDirective,
    @Inject('C2_SORT_HEADER_COLUMN_DEF') @Optional() public _columnDef: C2MatSortHeaderColumnDef,
    _focusMonitor: FocusMonitor,
    _elementRef: ElementRef<HTMLElement>) {
    super(_intl, changeDetectorRef, _sort, _columnDef, _focusMonitor, _elementRef);
  }

  @HostListener('mouseenter', ['true'])
  @HostListener('longpress', ['true'])
  @HostListener('mouseleave', ['false'])
  __setIndicatorHintVisible(visible: string | boolean) {
    super._setIndicatorHintVisible(visible as boolean);
  }

  _handleClick() {
    this._sort.direction = this.getSortDirection();
    super._handleClick();
  }

  _isSorted() {
    return this._sort.actives.findIndex(activeId => activeId === this.id) > -1;
  }

  _sortId() {
    return this._sort.actives.findIndex(activeId => activeId === this.id) + 1;
  }

  _updateArrowDirection() {
    this._arrowDirection = this.getSortDirection();
  }

  @HostBinding('attr.aria-sort')
  _getAriaSortAttribute() {
    if (!this._isSorted()) {
      return null;
    }

    return this.getSortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  _renderArrow() {
    return !this._isDisabled() || this._isSorted();
  }

  getSortDirection(): 'asc' | 'desc' | '' {
    const i = this._sort.actives.findIndex(activeIds => activeIds === this.id);
    const direction = this._sort.directions[i];
    return this._isSorted() ? direction : (this.start || this._sort.start);
  }

}
