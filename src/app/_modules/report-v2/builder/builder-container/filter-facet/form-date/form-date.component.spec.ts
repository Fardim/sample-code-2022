import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDateComponent } from './form-date.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SimpleChanges } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { FormControl } from '@angular/forms';

describe('FormDateComponent', () => {
  let component: FormDateComponent;
  let fixture: ComponentFixture<FormDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormDateComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, MdoUiLibraryModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges()', async()=>{
    const changes = {
        selectedDate:{
            currentValue: {value:{start: new Date('9 Aug, 2021'),end: new Date('10 Aug, 2021')},type:'yesterday'},
            previousValue: {value:{start: new Date('10 Aug, 2021'),end: new Date('16 Aug, 2021')},type:'Last_2_Month'},
            firstChange: false,
            isFirstChange() { return null }
        }
    } as SimpleChanges;

    component.ngOnChanges(changes);
    expect(component.currentPickerType).toEqual('Day');

    const changes3 = {
      selectedDate:{
          currentValue: {value:{start: new Date('9 Aug, 2021'),end: new Date('10 Aug, 2021')},type:'date_range'},
          previousValue: {value:{start: new Date('9 Aug, 2021'),end: new Date('16 Aug, 2021')}},
          firstChange: false,
          isFirstChange() { return null }
      }
    } as SimpleChanges;

    component.ngOnChanges(changes3);
    expect(component.currentPickerType).toEqual('Date Range');

    const changes4 = {
      selectedDate:{
          currentValue: {value:{start: new Date('9 Aug, 2021').toString(),end: new Date('9 Aug, 2021').toString()},type:'sp_date'},
          previousValue: {value:{start: new Date('9 Aug, 2021'),end: new Date('16 Aug, 2021')}},
          firstChange: false,
          isFirstChange() { return null }
      }
    } as SimpleChanges;

    component.ngOnChanges(changes4);
    expect(component.currentPickerType).toEqual('Specific Date');

    const changes2 = {
      selectedDate:{
          currentValue: {value:{start: new Date('9 Aug, 2021'),end: new Date('10 Aug, 2021')},type:'Last_Week'},
          previousValue: {value:{start: new Date('9 Aug, 2021'),end: new Date('16 Aug, 2021')},type:'Last_2_Month'},
          firstChange: false,
          isFirstChange() { return null }
      }
  } as SimpleChanges;

  component.ngOnChanges(changes2);
  expect(component.currentPickerType).toEqual('Week');
  });

  it('updateDatePickerType(),updates date picker type', async()=>{
    component.selectedDateOption = 'Last_Week';
    component.updateDatePickerType('Week');
    expect(component.pickerCtrl.value).toEqual('Last_Week');

    component.dateRangeValue = { start: new Date(),end: new Date()}
    component.updateDatePickerType('Date Range');
    expect(component.dateRangeValue.start).toEqual(null);

    component.dateValue = new Date();
    component.updateDatePickerType('Specific Date');
    expect(component.dateValue).toEqual(null);
  });

  it('dateChanged(), should updated specific date', async()=>{
    const ev = 'Wed Aug 18 2021 00:00:00 GMT+0530 (India Standard Time)';
    component.currentPickerType = 'Specific Date';
    component.dateChanged(ev);
    expect(component.dateCtrl.value.start).toEqual(ev);
  });

  it('dateRangeChanged(), should updated range date', async()=>{
    const ev = {start:'Wed Aug 18 2021 00:00:00 GMT+0530 (India Standard Time)',end:'Wed Aug 18 2021 12:00:00 GMT+0530 (India Standard Time)'};
    component.currentPickerType = 'Date Range';
    component.dateRangeChanged(ev);
    expect(component.dateCtrl.value.start).toEqual(ev.start);
  });

  it('updateFilterValue(),updated filter values to filter criteria in appropriate format', async()=>{
    const ev = 'Last_2_Quarter';
    component.currentPickerType = 'Quarter';
    component.updateFilterValue(ev);
    expect(component.pickerCtrl.value).toEqual('Last_2_Quarter');

    const ev1 = 'Last_2_Year';
    component.currentPickerType = 'Year';
    component.updateFilterValue(ev1);
    expect(component.pickerCtrl.value).toEqual('Last_2_Year');

    const ev2 = 'Last_2_Day';
    component.currentPickerType = 'Day';
    component.updateFilterValue(ev2);
    expect(component.pickerCtrl.value).toEqual('Last_2_Day');

    const ev3 = 'Last_2_Month';
    component.currentPickerType = 'Month';
    component.updateFilterValue(ev3);
    expect(component.pickerCtrl.value).toEqual('Last_2_Month');

    const ev4= 'Last_2_Week';
    component.currentPickerType = 'Week';
    component.updateFilterValue(ev4);
    expect(component.pickerCtrl.value).toEqual('Last_2_Week');
  });

  it('getSelectedValue(), should return selected value', async()=>{
    component.currentPickerType = 'Date Range';
    component.dateCtrl = new FormControl();
    component.dateCtrl.setValue({start:'Wed Aug 18 2021 00:00:00 GMT+0530 (India Standard Time)',end:'Wed Aug 18 2021 12:00:00 GMT+0530 (India Standard Time)'});
    expect(component.getSelectedValue()).toEqual(component.dateCtrl.value);

    component.currentPickerType = 'Specific Date';
    expect(component.getSelectedValue()).toEqual(component.dateCtrl.value.start);
  });

  it('applyFilter(), method to emit value change', async()=>{
    component.pickerCtrl = new FormControl();
    component.dateCtrl = new FormControl();

    const res = {start:'Wed Aug 18 2021 00:00:00 GMT+0530 (India Standard Time)',end:'Wed Aug 18 2021 12:00:00 GMT+0530 (India Standard Time)'};
    component.dateCtrl.setValue(res);
    component.pickerCtrl.setValue('Last_Week');
    const eventSpy = spyOn(component.valueChange,'emit');
    component.applyFilter();
    expect(eventSpy).toHaveBeenCalled();
  });

  it('ngOnInit()', async()=>{
    component.selectedDate = {value:{start: new Date('9 Aug, 2021'),end: new Date('10 Aug, 2021')},type:'yesterday'};
    component.ngOnInit();
    expect(component.currentPickerType).toEqual('Day');

    component.selectedDate = {value:{start: new Date('9 Aug, 2021'),end: new Date('10 Aug, 2021')},type:'Last_2_Week'};
    component.ngOnInit();
    expect(component.currentPickerType).toEqual('Week');

    component.selectedDate = {value:{start: new Date('9 Aug, 2021'),end: new Date('10 Aug, 2021')},type:'date_range'};
    component.ngOnInit();
    expect(component.currentPickerType).toEqual('Date Range');

    component.selectedDate = {value:{start: new Date('9 Aug, 2021').toString(),end: new Date('9 Aug, 2021').toString()},type:'sp_date'};
    component.ngOnInit();
    expect(component.currentPickerType).toEqual('Specific Date');
  });

  it('emitDateChange(), emit when date change',async() => {
    component.dateCtrl.setValue({start:new Date('9 Aug,2021'), end : new Date('10 Aug,2021')});
    component.emitDateChange();
    expect(component.emitDateChange).toBeTruthy();

    component.dateCtrl.setValue({start:null, end : new Date('10 Aug,2021')});
    component.emitDateChange();
    expect(component.emitDateChange).toBeTruthy()

    component.dateCtrl.setValue({start:new Date('9 Aug,2021'), end : null});
    component.emitDateChange();
    expect(component.emitDateChange).toBeTruthy()
  })
})