import { TestBed, async } from '@angular/core/testing';

import { SchemalistService } from './schemalist.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Any2tsService } from '../../any2ts.service';
import { SchemaListModuleList, SchemaListDetails } from 'src/app/_models/schema/schemalist';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';

describe('SchemalistService', () => {
  let schemalistService: SchemalistService;
  let httpTestingController: HttpTestingController;
  let any2tsServiceSpy: jasmine.SpyObj<Any2tsService>;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsRuleService>;
  beforeEach(() => {
    const any2tsSpy = jasmine.createSpyObj('Any2tsService', ['any2SchemaListView', 'any2SchemaDetailsWithCount']);
    const endpointSpy = jasmine.createSpyObj('EndpointsRuleService', ['getSchemaListByGroupIdUrl', 'getSchemaDetailsBySchemaIdUrl']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SchemalistService,
        { provide: Any2tsService, useValue: any2tsSpy },
        { provide: EndpointsRuleService, useValue: endpointSpy }
      ]
    }).compileComponents();
    schemalistService = TestBed.inject(SchemalistService);
    httpTestingController = TestBed.inject(HttpTestingController);
    any2tsServiceSpy = TestBed.inject(Any2tsService) as jasmine.SpyObj<Any2tsService>;
    endpointServiceSpy = TestBed.inject(EndpointsRuleService) as jasmine.SpyObj<EndpointsRuleService>;
  });

  it('should be created', () => {
    expect(schemalistService).toBeTruthy();
  });

  it('getSchemaList(): get schema list', async(() => {
    const url = 'get schema list url';
    // mock url
    endpointServiceSpy.getSchemaListByGroupIdUrl.and.returnValue(url);
    // mock data
    const expectedData: SchemaListModuleList[] = [];
    expectedData.push(new SchemaListModuleList());
    expectedData.push(new SchemaListModuleList());

    // actual service call
    schemalistService.getSchemaList().subscribe(actualResponse => {
      expect(actualResponse).toEqual(expectedData);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(expectedData);
    // verify http
    httpTestingController.verify();
  }));

  it('getSchemaDetailsBySchemaId(): will be return schema details with latest run', async () => {
    const url = 'get schema by schema id url';
    const schemaId = '837645763957';
    // mock url
    endpointServiceSpy.getSchemaDetailsBySchemaIdUrl.withArgs(schemaId).and.returnValue(url);
    // mock data
    const mockData = {} as any;
    const expectedData: SchemaListDetails = new SchemaListDetails();
    // mock any2Ts
    any2tsServiceSpy.any2SchemaDetailsWithCount.withArgs(mockData).and.returnValue(expectedData);
    // actual service call
    schemalistService.getSchemaDetailsBySchemaId(schemaId).subscribe(actualResponse => {
      expect(actualResponse).toEqual(expectedData);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(url);
    expect(mockRequst.request.method).toEqual('GET');
    mockRequst.flush(mockData);
    // verify http
    httpTestingController.verify();
  });

});

