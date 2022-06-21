import { AfterViewInit, Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TransientService } from 'mdo-ui-library';
import { ConditionField, RuleSaveTypes } from '@models/list-page/listpage';
import { UserProfileService } from '@services/user/user-profile.service';
import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, startWith, takeUntil, filter } from 'rxjs/operators';
import { CoreService } from '@services/core/core.service';
import { DependencyRuleService } from '@services/dependency-rule.service';
import { Subject } from 'rxjs';
import { RuleService } from '@services/rule/rule.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectedOptionsRule, StructuresResponse } from '@models/dependencyRules';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { AppliedMapping } from '@models/list-page/listpage';
import { PageEvent } from '@angular/material/paginator';
import * as XLSX from 'xlsx';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { uniq } from 'lodash';
@Component({
  selector: 'pros-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],

})
export class RulesComponent implements OnInit, AfterViewInit {
  /**
   * Save type of rule
   */
  saveTypes = RuleSaveTypes;
  options: string[] = []
  /**
   * Selected Source Options inside source fields
   */
  SelectedOptions: SelectedOptionsRule[] = [];
  /**
   * Selected Target Options inside target fields
   */
  TargetSelectedOptions: SelectedOptionsRule[] = [];
  /**
   * limit to display the selected source and target fields
   */
  limit = 5;
  /**
   * Form control for source textbox
   */
  sourceCtrl = new FormControl();

  /**
   * Form control for source textbox
   */
   targetCtrl = new FormControl();
  /**
   * Form control for conditions search textbox
   */
  searchValuesControl = new FormControl();
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  /**
   * contains text to search the fields inside source and target textbox for selection
   */
  fieldsSearchString;
  /**
   * page index for getting fields against structures
   */
  recordsPageIndex = 0;
  /**
   * page size for getting fields against structures
   */
  recordsPageSize = 20;
  /**
   * current Module Id where the dependency rule is going to be created
   */
  moduleId: string;
  /**
   * for containing the source and target field for maintaining depedency rule
   */
  SourceTargetConditions = {};
  /**
   * for containing conditions for maintaining depedency rule
   */
  Conditions: any[]=[];
  /**
   * for containing Stuctures for maintaining depedency rule fields
   */
  Structures: StructuresResponse[];

  /**
   * for containing filtered Structures when search by name
   */
  filteredStructures: StructuresResponse[];
  filteredStructuresTarget: StructuresResponse[];

  // table data source that contains source and target both fields inside multilple condition with mappingId
  dataSource: MatTableDataSource<ConditionField>;
  // index for tracking the target or source max index inside one condition
  targetIndex = 0;
  /**
   * groupId/Rule Id where we are currently working
   */
  groupId: string;
  /**
   * Rule Title where we are currently working
   */
  ruleTitle: string;
  /**
   * Total Condition count for paging
   */
  totalCount = 0;
  // containing all the field names inside every structure
  fieldNames = {};
  /**
   * Mapping object that contains the different icons for hiding , Readonly and mandatory
   */
  appliedMapping = AppliedMapping;
  /**
   * Columsn that are inside the conditions table
   */
  displayedColumns = ['select', 'Source Field', 'Field value', 'Target Field', 'Field Value', 'Default', 'Status'];
  /**
   * get to know that fields are disabled or enabled
   */
  fieldDisabled=false;
  /**
   * search string for searching the conditions
   */
  conditionSearchString='' ;
  /**
   * conditions table page index
   */
  conditionsPageIndex=1;
  /**
   * default size for one page of conditions table
   */
  conditionsPageSize=10;
  /**
   * containing the source and target field while getting the details from the endpoint against the rule
   */
  SelectedSourceTargetFields=[];
  // accordin to UI when there are no conditions there should be no search bar . this variable will track the results according to search
  // when searching by field if no record matches it hides the search fields also: Reason behind this variable
  resultsFromSearch=false;
  /**
   * show skeleton on initial load
   */
  sourceTargetshowSkeleton = true;
  /**
   * show skeleton on initial load
   */
  conditionshowSkeleton = true;

  /**
   * to track Source and Target field saved for group
   */
  isSourceTargetSaved = false;

  fieldMetaDataResponse: MetadataModeleResponse = null;

  /**
   * File attach input type ...
   */
  @ViewChild('rules_file') rulesFile: ElementRef<HTMLInputElement>;

