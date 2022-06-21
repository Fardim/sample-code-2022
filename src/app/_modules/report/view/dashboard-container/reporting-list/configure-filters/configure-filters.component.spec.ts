import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureFiltersComponent } from './configure-filters.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { ReportService } from '@modules/report/_service/report.service';
import { BlockType, ConditionOperator, Criteria, DisplayCriteria, DropDownValues, FormControlType, ReportingWidget } from '@modules/report/_models/widget';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { FormControl, FormGroup } from '@angular/forms';
import { UserService } from '@services/user/userservice.service';
import { of } from 'rxjs';
import { Userdetails } from '@models/userdetails';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ConfigureFiltersComponent', () => {
  let component: ConfigureFiltersComponent;
  let fixture: ComponentFixture<ConfigureFiltersComponent>;
  let router: Router;
  let reportService: ReportService;
  let userService: UserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigureFiltersComponent],
      imports: [RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule, HttpClientTestingModule],
      providers: [ReportService, UserService]
    })
      .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureFiltersComponent);
    reportService = fixture.debugElement.injector.get(ReportService);
    userService = fixture.debugElement.injector.get(UserService);
    component = fixture.componentInstance;

    component.configurationFilterForm = new FormGroup({});
    component.tableColumnMetaData = [
      {
        widgetId: 1,
        fields: 'MATL_GROUP',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'MATL_GROUP', picklist: '22', dataType: 'CHAR' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      }
    ];
    component.filterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: ['test', 'test2'],
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      },
      {
        fieldId: 'column',
        conditionFieldId: 'column',
        conditionFieldValue: ['test'],
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      },
      {
        fieldId: 'column1',
        conditionFieldId: 'column1',
        conditionFieldValue: ['test'],
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      },
      {
        fieldId: 'column2',
        conditionFieldId: 'column2',
        conditionFieldValue: ['test'],
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      },

    ];

    component.selectedFilter = {
      fieldId: 'MATL_GROUP',
      conditionFieldId: 'MATL_GROUP',
      conditionFieldValue: 'test',
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null
    } as Criteria;

  });

  it('close(), should close the current router', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(component.close).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);
  });

  it('changeOutputFormat(), should store the selected output format', async(() => {
    component.selectedFieldMetaData =
    {
      widgetId: 1,
      fields: 'MATL_GROUP',
      fieldOrder: '',
      fieldDesc: 'first field 1',
      sno: 1,
      fldMetaData: { fieldId: 'MATL_GROUP' } as MetadataModel,
      displayCriteria: DisplayCriteria.CODE
    };

    component.changeOutputFormat(DisplayCriteria.TEXT);
    expect(component.tableColumnMetaData[0].displayCriteria).toBe(DisplayCriteria.TEXT);
    expect(component.selectedFieldMetaData.displayCriteria).toBe(DisplayCriteria.TEXT);

    component.changeOutputFormat(DisplayCriteria.CODE);
    expect(component.tableColumnMetaData[0].displayCriteria).toBe(DisplayCriteria.CODE);
    expect(component.selectedFieldMetaData.displayCriteria).toBe(DisplayCriteria.CODE);

    component.changeOutputFormat(DisplayCriteria.CODE_TEXT);
    expect(component.tableColumnMetaData[0].displayCriteria).toBe(DisplayCriteria.CODE_TEXT);
    expect(component.selectedFieldMetaData.displayCriteria).toBe(DisplayCriteria.CODE_TEXT);

  }));

  it('onFilter(), should display filter values for selected column', async(() => {
    component.tableColumnMetaData = [
      {
        widgetId: 1,
        fields: 'MATL_GROUP',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'MATL_GROUP', picklist: '1', isCheckList: 'true' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      },
      {
        widgetId: 1,
        fields: 'column',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'column', picklist: '1' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      },
      {
        widgetId: 1,
        fields: 'column1',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'column', picklist: '4' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      },
      {
        widgetId: 1,
        fields: 'column2',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'column', picklist: '2' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      }
    ];
    const filter: Criteria = {
      fieldId: 'MATL_GROUP',
      conditionFieldId: 'MATL_GROUP',
      conditionFieldValue: 'test',
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null
    } as Criteria;


    component.dropDownDataList = {
      MATL_GROUP: [{ CODE: 'test', TEXT: 'TEST' }, { CODE: 'test2', TEXT: 'TEST2' }] as DropDownValues[],
      column: [{ CODE: 'test', TEXT: 'TEST' }, { CODE: 'test2', TEXT: 'TEST2' }] as DropDownValues[],
      column1: [{ CODE: 'test', TEXT: 'TEST' }, { CODE: 'test2', TEXT: 'TEST2' }] as DropDownValues[],
      column2: [{ CODE: 'test', TEXT: 'TEST' }, { CODE: 'test2', TEXT: 'TEST2' }] as DropDownValues[]
    }
    component.filterApplied = [];
    component.onClickOnListItem(filter, 0);
    expect(component.onClickOnListItem).toBeTruthy();

    const filter1: Criteria = {
      fieldId: 'column',
      conditionFieldId: 'column',
      conditionFieldValue: 'test',
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null
    } as Criteria;
    component.onClickOnListItem(filter1, 1);
    expect(component.onClickOnListItem).toBeTruthy();

    const filter2: Criteria = {
      fieldId: 'column1',
      conditionFieldId: 'column1',
      conditionFieldValue: 'test',
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null
    } as Criteria;

    component.onClickOnListItem(filter2, 2);
    expect(component.onClickOnListItem).toBeTruthy();

    const filter3: Criteria = {
      fieldId: 'column2',
      conditionFieldId: 'column3',
      conditionFieldValue: 'test',
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null
    } as Criteria;

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'CHAR' } as MetadataModel;
    component.onClickOnListItem(filter3, 2);
    expect(component.onClickOnListItem).toBeTruthy();
  }));


  it(`onChange(), should add DropDownValue in the filterApplied list if already exist`, async(() => {

    const matl = 'MATL_GROUP';
    component.filterApplied[matl] = [];
    const value = {
      CODE: 'test1',
      FIELDNAME: 'Test field 1',
      LANGU: '',
      PLANTCODE: '',
      SNO: `1`,
      TEXT: 'test field 1'
    };

    component.selectedFieldMetaData = {
      widgetId: 1,
      fields: 'MATL_GROUP',
      fieldOrder: '',
      fieldDesc: 'first field 1',
      sno: 1,
      fldMetaData: { fieldId: 'MATL_GROUP', picklist: '1', isCheckList: 'true' } as MetadataModel,
      displayCriteria: DisplayCriteria.CODE
    }
    component.onChange(value);
    expect(component.filterApplied[component.selectedFilter.fieldId].length).toEqual(1);

    component.selectedFieldMetaData = {
      widgetId: 1,
      fields: 'MATL_GROUP',
      fieldOrder: '',
      fieldDesc: 'first field 1',
      sno: 1,
      fldMetaData: { fieldId: 'MATL_GROUP', picklist: '1' } as MetadataModel,
      displayCriteria: DisplayCriteria.CODE
    }
    expect(component.filterApplied[component.selectedFilter.fieldId].length).toEqual(1);
  }));

  it(`onChange(), should remove DropDownValue in the filterApplied list if not already exist`, async(() => {
    component.filterApplied[component.selectedFilter.fieldId] = [];
    const value = [{
      CODE: 'test',
      FIELDNAME: 'MATL_GROUP',
      LANGU: '',
      PLANTCODE: '',
      SNO: `1`,
      TEXT: 'test field 1'
    }];
    component.filterApplied[component.selectedFilter.fieldId].push(value);
    component.selectedFieldMetaData = {
      widgetId: 1,
      fields: 'MATL_GROUP',
      fieldOrder: '',
      fieldDesc: 'first field 1',
      sno: 1,
      fldMetaData: { fieldId: 'MATL_GROUP', picklist: '1' } as MetadataModel,
      displayCriteria: DisplayCriteria.CODE
    }
    component.onChange(value);
    expect(component.filterApplied[component.selectedFilter.fieldId].length).toEqual(1);

    component.filterApplied[component.selectedFilter.fieldId].push(value);
    component.selectedFieldMetaData = {
      widgetId: 1,
      fields: 'MATL_GROUP',
      fieldOrder: '',
      fieldDesc: 'first field 1',
      sno: 1,
      fldMetaData: { fieldId: 'MATL_GROUP', picklist: '1', isCheckList: 'true' } as MetadataModel,
      displayCriteria: DisplayCriteria.CODE
    }
    component.onChange(value);
    expect(component.filterApplied[component.selectedFilter.fieldId].length).toEqual(2);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '1', isCheckList: 'true' } as MetadataModel;
    component.onChange(value);
    expect(component.filterApplied[component.selectedFilter.fieldId].length).toEqual(3);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '1', isCheckList: 'false' } as MetadataModel;
    component.onChange(value);
    expect(component.filterApplied[component.selectedFilter.fieldId].length).toEqual(3);
  }));


  it('getDropDownValue(), should generate filters available on fieldId', async(() => {
    const fieldId = 'MATL_GROUP';
    const returnData: DropDownValue[] = [];
    component.dropDownDataList[fieldId] = [];
    // spyOn(reportService, 'getDropDownValues').and.returnValue(of(returnData));
    // component.getDropDownValue(fieldId);

    expect(component.dropDownDataList[fieldId].length).toEqual(returnData.length);

    component.selectedFieldMetaData = {
      widgetId: 1,
      fields: 'MATL_GROUP',
      fieldOrder: '',
      fieldDesc: 'first field 1',
      sno: 1,
      fldMetaData: { fieldId: 'MATL_GROUP', picklist: '35' } as MetadataModel,
      displayCriteria: DisplayCriteria.CODE
    }

    component.getDropDownValue(fieldId);

    expect(component.dropDownDataList[fieldId].length).toEqual(returnData.length);
  }));

  it('getColumnNames(), should get column names', async(() => {
    const tableColumnMetaData: ReportingWidget[] = [
      {
        widgetId: 1,
        fields: 'MATL_GROUP',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'MATL_GROUP', picklist: '31' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      }
    ];

    const filteredCriteriaList: Criteria[] = [{
      fieldId: 'MATL_GROUP',
      conditionFieldId: 'MATL_GROUP',
      conditionFieldValue: 'test',
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null,
    } as Criteria];

    component.filterCriteria = [];

    spyOn(reportService, 'getColumnMetaData').and.returnValue(tableColumnMetaData);
    spyOn(reportService, 'getFilterCriteria').and.returnValue(filteredCriteriaList);
    component.getColumnNames();
    expect(component.getColumnNames).toBeTruthy();
    expect(component.tableColumnMetaData.length).toEqual(tableColumnMetaData.length);
  }));

  it('getColumnNames(), should get column names for multi select component', async(() => {
    const tableColumnMetaData: ReportingWidget[] = [
      {
        widgetId: 1,
        fields: 'MATL_GROUP',
        fieldOrder: '',
        fieldDesc: 'first field 1',
        sno: 1,
        fldMetaData: { fieldId: 'MATL_GROUP', picklist: '31', isCheckList: 'true' } as MetadataModel,
        displayCriteria: DisplayCriteria.CODE
      }
    ];

    const filteredCriteriaList: Criteria[] = [{
      fieldId: 'MATL_GROUP',
      conditionFieldId: 'MATL_GROUP',
      conditionFieldValue: 'test',
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null,
    } as Criteria];

    component.filterCriteria = [];

    spyOn(reportService, 'getColumnMetaData').and.returnValue(tableColumnMetaData);
    spyOn(reportService, 'getFilterCriteria').and.returnValue(filteredCriteriaList);
    component.getColumnNames();
    expect(component.getColumnNames).toBeTruthy();
    expect(component.tableColumnMetaData.length).toEqual(tableColumnMetaData.length);
    expect(component.getDropDownValue).toBeTruthy();
  }));



  it('ngOnDestroy()', () => {
    component.ngOnDestroy();
    expect(component.ngOnDestroy).toBeTruthy();
  });

  // it('ngOnInit()', () => {
  //   component.ngOnInit();
  //   const formSpy = spyOn(component,'initializeForm');
  //   const columnSpy = spyOn(component,'getColumnNames');
  //   const getUserDetails = spyOn(component,'getUserDetails')
  //   expect(formSpy).toHaveBeenCalled();
  //   expect(columnSpy).toHaveBeenCalled();
  //   expect(getUserDetails).toHaveBeenCalled();
  // });

  it('intilizeForm()', async(() => {
    component.initializeForm();
    expect(component.initializeForm).toBeTruthy();
  }));

  it('getSelectedValue() get selected value to show in text', () => {
    let fieldId = 'MATL_GROUP'
    component.dropDownDataList = {
      MATL_GROUP: [{ CODE: 'test', TEXT: 'TEST' }, { CODE: 'test2', TEXT: 'TEST2' }] as DropDownValues[],
    }
    expect(component.getSelectedValue(fieldId, 'test')).toEqual('TEST');
    fieldId = 'column'
    expect(component.getSelectedValue(fieldId, '')).toEqual(null);
  })

  it('removedSelectedFilter(), remove filter that is already selected', () => {
    component.filterApplied[component.selectedFilter.fieldId] = [{
      CODE: 'test',
      FIELDNAME: 'Test field 1',
      LANGU: '',
      PLANTCODE: '',
      SNO: `1`,
      TEXT: 'test field 1'
    }];

    component.filterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: 'test',
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      }
    ];

    component.filteredCriteriaList = [{
      fieldId: 'MATL_GROUP',
      conditionFieldId: 'MATL_GROUP',
      conditionFieldValue: 'test',
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null,
    } as Criteria];

    component.removedSelectedFilter('test', 0);
    expect(component.removedSelectedFilter).toBeTruthy();
  });

  it('changeCondition(),change condition operator for selected filters', () => {
    component.changeCondition(ConditionOperator.NOT_EQUAL);
    expect(component.filterCriteria[0].conditionOperator).toEqual(ConditionOperator.NOT_EQUAL);
    expect(component.selectedFilter.conditionOperator).toEqual(ConditionOperator.NOT_EQUAL);
  })

  it('applyFilter(),apply filter when click on apply button', () => {
    component.widgetId = 3743784;
    spyOn(reportService, 'setColumnMetaData').withArgs(component.tableColumnMetaData,component.widgetId);

    component.filteredCriteriaList = [{
      fieldId: 'MATL_GROUP',
      conditionFieldId: 'MATL_GROUP',
      conditionFieldValue: 'test',
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null,
    } as Criteria];

    component.filterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: ['test', 'test1'],
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        conditionFieldValueText: '',
        udrid: null,
      }
    ];

    spyOn(router, 'navigate');
    component.applyFilter();
    expect(component.applyFilter).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { picklist: '1', isCheckList: 'false' } as MetadataModel;
    component.applyFilter();
    expect(component.applyFilter).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2', dataType: 'DATS' } as MetadataModel;
    component.applyFilter();
    expect(component.applyFilter).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { picklist: '1', isCheckList: 'true' } as MetadataModel;
    component.applyFilter();
    expect(component.applyFilter).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { dataType: 'DTMS' } as MetadataModel;
    component.applyFilter();
    expect(component.applyFilter).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { dataType: 'DATS' } as MetadataModel;
    component.applyFilter();
    expect(component.applyFilter).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { dataType: 'TIMS' } as MetadataModel;
    component.applyFilter();
    expect(component.applyFilter).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'NUMC' } as MetadataModel;
    component.applyFilter();
    expect(component.applyFilter).toBeTruthy();

    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);

  })

  it('getFormFieldType(), get form control type', () => {
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.TEXTAREA);

    component.tableColumnMetaData[0].fldMetaData = { dataType: 'DATS' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.DATE);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2', dataType: 'DTMS' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.DATE_TIME);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '1', isCheckList: 'true' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.MULTI_SELECT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '1', isCheckList: 'false' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.DROP_DOWN);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2', dataType: 'TIMS' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.TIME);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'CHAR' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'ALTN' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'ICSN' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'REQ' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'TEXT' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.TEXT);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'NUMC' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.NUMBER);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'DEC' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.NUMBER);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.CHECKBOX);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '4' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toEqual(FormControlType.RADIO);

    component.tableColumnMetaData[0].fldMetaData = { picklist: '0', dataType: 'ABCd' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toBeFalse();
    component.tableColumnMetaData[0].fldMetaData = { picklist: '20' } as MetadataModel;
    expect(component.getFormFieldType(component.selectedFilter.fieldId)).toBeFalse();
  })


  it('getRangeLimit()', async(() => {
    component.getRangeLimit('MATL_GROUP', 'max');
    expect(component.getRangeLimit).toBeTruthy();
  }));


  it('onInputValueChange()', async(() => {
    component.onInputValueChange('test');
    expect(component.onInputValueChange).toBeTruthy();

    component.selectedFilter = {
      fieldId: 'MATL_GROUP',
      conditionFieldId: 'MATL_GROUP',
      conditionFieldValue: null,
      blockType: BlockType.COND,
      conditionOperator: ConditionOperator.EQUAL,
      conditionFieldStartValue: null,
      conditionFieldEndValue: null,
      udrid: null
    } as Criteria;

    component.filterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: null,
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: null,
        conditionFieldEndValue: null,
        udrid: null,
      }
    ];
    component.onInputValueChange('test');
    expect(component.onInputValueChange).toBeTruthy();
  }));


  it('rangeTypeValueChange()', async(() => {
    const event = {
      value: { min: 1, max: 10 }
    }

    component.rangeTypeValueChange(event);
    expect(component.rangeTypeValueChange).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2', dataType: 'DATS' } as MetadataModel;
    component.rangeTypeValueChange(event);
    expect(component.rangeTypeValueChange).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2', dataType: 'DTMS' } as MetadataModel;
    component.rangeTypeValueChange(event);
    expect(component.rangeTypeValueChange).toBeTruthy();

    component.tableColumnMetaData[0].fldMetaData = { picklist: '2', dataType: 'TIMS' } as MetadataModel;
    component.rangeTypeValueChange(event);
    expect(component.rangeTypeValueChange).toBeTruthy();
  }));

  it('getUsetDetails()', async(() => {

    const res = { dateformat: 'MM.dd.yy' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toEqual('MM.dd.yyyy, h:mm:ss a');
  }));

  it('getUsetDetails(),when date format is dd.MM.yy', async(() => {

    const res = { dateformat: 'dd.MM.yy' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toEqual('dd.MM.yyyy, h:mm:ss a');
  }));

  it('getUsetDetails(),when date format is dd M, yy', async(() => {

    const res = { dateformat: 'dd M, yy' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toEqual('dd MMM, yyyy, h:mm:ss a');
  }));

  it('getUsetDetails(),when date format is MM d, yy', async(() => {

    const res = { dateformat: 'MM d, yy' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toEqual('MMMM d, yyyy, h:mm:ss a');
  }));


  it('getUsetDetails(), when date format is dd-MM-YYY', async(() => {

    const res = { dateformat: 'dd-MM-yyyy' } as Userdetails;
    spyOn(userService, 'getUserDetails').and.returnValue(of(res));
    component.getUserDetails();
    expect(component.getUserDetails).toBeTruthy();
    expect(component.dateFormat).toEqual(null);
  }));

  it('getSelectedDateValue()', async () => {
    component.selectedFilter.conditionFieldEndValue = '1623671412177';
    component.selectedFilter.conditionFieldStartValue = '162367141000';
    component.selectedFilter.fieldId = 'MATL_GROUP';
    const control = new FormControl({ start: new Date(), end: new Date(Number(component.selectedFilter.conditionFieldEndValue)) })
    component.configurationFilterForm.addControl(component.selectedFilter.fieldId, control);
    component.getSelectedDateValue();
    expect(component.getSelectedDateValue()).toBeInstanceOf(Object);
  })

  it('getSelectedTimeValue()', async () => {
    component.selectedFilter.conditionFieldEndValue = '1623671412177';
    component.selectedFilter.conditionFieldStartValue = '162367141000';
    component.selectedFilter.fieldId = 'MATL_GROUP';
    component.getSelectedTimeValue()
    expect(component.getSelectedTimeValue()).toBeInstanceOf(Object);
  })

  it('getPreSelectedRangeValue()', async ()=>{
    component.filterCriteria = [
      {
        fieldId: 'MATL_GROUP',
        conditionFieldId: 'MATL_GROUP',
        conditionFieldValue: null,
        blockType: BlockType.COND,
        conditionOperator: ConditionOperator.EQUAL,
        conditionFieldStartValue: '10',
        conditionFieldEndValue: '20',
        udrid: null,
      }
    ];

    const res = {max:'20',min:'10'};
    expect(component.getPreSelectedRangeValue('MATL_GROUP')).toEqual(res);
  })

  it('getDateTypeValue()', async ()=>{
    let fld = '7654345';
    expect(component.getDateTypeValue(fld)).toEqual(fld);

    fld = 'aftadrtsa';
    expect(component.getDateTypeValue(fld)).toEqual('');
  })
});