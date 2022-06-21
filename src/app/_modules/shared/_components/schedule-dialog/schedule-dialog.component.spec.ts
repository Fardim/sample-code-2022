import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ScheduleDialogComponent } from './schedule-dialog.component';
import { SchemaScheduler, SchemaSchedulerEnd, SchemaSchedulerRepeat, SchemaSchedulerRepeatMetric } from '@models/schema/schemaScheduler';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';
import { FormInputComponent } from '../form-input/form-input.component';
import { DatePickerFieldComponent } from '../date-picker-field/date-picker-field.component';
import { TitleCasePipe } from '@angular/common';
import { MdoUiLibraryModule } from 'mdo-ui-library';

const isRequired = (control: AbstractControl) => {
  const validator = control.validator({} as AbstractControl);
    if (validator && validator.required) {
      return true;
    }
    return false;
}

describe('ScheduleDialogComponent', () => {
  let component: ScheduleDialogComponent;
  let fixture: ComponentFixture<ScheduleDialogComponent>;
  let schemaService: SchemaService;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleDialogComponent, FormInputComponent, DatePickerFieldComponent ],
      imports: [
        HttpClientTestingModule,
        AppMaterialModuleForSpec,
        FormsModule,
        ReactiveFormsModule,
        MdoUiLibraryModule
      ],
      providers: [
        TitleCasePipe,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: [] },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleDialogComponent);
    component = fixture.componentInstance;
    schemaService = fixture.debugElement.injector.get(SchemaService)
    fixture.detectChanges();

    component.createForm();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setValue(), should set the form values by key', () => {
    component.setValue('isEnable', true);
    expect(component.form.controls.isEnable.value).toBeTrue();
  });

  it('setValueForFormControl(), should set values into form fields', async() => {
    const response = {
      isEnable: false
    } as SchemaScheduler;
    component.setValueForFormControl(response);
    expect(component.form.controls.isEnable.value).toEqual(false)
  })

  it('getScheduleInfo(), should call getSchedule service', () => {
    component.schemaId = '12564';
    spyOn(schemaService, 'getSchedule').and.returnValue(of(null));
    component.getScheduleInfo(component.schemaId);
    expect(schemaService.getSchedule).toHaveBeenCalledWith(component.schemaId);
  });

  it('should getMetricHours', () => {
    expect(component.getMetricHours).toEqual(SchemaSchedulerRepeatMetric.HOURLY);
    component.setValue('schemaSchedulerRepeat', SchemaSchedulerRepeat.DAILY);
    expect(component.getMetricHours).toEqual(SchemaSchedulerRepeatMetric.DAILY)
  });

  it('should submit scheduler form', () => {
    component.submit();
    expect(component.formSubmitted).toEqual(true);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('get getReferenceString', () => {
    component.createForm();
    expect(component.getReferenceString).toEqual('');

    component.setValue('end', SchemaSchedulerEnd.AFTER);
    expect(component.getReferenceString).toContain('occurrences');

    component.setValue('end', SchemaSchedulerEnd.ON);
    expect(component.getReferenceString).toContain('ending');

    component.setValue('end', SchemaSchedulerEnd.NEVER);
    expect(component.getReferenceString).toContain('Occurs every');

    component.setValue('repeatValue', 2);
    component.setValue('schemaSchedulerRepeat', '');
    expect(component.getReferenceString).toContain('2  starting');

  });

  it('should create form', () => {
    expect(component.form).toBeDefined();
  });

  it('should init component', () => {

    component.ngOnInit();
    component.setValue('schemaSchedulerRepeat', SchemaSchedulerRepeat.HOURLY);
    expect(component.form.value.repeatValue).toEqual(12);

    component.setValue('schemaSchedulerRepeat', SchemaSchedulerRepeat.DAILY);
    component.setValue('schemaSchedulerRepeat', SchemaSchedulerRepeat.WEEKLY);
    component.setValue('schemaSchedulerRepeat', SchemaSchedulerRepeat.MONTHLY);
    component.setValue('schemaSchedulerRepeat', SchemaSchedulerRepeat.YEARLY);
    expect(component.form.value.repeatValue).toEqual(2);

    component.setValue('end', SchemaSchedulerEnd.AFTER);
    expect(isRequired(component.form.controls.occurrenceVal)).toBeTrue();

    component.setValue('end', SchemaSchedulerEnd.ON);
    expect(isRequired(component.form.controls.endOn)).toBeTrue();

  });


});

