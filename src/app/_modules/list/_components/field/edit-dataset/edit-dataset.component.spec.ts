import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';

import { EditDatasetComponent } from './edit-dataset.component';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

export class MockElementRef extends ElementRef {}

describe('EditDatasetComponent', () => {
  let component: EditDatasetComponent;
  let fixture: ComponentFixture<EditDatasetComponent>;
  let router: Router;
  let coreService: CoreService;
  let elRef: ElementRef;

  /* const mockObject = {
    objectid: 187,
    moduleid: 187,
    objectdesc: 'A1 description',
    objectInfo: 'A1 description',
    description: 'A1 description',
    information: {
      en: 'A1 description',
    },
  }; */

  const mockObject = {
    moduleDescriptionMap: {
      en: [{
        description: 'A12',
        information: 'A1000'
      }]
    },
    usermodified: '',
    displayCriteria: 25,
    industry: '',
    isSingleRecord: true,
    systemType: 'SYSTEM_TYPE_1',
    owner: 1,
    dataType: 1,
    persistent: 1,
    dataPrivacy: 1,
    parentModuleIds: [187],
    tenantId: '0',
    dateModified: 1638034543004,
    type: 'STD'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditDatasetComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule,
        ReactiveFormsModule, FormsModule, MatAutocompleteModule],
        providers: [{ provide: ElementRef, useValue: new MockElementRef(document.createElement('input')) }]
    }).compileComponents();

    elRef = TestBed.inject(ElementRef);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDatasetComponent);
    component = fixture.componentInstance;
    component.datasetformGroup = new FormGroup({
      objectName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      objectDesc: new FormControl('', [Validators.maxLength(50)]),
      objectParentDataset: new FormControl([]),
      objectDisplayCriteria: new FormControl(''),
      objectSystemType: new FormControl(''),
      objectusermodified: new FormControl(''),
      objectDataPrivacy: new FormControl(0),
      objectDataType: new FormControl(0),
      objectType: new FormControl(''),
      objectFields: new FormControl([]),
      objectIndustry: new FormControl(''),
      objectIsSingleRecord: new FormControl(true),
      objectOwner: new FormControl(0),
      objectPersistent: new FormControl(0),

    });
    fixture.detectChanges();
    coreService = fixture.debugElement.injector.get(CoreService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should called getObjectTypeDetails', () => {
    component.locale = 'en-US';
    spyOn(component, 'getObjectTypeDetails');
    component.ngOnInit();
    expect(component.locale).toEqual('en');
    expect(component.getObjectTypeDetails).toHaveBeenCalled();
  });

  it('getObjectTypeDetails(), should get dataset details based on module id', async () => {
    component.moduleId = '327'; // component.moduleId = '187';
    component.locale = 'en';
    spyOn(component,'createDatasetFormGroup');
    // spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject), throwError({ message: 'api error' }));
    spyOn(coreService, 'getEditObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject), throwError({ message: 'api error' }));
    fixture.detectChanges();

    component.getObjectTypeDetails();
    /* expect(component.objectType.objectid).toEqual(mockObject.moduleid);
    expect(component.objectType.objectdesc).toEqual(mockObject.description);
    expect(component.objectType.objectInfo).toEqual(mockObject.information.en);
    expect(coreService.getObjectTypeDetails).toHaveBeenCalledWith(component.moduleId, component.locale); */
    expect(component.objectType.objectInfo).toEqual(mockObject.moduleDescriptionMap.en[0].information);
    expect(component.objectType.objectdesc).toEqual(mockObject.moduleDescriptionMap.en[0].description);
    expect(component.objectType.parentDatasets).toEqual(mockObject.parentModuleIds);
    expect(component.objectType.displayCriteria).toEqual(mockObject.displayCriteria);
    expect(component.objectType.systemType).toEqual(mockObject.systemType);
    expect(component.objectType.usermodified).toEqual(mockObject.usermodified);
    expect(component.objectType.dataPrivacy).toEqual(mockObject.dataPrivacy);
    expect(component.objectType.dataType).toEqual(mockObject.dataType);
    expect(component.objectType.type).toEqual(mockObject.type);
    expect(component.objectType.industrty).toEqual(mockObject.industry);
    expect(component.objectType.isSingleRecord).toEqual(mockObject.isSingleRecord);
    expect(component.objectType.owner).toEqual(mockObject.owner);
    expect(component.objectType.persistent).toEqual(mockObject.persistent);

    expect(coreService.getEditObjectTypeDetails).toHaveBeenCalledWith(component.moduleId);
    expect(component.createDatasetFormGroup).toHaveBeenCalledWith(component.objectType);
  });

  it('close()', () => {
    component.moduleId = '327'; // component.moduleId = '187';
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([`/home/list/fields/${component.moduleId}`]);
  });

  it('createDatasetFormGroup() with data', () => {
    const mockData = {
      objectInfo: 'A111',
      objectdesc: 'A111',
      objectid: 235
    }

    component.createDatasetFormGroup(mockData);
    expect(component.datasetformGroup).toBeTruthy();

    component.createDatasetFormGroup(null);
    expect(component.datasetformGroup).toBeTruthy();
  });

  it('should filter parent dataset options', async () => {
    const mockData = {
      objectInfo: 'A111',
      objectdesc: 'A111',
      objectid: 235
    }

    component.createDatasetFormGroup(mockData);
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
    component.datasetformGroup.patchValue({
      objectParentDataset: 'Parent dataset1'
    })
    // fixture.componentInstance._filterParentDataset('Parent dataset1');
    fixture.detectChanges();

    const matOptions = document.querySelectorAll('mat-option');
    expect(matOptions.length).toBe(1);
  });

  it('_filterParentDataset(), should filter based on key', async(() => {
    const allParentDatasetResponsePayload = [
      {moduleId: 100, moduleDescriptionRequestDTO: {description: 'Parent dataset1'}},
      {moduleId: 101, moduleDescriptionRequestDTO: {description: 'Parent dataset2'}},
      {moduleId: 102, moduleDescriptionRequestDTO: {description: 'Parent dataset3'}},
    ];

    fixture.componentInstance.allparentDatasetOptions = allParentDatasetResponsePayload;
    expect(component._filterParentDataset('Parent dataset1')).toEqual([{moduleId: 100, moduleDescriptionRequestDTO: {description: 'Parent dataset1'}}]);
  }));

  it('selectedParentDataset() select event of ParentDataset matautocomplete', () => {
    component.parentOptionInput = elRef;
    const newValue = 'Parent dataset1';
    const event: MatAutocompleteSelectedEvent = {
      option: {
        value: newValue,
      },
    } as MatAutocompleteSelectedEvent;
    component.selectedParentDatasetOptions = [];
    component.selectedParentDataset(event);
    expect(component.selectedParentDatasetOptions.length).toEqual(1);
  });

  it('updateDatasetValue(), should update dataset value', () => {
    component.datasetformGroup.controls.objectDesc.setValue('A12');
    component.datasetformGroup.controls.objectName.setValue('A1000');
    component.selectedParentDatasetOptions = [{moduleId: 187, description: 'A1 Description'}];
    component.datasetformGroup.controls.objectDisplayCriteria.setValue(25);
    component.datasetformGroup.controls.objectSystemType.setValue('SYSTEM_TYPE_1');
    component.datasetformGroup.controls.objectusermodified.setValue('');
    component.datasetformGroup.controls.objectDataPrivacy.setValue(1);
    component.datasetformGroup.controls.objectDataType.setValue(1);
    component.datasetformGroup.controls.objectType.setValue('STD');
    component.datasetformGroup.controls.objectFields.setValue([]);
    component.datasetformGroup.controls.objectIndustry.setValue('');
    component.datasetformGroup.controls.objectIsSingleRecord.setValue(true);
    component.datasetformGroup.controls.objectOwner.setValue(1);
    component.datasetformGroup.controls.objectPersistent.setValue(1);

    component.locale = 'en';
    component.moduleId = '327'; // component.moduleId = '235';

    spyOn(coreService, 'nextUpdateDataSetInfoSubject');
    /* spyOn(coreService, 'updateDatasetInfo').and.returnValue(of({ acknowledge: true, moduleid: 235 })); */
    spyOn(coreService, 'updateDatasetInfo').and.returnValue(of({ acknowledge: true, moduleid: 327 }));

    component.updateDatasetValue();
    const reqPayload = {
      moduledescription: {
        [component.locale]: {
          information: component.datasetformGroup.value.objectName,
          description: component.datasetformGroup.value.objectDesc,
        },
      },

      parentModuleIds: component.parentDatasetModuleIds,
      displayCriteria: component.datasetformGroup.value.objectDisplayCriteria,
      systemType: component.datasetformGroup.value.objectSystemType,
      usermodified: component.datasetformGroup.value.objectusermodified,
      dataPrivacy: component.datasetformGroup.value.objectDataPrivacy,
      dataType: component.datasetformGroup.value.objectDataType,
      type: component.datasetformGroup.value.objectType,
      fields: component.datasetformGroup.value.objectFields,
      industry: component.datasetformGroup.value.objectIndustry,
      isSingleRecord: component.datasetformGroup.value.objectIsSingleRecord,
      owner: component.datasetformGroup.value.objectOwner,
      persistent: component.datasetformGroup.value.objectPersistent
    };

    /* expect(reqPayload).toEqual({
      en: {
        description: 'A111',
        information: 'A111',
      },
    }); */

    expect(coreService.nextUpdateDataSetInfoSubject).toHaveBeenCalledWith({ objectId: '327', objectName: 'A1000', objectdesc: 'A12', objectParentModuleIds: [187] });
    expect(coreService.updateDatasetInfo).toHaveBeenCalledWith(component.moduleId, reqPayload);
  });

  it('ngOnDestroy(), should unsubscribe from all observable', async(() => {
    const sub = of({}).subscribe()
    component.subscriptionsList.push(sub)
    spyOn(component.subscriptionsList[0], 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscriptionsList[0].unsubscribe).toHaveBeenCalled();
  }));
});
