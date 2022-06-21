import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageComponent } from './image.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WidgetHeader, WidgetImageModel } from '../../../_models/widget';
import { WidgetService } from '@services/widgets/widget.service';
import { of } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;
  let htmlnative: HTMLElement;
  let widgetServiceSpy : WidgetService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageComponent ],
      imports:[AppMaterialModuleForSpec,HttpClientTestingModule, SharedModule],
      providers: [ WidgetService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    htmlnative = fixture.nativeElement;
    widgetServiceSpy = fixture.debugElement.injector.get(WidgetService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('img tag , should create', async(()=>{
    const widget = new WidgetImageModel();
    widget.imageUrl = 'https://www.rawpixel.com/image/535216/red-coming-soon-neon-icon-vector';
    widget.imageName = 'Coming soon..';

    component.widgetImage = widget;
    fixture.detectChanges();
    expect(htmlnative.getElementsByClassName('img-content').length).toEqual(1, 'Img tag should be create');
    // expect((htmlnative.getElementsByClassName('img-content').item(0) as HTMLDivElement).style.background).toContain(widget.imageUrl, `Img src should be equal to ${widget.imageUrl}`);

    widget.imagesno = '61254675245';
    widget.imageUrl = '';
    widget.imageName = 'Coming_Mdo_img..';
    component.widgetImage = widget;
    // const mockUrl =`/MDOSF/dashBoardPanelIcons/${widget.imageName}/?iconSno=${widget.imagesno}`;
    fixture.detectChanges();
    expect(htmlnative.getElementsByClassName('img-content').length).toEqual(1, 'Img tag should be create');
    // expect((htmlnative.getElementsByClassName('img-content').item(0) as HTMLDivElement).style.background).toContain(mockUrl, `Img src should be containt equal to ${mockUrl}`);
  }));

  it('getImageMetadata(), should return image meta data', async(() => {
    const res = {widgetId:76556454} as WidgetImageModel;
    component.widgetId = 76556454;
    spyOn(widgetServiceSpy,'getimageMetadata').withArgs(component.widgetId).and.returnValue(of(res));
    component.getImageMetadata();
    expect(widgetServiceSpy.getimageMetadata).toHaveBeenCalledWith(component.widgetId);
  }));

  it('getHeaderMetaData(), should return header meta data', async(() => {
    const res = {widgetId:87876765} as WidgetHeader;
    component.widgetId = 87876765;
    spyOn(widgetServiceSpy,'getHeaderMetaData').withArgs(component.widgetId).and.returnValue(of(res));
    component.getHeaderMetaData();
    expect(widgetServiceSpy.getHeaderMetaData).toHaveBeenCalledWith(component.widgetId);
  }));
});
