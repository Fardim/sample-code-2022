import { Component, OnInit, Input, EventEmitter, Output, Inject, OnDestroy } from '@angular/core';
import { WidgetColorPalette, AssginedColor } from '@modules/report/_models/widget';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WidgetService } from '@services/widgets/widget.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-widget-color-palette',
  templateUrl: './widget-color-palette.component.html',
  styleUrls: ['./widget-color-palette.component.scss']
})
export class WidgetColorPaletteComponent implements OnInit, OnDestroy {

  /**
   * Preloaded widget info & color palette
   */
  @Input()
  widgetColorPalette: WidgetColorPalette;

  /**
   * After value change should emit
   */
  @Output()
  evtColorChange: EventEmitter<WidgetColorPalette> = new EventEmitter<WidgetColorPalette>();

  subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<WidgetColorPaletteComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: any,
    private widgetService: WidgetService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    if(this.dialogData) {
      this.widgetColorPalette = this.dialogData.widgetColorPalette;
    }
  }

  /**
   * Close picker palette after saved successfully ..
   * @param ignore if true means don't update widget otherwise update widget
   */
  close(ignore?:boolean) {
    if(ignore) {
      this.dialogRef.close(null);
    } else {
      this.dialogRef.close(this.widgetColorPalette);
    }
  }

  /**
   * Update color code
   * @param color updateable color
   * @param newColorCode after color change should call with new color
   * @param index updateable index
   */
  updateColorCode(color: AssginedColor, newColorCode: string, index: number) {
    if(this.widgetColorPalette.colorPalettes && this.widgetColorPalette.colorPalettes.length) {
      this.widgetColorPalette.colorPalettes[index].colorCode = newColorCode;
    }
  }

  /**
   * Call service for update or define color palette for widgets ..
   */
  updateColorPalette() {
    const sub = this.widgetService.defineWidgetColorPalette(this.widgetColorPalette).subscribe(res=>{
      if(res) {
        this.widgetColorPalette = res;
        this.matSnackBar.open(`Successfully updated `, 'Close', { duration: 5000 });
        this.close();
      }
    },error=>{
      console.error('Error {}', error.message);
      this.matSnackBar.open(`Something went wrong`, 'Close', { duration: 5000 });
    });
    this.subscriptions.push(sub);
  }

}
