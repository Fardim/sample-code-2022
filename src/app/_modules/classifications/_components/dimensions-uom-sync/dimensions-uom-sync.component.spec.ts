import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DimensionsUomSyncComponent } from './dimensions-uom-sync.component';

describe('DimensionUomSyncComponent', () => {
  let component: DimensionsUomSyncComponent;
  let fixture: ComponentFixture<DimensionsUomSyncComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DimensionsUomSyncComponent ],
      imports:[ReactiveFormsModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, { provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionsUomSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close(), should close the dialog', async(() => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  }));
});
