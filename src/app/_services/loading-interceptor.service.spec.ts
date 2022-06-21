import { TestBed, inject } from '@angular/core/testing';
import { LoadingInterceptorService } from './loading-interceptor.service';
import { LoadingService } from './loading.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { EventEmitter } from '@angular/core';

describe('LoadingInterceptorService', () => {
  let loadingSvc: jasmine.SpyObj<LoadingService>;
  let httpClient: HttpClient;

  beforeEach(() => {
    const loadingSvcSpy = jasmine.createSpyObj('LoadingService', ['isLoading']);
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: LoadingService, useValue: loadingSvcSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoadingInterceptorService,
          multi: true,
        },
      ]
    });

    loadingSvc = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', inject([LoadingInterceptorService], (service: LoadingInterceptorService) => {
    expect(service).toBeTruthy();
  }));

  it('intercept should start loading', inject([LoadingInterceptorService], (service: LoadingInterceptorService) => {
    service.whiteList.push('test');
    const evtEmitter: EventEmitter<boolean> = new EventEmitter();
    spyOn(evtEmitter, 'emit');
    loadingSvc.isLoading.and.returnValue(evtEmitter)
    httpClient.get('/test').subscribe();
    // during call
    expect(evtEmitter.emit).toHaveBeenCalledWith(true);
    // after call ends // TODO check how to do unloading/loading false tests
    // expect(evtEmitter.emit).toHaveBeenCalledWith(false);
  }));
});
