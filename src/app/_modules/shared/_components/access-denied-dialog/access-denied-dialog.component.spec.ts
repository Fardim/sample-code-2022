import { async, TestBed, ComponentFixture } from '@angular/core/testing';

import { AccessDeniedDialogComponent } from './access-denied-dialog.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

describe('AccessDeniedDialogComponent', () => {
  let component: AccessDeniedDialogComponent;
  let fixture: ComponentFixture<AccessDeniedDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close'),
    open: jasmine.createSpy('open')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccessDeniedDialogComponent],
      imports: [
        AppMaterialModuleForSpec
      ],
      providers: [
        {
          provide: MatDialog,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: {}
        },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessDeniedDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('open(), open dialog', async(() => {
    component.open();
    expect(mockDialogRef.open).toHaveBeenCalled();
  }));

  it('close(), close dialog', async(() => {
    component.dialogRef = mockDialogRef as any;
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  }));
});
