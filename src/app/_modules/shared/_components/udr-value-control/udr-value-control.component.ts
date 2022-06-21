import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, Inject, LOCALE_ID } from '@angular/core';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MetadataModel, MetadataModeleResponse, UDRDropdownValue } from '@models/schema/schemadetailstable';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { FormControl } from '@angular/forms';
import { TragetInfo, OldValueInfo } from 'src/app/_constants';
import * as moment from 'moment';
import { CoreService } from '@services/core/core.service';

@Component({
  selector: 'pros-udr-value-control',
  templateUrl: './udr-value-control.component.html',
  styleUrls: ['./udr-value-control.component.scss']
})
export class UDRValueControlComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  moduleId: string;

  /**
   * mat-label
   */
  @Input()
  lebel: string;

  /**
   * placeholder for getting
   */
  @Input()
  placeholder = 'Value';

  fieldList: Array<UDRDropdownValue> = [];
  /**
   * Hold single input value ....
   */
  singleInput = '';
  /**
   * Hold start and end value for range selections....
   */
  multipleInput = {
    start: '',
    end: ''
  }
  @Output() valueChange = new EventEmitter();
  @Input() value = '';
  @Input() rangeValue: { start: string; end: string; };
  selectedTimeRange;
  @Input() range = false;
  @Input() operator = '';
  /**
   * Hold the metadata fields response ....
   */
  @Input() metataData: MetadataModeleResponse = null;
  @Input() fieldId: string;
  selectedMetaData: any;

  @Input() isShowOldValue = false;

  /**
   * Store feilds ...
   */
  fields: Metadata[] = [];
  fieldsObs: Observable<Metadata[]> = of([]);

  /**
   * Form control for the field search
   */
  searchFldCtl: FormControl = new FormControl(`${this.value? this.value : ''}`);

  @Input()
  targetInfo: TragetInfo = TragetInfo.VALUE;

  @Input()
  oldValueInfo: OldValueInfo = OldValueInfo.VALUE;

  @Input()
  conditionalFieldValueCtrl: MetadataModel;

  @Input() parentMetadata: MetadataModeleResponse;
  @Input() isLookupRule: boolean;

  @Input() hideTargetFieldsList = false;

  get operatorType() {
    return `${this.operator}`.toLowerCase().startsWith('length') ? 'length' : 'default';
  }

  get displayControl(): string {
    let control = 'dropdown';
    const metadata = this.selectedMetaData;
    if (metadata) {
      const picklist = (this.isShowOldValue) ? (metadata.picklist || metadata.pickList) : metadata.picklist;
      switch (true) {
        case this.operatorType==='length' || picklist === '0' && picklist === 'NUMC':
          control = 'number';
          break;
        case picklist === '0' && (['CHAR', 'ALTN', 'ISCN', 'REQ', 'DEC'].includes(metadata.dataType)):
        case picklist === '22' && metadata.dataType === 'CHAR':
          control = 'text';
          break;
        case picklist === '2' && metadata.dataType === 'CHAR':
          control = 'checkbox';
          break;
        case picklist === '4' && metadata.dataType === 'CHAR':
        case picklist === '35' && !metadata.dataType:
          control = 'radio';
          break;
        case metadata.dataType === 'DATS' || (metadata.dataType === 'NUMC' && picklist === '52' && this.isShowOldValue):
          control = 'date';
          break;
        case metadata.dataType === 'DTMS' || (metadata.dataType === 'NUMC' && picklist === '53' && this.isShowOldValue):
          control = 'datetime';
          break;
          case metadata.pickList === '54':
          control = 'time';
          break;
      }
    } else if(!this.metataData) {
      control = '';
    }
    return control;
  }
  subscriptions: Array<Subscription> = [];
  searchSub: Subject<string> = new Subject();
  dateValue: Date;
  dateRangeValue: { start: Date; end: Date } = { start: null, end: null };
  dropdownValue = '';

  constructor(
    private schemaDetailsService: SchemaDetailsService,
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.operator?.currentValue) {
      this.operator = changes.operator.currentValue;
    }
    if (changes.fieldId && changes.fieldId.previousValue !== changes.fieldId.currentValue) {
      this.loadUDRValueControl('');
    }

    if (changes.fieldId && changes.fieldId.previousValue !== changes.fieldId.currentValue
      || changes.metataData && changes.metataData.previousValue !== changes.metataData.currentValue
      || changes.value && changes.value.previousValue !== changes.value.currentValue
      || changes.rangeValue && changes.rangeValue.previousValue !== changes.rangeValue.currentValue
    ) {
      this.singleInput = this.value || '';
      if(changes.targetInfo && changes.targetInfo.currentValue === TragetInfo.FIELD) {
        this.searchFldCtl.setValue(changes.conditionalFieldValueCtrl.currentValue);
      }
      if(changes.oldValueInfo && changes.oldValueInfo.currentValue === OldValueInfo.FIELD) {
        this.searchFldCtl.setValue(changes.conditionalFieldValueCtrl.currentValue);
      }
      else {
        if (changes.value?.firstChange) {
          this.loadUDRValueControl();
        } else {
          this.checkMetadataPrevValue(changes);
        }
      }
    }
    this.dateValue = this.getDateFromString(this.value);
    this.dateRangeValue = {
      start: (this.rangeValue && this.rangeValue.start) ? this.getDateFromString(this.rangeValue.start) : null,
      end: (this.rangeValue && this.rangeValue.end) ? this.getDateFromString(this.rangeValue.end) : null
    }
    this.selectedTimeRange = (() => {
      const formatDate = (dt) => {
        const hm = dt ? dt.split(':') : [];
        return hm.length ? {
          hours: +hm[0],
          minutes: +hm[1],
        } : {
          hours: 0,
          minutes: 0
        };
      }
      return {
        start: formatDate(this.rangeValue?.start),
        end: formatDate(this.rangeValue?.end)
      }
    })();

    if(changes.metataData && changes.metataData.previousValue !== changes.metataData.currentValue) {
      if(changes.metataData.currentValue && typeof changes.metataData.currentValue === 'object') {
        const res = this.transformFieldRes(this.metataData);
        this.fields = res;
        this.fieldsObs = of(res);
        if (this.displayControl === 'dropdown' && this.isLookupRule && (this.targetInfo === TragetInfo.FIELD || this.oldValueInfo === OldValueInfo.FIELD) && !this.conditionalFieldValueCtrl && this.value) {
          this.fields.forEach(fld => {
            fld.childs.forEach(chld => {
              if (chld.fieldId === this.value) {
                this.searchFldCtl.setValue(chld);
              }
            });
          });
        }
        if (this.conditionalFieldValueCtrl) {
          this.dropdownValue = this.dropdownTextByCode(this.conditionalFieldValueCtrl);
        }
      }
    }

    if(changes.targetInfo && changes.targetInfo.previousValue !== changes.targetInfo.currentValue) {
      this.targetInfo = changes.targetInfo.currentValue;
    }

    if(changes.oldValueInfo && changes.oldValueInfo.previousValue !== changes.oldValueInfo.currentValue) {
      this.oldValueInfo = changes.oldValueInfo.currentValue;
    }

    if(changes.conditionalFieldValueCtrl && changes.conditionalFieldValueCtrl.previousValue !== changes.conditionalFieldValueCtrl.currentValue) {
      this.conditionalFieldValueCtrl = changes.conditionalFieldValueCtrl.currentValue;
    }
  }

  checkMetadataPrevValue(changes) {
    if ((changes.metataData && changes.metataData.previousValue !== changes.metataData.currentValue) && changes.metataData.previousValue === undefined) {
      return;
    }

    this.searchSub.next(this.singleInput);
  }

  ngOnInit(): void {
    const subscription = this.searchSub.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchString) => {
      this.loadUDRValueControl(searchString);
      if (this.fields) {
        this.searchFld(searchString);
      }
    });
    this.subscriptions.push(subscription);

    // update the form control value based on value change
    this.subscriptions.push(this.searchFldCtl.valueChanges.pipe(distinctUntilChanged()
    ).subscribe(res=> {
      this.valueChange.emit(res);
      this.searchFld(res);
    }));
  }

  getDateFromString(str) {
    const dateVal = parseInt(str, 10) || str;
    if (dateVal) {
      return new Date(dateVal);
    } else {
      return null;
    }
  }

  /**
   * Should send changed text to parent
   */
  inputChanged(searchStr, field = '') {
    if (this.range) {
      this.multipleInput[field] = searchStr;
    } else {
      if (this.displayControl === 'radio') {
        this.singleInput = '';
      } else {
        this.singleInput = searchStr;
      }
      this.searchSub.next(searchStr);
    }
    this.emit();
  }

  dropdownChanged(searchStr: string) {
    if (this.displayControl === 'dropdown' || this.displayControl === 'radio') {
      this.singleInput = this.dropdownCodeByText(searchStr);
      this.emit();
    }
    this.searchSub.next(searchStr);
  }

  dropdownTextByCode(value: any) {
    if(value && value.fieldId) {
      return value.fieldDescri ? value.fieldDescri : (value.fieldDesc ? value.fieldDesc : value.fieldId);
    } else {
      return this.fieldList.find(field => field.code === value)?.text || '';
    }
  }

  fldDisplayWith(fld: Metadata): string {
    return fld?.fieldDescri || fld?.fieldDesc || fld?.fieldId || this.singleInput;
  }

  dropdownCodeByText(value: string) {
    return this.fieldList.find(field => [field.code, field.text].includes(value))?.code || value;
  }

  dateChanged(date: any, setTime = false) {
    if (setTime) {
      if (this.range) {
        this.inputChanged(date.start ? String(moment(date.start).startOf('day').toDate().getTime()) : null, 'start');
        this.inputChanged(date.end ? String(moment(date.end).endOf('day').toDate().getTime()) : null, 'end');
      } else {
        this.inputChanged(String(moment(date).endOf('day').toDate().getTime()));
      }
    } else {
      if (this.range) {
        this.inputChanged(date.start ? String(moment(date.start).toDate().getTime()) : null, 'start');
        this.inputChanged(date.end ? String(moment(date.end).toDate().getTime()) : null, 'end');
      } else {
        this.inputChanged(String(moment(date).toDate().getTime()));
      }
    }
  }

  timeRangeChanged(date: any) {
    const pad = (no) => `${no || ''}`.padStart(2, '0');
    this.multipleInput.start = date?.start ? `${pad(date.start.hours)}:${pad(date.start.minutes)}` : null;
    this.multipleInput.end = date?.end ? `${pad(date.end.hours)}:${pad(date.end.minutes)}` : null;
    this.emit();
  }

  /**
   * Should return selected object to parent
   * @param $event current dropdown event
   */
  selected($event) {
    if($event.option.value && $event.option.value.fieldId) {
      this.valueChange.emit($event.option.value);
    } else {
      const searchStr = $event.option.viewValue;
      this.dropdownChanged(searchStr);
    }
  }

  checkboxChanged($event) {
    this.valueChange.emit(`${$event}`);
  }

  /**
   * Should return required meta data field
   * @param fieldId field name string
   */
  parseMetadata(fieldId: string, metataData: MetadataModeleResponse): any {
    const list = [];
    if (!fieldId || !metataData) {
      return null;
    }
    for (const field in metataData) {
      if (metataData[field]) {
        list.push(metataData[field]);
      }
    }
    for (const item of list) {
      if (item[fieldId]) {
        return item[fieldId];
      }
      for (const field in item) {
        if (typeof item[field] === 'object' && item[field]) {
          list.push(item[field]);
        }
      }
    }
    return null;
  }

  /**
   * Should update value control type and data
   */
  loadUDRValueControl(searchString = this.singleInput) {
    let metadata = this.parseMetadata(this.fieldId, this.metataData);

    if (!metadata && this.isLookupRule && this.parentMetadata) {
      metadata = this.parseMetadata(this.fieldId, this.parentMetadata);
    }

    this.selectedMetaData = metadata;
    const pickLists = ['1', '4', '30', '35', '37'];
    if (!metadata || !pickLists.includes(metadata.pickList)) {
      if(this.targetInfo !== TragetInfo.FIELD || (this.oldValueInfo && this.oldValueInfo !== OldValueInfo.FIELD)) {
        this.searchFldCtl.setValue(this.singleInput);
      }
      this.fieldList = [];

      if (this.isLookupRule) {
        this.dropdownValue = (this.targetInfo === TragetInfo.FIELD || this.oldValueInfo === OldValueInfo.FIELD) ? this.dropdownTextByCode(this.conditionalFieldValueCtrl) : this.value;
      }

      return;
    }
    if (!['radio', 'dropdown'].includes(this.displayControl)) {
      searchString = '';
    }
    const body = {
      parent: {
      },
      searchString
    };
    this.schemaDetailsService.getDropdownOfPickList(this.moduleId, this.fieldId, this.locale, body).subscribe((res: any) => {
      this.fieldList = res.content;
      if (this.targetInfo === TragetInfo.FIELD || this.oldValueInfo === OldValueInfo.FIELD) {
        this.dropdownValue = this.dropdownTextByCode(this.conditionalFieldValueCtrl);
      } else {
        this.dropdownValue = this.dropdownTextByCode(this.value) || this.value;
      }
    }, (error) => {
      this.fieldList = [];
      console.error('Error while loading dropdown values', error);
    });
  }

  /**
   * Should emit range or single value to the parent component
   */
  emit() {
    this.valueChange.emit(
      this.range ? this.multipleInput : this.singleInput
    );
  }

  /**
   * Help to transform data from MetadataModeleResponse to Metadata[]
   * @param response metadata response from server
   */
   transformFieldRes(response: MetadataModeleResponse): Metadata[] {
    const metadata: Metadata[] = [];
    if(!response) {return []};
    // for header
    const headerChilds: Metadata[] = [];
    if(response.headers) {
      if (this.isLookupRule) {
        headerChilds.push({
          fieldId: 'id',
          fieldDescri: 'Object Number',
          isGroup: false,
          childs: []
        });
      }

      Object.keys(response.headers).forEach(header=>{
        const res = response.headers[header];
        headerChilds.push({
          fieldId: res.fieldId,
          fieldDescri: res.fieldDescri,
          isGroup: false,
          childs: []
        });
      });
    }
    metadata.push({
      fieldId: 'header_fields',
      fieldDescri: 'Header fields',
      isGroup: true,
      childs: headerChilds
    });

    // for grid response transformations
    if(response && response.grids) {
      Object.keys(response.grids).forEach(grid=>{
        const childs : Metadata[] = [];
        if(response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(fld=>{
            const fldCtrl = response.gridFields[grid][fld];
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[]
              });
          });
        }
        metadata.push({
          fieldId: grid,
          fieldDescri: response.grids[grid].fieldDescri,
          isGroup: true,
          childs
        });
      })
    }

    // for hierarchy response transformations
    if(response && response.hierarchy) {
      response.hierarchy.forEach(hierarchy => {
        const childs: Metadata[] = [];
        if(response.hierarchyFields && response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
          Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach(fld=>{
            const fldCtrl = response.hierarchyFields[hierarchy.heirarchyId][fld];
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[]
              });
          });
        }
        metadata.push({
          fieldId: hierarchy.heirarchyId,
          fieldDescri: hierarchy.heirarchyText,
          isGroup: true,
          childs
        });
      });
    }
    return metadata;
  }

  /**
   * Search the field
   * @param searchString serach the field based on this key ....
   */
  searchFld(searchString: string) {
    // if the picklist 0 or mention above then should have be filter fields as well
    if(searchString && typeof searchString === 'string' && searchString.trim() !== '') {
      if (this.moduleId) {
        const allfldSub = this.coreService.getMetadataFieldsByModuleId([this.moduleId], searchString).subscribe(response => {
          const res = this.transformFieldRes(response);
          this.fieldsObs = of(res);
        }, error => {
          console.error(`Error : ${error}`);
        });
        this.subscriptions.push(allfldSub);
      } else {
        const groups = Array.from(this.fields.filter(fil =>fil.isGroup));
        const matchedData: Metadata[] = [];
        groups.forEach(grp=>{
          const changeAble = {isGroup:grp.isGroup, fieldId: grp.fieldId,childs: grp.childs,fieldDescri: grp.fieldDescri};
          const chld: Metadata[] = [];
          changeAble.childs.forEach(child=>{
              if(child.fieldDescri.toLocaleLowerCase().indexOf(searchString.toLocaleLowerCase()) !==-1) {
                chld.push(child);
              }
            });
            if(chld.length) {
              changeAble.childs = chld;
              matchedData.push(changeAble);
            }
        });
        this.fieldsObs = of(matchedData);
      }
    } else {
      this.fieldsObs = of(this.fields);
    }
  }
}
