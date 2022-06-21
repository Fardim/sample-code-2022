import { TestBed, async } from '@angular/core/testing';

import { SchemaDetailsService } from './schema-details.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AttributeValue, CategoryInfo, ClassificationHeader, ClassificationNounMod, Noun, RequestForSchemaDetailsWithBr, SchemaBrInfo, SchemaCorrectionReq, SchemaExecutionLog, SchemaMROCorrectionReq, SchemaTableAction, SchemaTableViewFldMap, SchemaTableViewRequest, UDRDropdownValue } from '@models/schema/schemadetailstable';
import { PermissionOn, SchemaDashboardPermission } from '@models/collaborator';
import { HttpResponse } from '@angular/common/http';
import { Any2tsService } from '@services/any2ts.service';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
import { CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
describe('SchemaDetailsService', () => {
  let endpointServiceSpy: jasmine.SpyObj<EndpointsRuleService>;
  let endpointClassicServiceSpy: jasmine.SpyObj<EndpointsClassicService>;
  let schemaDetaService: SchemaDetailsService;
  let httpTestingController: HttpTestingController;
  let any2tsSpy: jasmine.SpyObj<Any2tsService>;
  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsRuleService', ['getAllSelectedFields', 'getCreateUpdateSchemaActionUrl', 'getFindActionsBySchemaUrl',
    'getDeleteSchemaActionUrl', 'getCrossMappingUrl', 'getCreateUpdateSchemaActionsListUrl', 'getAllSelectedFields', 'getWorkFlowFieldsUrl', 'getUpdateSchemaTableViewUrl',
    'getSchemaTableDetailsUrl', 'getSchemaBrInfoList', 'getCorrectedRecords', 'getSchemaExecutionLogUrl', 'doCorrectionUrl', 'getLastBrErrorRecords',
    'approveCorrectedRecords', 'resetCorrectionRecords', 'getAllUserDetailsUrl', 'createUpdateUserDetailsUrl', 'deleteSchemaCollaboratorDetailsUrl',
    'saveNewSchemaUrl', 'getClassificationDataTableUrl', 'generateCrossEntryUri', 'doClassificationCorrectionUri', 'approveClassificationUri', 'rejectClassificationUri',
    'generateMroClassificationDescriptionUri', 'downloadMroExceutionUri', 'getSchemaDataTableColumnInfoUrl', 'getSchemaDetailsBySchemaId', 'getShowMoreSchemaTableDataUrl',
    'getOverviewChartDataUrl', 'getCategoryInfoUrl', 'getSchemaStatusUrl', 'categoryChartData', 'getMetadataFields', 'getClassificationNounMod',
    'getSchemaExecutedStatsTrendUri', 'getFindActionsBySchemaAndRoleUrl', 'getSelectedFieldsByNodeIds', 'uploadCsvFileDataUrl', 'getUploadProgressUrl', 'getUDRDropdownValues', 'getClassificationDatatableHeader','getClassificationAttributeValueUrl' , 'getBusinessRulesForDIWDataset', 'checkPermissionForSchemaDetails']);

    const mapperSpy = jasmine.createSpyObj('Any2tsService', ['any2SchemaDataTableResponse', 'any2OverviewChartData', 'any2CategoryInfo', 'any2SchemaStatus', 'any2CategoryChartData',
      'any2MetadataResponse']);

    const endpointclassicSpy = jasmine.createSpyObj('EndpointsClassicService', ['getWorkFlowFieldsUrl']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SchemaDetailsService,
        { provide: EndpointsRuleService, useValue: endpointSpy },
        { provide: Any2tsService, useValue: mapperSpy},
        { provide: EndpointsClassicService, useValue: endpointclassicSpy}
      ]
    }).compileComponents();
    schemaDetaService = TestBed.inject(SchemaDetailsService);
    httpTestingController = TestBed.inject(HttpTestingController);
    endpointServiceSpy = TestBed.inject(EndpointsRuleService) as jasmine.SpyObj<EndpointsRuleService>;
    endpointClassicServiceSpy = TestBed.inject(EndpointsClassicService) as jasmine.SpyObj<EndpointsClassicService>;
    any2tsSpy = TestBed.inject(Any2tsService) as jasmine.SpyObj<Any2tsService>;
  });

  it('should be created', () => {
    const service: SchemaDetailsService = TestBed.inject(SchemaDetailsService);
    expect(service).toBeTruthy();
  });

  it('getAllSelectedFields(): get selected fields ', async(() => {
    const schemaId = '837645763957';
    const variantId = '0';
    const url = `get selected field url`;
    // mock url
    endpointServiceSpy.getAllSelectedFields.and.returnValue(url);
    // mock data
    const mockData = [
      {fieldId: 'FIELD1', order:0, editable: false,isEditable: false},
      {fieldId: 'FIELD2', order:1, editable: false, isEditable:false}
    ];
    // actual service call
    schemaDetaService.getAllSelectedFields(schemaId, variantId).subscribe(actualResponse => {
      expect(actualResponse).toEqual(mockData);
      expect(actualResponse.length).toEqual(mockData.length);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?schemaId=${schemaId}&variantId=${variantId}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(mockData);
    // verify http
    httpTestingController.verify();
  }));

  it('createUpdateSchemaAction(): createUpdateSchemaAction ', async(() => {

    const url = `createUpdateSchemaAction url`;
    // mock url
    endpointServiceSpy.getCreateUpdateSchemaActionUrl.and.returnValue(url);

    const action = new SchemaTableAction();

    // actual service call
    schemaDetaService.createUpdateSchemaAction(action).subscribe(actualResponse => {
      expect(actualResponse).toEqual(action);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(action);
    // verify http
    httpTestingController.verify();
  }));

  it('getTableActionsBySchemaId(): getTableActionsBySchemaId ', async(() => {

    const url = `getTableActionsBySchemaId url`;
    // mock url
    endpointServiceSpy.getFindActionsBySchemaUrl.and.returnValue(url);


    // actual service call
    schemaDetaService.getTableActionsBySchemaId('schemaId').subscribe(actualResponse => {
      expect(actualResponse).toEqual([]);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush([]);
    // verify http
    httpTestingController.verify();
  }));

  it('deleteSchemaTableAction(): deleteSchemaTableAction ', async(() => {

    const url = `getDeleteSchemaActionUrl url`;
    // mock url
    endpointServiceSpy.getDeleteSchemaActionUrl.and.returnValue(url);


    // actual service call
    schemaDetaService.deleteSchemaTableAction('schemaId', '1701').subscribe(actualResponse => {
      expect(actualResponse).toEqual([]);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('DELETE');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush([]);
    // verify http
    httpTestingController.verify();
  }));

  it('getCrossMappingRules(): getCrossMappingRules ', async(() => {

    const url = `getCrossMappingRules url`;
    // mock url
    endpointServiceSpy.getCrossMappingUrl.and.returnValue(url);


    // actual service call
    schemaDetaService.getCrossMappingRules('0').subscribe(actualResponse => {
      expect(actualResponse).toEqual([]);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush([]);
    // verify http
    httpTestingController.verify();
  }));

  it('createUpdateSchemaActionsList(): createUpdateSchemaActionsList ', async(() => {

    const url = `createUpdateSchemaActionsList url`;
    // mock url
    endpointServiceSpy.getCreateUpdateSchemaActionsListUrl.and.returnValue(url);

    const actions = [new SchemaTableAction()];

    // actual service call
    schemaDetaService.createUpdateSchemaActionsList(actions).subscribe(actualResponse => {
      expect(actualResponse).toEqual(actions);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(actions);
    // verify http
    httpTestingController.verify();
  }));

  it('should getSchemaTableData()', async(() => {

    const url = `getSchemaTableDetailsUrl`;
    // mock url
    endpointServiceSpy.getSchemaTableDetailsUrl.and.returnValue(url);

    const request = new RequestForSchemaDetailsWithBr();
    const response = {};

    // actual service call
    schemaDetaService.getSchemaTableData(request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should updateSchemaTableView()', async(() => {

    const url = `getUpdateSchemaTableViewUrl`;
    // mock url
    endpointServiceSpy.getUpdateSchemaTableViewUrl.and.returnValue(url);

    const request = new SchemaTableViewRequest();
    const response = {};

    // actual service call
    schemaDetaService.updateSchemaTableView(request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getWorkflowFields()', async(() => {

    const url = `getWorkFlowFieldsUrl`;
    // mock url
    endpointClassicServiceSpy.getWorkFlowFieldsUrl.and.returnValue(url);

    const request = ['1005'];
    const response = {};

    // actual service call
    schemaDetaService.getWorkflowFields(request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getAllSelectedFields()', async(() => {

    const url = `getAllSelectedFields url`;
    // mock url
    endpointServiceSpy.getAllSelectedFields.and.returnValue(url);

    const response: SchemaTableViewFldMap[] = [];

    // actual service call
    schemaDetaService.getAllSelectedFields('schema1701', '0').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?schemaId=schema1701&variantId=0`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getSchemaBrInfoList()', async(() => {

    const url = `getSchemaBrInfoList url`;
    // mock url
    endpointServiceSpy.getSchemaBrInfoList.and.returnValue(url);

    const schemaId = '1701';
    const response: SchemaBrInfo[] = [];

    // actual service call
    schemaDetaService.getSchemaBrInfoList(schemaId).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getCorrectedRecords()', async(() => {

    const url = `getCorrectedRecords url`;
    // mock url
    endpointServiceSpy.getCorrectedRecords.and.returnValue(url);

    const schemaId = '1701';
    const response = {};

    // actual service call
    schemaDetaService.getCorrectedRecords(schemaId, 10, 0).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?fetchSize=10&fetchCount=0`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getSchemaExecutionLogs()', async(() => {

    const url = `getSchemaExecutionLogUrl`;
    // mock url
    endpointServiceSpy.getSchemaExecutionLogUrl.and.returnValue(url);

    const schemaId = '1701';
    const response: SchemaExecutionLog[] = [];

    // actual service call
    schemaDetaService.getSchemaExecutionLogs(schemaId).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should doCorrection()', async(() => {

    const url = `doCorrectionUrl`;
    // mock url
    endpointServiceSpy.doCorrectionUrl.and.returnValue(url);

    const schemaId = '1701';
    const request = {} as  SchemaCorrectionReq;
    const response = 'success';

    // actual service call
    schemaDetaService.doCorrection(schemaId, request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getLastBrErrorRecords()', async(() => {

    const url = `getLastBrErrorRecords url`;
    // mock url
    endpointServiceSpy.getLastBrErrorRecords.and.returnValue(url);

    const schemaId = '1701';
    const objNumns = ['TMP001'];
    const response = 'success';

    // actual service call
    schemaDetaService.getLastBrErrorRecords(schemaId, objNumns).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getLastBrErrorRecords()', async(() => {

    const url = `getLastBrErrorRecords url`;
    // mock url
    endpointServiceSpy.getLastBrErrorRecords.and.returnValue(url);

    const schemaId = '1701';
    const objNumns = ['TMP001'];
    const response = 'success';

    // actual service call
    schemaDetaService.getLastBrErrorRecords(schemaId, objNumns).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should approveCorrectedRecords()', async(() => {

    const url = `approveCorrectedRecords url`;
    // mock url
    endpointServiceSpy.approveCorrectedRecords.and.returnValue(url);

    const schemaId = '1701';
    const objNumns = ['TMP001'];
    const response = 'success';

    // actual service call
    schemaDetaService.approveCorrectedRecords(schemaId, objNumns, '').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?roleId=`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should resetCorrectionRecords()', async(() => {

    const url = `resetCorrectionRecords url`;
    // mock url
    endpointServiceSpy.resetCorrectionRecords.and.returnValue(url);

    const schemaId = '1701';
    const objNumns = ['TMP001'];
    const runId = 'run18';
    const response = 'success';

    // actual service call
    schemaDetaService.resetCorrectionRecords(schemaId, runId, objNumns).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?runId=${runId}`);
    expect(mockRequst.request.method).toEqual('PUT');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getAllUserDetailsV2()', async(() => {

    const url = `getAllUserDetailsUrl url`;
    // mock url
    endpointServiceSpy.getAllUserDetailsUrl.and.returnValue(url);

    const response = {} as PermissionOn;

    // actual service call
    schemaDetaService.getAllUserDetailsV2('search', 1).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?queryString=search&fetchCount=1`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should createUpdateUserDetails()', async(() => {

    const url = `createUpdateUserDetailsUrl`;
    // mock url
    endpointServiceSpy.createUpdateUserDetailsUrl.and.returnValue(url);

    const request: SchemaDashboardPermission[] = [];
    const response = [];

    // actual service call
    schemaDetaService.createUpdateUserDetails(request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should deleteCollaborator()', async(() => {

    const url = `deleteSchemaCollaboratorDetailsUrl`;
    // mock url
    endpointServiceSpy.deleteSchemaCollaboratorDetailsUrl.and.returnValue(url);

    const sNoList = ['1701'];
    const response = true;

    // actual service call
    schemaDetaService.deleteCollaborator(sNoList).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('DELETE');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.event(new HttpResponse<boolean>({body: response}));
    // verify http
    httpTestingController.verify();
  }));

  it('should deleteCollaborator()', async(() => {

    const url = `deleteSchemaCollaboratorDetailsUrl`;
    // mock url
    endpointServiceSpy.deleteSchemaCollaboratorDetailsUrl.and.returnValue(url);

    const sNoList = ['1701'];
    const response = true;

    // actual service call
    schemaDetaService.deleteCollaborator(sNoList).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('DELETE');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.event(new HttpResponse<boolean>({body: response}));
    // verify http
    httpTestingController.verify();
  }));

  it('should saveNewSchemaDetails()', async(() => {

    const url = `saveNewSchemaUrl`;
    // mock url
    endpointServiceSpy.saveNewSchemaUrl.and.returnValue(url);
    const response = 'success';

    // actual service call
    schemaDetaService.saveNewSchemaDetails('1005', false, '0', '1701', {}).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getClassificationData()', async(() => {

    const url = `getClassificationDataTableUrl`;
    // mock url
    endpointServiceSpy.getClassificationDataTableUrl.and.returnValue(url);
    const response = {};

    // actual service call
    schemaDetaService.getClassificationData('schema1', 'run1', 'Bearing', 'Ball', '', 'error', '', '').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?nounCode=Bearing&modifierCode=Ball&ruleType=&requestStatus=error&searchString=&objectNumberAfter=`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should generateCrossEntry()', async(() => {

    const url = `generateCrossEntryUri`;
    // mock url
    endpointServiceSpy.generateCrossEntryUri.and.returnValue(url);
    const response = 'success';

    // actual service call
    schemaDetaService.generateCrossEntry('schema1', '1005', 'TMP1701', '').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?crossbrId=`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should generateCrossEntry()', async(() => {

    const url = `generateCrossEntryUri`;
    // mock url
    endpointServiceSpy.generateCrossEntryUri.and.returnValue(url);
    const response = 'success';

    // actual service call
    schemaDetaService.generateCrossEntry('schema1', '1005', 'TMP1701', '').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?crossbrId=`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should doCorrectionForClassification()', async(() => {

    const url = `doClassificationCorrectionUri`;
    // mock url
    endpointServiceSpy.doClassificationCorrectionUri.and.returnValue(url);

    const schemaId = '1701';
    const fieldId = 'region';
    const request = new SchemaMROCorrectionReq();
    const response = 'success';

    // actual service call
    schemaDetaService.doCorrectionForClassification(schemaId, fieldId, request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    let mockRequst = httpTestingController.expectOne(`${url}?schemaId=${schemaId}&fieldId=${fieldId}&fromUnmatch=false`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();

    // actual service call
    schemaDetaService.doCorrectionForClassification(schemaId, '', request).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    mockRequst = httpTestingController.expectOne(`${url}?schemaId=${schemaId}&fieldId=&fromUnmatch=false`);
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should approveClassification()', async(() => {

    const url = `approveClassificationUri`;
    // mock url
    endpointServiceSpy.approveClassificationUri.and.returnValue(url);

    const schemaId = '1701';
    const runId = '158';
    const objNr = ['TMP01']
    const response = true;

    // actual service call
    schemaDetaService.approveClassification(schemaId, runId, objNr).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?schemaId=${schemaId}&runId=${runId}`);
    expect(mockRequst.request.method).toEqual('PUT');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.event(new HttpResponse<boolean>({body: response}));
    // verify http
    httpTestingController.verify();
  }));

  it('should rejectClassification()', async(() => {

    const url = `rejectClassificationUri`;
    // mock url
    endpointServiceSpy.rejectClassificationUri.and.returnValue(url);

    const schemaId = '1701';
    const runId = '158';
    const objNr = ['TMP01']
    const response = true;

    // actual service call
    schemaDetaService.rejectClassification(schemaId, runId, objNr).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?schemaId=${schemaId}&runId=${runId}`);
    expect(mockRequst.request.method).toEqual('PUT');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.event(new HttpResponse<boolean>({body: response}));
    // verify http
    httpTestingController.verify();
  }));

  it('should generateMroClassificationDescription()', async(() => {

    const url = `generateMroClassificationDescriptionUri`;
    // mock url
    endpointServiceSpy.generateMroClassificationDescriptionUri.and.returnValue(url);

    const schemaId = '1701';
    const runId = '158';
    const objNr = ['TMP01']
    const response = true;

    // actual service call
    schemaDetaService.generateMroClassificationDescription(schemaId, runId, objNr, true).subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?schemaId=${schemaId}&runId=${runId}&isFromMasterLib=true`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.event(new HttpResponse<boolean>({body: response}));
    // verify http
    httpTestingController.verify();
  }));

  it('should getDownloadAbledataforMroExecution()', async(() => {

    const url = `downloadMroExceutionUri`;
    // mock url
    endpointServiceSpy.downloadMroExceutionUri.and.returnValue(url);

    const schemaId = '1701';
    const response = {};

    expect(() => schemaDetaService.getDownloadAbledataforMroExecution(schemaId, '1548', undefined, undefined, '', 'error', ''))
      .toThrowError('Nouncode must be required !');

    expect(() => schemaDetaService.getDownloadAbledataforMroExecution(schemaId, '1548', 'Bearing', undefined, '', 'error', ''))
      .toThrowError('Modifiercode must be required !');

    // actual service call
    schemaDetaService.getDownloadAbledataforMroExecution(schemaId, '1548', 'Bearing', 'Ball', '', 'error', '').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    let mockRequst = httpTestingController.expectOne(`${url}?runId=1548&dataFor=error&ruleType=&nounCode=Bearing&modifierCode=Ball&searchString=`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();

    // actual service call
    schemaDetaService.getDownloadAbledataforMroExecution(schemaId, '1548', 'Bearing', 'Ball', '', 'error', 'search').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    mockRequst = httpTestingController.expectOne(`${url}?runId=1548&dataFor=error&ruleType=&nounCode=Bearing&modifierCode=Ball&searchString=search`);
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));



  it('should getAllCategoryInfo()', async(() => {

    const url = `getCategoryInfoUrl`;
    // mock url
    endpointServiceSpy.getCategoryInfoUrl.and.returnValue(url);

    const mockHttpResp = {};
    const response: CategoryInfo[] = [];

    any2tsSpy.any2CategoryInfo.withArgs(mockHttpResp).and.returnValue(response);

    // actual service call
    schemaDetaService.getAllCategoryInfo().subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(mockHttpResp);
    // verify http
    httpTestingController.verify();
  }));


  it('should getClassificationNounMod()', async(() => {

    const url = `getClassificationNounMod url`;
    // mock url
    endpointServiceSpy.getClassificationNounMod.and.returnValue(url);

    let mockHttpResponse = [
      {ruleType: 'MRO_CLS_MASTER_CHECK', doc_count: 1, info: [{nounCode: 'Bearing'}] as Noun[]},
      {ruleType: 'MRO_MANU_PRT_NUM_LOOKUP', doc_count: 1, info: [{nounCode: 'Bearing'}] as Noun[]},
      {ruleType: 'unmatched', doc_count: 1}
    ]
    let response = {
      MRO_CLS_MASTER_CHECK: {doc_cnt: 1, info: [{nounCode: 'Bearing'}] as Noun[]},
      MRO_MANU_PRT_NUM_LOOKUP: {doc_cnt: 1, info: [{nounCode: 'Bearing'}] as Noun[]},
      unmatched: {doc_count: 1}
    } as ClassificationNounMod;

    // actual service call
    schemaDetaService.getClassificationNounMod('schema1', 'run1', 'error', '0', 'search').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    let mockRequst = httpTestingController.expectOne(`${url}?searchString=search&requestStatus=error`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(mockHttpResponse);
    // verify http
    httpTestingController.verify();

    mockHttpResponse = [
      {ruleType: 'unmatched', doc_count: null}
    ];

    response = {
      MRO_CLS_MASTER_CHECK: {doc_cnt: 0, info: []},
      MRO_MANU_PRT_NUM_LOOKUP: {doc_cnt: 0, info: []},
      unmatched: {doc_count: 0}
    } as ClassificationNounMod;

    // actual service call
    schemaDetaService.getClassificationNounMod('schema1', 'run1', '', '0', '').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    mockRequst = httpTestingController.expectOne(`${url}?searchString=&requestStatus=`);
    mockRequst.flush(mockHttpResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should getSchemaExecutedStatsTrend()', async(() => {

    const url = `getSchemaExecutedStatsTrendUri`;
    // mock url
    endpointServiceSpy.getSchemaExecutedStatsTrendUri.and.returnValue(url);
    const response: SchemaExecutionLog[] = [];

    // actual service call
    schemaDetaService.getSchemaExecutedStatsTrend('schema1', '0').subscribe(actualResponse => {
      expect(actualResponse).toEqual(response);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?exeStart=null&exeEnd=null&plantCode=0`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();

  }));

  it('getTableActionsBySchemaAndRole() ', async(() => {

    const url = `getFindActionsBySchemaAndRoleUrl`;
    // mock url
    endpointServiceSpy.getFindActionsBySchemaAndRoleUrl.and.returnValue(url);
    const response: SchemaTableAction[] = [];

    // actual service call
    schemaDetaService.getTableActionsBySchemaAndRole('schemaId', 'approver').subscribe(actualResponse => {
      expect(actualResponse).toEqual([]);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('getSelectedFieldsByNodeIds(): get selected fields ', async(() => {
    const schemaId = '837645763957';
    const variantId = '0';
    const url = `getSelectedFieldsByNodeIds url`;
    // mock url
    endpointServiceSpy.getSelectedFieldsByNodeIds.and.returnValue(url);
    // mock data
    const mockData = [];
    // actual service call
    schemaDetaService.getSelectedFieldsByNodeIds(schemaId, variantId, []).subscribe(actualResponse => {
      expect(actualResponse).toEqual(mockData);
      expect(actualResponse.length).toEqual(mockData.length);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?schemaId=${schemaId}&variantId=${variantId}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(mockData);
    // verify http
    httpTestingController.verify();
  }));

  it('uploadCsvFileData(): uploadCsvFileData ', async(() => {
    const file = new File([], 'test.csv');
    const schemId = '';
    const nodeId = '';
    const nodeType = '';
    const runId = '';
    const objNDesc = '';

    const url = `file upload url`;
    // mock url
    endpointServiceSpy.uploadCsvFileDataUrl.and.returnValue(url);

    const action: any = [];

    // actual service call
    schemaDetaService.uploadCsvFileData(file, schemId, nodeId, nodeType, runId, objNDesc).subscribe(actualResponse => {
      expect(actualResponse).toEqual(action);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(action);
    // verify http
    httpTestingController.verify();
  }));

  it('getUploadProgressPercent(): getUploadProgressPercent ', async(() => {
    const schemId = '';
    const runId = '';

    const url = `upload progress url`;
    // mock url
    endpointServiceSpy.getUploadProgressUrl.and.returnValue(url);

    const action: any = [];

    // actual service call
    schemaDetaService.getUploadProgressPercent(schemId, runId).subscribe(actualResponse => {
      expect(actualResponse).toEqual(action);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(action);
    // verify http
    httpTestingController.verify();
  }));

  it('getUDRDropdownValues(): getUDRDropdownValues ', async(() => {
    const fieldId = '';
    const searchStr = '';

    const url = `udr dropdown values url`;
    // mock url
    endpointServiceSpy.getUDRDropdownValues.and.returnValue(url);

    const action: Array<UDRDropdownValue> = [];

    // actual service call
    schemaDetaService.getUDRDropdownValues(fieldId, searchStr).subscribe(actualResponse => {
      expect(actualResponse).toEqual(action);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(action);
    // verify http
    httpTestingController.verify();
  }));

  it('getClassificationDatatableColumns(): getClassificationDatatableColumns ', async(() => {
    const url = `classification header `;
    // mock url
    endpointServiceSpy.getClassificationDatatableHeader.and.returnValue(url);

    const action: ClassificationHeader[] = [];

    // actual service call
    schemaDetaService.getClassificationDatatableColumns('3424323', 'MRO_CLS_MASTER_CHECK', 'BEARING', 'BALL').subscribe(actualResponse => {
      expect(actualResponse).toEqual(action);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?schemaId=3424323&ruleType=MRO_CLS_MASTER_CHECK&nounCode=BEARING&modeCode=BALL`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(action);
    // verify http
    httpTestingController.verify();
  }));


  it('getClassificationAttributeValue(): getClassificationAttributeValue ', async(() => {
    const url = `classification attribute values  `;
    // mock url
    endpointServiceSpy.getClassificationAttributeValueUrl.and.returnValue(url);

    const action: AttributeValue[] = [];

    // actual service call
    schemaDetaService.getClassificationAttributeValue('3424323', '').subscribe(actualResponse => {
      expect(actualResponse).toEqual(action);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?attrCode=3424323&searchQuery=`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(action);
    // verify http
    httpTestingController.verify();
  }));

  it('getBusinessRulesList(): get business rules for DIW dataset ', async(() => {
    const url = `getBusinessRulesForDIWDataset`;
    // mock url
    endpointServiceSpy.getBusinessRulesForDIWDataset.and.returnValue(url);

    const data: CoreSchemaBrInfo[] = [];

    // actual service call
    schemaDetaService.getBusinessRulesList('1','',0,0,'').subscribe(actualResponse => {
      expect(actualResponse).toEqual(data);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}?schemaId=1&s=&_page=0&_size=0&_prefetch=`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(data);
    // verify http
    httpTestingController.verify();
  }));

  // it('checkPermissionForSchemaDetails(): check permission for schemadetails', async(() => {
  //   const url = `checkPermissionForSchemaDetails`;
  //   // mock url
  //   endpointServiceSpy.checkPermissionForSchemaDetails.and.returnValue(url);

  //   const data = {
  //     isValid : true
  //   };

  //   // actual service call
  //   schemaDetaService.checkPermissionForSchemaDetails('3424323').subscribe(actualResponse => {
  //     expect(actualResponse).toEqual(data);
  //   });
  //   // mock http call
  //   // const mockRequst = httpTestingController.expectOne(`${url}`);
  //   // expect(mockRequst.request.method).toEqual('GET');
  //   // expect(mockRequst.request.responseType).toEqual('json');
  //   // mockRequst.flush(data);
  //   // // verify http
  //   // httpTestingController.verify();
  // }));

});
