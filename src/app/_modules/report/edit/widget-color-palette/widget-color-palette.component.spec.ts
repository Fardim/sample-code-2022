import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetColorPaletteComponent } from './widget-color-palette.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WidgetService } from '@services/widgets/widget.service';
import { WidgetColorPalette } from '@modules/report/_models/widget';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';

describe('WidgetColorPaletteComponent', () => {
  let component: WidgetColorPaletteComponent;
  let fixture: ComponentFixture<WidgetColorPaletteComponent>;
  let widgetService: WidgetService;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockMatSnackBar = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetColorPaletteComponent ],
      imports:[ MdoUiLibraryModule,
        AppMaterialModuleForSpec, HttpClientTestingModule, SharedModule
      ],providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MatSnackBar,
          useValue: mockMatSnackBar
        }, {
          provide: MAT_DIALOG_DATA, useValue: {}
        },
        WidgetService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetColorPaletteComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    widgetService = fixture.debugElement.injector.get(WidgetService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), load prerequired things ', async(()=>{
    component.ngOnInit();
    expect(component.widgetColorPalette).toEqual(undefined);
  }));

  it('close(), should close dialog', async(()=>{
    component.close(true);
    expect(mockDialogRef.close).toHaveBeenCalled();
  }));

  it('updateColorCode(), update color code', async(()=>{
    const mockData = new WidgetColorPalette();
    mockData.colorPalettes = [{
      code: 'ZMRO',
      colorCode: '#ff1f1f1',
      text : 'ZMRO TEXT'
    }];
    component.widgetColorPalette = mockData;

    component.updateColorCode(null, '#d1d1d1', 0);

    expect(component.widgetColorPalette.colorPalettes[0].colorCode).toEqual('#d1d1d1');
  }));

  it('updateColorPalette(), update color palette ## call http for update ', async(()=>{
    const mockData = new WidgetColorPalette();
    mockData.widgetId = '7264263';
    mockData.colorPalettes = [{
      code: 'ZMRO',
      colorCode: '#ff1f1f1',
      text : 'ZMRO TEXT'
    }];
    component.widgetColorPalette = mockData;
    spyOn(widgetService,'defineWidgetColorPalette').withArgs(mockData).and.returnValue(of(mockData));

    component.updateColorPalette();

    expect(mockData.colorPalettes.length).toEqual(component.widgetColorPalette.colorPalettes.length);
    expect(widgetService.defineWidgetColorPalette).toHaveBeenCalledWith(mockData);
    expect(mockDialogRef.close).toHaveBeenCalled();
    expect(mockMatSnackBar.open).toHaveBeenCalled();

  }));
});
