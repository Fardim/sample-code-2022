import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { WidgetService } from '@services/widgets/widget.service';
import { ExportComponent } from './export.component';
import { of, throwError } from 'rxjs';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;
  let WidgetServiceSpy: WidgetService;
  // let router: Router;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportComponent ],
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;
    WidgetServiceSpy = fixture.debugElement.injector.get(WidgetService);
    // router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close(), should close the dialog', async(() => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  }));

  it('onConfirm(),should Confirm',async(()=>{
    component.reportNameCtrl.setValue('test');
    const fileName = encodeURIComponent(component.reportNameCtrl.value);
    spyOn(WidgetServiceSpy,'exportReport').withArgs('1234',fileName).and.returnValue(of({errorMsg:'Network error'}));
    component.data = { reportId:'1234', reportName:'Test report'};
    component.onConfirm();
    expect(component.errorMsg).toContain('Unable to complete export:');
  }))

  it('onConfirm(),should close when no error',async(()=>{
    component.reportNameCtrl.setValue('test');
    const fileName = encodeURIComponent(component.reportNameCtrl.value);
    spyOn(WidgetServiceSpy,'exportReport').withArgs('1234',fileName).and.returnValue(of({errorMsg:''}));
    component.data = { reportId:'1234', reportName:'test report'};
    component.onConfirm();
    expect(component.errorMsg).toBeUndefined();
    expect(mockDialogRef.close).toHaveBeenCalled();
  }))

  it('onConfirm(),should close when error thrown',async(()=>{
    component.reportNameCtrl.setValue('test');
    const fileName = encodeURIComponent(component.reportNameCtrl.value);
    spyOn(WidgetServiceSpy,'exportReport').withArgs('1234',fileName).and.returnValues(throwError('error'),throwError({error: {errorMsg :'error'}}),
    throwError({error: {error :'error thown'}}));
    component.data = { reportId:'1234', reportName: 'test report'};
    component.onConfirm();
    expect(component.errorMsg).toContain('Unable to complete export:');

    component.onConfirm();
    expect(component.errorMsg).toContain('error');

    component.onConfirm();
    expect(component.errorMsg).toContain('error thown');
  }))
});
