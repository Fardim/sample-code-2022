
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FilterDateBulder, FilterDateSelectionType, MonthBulder, MonthSelectionType, QuarterBulder, QuarterSelectionType, WeekBulder, WeekSelectionType, YearBulder, YearSelectionType } from '@modules/report-v2/_models/widget';
import { DateFilterQuickSelect } from '@modules/report/_models/widget';
import { isEqual } from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'pros-form-date',
    templateUrl: './form-date.component.html',
    styleUrls: ['./form-date.component.scss']
})

export class FormDateComponent implements OnInit, OnChanges {

    @Input() selectedDate: any;
    @Input() widgetId: string
    @Output() valueChange = new EventEmitter<any>();


    @Input() isFilterWidget: boolean;
    dateCtrl: FormControl;
    dateFilterQuickSelect: DateFilterQuickSelect[];

    pickerCtrl: FormControl;
    /**
     * holds date range value
     */
    dateRangeValue: { start: Date; end: Date } = { start: null, end: null };
    dateValue: Date;

    /**
     * holds selected date option
     */
    selectedDateOption = '';
    /**
     * holds available date picker list
     */
    datePickerList = ['Day', 'Week', 'Month', 'Quarter', 'Year'];
    /**
     * holds current date picker type
     */
    currentPickerType = '';

