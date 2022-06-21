import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { SchemaService } from 'src/app/_services/home/schema.service';
import { of, BehaviorSubject } from 'rxjs';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { SchemaGroupWithAssignSchemas } from 'src/app/_models/schema/schema';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { startWith, map } from 'rxjs/operators';
import { CoreSchemaBrInfo, BusinessRuleType } from 'src/app/_modules/admin/_components/module/business-rules/business-rules.modal';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MetadataModeleResponse } from 'src/app/_models/schema/schemadetailstable';
import { MatChipInputEvent } from '@angular/material/chips';



export const filter = (opt, value: string) => {
  const filterValue = value.toLowerCase();
  return opt.filter(item => item.fieldDescri.toLowerCase().indexOf(filterValue) === 0);
};


@Component({
  selector: 'pros-missingrule',
  templateUrl: './missingrule.component.html',
  styleUrls: ['./missingrule.component.scss']
})
export class MissingruleComponent implements OnInit, OnChanges {

  constructor(private schemaService: SchemaService, private _formBuilder: FormBuilder, private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar) {
    this.groupDetails = new SchemaGroupWithAssignSchemas();
    this.fillDetailsSelectFields = of([]);
    this.fillDetailsFinalDropdownList = of([]);
  }

  arrList: any;
  fillDetailsSelectFields: any;
  fillDetailsFinalDropdownList: any;
  moduleListData: any = [];
  inputCtrlData = new FormControl();
  searchFilterData: any;
  headersData: any = [];
  gridsData: any = [];
  hierarchyData: any = [];
  gridFieldsData: any = [];
  hierarchyFieldsData: any = [];
  panelOpenState = false;

  finalList: any = []

  @ViewChild('moduleSearchInp') moduleSearchInp: ElementRef;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  groupDetailss = [];
  groupDetails: SchemaGroupWithAssignSchemas;


  @Input()
  schemaId: string;

  @Input()
  moduleId: string;

  @Input()
  brId: string;

  @Input()
  brType: string;

  @Output()
  evtSaved: EventEmitter<CoreSchemaBrInfo> = new EventEmitter();

  @Input()
  svdClicked: boolean;

  brInfo: CoreSchemaBrInfo;

  metaDataFieldList: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  fillDataForm: FormGroup;

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if(changes && changes.brType && changes.brType.previousValue !== changes.brType.currentValue) {
      this.brType = changes.brType.currentValue;
    }

