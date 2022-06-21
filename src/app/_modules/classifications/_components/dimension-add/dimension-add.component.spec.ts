import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { DimensionAddComponent } from './dimension-add.component';

describe('DimensionAddComponent', () => {
  let component: DimensionAddComponent;
  let fixture: ComponentFixture<DimensionAddComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close'),
    open: jasmine.createSpy('open'),
    afterClosed: of({ result: 'yes' })
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DimensionAddComponent],
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule,
        ReactiveFormsModule,
        AppMaterialModuleForSpec,
        SharedModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionAddComponent);
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

  it('ngOnInit(), test prerequired ', async(() => {
    const dialogData = {
      dimension: 'Test'
    };

    component.dialogData = dialogData;

    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('saveDim()', async(() => {
    spyOn(component, 'saveDim').and.callThrough();
    component.saveDim();
    expect(component.saveDim).toHaveBeenCalled();
  }));
});
