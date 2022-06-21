import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DmsService } from '@services/dms/dms.service';
import { Subscription } from 'rxjs';
import { WidgetService } from 'src/app/_services/widgets/widget.service';
import { WidgetImageModel } from '../../../_models/widget';
import { GenericWidgetComponent } from '../../generic-widget/generic-widget.component';

@Component({
  selector: 'pros-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent extends GenericWidgetComponent implements OnChanges, OnDestroy {

  widgetImage : WidgetImageModel = new WidgetImageModel();
  imageSrc: string | ArrayBuffer;
  subscription: Subscription = new Subscription();

  constructor(public widgetService : WidgetService, private dmsService: DmsService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.widgetInfo && changes.widgetInfo.currentValue !== changes.widgetInfo.previousValue) {
      this.widgetImage.imagesno = this.widgetInfo ? this.widgetInfo.imagesno : null;
      this.widgetImage.imageUrl = this.widgetInfo ? this.widgetInfo.imageUrl : null;
      this.getImageData(this.widgetImage.imagesno);
    }
  }

  getImageData(imagesno: string) {
    if(imagesno) {
      const sub = this.dmsService.downloadFile(imagesno).subscribe((data)=> {
        if(data) {
          this.convertBlobToBase64(data);
        }
      });
      this.subscription.add(sub);
    }
  }

  convertBlobToBase64(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      this.imageSrc = base64data;
    }
  }

  // getImageMetadata():void{
  //   this.widgetService.getimageMetadata(this.widgetId).subscribe(data=>{
  //     this.widgetImage = data;
  //     this.widgetImage.imageName = encodeURIComponent(this.widgetImage.imageName);
  //   });
  // }

  emitEvtFilterCriteria(): void {
    throw new Error('Method not implemented.');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}