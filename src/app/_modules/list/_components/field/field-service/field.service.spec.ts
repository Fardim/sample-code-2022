import { HttpClientModule } from '@angular/common/http';
import { CoreService } from '@services/core/core.service';
import { TestBed } from '@angular/core/testing';

import { FieldService } from './field.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('FieldService', () => {
  let service: FieldService;
  let coreService: CoreService;

  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('CoreService', ['getListParentFields']);
    TestBed.configureTestingModule({
      providers: [{ provide: CoreService, useValue: endpointSpy }],
      imports: [HttpClientModule, RouterTestingModule]
    });
    coreService = TestBed.inject(CoreService);
    service = TestBed.inject(FieldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
