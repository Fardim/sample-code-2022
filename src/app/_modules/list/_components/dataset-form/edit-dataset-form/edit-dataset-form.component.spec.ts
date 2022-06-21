import { DatasetFormCreateResponse, DatasetFormCreateDto, TabFieldsResponse, TabField, UnassignedFieldsResponse } from './../../../../../_models/list-page/listpage';
import { of, throwError } from 'rxjs';
import { CoreService } from '@services/core/core.service';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';

import { EditDatasetFormComponent } from './edit-dataset-form.component';
import { TransientService } from 'mdo-ui-library';

describe('EditDatasetFormComponent', () => {
  let component: EditDatasetFormComponent;
  let fixture: ComponentFixture<EditDatasetFormComponent>;
  let router: Router;
  const queryParams = { t: '2' };
  const routeParams = { moduleId: '1005', formId: '1' };
  const panel = 'property-panel';
  let coreService: CoreService;
  let transientService: TransientService;
  const mockTabFieldsResponse: TabFieldsResponse[] = [
    {
      tabUuid: '2dd8b1eb-1db4-4870-b518-df83a00ba52c',
      description: 'tab',
      fields: [
        {
          fieldId: 'FLD_P275317198',
          fieldDescription: 'ParentDev',
          type: 'FIELD'
        } as TabField
      ],
    },
  ];
  const mockTabFields: UnassignedFieldsResponse[] = [
    {
      hierarchyId: '2dd8b1eb-1db4-4870-b518-df83a00ba52c',
      hierarchyDesc: 'hierarchy 1',
      fields: [{
        fieldId: 'FLD_P275317198',
        fieldDescription: 'ParentDev',
        type: 'FIELD'
      } as TabField]
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDatasetFormComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDatasetFormComponent);
    component = fixture.componentInstance;

    coreService = fixture.debugElement.injector.get(CoreService);
    router = TestBed.inject(Router);
    transientService = fixture.debugElement.injector.get(TransientService);
  });

  it('should create', () => {
    spyOn(coreService, 'searchTabFields').and.returnValues(of(mockTabFieldsResponse), of(mockTabFieldsResponse));
    spyOn(coreService, 'searchUnassignedTabFields').and.returnValues(of(mockTabFields), of(mockTabFields));
    spyOn(coreService, 'getDatasetFormTabsDetails').and.returnValues(of([]), of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('formTypeSelected(type: { id: string; name: string })', async(() => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/list/dataset-settings/${component.moduleId}/forms/${component.moduleId}` } }]);
  }));

  it('save()', async(() => {
    spyOn(coreService, 'searchTabFields').and.returnValues(of(mockTabFieldsResponse), of(mockTabFieldsResponse));
    spyOn(coreService, 'searchUnassignedTabFields').and.returnValues(of(mockTabFields), of(mockTabFields));
    spyOn(coreService, 'getDatasetFormTabsDetails').and.returnValues(of([]), of([]));
    spyOn(coreService, 'saveDatasetFormTabsDetails').and.returnValues(of([]), of([]));
    spyOn(router, 'navigate');
    spyOn(component, 'close');
    spyOn(transientService, 'open');
    const response: DatasetFormCreateResponse = {
      acknowledge: true,
      errorMsg: null,
      layoutId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      successMsg: 'success',
    };
    spyOn(coreService, 'createDatasetForm').and.returnValues(of(response));
    spyOn(coreService, 'updateDatasetForm').and.returnValues(of(response));
    const formvalue: DatasetFormCreateDto = {
      description: 'string',
      helpText: 'string',
      labels: 'string',
      type: 'string',
      usage: 'string'
    };

    fixture.detectChanges();
    coreService.nextUpdateDatasetFormSubject({formId: 'new', form: formvalue, isValid: true});
    component.save();
    expect(coreService.saveDatasetFormTabsDetails)
      .toHaveBeenCalledWith(component.formTabs, component.moduleId, response.layoutId, component.locale);
    
    coreService.nextUpdateDatasetFormSubject({formId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', form: formvalue, isValid: true});
    component.save();
    expect(coreService.updateDatasetForm).toHaveBeenCalled();
  }));

  it('searchFieldSub next', fakeAsync(() => {
    spyOn(coreService, 'searchTabFields').and.returnValues(of(mockTabFieldsResponse), of(mockTabFieldsResponse), of(mockTabFieldsResponse));
    spyOn(coreService, 'searchUnassignedTabFields').and.returnValues(of(mockTabFields), of(mockTabFields), of(mockTabFields));

    spyOn(component, 'searchTabFields');
    spyOn(component, 'searchUnassignedTabFields');
    spyOn(component, 'getFormTabsDetails');
    component.ngOnInit();

    expect(component.getFormTabsDetails).toHaveBeenCalled();

    component.searchFieldSub.next('material');
    tick(1000);
    expect(component.searchTabFields).toHaveBeenCalled();
    expect(component.searchUnassignedTabFields).toHaveBeenCalled();
  }));

  it('updateFormTabName() update secton name', () => {
    const mockdata = {
      tabText:'Test data',
    }
    component.updateFormTabName(mockdata, 'New value');
    expect(mockdata.tabText).toEqual('New value');
  });

  it('getDatasetFormTabsDetails', async(() => {
    spyOn(coreService, 'getDatasetFormTabsDetails').and.returnValues(of([]), throwError({message: 'api error'}));

    component.moduleId = '1005';
    component.formId = '1701';
    component.locale = 'en';
    component.getFormTabsDetails();
    expect(coreService.getDatasetFormTabsDetails).toHaveBeenCalledWith(component.moduleId, component.formId, component.locale);

    spyOn(console, 'error');
    component.getFormTabsDetails();
    expect(console.error).toHaveBeenCalled();
  }));

});
