import { Directive, ElementRef, Input, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[prosCorrectedValue]'
})
export class CorrectedValueDirective implements AfterViewInit {
  @Input() displayValue: string;
  @Input() useWith: string;
  @Input() isMultiSelect: boolean;

  constructor(
    private _elemRef: ElementRef,
    private _renderer: Renderer2) {
  }

  ngAfterViewInit() {
    if (this.displayValue) {
      switch (this.useWith) {
        case 'tableGrid':
          this.createDataRefTableCell();
          break;
        case 'withSuffix':
          this.createDataRefWithSuffix();
          break;
        default:
          this.createDataRefText()
          break;
      }
    }
  }

  createDataRefTableCell() {
    const div = this._renderer.createElement('div');
    const text = this._renderer.createText(this.displayValue);
    this._renderer.addClass(div, 'line-cut');
    this._renderer.appendChild(div, text);

    this._renderer.appendChild(this._elemRef.nativeElement, div);
    this._renderer.addClass(this._elemRef.nativeElement, 'correction-cell');
  }

  createDataRefText() {
    const span = this._renderer.createElement('span');
    const text = this._renderer.createText(this.displayValue);

    this._renderer.appendChild(span, text);

    this._renderer.addClass(span, 'corrected-text');

    const scrollContainer = this._elemRef.nativeElement.querySelector('.mdo-field-input');
    this._renderer.addClass(scrollContainer, 'corrected-cls');
    this._renderer.appendChild(scrollContainer, span);
  }

  createDataRefWithSuffix() {
    const div = this._renderer.createElement('div');
    const text = this._renderer.createText(this.displayValue);

    this._renderer.appendChild(div, text);
    this._renderer.addClass(div, 'corrected-text');
    this._renderer.addClass(div, 'with-border');
    if (this.isMultiSelect) {
      this._renderer.addClass(div, 'adjust-width');
    }

    const scrollContainer = this._elemRef.nativeElement.querySelector('.mdo-field');
    this._renderer.addClass(scrollContainer, 'corrected-cls');
    this._renderer.addClass(scrollContainer, 'separate-section');
    this._renderer.appendChild(scrollContainer, div);
  }

}
