import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import * as moment from 'moment';

import { TableCellInputComponent } from './table-cell-input.component';
import { FieldInputType } from '@models/schema/schemadetailstable';

describe('TableCellInputComponent', () => {
  let component: TableCellInputComponent;
  let fixture: ComponentFixture<TableCellInputComponent>;
  let schemaService: SchemaService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableCellInputComponent],
      imports: [HttpClientTestingModule, AppMaterialModuleForSpec ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellInputComponent);
    component = fixture.componentInstance;

    schemaService = fixture.debugElement.injector.get(SchemaService);
    component.fieldId = 'region';
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit input blur event', () => {

    spyOn(component.inputBlur, 'emit');
    component.emitInputBlur('value');
    expect(component.inputBlur.emit).toHaveBeenCalled();

  });

  it('should dropdown values', async(() => {

    const values = [
      { CODE: '1', TEXT: 'Tunisia' } as DropDownValue,
      { CODE: '2', TEXT: 'India' } as DropDownValue
    ];

    spyOn(schemaService, 'dropDownValues').withArgs(component.fieldId, '')
      .and.returnValue(of(values));

    component.prepareDropdownOptions();

    expect(schemaService.dropDownValues).toHaveBeenCalledWith(component.fieldId, '');
    expect(component.selectFieldOptions).toEqual(values);

  }));

  it('should filter dropdown options', () => {

    component.selectFieldOptions = [
      { CODE: '1', TEXT: 'Tunisia' } as DropDownValue,
      { CODE: '2', TEXT: 'India' } as DropDownValue
    ];

    const result  = component.filterSelectFieldOptions('Tu');
    expect(result.length).toEqual(1);
  })

  it('should formatMultiSelectValue', () => {
    spyOn(component, 'emitInputBlur');
    component.formatMultiSelectValue(['India']);
    expect(component.emitInputBlur).toHaveBeenCalled();
  });

  it('should format date  input', () => {

    component.prepareDateFormat();
    expect(component.prepareDateFormat()).toBeFalsy();

    component.value = moment().format('DD/MM/YYYY');
    expect(component.prepareDateFormat()).toEqual(new Date(moment().format('MM/DD/YYYY')));
  });

  it('should format output date', () => {
    expect(component.formatDate(new Date())).toEqual(moment().format('DD/MM/YYYY'));
  });

  it('should emit date change', ()=> {

    spyOn(component, 'emitInputBlur');
    component.dateControl.setValue(new Date());
    component.datePanelClosed();
    expect(component.emitInputBlur).toHaveBeenCalled();

  });

  it('should init component', () => {

    spyOn(component, 'prepareDropdownOptions');

    component.inputType = FieldInputType.NUMBER;
    component.ngOnInit();

    component.inputType = FieldInputType.SINGLE_SELECT;
    component.ngOnInit();
    expect(component.prepareDropdownOptions).toHaveBeenCalledTimes(1);

    component.inputType = FieldInputType.DATE;
    component.value = moment().format('DD/MM/YYYY');
    component.ngOnInit();
    expect(component.dateControl.value).toEqual(new Date(moment().format('MM/DD/YYYY')));
  });

  it('should emit select value change', () => {

    const event = new Event('click');
    spyOn(event, 'preventDefault');
    component.emitChngSelectValue(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(0);

  });

  it('should submit single select value', () => {

    spyOn(component, 'emitInputBlur');
    component.selectFieldOptions = [{TEXT: 'Tunisia', CODE: 'Tunisia'} as DropDownValue];
    const event = {target: {value: 'Tunisia'}};

    component.submitSingleSelectValue(event);
    expect(component.emitInputBlur).toHaveBeenCalledWith({ TEXT: 'Tunisia', CODE: 'Tunisia' });

    event.target.value = 'India';
    component.value = 'Asia';
    component.submitSingleSelectValue(event);

    expect(component.emitInputBlur).toHaveBeenCalledWith('Asia');


  })

});
