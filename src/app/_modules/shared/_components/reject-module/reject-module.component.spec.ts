import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectModuleComponent } from './reject-module.component';

describe('RejectModuleComponent', () => {
  let component: RejectModuleComponent;
  let fixture: ComponentFixture<RejectModuleComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectModuleComponent ],
      imports: [HttpClientTestingModule, AppMaterialModuleForSpec],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, 
        { provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
