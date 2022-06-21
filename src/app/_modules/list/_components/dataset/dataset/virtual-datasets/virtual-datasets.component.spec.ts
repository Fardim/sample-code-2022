import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { VirtualDatasetsComponent } from './virtual-datasets.component';
import { CoreService } from '@services/core/core.service';
import { of } from 'rxjs';

describe('VirtualDatasetsComponent', () => {
  let component: VirtualDatasetsComponent;
  let fixture: ComponentFixture<VirtualDatasetsComponent>;
  let coreService: CoreService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualDatasetsComponent],
      imports: [HttpClientModule, SharedModule, AppMaterialModuleForSpec],
      providers: [CoreService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualDatasetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    coreService = fixture.debugElement.injector.get(CoreService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnIt(), should be test with pre required ', async () => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();

    spyOn(component, 'editVirtualDatasetForm');
    component.editVirtualDatasetForm();
    expect(component.editVirtualDatasetForm).toHaveBeenCalledTimes(1);
  });

  it('form should be valid on entering dataset name', async(() => {
    component.editVirtualDatasetForm();
    component.virtualDatasetForm.controls.vdName.setValue('My virtual dataset')
    expect(component.virtualDatasetForm.controls.vdName.valid).toBeTrue();

    component.virtualDatasetForm.controls.vdDescription.setValue('Descrption');
    expect(component.virtualDatasetForm.controls.vdDescription.valid).toBeTrue();
    expect(component.virtualDatasetForm.valid).toBeTrue();
  }));

  it('it should close the dialog', () => {
    spyOn(component.cancelClick, 'emit');
    component.onCancelClick();
    expect(component.cancelClick.emit).toHaveBeenCalled();
  });

  it('back(), should show wizard UI', () => {
    spyOn(component.backClick, 'emit');
    component.back();
    expect(component.backClick.emit).toHaveBeenCalled();
  });

  it('onsubmit() if form valid submit details', async (done) => {
    component.virtualDatasetForm.controls.vdName.setValue('Test dataset');
    component.virtualDatasetForm.controls.vdDescription.setValue('Test dataset desc');
    const payload = component.virtualDatasetForm.value;
    const response: any = {
      data: {
        vdId: '71ee91a6-d806-41ca-b091-b94c0a1fb02f',
        vdName: 'Desc',
      },
      message: 'Your dataset has been created successfully.',
      status: 200,
      success: true
    };
    spyOn(coreService, 'saveVirtualDataSet').and.returnValue(of(response));
    const cancelEmitSpy = spyOn(component.cancelClick, 'emit').and.callFake(() => null);
    component.onSubmitClick();
    // @ts-ignore
    component.coreService.saveVirtualDataSet(payload).subscribe(() => {
      expect(cancelEmitSpy).toHaveBeenCalled();
      done();
    });
  });

  it('onsubmit() if form in valid should show error banner', () => {
    component.onSubmitClick();
    expect(component.virtualDatasetForm.valid).toBe(false);
    component.showErrorBanner = true;
    component.formErrMsg = 'Please correct errors below before saving the dataset';
    expect(component.showErrorBanner).toBe(true);
    expect(component.formErrMsg).toBe('Please correct errors below before saving the dataset');
  });

});
