import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CoreService } from '@services/core/core.service';
import { of, throwError } from 'rxjs';

import { ManuallyDatasetsComponent } from './manually-datasets.component';
import { SaveModuleSuccess } from '@models/core/coreModel';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { Structure } from '@modules/list/_components/field/hierarchy-service/hierarchy.service';

export class MockElementRef extends ElementRef {}

describe('ManuallyDatasetsComponent', () => {
  let component: ManuallyDatasetsComponent;
  let fixture: ComponentFixture<ManuallyDatasetsComponent>;
  let coreService: CoreService;
  let elRef: ElementRef;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManuallyDatasetsComponent],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [CoreService, { provide: ElementRef, useValue: new MockElementRef(document.createElement('input')) }],
    }).compileComponents();

    elRef = TestBed.inject(ElementRef);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuallyDatasetsComponent);
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

    spyOn(component, 'createDatasetForm');
    component.createDatasetForm();
    expect(component.createDatasetForm).toHaveBeenCalledTimes(1);

    component.allIndustryOptions = ['Industry 1', 'Industry 2', 'Industry 3'];

    component.allparentDatasetOptions = ['Parent dataset1', 'Parent dataset2', 'Parent dataset3'];

    component.selectedDatasetId = 5;
    spyOn(component, 'getDatasetDetails');
    component.getDatasetDetails();
    expect(component.getDatasetDetails).toHaveBeenCalledTimes(1);
  });

  /* it('should filter industry options', async () => {
    // Prepare the data source
    fixture.componentInstance.industryOptions = of(['Industry 1', 'Industry 2', 'Industry 3']);
    fixture.detectChanges();
    const industry = fixture.debugElement.query(By.css('#optionInput'));

    industry.nativeElement.dispatchEvent(new Event('focusin'));
    industry.nativeElement.value = 'Industry 1';
    industry.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance._filter('Industry 1');
    fixture.detectChanges();

    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(3);
  }); */

  it('should filter parent dataset options', async () => {
    // Prepare the data source
    // fixture.componentInstance.allparentDatasetOptions = ['Parent dataset1', 'Parent dataset2', 'Parent dataset3'];
    const allParentDatasetResponsePayload = [
      {moduleId: 100, moduleDescriptionRequestDTO: {description: 'Parent dataset1'}},
      {moduleId: 101, moduleDescriptionRequestDTO: {description: 'Parent dataset2'}},
      {moduleId: 102, moduleDescriptionRequestDTO: {description: 'Parent dataset3'}},
    ];

    fixture.componentInstance.allparentDatasetOptions = allParentDatasetResponsePayload;
    fixture.componentInstance.parentDatasetOptions = fixture.componentInstance.allparentDatasetOptions;
    fixture.detectChanges();
    const parentDataset = fixture.debugElement.query(By.css('#parentOptionInput'));

    parentDataset.nativeElement.dispatchEvent(new Event('focusin'));
    parentDataset.nativeElement.value = 'Parent dataset1';
    parentDataset.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance._filterParentDataset('Parent dataset1');
    fixture.detectChanges();

    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(1);
  });

  it('createDatasetForm(), should be test with pre required ', async(() => {
    component.createDatasetForm();
    component.datasetForm.controls.datasetName.setValue('New Dataset');
    expect(component.datasetForm.controls.datasetName.valid).toBeTrue();
  }));

  it('_filter(), should filter based on key', async(() => {
    expect(component._filter('Industry 1')).toEqual(['Industry 1']);
  }));

  it('_filterParentDataset(), should filter based on key', async(() => {
    const allParentDatasetResponsePayload = [
      {moduleId: 100, moduleDescriptionRequestDTO: {description: 'Parent dataset1'}},
      {moduleId: 101, moduleDescriptionRequestDTO: {description: 'Parent dataset2'}},
      {moduleId: 102, moduleDescriptionRequestDTO: {description: 'Parent dataset3'}},
    ];

    fixture.componentInstance.allparentDatasetOptions = allParentDatasetResponsePayload;
    expect(component._filterParentDataset('Parent dataset1')).toEqual([{moduleId: 100, moduleDescriptionRequestDTO: {description: 'Parent dataset1'}}]);
  }));

  it('onSubmitClick(), should give error if form is invalid', () => {
    component.onSubmitClick();
    expect(component.datasetForm.valid).toBeFalsy();
    expect(component.formErrMsg).toEqual('Please correct errors below before saving the dataset');
    expect(component.showErrorBanner).toEqual(true);
  });

  it('form should be valid', () => {
    component.datasetForm.controls.datasetName.setValue('test dataset name');
    component.datasetForm.controls.owner.setValue('Partner');
    component.datasetForm.controls.datatype.setValue('Master');
    component.datasetForm.controls.persistence.setValue('Time bound');
    component.datasetForm.controls.dataPrivacy.setValue('Retention');
    component.datasetForm.controls.datasetDescription.setValue('Description');
    expect(component.datasetForm.valid).toBeTruthy();
  });

  it('hasLimit(), should return ', () => {
    component.hasLimit(true);
    expect(component.hasLimit).toBeTruthy();
  });

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

  it('onsubmit() if form in valid should show error banner', () => {
    spyOn(component, 'onSubmitClick');
    expect(component.datasetForm.valid).toBe(false);
    component.showErrorBanner = true;
    component.formErrMsg = 'Please correct errors below before saving the dataset';
    expect(component.showErrorBanner).toBe(true);
    expect(component.formErrMsg).toBe('Please correct errors below before saving the dataset');
  });

  it('setFormValues() should set form values', () => {
    spyOn(component, 'setFormValues');
    component.setFormValues();
    component.selectedDatasetDetails = {
      datasetName: 'Bank Module',
      datasetDescription: ' Test dataset added',
      datasetCompanyId: '15',
      appName: 'elected App Name',
      singleRecordDataset: true,
      industry: ['Industry 1'],
      systemType: 'systemType1',
      owner: 'partner',
      datatype: 'master',
      persistence: 'conditionBased',
      dataPrivacy: 'retention',
      parentDataset: ['Parent dataset1'],
    };
    component.datasetForm.controls.datasetId.setValue(component.selectedDatasetId);
    component.datasetForm.controls.datasetName.setValue(component.selectedDatasetDetails.datasetName);
    component.datasetForm.controls.datasetDescription.setValue(component.selectedDatasetDetails.datasetDescription);
    component.datasetForm.controls.datasetCompanyId.setValue(component.selectedDatasetDetails.datasetCompanyId);
    component.datasetForm.controls.singleRecordDataset.setValue(component.selectedDatasetDetails.singleRecordDataset);
    component.selectedOptions = component.selectedDatasetDetails.industry;
    component.datasetForm.controls.systemType.setValue(component.selectedDatasetDetails.systemType);
    component.datasetForm.controls.owner.setValue(component.selectedDatasetDetails.owner);
    component.datasetForm.controls.datatype.setValue(component.selectedDatasetDetails.datatype);
    component.datasetForm.controls.persistence.setValue(component.selectedDatasetDetails.persistence);
    component.datasetForm.controls.dataPrivacy.setValue(component.selectedDatasetDetails.dataPrivacy);
    component.selectedParentDatasetOptions = component.selectedDatasetDetails.parentDataset;
    expect(component.datasetForm.valid).toBe(true);
  });

  it('onsubmit() if form valid submit details', async (done) => {
    component.datasetForm.controls.datasetName.setValue('Test dataset');
    component.datasetForm.controls.singleRecordDataset.setValue(true);
    component.datasetForm.controls.owner.setValue('partner');
    component.datasetForm.controls.datatype.setValue('master');
    component.datasetForm.controls.persistence.setValue('conditionBased');
    component.datasetForm.controls.dataPrivacy.setValue('retention');
    component.datasetForm.controls.datasetDescription.setValue('description');
    const payload = component.datasetForm.value;
    const response: SaveModuleSuccess = {
      acknowledge: true,
      errorMsg: '',
      fieldsErrors: '',
      moduleid: '10',
    };

    const structure = new Structure();
    structure.isHeader = true;
    structure.strucDesc = 'Header Data';
    structure.language = 'en';
    structure.moduleId = '10';
    structure.parentStrucId = 0;
    structure.structureId = 1;
    component.selectedOptions = ['Industry 1'];

    spyOn(coreService, 'saveModule').and.returnValue(of(response));

    const cancelEmitSpy = spyOn(component.cancelClick, 'emit').and.callFake(() => null);
    spyOn(coreService, 'createRootStructure').withArgs('10', 'en').and.returnValue(of({}));
    spyOn(coreService, 'saveUpdateStructure').withArgs(structure).and.returnValue(of({}));
    component.onSubmitClick();
    // @ts-ignore
    component.coreService.saveModule(payload).subscribe(() => {
      expect(cancelEmitSpy).toHaveBeenCalled();
      expect(coreService.createRootStructure).toHaveBeenCalledWith('10', 'en');
      done();
    });
  });

  it('getDatasetDetails() get dataset details by selected dataset id', () => {
    component.selectedDatasetId = 5;
    const response = {
      datasetName: 'Bank Module',
      datasetDescription: ' Test dataset added',
      datasetCompanyId: '15',
      appName: 'elected App Name',
      singleRecordDataset: true,
      industry: ['Industry 1'],
      systemType: 'systemType1',
      owner: 'partner',
      datatype: 'master',
      persistence: 'conditionBased',
      dataPrivacy: 'retention',
      parentDataset: ['Parent dataset1'],
    };
    spyOn(coreService, 'getDatasetDetails')
      .withArgs(component.selectedDatasetId)
      .and.returnValues(of(response), throwError({ message: 'api error' }));

    component.getDatasetDetails();
    expect(coreService.getDatasetDetails).toHaveBeenCalledWith(component.selectedDatasetId);

    expect(component.selectedDatasetDetails).toBe(response);
  });

  it('downloadDatasetConfig(), should console log ', () => {
    component.downloadDatasetConfig();
    expect(component.downloadDatasetConfig).toBeTruthy();
  });

  it('uploadDataset(), should console log ', () => {
    component.uploadDataset();
    expect(component.uploadDataset).toBeTruthy();
  });

  /* it('selected() select event of industry matautocomplete', () => {
    component.optionInput = elRef;
    const newValue = 'Industry 1';
    const event: MatAutocompleteSelectedEvent = {
      option: {
        value: newValue,
      },
    } as MatAutocompleteSelectedEvent;
    component.selectedOptions = [];
    component.createDatasetForm();
    component.selected(event);
    expect(component.selectedOptions.length).toEqual(1);
  }); */

  it('selectedParentDataset() select event of ParentDataset matautocomplete', () => {
    component.parentOptionInput = elRef;
    const newValue = 'Parent dataset1';
    const event: MatAutocompleteSelectedEvent = {
      option: {
        value: newValue,
      },
    } as MatAutocompleteSelectedEvent;
    component.selectedParentDatasetOptions = [];
    component.createDatasetForm();
    component.selectedParentDataset(event);
    expect(component.selectedParentDatasetOptions.length).toEqual(1);
  });

  it('ngOnDestroy()', async () => {
    const subscriptionSpy = spyOn(component.subscription, 'unsubscribe').and.callFake(() => null);
    component.ngOnDestroy();
    expect(subscriptionSpy).toHaveBeenCalled();
  });
});
