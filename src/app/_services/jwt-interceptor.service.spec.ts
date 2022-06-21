import { TestBed, inject, tick, fakeAsync } from '@angular/core/testing';

import { JwtInterceptorService } from './jwt-interceptor.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EndpointService } from '../_services/endpoint.service';
import { HttpClientModule } from '@angular/common/http';
import { AccessDeniedDialogComponent } from '@modules/shared/_components/access-denied-dialog/access-denied-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

describe('JwtInterceptorService', () => {
  const mockMatDialog = {
    close: jasmine.createSpy('close')
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      providers: [JwtInterceptorService, EndpointService, AccessDeniedDialogComponent,
        {
          provide: MatDialog,
          useValue: mockMatDialog
        },
        {
          provide: MatDialogRef,
          useValue: mockMatDialog
        }]
    });
  });

  it('should be created', inject([JwtInterceptorService], (service: JwtInterceptorService) => {
    expect(service).toBeTruthy();
  }));

  it('callAPI(), should call notification count', fakeAsync(() => {
    const service: JwtInterceptorService = TestBed.inject(JwtInterceptorService);
    const sharedService: SharedServiceService = TestBed.inject(SharedServiceService);
    spyOn(sharedService, 'getNotificationCount');
    service.initialTotalRequests = 1;
    service.callAPI();
    tick(1000);
    expect(sharedService.getNotificationCount).toHaveBeenCalled();
  }));
});
