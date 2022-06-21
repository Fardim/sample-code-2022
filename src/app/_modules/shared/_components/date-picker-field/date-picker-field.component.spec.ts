import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MatDatepickerInputEvent } from '@angular/material/datepicker/datepicker-input-base';
import { DatePickerFieldComponent } from './date-picker-field.component';
import { SimpleChange, SimpleChanges } from '@angular/core';

describe('DatePickerFieldComponent', () => {
  let component: DatePickerFieldComponent;
  let fixture: ComponentFixture<DatePickerFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatePickerFieldComponent ],
      imports: [
        AppMaterialModuleForSpec
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatePickerFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changeStartDate(), change start date',async(()=>{
    const event = {value: new Date()} as MatDatepickerInputEvent<Date>;
    component.changeStartDate({} as MatDatepickerInputEvent<Date>);
    expect(component.startDate).toEqual(undefined);
    component.changeStartDate(event);
    const expected = Number(component.startDate);
    expect(event.value.getTime()).toEqual(expected);
  }));

  it('changeEndtDate(), change end date',async(()=>{
    const event = {value: new Date()} as MatDatepickerInputEvent<Date>;
    component.changeEndtDate({} as MatDatepickerInputEvent<Date>);
    expect(component.startDate).toEqual(undefined);
    component.changeEndtDate(event);
    const expected = Number(component.endDate);
    expect(event.value.getTime()).toEqual(expected);
  }));

  it('ngOnInit(), load pre required', async(() => {
    component.selectedStrtFld = '1596393000000';
    component.selectedEndFld = '1596393000000';
    component.preSelectedFld = '1596393000000';
    component.ngOnInit();
    const res = new Date(1596393000000);
    expect(component.conditionFieldEndValue.value).toEqual(res);
  }));

  it('ngOnchanges(), should called on change @Input decorator value', () => {
    const changes = {
      minimumValidDate: {
        currentValue: '1596393000000',
        previousValue: '159400000000',
        firstChange: false
      } as SimpleChange
    } as SimpleChanges;
    component.ngOnChanges(changes);
    const res = new Date(1596393000000)
    expect(component.minimumValidDate).toEqual(res);
  })
});
