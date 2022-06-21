
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppMaterialModuleForSpec } from '../app-material-for-spec.module';

import { GlobaldialogService } from './globaldialog.service';

describe('GlobaldialogService', () => {
  let service: GlobaldialogService;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        AppMaterialModuleForSpec
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        { provide: MAT_DIALOG_DATA, useValue: {}
        },
        MatDialog
      ]
    });
    service = TestBed.inject(GlobaldialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
