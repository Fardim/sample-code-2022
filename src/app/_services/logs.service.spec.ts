import { TestBed } from '@angular/core/testing';
import { LogsService } from './logs.service';
import { AppMaterialModuleForSpec } from '../app-material-for-spec.module';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LogsService', () => {
  let service: LogsService;
  // let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogsService, HttpClientModule, HttpClientTestingModule],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, HttpClientModule],
    });
    // httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    service = TestBed.inject(LogsService)
    expect(service).toBeTruthy();
  });

});
