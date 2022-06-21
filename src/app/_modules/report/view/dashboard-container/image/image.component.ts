import { Component, OnInit } from '@angular/core';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { WidgetImageModel } from '../../../_models/widget';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';

@Component({
  selector: 'pros-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent extends GenericWidgetComponent implements OnInit {

  widgetImage : WidgetImageModel;
  headerDesc='';


  constructor(public widgetService : WidgetService) {
    super();
  }

  ngOnInit(): void {
    this.getImageMetadata();
    this.getHeaderMetaData();
  }

  getImageMetadata():void{
    this.widgetService.getimageMetadata(this.widgetId).subscribe(data=>{
      this.widgetImage = data;
      this.widgetImage.imageName = encodeURIComponent(this.widgetImage.imageName);
    });
  }

  public getHeaderMetaData():void{
    this.widgetService.getHeaderMetaData(this.widgetId).subscribe(returnData=>{
      this.headerDesc = returnData.widgetName;
    });
  }

  emitEvtFilterCriteria(): void {
    throw new Error('Method not implemented.');
  }

}