    /**
     * holds date picker options list
     */
    get datePickerOptionsList() {
        const list = [];

        if (this.currentPickerType) {
            if (this.currentPickerType === 'Day') {
                list.push(
                    {
                        value: 'today',
                        key: 'Today'
                    },
                    {
                        value: 'yesterday',
                        key: 'Yesterday'
                    }
                );
            } else {
                list.push(
                    {
                        value: `This_${this.currentPickerType}`,
                        key: `This ${this.currentPickerType.toLowerCase()}`
                    },
                    {
                        value: `Last_${this.currentPickerType}`,
                        key: `Last ${this.currentPickerType.toLowerCase()}`
                    }
                );
            }
            for (let i = 2; i <= this.getSelectedDataLength() - 1; i++) {
                list.push(
                    {
                        value: `Last_${i}_${this.currentPickerType}`,
                        key: `Last ${i} ${this.currentPickerType.toLowerCase()}s`
                    }
                );
            }
            return list;
        }
        else return [];
    }

    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.selectedDate && changes.selectedDate.previousValue !== undefined && !isEqual(changes.selectedDate.previousValue, changes.selectedDate.currentValue)) {
            if (changes.selectedDate.currentValue && changes.selectedDate.currentValue.type === 'sp_date') {
                this.dateValue = changes.selectedDate.currentValue.value.start ? new Date(Number(changes.selectedDate.currentValue.value.start)) : null;
                this.dateCtrl.setValue({start:this.dateValue,end:this.dateValue});
                this.currentPickerType = 'Specific Date';
            }
            else if (changes.selectedDate.currentValue && changes.selectedDate.currentValue.type === 'date_range') {
                this.dateRangeValue = {
                    start: changes.selectedDate.currentValue.value.start ? new Date(Number(changes.selectedDate.currentValue.value.start)) : null,
                    end: changes.selectedDate.currentValue.value.end ? new Date(Number(changes.selectedDate.currentValue.value.end)) : null
                }
                this.dateCtrl.setValue(this.dateRangeValue);
                this.currentPickerType = 'Date Range';
            }

            else {
                const value = changes.selectedDate.currentValue.type.split('_');
                if (value[value.length - 1] === 'today' || value[value.length - 1] === 'yesterday') {
                    this.currentPickerType = 'Day';
                }
                else {
                    this.currentPickerType = value[value.length - 1];
                }
            }

            if (changes.selectedDate.currentValue) {
                this.pickerCtrl.setValue(changes.selectedDate.currentValue.type);
            } else {
                this.pickerCtrl.setValue(null);
                this.dateCtrl.setValue(null);
                this.dateValue = null;
                this.dateRangeValue = null;
                this.selectedDateOption = '';
            }

        }
    }
    ngOnInit() {
        this.dateCtrl = new FormControl();
        this.pickerCtrl = new FormControl();
        if (this.selectedDate) {
            if (this.selectedDate.type !== 'sp_date' && this.selectedDate.type !== 'date_range') {
                this.pickerCtrl.setValue(this.selectedDate.type);
                const value = this.selectedDate.type.split('_');
                if (value[value.length - 1] === 'today' || value[value.length - 1] === 'yesterday') {
                    this.currentPickerType = 'Day';
                }
                else {
                    this.currentPickerType = value[value.length - 1];
                }
                // this.currentPickerType = value[value.length - 1];
            }
            else if (this.selectedDate.type === 'date_range') {
                this.currentPickerType = 'Date Range';
            } else if (this.selectedDate.type === 'sp_date') {
                this.currentPickerType = 'Specific Date';
            }

            if (this.selectedDate.value) {
                const start = new Date(Number(this.selectedDate.value.start));
                const end = new Date(Number(this.selectedDate.value.end));
                this.dateCtrl.setValue({ start, end });
            }
        }
    }

    /**
     * updates date picker type
     * @param type datepicker type
     */
    updateDatePickerType(type) {
        this.currentPickerType = type;
        switch (type) {
            case 'Date Range':
                if (this.dateCtrl && this.dateRangeValue && this.dateRangeValue.start) {
                    this.dateCtrl.setValue({ start: this.dateRangeValue.start, end: this.dateRangeValue.end })
                    this.dateRangeValue = { start: null, end: null };
                }
                break;
            case 'Specific Date':
                if (this.dateCtrl && this.dateValue) {
                    this.dateCtrl.setValue({ start: this.dateValue });
                    this.dateValue = null;
                }
                break;
            default:
                // this.filterData.dateCriteria = undefined;
                // this.dateValue = null;
                break;
        }
        if (this.selectedDateOption.includes(this.currentPickerType)) {
            this.pickerCtrl.setValue(this.selectedDateOption)
        } else {
            this.pickerCtrl.setValue(null);
        }
    }

    /**
     * updated specific date
     * @param ev date parameter
     */
    dateChanged(ev) {
        if (new Date(ev).getHours() || new Date(ev).getMinutes()) {
            this.dateCtrl.setValue({ start: ev, end: ev });
        } else {
            this.dateCtrl.setValue({ start: moment(ev).startOf('day'), end: moment(ev).endOf('day') });
        }
        this.emitDateChange();
    }

    /**
     * updated range date
     * @param ev date parameter
     */
    dateRangeChanged(ev) {
        if (this.currentPickerType === 'Date Range') {
            let startOfDay = null;
            let endOfDay = null;
            // this.dateCtrl.addControl(this.widgetId, new FormControl());
            if (ev && ev.start) {
                startOfDay = ev.start;
            }
            if (ev && ev.end) {
                endOfDay = ev.end
            }
            this.dateCtrl.setValue({ start: startOfDay, end: endOfDay });
        }
        this.emitDateChange();
    }

    /**
     * updated filter values to filter criteria in appropriate format
     */
    updateFilterValue(ev) {
        if (ev !== undefined || ev !== null) {
            // this.dateCtrl.addControl(this.widgetId, new FormControl());
            const value = this.datePickerOptionsList.find(x => x.value === ev);
            this.selectedDateOption = value.value;
            this.pickerCtrl.setValue(this.selectedDateOption);
            let strtEndDt = [];
            switch (this.currentPickerType) {
                case 'Day': strtEndDt = new FilterDateBulder().build(ev as FilterDateSelectionType);
                    break;

                case 'Week': strtEndDt = new WeekBulder().build(ev as WeekSelectionType);
                    break;

                case 'Month': strtEndDt = new MonthBulder().build(ev as MonthSelectionType);
                    break;

                case 'Quarter': strtEndDt = new QuarterBulder().build(ev as QuarterSelectionType);
                    break;

                case 'Year': strtEndDt = new YearBulder().build(ev as YearSelectionType);
                    break;
                default:
                    break;
            }
            if (strtEndDt) {
                // set selected value
                const start = new Date(Number(strtEndDt[0]));
                const end = new Date(Number(strtEndDt[1]));
                this.dateCtrl.setValue({ start, end })
            }
            if (!this.isFilterWidget)
                this.emitDateChange();
        }
    }

    emitDateChange() {
        if (this.dateCtrl && this.dateCtrl.value) {
            let dateValue = {}
            if (this.dateCtrl.value.start && this.dateCtrl.value.end) {
                dateValue = { ...this.dateCtrl.value };
            } else if (this.dateCtrl.value.start && !this.dateCtrl.value.end) {
                dateValue = { start: this.dateCtrl.value.start, end: this.dateCtrl.value.start }
            } else if (this.dateCtrl.value.end && !this.dateCtrl.value.start) {
                dateValue = { start: this.dateCtrl.value.end, end: this.dateCtrl.value.end };
            }
            const dateChanges = {
                type: this.pickerCtrl.value ? this.pickerCtrl.value : (this.currentPickerType === 'Specific Date' ? 'sp_date' : 'date_range'),
                value: dateValue
            }
            this.valueChange.emit(dateChanges);
        }
    }

    applyFilter() {
        this.emitDateChange();
    }

    getSelectedValue() {
        if (this.currentPickerType === 'Specific Date') {
            return this.dateCtrl?.value?.start;
        }
        else if (this.dateCtrl.value) {
            return this.dateCtrl.value;
        }
    }

    /**
     *
     * @returns the length of data for particular type
     */
    getSelectedDataLength() {
        switch (this.currentPickerType) {
            case this.datePickerList[0]:
                return Object.keys(FilterDateSelectionType).length;
            case this.datePickerList[1]:
                return Object.keys(WeekSelectionType).length;
            case this.datePickerList[2]:
                return Object.keys(MonthSelectionType).length;
            case this.datePickerList[3]:
                return Object.keys(QuarterSelectionType).length;
            case this.datePickerList[4]:
                return Object.keys(YearSelectionType).length;
        }
    }
}