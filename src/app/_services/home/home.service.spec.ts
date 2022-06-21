import { TestBed } from '@angular/core/testing';
import { HomeService } from './home.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';

describe('HomeService', () => {
  let service: HomeService;
  let httpTestingController;
  const notifications = [{
    id: '123456789',
    senderUid: '',
    recieversUid: [],
    recieversMail: '',
    senderMail: '',
    sendTime: '',
    headerText: '',
    contentText: '',
    msgUnread: '',
    isShortenedText: '',
    objectId: '',
    objectType: '',
    acknowledgementRequired: '',
    acknowledmentStatus: '',
    downloadLink: ''
  }]

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule, HttpClientTestingModule],
    providers: [EndpointsClassicService, HttpClientTestingModule]
  }));

  beforeEach(() => {
    service = TestBed.inject(HomeService);
    httpTestingController = TestBed.inject(HttpTestingController);
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get notification', async () => {
    service.getNotifications('Admin', 0, 10).subscribe((response: []) => {
      expect(response).not.toBe(null)
    })
    const testurl = service.endpointService.getNotificationsUrl('Admin', '0', '10')
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as [];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  });


  it('should call updateNotification', async () => {
    service.updateNotification(notifications).subscribe((response: []) => {
      expect(response).not.toBe(null)
    })
    const testurl = service.endpointService.getUpdateNotificationUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as [];
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  });

  it('should call deleteNotification', async () => {
    service.deleteNotification(['123456789']).subscribe((response: []) => {
      expect(response).not.toBe(null)
    })
    const testurl = service.endpointService.getDeleteNotificationUrl()
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as [];
    expect(req.request.method).toEqual('POST');
    req.flush(mockhttpData);
    httpTestingController.verify();
  });

  it('should call getJobQueue', async () => {
    service.getJobQueue('Admin','0').subscribe((response: []) => {
      expect(response).not.toBe(null)
    })
    const testurl = service.endpointService.getJobQueueUrl('Admin','0')
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as [];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  });

  it('should call getJobQueue', async () => {
    service.getNotificationCount('Admin').subscribe((response: []) => {
      expect(response).not.toBe(null)
    })
    const testurl = service.endpointService.getNotificationsCount('Admin')
    const req = httpTestingController.expectOne(testurl);
    const mockhttpData = [] as [];
    expect(req.request.method).toEqual('GET');
    req.flush(mockhttpData);
    httpTestingController.verify();
  });
});
