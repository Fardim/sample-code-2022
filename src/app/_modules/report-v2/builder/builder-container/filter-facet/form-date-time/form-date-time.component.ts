import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import * as moment from 'moment';
import { DateFilterQuickSelect, FilterDateBulder, FilterDateSelectionType, MonthBulder, MonthSelectionType, QuarterBulder, QuarterSelectionType, WeekBulder, WeekSelectionType, YearBulder, YearSelectionType } from '../../../../_models/widget';

@Component({
    selector: 'pros-form-date-time',
    templateUrl: './form-date-time.component.html',
    styleUrls: ['./form-date-time.component.scss']
})

export class FormDateTimeComponent implements OnInit, OnChanges {

    @Input() selectedDate: any;
    /**
     * Define an indiviual form control
     */
    @Input() widgetId: string;
    @Output() valueChange = new EventEmitter<any>();
    @ViewChild('dateRangePickerTrigger') dateRangePickerMenu: MatMenuTrigger;
    // dateCtrl: FormGroup;
    dateCtrl: FormControl;
    dateFilterQuickSelect: DateFilterQuickSelect[];
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
     * is value selected or not
     */
    isValueSelected: boolean;

    /**
     * is filter widget flag to check whether date time picker used dashboard report filter or not
     */
    @Input() isFilterWidget: boolean;

    pickerCtrl: FormControl;

    /**
     * holds date picker options list
     */
    get datePickerOptionsList() {
        const list = [];
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

    constructor(private formBuilder: FormBuilder) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.selectedDate && JSON.stringify(changes.selectedDate.previousValue) !== JSON.stringify(changes.selectedDate.currentValue) && changes.selectedDate.previousValue !== undefined) {
            if (changes.selectedDate.currentValue?.value) {
                if (changes.selectedDate.currentValue.type === 'sp_date') {
                    this.dateValue = changes.selectedDate.currentValue.value.start ? new Date(Number(changes.selectedDate.currentValue.value.start)) : null;
                    this.dateCtrl.setValue({ start: this.dateValue, end: this.dateValue });
                    this.currentPickerType = 'Specific Date';
                }
                else if (changes.selectedDate.currentValue.type === 'date_range') {
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
                this.pickerCtrl.setValue(changes.selectedDate.currentValue.type);
            }
            else {
                this.dateCtrl.setValue(null);
                this.currentPickerType = null;
                this.dateValue = null;
                this.dateRangeValue = null;
                this.selectedDateOption = '';
            }
        }
    }
    ngOnInit() {
        if (!this.dateCtrl) {
            this.dateCtrl = new FormControl();
        }
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
            } else if (this.selectedDate.type === 'date_range') {
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
        this.isValueSelected = false;
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
        if (ev && this.currentPickerType === 'Specific Date') {
            if (new Date(ev).getHours() || new Date(ev).getMinutes()) {
                this.dateCtrl.setValue({ start: ev, end: ev });
            } else {
                this.dateCtrl.setValue({ start: moment(ev).startOf('day'), end: moment(ev).endOf('day') });
            }
        }
        this.isValueSelected = false;
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
        // if (!this.isFilterWidget)
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
            this.pickerCtrl.setValue(value.value)
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
                this.isValueSelected = true;
                if (!this.isFilterWidget)
                    this.emitDateChange();
            }
        }
    }

    emitDateChange() {
        if (this.dateCtrl && this.dateCtrl.value) {
            let dateValue = {};
            if (this.dateCtrl.value.start && this.dateCtrl.value.end) {
                dateValue = { ...this.dateCtrl.value };
            } else if (this.dateCtrl.value.start && !this.dateCtrl.value.end) {
                dateValue = { start: this.dateCtrl.value.start, end: this.dateCtrl.value.start }
            } else if (this.dateCtrl.value.end && !this.dateCtrl.value.start) {
                dateValue = { start: this.dateCtrl.value.end, end: this.dateCtrl.value.end };
            }
            const dateChanges = {
                type: this.pickerCtrl.value ? this.pickerCtrl.value : (this.currentPickerType === 'Specific Date' ? 'sp_date' : 'date_range'),
                value: dateValue,
            }
            this.valueChange.emit(dateChanges);
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

    getSelectedValue() {
        if (this.currentPickerType === 'Specific Date') {
            return this.dateCtrl?.value?.start;
        }
        else {
            return this.dateCtrl.value;
        }
    }

    applyFilter() {
        this.emitDateChange();
    }

    isDateShown() {
        return this.currentPickerType && (this.selectedDate && this.selectedDate.type ? this.selectedDate.type.toLowerCase().includes(this.currentPickerType.toLowerCase()) : this.selectedDateOption.toLowerCase().includes(this.currentPickerType.toLowerCase()));
    }
}