    // after clicked saved should validate and save / update br
    if(changes && changes.svdClicked && changes.svdClicked.previousValue !== changes.svdClicked.currentValue) {
      if(changes.svdClicked.currentValue) {
        this.saveBrInfo();
      }
    }
  }
  // fillDataForm: FormGroup = this._formBuilder.group({
  //   selectFields: '',
  // })

  filterGroup(val: string) {
    if (typeof val === 'string') {
      return this.finalList
        .map(group => ({ letter: group.key, names: filter(group.value, val), length: group.length }))
        .filter(group => group.names.length > 0);
    }
    return this.finalList;
  }


  openPanel(): void {
    this.fillDataForm.controls.selectFields.setValue('');
  }

  ngOnInit(): void {
    this.fillDataForm = this._formBuilder.group({
      selectFields: [''],
      description:['']
    });

    this.moduleListData = this.fillDataForm.get('selectFields').valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterGroup(value))
      );

    // get br infomation  while edit br
    if(this.brId) {
      this.schemaService.getBusinessRuleInfo(this.brId).subscribe(res=>{
        this.brInfo = res;
        this.fillDataForm.get('description').setValue(res.brInfo);
      },error=>console.error(`Error : ${error}`));
    } else {
      this.brInfo = new CoreSchemaBrInfo();
    }

    this.metaDataFieldList.subscribe(data=>{
      if(data) {
        // get description of selected fields
        if(this.brInfo && this.brInfo.fields) {
          const array = this.brInfo.fields.split(',');
          array.forEach(each=>{
            this.groupDetailss.push({ id: each, descr: data[each] ? data[each].fieldDescri : ''});
          });
        }
      }
    });

    this.fillDetailsData();
  }


  fillDetailsData() {
    if(!this.moduleId) { return; }

    this.schemaService.getFillDataDropdownData(this.moduleId).subscribe(res => {
      this.metaDataFieldList.next(this.makeMetadataControle(res as MetadataModeleResponse));
      const response: any = res;
      this.headersData = this.splitObjKeyValuePair(response.headers, false);
      this.gridsData = response.grids;
      this.hierarchyData = response.hierarchy;
      this.gridFieldsData = this.getDesciption(response.gridFields, 'grid');
      this.hierarchyFieldsData = this.getDesciption(response.hierarchyFields, 'hierarchy');
    })
  }

  getDesciption(data, action) {

    const self = this;
    let obj;

    if (data) {

      Object.entries(data).forEach(([ky, val], i) => { // loop through keys array

        obj = { key: ky, val: Object.values(val) }

        if (action === 'grid') {

          Object.entries(self.gridsData).forEach(([k, v]) => {
            const vv: any = v;
            if (obj.key === k) {
              this.finalList.push({ key: vv.fieldDescri, value: obj.val, length: obj.val.length });
            }
          })
        }
        if (action === 'hierarchy') {

          self.hierarchyData.forEach((hdata) => {

            if (hdata.heirarchyId === obj.key) {
              this.finalList.push({ key: hdata.heirarchyText, value: obj.val, length: obj.val.length });
            }
          })
        }
      });
    }
  }


  splitObjKeyValuePair(list, bool) {
    let values: any;

    Object.entries(list).forEach(([kkey, val]) => {

      if (bool) {
        values = Object.values(val)

      }
      else {
        values = [val];
      }
      this.finalList.push({ key: kkey, value: values, length: values.length });
      this.fillDetailsFinalDropdownList = of(this.finalList);
    });

  }

  add(event: MatChipInputEvent): void {
    const input = event.input;

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  onSelect(data) {
    const loopData: any = [];
    const selData = data;
    this.groupDetailss.map((gd) => {
      if (gd.id === selData.fieldId) {
        loopData.push(true);
      }
      else {
        loopData.push(false)
      }
    })
    if (loopData.includes(true)) {
      return;
    }

    this.groupDetailss.push({ id: selData.fieldId, descr: selData.fieldDescri });

  }

  remove(objectId: any): void {
    const objectIds: any = this.groupDetailss ? this.groupDetailss : [];
    const index = objectIds.indexOf(objectId);
    if (index >= 0) {
      objectIds.splice(index, 1);
      this.groupDetailss = objectIds;
    }
  }


  storeData(res) {
    let list;
    list = JSON.parse(sessionStorage.getItem('brsList')) || [];
    list.push(res);
    sessionStorage.setItem('brsList', JSON.stringify(list));
  }

  convertObjtoString() {
    const list = [];
    this.groupDetailss.map((ls) => {
      list.push(ls.id);
    })
    return list.toString();
  }

  returnBrtype() {
    if (this.brType === 'missingRule') {
      return BusinessRuleType.BR_MANDATORY_FIELDS;
    }
    else if (this.brType === 'metaDataRule') {
      return BusinessRuleType.BR_METADATA_RULE;
    }
  }

  makeMetadataControle(allMDF: MetadataModeleResponse) {
    const metaDataField = {} as any;
    if(allMDF) {
      if(allMDF.headers) {
        Object.keys(allMDF.headers).forEach(header =>{
          metaDataField[header] = allMDF.headers[header];
        });
      }

      // grid
      if(allMDF.grids) {
        Object.keys(allMDF.grids).forEach(grid =>{
          if(allMDF.gridFields[grid]) {
            Object.keys(allMDF.gridFields[grid]).forEach(fldId => {
              metaDataField[fldId] = allMDF.gridFields[grid][fldId];
            });
          }
        });
      }

      // // heirerchy
      if(allMDF.hierarchy) {
        Object.keys(allMDF.hierarchy).forEach(heiId =>{
          const heId = allMDF.hierarchy[heiId].heirarchyId;
          if(allMDF.hierarchyFields[heId]) {
            Object.keys(allMDF.hierarchyFields[heId]).forEach(fldId => {
              metaDataField[fldId] = allMDF.hierarchyFields[heId][fldId];
            });
          }
        });
      }
    }
    return metaDataField;
  }

  /**
   * Save update br information
   */
  saveBrInfo() {
    this.brInfo.brId = this.brInfo.brIdStr ? this.brInfo.brIdStr : this.brId;
    this.brInfo.brType = this.brType;
    this.brInfo.fields = this.convertObjtoString();
    this.brInfo.message = this.fillDataForm.get('description').value ? this.fillDataForm.get('description').value : '';
    this.brInfo.brInfo = this.fillDataForm.get('description').value ? this.fillDataForm.get('description').value : '';
    this.brInfo.status = '1'; // for enable
    this.brInfo.schemaId = this.schemaId !== 'new' ? this.schemaId : '';
    if(this.brInfo.fields === '' || this.brInfo.message === '') {
      this.snackBar.open(`Please enter description or select field(s)`, 'Close', { duration: 5000 });
      return false;
    }

    this.schemaService.createBusinessRule(this.brInfo).subscribe(res => {
      res.brId = res.brIdStr;
      this.discard(res);
    }, error => {
      this.snackBar.open(`Something went wrong`, 'Close', { duration: 5000 });
    })
  }

  discard(res: CoreSchemaBrInfo) {
    this.evtSaved.emit(res);
  }
}
