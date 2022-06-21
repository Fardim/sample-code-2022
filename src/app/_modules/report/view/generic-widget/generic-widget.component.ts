import { Input, EventEmitter, Output, Component, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Criteria } from '../../_models/widget';
import {WidgetColorPalette, ReportDashboardPermission, Widget } from '../../_models/widget';
import { MatDialog } from '@angular/material/dialog';
import { WidgetColorPaletteComponent } from '@modules/report/edit/widget-color-palette/widget-color-palette.component';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { TooltipDirective } from 'mdo-ui-library';

@Component({
  selector: 'pros-generic-widget',
  template: ''
})

export abstract class GenericWidgetComponent implements AfterViewInit {

  @Input()
  reportId: number;

  @Input()
  widgetId: number;

  @Input()
  filterCriteria: Criteria[];

  @Input()
  permissons: ReportDashboardPermission;

  /**
   * Hold current widget info.
   */
  @Input()
  widgetInfo: Widget;

  /**
   * Box size after window resize host listener
   */
  @Input()
  boxSize: number;

  @Output()
  evtFilterCriteria: EventEmitter<Criteria[]> = new EventEmitter<Criteria[]>();

  public afterColorDefined: BehaviorSubject<WidgetColorPalette> = new BehaviorSubject<WidgetColorPalette>(null);

  /**
   * Define colors for stacked ..
   */
  widgetColorPalette: WidgetColorPalette;

  @ViewChild('displayHeading') displayHeading: ElementRef<HTMLElement>;
  @ViewChild(TooltipDirective) tooltipDirective: TooltipDirective;

  constructor(
    public matDialog?: MatDialog
  ){}

  ngAfterViewInit(): void {
    if (this.displayHeading && this.displayHeading.nativeElement) {
      const checkExist = setInterval(() => {
        if (this.displayHeading.nativeElement && this.displayHeading.nativeElement.offsetWidth) {
           clearInterval(checkExist);
           this.showHeadingTooltip();
        }
     }, 100);
    }
  }

  /**
   * Emit filter criteria change
   */
  abstract emitEvtFilterCriteria(event: any): void;

  /**
   * Open the color palette for all widget dynamic
   */
  openColorPalette(req: WidgetColorPalette) {
    const dialogRef = this.matDialog.open(WidgetColorPaletteComponent, {
      height: '626px',
      width: '800px',
      disableClose: true,
      autoFocus: false,
      data:{
        widgetColorPalette: req
      }
    });
    if(dialogRef) {
      dialogRef.afterClosed().subscribe(result => {
        this.afterColorDefined.next(result);
      });
    }
  }

  getFields(fieldId, codeValue): string {
    let finalValue = '';
    switch(fieldId) {
      case 'TIME_TAKEN' :
        const days = moment.duration(Number(codeValue), 'milliseconds').days();
        const hours = moment.duration(Number(codeValue), 'milliseconds').hours();
        const minutes = moment.duration(Number(codeValue), 'milliseconds').minutes();
        const seconds = moment.duration(Number(codeValue), 'milliseconds').seconds();
        const timeString = `${days >0 ? days + ' d ': ''}${hours >0 ? hours + ' h ': ''}${minutes >0 ? minutes + ' m ': ''}${seconds >0 ? seconds + ' s': ''}`;
        finalValue = timeString ? timeString : '0 s';
        break;

      case 'FORWARDENABLED':
      case 'OVERDUE':
        if(codeValue === '1' || codeValue === 'y') {
          finalValue = 'Yes';
        }
        if(codeValue === '0' || codeValue === 'n') {
          finalValue = 'No';
        }
        break;

      default:
        if(codeValue === 'off') {
          finalValue = 'False'
        }
        if(codeValue === 'on') {
          finalValue = 'True'
        }
        break;
    }
    return finalValue;
  }

  /**
   * Show Tooltip for display heading when it is overflowing
   */
  @HostListener('window:resize', [])
  showHeadingTooltip() {
    if (this.displayHeading && this.tooltipDirective) {
      if (this.displayHeading?.nativeElement?.offsetWidth < this.displayHeading?.nativeElement?.scrollWidth) {
        this.tooltipDirective.disabled = false;
      } else {
        this.tooltipDirective.disabled = true;
      }
    }
  }

}
