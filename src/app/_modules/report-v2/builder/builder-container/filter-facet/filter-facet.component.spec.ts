import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterFacetComponent } from './filter-facet.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Criteria, Widget, WidgetType, FormControlType, DisplayCriteria, WidgetAdditionalProperty } from '../../../_models/widget';
import { WidgetService } from '@services/widgets/widget.service';
import { of } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';
import { SimpleChanges } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '@services/user/userservice.service';
import { Userdetails } from '@models/userdetails';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { DatePipe } from '@angular/common';

describe('FilterFacetComponent', () => {
    let component: FilterFacetComponent;
    let fixture: ComponentFixture<FilterFacetComponent>;
    let widgetService: WidgetService;
    let userService: UserService;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FilterFacetComponent],
            imports: [RouterTestingModule, MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, SharedModule],
            providers: [WidgetService, UserService, DatePipe]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterFacetComponent);
        widgetService = fixture.debugElement.injector.get(WidgetService);
        userService = fixture.debugElement.injector.get(UserService);
        component = fixture.componentInstance;
        // fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnDestroy()', () => {
        component.ngOnDestroy();
        expect(component.ngOnDestroy).toBeTruthy();
    });

    it('removeOldFilterCriteria(), remove olf filter criteria ', async(() => {
        const filter: Criteria = new Criteria();
        filter.conditionFieldId = '1234';
        filter.conditionFieldValue = 'ZMRO';
        component.filterCriteria = [filter];
        component.widgetInfo = { fieldCtrl: {}, field: '1234' } as Widget;
        const result = component.removeOldFilterCriteria();
        expect(result.length).toEqual(0);
    }));

    it('updateFilterCriteria(), update filter criteria', async () => {
        component.widgetId = 12345;
        const filter: Criteria = new Criteria();
        filter.conditionFieldId = '12345';
        filter.conditionFieldValue = 'ZMRO';
        component.filterCriteria = [filter];

        const option1 = { value: { start: '137787372', end: '1347457478' }, type: 'Last_Week' };
        component.widgetInfo = { fieldCtrl: { dataType: 'DATS' }, field: '123845' } as Widget;
        component.updateFilterCriteria(option1)
        expect(component.filterCriteria.length).toEqual(2);

        component.filterCriteria = [];
        const option3 = { value: { start: '1277127762', end: '132737437347' }, type: 'Last_Month' };
        component.widgetInfo = { fieldCtrl: { dataType: 'DTMS' } } as Widget;
        component.updateFilterCriteria(option3)
        expect(component.filterCriteria.length).toEqual(1);

        component.filterCriteria = [];
        const option4 = 'Test';
        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'TEXT' } } as Widget;
        component.updateFilterCriteria(option4)
        expect(component.filterCriteria.length).toEqual(1);

        component.filterCriteria = [];
        component.widgetInfo = { fieldCtrl: { picklist: '1', isCheckList: 'true' } as any } as Widget;
        const option5 = [{ CODE: 'test', TEXT: 'text' }]
        component.updateFilterCriteria(option5)
        expect(component.filterCriteria.length).toEqual(1);

        component.filterCriteria = [];
        component.widgetInfo = { fieldCtrl: { picklist: '1' } } as Widget;
        const option6 = [{ CODE: 'test', TEXT: 'text' }]
        component.updateFilterCriteria(option6)
        expect(component.filterCriteria.length).toEqual(1);

        component.filterCriteria = [];
        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'DEC' } } as Widget;
        const option7 = { min: '1', max: '1' };
        component.updateFilterCriteria(option7)
        expect(component.filterCriteria.length).toEqual(1);

        component.filterCriteria = [];
        const option8 = { start: '1', end: '1' };
        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'NUMC' } } as Widget;
        component.updateFilterCriteria(option8)
        expect(component.filterCriteria.length).toEqual(1);

        component.filterCriteria = [];
        const opt = [{ nodeId: '12345', nodeDesc: 'Material' }];
        component.widgetInfo = { fieldCtrl: { picklist: '29' } } as Widget;
        component.updateFilterCriteria(opt)
        expect(component.filterCriteria.length).toEqual(1);

        component.filterCriteria = [];
        const opt1 = { start: { hours: 1, minutes: 23 }, end: { hours: 2, minutes: 37 } };
        component.widgetInfo = { fieldCtrl: { dataType: 'TIMS' }, field: '12345' } as Widget;
        component.updateFilterCriteria(opt1)
        expect(component.filterCriteria.length).toEqual(1);
    });

    it('ngOnInit()', async () => {
        component.widgetId = 12345;
        component.widgetInfo = { widgetId: '12345', widgetType: WidgetType.FILTER } as Widget;
        const filter: Criteria = new Criteria();
        filter.conditionFieldId = '12345';
        filter.conditionFieldValue = 'ZMRO';
        filter.conditionFieldStartValue = '1';
        filter.conditionFieldEndValue = '2';
        filter.conditionFieldValueText = 'Last_Week';
        filter.fieldId = 'MATL'
        component.filterCriteria = [filter];
        widgetService.isSideSheetClose.next(component.filterCriteria);
        component.widgetInfo = { fieldCtrl: { dataType: 'NUMC', picklist: '0' }, widgetAdditionalProperties: { displayCriteria: DisplayCriteria.TEXT } as WidgetAdditionalProperty, widgetId: '12345' } as Widget;

        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();
        expect(component.displayCriteriaOption).toEqual(DisplayCriteria.TEXT);

        component.ngOnInit()
        component.widgetInfo = { fieldCtrl: { dataType: 'NUMC', picklist: '0' } as MetadataModel, widgetAdditionalProperties: null } as Widget
        expect(component.displayCriteriaOption).toEqual(DisplayCriteria.TEXT)
    });

    it('clearFilterCriteria(), clear filter', async () => {
        // component.filterWidget = { widgetId: 1234, fieldId: '12345', metaData: { picklist: '29' } } as FilterWidget;
        component.filterCriteria = [{ conditionFieldId: '1234', conditionFieldValue: 'ZMRO' } as Criteria];
        component.isClearFilter = true;
        component.clearFilterCriteria();
        expect(component.filterCriteria.length).toEqual(0);
        expect(component.isClearFilter).toEqual(false);
        expect(component.widgetSelectedValue).toEqual(null);
    });
    it('removeAppliedFilter(), remove applied filter', async () => {
        component.filterCriteria = [{ fieldId: '12345', conditionFieldId: '12345', widgetType: WidgetType.FILTER, conditionFieldValue: 'ZMRO' } as Criteria];
        component.widgetSelectedValue = [{ fieldId: '12345' }]
        component.removeAppliedFilter('12345');
        expect(component.widgetSelectedValue).toEqual(null);
        expect(component.filterCriteria.length).toEqual(0);

        component.filterCriteria = [{ fieldId: '123458', conditionFieldId: '123458', widgetType: WidgetType.FILTER, conditionFieldValue: 'ZMRO' } as Criteria];
        component.widgetSelectedValue = [{ fieldId: '12345' }]
        component.removeAppliedFilter('12345');
        expect(component.widgetSelectedValue).toEqual(null);
        expect(component.filterCriteria.length).toEqual(1);
    });

    it('getPreSelectedRangeValue()', async () => {
        component.widgetSelectedValue = [{ fieldId: '12345' }]
        const result = component.getPreSelectedRangeValue();
        expect(result[0]).toEqual(component.widgetSelectedValue[0]);
    });

    it('ngOnChanges()', async () => {
        component.widgetInfo = { widgetId: '12345', widgetType: WidgetType.FILTER } as Widget;
        component.widgetId = 12345;
        const change: SimpleChanges = {
            filteredWidgetList: {
                previousValue: [{ widgetId: '1234', filterType: 'Filter' } as Widget],
                currentValue: [{ widgetId: '1234', filterType: 'Filter' } as Widget, { widgetId: '12345', filterType: 'Filter' } as Widget],
                firstChange: false,
                isFirstChange() { return null }
            },
            reportId: {
                previousValue: '1234',
                currentValue: '2345',
                firstChange: false,
                isFirstChange() { return null }
            },
            hasFilterCriteria: {
                previousValue: 'TEXT',
                currentValue: 'CODE',
                firstChange: false,
                isFirstChange() { return null }
            },
        };

        component.ngOnChanges(change);
        expect(component.ngOnChanges).toBeTruthy();

        const change1: SimpleChanges = {
            filteredWidgetList: {
                previousValue: [{ widgetId: '1234', filterType: 'Filter' } as Widget],
                currentValue: [{ widgetId: '12345', filterType: 'Filter' } as Widget],
                firstChange: false,
                isFirstChange() { return null }
            },
            reportId: {
                previousValue: '1234',
                currentValue: '1234',
                firstChange: false,
                isFirstChange() { return null }
            },
            hasFilterCriteria: {
                previousValue: 'TEXT',
                currentValue: 'CODE',
                firstChange: false,
                isFirstChange() { return null }
            },
        };
        component.ngOnChanges(change1);
        expect(component.ngOnChanges).toBeTruthy();
    });

    it('getWidgetType(),get selected widget data type', () => {
        component.widgetId = 12345;
        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'DAT' } } as Widget;
        expect(component.getWidgetType()).toEqual(false);

        component.widgetInfo = { fieldCtrl: { picklist: '2' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.CHECKBOX);

        component.widgetInfo = { fieldCtrl: { picklist: '4' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.RADIO)

        component.widgetInfo = { fieldCtrl: { picklist: '22', dataType: 'CHAR' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.TEXTAREA);

        component.widgetInfo = { fieldCtrl: { picklist: '220' } } as Widget;
        expect(component.getWidgetType()).toEqual(false);

        component.widgetInfo = { fieldCtrl: { dataType: 'DATS' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.DATE);

        component.widgetInfo = { fieldCtrl: { dataType: 'DTMS' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.DATE_TIME);

        component.widgetInfo = { fieldCtrl: { dataType: 'TIMS' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.TIME);

        component.widgetInfo = { fieldCtrl: { picklist: '1' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.DROP_DOWN);

        component.widgetInfo = { fieldCtrl: { picklist: '1', isCheckList: 'true' } as any } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.MULTI_SELECT);

        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'DEC' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.NUMBER);

        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'TEXT' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.TEXT);

        component.widgetInfo = { fieldCtrl: { picklist: '29' } } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.HIERARCHY);

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
            }, {
                fieldId: 'DATEMODIFIED',
                fieldDescri: 'Update Date',
                childs: [],
                isGroup: false,
                fldCtrl: {
                    picklist: '0',
                    dataType: 'DTMS',
                    fieldId: 'DATEMODIFIED',
                } as MetadataModel
            }, {
                fieldId: 'DATECREATED',
                fieldDescri: 'Creation Date',
                childs: [],
                isGroup: false,
                fldCtrl: {
                    picklist: '0',
                    dataType: 'DTMS',
                    fieldId: 'DATECREATED',
                } as MetadataModel
            }
        ];
        component.widgetInfo = { fieldCtrl: null, field: 'DATECREATED' } as Widget;
        expect(component.getWidgetType()).toEqual(FormControlType.DATE_TIME);

        component.widgetInfo = { fieldCtrl: null } as Widget;
        expect(component.getWidgetType()).toBeFalse();
    });

    it('getUsetDetails()', async(() => {

        const res = { dateformat: 'MM.dd.yy' } as Userdetails;
        spyOn(userService, 'getUserDetails').and.returnValue(of(res));
        component.getUserDetails();
        expect(component.getUserDetails).toBeTruthy();
        expect(component.dateFormat).toEqual('MM.dd.yyyy, HH:mm:ss');
    }));

    it('getUsetDetails(),when date format is dd.MM.yy', async(() => {

        const res = { dateformat: 'dd.MM.yy' } as Userdetails;
        spyOn(userService, 'getUserDetails').and.returnValue(of(res));
        component.getUserDetails();
        expect(component.getUserDetails).toBeTruthy();
        expect(component.dateFormat).toEqual('dd.MM.yyyy, HH:mm:ss');
    }));

    it('getUsetDetails(),when date format is dd M, yy', async(() => {

        const res = { dateformat: 'dd M, yy' } as Userdetails;
        spyOn(userService, 'getUserDetails').and.returnValue(of(res));
        component.getUserDetails();
        expect(component.getUserDetails).toBeTruthy();
        expect(component.dateFormat).toEqual('dd MMM, yyyy, HH:mm:ss');
    }));

    it('getUsetDetails(),when date format is MM d, yy', async(() => {

        const res = { dateformat: 'MM d, yy' } as Userdetails;
        spyOn(userService, 'getUserDetails').and.returnValue(of(res));
        component.getUserDetails();
        expect(component.getUserDetails).toBeTruthy();
        expect(component.dateFormat).toEqual('MMMM d, yyyy, HH:mm:ss');
    }));


    it('getUsetDetails(), when date format is dd-MM-YYY', async(() => {

        const res = { dateformat: 'dd-MM-yyyy' } as Userdetails;
        spyOn(userService, 'getUserDetails').and.returnValue(of(res));
        component.getUserDetails();
        expect(component.getUserDetails).toBeTruthy();
    }));

    it('getLabel(), should return display type', async () => {
        const option = { CODE: 'CODE', TEXT: 'TEXT' };
        expect(component.getLabel(option, 'CODE')).toEqual('CODE');

        expect(component.getLabel(option, 'TEXT')).toEqual('TEXT');

        expect(component.getLabel(option, 'CODE_TEXT')).toEqual('CODE-TEXT');
    });

    it('menuClosed(), toggle when menu closed', async(() => {
        component.menuClosed();
        expect(component.isMenuClosed).toBeTrue();
    }))

    it('menuOpen, call when mat menuopen', async(() => {
        const ev = new Event('click');
        component.openMenu(ev);
        expect(component.isMenuClosed).toBeFalse();
    }))


    it('get Widget Name', async(() => {
        component.widgetInfo = { fieldCtrl: null, widgetTitle: 'Widget Filter' } as Widget;
        expect(component.getWidgetName).toEqual('Widget Filter');

        component.widgetInfo = { fieldCtrl: null, widgetTitle: null } as Widget;
        expect(component.getWidgetName).toEqual('Unknown');
    }))

    it('get selected date value', async(() => {
        component.widgetSelectedValue = {};
        expect(component.getSelectedDateValue).toEqual({ value: { start: '', end: '' }, type: '' });

        component.widgetSelectedValue = { value: { start: 323783787, end: 372782998 }, type: '3_QUARTER' };
        expect(component.getSelectedDateValue).toEqual({ value: { start: 323783787, end: 372782998 }, type: '3_QUARTER' });

        component.widgetSelectedValue = null;
        expect(component.getSelectedDateValue).toEqual(null);
    }))

    it('prepareTextToShow(), return text to show on chip list', async(() => {
        component.widgetSelectedValue = [{ CODE: 'code', TEXT: 'text' }];
        component.displayCriteriaOption = DisplayCriteria.TEXT;
        component.widgetInfo = { fieldCtrl: { picklist: '30', isCheckList: 'true' } as any } as Widget;
        expect(component.prepareTextToShow).toEqual('text');

        component.widgetSelectedValue = [{ CODE: 'code', TEXT: 'text' }, { CODE: 'code1', TEXT: 'text2' }];
        expect(component.prepareTextToShow).toEqual('2');

        component.widgetInfo = { fieldCtrl: { picklist: '30' } } as Widget;
        component.widgetSelectedValue = { CODE: 'code', TEXT: 'text' };
        expect(component.prepareTextToShow).toEqual('text');

        component.widgetInfo = { fieldCtrl: { picklist: '29' } } as Widget;
        component.widgetSelectedValue = [{ CODE: '10022', TEXT: 'INDIA', parent: 'true' }];
        expect(component.prepareTextToShow).toEqual('INDIA');

        component.widgetSelectedValue = [{ CODE: '10023', TEXT: 'Delhi', parent: 'true' }, { CODE: '10022', TEXT: 'INDIA', parent: 'true' }];
        expect(component.prepareTextToShow).toEqual('2');

        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'CHAR' } } as Widget;
        component.widgetSelectedValue = 'text';
        expect(component.prepareTextToShow).toEqual('text');

        component.widgetInfo = { fieldCtrl: { picklist: '22', dataType: 'CHAR' } } as Widget;
        component.widgetSelectedValue = 'text';
        expect(component.prepareTextToShow).toEqual('text');

        component.widgetInfo = { fieldCtrl: { picklist: '2' } } as Widget;
        component.widgetSelectedValue = 'true';
        expect(component.prepareTextToShow).toEqual('true');

        component.widgetInfo = { fieldCtrl: { picklist: '4' } } as Widget;
        component.widgetSelectedValue = { CODE: 'code', TEXT: 'text' };
        expect(component.prepareTextToShow).toEqual('text');

        component.widgetInfo = { fieldCtrl: { picklist: '35' } } as Widget;
        component.widgetSelectedValue = { CODE: 'code', TEXT: 'text' };
        expect(component.prepareTextToShow).toEqual('text');

        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'NUMC' } } as Widget;
        component.widgetSelectedValue = { min: 1, max: 3 };
        expect(component.prepareTextToShow).toEqual('1 - 3');

        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'NUMC' } } as Widget;
        component.widgetSelectedValue = { min: 0, max: 3 };
        expect(component.prepareTextToShow).toEqual('0 - 3');

        component.widgetInfo = { fieldCtrl: { dataType: 'DATS' } } as Widget;
        component.widgetSelectedValue = { value: { start: 3267632, end: 3772783 }, type: 'date_range' };
        expect(component.prepareTextToShow).toBeTruthy();

        component.widgetInfo = { fieldCtrl: { dataType: 'DATS' } } as Widget;
        component.widgetSelectedValue = { value: { start: 3267632, end: 3267632 }, type: 'sp_date' };
        expect(component.prepareTextToShow).toBeTruthy();

        component.widgetInfo = { fieldCtrl: { dataType: 'DATS' } } as Widget;
        component.widgetSelectedValue = { value: { start: 3267632, end: 3772783 }, type: 'QUARTER_3' };
        expect(component.prepareTextToShow).toEqual('QUARTER 3');

        component.widgetInfo = { fieldCtrl: { dataType: 'TIMS' } } as Widget;
        component.widgetSelectedValue = { start: { hours: 1, minutes: 21 }, end: { hours: 2, minutes: 21 } };
        expect(component.prepareTextToShow).toEqual('1 hr 21 min - 2 hr 21 min');

        component.widgetInfo = { fieldCtrl: { dataType: 'TIMS' } } as Widget;
        component.widgetSelectedValue = null;
        expect(component.prepareTextToShow).toEqual('All');
    }))

    it('checkForSelectedValue(), get selected value', async(() => {
        let filter = { conditionFieldId: '1234', conditionFieldValue: 'ZMRO', fieldId: '1234', conditionFieldValueText: 'ZMRO' } as Criteria;
        let filterCriteria = [filter];
        component.widgetInfo = { fieldCtrl: { picklist: '30' }, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.widgetSelectedValue).toEqual({ CODE: 'ZMRO', TEXT: 'ZMRO' });

        component.widgetInfo = { fieldCtrl: { picklist: '30', isCheckList: 'true' } as any, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.widgetSelectedValue.length).toEqual(1);

        component.widgetInfo = { fieldCtrl: { picklist: '35' }, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.widgetSelectedValue).toEqual({ CODE: 'ZMRO', TEXT: 'ZMRO' });

        component.widgetInfo = { fieldCtrl: { picklist: '2', dataType: 'CHAR' }, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.widgetSelectedValue).toEqual('ZMRO');

        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'CHAR' }, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.widgetSelectedValue).toEqual('ZMRO');

        filter = { conditionFieldId: '1234', conditionFieldStartValue: '1', conditionFieldEndValue: '2', fieldId: '1234' } as Criteria;
        filterCriteria = [filter];
        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'NUMC' }, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.widgetSelectedValue).toEqual({ min: '1', max: '2' });

        filter = { conditionFieldId: '1234', conditionFieldStartValue: '13673673', conditionFieldEndValue: '237873873', conditionFieldValueText: 'yesterday', fieldId: '1234' } as Criteria;
        filterCriteria = [filter];
        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'DTMS' }, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.checkForSelectedValue).toBeTruthy()

        filter = { conditionFieldId: '1234', conditionFieldStartValue: '13673673', conditionFieldEndValue: '237873873', conditionFieldValueText: 'yesterday', fieldId: '1234' } as Criteria;
        filterCriteria = [filter];
        component.widgetInfo = { fieldCtrl: { picklist: '0', dataType: 'DATS' }, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.checkForSelectedValue).toBeTruthy()

        filter = { conditionFieldId: '1234', conditionFieldValue: 'IN', conditionFieldValueText: 'INDIA', fieldId: '1234' } as Criteria;
        filterCriteria = [filter];
        component.widgetInfo = { fieldCtrl: { picklist: '29' }, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.checkForSelectedValue).toBeTruthy()

        filter = { conditionFieldId: '1234', conditionFieldStartValue: '13673673', conditionFieldEndValue: '237873873', conditionFieldValueText: 'yesterday', fieldId: '1234' } as Criteria;
        filterCriteria = [filter];
        component.widgetInfo = { fieldCtrl: { dataType: 'TIMS' }, field: '1234' } as Widget;
        component.checkForSelectedValue(filterCriteria);
        expect(component.checkForSelectedValue).toBeTruthy()
    }))

    it('checkForDefaultDateSelected(), get default date', async(() => {
        component.filterCriteria = [];
        component.widgetInfo = { dateFilterCtrl: {dateSelectedFor: 'DAY_30'} } as Widget;
        component.checkForDefaultDateSelected();
        expect(component.widgetSelectedValue.type).toEqual('date_range');

        component.widgetInfo = { dateFilterCtrl: {dateSelectedFor: 'TODAY'} } as Widget;
        component.checkForDefaultDateSelected();
        expect(component.widgetSelectedValue.type).toEqual('sp_date');

        component.widgetInfo = { dateFilterCtrl: {dateSelectedFor: 'CUSTOM', startDate: '12/01/2021', endDate:'13/01/2021'} } as Widget;
        component.checkForDefaultDateSelected();
        expect(component.widgetSelectedValue.type).toEqual('date_range');
    }));
});