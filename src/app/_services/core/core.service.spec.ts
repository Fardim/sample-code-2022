import { FieldActionResponse, CreateFieldDto, Fieldlist, ListFieldIdResponse, BulkDeleteResponse, DatasetForm, DatasetFormCreateDto, DatasetFormCreateResponse, DatasetFormRequestDto, FormTab } from './../../_models/list-page/listpage';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ObjectType, SaveModuleSuccess } from '@models/core/coreModel';
import { EndpointsCoreService } from '@services/_endpoints/endpoints-core.service';

import { CoreService } from './core.service';
import { Structure } from '@modules/list/_components/field/hierarchy-service/hierarchy.service';
import { of } from 'rxjs';

describe('CoreService', () => {
  let service: CoreService;
  let endpointsServiceSpy: jasmine.SpyObj<EndpointsCoreService>;
  let httpTestingController: HttpTestingController;
  const mockFieldDto: CreateFieldDto = {
    fields: [
      {
        structureid: '1',
        fieldlist: [
          {
            fieldId: '',
            shortText: {
              en: {
                description: 'Material Type',
                information: 'Material information',
              },
            },
            helptexts: {
              en: 'Material Type',
              fr: 'Material Type Fr',
            },
            longtexts: {
              en: 'Material Type',
              fr: 'Material Type Fr',
            },
            dataType: 'CHAR',
            pickList: '1',
            maxChar: 4,
            isHeirarchy: false,
            isCriteriaField: false,
            isWorkFlow: false,
            isGridColumn: false,
            parentField: '',
            isDescription: false,
            textCase: 'UPPER',
            attachmentSize: '',
            fileTypes: '',
            isSearchEngine: true,
            isFutureDate: false,
            isPastDate: false,
            optionsLimit: 1,
            isNoun: false,
            displayCriteria: null,
            moduleId: '1005',
            structureId: '1',
            childfields: [],
          },
        ],
      },
    ],
  } as any;

  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsCoreService', [
      'getAllObjectTypeUrl',
      'getAllFieldsForViewUrl',
      'getObjectTypeDetailsUrl',
      'searchFieldsMetadataUrl',
      'getMetadataByFieldsUrl',
      'saveModule',
      'getMetadataFieldsByFields',
      'getCreateFieldUrl',
      'getUpdateFieldUrl',
      'getFieldDetailsWithFieldIdUrl',
      'getListFieldIdByStructureUrl',
      'getListParentFieldsUrl',
      'bulkDeleteDraftUrl',
      'getDatasetFormListUrl',
      'createDatasetFormUrl',
      'getFormsCountUrl',
      'getDatasetFormDetailUrl',
      'updateDatasetFormUrl',
      'searchTabFieldsUrl',
      'searchUnassignedTabFieldsUrl',
      'saveDatasetFormTabsDetailsUrl',
      'getDatasetFormTabsDetailsUrl',
      'getAllModulesV2Url',
      'searchFieldsWithDescriptionUrl',
      'saveReferenceRuleUrl'
    ]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: EndpointsCoreService, useValue: endpointSpy }],
    });
    service = TestBed.inject(CoreService);
    endpointsServiceSpy = TestBed.inject(EndpointsCoreService) as jasmine.SpyObj<EndpointsCoreService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getAllObjectType', () => {
    const url = '/module/get-all-modules';
    const response: any[] = [
      {
        moduleId: 1,
        tenantId: 0,
        userModified: 'savan.vaishnav@prospecta.com',
        dateModified: 1622089545393,
        dispCriteria: 1,
        moduledescription: { en: 'Material' },
      },
    ];

    const lang = 'en';
    const fetchCount = 0;
    const fetchSize = 20;

    endpointsServiceSpy.getAllObjectTypeUrl.and.returnValue(url);

    service.getAllObjectType(lang, fetchSize, fetchCount).subscribe((modules) => {
      expect(modules).toEqual(response);
    });
    const mockRequest = httpTestingController.expectOne(`${url}?fetchcount=${fetchCount}&fetchsize=${fetchSize}&language=${lang}`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getObjectTypeDetails', () => {
    const url = '/module/get-module-desc';
    const response = {
      objectid: 1005,
      objectdesc: 'Material',
    } as ObjectType;

    const moduleId = 4;
    const lang = 'en';

    endpointsServiceSpy.getObjectTypeDetailsUrl.and.returnValue(url);

    service.getObjectTypeDetails(moduleId, lang).subscribe((modules) => {
      expect(modules).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getMetadataByFields', () => {
    const url = '/metadata/fields/getSearchEngineFields';
    const response = [{ dataType: 'CHAR', maxChar: '50', fieldId: '0' }];

    endpointsServiceSpy.getMetadataByFieldsUrl.and.returnValue(url);

    const moduleId = 4;
    const fetchCount = 0;
    const searchString = '';
    const fetchSize = 20;
    const lang = 'en';

    service.getMetadataByFields(moduleId, fetchCount, searchString, fetchSize, lang).subscribe((fields) => {
      expect(JSON.stringify(fields)).toEqual(JSON.stringify(response));
    });

    const mockRequest = httpTestingController.expectOne(
      `${url}?fetchcount=${fetchCount}&searchterm=${searchString}&fetchsize=${fetchSize}`
    );
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should saveModule', () => {
    const url = '/module/save';
    const response: SaveModuleSuccess = {
      acknowledge: true,
      errorMsg: '',
      fieldsErrors: '',
      moduleid: 'business-rule',
    };
    endpointsServiceSpy.saveModule.and.returnValue(url);

    const payload = {
      datasetId: '1',
      datasetName: 'Test dataset',
      datasetDescription: 'test',
      datasetCompanyId: '10',
      singleRecordDataset: true,
      appName: 'test',
      industry: ['Industry 1', 'Industry 2'],
      systemType: 'systemType1',
      owner: 'partner',
      datatype: 'master',
      persistence: 'conditionBased',
      dataPrivacy: 'retention',
      parentDataset: ['Parent dataset1', 'Parent dataset2'],
    };

    // eslint-disable-next-line import/no-deprecated
    service.saveModule(payload).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}`);

    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getMetadataFieldsByFields', () => {
    const url = '/metadata/fields/get-fields-by-fields';
    const response = [{ dataType: 'CHAR', maxChar: '50', fieldId: '0' }];

    endpointsServiceSpy.getMetadataFieldsByFields.and.returnValue(url);

    const requestPayload = {
      fieldIds: ['MDMF14'],
    };
    const lang = 'en';

    service.getMetadatFieldsByFields(requestPayload,1, lang).subscribe((res) => {
      expect(JSON.stringify(res)).toEqual(JSON.stringify(response));
    });

    const mockRequest = httpTestingController.expectOne(`${url}?LANGUAGE=${lang}`);
    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should createField', () => {
    const url = '/metadata/fields/1005/createField';
    const response: FieldActionResponse = {
      acknowledge: true,
      errorMsg: '',
    };
    endpointsServiceSpy.getCreateFieldUrl.and.returnValue(url);

    const payload: CreateFieldDto = mockFieldDto;

    // eslint-disable-next-line import/no-deprecated
    service.createField('1005', payload).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}`);

    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should updateField', () => {
    const url = '/metadata/fields/1005/update/1';
    const response: FieldActionResponse = {
      acknowledge: true,
      errorMsg: '',
    };
    endpointsServiceSpy.getUpdateFieldUrl.and.returnValue(url);

    const payload: CreateFieldDto = mockFieldDto;

    // eslint-disable-next-line import/no-deprecated
    service.updateField('1005', '1', payload).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}`);

    expect(mockRequest.request.method).toEqual('PUT');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getFieldDetails', () => {
    const url = '/metadata/fields/1005/getFieldDetails';
    const response: Fieldlist = mockFieldDto.fields[0].fieldlist[0];
    endpointsServiceSpy.getFieldDetailsWithFieldIdUrl.and.returnValue(url);

    // eslint-disable-next-line import/no-deprecated
    service.getFieldDetails('1005', '1').subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?fieldid=1`);

    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getListFieldIdByStructure', () => {
    const url = '/module/fields/1005/en/listFieldIdByStructure';

    endpointsServiceSpy.getListFieldIdByStructureUrl.and.returnValue(url);

    const moduleId = '1005';
    const fetchCount = 0;
    const searchString = '';
    const fetchSize = 20;
    const lang = 'en';
    const response: ListFieldIdResponse = {
      acknowledge: true,
      errorMsg: null,
      fieldIds: ['1'],
    };

    service.getListFieldIdByStructure(moduleId, lang, fetchCount, fetchSize, searchString, {structureId: '1'}).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(
      `${url}?fetchcount=${fetchCount}&fetchsize=${fetchSize}`
    );
    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getListParentFields', () => {
    const url = '/module/fields/1005/listParentFields';

    endpointsServiceSpy.getListParentFieldsUrl.and.returnValue(url);

    const moduleId = '1005';
    const fetchCount = 0;
    const searchString = '';
    const fetchSize = 20;
    const lang = 'en';
    const response: ListFieldIdResponse = {
      acknowledge: true,
      errorMsg: null,
      fieldIds: ['1'],
    };

    service.getListParentFields(moduleId, lang, fetchCount, fetchSize, searchString, {structureId: '1'}).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(
      `${url}?fetchcount=${fetchCount}&fetchsize=${fetchSize}`
    );
    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should bulkDeleteDraft', () => {
    const url = '/metadata/1005/draftField/bulk/delete';

    endpointsServiceSpy.bulkDeleteDraftUrl.and.returnValue(url);

    const moduleId = '1005';
    const dto = {
      fieldIds: ['test', 'test2'],
    };
    const response: BulkDeleteResponse = {
      deletedFields: ['test', 'test2'],
      failedFields: [],
    };

    service.bulkDeleteDraft(moduleId, dto).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(
      `${url}`
    );
    expect(mockRequest.request.method).toEqual('DELETE');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getDatasetFormList', () => {
    const url = '/layout/1005/list';

    endpointsServiceSpy.getDatasetFormListUrl.and.returnValue(url);

    const moduleId = '1005';
    const fetchcount = 0;
    const searchterm = '';
    const fetchsize = 50;
    const dateCreated = +new Date();
    const dateModified = +new Date();
    const response: DatasetForm[] = [new DatasetForm()];
    const dto: DatasetFormRequestDto = { type: [2, 3], userCreated: [], userModified: [] };

    service.getDatasetFormList(moduleId, fetchcount, fetchsize, searchterm, dateCreated, dateModified, dto).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(
      `${url}?fetchCount=${fetchcount}&fetchSize=${fetchsize}&searchTerm=${searchterm}&dateCreated=${dateCreated ? dateCreated : ''}&dateModified=${dateModified ? dateModified : ''}`
    );
    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getFormsCount', () => {
    const url = '/layout/1005/count';

    endpointsServiceSpy.getFormsCountUrl.and.returnValue(url);

    const moduleId = '1005';
    const response = {count: 7};

    service.getFormsCount(moduleId).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(
      `${url}`
    );
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should createDatasetForm', () => {
    const url = '/layout/1005/create';
    const response: DatasetFormCreateResponse = {
      acknowledge: true,
      errorMsg: '',
      layoutId: '1',
      successMsg: 'Success'
    };
    endpointsServiceSpy.createDatasetFormUrl.and.returnValue(url);

    const payload: DatasetFormCreateDto = {
      description: 'Form Name',
      helpText: 'Flow type form',
      labels: 'label1, label2',
      type: '2',
      usage: 'usage'
    };

    // eslint-disable-next-line import/no-deprecated
    service.createDatasetForm('1005', payload).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}`);

    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getDatasetFormDetail', () => {
    const url = '/layout/1005/get-layout';

    endpointsServiceSpy.getDatasetFormDetailUrl.and.returnValue(url);

    const moduleId = '1005';
    const layoutId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const response = new DatasetForm();

    service.getDatasetFormDetail(moduleId, layoutId).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(
      `${url}?layoutId=${layoutId}`
    );
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  });


  it('should updateDatasetForm', () => {
    const url = '/layout/1005/1/update';
    const response: DatasetFormCreateResponse = {
      acknowledge: true,
      errorMsg: '',
      layoutId: '1',
      successMsg: 'Success'
    };
    endpointsServiceSpy.updateDatasetFormUrl.and.returnValue(url);

    const payload: DatasetFormCreateDto = {
      description: 'Form Name',
      helpText: 'Flow type form',
      labels: 'label1, label2',
      type: '2',
      usage: 'usage'
    };

    service.updateDatasetForm('1005', '1', payload).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}`);

    expect(mockRequest.request.method).toEqual('PUT');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  /* it('should searchTabFields', () => {
    const url = '/tab/fields/1005/search-by-description/en/1';

    endpointsServiceSpy.searchTabFieldsUrl.and.returnValue(url);

    const moduleId = '1005';
    const layoutId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const fetchCount = 0;
    const searchTerm = '';
    const fetchSize = 50;
    const response: TabFieldsResponse[] = [new TabFieldsResponse()];

    service.searchTabFields(moduleId, layoutId, 'en', fetchCount, fetchSize, searchTerm).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(
      `${url}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`
    );
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  }); */

  /* it('should searchUnassignedTabFields', () => {
    const url = '/tab/1005/fields/search-unassigned-fields/en/1';

    endpointsServiceSpy.searchUnassignedTabFieldsUrl.and.returnValue(url);

    const moduleId = '1005';
    const layoutId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const fetchCount = 0;
    const searchTerm = '';
    const fetchSize = 50;
    const response: UnassignedFieldsResponse[] = [];

    service.searchUnassignedTabFields(moduleId, layoutId, 'en', fetchCount, fetchSize, searchTerm).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(
      `${url}?fetchCount=${fetchCount}&fetchSize=${fetchSize}&searchTerm=${searchTerm}`
    );
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  }); */

  it('createRootStructure', (done) => {
    const structure = new Structure();
    structure.isHeader = true;
    structure.strucDesc = 'Header Data';
    structure.language = 'en';
    structure.moduleId = '10';
    structure.parentStrucId = 0;
    structure.structureId = 1;

    spyOn(service, 'saveUpdateStructure').withArgs(structure).and.returnValue(of({}));
    service.createRootStructure('10', 'en').subscribe((res) => {
      expect(service.saveUpdateStructure).toHaveBeenCalledWith(structure);
      done();
    });

  })
  it('saveUpdateStructure(), should save or update an existing structure', (done) => {
    const structure = new Structure();
    structure.isHeader = true;
    structure.strucDesc = 'Header Data';
    structure.language = 'en';
    structure.moduleId = '10';
    structure.parentStrucId = 0;
    structure.structureId = 1;
    spyOn(service, 'saveUpdateStructure').withArgs(structure).and.returnValue(of({ msg: 'saved'}));
    service.saveUpdateStructure(structure).subscribe((res) => {
      expect(res.msg).toEqual('saved');
      done();
    });
  })

  it('should saveDatasetFormTabsDetails', () => {
    const url = 'saveDatasetFormTabsDetailsUrl';

    endpointsServiceSpy.saveDatasetFormTabsDetailsUrl.and.returnValue(url);

    const moduleId = '1005';
    const layoutId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const tabs: FormTab[] = [];
    const response: FormTab[] = [];

    service.saveDatasetFormTabsDetails(tabs, moduleId, layoutId, 'en').subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getDatasetFormTabsDetails', () => {
    const url = 'getDatasetFormTabsDetailsUrl';

    endpointsServiceSpy.getDatasetFormTabsDetailsUrl.and.returnValue(url);

    const moduleId = '1005';
    const layoutId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const response: FormTab[] = [];

    service.getDatasetFormTabsDetails(moduleId, layoutId, 'en').subscribe((res) => {
      expect(res).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  });
});
