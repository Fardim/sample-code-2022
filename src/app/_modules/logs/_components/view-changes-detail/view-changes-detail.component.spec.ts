import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ViewChangesDetailComponent } from './view-changes-detail.component';

describe('ViewChangesDetailComponent', () => {
  let component: ViewChangesDetailComponent;
  let fixture: ComponentFixture<ViewChangesDetailComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewChangesDetailComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { actionType: 'deleted' } },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewChangesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('title(), return corresponding value', () => {
    const result = component.title;
    expect(result).toEqual('deleted changes');

    component.data = {
      actionType: 'created'
    };
    const resultC = component.title;
    expect(resultC).toEqual('creation');

    component.data = {};
    const resultE = component.title;
    expect(resultE).toEqual('');
  });

  it('closeDialog() should close the dialog', async(() => {
    component.closeDialog();
    expect(component.closeDialog).toBeTruthy();
  }));
});
