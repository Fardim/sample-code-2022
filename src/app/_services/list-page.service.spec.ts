import { TestBed, fakeAsync } from '@angular/core/testing';
import { ListPageService } from './list-page.service';
import { AppMaterialModuleForSpec } from '../app-material-for-spec.module';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ListDynamicPageRow } from '@models/list-page/listpage';

describe('ListPageService', () => {
  let service: ListPageService;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListPageService, HttpClientModule, HttpClientTestingModule],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, HttpClientModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    service = TestBed.inject(ListPageService)
    expect(service).toBeTruthy();
  });

  it('should call getDynamiclistcolumn()', fakeAsync(() => {
    service = TestBed.inject(ListPageService);
    const params = {
      objectId: '1005',
      lang: 'EN',
      templateId: '',
      userRole: '663065348460318692',
      username: 'DemoApp'
  };
    service.getDynamiclistcolumn(params).subscribe((response) => {
      // checking null as there can be do views as well
      expect(response).not.toBe(null)
    });

    const testurl = service.endpointService.getDynamicColumnListsUrl() +'?objectId=1005&lang=EN&templateId=&userRole=undefined&username=undefined'
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as ListDynamicPageRow[];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));

  it('should call getDynamicFiltermeta()', fakeAsync(() => {
    service = TestBed.inject(ListPageService);
    const params = {
      userId: 'DemoApp',
      plantCode: '3045',
      roleId: '663065348460318692',
      objectType: '1005',
      lang: 'en',
      clientId: '738'
  };
    service.getDynamicFiltermeta(params).subscribe((response) => {
      // checking null as there can be do views as well
      expect(response).not.toBe(null)
    });

    const testurl = service.endpointService.getDynamicFiltermetaListsUrl() +'?userId=undefined&plantCode=3045&roleId=undefined&objectType=1005&lang=en&clientId=738'
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as ListDynamicPageRow[];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();
  }));
});
