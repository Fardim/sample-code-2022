import { TestBed, async } from '@angular/core/testing';

import { SchemaService } from './schema.service';
import { ObjectTypeResponse, ExcelValues, GetAllSchemabymoduleidsReq, GetAllSchemabymoduleidsRes } from 'src/app/_models/schema/schema';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Any2tsService } from '../any2ts.service';
import { SchemaExecutionProgressResponse, SchemaExecutionTree } from '@models/schema/schema-execution';
import {
  ApiRulesInfo,
  Category,
  CoreSchemaBrInfo,
  CreateUpdateSchema,
  DropDownValue,
  TransformationMappingResponse,
  UDRBlocksModel,
  UdrModel,
} from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { HttpResponse } from '@angular/common/http';
import { SchemaListModuleList, SchemaStaticThresholdRes } from '@models/schema/schemalist';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
describe('SchemaService', () => {
  let schemaService: SchemaService;
  let httpTestingController: HttpTestingController;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsRuleService>;
  let endpointClassicServiceSpy: jasmine.SpyObj<EndpointsClassicService>;
  let any2tsSpy: jasmine.SpyObj<Any2tsService>;

  beforeEach(async(() => {
    const epsSpy = jasmine.createSpyObj('EndpointsRuleService', [
      'getSchemaGroupsUrl',
      'getSchemaGroupDetailsByGrpIdUrl',
      'getCreateSchemaGroupUrl',
      'getAllObjecttypeUrl',
      'deleteConditionBlock',
      'deleteSchema',
      'schemaExecutionProgressDetailUrl',
      'getSchemaGroupCountUrl',
      'getAllSchemabymoduleids',
      'groupDetailswithAssignedschemaUrl',
      'scheduleSchemaCount',
      'deleteSchemaGroupUrl',
      'uploadDataUrl',
      'uploadFileDataUrl',
      'getBusinessRulesInfoBySchemaIdUrl',
      'getBusinessRulesInfoByModuleIdUrl',
      'getAllBusinessRulesUrl',
      'getFillDataInfo',
      'createSchema',
      'createBr',
      'getCategoriesInfo',
      'saveUpdateUDRUrl',
      'saveUpdateUdrBlockUrl',
      'getBusinessRuleInfoUrl',
      'conditionListsUrl',
      'dropDownValuesUrl',
      'dropDownValuesV2Url',
      'getBrConditionalOperatorUrl',
      'deleteBr',
      'getUdrBusinessRuleInfoUrl',
      'deleteConditionBlock',
      'getSchemaThresholdStatics',
      'getSchemaThresholdStaticsV2',
      'uploadCorrectionDataUrl',
      'getSchemaInfoByModuleIdUrl',
      'deleteSchema',
      'copyDuplicate',
      'getSchemaExecutionTree',
      'getSchemaExecutionTreeV2',
      'getModuleInfoByModuleIdUrl',
      'getBuisnessRulesBasedOnRunUrl',
      'cancleSchemaUri',
      'transformationRules',
      'getMappedTransformationRulesUrl',
      'getSchemaGlobalCounts'
    ]);
    const any2Spy = jasmine.createSpyObj('Any2tsService', [
      'any2SchemaGroupResponse',
      'any2SchemaDetails',
      'any2ObjectType',
      'any2SchemaGroupCountResposne',
      'any2GetAllSchemabymoduleidsResponse',
      'any2SchemaGroupWithAssignSchemasResponse',
    ]);
    const epsClassicSpy = jasmine.createSpyObj('EndpointsClassicService', [
      'getAllObjecttypeUrl',
      'scheduleSchemaCount',
      'downloadExecutionDetailsByNodesUrl',
      'getApisRulesUrl'
    ]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SchemaService,
        { provide: EndpointsRuleService, useValue: epsSpy },
        { provide: Any2tsService, useValue: any2Spy },
        { provide: EndpointsClassicService, useValue: epsClassicSpy },
      ],
    }).compileComponents();
    schemaService = TestBed.inject(SchemaService) as jasmine.SpyObj<SchemaService>;
    endpointServiceSpy = TestBed.inject(EndpointsRuleService) as jasmine.SpyObj<EndpointsRuleService>;
    endpointClassicServiceSpy = TestBed.inject(EndpointsClassicService) as jasmine.SpyObj<EndpointsClassicService>;
    any2tsSpy = TestBed.inject(Any2tsService) as jasmine.SpyObj<Any2tsService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  }));

  it('should be created', () => {
    const service: SchemaService = TestBed.inject(SchemaService);
    expect(service).toBeTruthy();
  });

  it('getAllObjectType() : will return list of object type ', async(() => {
    // mock data
    const objectTypeList: ObjectTypeResponse[] = [];
    objectTypeList.push(new ObjectTypeResponse());

    // mock url
    const getObejctTypeUrl = 'get-all-objecttype';
    const httpMockData = {} as any;
    endpointClassicServiceSpy.getAllObjecttypeUrl.and.returnValue(getObejctTypeUrl);

    any2tsSpy.any2ObjectType.withArgs(httpMockData).and.returnValue(objectTypeList);

    // call actual service method
    schemaService.getAllObjectType().subscribe((data) => {
      expect(data).toEqual(objectTypeList);
    });

    // mock http
    const httpReq = httpTestingController.expectOne(getObejctTypeUrl);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(httpMockData);
    // verify http
    httpTestingController.verify();
  }));

  it('deleteConditionBlock() : delete call http for delete condition block ', async(() => {
    // mock data
    const blockId = '236642364532';

    // mock url
    const url = 'delete condition block/' + blockId;
    const httpMockData = {} as any;
    endpointServiceSpy.deleteConditionBlock.withArgs(blockId).and.returnValue(url);

    // call actual service method
    schemaService.deleteConditionBlock(blockId).subscribe((data) => {
      expect(data).toEqual({} as boolean);
    });

    // mock http
    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('DELETE');
    httpReq.flush(httpMockData);
    // verify http
    httpTestingController.verify();
  }));

  it('deleteSchema() : delete call http for delete schema ', async(() => {
    // mock data
    const schemaId = '236642364532';

    // mock url
    const url = 'delete schema/' + schemaId;
    const httpMockData = {} as any;
    endpointServiceSpy.deleteSchema.withArgs(schemaId).and.returnValue(url);

    // call actual service method
    schemaService.deleteSChema(schemaId).subscribe((data) => {
      expect(data).toEqual({} as boolean);
    });

    // mock http
    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('DELETE');
    httpReq.flush(httpMockData);
    // verify http
    httpTestingController.verify();
  }));

  it('getSchemaExecutionProgressDetails(), should call http get to get execution progress details', async(() => {
    const schemaId = '145246';

    const url = `schema-progress/${schemaId}`;
    const httpMockData = {} as SchemaExecutionProgressResponse;

    endpointServiceSpy.schemaExecutionProgressDetailUrl.withArgs(schemaId).and.returnValue(url);

    schemaService.getSchemaExecutionProgressDetails(schemaId).subscribe((data) => {
      expect(data).toEqual({} as SchemaExecutionProgressResponse);
    });

    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(httpMockData);

    httpTestingController.verify();
  }));

  it('should setStaticFieldValues', () => {
    /* schemaService.setStaticFieldValues(['Asia']);
    expect(schemaService.getStaticFieldValues('')).toEqual(['Asia']); */

    expect(schemaService.getStaticFieldValues('')).toBeNull();
    expect(schemaService.getStaticFieldValues('color')).toBeNull();

    const excelData = {
      uploadedData: [
        ['', 'blue'],
        ['', 'red'],
      ],
      headerData: [{ mdoFldId: 'color', columnIndex: 1 }],
    } as ExcelValues;

    schemaService.setExcelValues(excelData);

    expect(schemaService.getStaticFieldValues('color')).toEqual(['red']);
  });

  it('should set/get currentweightage', () => {
    schemaService.currentweightage = 100;
    expect(schemaService.currentweightageValue).toEqual(100);
  });

  // it('should getSchemaGroupCounts()', async(() => {
  //   const url = 'test getSchemaGroupCountUrl';
  //   const groupId = 826462836823234;
  //   // mock url
  //   endpointServiceSpy.getSchemaGroupCountUrl.withArgs(groupId).and.returnValue(url);
  //   // making mock data
  //   const mockhttpData = {} as any;
  //   const mockTS: SchemaGroupCountResponse = new SchemaGroupCountResponse();
  //   // mock any2ts
  //   any2tsSpy.any2SchemaGroupCountResposne.withArgs(mockhttpData).and.returnValue(mockTS);
  //   // actual service call
  //   schemaService.getSchemaGroupCounts(groupId).subscribe(actualData => {
  //     expect(actualData).toEqual(mockTS);
  //   });
  //   // mocking http
  //   const httpReq = httpTestingController.expectOne(url);
  //   expect(httpReq.request.method).toEqual('GET');
  //   httpReq.flush(mockhttpData);
  //   // verify http
  //   httpTestingController.verify();
  // }));

  it('should getAllSchemabymoduleids()', async(() => {
    const url = 'test getAllSchemabymoduleids url';
    const request = new GetAllSchemabymoduleidsReq();
    // mock url
    endpointServiceSpy.getAllSchemabymoduleids.and.returnValue(url);
    // making mock data
    const mockhttpData = {} as any;
    const mockTS: GetAllSchemabymoduleidsRes[] = [];
    // mock any2ts
    any2tsSpy.any2GetAllSchemabymoduleidsResponse.withArgs(mockhttpData).and.returnValue(mockTS);
    // actual service call
    schemaService.getAllSchemabymoduleids(request).subscribe((actualData) => {
      expect(actualData).toEqual(mockTS);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('should scheduleSchemaCount()', async(() => {
    const url = 'test scheduleSchemaCount url';
    const schemaId = '826462836823234';
    // mock url
    endpointClassicServiceSpy.scheduleSchemaCount.and.returnValue(url);
    // making mock data
    const mockTS = 1;

    // actual service call
    schemaService.scheduleSchemaCount(schemaId).subscribe((actualData) => {
      expect(actualData).toEqual(mockTS);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(mockTS);
    // verify http
    httpTestingController.verify();
  }));

  it('should uploadUpdateFileData()', async(() => {
    const url = 'test uploadFileDataUrl';
    // mock url
    endpointServiceSpy.uploadFileDataUrl.and.returnValue(url);
    // making mock data
    const response = 'success';

    // actual service call
    schemaService.uploadUpdateFileData(new File([], 'testfile'), '826462836823234').subscribe((actualData) => {
      expect(actualData).toEqual(response);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}?fileSno=826462836823234`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should uploadData()', async(() => {
    const url = 'test uploadDataUrl';
    // mock url
    endpointServiceSpy.uploadDataUrl.and.returnValue(url);
    // making mock data
    const response = 'success';

    // actual service call
    schemaService.uploadData([], '1005', '826462836823234').subscribe((actualData) => {
      expect(actualData).toEqual(response);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getBusinessRulesBySchemaId()', async(() => {
    const url = 'test getBusinessRulesInfoBySchemaIdUrl';
    const schemaId = '826462836823234';
    // mock url
    endpointServiceSpy.getBusinessRulesInfoBySchemaIdUrl.and.returnValue(url);
    // making mock data
    const response: CoreSchemaBrInfo[] = [];

    // actual service call
    schemaService.getBusinessRulesBySchemaId(schemaId).subscribe((actualData) => {
      expect(actualData).toEqual(response);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getBusinessRulesByModuleId()', async(() => {
    const url = 'test getBusinessRulesInfoByModuleIdUrl';

    // mock url
    endpointServiceSpy.getBusinessRulesInfoByModuleIdUrl.and.returnValue(url);
    // making mock data
    const response: CoreSchemaBrInfo[] = [];

    // actual service call
    schemaService.getBusinessRulesByModuleId('1005', 'dup', 'DUPLICATE', '10').subscribe((actualData) => {
      expect(actualData).toEqual(response);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}?moduleId=1005&searchString=dup&brType=DUPLICATE&fetchCount=10`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getAllBusinessRules()', async(() => {
    const url = 'test getAllBusinessRulesUrl';

    // mock url
    endpointServiceSpy.getAllBusinessRulesUrl.and.returnValue(url);
    // making mock data
    const response: CoreSchemaBrInfo[] = [];

    // actual service call
    schemaService.getAllBusinessRules().subscribe((actualData) => {
      expect(actualData).toEqual(response);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getAllCategoriesList()', async(() => {
    const url = 'test getCategoriesInfo url';

    // mock url
    endpointServiceSpy.getCategoriesInfo.and.returnValue(url);
    // making mock data
    const response: Category[] = [];

    // actual service call
    schemaService.getAllCategoriesList().subscribe((actualData) => {
      expect(actualData).toEqual(response);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should getFillDataDropdownData()', async(() => {
    const url = 'test getFillDataInfo url';
    const id = '1701';
    // mock url
    endpointServiceSpy.getFillDataInfo.and.returnValue(url);
    // making mock data
    const response = [];

    // actual service call
    schemaService.getFillDataDropdownData(id).subscribe((actualData) => {
      expect(actualData).toEqual(response);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should createUpdateSchema()', async(() => {
    const url = 'test createSchema url';
    const request = new CreateUpdateSchema();
    // mock url
    endpointServiceSpy.createSchema.and.returnValue(url);
    // making mock data
    const response = 'success';

    // actual service call
    schemaService.createUpdateSchema(request).subscribe((actualData) => {
      expect(actualData).toEqual(response);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should createBusinessRule()', async(() => {
    const url = 'test createBr url';
    const request = new CoreSchemaBrInfo();
    // mock url
    endpointServiceSpy.createBr.and.returnValue(url);
    // making mock data
    const response = new CoreSchemaBrInfo();

    // actual service call
    schemaService.createBusinessRule(request).subscribe((actualData) => {
      expect(actualData).toEqual(response);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('should deleteBr()', async(() => {
    const url = 'test deleteBr url';
    const brId = '826462836823234';
    // mock url
    endpointServiceSpy.deleteBr.and.returnValue(url);
    // making mock data
    const mockResponse = true;

    // actual service call
    schemaService.deleteBr(brId).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('DELETE');
    httpReq.event(new HttpResponse<boolean>({ body: true }));
    // verify http
    httpTestingController.verify();
  }));

  it('should getBrConditionalOperator()', async(() => {
    const url = 'test getBrConditionalOperatorUrl';
    // mock url
    endpointServiceSpy.getBrConditionalOperatorUrl.and.returnValue(url);
    // making mock data
    const mockResponse = ['AND'];

    // actual service call
    schemaService.getBrConditionalOperator().subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should dropDownValues()', async(() => {
    const url = 'test dropDownValuesUrl';
    // mock url
    endpointServiceSpy.dropDownValuesUrl.and.returnValue(url);
    // making mock data
    const mockResponse: DropDownValue[] = [];

    // actual service call
    schemaService.dropDownValues('mtl_grp', 'search').subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}?queryString=search&from=0&size=20`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should dropDownValuesV2()', async(() => {
    const url = 'test dropDownValuesV2Url';
    // mock url
    endpointServiceSpy.dropDownValuesV2Url.and.returnValue(url);
    // making mock data
    const mockResponse: DropDownValue[] = [];

    // actual service call
    schemaService.dropDownValuesV2('mtl_grp', [], 'search').subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}?queryString=search&from=0&size=20`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should getConditionList()', async(() => {
    const url = 'test conditionListsUrl';
    const objectType = '1005';
    // mock url
    endpointServiceSpy.conditionListsUrl.and.returnValue(url);
    // making mock data
    const mockResponse: UDRBlocksModel[] = [];

    // actual service call
    schemaService.getConditionList(objectType).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should getBusinessRuleInfo()', async(() => {
    const url = 'test getBusinessRuleInfoUrl';
    const brId = '1701';
    // mock url
    endpointServiceSpy.getBusinessRuleInfoUrl.and.returnValue(url);
    // making mock data
    const mockResponse = { brId } as CoreSchemaBrInfo;

    // actual service call
    schemaService.getBusinessRuleInfo(brId).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should saveUpdateUdrBlock()', async(() => {
    const url = 'test saveUpdateUdrBlockUrl';
    const blocks = [new UDRBlocksModel()];
    // mock url
    endpointServiceSpy.saveUpdateUdrBlockUrl.and.returnValue(url);
    // making mock data
    const mockResponse = ['id1'];

    // actual service call
    schemaService.saveUpdateUdrBlock(blocks).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should saveUpdateUDR()', async(() => {
    const url = 'test saveUpdateUDRUrl';
    const udr = new CoreSchemaBrInfo();
    // mock url
    endpointServiceSpy.saveUpdateUDRUrl.and.returnValue(url);
    // making mock data
    const mockResponse = 'id1';

    // actual service call
    schemaService.saveUpdateUDR(udr).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should getUdrBusinessRuleInfo()', async(() => {
    const url = 'test getUdrBusinessRuleInfoUrl';
    const ruleId = '1701';
    // mock url
    endpointServiceSpy.getUdrBusinessRuleInfoUrl.and.returnValue(url);
    // making mock data
    const mockResponse = new UdrModel();

    // actual service call
    schemaService.getUdrBusinessRuleInfo(ruleId).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should deleteConditionBlock()', async(() => {
    const url = 'test deleteConditionBlock url';
    const ruleId = '1701';
    // mock url
    endpointServiceSpy.deleteConditionBlock.and.returnValue(url);
    // making mock data
    const mockResponse = true;

    // actual service call
    schemaService.deleteConditionBlock(ruleId).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('DELETE');
    httpReq.event(new HttpResponse<boolean>({ body: mockResponse }));
    // verify http
    httpTestingController.verify();
  }));

  it('should getSchemaThresholdStatics()', async(() => {
    const url = 'test getSchemaThresholdStatics url';
    const schemaId = '1701';
    // mock url
    endpointServiceSpy.getSchemaThresholdStatics.and.returnValue(url);
    // making mock data
    const mockResponse = new SchemaStaticThresholdRes();

    // actual service call
    schemaService.getSchemaThresholdStatics(schemaId, '556757', ['2342675']).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should getSchemaThresholdStaticsV2()', async(() => {
    const url = 'test getSchemaThresholdStaticsV2 url';
    const schemaId = '1701';
    // mock url
    endpointServiceSpy.getSchemaThresholdStaticsV2.and.returnValue(url);
    // making mock data
    const mockResponse = new SchemaStaticThresholdRes();

    // actual service call
    schemaService.getSchemaThresholdStaticsV2(schemaId, '556757', ['2342675'], []).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should uploadCorrectionData()', async(() => {
    const url = 'test uploadCorrectionDataUrl';
    // mock url
    endpointServiceSpy.uploadCorrectionDataUrl.and.returnValue(url);
    // making mock data
    const mockResponse = 'success';

    // actual service call
    schemaService.uploadCorrectionData([], '1005', '1701', '170170', '0', '1801').subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should getSchemaInfoByModuleId()', async(() => {
    const url = 'test getSchemaInfoByModuleIdUrl';
    const moduleId = '1701';
    // mock url
    endpointServiceSpy.getSchemaInfoByModuleIdUrl.and.returnValue(url);
    // making mock data
    const mockResponse = new SchemaListModuleList();

    // actual service call
    schemaService.getSchemaInfoByModuleId(moduleId).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('should deleteSChema()', async(() => {
    const url = 'test deleteSchema';
    const schemaId = '1701';
    // mock url
    endpointServiceSpy.deleteSchema.and.returnValue(url);
    // making mock data
    const mockResponse = true;

    // actual service call
    schemaService.deleteSChema(schemaId).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('DELETE');
    httpReq.event(new HttpResponse<boolean>({ body: mockResponse }));
    // verify http
    httpTestingController.verify();
  }));

  it('should copyDuplicateRule()', async(() => {
    const url = 'test copyDuplicateRuleUrl';
    const params = {} as CoreSchemaBrInfo;
    // mock url
    endpointServiceSpy.copyDuplicate.and.returnValue(url);
    // making mock data
    const mockResponse = {};

    // actual service call
    schemaService.copyDuplicateRule(params).subscribe((actualData) => {
      expect(actualData).toEqual({} as CoreSchemaBrInfo);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

  it('getSchemaExecutionTree(), should call http get to get execution tree details', async(() => {
    const schemaId = '1452462152';
    const moduleId = '1597845';
    const variantId = '123344';
    const plantCode = '123445';
    const userId = '123';
    const requestStatus = 'error';

    const url = 'test getSchemaExecutionTree';
    endpointServiceSpy.getSchemaExecutionTree.and.returnValue(url);

    const httpMockData = new SchemaExecutionTree();
    schemaService
      .getSchemaExecutionTree(moduleId, schemaId, variantId, plantCode, userId, requestStatus, ['87687687785'])
      .subscribe((data) => {
        expect(data).toEqual(httpMockData);
      });

    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(httpMockData);

    httpTestingController.verify();
  }));

  it('getSchemaExecutionTreeV2(), should call http get to get execution tree details', async(() => {
    const schemaId = '1452462152';
    const moduleId = '1597845';
    const variantId = '123344';
    const plantCode = '123445';
    const userId = '123';
    const requestStatus = 'error';

    const url = 'test getSchemaExecutionTreeV2';
    endpointServiceSpy.getSchemaExecutionTreeV2.and.returnValue(url);

    const httpMockData = new SchemaExecutionTree();
    schemaService
      .getSchemaExecutionTreeV2(moduleId, schemaId, variantId, plantCode, userId, requestStatus, ['87687687785'], [])
      .subscribe((data) => {
        expect(data).toEqual(httpMockData);
      });

    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(httpMockData);

    httpTestingController.verify();
  }));

  it('getModuleInfoByModuleId(), should call http get to get module info', async(() => {
    const moduleId = '1597845';

    const url = 'test getModuleInfoByModuleIdUrl';
    endpointServiceSpy.getModuleInfoByModuleIdUrl.and.returnValue(url);

    const httpMockData = [];
    schemaService.getModuleInfoByModuleId(moduleId).subscribe((data) => {
      expect(data).toEqual(httpMockData);
    });

    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(httpMockData);

    httpTestingController.verify();
  }));

  it('downloadExecutionDetailsByNodes()', async(() => {
    const url = 'test downloadExecutionDetailsByNodesUrl';
    endpointClassicServiceSpy.downloadExecutionDetailsByNodesUrl.and.returnValue(url);

    const httpMockData = {
      message: 'success',
    };
    schemaService.downloadExecutionDetailsByNodes('1701', 'error', ['header'], '0').subscribe((data) => {
      expect(data).toEqual(httpMockData);
    });

    const httpReq = httpTestingController.expectOne(url);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(httpMockData);

    httpTestingController.verify();
  }));

  it('getBuisnessRulesBasedOnRun() get the rules based on last run', async(() => {
    const url = 'test getBuisnessRulesBasedOnRun';
    endpointServiceSpy.getBuisnessRulesBasedOnRunUrl.and.returnValue(url);

    const httpMockData = [
      {
        brIdStr: '767575758',
        brInfo: 'Rule 1',
      } as CoreSchemaBrInfo,
    ];
    schemaService.getBuisnessRulesBasedOnRun('7575757', '').subscribe((data) => {
      expect(data).toEqual(httpMockData);
    });

    const httpReq = httpTestingController.expectOne(`${url}?schemaId=7575757`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(httpMockData);

    httpTestingController.verify();
  }));

  it('cancleSchema() cancle schema ', async(() => {
    const url = 'test cancle schema ';
    endpointServiceSpy.cancleSchemaUri.and.returnValue(url);
    const httpMockData = { acknowledge: true };
    schemaService.cancleSchema('7575757').subscribe((data) => {
      expect(data).toEqual(httpMockData);
    });

    const httpReq = httpTestingController.expectOne(`${url}?schemaId=7575757`);
    expect(httpReq.request.method).toEqual('GET');
    httpReq.flush(httpMockData);

    httpTestingController.verify();
  }));

  it('transformationRules(), get the transformation rules lib.. ', async(() => {
    const url = 'test transformation rule lib ';
    endpointServiceSpy.transformationRules.and.returnValue(url);
    const httpMockData: CoreSchemaBrInfo[] = [{} as CoreSchemaBrInfo];
    schemaService.transformationRules('1005', 0, 10, '').subscribe((data) => {
      expect(data).toEqual(httpMockData);
    });

    const httpReq = httpTestingController.expectOne(`${url}?moduleId=1005`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(httpMockData);

    httpTestingController.verify();
  }));

  it('getMappedTransformationRules(), get the trans.. attached in the main rule  ', async(() => {
    const url = 'test transformation rule attached ';
    endpointServiceSpy.getMappedTransformationRulesUrl.and.returnValue(url);
    const httpMockData: TransformationMappingResponse = {} as TransformationMappingResponse;
    schemaService.getMappedTransformationRules('7677867', '98767677', 0, 10, '').subscribe((data) => {
      expect(data).toEqual(httpMockData);
    });

    const httpReq = httpTestingController.expectOne(`${url}?ruleId=7677867&schemaId=98767677`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(httpMockData);

    httpTestingController.verify();
  }));

  it('should getSchemaGlobalCounts', () => {
    const url = 'getSchemaGlobalCounts';
    const response = {
      successCount: 32,
      errorCount: 0,
      skippedCount: 0,
    };

    const schemaId = '7944828395059';

    endpointServiceSpy.getSchemaGlobalCounts.and.returnValue(url);

    schemaService.getSchemaGlobalCounts(schemaId).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?schemaId=${schemaId}`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(response);
    httpTestingController.verify();
  });

  it('should getApisRule', () => {
    const url = 'getApisRule test';

    const apisRules: ApiRulesInfo[] = [{
      description:'Api 1', sno:'8767757'
    }];

    endpointClassicServiceSpy.getApisRulesUrl.and.returnValue(url);

    schemaService.getApisRule('72735','',0,10,'756756').subscribe((result) => {
      expect(result).toEqual(apisRules);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?moduleId=72735&searchString=&from=0&size=10&prefer=756756`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(apisRules);
    httpTestingController.verify();
  });

  it('should createUpdateBr()', async(() => {
    const url = 'test createUpdateBr';
    const udr = new CoreSchemaBrInfo();
    // mock url
    endpointServiceSpy.createUpdateBr.and.returnValue(url);
    // making mock data
    const mockResponse = 'id1';

    // actual service call
    schemaService.saveUpdateUDR(udr).subscribe((actualData) => {
      expect(actualData).toEqual(mockResponse);
    });
    // mocking http
    const httpReq = httpTestingController.expectOne(`${url}`);
    expect(httpReq.request.method).toEqual('POST');
    httpReq.flush(mockResponse);
    // verify http
    httpTestingController.verify();
  }));

});
