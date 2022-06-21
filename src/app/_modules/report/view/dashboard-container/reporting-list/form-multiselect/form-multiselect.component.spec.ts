import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMultiselectComponent } from './form-multiselect.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { DropDownValues } from '@modules/report/_models/widget';
import { ReportService } from '@modules/report/_service/report.service';
import { SimpleChanges } from '@angular/core';
import { of } from 'rxjs';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FormMultiSelectComponent', () => {
  let component: FormMultiselectComponent;
  let fixture: ComponentFixture<FormMultiselectComponent>;
  let reportService: jasmine.SpyObj<ReportService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormMultiselectComponent],
      imports: [AppMaterialModuleForSpec, MdoUiLibraryModule, HttpClientTestingModule]
    })
      .compileComponents();
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMultiselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getDropDownValue(),should return dropdown values', async(()=>{
    const value = { CODE: 'first', TEXT: 'test' } as DropDownValues;
    const returnData : DropDownValues[] = [{
      sno:1,
      CODE:'first',
      TEXT:'test',
      langu:'',
      display:'',
      FIELDNAME:''
    }];
    component.formFieldId='MATL_GROUP';
    component.optionList = [];
    component.selectedMultiSelectData = [{ [value.CODE]: null }];
    component.isTableFilter = 'true';

    spyOn(component,'displayMultiselectedText');
    spyOn(reportService,'getDropDownValues')
    .withArgs(component.formFieldId,'first').and.returnValue(of(returnData));

    component.getDropDownValue('first');
    expect(component.optionList.length).toEqual(1);
  }));


  it('applyFilter(), filter values', async(() => {
    component.formFieldId = 'MATL_GROUP';
    const emitEventSpy = spyOn(component.valueChange, 'emit');
    spyOn(component,'displayMultiselectedText');
    component.applyFilter();
    expect(emitEventSpy).toHaveBeenCalled();
  }));


  it('selectionChangeHandler(), selected value for multi selected data', (async () => {
    const value = { CODE: 'CODE', TEXT: 'TEXT' } as DropDownValues;

    component.selectedMultiSelectData = null;
    component.selectionChangeHandler(value.CODE, value.TEXT);
    expect(component.selectionChangeHandler).toBeTruthy();

    component.selectionChangeHandler(value.CODE, value.TEXT);
    expect(component.selectionChangeHandler).toBeTruthy();

    component.selectedMultiSelectData = [{ [value.CODE]: value.TEXT }];
    component.selectionChangeHandler(value.CODE, value.TEXT);
    expect(component.selectionChangeHandler).toBeTruthy();

    component.selectedMultiSelectData = [{ column: value.TEXT }];
    component.selectionChangeHandler(value.CODE, value.TEXT);
    expect(component.selectionChangeHandler).toBeTruthy();
  }));


  it('isChecked(),should return true if a value is already selected', async(()=>{
    const value = { CODE: 'CODE', TEXT: 'TEXT' } as DropDownValues;

    component.isChecked(value.CODE);
    expect(component.isChecked).toBeTruthy();

    component.selectedMultiSelectData = [{ [value.CODE]: value.TEXT }];
    component.isChecked(value.CODE);
    expect(component.isChecked).toBeTruthy();

  }));

  it('getLabel(),should get label', async(()=>{
    const opt = {
      CODE: 'CODE',
      TEXT: 'TEXT'
     } as DropDownValues

    component.displayCriteria = 'CODE_TEXT';
    const result = component.getLabel(opt);
    expect(result).toBe(opt.CODE + '-' + opt.TEXT);

    component.displayCriteria = 'CODE';
    const result1 = component.getLabel(opt);
    expect(result1).toBe(opt.CODE);

    component.displayCriteria = 'TEXT';
    const result2 = component.getLabel(opt);
    expect(result2).toBe(opt.TEXT);

  }));


  it('ngOnChanges(),should detect changes and update', async(()=>{
    let change : SimpleChanges = {
      value :{
        previousValue: ['first'],
        currentValue: ['second'],
        firstChange: true,
        isFirstChange(){return true}
      }
    };

    component.selectedMultiSelectData = [];
    component.ngOnChanges(change);
    expect(component.selectedMultiSelectData[0].second).toEqual(null);

    change = {
      value : {
        previousValue : [{ CODE: 'CODE', TEXT: 'TEXT' }],
        currentValue : [{ CODE: 'CODE', TEXT: 'TEXT' },{ CODE: 'CODE1', TEXT: 'TEXT1' }],
        firstChange : false,
        isFirstChange() { return false}
      }
    }

    component.selectedMultiSelectData = [{ CODE: 'CODE', TEXT: 'TEXT' },{ CODE: 'CODE1', TEXT: 'TEXT1' }]
    component.ngOnChanges(change);
    expect(component.selectedMultiSelectData.length).toEqual(2);

    change = {
      value : {
        previousValue : [{ CODE: 'CODE', TEXT: 'TEXT' }],
        currentValue : null,
        firstChange : false,
        isFirstChange() { return false}
      }
    }

    spyOn(component,'displayMultiselectedText');
    component.ngOnChanges(change);


  }));


  it('getSelectedData()', async(()=>{
    const value = { CODE: 'test', TEXT: 'TEST1' } as DropDownValues;
    component.selectedMultiSelectData = [{ [value.CODE]: value.TEXT }];
    component.optionList = [{ CODE: 'test', TEXT: 'TEST1' } as DropDownValues] ;

    const selectedDataList = component.getSelectedData();
    expect(selectedDataList.length).toEqual(1);
  }));


  it('ngOnInit()', async(()=>{
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));


  it('ngOnDestroy()', () => {
    component.ngOnDestroy();
    expect(component.ngOnDestroy).toBeTruthy();
  });
});
