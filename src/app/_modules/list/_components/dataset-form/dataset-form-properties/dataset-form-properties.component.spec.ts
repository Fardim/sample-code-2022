import { TagActionResponse } from './../../../../../_models/userdetails';
import { TransientService } from 'mdo-ui-library';
import { UserProfileService } from '@services/user/user-profile.service';
import { DatasetForm } from '@models/list-page/listpage';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetFormPropertiesComponent } from './dataset-form-properties.component';
import { TagsResponse } from '@models/userdetails';

describe('DatasetFormPropertiesComponent', () => {
  let component: DatasetFormPropertiesComponent;
  let fixture: ComponentFixture<DatasetFormPropertiesComponent>;
  let router: Router;
  const queryParams = { t: '2' };
  const routeParams = { moduleId: '1005', formId: '1' };
  const panel = 'property-panel';
  let coreService: CoreService;
  let userProfileService: UserProfileService;
  let toasterService: TransientService;
  const mockDatasetForm: DatasetForm = {
    dateCreated: 0,
    dateModified: 0,
    description: 'string',
    helpText: 'string',
    labels: 'string',
    layoutId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    type: 'string',
    usage: 'string',
    userCreated: 'string',
    userModified: 'string',
    descriptionGenerator:false
  };
  const response: TagsResponse = {
    username: 'initiator',
    tenantId: '0',
    tags: [
      {
        id: '761970969229124980',
        description: 'Material 10',
      },
      {
        id: '604350447228762398',
        description: 'Material 3',
      },
    ],
  };
  const emptyResponse: TagsResponse = {
    username: 'initiator',
    tenantId: '0' ,
    tags: [],
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DatasetFormPropertiesComponent],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetFormPropertiesComponent);
    component = fixture.componentInstance;

    coreService = fixture.debugElement.injector.get(CoreService);
    userProfileService = fixture.debugElement.injector.get(UserProfileService);
    toasterService = fixture.debugElement.injector.get(TransientService);
    router = TestBed.inject(Router);

  });

  it('should create', () => {
    spyOn(userProfileService, 'getAllTags').withArgs(0, 15).and.returnValues(of(response), of(response), of(response));
    spyOn(userProfileService, 'searchTags').withArgs(0, 15, 'Material').and.returnValues(of(emptyResponse), of(emptyResponse));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('getTags(), should get All tags', async(() => {
    spyOn(userProfileService, 'getAllTags').withArgs(0, 15).and.returnValues(of(response), of(response), of(response));
    spyOn(userProfileService, 'searchTags').withArgs(0, 15, 'Material').and.returnValues(of(emptyResponse), of(emptyResponse));
    // component.ngOnInit();
    // expect(userProfileService.getAllTags).toHaveBeenCalled();

    // expect(component.tags.length).toEqual(2);

    component.fieldsSearchString = 'Material';
    component.getTags();
    expect(userProfileService.searchTags).toHaveBeenCalled();
  }));


  it('optionCtrl valuechanges', async(() => {
    spyOn(component, 'getTags');
    spyOn(userProfileService, 'getAllTags').withArgs(0, 15).and.returnValues(of(response), of(response), of(response));
    spyOn(userProfileService, 'searchTags').withArgs(0, 15, 'Material').and.returnValues(of(emptyResponse), of(emptyResponse), of(emptyResponse));
    spyOn(coreService,'getDatasetFormDetail').and.returnValues(of(mockDatasetForm));
    fixture.detectChanges();
    component.optionCtrl.setValue('guest');
    expect(component.getTags).toHaveBeenCalled();
  }));

  it('createDatasetFormGroup() with data', () => {
    component.createDatasetFormGroup(mockDatasetForm);
    expect(component.datasetformGroup).toBeTruthy();

    component.createDatasetFormGroup(null);
    expect(component.datasetformGroup).toBeTruthy();
  });

  it('getFormDetails()', () => {
    spyOn(coreService,'getDatasetFormDetail').and.returnValues(of(mockDatasetForm));
    spyOn(component, 'createDatasetFormGroup');
    component.getFormDetails('1');
    expect(component.createDatasetFormGroup).toHaveBeenCalled();
  });

  it('fireDatasetFormValue()', async(() => {
    spyOn(coreService,'getDatasetFormDetail').and.returnValues(of(mockDatasetForm));
    spyOn(coreService, 'nextUpdateDatasetFormSubject');
    spyOn(userProfileService, 'getAllTags').withArgs(0, 15).and.returnValues(of(response), of(response));
    spyOn(userProfileService, 'searchTags').withArgs(0, 15, 'Material').and.returnValues(of(emptyResponse), of(emptyResponse));

    fixture.detectChanges();
    component.createDatasetFormGroup(mockDatasetForm);
    component.fireDatasetFormValue();

    expect(coreService.nextUpdateDatasetFormSubject).toHaveBeenCalledWith({formId: component.formId, form: component.datasetformGroup.value, isValid: component.datasetformGroup.valid});
  }));

  it('selected()', async(() => {
    spyOn(userProfileService, 'getAllTags').withArgs(0, 15).and.returnValues(of(response), of(response), of(response));
    spyOn(userProfileService, 'searchTags').withArgs(0, 15, 'Material').and.returnValues(of(emptyResponse), of(emptyResponse));
    spyOn(coreService,'getDatasetFormDetail').and.returnValues(of(mockDatasetForm));
    const tagresponse: TagActionResponse = {
      acknowledge: true,
      tagId: '761970969229124980',
      errorMsg: null
    };
    spyOn(userProfileService, 'saveUpdateTag').and.returnValues(of(tagresponse), of(tagresponse));
    fixture.detectChanges();

    const selected = {option:{value:'Material 10'}};
    component.selected(selected);
    expect(component.selectedLabels.length).toEqual(2);
    const selected2 = {option:{value:'New Tag'}};
    component.selected(selected2);
    expect(component.selectedLabels.length).toEqual(3);

  }));

  it('remove()', async(() => {
    spyOn(userProfileService, 'getAllTags').withArgs(0, 15).and.returnValues(of(response), of(response), of(response));
    spyOn(userProfileService, 'searchTags').withArgs(0, 15, 'Material').and.returnValues(of(emptyResponse), of(emptyResponse));
    spyOn(coreService,'getDatasetFormDetail').and.returnValues(of(mockDatasetForm));
    fixture.detectChanges();

    component.remove('string');
    expect(component.selectedLabels.length).toEqual(0);

  }));

  it('createTag(), should call to create tag', async(() => {
    spyOn(userProfileService, 'getAllTags').withArgs(0, 15).and.returnValues(of(response), of(response), of(response));
    spyOn(userProfileService, 'searchTags').withArgs(0, 15, 'Material').and.returnValues(of(emptyResponse), of(emptyResponse));
    spyOn(coreService,'getDatasetFormDetail').and.returnValues(of(mockDatasetForm));

    const tagresponse: TagActionResponse = {
      acknowledge: true,
      tagId: '761970969229124980',
      errorMsg: null
    };
    const failresponse: TagActionResponse = {
      acknowledge: false,
      tagId: null,
      errorMsg: null
    };
    spyOn(toasterService, 'open');
    spyOn(userProfileService, 'saveUpdateTag').and.returnValues(of(tagresponse), of(failresponse));
    // component.ngOnInit();
    component.createTag('New Tag Name');
    expect(userProfileService.saveUpdateTag).toHaveBeenCalled();
    component.createTag('New Tag Name 2');
    expect(toasterService.open).toHaveBeenCalled();
  }));

  it('close()', () => {
    spyOn(router, 'navigate');
    component.close();
    const extras: any = { relativeTo: component.route };
    extras.fragment = null;
    extras.queryParamsHandling = 'preserve';
    expect(router.navigate).toHaveBeenCalledWith(['.'], extras);
  });
});