  constructor(private activatedRouter: ActivatedRoute,
    private userProfileService: UserProfileService,
    private toasterService: TransientService,
    private coreService: CoreService, private ruleService: RuleService, private router: Router, private _dependencyService: DependencyRuleService,
    @Inject(LOCALE_ID) public locale: string, public snackBar: MatSnackBar) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }
  // getFieldDetails(FieldID) {
  //   this.ruleService.getFieldDettails(this.moduleId, FieldID).subscribe((resp) => {
  //     this.fieldNames[FieldID] = resp.shortText[this.locale].description;
  //   });
  // }
  ngAfterViewInit(): void {
    // hooks for the file change trace
    this.rulesFile.nativeElement.addEventListener('change', (e) =>{
      const file = (e?.target as any)?.files[0];
      if(file) {
        const files = (e?.target as any).files;
        const f = files[0];
        const reader = new FileReader();
        const that = this;
        reader.onload = (ele) => {
          const data = new Uint8Array((ele?.target as any).result);
          const workbook = XLSX.read(data, {type: 'array'});
          const ruleSheet = workbook.Sheets.Rules;
          that.loadSheet(ruleSheet);
          /* DO SOMETHING WITH workbook HERE */
        };
        reader.readAsArrayBuffer(f);
        this.rulesFile.nativeElement.value = null;
      }
    });
  }

  loadSheet(ws: XLSX.WorkSheet) {
    const range = ws['!ref'].split(':');
    let lastCell;
    if(range.length) {
      lastCell = XLSX.utils.decode_cell(range[1]);
    }
    if(lastCell.r < 3) {
      this.toasterService.open('No mapping exists in the file. Please add some data!', null, { duration: 2000});
      return;
    }
    this.saveRules(ws, lastCell);
  }

  getSaveRulePayload(ws: XLSX.WorkSheet, lastCell: XLSX.CellAddress) {
    try {
      const savePayload = [];
      const range  = {
        s: {
          r: 3,
          c: 1
        },
        e: lastCell
      };
      for(let R = range.s.r; R <= range.e.r; ++R) {
        const mappingObj = {
          source: {},
          target: {},
        }

        for(let C = range.s.c; C <= range.e.c; ++C) {
          const code = this.getValueFromCellAddress(ws, {c: C, r: R});
          const isSource = this.getValueFromCellAddress(ws, {c: C + 1, r: 1});
          const fieldId = this.getValueFromCellAddress(ws, {c: C, r: 1});
          if(isSource) {
            mappingObj.source[fieldId] = this.getSourcePayload(code);
          }else {
            const property = this.getValueFromCellAddress(ws, {c: C + 1, r: R});
            const isDefault = this.getValueFromCellAddress(ws, {c: C + 2, r: R});
            mappingObj.target[fieldId] = this.getTargetPayload(code, property, isDefault);
            C += 2;
          }
        }
        savePayload.push(mappingObj);
      }
      return savePayload;
    } catch (error) {
      this.toasterService.open('File template is wrong, Please download template again!', null, { duration: 2000});
    }
  }

  saveRules(ws: XLSX.WorkSheet, lastCell: XLSX.CellAddress) {
    const payload = this.getSaveRulePayload(ws, lastCell);
    this.ruleService.saveGroupConditions(this.moduleId,this.groupId,this.locale,payload).subscribe
    ((resp)=>{
      this._dependencyService.loadingSubject.next(true);
      console.log('@@@@@@ rules are saved: ', resp);
    },
    (error)=>{
      this.snackBar.open('error saving the Conditions', 'okay', {
        duration: 1000
      });
    })
  }

  getValueFromCellAddress(ws: XLSX.WorkSheet, address: XLSX.CellAddress): any {
    const cell_ref = XLSX.utils.encode_cell(address);
    if(ws[cell_ref]) {
      return ws[cell_ref].v;
    }
    return undefined;
  }

  getSourcePayload(value: any) {
    return {
      code: value,
      text: '',
      textRef: ''
    };
  }

  getTargetPayload(value: any, property: string | null = null, isDefault: boolean = false) {
    return {
      code: value,
      text: '',
      textRef: '',
      property: property === undefined ? null :property,
      isDefault: isDefault === undefined ? false: Boolean(isDefault)
    }
  }

  // getParams() {
  //   this.activatedRouter.params.subscribe((params) => {

  //   });
  // }
  getDataSource(_conditions: any[]) {
    _conditions.map((row, i) => {
      const mapId=row.mappingId;
      const sObj = row.source;
      const tObj = row.target;
      if (Object.keys(sObj).length < Object.keys(tObj).length) {
        Object.keys(sObj).map((key, index) => {
          const isFirstrw=(index===0?true:false);
          this.dataSource.data.push({
            sourceField: key,
            sourceFieldValue: sObj[key].code,
            status: '',
            targetField: '',
            targetFieldValue: '',
            isDefault: '',
            isFirstRow:isFirstrw,
            mappingId:mapId
          })
        })
        Object.keys(tObj).map((key, index) => {
          const isFirstrw=(index===0?true:false);
          if (this.dataSource.data[this.targetIndex] === undefined) {
            this.dataSource.data.push({
              sourceField: '',
              sourceFieldValue: '',
              status: tObj[key].property,
              targetField: key,
              targetFieldValue: tObj[key].code,
              isDefault: tObj[key].isDefault,
              isFirstRow:isFirstrw,
              mappingId:mapId
            })
          }
          else {
            this.dataSource.data[this.targetIndex].status = tObj[key].property;
            this.dataSource.data[this.targetIndex].targetField = key;
            this.dataSource.data[this.targetIndex].targetFieldValue = tObj[key].code;
            this.dataSource.data[this.targetIndex].isDefault = tObj[key].isDefault;
          }
          this.targetIndex = this.targetIndex + 1;
        })
      }
      else {
        Object.keys(tObj).map((key, index) => {
          const isFirstrw=(index===0?true:false);
          this.dataSource.data.push({
            sourceField: '',
            sourceFieldValue: '',
            status: tObj[key].property,
            targetField: key,
            targetFieldValue: tObj[key].code,
            isDefault: tObj[key].isDefault,
            isFirstRow:isFirstrw,
            mappingId:mapId
          })
        })
        Object.keys(sObj).map((key, index) => {
          const isFirstrw=(index===0?true:false);
          if (this.dataSource.data[this.targetIndex] === undefined) {
            this.dataSource.data.push({
              sourceField: key,
              sourceFieldValue: sObj[key].code,
              status: '',
              targetField: '',
              targetFieldValue: '',
              isDefault: '',
              isFirstRow:isFirstrw,
              mappingId:mapId
            })
          }
          else {
            this.dataSource.data[this.targetIndex].sourceField = key;
            this.dataSource.data[this.targetIndex].sourceFieldValue = sObj[key].code;
          }
          this.targetIndex = this.targetIndex + 1;
        })
      }
    })
    this.dataSource.data = this.dataSource.data;
  }
  setSearchInputControl() {
    // return new Promise((resolve,reject)=>{this.optionCtrl.valueChanges
      // .pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.unsubscribeAll$), startWith(''))
      // .subscribe(async (searchString) => {
      //   this.fieldsSearchString = searchString || '';
      //   this.recordsPageIndex = 0;
      //   await this.getFields(this.fieldsSearchString);
      // })
    // });

    merge(
      this.sourceCtrl.valueChanges,
      this.targetCtrl.valueChanges
    ).pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.unsubscribeAll$), startWith(''))
    .subscribe((search: string) => {
      this.recordsPageIndex = 0;
      this.updateFieldOptions(search);
    });
  }

  updateFieldOptions(search: any) {
    if(!search) {
      this.filteredStructures = JSON.parse(JSON.stringify(this.Structures));
    }else {
      this.getFields(search);
    }
  }

  updateOptions(event) {
    this.updateFieldOptions(event.target.value);
  }

  setSelectionsEmpty() {
    this.SelectedOptions = [];
    this.TargetSelectedOptions = [];
  }
  ngOnInit(): void {
    this.Conditions = [];
    this.Structures = [];
    this.dataSource = new MatTableDataSource<ConditionField>();
    this.setSearchInputControl();
    this.activatedRouter.params.subscribe(params => {
      this.isSourceTargetSaved = false;
      this.moduleId = params.moduleId;
      if(params.groupId && params.groupId !== this.groupId) {
        this.groupId = params.groupId;
        this.getGroupDetails();
        // this.getParams();
      }

      if (params.ruleTitle) {
        this.ruleTitle = params.ruleTitle;
      }
    });
    this._dependencyService.loadingSubject.subscribe((res)=>{
           if(res){
            this.conditionsPageIndex = 1;
            this.dataSource.data.length = 0;
            this.Conditions.length = 0;
            this.targetIndex = 0;
            this.conditionshowSkeleton=true;
            this.getSourceTargetFields();
             this.getConditions();
             this._dependencyService.loadingSubject.next(false)
           }
    })
    this.searchValuesControl.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
      .subscribe((searchString) => {
          this.conditionSearchString = searchString || '';
          this.conditionsPageIndex = 1;
          this.dataSource.data.length = 0;
          this.Conditions.length = 0;
          this.targetIndex = 0;
          this.resultsFromSearch=true;
          this.getConditions();
    });
  }

  getGroupDetails() {
    this.dataSource.data.length = 0;
    this.Conditions.length = 0;
    this.targetIndex=0;
    this.sourceTargetshowSkeleton=true;
    this.conditionshowSkeleton=true;
    this.setSelectionsEmpty();
    // this.getRuleFields();
    this.getFields();
    this.getConditions();
    this.enableFields();
    this.getSourceTargetFields();
  }
  getConditions() {
    const bodyObject = {
      pageInfo: {
        pageNumer: this.conditionsPageIndex - 1,
        pageSize: this.conditionsPageSize,
      },
      searchString: this.conditionSearchString
    }
    this.ruleService.getGroupConditions(this.groupId, this.locale, bodyObject).pipe(finalize(() => this.conditionshowSkeleton = false) ).subscribe((resp) => {
      // show search and disable fields if there are conditions
      if(resp?.response?.content && resp.response.content.length!==0){
        this.resultsFromSearch=true;
        this.disableFields();
        resp.response.content.map(condition => {
          const mapId=condition.mappingId;
          const sourceFields = {};
          const targetFields = {};
          condition.conditions.map(row => {
            if(sourceFields[row.sourceField]===null ||sourceFields[row.sourceField]===undefined){
                sourceFields[row.sourceField] = {
                  code: row.sourceValue,
                  text: row.sourceValueText,
                  textRef: '',
                }
            }
            if(targetFields[row.targetField]===null ||targetFields[row.targetField]===undefined){
              targetFields[row.targetField] = {
                code: row.targetValue,
                text: row.targetValueText,
                textRef: '',
                property: row.propertyKey,
                isDefault: row.targetIsDefault,
              }
            }
          })
          this.Conditions=[{
            mappingId:mapId,
            source:sourceFields,
            target:targetFields
          }];
          this.getDataSource(this.Conditions);
          this.conditionshowSkeleton=false;
        })
          this.totalCount=resp.response.totalElements;
        }else{
          this.resultsFromSearch=false;
          this.enableFields();
        }
      });

  }
  hasLimit(options: Array<any>): boolean {
    return options.length > this.limit;
  }
  AddNewConditions() {
    const sourceKey='source';
     const targetKey='target';
    const sourceFields = {};
    const targetFields = {};
    this.SelectedOptions.map((row, i) => {
      sourceFields[row.FieldId] = {
        code: '',
        text: '',
        textRef: '',
      }
    }
    )

    this.SourceTargetConditions[sourceKey] = sourceFields;
    this.TargetSelectedOptions.map((row, i) => {
      targetFields[row.FieldId] = {
        code: '',
        text: '',
        textRef: '',
        property: null,
        isDefault: true
      }
    }
    )
    this.SourceTargetConditions[targetKey] = targetFields;
  }
  close() {
    this.AddNewConditions();
    this._dependencyService.setOption(this.SourceTargetConditions);
    this.router.navigate([{ outlets: { sb3: `sb3/group-conditions/${this.moduleId}/${this.groupId}/${this.ruleTitle}` } }], { queryParamsHandling: 'preserve' });
  }
  Edit(mappingId){
    this.router.navigate([{ outlets: {  sb3: `sb3/group-conditions/${this.moduleId}/${this.groupId}/${this.ruleTitle}/${mappingId}` } }], { queryParamsHandling: 'preserve' });
  }
  selected(event) {
    const values = event.option.value.split(',');
    this.patchSourceControl(values);
    // this.getFieldDetails(values[1]);
    this.sourceCtrl.setValue(null);
  }

  patchSourceControl(values) {
    let found = false;
    this.TargetSelectedOptions.forEach((element, i) => {
      if (element.structureId === values[2] && element.FieldId === values[1]) {
        found = true;
      }
    });
    this.SelectedOptions.forEach((element, i) => {
      if (element.structureId === values[2] && element.FieldId === values[1]) {
        found = true;
      }
    });
    if (!found) {
      this.SelectedOptions.push({
        strucDesc: values[0],
        structureId: +values[2],
        FieldId: values[1],
        StructureFieldDesc: values[0] + '/' + values[1],
        pickList: values[3],
        parentStrucId: +values[4],
      });
    }

    this.filteredStructuresTarget = this.prepareTargetDropdownOptions(this.fieldMetaDataResponse, this.SelectedOptions[0]);
  }
  targetSelected(event) {
    const values = event.option.value.split(',');
    this.patchTargetControl(values);
    this.targetCtrl.setValue(null);
    // this.getFieldDetails(values[1]);
  }

  patchTargetControl(values) {
    let found = false;
    this.TargetSelectedOptions.forEach((element, i) => {
      if (element.structureId === values[2] && element.FieldId === values[1]) {
        found = true;
      }
    });
    this.SelectedOptions.forEach((element, i) => {
      if (element.structureId === values[2] && element.FieldId === values[1]) {
        found = true;
      }
    });
    if (!found) {
      this.TargetSelectedOptions.push({
        strucDesc: values[0],
        structureId: +values[2],
        FieldId: values[1],
        StructureFieldDesc: values[0] + '/' + values[1],
        pickList: values[3],
        parentStrucId: +values[4],
      });
    }
  }

  remove(structureId: number, fieldId: string) {
    this.SelectedOptions.forEach((element, i) => {
      if (element.structureId === structureId && element.FieldId === fieldId) {
        this.SelectedOptions.splice(i, 1);
      }
    });
  }
  targetRemove(structureId: number, fieldId: string) {
    this.TargetSelectedOptions.forEach((element, i) => {
      if (element.structureId === structureId && element.FieldId === fieldId) {
        this.TargetSelectedOptions.splice(i, 1);
      }
    });
  }

  // getAllStrucuters() {
  //   this.ruleService.getAllStructures(this.locale, this.moduleId, 0, 10, this.fieldsSearchString).subscribe( (resp: StructuresResponse[]) => {
  //     this.Structures.length=0;
  //     resp.map((row) => {
  //       this.Structures.push({
  //         moduleId: row.moduleId,
  //         strucDesc: row.strucDesc,
  //         Fields: [],
  //         structureId: row.structureId,
  //         parentStrucId: row.parentStrucId,
  //         isHeader: row.isHeader,
  //         language: row.language
  //       });
  //     })
  //     // second call
  //     this.Structures.map((row2, i) => {
  //       this.ruleService.getStructureFields(this.locale, this.moduleId,
  //         0, 10, row2.structureId).subscribe((respFields: FieldMetaData[]) => {
  //           const result = this.Structures;
  //           result[i].Fields.length=0;
  //           respFields.map((row3) => {
  //             this.getFieldDetails(row3.fieldId);
  //             result[i].Fields.push(row3);
  //             if(row3.pickList === '15' && row3.childfields.length !== 0) {
  //               row3.childfields.map((childField: any) => {
  //                 this.getFieldDetails(childField.fieldId);
  //                 result[i].Fields.push(childField);
  //               })
  //             }
  //           })
  //           this.Structures = result;
  //           console.log('this.Structures: ', this.Structures);
  //         }, (error) => {
  //           if (error.status === 500 && error.statusText.toString().toLocaleLowerCase() === 'ok') {
  //           }
  //         })

  //     });
  //   })
  // }
  // getStructureFields() {
  //   this.ruleService.getAllStructures(this.locale, this.moduleId, 0, 10, '').subscribe((resp: StructuresResponse[]) => {
  //     resp.map((row) => {
  //       this.Structures.push({
  //         moduleId: row.moduleId,
  //         strucDesc: row.strucDesc,
  //         Fields: [],
  //         structureId: row.structureId,
  //         parentStrucId: row.parentStrucId,
  //         isHeader: row.isHeader,
  //         language: row.language
  //       }
  //       );
  //     })
  //   })
  // }
  DeleteCondition(mappingId) {
    this.enableFields();
    this.ruleService.deleteGroupConditions(this.groupId, mappingId).subscribe(res => {
      if (res.acknowledge === true) {
        this.snackBar.open('Condition Removed Successfully', 'okay', {
          duration: 1000
        });
        this.conditionshowSkeleton=true;
        this.conditionsPageIndex = 1;
        this.dataSource.data.length = 0;
        this.Conditions.length = 0;
        this.targetIndex = 0;
        this.resultsFromSearch = false;
        this.getConditions();
      }
    })
  }
  openAlert(title, text): void {
    this.toasterService.alert({
      data: {
        dialogTitle: title,
        label:text
      },
      disableClose: true,
      autoFocus: false,
      width: '600px',
      panelClass: 'create-master-panel',
    }, (response) => { });
  }
    getSourceTargetFields(){
     const sourceKey='source';
     const targetKey='target';
     this.SelectedOptions.length=0;
     this.TargetSelectedOptions.length=0;
    this.ruleService.getRuleDetails(this.groupId).subscribe((rules: any) => {

      const resp = rules?.response;
      if(resp.source && Array.isArray(resp.source)) {
        resp.source.forEach((row) => {
          const sourceControl = row.fieldCtrl;
          const sourceField = [sourceControl.heirarchyDesc, sourceControl.fieldId, sourceControl.strucId, sourceControl.picklist];
          if(!this.fieldNames[sourceControl.fieldId]) {
            this.fieldNames[sourceControl.fieldId] = sourceControl.fieldDesc;
          }
          this.patchSourceControl(sourceField);
        })
      }

      if(resp.target && Array.isArray(resp.target)) {
        resp.target.forEach((row) => {
          const targetControl = row.fieldCtrl;
          const targetField = [targetControl.heirarchyDesc, targetControl.fieldId, targetControl.strucId, targetControl.picklist];
          if(!this.fieldNames[targetControl.fieldId]) {
            this.fieldNames[targetControl.fieldId] = targetControl.fieldDesc;
          }
          this.patchTargetControl(targetField);
        })
      }

      this.sourceTargetshowSkeleton=false;
      if(this.SelectedOptions.length > 0 && this.TargetSelectedOptions.length > 0) this.isSourceTargetSaved = true;

    }, (error) => {
        this.sourceTargetshowSkeleton=false;
        this.snackBar.open('error Loading the fields', 'okay', {
        duration: 1000
      });
    })
  }
  get displayedRecordsRange(): string {
    const endRecord =
      this.conditionsPageIndex * this.conditionsPageSize < this.totalCount ? this.conditionsPageIndex * this.conditionsPageSize : this.totalCount;
    return this.totalCount ? `${(this.conditionsPageIndex - 1) * this.conditionsPageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }
  // getRuleFields() {
  //   const temp: SelectedOptionsRule[]=[];
  //   this.ruleService.getAllStructures(this.locale, this.moduleId, 0, 10, this.fieldsSearchString).subscribe((resp: StructuresResponse[]) => {
  //     resp.map((srow, i) => {
  //       this.ruleService.getStructureFields(this.locale, this.moduleId,
  //         0, 10, srow.structureId).subscribe((respFields: FieldMetaData[]) => {
  //           respFields.map((frow) => {
  //             temp.push({
  //               strucDesc: srow.strucDesc,
  //               structureId: srow.structureId,
  //               FieldId: frow.fieldId,
  //               StructureFieldDesc: srow.strucDesc + '/' + frow.fieldId,
  //               pickList: frow.pickList
  //             });

  //             if(frow.pickList === '15' && frow.childfields.length !== 0) {
  //               frow.childfields.map((childRow: any) => {
  //                 temp.push({
  //                   strucDesc: srow.strucDesc,
  //                   structureId: srow.structureId,
  //                   FieldId: childRow.fieldId,
  //                   StructureFieldDesc: srow.strucDesc + '/' + childRow.fieldId,
  //                   pickList: childRow.pickList
  //                 });
  //               })
  //             }
  //           })
  //           if (i === resp.length - 1) {
  //               this.getSourceTargetFields(temp);
  //           }
  //         }, (error) => {
  //           if (error.status === 500 && error.statusText.toString().toLocaleLowerCase() === 'ok') {
  //             if (i === resp.length - 1) {
  //               this.getSourceTargetFields(temp);
  //             }
  //           }
  //         })
  //     })
  //     if(resp.length===0){
  //       this.sourceTargetshowSkeleton=false;
  //     }
  //   },(error)=>{
  //     this.sourceTargetshowSkeleton=false;
  //     this.snackBar.open('Server error', 'okay', {
  //       duration: 1000
  //     })
  //   })
  // }

  getFields(searchString = '') {
    if (!this.moduleId) { return };

    this.coreService.getMetadataFieldsByModuleId([this.moduleId], searchString).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      if(
        Object.keys(metadataModeleResponse.hierarchy).length>0 ||
        Object.keys(metadataModeleResponse.headers).length>0 ||
        Object.keys(metadataModeleResponse.grids).length>0 ||
        Object.keys(metadataModeleResponse.gridFields).length>0 ||
        Object.keys(metadataModeleResponse.hierarchyFields).length>0
      ) {
        this.filteredStructures = this.prepareSourceTargetDropdownOptions(metadataModeleResponse);
        this.filteredStructuresTarget = this.prepareSourceTargetDropdownOptions(metadataModeleResponse);
        console.log('filteredStructuresTarget', this.filteredStructuresTarget)
        if(!searchString) {
          this.Structures = JSON.parse(JSON.stringify(this.filteredStructures));
        }
        this.sourceTargetshowSkeleton = false;
        this.fieldMetaDataResponse = metadataModeleResponse;
      }
    }, (err) => {
      console.error(`Error:: ${err.message}`);
    });
  }

  prepareTargetDropdownOptions(fieldMetaDataResponse: MetadataModeleResponse, SelectedOptions: SelectedOptionsRule){
    const hierarchies: any[] = fieldMetaDataResponse.hierarchy;
    const headerFields = fieldMetaDataResponse.headers;
    const grids = fieldMetaDataResponse.grids;
    const gridFields = fieldMetaDataResponse.gridFields;
    const hierarchyFields = fieldMetaDataResponse.hierarchyFields;
    const hierarchiesArray = [{
      structureId: 1,
      moduleId: this.moduleId,
      parentStrucId: '1',
      isHeader: true,
      language: this.locale,
      strucDesc: 'Header Data',
      Fields: []
    }];


    const allowedStructuresIds = hierarchies.filter(d=> d.parentStrucId === SelectedOptions.parentStrucId).map(d=> +d.structureId); // parallel structure ids
    if(SelectedOptions.structureId === 1) {
      allowedStructuresIds.push(1);
    }
    const childStructuresIds = hierarchies.filter(d=> allowedStructuresIds.indexOf(d.parentStrucId)>=0).map(d=> +d.structureId); // child structure ids
    const allAllowedStructuresIds: number[] = uniq([...allowedStructuresIds, ...childStructuresIds]); // all combined allowed structure ids

    for(const fieldId of Object.keys(headerFields)) {
      if(allAllowedStructuresIds.indexOf(+headerFields[fieldId].structureId) >= 0) {
        hierarchiesArray[0].Fields.push(headerFields[fieldId]);
        this.fieldNames[fieldId] = headerFields[fieldId].description;
      }
    }

    // grid fields
    for (const key of Object.keys(grids)) {
      if((+grids[key].structureId) === SelectedOptions.structureId) { // only selected structures grids are allowed to select in the target
        const grid = grids[key];
        const gridData = {
          structureId: grid.structureId || '',
          moduleId: this.moduleId,
          parentStrucId: '1',
          isHeader: false,
          language: this.locale,
          strucDesc: grid.description,
          Fields: []
        };
        for (const fieldId of Object.keys(gridFields[key])) {
          // child fields of the grid cannot be grid type. that why check by dataType and picklist
          if(((+gridFields[key][fieldId].structureId) === SelectedOptions.structureId) && !(gridFields[key][fieldId].dataType === 'CHAR' && gridFields[key][fieldId].pickList === '15')) {
            const field = gridFields[key][fieldId];
            gridData.Fields.push(field);
            this.fieldNames[fieldId] = gridFields[key][fieldId].description;
          }
        }
        hierarchiesArray.push(gridData);
      }
    }

    hierarchies?.forEach(str =>{
      const structure = str.structureId || '';
      const parentStructure = str.parentStrucId || '';
      str.Fields  = [];
      if(allAllowedStructuresIds.indexOf(+structure)>=0 && hierarchyFields[structure]) {
        for(const fieldId of Object.keys(hierarchyFields[structure])) {
          str.Fields.push(hierarchyFields[structure][fieldId]);
          this.fieldNames[fieldId] = hierarchyFields[structure][fieldId].description;
        }
      }
      hierarchiesArray.push(str);
    })
    return  hierarchiesArray;
  }
  prepareSourceTargetDropdownOptions(fieldMetaDataResponse){
    const hierarchies = fieldMetaDataResponse.hierarchy;
    const headerFields = fieldMetaDataResponse.headers;
    const grids = fieldMetaDataResponse.grids;
    const gridFields = fieldMetaDataResponse.gridFields;
    const hierarchyFields = fieldMetaDataResponse.hierarchyFields;
    const hierarchiesArray = [{
      structureId: 1,
      moduleId: this.moduleId,
      parentStrucId: '1',
      isHeader: true,
      language: this.locale,
      strucDesc: 'Header Data',
      Fields: []
    }];

    for(const fieldId of Object.keys(headerFields)) {
      hierarchiesArray[0].Fields.push(headerFields[fieldId]);
      this.fieldNames[fieldId] = headerFields[fieldId].description;
    }

    // grid fields
    for (const key of Object.keys(grids)) {
      const grid = grids[key];
      const gridData = {
        structureId: grid.structureId || '',
        moduleId: this.moduleId,
        parentStrucId: '1',
        isHeader: false,
        language: this.locale,
        strucDesc: grid.description,
        Fields: []
      };
      for (const fieldId of Object.keys(gridFields[key])) {
        const field = gridFields[key][fieldId];
        gridData.Fields.push(field);
        this.fieldNames[fieldId] = gridFields[key][fieldId].description;
      }
      hierarchiesArray.push(gridData);
    }

    hierarchies?.forEach(str =>{
      const structure = str.structureId || '';
      str.Fields  = [];
      if(hierarchyFields[structure]) {
        for(const fieldId of Object.keys(hierarchyFields[structure])) {
          str.Fields.push(hierarchyFields[structure][fieldId]);
          this.fieldNames[fieldId] = hierarchyFields[structure][fieldId].description;
        }
      }
      hierarchiesArray.push(str);
    })
    return  hierarchiesArray;
  }
  SaveUpdateGroup() {

    if (this.SelectedOptions.length === 0 || this.TargetSelectedOptions.length === 0) {
      this.openAlert('Alert', 'There must at least one source and target field')
    }
    else {
      const sourceFields = [];
      const targetFields = [];
      this.SelectedOptions.map((row) => {
        sourceFields.push(row.FieldId)
      })
      this.TargetSelectedOptions.map((row) => {
        targetFields.push(row.FieldId);
      })
      const body = {
        description: this.ruleTitle,
        priority: 1111,
        source: sourceFields,
        target: targetFields,
      }
      this.ruleService.updateModuleRules(this.moduleId,this.groupId, body).subscribe((resp) => {
        this.isSourceTargetSaved = true;
        this.snackBar.open('Saved Successfully', 'okay', {
          duration: 1000
        });
      })
    }

  }
  enableFields(){
    this.sourceCtrl.enable();
    this.targetCtrl.enable();
    this.fieldDisabled=false;
  }
  disableFields(){
    this.sourceCtrl.disable();
    this.targetCtrl.enable();
    this.fieldDisabled=true;
  }
  onPageChange(event: PageEvent) {
    if (this.conditionsPageIndex !== event.pageIndex) {
      this.conditionsPageIndex = event.pageIndex;
      this.dataSource.data.length= 0;
      this.Conditions.length=0;
      this.targetIndex=0;
      this.conditionshowSkeleton=true;
      this.getConditions();
    }
  }

  isSourceTargetExists(): boolean {
    if (this.SelectedOptions.length === 0 || this.TargetSelectedOptions.length === 0) {
      return false;
    }else {
      return true;
    }
  }
  downloadTemplate(){
    if (!this.isSourceTargetExists()) {
      this.openAlert('Alert', 'There must at least one source and target field')
    }
    else{
      try {
        let ws = XLSX.utils.json_to_sheet([]);
        ws = this.setTemplateData(ws);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rules');
        XLSX.writeFile(wb,this.getFileName(true));
      } catch (e) {
      }
    }
  }

  saveRuleToFile() {
    if (!this.isSourceTargetExists()) {
      this.openAlert('Alert', 'There must at least one source and target field')
    }
    else{
      try {
          let ws = XLSX.utils.json_to_sheet([]);
          ws = this.setTemplateData(ws);
          ws = this.setRuleData(ws);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Rules');
          XLSX.writeFile(wb, this.getFileName(false));
        } catch (e) {
      }
    }
  }

  getFileName(isTemplate = true) {
    if(isTemplate) {
      return  `Rule_Template_${this.groupId}_${Number(new Date())}.xlsx`;
    }else {
      return  `Rules_${this.groupId}_${Number(new Date())}.xlsx`;
    }
  }

  loadRulesFromFile() {
    if (!this.isSourceTargetExists()) {
      this.openAlert('Alert', 'There must at least one source and target field')
    }
    else{
      try {
        this.rulesFile.nativeElement.click();
      } catch (e) {
      }
    }
  }

  setCellValue(ws: XLSX.WorkSheet, row: number, column: number, value: any): XLSX.WorkSheet {
    const cellRef = XLSX.utils.encode_cell({r: row, c: column});
    const cell = ws[cellRef];
    if (cell) {
      cell.v = value;
    } else {
      XLSX.utils.sheet_add_aoa(ws, [[value]], {origin: cellRef});
    }
    return ws;
  }

  setTemplateData(worksheet: XLSX.WorkSheet): XLSX.WorkSheet {
    let ws = worksheet;
    ws = this.setCellValue(ws, 0, 0, 'Mapping Id');
    ws = this.setCellValue(ws, 0, 1, 'Source');
    ws['!merges'] = [];
    const sourceMerge = { s: {r: 0, c: 1}, e: { r: 0, c: this.SelectedOptions.length } };
    if(this.SelectedOptions.length > 1) {
      ws['!merges']=[sourceMerge];
    }

    this.SelectedOptions.forEach((source: any, index: number) => {
      ws = this.setCellValue(ws, 1, index + 1, source.FieldId);
      ws = this.setCellValue(ws, 2, index + 1, this.fieldNames[source.FieldId]);
    });

    ws = this.setCellValue(ws, 0, this.SelectedOptions.length + 1, 'Target');
    const targetMerge = [{
      s: {
        r: 0,
        c: this.SelectedOptions.length + 1
      },
      e: {
        r: 0,
        c: (this.TargetSelectedOptions.length * 3) + this.SelectedOptions.length
      }
    }];

    this.TargetSelectedOptions.forEach((target: any, index: number) => {
      ws = this.setCellValue(ws, 1, (this.SelectedOptions.length + 1) + 3 * index, target.FieldId);
      ws = this.setCellValue(ws, 2, (this.SelectedOptions.length + 1) + 3 * index, this.fieldNames[target.FieldId]);
      ws = this.setCellValue(ws, 2, (this.SelectedOptions.length + 1) + 3 * index + 1, 'property');
      ws = this.setCellValue(ws, 2, (this.SelectedOptions.length + 1) + 3 * index + 2, 'default');

      targetMerge.push({
        s: {
          r: 1,
          c: (this.SelectedOptions.length + 1) + 3 * index
        },
        e: {
          r: 1,
          c: (this.SelectedOptions.length) + 3 * (index + 1)
        }
      });
    })
    this.dataSource.data.forEach((item,index)=>{
      ws = this.setCellValue(ws,3+index,1,item.sourceFieldValue);
      ws = this.setCellValue(ws,3+index,(this.SelectedOptions.length + 1),item.targetFieldValue);
      ws = this.setCellValue(ws,3+index,(this.SelectedOptions.length + 1)+                                                                                                                                                                                          2,item.isDefault?'YES':'NO');
    })

    ws['!merges'] = [...ws['!merges'], ...targetMerge];
    return ws;
  }


  getFieldIdColMapping(worksheet: XLSX.WorkSheet) {
    const mapping = {};
    const range = { s: {r: 1, c: 1}, e: {r: 1, c: this.SelectedOptions.length + this.TargetSelectedOptions.length * 3}};
    for(let R = range.s.r; R <= range.e.r; ++R) {
      for(let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = {c:C, r:R};
        /* if an A1-style address is needed, encode the address */
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if(worksheet[cell_ref]) {
          const fieldId = worksheet[cell_ref].v;
          mapping[fieldId] = C;
        }
      }
    }
    return mapping;
  }

  setRuleData(worksheet: XLSX.WorkSheet): XLSX.WorkSheet {
    let ws = worksheet;
    const fieldColMapping = this.getFieldIdColMapping(ws);
    const mappingIdRowMapping = {};
    let rulesRowAdded = 0;
    this.dataSource.data.forEach((item: any) => {
      if(!mappingIdRowMapping[item.mappingId]) {
        ws = this.setCellValue(ws, 3 + rulesRowAdded, 0, item.mappingId);
        mappingIdRowMapping[item.mappingId] = 3 + rulesRowAdded;
        ++rulesRowAdded;
      }
      const rowNumber = mappingIdRowMapping[item.mappingId];
      const sourceColNumber = fieldColMapping[item.sourceField];
      if(sourceColNumber)
        ws = this.setCellValue(ws, rowNumber, sourceColNumber, item.sourceFieldValue);
      const targetColNumber = fieldColMapping[item.targetField];
      if(targetColNumber) {
        ws = this.setCellValue(ws, rowNumber, targetColNumber, item.targetFieldValue);
        ws = this.setCellValue(ws, rowNumber, targetColNumber + 1, item.status);
        ws = this.setCellValue(ws, rowNumber, targetColNumber + 2, String(item.isDefault));
      }
    });
    return ws;
  }
  AddFieldIds(sourceKey,targetKey,mappingkey):any{
    const obj={};
    obj[mappingkey]='';
    this.SelectedOptions.map((r,i)=>{
      if(i===0){
        obj[sourceKey]=r.FieldId;
      }
      else {
        obj[sourceKey+i]=r.FieldId;
      }
    });
    this.TargetSelectedOptions.map((r,i)=>{
      if(i===0) {
        obj[targetKey]=r.FieldId;
        obj[targetKey+i+'p']='';
        obj[targetKey+i+'d']='';
      }
      if(i!==0) {
        obj[targetKey+i]=r.FieldId;
        obj[targetKey+i+'p']='';
        obj[targetKey+i+'d']='';
      }
    })
    return obj;
  }
  // AddConditions(sourceKey,targetKey,mappingkey){
  //   const obj={};
  //   let i=0;
  //   console.log(this.dataSource.data);
  //   this.dataSource.data.map(row=>{


  //   })
  //   obj[mappingkey]='';
  //   this.SelectedOptions.map((r,i)=>{
  //     if(i===0){
  //       obj[sourceKey]=r.FieldId;
  //     }
  //     else {
  //       obj[sourceKey+i]=r.FieldId;
  //     }
  //   });
  //   this.TargetSelectedOptions.map((r,i)=>{
  //     if(i===0) {
  //       obj[targetKey]=r.FieldId;
  //       obj[targetKey+i+'p']='';
  //       obj[targetKey+i+'d']='';
  //     }
  //     if(i!==0) {
  //       obj[targetKey+i]=r.FieldId;
  //       obj[targetKey+i+'p']='';
  //       obj[targetKey+i+'d']='';
  //     }
  //   })
  // }
}
