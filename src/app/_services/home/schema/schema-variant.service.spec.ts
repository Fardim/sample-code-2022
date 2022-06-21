import { TestBed, async } from '@angular/core/testing';

import { SchemaVariantService } from './schema-variant.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Any2tsService } from '../../any2ts.service';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';

describe('SchemaVariantService', () => {
  let httpTestingController: HttpTestingController;
  let schemaVariantService: SchemaVariantService;
  // let any2tsServiceSpy: jasmine.SpyObj<Any2tsService>;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsRuleService>;
  beforeEach(async(() => {
    const any2TsSpy = jasmine.createSpyObj('Any2tsService', ['any2SchemaVariantResponse']);
    const endpointSpy = jasmine.createSpyObj('EndpointsRuleService', ['schemaVarinatDetails', 'getVariantdetailsByvariantIdUrl',
        'deleteVariantUrl', 'saveUpdateVariantUrl', 'getSchemaVariantsUrl', 'getAllDataScopesUri', 'getAllDataScopeUrl']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        SchemaVariantService,
        { provide: Any2tsService, useValue: any2TsSpy },
        { provide: EndpointsRuleService, useValue: endpointSpy },
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    schemaVariantService = TestBed.inject(SchemaVariantService);
    // any2tsServiceSpy = TestBed.inject(Any2tsService) as jasmine.SpyObj<Any2tsService>;
    endpointServiceSpy = TestBed.inject(EndpointsRuleService) as jasmine.SpyObj<EndpointsRuleService>;
  }));

  it('should be created', () => {
    const service: SchemaVariantService = TestBed.inject(SchemaVariantService);
    expect(service).toBeTruthy();
  });



  it('getVariantdetailsByvariantId(): should call', () =>{
    const url = 'get all variant details of variant';
    const variantId = '7676567575';
    const userName = 'harshit';
    const plantCode = '0';
    const roleId = 'AD';
    // mock url
    endpointServiceSpy.getVariantdetailsByvariantIdUrl.withArgs(variantId).and.returnValue(url);

    // mock data
    const mockData = {} as any;
    // actual call
    schemaVariantService.getVariantdetailsByvariantId(variantId, roleId, plantCode, userName).subscribe(actualData => {
      expect(actualData).toEqual(mockData);
    });
    // mock http
    const mockRequest = httpTestingController.expectOne(`${url}?plantCode=${plantCode}&roleId=${roleId}&userName=${userName}`);
    expect(mockRequest.request.method).toEqual('GET');
    expect(mockRequest.request.responseType).toEqual('json');
    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  });

  it('deleteVariant(): should call', () =>{
    const url = 'delete variant details';
    // mock url
    endpointServiceSpy.deleteVariantUrl.and.returnValue(url);

    // mock data
    const mockData = true;
    // actual call
    const variantId = '7676567575';
    schemaVariantService.deleteVariant(variantId).subscribe(actualData => {
      expect(actualData).toEqual(mockData);
    });
    // mock http
    const mockRequest = httpTestingController.expectOne(url);
    expect(mockRequest.request.method).toEqual('DELETE');
    expect(mockRequest.request.responseType).toEqual('json');
    // verify http
    httpTestingController.verify();
  });

  it('saveUpdateSchemaVariant(): should call', () =>{
    const url = 'create and update single details';
    // mock url
    endpointServiceSpy.saveUpdateVariantUrl.and.returnValue(url);

    // mock data
    const mockData = {} as any;
    // actual call
    const request = {} as any;
    schemaVariantService.saveUpdateSchemaVariant(request).subscribe(actualData => {
      expect(actualData).toEqual(mockData);
    });
    // mock http
    const mockRequest = httpTestingController.expectOne(url);
    expect(mockRequest.request.method).toEqual('POST');
    expect(mockRequest.request.responseType).toEqual('json');
    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  });

  it('getSchemaVariantDetails(): should call', () =>{
    const url = 'getSchemaVariantsUrl';
    const schemaId = 'schema1';
    // mock url
    endpointServiceSpy.getSchemaVariantsUrl.withArgs(schemaId).and.returnValue(url);

    // mock data
    const mockData = [];
    // actual call
    schemaVariantService.getSchemaVariantDetails(schemaId).subscribe(actualData => {
      expect(actualData).toEqual(mockData);
    });
    // mock http
    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('GET');

    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  });

  it('getAllDataScopeList(): should call', () =>{
    const url = 'getAllDataScopeUrl';
    // mock url
    endpointServiceSpy.getAllDataScopeUrl.and.returnValue(url);

    // mock data
    const mockData = [];
    // actual call
    schemaVariantService.getAllDataScopeList('schema1', '').subscribe(actualData => {
      expect(actualData).toEqual(mockData);
    });
    // mock http
    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('GET');

    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  });

  it('getDataScope(): should call', () =>{
    const url = 'getAllDataScopesUri';
    // mock url
    endpointServiceSpy.getAllDataScopesUri.and.returnValue(url);

    // mock data
    const mockData = [];
    // actual call
    schemaVariantService.getDataScope('schema1', '').subscribe(actualData => {
      expect(actualData).toEqual(mockData);
    });
    // mock http
    const mockRequest = httpTestingController.expectOne(`${url}`);
    expect(mockRequest.request.method).toEqual('GET');

    mockRequest.flush(mockData);
    // verify http
    httpTestingController.verify();
  });

});
