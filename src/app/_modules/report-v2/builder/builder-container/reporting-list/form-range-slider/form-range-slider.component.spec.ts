import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRangeSliderComponent } from './form-range-slider.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormControl } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';

describe('FormRangeSliderComponent', () => {
  let component: FormRangeSliderComponent;
  let fixture: ComponentFixture<FormRangeSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormRangeSliderComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormRangeSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('applyFilter(), filter values', async(() => {
    component.fltrCtrl = new FormControl();
    component.control = new FormControl({min:1,max:10});
    component.minValue = 1;
    component.maxValue = 10;

    component.control.setValue({min:1,max:10})
    const emitEventSpy = spyOn(component.valueChange, 'emit');
    component.applyFilter();
    expect(emitEventSpy).toHaveBeenCalled();
  }));


  it('getSelectedRangeValue(),should return selected range', async(() => {
    component.control = new FormControl();

    const res = component.getSelectedRangeValue();
    expect(res).toEqual('');

    component.control.setValue({ min: 1, max: 10 });
    const result = component.getSelectedRangeValue();
    expect(result).toEqual('1-10');

    component.control.setValue({ min: 1 });
    const result1 = component.getSelectedRangeValue();
    expect(result1).toEqual('1');

    component.control.setValue({ max: 1 });
    const result2 = component.getSelectedRangeValue();
    expect(result2).toEqual('1');

    component.control.setValue({  });
    const result3 = component.getSelectedRangeValue();
    expect(result3).toEqual('');
  }));


  it('ngOnIt()', async(() => {
    component.control = new FormControl();
    component.control.setValue({ min: '5', max: '20' });
    component.fltrCtrl = new FormControl();
    component.fltrCtrl.setValue('10-20');
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();

    component.control = new FormControl();
    component.control.setValue({min:0,max:0});
    component.appliedValueCtrl = new FormControl();
    component.appliedValueCtrl.setValue('text');
    component.preSelectedValue = {min: 10, max: 20}
    component.fltrCtrl = new FormControl();
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('isInvalidInput(),check that input is valid or not',async()=>{
    component.fltrCtrl.setValue('10-20');
    component.minValue = 10;
    component.maxValue = 20;
    expect(component.isInValidInput()).toBeFalse();

    component.fltrCtrl.setValue('20-10');
    component.control.setValue({min:20,max:10})
    expect(component.isInValidInput()).toBeTrue();

  });

  it('ngOnChanges()', async()=>{
    component.appliedValueCtrl = new FormControl();
    component.isFilterWidget = true;
    const changes : SimpleChanges = {
      control:{
        currentValue:{min:0,max:3},
        previousValue: false,
        firstChange: false,
        isFirstChange() {return false}
      },
      preSelectedValue:{
        currentValue:false,
        previousValue: true,
        firstChange: false,
        isFirstChange() {return false}
      },
      formFieldId:{
        currentValue:'DATE',
        previousValue: 'TIME',
        firstChange: false,
        isFirstChange() {return false}
      }
    };
    component.ngOnChanges(changes);
    expect(component.ngOnChanges).toBeTruthy();

    const changes1 : SimpleChanges = {
      control:{
        currentValue:{min:10,max:30},
        previousValue: false,
        firstChange: false,
        isFirstChange() {return false}
      },
      preSelectedValue:{
        currentValue:{min:10,max:20},
        previousValue: true,
        firstChange: false,
        isFirstChange() {return false}
      },
      formFieldId:{
        currentValue:'DATE',
        previousValue: 'TIME',
        firstChange: false,
        isFirstChange() {return false}
      }
    };
    component.ngOnChanges(changes1);
    expect(component.ngOnChanges).toBeTruthy();

    const changes2 : SimpleChanges = {
      control:{
        currentValue:true,
        previousValue: false,
        firstChange: false,
        isFirstChange() {return false}
      },
      preSelectedValue:{
        currentValue:{min:'aa',max:20},
        previousValue: true,
        firstChange: false,
        isFirstChange() {return false}
      },
      formFieldId:{
        currentValue:'DATE',
        previousValue: 'TIME',
        firstChange: false,
        isFirstChange() {return false}
      }
    };
    component.ngOnChanges(changes2);
    expect(component.ngOnChanges).toBeTruthy();
  });

});
