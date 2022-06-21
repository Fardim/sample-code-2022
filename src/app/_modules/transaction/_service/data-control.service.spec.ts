import { TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { DataControlService } from './data-control.service';

describe('DataControlService', () => {
  let service: DataControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ AppMaterialModuleForSpec, SharedModule],
    });
    service = TestBed.inject(DataControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
