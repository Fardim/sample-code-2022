// import { async, TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { MsteamsConfigService } from './msteams-config.service';
// import { environment } from 'src/environments/environment';

// describe('MsteamsConfigService', () => {
//   let service: MsteamsConfigService;
//   let apiUrl: string;
//   let httpTestingController: HttpTestingController;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//     });
//     service = TestBed.inject(MsteamsConfigService);
//     apiUrl = environment.apiurl;
//     httpTestingController = TestBed.inject(HttpTestingController);
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   it('signIn(), should call signIn', async(() => {
//     const userName = 'testUser';
//     const password = 'testPassword'

//     expect(service.signIn(userName,password)).toBeTruthy();
//     service.signIn(userName,password).subscribe((response) => {
//       expect(response).not.toBe(null);
//     });

//     const testurl = service.authEndpointService.signIn();;

//     const req = httpTestingController.expectOne(`${testurl}?username=${userName}&password=${password}`);
//   }))

//   it('getReportUrlList(), should call report list', async(() => {
//     expect(service.getReportUrlList()).toBeTruthy();
//     service.getReportUrlList().subscribe((response) => {
//       expect(response).not.toBe(null);
//     });

//     const testurl = service.analyticsEndpointService.getReportListUrlForMsTeams()

//     const req = httpTestingController.expectOne(testurl);
//     expect(req.request.method).toEqual('GET');
//     httpTestingController.verify();
//   }))

//   it('validateToken(), should call valid toke api', async(() => {
//     service.validateToken('').subscribe((response) => {
//       expect(response).not.toBe(null)
//     });
//     const testurl = `${apiUrl}/auth/jwt/validate-refresh-token`;
//     const req = httpTestingController.expectOne(testurl);
//     expect(req.request.method).toEqual('POST');
//     httpTestingController.verify();
//   }))
// });

// const testurl = service.endpointService.getSaveTaskListURL()
//     const req = httpTestingController.expectOne(testurl);
//     expect(req.request.method).toEqual('POST');
//     httpTestingController.verify();