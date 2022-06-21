import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WidgetHtmlEditor } from '../../../_models/widget';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';

@Component({
  selector: 'pros-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.scss']
})
export class HtmlEditorComponent  extends GenericWidgetComponent implements OnChanges {

  widgetHtml : WidgetHtmlEditor;
  headerDesc='';
  htmltext = '';

  /**
   * Get config height
   */
  @Input()
  height: number;

  constructor(public widgetService : WidgetService) {
    super();
   }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.widgetInfo && changes.widgetInfo.currentValue !== changes.widgetInfo.previousValue) {
      this.htmltext = this.widgetInfo ? this.widgetInfo.htmlText : null;
      this.headerDesc = this.widgetInfo ? this.widgetInfo.widgetTitle : null;
    }
  }



  // getHtmlEditMetadata():void{
  //   this.widgetService.getHTMLMetadata(this.widgetId).subscribe(data=>{
  //     console.log(data);
  //     this.widgetHtml = data;
  //     this.htmltext = this.widgetHtml.htmlText;
  //   });
  // }

  // public getHeaderMetaData():void{
  //   this.widgetService.getHeaderMetaData(this.widgetId).subscribe(returnData=>{
  //     this.headerDesc = returnData.widgetName;
  //   });
  // }

  emitEvtClick(): void {
    throw new Error('Method not implemented.');
   }
  emitEvtFilterCriteria(): void {
    throw new Error('Method not implemented.');
  }

}