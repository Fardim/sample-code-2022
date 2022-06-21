import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SystemTrayComponent } from './system-tray.component';
import { Userdetails } from '@models/userdetails';
import { CustomNotification } from '@models/customNotification';

describe('SystemTrayComponent', () => {
  let component: SystemTrayComponent;
  let fixture: ComponentFixture<SystemTrayComponent>;
  let userSpy;
  let notificationSpy;
  let updateNotiticationSpy;
  let deleteNotificationSpy;
  let jobqueueSpy;
  let router: Router;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SystemTrayComponent],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule]
    })
      .compileComponents();
      router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemTrayComponent);
    component = fixture.componentInstance;
    userSpy = spyOn(component.userService, 'getUserDetails').and.callFake(() => {
      return of({
        firstName: '',
        lastName: '',
        currentRoleId: '',
        fullName: '',
        plantCode: '',
        userName: '',
        dateformat: '',
        email: '',
        assignedRoles: [],
        selfServiceUserModel: null,
        defLocs: []
      })
    });
    notificationSpy = spyOn(component.homeService, 'getNotifications').and.callFake(() => {
      return of([])
    });

    updateNotiticationSpy = spyOn(component.homeService, 'updateNotification').and.callFake(() => {
      return of({
        id: '1',
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
        downloadLink: 'abcd'
      })
    })

    deleteNotificationSpy = spyOn(component.globalDialogService, 'confirm').and.callFake(() => {
      return of([])
    });

    jobqueueSpy = spyOn(component.homeService, 'getJobQueue').and.callFake(() => {
      return of([
        {
          jobPk: {
            jobId: '',
            status: '',
          },
          initiatedBy: 'Admin',
          processType: '',
          startDate: '',
          endDate: '',
          logMessage: '',
          plantCode: '',
        }
      ])
    })
    component.userDetails = {
      firstName: '',
      lastName: '',
      currentRoleId: '',
      fullName: '',
      plantCode: '',
      userName: '',
      dateformat: '',
      email: '',
      assignedRoles: []
    } as Userdetails;
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(userSpy).toHaveBeenCalled();
    expect(notificationSpy).toHaveBeenCalled();

    component.userDetails = null;
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  });

  it('should call updateNotification', async () => {
    const notification = {
      id: '',
      senderUid: 'Admin',
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
    }
    component.updateNotification(notification);
    expect(notification.msgUnread).toBe('1');
    expect(updateNotiticationSpy).toHaveBeenCalled();
  });

  it('should call paginateNotification', async () => {
    component.notificationPagination.from = 0;
    component.notificationPagination.to = 0;
    component.paginateNotification();
    expect(notificationSpy).toHaveBeenCalled();
  });

  it('should call paginateJobs', async () => {
    spyOn(component,'getJobsQueue');
    component.jobsPagination.fetchCount = 0;
    component.jobsPagination.fetchSize = 0;
    component.paginateJobs();
    expect(component.getJobsQueue).toHaveBeenCalledWith(false);
  });

  it('should delete notification', async () => {
    component.deleteNotification('1');
    expect(component.jobQueueData.length).toEqual(0)
    expect(deleteNotificationSpy).toHaveBeenCalled();
  });

  it('should call jobqueue, get jobs list if not data', async () => {
    spyOn(component.homeService,'getJobs').and.returnValue(of([]));
    component.getJobsQueue(true);
    expect(component.homeService.getJobs).toHaveBeenCalled();
    expect(component.jobsPagination.fetchCount).toEqual(0);
    expect(component.jobQueueData).toEqual([]);
    expect(component.loader).toEqual(false);
  });

  it('should call jobqueue, get jobs list if data', async () => {
    const mockJobObj = {
      jobId: '123',
      jobName: 'test',
      status: 'running',
      userName: 'testUser'
    };
    const mockedObj = Object.assign(mockJobObj, {
      endTime: '-',
      startTime: '-',
      enableCancel: true
    });
    spyOn(component.homeService,'getJobs').and.returnValue(of([mockJobObj]));
    component.getJobsQueue();
    expect(component.homeService.getJobs).toHaveBeenCalled();
    expect(component.jobQueueData).toEqual([mockedObj]);
    expect(component.jobQueueData.length).toEqual(1);
    expect(component.totalCount).toEqual(1);
    expect(component.loader).toEqual(false);
  });

  it('close(), should close the current router' , () => {
    spyOn(router, 'navigate');
    component.close();
    expect(component.close).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null }}], {
      queryParamsHandling: 'preserve'
    });
  });

  it('should trackByFn', () => {
    expect(component.trackByFn(1, { headerText: 'test 1 running for shahnshah module test 1 ',
    id: '349710404638900102'} as CustomNotification)).toEqual('349710404638900102');
  });

  // it('indexChange(), should call notification or jobQueue based on index', () => {
  //   component.indexChange(0);
  //   expect(notificationSpy).toHaveBeenCalled();

  //   component.indexChange(1);
  //   expect(jobqueueSpy).toHaveBeenCalled();
  // });
});
