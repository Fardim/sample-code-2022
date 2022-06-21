import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { CpiDataScopeComponent } from './cpi-data-scope.component';

describe('CpiDataScopeComponent', () => {
  let component: CpiDataScopeComponent;
  let fixture: ComponentFixture<CpiDataScopeComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpiDataScopeComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {segmentMappings: [], conditions: []} },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpiDataScopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
