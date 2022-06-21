import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersSidesheetComponent } from './filters-sidesheet.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { BlockType, ConditionOperator, Criteria, DisplayCriteria, FilterWidget, FormControlType, Widget, WidgetAdditionalProperty, WidgetType } from '@modules/report-v2/_models/widget';
import { UserService } from '@services/user/userservice.service';
import { of } from 'rxjs';
import { Userdetails } from '@models/userdetails';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WidgetService } from '@services/widgets/widget.service';
import * as moment from 'moment';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { DatePipe } from '@angular/common';

describe('FiltersSidesheetComponent', () => {
    let component: FiltersSidesheetComponent;
    let fixture: ComponentFixture<FiltersSidesheetComponent>;
    let router: Router;
    let userService: UserService;
    let widgetService: WidgetService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FiltersSidesheetComponent],
            imports: [RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule, HttpClientTestingModule],
            providers: [UserService,WidgetService, DatePipe]
        })
            .compileComponents();
        router = TestBed.inject(Router);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FiltersSidesheetComponent);
        userService = fixture.debugElement.injector.get(UserService);
        widgetService = fixture.debugElement.injector.get(WidgetService);
        component = fixture.componentInstance;

        component.filterCriteria = [
            {
                fieldId: 12345,
                conditionFieldId: 12345,
                conditionFieldValue: ['test', 'test2'],
                blockType: BlockType.COND,
                conditionOperator: ConditionOperator.EQUAL,
                conditionFieldStartValue: null,
                conditionFieldEndValue: null,
                conditionFieldValueText: ['test', 'test2'],
                udrid: null,
            }
        ];
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '1' }, isMultiSelect: true } as Widget];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('close(), should close the current router', () => {
        spyOn(router, 'navigate');
        component.close();
        expect(component.close).toBeTruthy();
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);
    });

    it('ngOnDestroy()', () => {
        component.ngOnDestroy();
        expect(component.ngOnDestroy).toBeTruthy();
    });

    it('ngOnInit()', () => {
        component.ngOnInit();
        expect(component.initializeForm).toBeTruthy();
        expect(component.getColumnNames).toBeTruthy();
        expect(component.getUserDetails).toBeTruthy();
    });

    it('intilizeForm()', async(() => {
        component.initializeForm();
        expect(component.initializeForm).toBeTruthy();
    }));

    it('onClickOnListItem(), should display filter values for selected widget', async(() => {
        const widget = { widgetId: '1234', widgetType: WidgetType.FILTER } as Widget;
        component.onClickOnListItem(widget);
        expect(component.onClickOnListItem).toBeTruthy();
        expect(component.selectedWidget).toEqual(widget);
    }));

    it(`onChange(), should select option for multi select`, async(() => {
        component.selectedWidget = { widgetId: '1234' } as Widget;
        component.finalFormatedWidgetList = [{ widgetId: '1234', selectedValues: ['1'] }, { widgetId: '12333', selectedValues: '' }];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.MULTI_SELECT)
        component.onChange([{ CODE: 'code', TEXT: 'text' }, { CODE: 'TERMS', TEXT: 'Terms' }]);
        expect(component.finalFormatedWidgetList[0].selectedValues).toEqual([{ CODE: 'code', TEXT: 'text' }, { CODE: 'TERMS', TEXT: 'Terms' }]);
    }));

    it(`onChange(), should select option for single select`, async(() => {
        component.selectedWidget = { widgetId: '1234' } as Widget;
        component.finalFormatedWidgetList = [{ widgetId: '1234', selectedValues: ['1'] }, { widgetId: '12333', selectedValues: '' }];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.MULTI_SELECT)
        component.onChange({ CODE: 'code', TEXT: 'text' });
        expect(component.finalFormatedWidgetList[0].selectedValues).toEqual([{ CODE: 'code', TEXT: 'text' }]);
    }));

    it(`onChange(), should select option for hierachy`, async(() => {
        component.selectedWidget = { widgetId: '1234' } as Widget;
        component.finalFormatedWidgetList = [{ widgetId: '1234', selectedValues: ['1'] }, { widgetId: '12333', selectedValues: '' }];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.HIERARCHY)
        component.onChange({ CODE: 'code', TEXT: 'text' });
        expect(component.finalFormatedWidgetList[0].selectedValues).toEqual([{ CODE: 'code', TEXT: 'text' }]);
    }));

    it(`onInputValueChange(), should add DropDownValue in the filterApplied list if already exist`, async(() => {
        component.selectedWidget = { widgetId: '1234' } as Widget;
        component.finalFormatedWidgetList = [{ widgetId: '1234', selectedValues: '' }, { widgetId: '12333', selectedValues: '' }];
        component.onInputValueChange('test');
        expect(component.finalFormatedWidgetList[0].selectedValues).toEqual(['test']);
    }));

    it('rangeTypeValueChange(),method called when value change for selected date', async(() => {
        component.selectedWidget = { widgetId: 12345 };
        component.finalFormatedWidgetList = [{ widgetId: 12345, selectedValues: '' }, { widgetId: '12333', selectedValues: '' }];
        const event = { value: { start: 1596997800000, end: 1597256999999 }, type: 'Last_Week' };
        const spy = spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.DATE)
        component.rangeTypeValueChange(event);
        expect(spy).toHaveBeenCalled();
        expect(component.rangeTypeValueChange).toBeTruthy();
    }));

    it('rangeTypeValueChange(),method called when value change for selected Time', async(() => {
        component.selectedWidget = { widgetId: 12345 };
        component.finalFormatedWidgetList = [{ widgetId: 12345, selectedValues: '' }, { widgetId: '12333', selectedValues: '' }];
        const event = { start: { hours: 1, minutes: 20 }, end: { hours: 3, minutes: 20 } };
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.TIME)
        component.rangeTypeValueChange(event);
        expect(component.finalFormatedWidgetList[0].selectedValues).toEqual([{ start: { hours: 1, minutes: 20 }, end: { hours: 3, minutes: 20 } }]);
    }));

    it('rangeTypeValueChange(),method called when value change for selected datetime', async(() => {
        component.selectedWidget = { widgetId: 12345 };
        component.finalFormatedWidgetList = [{ widgetId: 12345, selectedValues: '' }, { widgetId: '12333', selectedValues: '' }];
        const event = { value: { start: new Date(moment().subtract(1, 'week').valueOf()), end: new Date() }, type: 'Last_Week' };
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.DATE_TIME)
        component.rangeTypeValueChange(event);
        expect(component.finalFormatedWidgetList[0].selectedValues.length).toEqual(1);
    }));

    it('rangeTypeValueChange(),method called when value change for selected number', async(() => {
        component.selectedWidget = { widgetId: 12345 };
        component.finalFormatedWidgetList = [{ widgetId: 12345, selectedValues: '' }, { widgetId: '12333', selectedValues: '' }];
        const event = {
            value: { min: 1, max: 10 }
        }
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.NUMBER)
        component.rangeTypeValueChange(event);
        expect(component.finalFormatedWidgetList[0].selectedValues).toEqual([{ start: 1, end: 10 }]);
    }));

    it('applyFilter(),apply filter when click on apply button for multi select type', () => {
        spyOn(router, 'navigate');
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();

        component.finalFormatedWidgetList = [{ widgetId: 12345, fieldId: 'MATL', selectedValues: [{ CODE: 'CODE', TEXT: 'TEXT' }] }];
        component.selectedWidget = { widgetId: 12345, fieldId: 'MATL' }
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.MULTI_SELECT)
        spyOn(widgetService, 'setFilterWidgetList').withArgs(component.filteredWidgetList);
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);

    });

    it('applyFilter(),apply filter when click on apply button for single select drop down', () => {
        spyOn(router, 'navigate');
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();

        component.selectedWidget = { widgetId: 12345, fieldId: 'MATL' }
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '1' } } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.DROP_DOWN)
        spyOn(widgetService, 'setFilterWidgetList').withArgs(component.filteredWidgetList);
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);


    });

    it('applyFilter(),apply filter when click on apply button for number type', () => {
        component.finalFormatedWidgetList = [{ widgetId: 12345, fieldId: 'MATL', selectedValues: [{ start: '1', end: '2' }] }];
        // const filterData = new FilterWidget();
        // filterData['12345'] = { metaData: { picklist: '0', dataType: 'NUMC' } };
        // spyOn(widgetService, 'getWidgetMetaDataDetails').and.returnValue(filterData);
        component.selectedWidget = { widgetId: 12345, fieldId: 'MATL' }
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '0', dataType: 'NUMC' } } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.NUMBER)
        spyOn(widgetService, 'setFilterWidgetList').withArgs(component.filteredWidgetList);
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();

    });

    it('applyFilter(),apply filter when click on apply button for time type', () => {
        component.finalFormatedWidgetList = [{ widgetId: 12345, fieldId: 'MATL', selectedValues: [{ start: { hours: '1', minutes: '23' }, end: { hours: '2', minutes: '45' } }] }];
        // const filterData = new FilterWidget();
        // filterData['12345'] = { metaData: { dataType: 'TIMS' } };
        // spyOn(widgetService, 'getWidgetMetaDataDetails').and.returnValue(filterData);
        component.selectedWidget = { widgetId: 12345, fieldId: 'MATL' }
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { dataType: 'TIMS' } } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.TIME)
        spyOn(widgetService, 'setFilterWidgetList').withArgs(component.filteredWidgetList);
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();
    });

    it('applyFilter(),apply filter when click on apply button for date type', () => {
        component.finalFormatedWidgetList = [{ widgetId: 12345, fieldId: 'MATL', selectedValues: [{ start: new Date(), end: new Date() }] }];
        // const filterData = new FilterWidget();
        // filterData['12345'] = { metaData: { dataType: 'DATS' } };
        // spyOn(widgetService, 'getWidgetMetaDataDetails').and.returnValue(filterData);
        component.selectedWidget = { widgetId: 12345, fieldId: 'MATL' }
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { dataType: 'DATS' } } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.DATE)
        spyOn(widgetService, 'setFilterWidgetList').withArgs(component.filteredWidgetList);
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();
    });

    it('applyFilter(),apply filter when click on apply button for date time', () => {
        component.finalFormatedWidgetList = [{ widgetId: 12345, fieldId: 'MATL', selectedValues: [{ start: '1', end: '2' }] }];
        component.selectedWidget = { widgetId: 12345, fieldId: 'MATL' }
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { dataType: 'DTMS' } } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.DATE_TIME)
        spyOn(widgetService, 'setFilterWidgetList').withArgs(component.filteredWidgetList);
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();
    });

    it('applyFilter(),apply filter when click on apply button', () => {
        component.finalFormatedWidgetList = [{ widgetId: 12345, fieldId: 'MATL', selectedValues: [{ CODE: 'CODE', TEXT: 'TEXT' }] }, { widgetId: '12333', selectedValues: '' }];
        component.selectedWidget = { widgetId: 12345, fieldId: 'MATL' }
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '1' }, isMultiSelect: true } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.DROP_DOWN)
        spyOn(widgetService, 'setFilterWidgetList').withArgs(component.filteredWidgetList);
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();
    });

    it('applyFilter(),apply filter when click on apply button', () => {
        component.finalFormatedWidgetList = [{ widgetId: 12345, fieldId: 'MATL', selectedValues: ['true'] }, { widgetId: '12333', selectedValues: '' }];
        component.selectedWidget = { widgetId: 12345, fieldId: 'MATL' }
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '2' } } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.CHECKBOX)
        spyOn(widgetService, 'setFilterWidgetList').withArgs(component.filteredWidgetList);
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();
    });

    it('applyFilter(),apply filter when click on apply button for multi select type', () => {
        spyOn(router, 'navigate');
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();

        component.finalFormatedWidgetList = [{ widgetId: 12345, fieldId: 'MATL', selectedValues: [{ CODE: 'CODE', TEXT: 'TEXT',parent: 'true' }] }];
        component.selectedWidget = { widgetId: 12345, fieldId: 'MATL' }
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.HIERARCHY)
        spyOn(widgetService, 'setFilterWidgetList').withArgs(component.filteredWidgetList);
        component.applyFilter();
        expect(component.applyFilter).toBeTruthy();
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);

    });

    it('changeDisplayCriteria(),change the display criteria for filter widget', async () => {
        component.selectedWidget = { widgetId: '12345' } as Widget;
        component.finalFormatedWidgetList = [{ widgetId: 12345 }, { widgetId: '12333' }];
        const type = DisplayCriteria.CODE;
        spyOn(widgetService, 'saveDisplayCriteria')
            .withArgs('12345', WidgetType.FILTER, type)
            .and.returnValue(of({}));

        component.changeDisplayCriteria(type);
        expect(widgetService.saveDisplayCriteria).toHaveBeenCalledWith('12345', WidgetType.FILTER, DisplayCriteria.CODE);
    });

    it('getSelectedTimeValue()', async () => {
        component.selectedWidget = { selectedValues: [{ start: { hours: 1, minutes: 30 }, end: { hours: 2, minutes: 30 } }] };
        // const result = component.getSelectedTimeValue();
        expect(component.getSelectedTimeValue()).toEqual(component.selectedWidget.selectedValues[0]);
    });

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

    it('getDateTypeValue()', async () => {
        let fld = '7654345';
        expect(component.getDateTypeValue(fld)).toEqual(fld);

        fld = 'aftadrtsa';
        expect(component.getDateTypeValue(fld)).toEqual('');
    });

    it('getPreSelectedRangeValue()', async () => {
        component.finalFormatedWidgetList = [{ widgetId: '1234', selectedValues: [{ start: 1, end: 12 }] }, { widgetId: '12333', selectedValues: '' }];
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

        const result = component.getPreSelectedRangeValue('1234');
        expect(result.min).toEqual(1);
    });


    it('checkIsRangeField(),check selected widget is of data/time/data_time/number', async () => {
        const filterData = new FilterWidget();
        filterData['12345'] = { metaData: { dataType: 'DATS' } };
        component.selectedWidget = { widgetId: '12345' };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { dataType: 'DTMS' }} as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.DATE_TIME)
        expect(component.checkIsRangeField(component.selectedWidget.widgetId)).toEqual(true);
    });

    it('checkIsRangeField(),check selected widget is of multiselect', async () => {
        component.selectedWidget = { widgetId: '12345' }
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '1' , isCheckList:true} as any } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.MULTI_SELECT)
        expect(component.checkIsRangeField(component.selectedWidget.widgetId)).toEqual(false);
    });

    it('getSelectedValue() get selected value to show in date', () => {
        component.finalFormatedWidgetList = [{ widgetId: 12345, selectedValues: [1], selectedDateType: 'Last_Week' }, { widgetId: 12333, selectedValues: '' }];
        component.selectedWidget = { widgetId: 12345, selectedValues: [1] };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { dataType: 'DATS' } } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.DATE)
        const result = component.getSelectedValue(component.selectedWidget.widgetId);
        expect(result.type).toEqual('Last_Week');
    });

    it('getSelectedValue() get selected value to show in text', () => {
        component.selectedWidget = { widgetId: 12345, selectedValues: ['text'] };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '30', dataType: 'CHAR' }, isMultiSelect: true } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.TEXT)
        expect(component.getSelectedValue(component.selectedWidget.widgetId)).toEqual(component.selectedWidget.selectedValues[0]);
    });

    it('getSelectedValue() get selected value to show in text', () => {
        component.selectedWidget = { widgetId: 12345, selectedValues: ['text'] };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '30', dataType: 'CHAR' }, isMultiSelect: true } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.MULTI_SELECT)
        expect(component.getSelectedValue(component.selectedWidget.widgetId)).toEqual(component.selectedWidget.selectedValues);
    });

    it('getWidgetDataType(), get selected widget data type of text', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '0', dataType: 'CHAR' } } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.TEXT)
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.TEXT);
    });

    it('getWidgetDataType(),get selected widget data type', () => {
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { dataType: 'DAT' } } as Widget];
        component.selectedWidget = { widgetId: 12345, selectedValues: [{ start: '327372873', end: '328948993' }] };
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(false);
    });

    it('getWidgetDataType(),get selected widget data type of checkbox', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '2', dataType: 'CHAR' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.CHECKBOX);
    });

    it('getWidgetDataType(),get selected widget data type of radio', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '35' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.RADIO)
    });

    it('getWidgetDataType(),get selected widget data type of text area', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '22', dataType: 'CHAR' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.TEXTAREA);
    });

    it('getWidgetDataType(),get selected widget data type return false', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '200', dataType: 'CHAR' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(false);
    });

    it('getWidgetDataType(),get selected widget data type of date', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { dataType: 'DATS' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.DATE);
    });

    it('getWidgetDataType(),get selected widget data type of date and time', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { dataType: 'DTMS' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs('12345').and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType('12345')).toEqual(FormControlType.DATE_TIME);
    });

    it('getWidgetDataType(),get selected widget data type of time', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { dataType: 'TIMS' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.TIME);
    });

    it('getWidgetDataType(),get selected widget data type of drop down', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '1' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.DROP_DOWN);
    });

    it('getWidgetDataType(),get selected widget data type of multiselect', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '1' ,isCheckList:'true'} as any } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.MULTI_SELECT);
    });

    it('getWidgetDataType(),get selected widget data type of number', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '0', dataType: 'NUMC' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.NUMBER);
    });

    it('getWidgetDataType(),get selected widget data type of hierarchy', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '29' } } as Widget];
        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.HIERARCHY);
    });

    it('getWidgetDataType(),get selected widget data type', () => {
        component.selectedWidget = { widgetId: 12345 };
        component.filteredWidgetList = [{ widgetId: '12345', field: 'USERMODIFIED', fieldCtrl: null } as Widget];
        component.systemFields = [
            {
                fieldId: 'STATUS',
                fieldDescri: 'Status',
                childs: [],
                isGroup: false
            },
            {
                fieldId: 'USERMODIFIED',
                fieldDescri: 'User Modified',
                childs: [],
                isGroup: false,
                fldCtrl: {
                    picklist: '1',
                    dataType: 'AJAX',
                    fieldId: 'USERMODIFIED',
                } as MetadataModel
            }
        ];

        spyOn(component, 'getWidgetData').withArgs(component.selectedWidget.widgetId).and.returnValue(component.filteredWidgetList[0]);
        expect(component.getWidgetDataType(component.selectedWidget.widgetId)).toEqual(FormControlType.DROP_DOWN);
    });

    it('removedSelectedFilter(), Remove the selected filter from the lib chip', async () => {
        const filterData4 = new FilterWidget();
        filterData4['12345'] = { metaData: { picklist: '1' }, isMultiSelect: true };
        component.selectedWidget = { fieldId: 'MATL', widgetId: '12345' }
        component.finalFormatedWidgetList = [{ fieldId: 'MATL', widgetId: '12345', selectedValues: [{ CODE: 'first', TEXT: 'test' }] }, { widgetId: '12333' }];
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '1' }, isMultiSelect: true } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.MULTI_SELECT)
        component.removedSelectedFilter('first', 0);
        expect(component.finalFormatedWidgetList[0].selectedValues.length).toEqual(0);
    });

    it('removedSelectedFilter(), Remove the selected filter from the lib chip', async () => {
        component.filteredCriteriaList = [{ fieldId: 'MATL', conditionFieldValue: 'first' } as Criteria];
        component.selectedWidget = { fieldId: 'MATL', widgetId: '12345' }
        component.finalFormatedWidgetList = [{ fieldId: 'MATL', widgetId: '12345', conditionFieldValue: 'first', selectedValues: [{ CODE: 'first', TEXT: 'test' }] }, { widgetId: '12333' }];
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '1', dataType: 'CHAR' } } as Widget];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.DROP_DOWN)
        component.removedSelectedFilter('first', 0);
        expect(component.finalFormatedWidgetList[0].conditionFieldValue).toEqual(null);
    });

    it('removedSelectedFilter(), Remove the selected hierarchy filter from the lib chip', async () => {
        const filterData4 = new FilterWidget();
        filterData4['12345'] = { metaData: { picklist: '1' }, isMultiSelect: true };
        component.selectedWidget = { fieldId: 'MATL', widgetId: '12345' }
        component.finalFormatedWidgetList = [{ fieldId: 'MATL', widgetId: '12345', selectedValues: [{ CODE: '1102', TEXT: 'INDIA', parent:'true', child: [{nodeId: '1220', nodeDesc: 'Delhi', parent:'false', child: [{nodeId: '11922', nodeDesc: 'Saket', parent:'false', child: null}]}] },{CODE: '11922', TEXT: 'Saket', parent:'false', child: null}] }, { widgetId: '12333' }];
        component.filteredWidgetList = [{ widgetId: '12345', field: 'MATL', fieldCtrl: { picklist: '1' }, isMultiSelect: true } as Widget];
        component.hierarchyFilterApplied['12345'] = [{ CODE: 'first', TEXT: 'test', parent:'true', child: null }];
        spyOn(component, 'getWidgetDataType').withArgs(component.selectedWidget.widgetId).and.returnValue(FormControlType.HIERARCHY)
        component.removedSelectedFilter('1102', 0);
        expect(component.finalFormatedWidgetList[0].selectedValues.length).toEqual(0);
    });

    it('searchHeader(),function to search headers from search bar', async () => {
        component.finalFormatedWidgetList = [{ name: 'Material', fieldId: 'MATL', widgetId: '12345' }];
        component.searchHeader('Material');
        expect(component.searchHeader).toBeTruthy();
        component.searchHeader('');
        expect(component.searchHeader).toBeTruthy();
    });

    it('clearSelectedFilter(), Remove the selected filter from the lib chip', async () => {
        component.finalFormatedWidgetList = [{ fieldId: 'MATL', widgetId: '12345', selectedValues: [{ CODE: 'first', TEXT: 'test' }] }];
        const event = { fieldId: 'MATL', widgetId: '12345', selectedValues: [{ CODE: 'first', TEXT: 'test' }] }
        component.selectedWidget = { widgetId: '1234' } as Widget;
        component.hierarchyFilterApplied['1234'] = [{ CODE: 'first', TEXT: 'test' }];
        component.clearSelectedFilter(event);
        expect(component.finalFormatedWidgetList[0].selectedValues).toEqual(null);
        expect(component.hierarchyFilterApplied['1234']).toEqual([]);
    });


    it('getColumnNames(), should get column names when filter is not applied', async(() => {
        const filterWidget = [{ widgetId: '12345', fieldCtrl: { picklist: '1' }, widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));

    it('getColumnNames(), should get column names when filter is not applied ', async(() => {
        const filterWidget = [{ widgetId: '12345', fieldCtrl: { picklist: '1' }, widgetAdditionalProperties: null } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));

    it('getColumnNames(), should get column names when filter is not applied, for date type widget ', async(() => {
        const filterWidget = [{ widgetId: '12345', fieldCtrl: { dataType: 'DTMS' }, widgetAdditionalProperties: null } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));


    it('getColumnNames(), should get column names, for single select drop down', async(() => {
        const filterWidget = [{ widgetId: '12345', field: 'FLD', fieldCtrl: { picklist: '1' }, widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        const filterCritera = [{ widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', conditionFieldValue: 'value', conditionFieldValueText: 'Text', widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.EQUAL }];
        spyOnProperty(widgetService, 'getFilterCriteria').and.returnValue(filterCritera);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));

    it('getColumnNames(), should get column names,for multiselect drop down', async(() => {
        const filterWidget = [{ widgetId: '12345', field: 'FLD', fieldCtrl: { picklist: '1' }, isMultiSelect:true,widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        const filterCritera = [{ widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', conditionFieldValue: 'value', conditionFieldValueText: 'Text', widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.EQUAL }];
        spyOnProperty(widgetService, 'getFilterCriteria').and.returnValue(filterCritera);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));

    it('getColumnNames(), should get column names,for multiselect drop down with multiple filter criteria values', async(() => {
        const filterWidget = [{ widgetId: '12345', field: 'FLD', fieldCtrl: { picklist: '1' }, isMultiSelect:true,widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        const filterCritera = [{ widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', conditionFieldValue: 'value', conditionFieldValueText: 'Text', widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.EQUAL },{ widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', conditionFieldValue: 'value1', conditionFieldValueText: 'Text', widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.EQUAL }];
        spyOnProperty(widgetService, 'getFilterCriteria').and.returnValue(filterCritera);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));

    it('getColumnNames(), should get column names, for hierarchy filter', async(() => {
        const filterWidget = [{ widgetId: '12345', field: 'FLD', fieldCtrl: { picklist: '29' },widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        const filterCritera = [{ widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', conditionFieldValue: '1100022', conditionFieldValueText: 'INDIA', parent:'true', widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.EQUAL },
                               { widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', conditionFieldValue: '222033', conditionFieldValueText: 'AUSTRALIA', parent:'true', widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.EQUAL }];
        spyOnProperty(widgetService, 'getFilterCriteria').and.returnValue(filterCritera);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));

    it('getColumnNames(), should get column names, for text area', async(() => {
        const filterWidget = [{ widgetId: '12345', field: 'FLD', fieldCtrl: { picklist: '0' , dataType : 'CHAR'},widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        const filterCritera = [{ widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', conditionFieldValue: 'value', conditionFieldValueText: 'Text', widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.EQUAL }];
        spyOnProperty(widgetService, 'getFilterCriteria').and.returnValue(filterCritera);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));


    it('getColumnNames(), should get column names, for date type', async(() => {
        const filterWidget = [{ widgetId: '12345', field: 'FLD', fieldCtrl: { dataType:'DATS' },widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        const filterCritera = [{ widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.RANGE }];
        spyOnProperty(widgetService, 'getFilterCriteria').and.returnValue(filterCritera);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));

    it('getColumnNames(), should get column names, for time', async(() => {
        const filterWidget = [{ widgetId: '12345', field: 'FLD', fieldCtrl: { dataType:'TIMS' },widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        const filterCritera = [{ widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', conditionFieldStartValue: {hours:1,minutes:30}, conditionFieldEndValue:{hours:3,minutes:30}, widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.RANGE }];
        spyOnProperty(widgetService, 'getFilterCriteria').and.returnValue(filterCritera);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));

    it('getColumnNames(), should get column names for numeric field', async(() => {
        const filterWidget = [{ widgetId: '12345', field: 'FLD', fieldCtrl: { dataType:'NUMC' ,picklist:'0' },widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty } as Widget];
        spyOnProperty(widgetService, 'getFilterWidgetList').and.returnValue(filterWidget);
        const filterCritera = [{ widgetId: 12345, displayCriteria: 'CODE_TEXT', fieldId: 'FLD', conditionFieldId: 'FLD', conditionFieldStartValue:0,conditionFieldEndValue : 10, widgetType: WidgetType.FILTER, conditionOperator: ConditionOperator.RANGE }];
        spyOnProperty(widgetService, 'getFilterCriteria').and.returnValue(filterCritera);
        component.getColumnNames();
        expect(component.getColumnNames).toBeTruthy();
    }));
});