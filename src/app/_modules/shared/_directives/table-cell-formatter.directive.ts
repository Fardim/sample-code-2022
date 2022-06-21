import { ComponentFactoryResolver, Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, ViewContainerRef } from '@angular/core';
import { UserService } from '@services/user/userservice.service';
import { ChipComponent, ChipListComponent } from 'mdo-ui-library';
import * as moment from 'moment';
import { take } from 'rxjs/operators';

@Directive({
  selector: '[prosTableCellFormatter]'
})
export class TableCellFormatterDirective implements OnChanges {

  @Input()
  fieldType: string;

  @Input()
  cellValue: any;

  @Input()
  maxAllowedChips = 1;

  DefaultDateFormat = 'DD.MM.YY (hh:mm)';

  constructor(private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private renderer: Renderer2,
    private elemRef: ElementRef,
    private userService: UserService) { }


  ngOnChanges(changes: SimpleChanges): void {
    if((changes.fieldType && changes.fieldType.currentValue !== changes.fieldType.previousValue)
      || (changes.cellValue && changes.cellValue.currentValue !== changes.cellValue.previousValue)) {

      this.cellValue = changes.cellValue?.currentValue?.filter(o => o.t || o.c);
      this.formatCell();
    }
  }

  formatCell() {
    if(!this.cellValue?.length) {
      return;
    }
    switch(this.fieldType) {
      case 'DATEPICKER':
        this.formatDateCell();
        break;
      case 'URL':
        this.formatUrlCell();
        break;
      /*
      case 'DROPDOWN':
        this.formatDropdownCell();
        break;
      case 'TEXTAREA':
        this.formatTextareaCell();
        break;*/
      default:
        this.formatDefaultCell();
    }
  }

  formatDropdownCell() {
    const selectedOptions = [];
    for(let index=0; index < this.cellValue.length; index++) {
      if(index >= this.maxAllowedChips) {
        selectedOptions.push(`+${(this.cellValue.length - this.maxAllowedChips)}`);
        break;
      }
      selectedOptions.push(this.cellValue[index].t || this.cellValue[index].c);
    }
    const chipListFactory = this.componentFactoryResolver.resolveComponentFactory(ChipListComponent);
    const chipListCR = this.viewContainerRef.createComponent(chipListFactory);
    selectedOptions.forEach(option => {
      const chipFactory = this.componentFactoryResolver.resolveComponentFactory(ChipComponent);
      const chipComponentRef = this.viewContainerRef.createComponent(chipFactory);
      chipComponentRef.instance.label = option;
      this.renderer.appendChild(this.elemRef.nativeElement, chipComponentRef.location.nativeElement);
    });
    this.renderer.appendChild(
      this.elemRef.nativeElement,
      chipListCR.location.nativeElement
    );
  }

  formatUrlCell() {
    const link = this.renderer.createElement('a');
    this.renderer.setAttribute(link, 'href', this.cellValue[0].c);
    this.renderer.setAttribute(link, 'target', '_blank');
    const text = this.renderer.createText(this.cellValue[0].t || this.cellValue[0].c);
    this.renderer.appendChild(link, text);
    this.renderer.addClass(link, 'info-link');

    this.renderer.appendChild(this.elemRef.nativeElement, link);
  }

  formatDateCell() {
    this.userService.getUserDetails().pipe(
      take(1)
    ).subscribe(userDetails => {
      const dateformat = userDetails.dateformat || this.DefaultDateFormat;
      const value = moment(+this.cellValue[0].c).format(dateformat);
      const div = this.renderer.createElement('div');
      const text = this.renderer.createText(value);
      this.renderer.appendChild(div, text);

      this.renderer.appendChild(this.elemRef.nativeElement, div);
    })
  }

  formatTextareaCell() {
    const div = this.renderer.createElement('div');
    this.renderer.addClass(div, 'textarea-cell');
    const text = this.renderer.createText(this.cellValue[0].t || this.cellValue[0].c);
    this.renderer.appendChild(div, text);
    this.renderer.appendChild(
      this.elemRef.nativeElement,
      div
    );
  }

  formatDefaultCell() {
    let dropVal = this.cellValue.map(map => map.t).toString();
    dropVal = dropVal ?  dropVal :this.cellValue.map(map => map.c).toString();
    const value = dropVal ? dropVal : '';
    const div = this.renderer.createElement('div');
    const text = this.renderer.createText(value);
    this.renderer.appendChild(div, text);
    this.renderer.appendChild(this.elemRef.nativeElement, div);
  }

}
