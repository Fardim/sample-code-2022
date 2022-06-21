import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EndpointsDataplayService } from '@services/_endpoints/endpoints-dataplay.service';
import { Package, PackageType } from '../_models';
import { ConnekthubService } from './connekthub.service';

describe('ConnekthubService', () => {
  let service: ConnekthubService;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsDataplayService>;
  let httpTestingController: HttpTestingController;
  const packages = [
    {
      id: '1',
      name: 'Duplicate record and golden record identification test',
      // downloads: 5,
      brief: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
      ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
      necessitatibus, laborum nobis temporibus ullam! Quia.`,
      whatsNew: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
      ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
      necessitatibus, laborum nobis temporibus ullam! Quia.`,
      tags: ['Material', 'Spares', 'AIML'],
      origin: 'Prospecta Software',
      createdDate: '29.10.2020',
      imageUrls: ['sss']
    },
    {
      id: '2',
      name: 'Duplicate record and golden record identification',
      // downloads: 5,
      brief: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
      ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
      necessitatibus, laborum nobis temporibus ullam! Quia.`,
      whatsNew: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
      ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
      necessitatibus, laborum nobis temporibus ullam! Quia.`,
      tags: ['Material', 'Spares', 'AIML'],
      origin: 'Prospecta Software',
      createdDate: '29.10.2020',
    },
    {
      id: '3',
      name: 'Duplicate record and golden record identification',
      // downloads: 5,
      brief: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
      ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
      necessitatibus, laborum nobis temporibus ullam! Quia.`,
      whatsNew: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
      ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
      necessitatibus, laborum nobis temporibus ullam! Quia.`,
      tags: ['Material', 'Spares', 'AIML'],
      origin: 'Prospecta Software',
      createdDate: '29.10.2020',
    },
  ] as Package[];

  beforeEach(() => {
    const epsSpy = jasmine.createSpyObj('EndpointsDataplayService', ['getConnekthubLogin', 'getPackages', 'getPackage', 'createPackage', 'updatePackage', 'withdraw']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ConnekthubService,
        { provide: EndpointsDataplayService, useValue: epsSpy }
      ]
    }).compileComponents();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnekthubService);
    endpointServiceSpy = TestBed.inject(EndpointsDataplayService) as jasmine.SpyObj<EndpointsDataplayService>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login()', () => {
    const testurl = 'dummy url to test';
    // mocking url
    endpointServiceSpy.getConnekthubLogin.and.returnValue(testurl);
    // mock data
    const mockhttpData = {} as any;
    // actual call
    service.login('user', 'password').subscribe(actualData => {
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();

  });

  it('getPackages()', () => {
    const testurl = 'dummy url to test';
    const packageType = PackageType.DASHBOARD;
    // mocking url
    endpointServiceSpy.getPackages.and.returnValue(testurl);
    // mock data
    const mockhttpData = packages as any;
    // actual call
    service.getPackages(packageType).subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}?search=${packageType}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();

  });

  it('getPackage()', () => {
    const testurl = 'dummy url to test';
    // mocking url
    endpointServiceSpy.getPackage.and.returnValue(testurl);
    // mock data
    const mockhttpData = new Package();
    // actual call
    service.getPackage('1234').subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();

  });

  it('getPackageFile()', () => {
    const testurl = 'dummy url to test';
    // mocking url
    endpointServiceSpy.getPackage.and.returnValue(testurl);
    // mock data
    const mockhttpData = 'test';
    // actual call
    service.getPackageFile('1234').subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}/file`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();

  });

  // it('createPackage()', () => {
  //   const testurl = 'dummy url to test';
  //   const body = new Package();
  //   body.id = 1234;
  //   body.name = 'test';
  //   const file = new File(['test'], 'test.mdopage');
  //   // mocking url
  //   endpointServiceSpy.createPackage.and.returnValue(testurl);
  //   // mock data
  //   const mockhttpData = new Package();
  //   // actual call
  //   service.createPackage(body, file).subscribe(actualData => {
  //     expect(actualData).toEqual(mockhttpData);
  //   });
  //   // mocking http
  //   const req = httpTestingController.expectOne(`${testurl}`);
  //   expect(req.request.method).toEqual('POST');
  //   req.flush(mockhttpData);
  //   // verify http
  //   httpTestingController.verify();

  // });

  it('updatePackage()', () => {
    const testurl = 'dummy url to test';
    const body = new Package();
    body.id = '1234';
    body.name = 'test';
    const file = new File(['test'], 'test.mdopage');
    // mocking url
    endpointServiceSpy.updatePackage.and.returnValue(testurl);
    // mock data
    const mockhttpData = '1234';
    // actual call
    service.updatePackage('1234', body, file).subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();

  });

  it('withdraw()', () => {
    const testurl = 'dummy url to test';
    // mocking url
    endpointServiceSpy.withdraw.and.returnValue(testurl);
    // mock data
    const mockhttpData = new Package();
    // actual call
    service.withdraw('1234').subscribe(actualData => {
      expect(actualData).toEqual(mockhttpData);
    });
    // mocking http
    const req = httpTestingController.expectOne(`${testurl}`);
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    // verify http
    httpTestingController.verify();

  });
});
