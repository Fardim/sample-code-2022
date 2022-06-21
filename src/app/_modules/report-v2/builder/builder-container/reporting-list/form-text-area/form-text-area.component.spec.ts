import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTextAreaComponent } from './form-text-area.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

describe('FormTextAreaComponent', () => {
  let component: FormTextAreaComponent;
  let fixture: ComponentFixture<FormTextAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormTextAreaComponent],
      imports: [AppMaterialModuleForSpec]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('ngOnIt()', async(() => {
    component.value = 'text';
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();

  }));


  it('ngOnChanges()', async(() => {
    component.control = new FormControl();
    component.isFilterWidget = true;
    const changes: SimpleChanges = {};
    component.ngOnChanges(changes);
    expect(component.ngOnChanges).toBeTruthy();
    const change1: SimpleChanges = {
      formFieldId: {
        previousValue: 'activityCheck',
        currentValue: 'column',
        firstChange: false,
        isFirstChange() { return false }
      },
      controls: {
        previousValue: false,
        currentValue: true,
        firstChange: false,
        isFirstChange() { return false }
      },
      value:{
        previousValue: false,
        currentValue: true,
        firstChange: false,
        isFirstChange() { return false }
      },
      widgetId:{
        previousValue: '1234',
        currentValue: '2345',
        firstChange: false,
        isFirstChange() { return false }
      }
    };

    component.ngOnChanges(change1);
    expect(component.control.value).toBeTrue();
    expect(component.formFieldId).toEqual('column')

  }));


  it('applyFilter(), filter values', async(() => {
    const emitEventSpy = spyOn(component.valueChange, 'emit');
    component.isTableFilter = 'false';
    component.applyFilter('text');
    expect(emitEventSpy).toHaveBeenCalled();
    expect(component.isApplied).toEqual(true);
  }));
});
