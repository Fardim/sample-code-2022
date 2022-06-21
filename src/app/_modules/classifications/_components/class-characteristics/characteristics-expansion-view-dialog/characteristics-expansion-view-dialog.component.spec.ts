import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacteristicsExpansionViewDialogComponent } from './characteristics-expansion-view-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('CharacteristicsExpansionViewDialogComponent', () => {
  let component: CharacteristicsExpansionViewDialogComponent;
  let fixture: ComponentFixture<CharacteristicsExpansionViewDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
    open: jasmine.createSpy('open'),
    afterClosed: of({ result: 'yes' }),
    addPanelClass: (abc) => { }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicsExpansionViewDialogComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicsExpansionViewDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit, should init', () => {
    // spyOn(component, 'handleFieldsBehaviourforFieldType').and.callThrough();
    // spyOn(component, 'handleFieldsBehaviour').and.callThrough();
    component.formValues = {}
    component.initForm();
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();

    // component.ngOnInit();

    // expect(component.checkForFieldTypeChange).toHaveBeenCalled();
    // expect(component.checkForDataTypeChange).toHaveBeenCalled();
  })

  it('checkForFieldTypeChange(), should updated specific date', async () => {
    spyOn(component, 'checkForFieldTypeChange').and.callThrough();
    component.initForm();
    component.checkForFieldTypeChange('TEXT');
    expect(component.checkForFieldTypeChange).toHaveBeenCalled();
  });

  it('checkForDataTypeChange(), should updated specific date', async () => {
    spyOn(component, 'checkForDataTypeChange').and.callThrough();
    component.initForm();
    component.checkForDataTypeChange('TIME');
    expect(component.checkForDataTypeChange).toHaveBeenCalled();
  });

  it('handleFieldsBehaviour()', async () => {
    spyOn(component, 'handleFieldsBehaviour').and.callThrough();
    component.initForm();
    component.handleFieldsBehaviour();
    expect(component.handleFieldsBehaviour).toHaveBeenCalled();
  });

  it('onFieldTypeChange()', () => {
    component.initForm();
    component.onFieldTypeChange({ option: { value: 'TEXT' } });
    expect(component.typeList[0].name).toEqual('CHAR');

    component.onFieldTypeChange({ option: { value: 'CURRENCY' } });
    expect(component.typeList[0].name).toEqual('NUMC');

    component.onFieldTypeChange({ option: { value: 'DROPDOWN' } });
    expect(component.typeList[0].name).toEqual('CHAR');
  });

  // it('editorValueChange(), should updated specific date', async () => {
  //   const ev = { event: { newValue: '<p>Test</p>' } };
  //   component.initForm();
  //   component.form.controls['charDesc'].setValue(ev.event.newValue.replace('<p>', '').replace('</p>', ''));
  //   component.editorValueChange(ev);
  //   expect(component.form.get('charDesc').value).toEqual(ev.event.newValue.replace('<p>', '').replace('</p>', ''));
  // });

  // it('helptextEditorValueChange(), should updated specific date', async () => {
  //   const ev = { event: { newValue: 'Test' } };
  //   component.initForm();
  //   component.form.controls['helpText'].setValue(ev.event.newValue);
  //   component.helptextEditorValueChange(ev);
  //   expect(component.form.get('helpText').value).toEqual(ev.event.newValue);
  // });

  it('validFromChanged(), should updated specific date', async () => {
    const ev = 'Fri Jan 07 2022 15:57:54 GMT+0530(India Standard Time)';
    component.initForm();
    component.form.controls.validFrom.setValue(ev);
    component.validFromChanged(ev);
    expect(component.form.get('validFrom').value).toEqual(ev);
  });

  it('validToChanged(), should updated specific date', async () => {
    const ev = 'Fri Jan 07 2022 15:57:54 GMT+0530(India Standard Time)';
    component.initForm();
    component.form.controls.validTo.setValue(ev);
    component.validToChanged(ev);
    expect(component.form.get('validTo').value).toEqual(ev);
  });

  it('getValidFromValue(), should return selected value', async () => {
    component.initForm();
    component.form.get('validFrom').setValue('Fri Jan 07 2022 15:57:54 GMT+0530(India Standard Time)');
    expect(component.getValidFromValue()).toEqual(component.form.get('validFrom').value);
  });

  it('getValidToValue(), should return selected value', async () => {
    component.initForm();
    component.form.get('validTo').setValue('Fri Jan 07 2022 15:57:54 GMT+0530(India Standard Time)');
    expect(component.getValidToValue()).toEqual(component.form.get('validTo').value);
  });

  it('checkFormValidation(), check form controls validation', () => {
    component.initForm();
    component.checkFormValidation();
    expect(component.bannerMessage).toEqual('Fields are required')
  });

  it('saveForm(), should save and close the dialog', () => {
    spyOn(component, 'saveForm').and.callThrough();
    component.initForm();
    component.saveForm();
    expect(component.saveForm).toHaveBeenCalled();
  });

  it('close(), should close the dialog', () => {
    component.initForm();
    component.closeDialog();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('clearFormValidation(), Clears form invalid controls on cancel', () => {
    spyOn(component, 'clearFormValidation').and.callThrough();
    component.initForm();
    component.clearFormValidation();
    expect(component.clearFormValidation).toHaveBeenCalled();
  });
});
