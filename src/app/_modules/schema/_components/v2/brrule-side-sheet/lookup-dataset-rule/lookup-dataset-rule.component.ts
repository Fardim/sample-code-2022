import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Fieldlist } from '@models/list-page/listpage';
import { MetadataModeleResponse, TargetSystemResponse } from '@models/schema/schemadetailstable';
import { ModuleInfo } from '@models/schema/schemalist';
import { BlocksList, ConditionalOperator, ConditionBlocks, CoreSchemaBrInfo, LookupRuleMetadata, LookupTypes, LOOKUP_TYPES, UDRBlocksModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { TragetInfo } from 'src/app/_constants';

@Component({
  selector: 'pros-lookup-dataset-rule',
  templateUrl: './lookup-dataset-rule.component.html',
  styleUrls: ['./lookup-dataset-rule.component.scss']
})
export class LookupDatasetRuleComponent implements OnInit, OnDestroy {

  // holds all opeartors list obtained from parent component
  @Input() operatorsList: any = [];
  // holds parent module id
  @Input() moduleId: string;
  @Input() parentMetadata: any;

  @Input() existingData: CoreSchemaBrInfo;

  @Input() isDataFiltering: boolean = false;

  SAPWhenOperatorsList = [];

  // lookup form group that contains all form controls in this component
  lookupForm: FormGroup;

  // lookup types list and filtered list for displaying based on search string
  lookupTypes = LOOKUP_TYPES;
  lookupTypesFiltered = LOOKUP_TYPES;

  // target system list and filtered list for displaying based on search string
  targetSystems: TargetSystemResponse[] = [];
  targetSystemsObs: Observable<TargetSystemResponse[]> = of([]);

  // lookup tables list and filtered list for displaying based on search string
  lookupTables = [];
  lookupTablesObs: Observable<string[]> = of([]);

  // check codes list and filtered list for displaying based on search string
  checkCodes = [];
  checkCodesFiltered = [];

  // holds subscription from throughout the component
  subscriptions = [];

  // holds list of condition blocks
  whenBlocksList: BlocksList = {
    blocksList: [],
    datasetList: [],
    blockType: 'when'
  };
  thenBlocksList: BlocksList = {
    blocksList: [],
    datasetList: [],
    blockType: 'then'
  };

  // block level fields list
  targetFldList: ConditionalOperator[] = [];

  // holds all form control name from lookup form
  allControls: any;

  // holds list of datasets obtained from API
  datasetList: ModuleInfo[] = [];
  datasetListObs: Observable<ModuleInfo[]> = of([]);

  // holds tooltip names
  datasetWhenCondTooltip = 'Define the scope condition between the two datasets to identify the records to be validated.';
  datasetThenCondTooltip = 'Define the validation that needs to be performed on the records in scope.';

  // holds list of fields and metadata for conditional blocks
  datasetInitialSourceFieldsList = [];
  datasetWhenSourceFieldsList = [];
  datasetTargetMetaData: any;
  datasetThenSourceFieldsList = [];

  lookupTableMetaDataFields: Metadata[] = [];
  SAPInitialSourceFieldsList = [];
  SAPWhenSourceFieldsList = [];
  SAPTargetMetaData: any;
  SAPThenSourceFieldsList = [];

  errorFieldsList: any = [];
  errorFieldsListObs: Observable<any> = of([]);
  @Input() set parentFieldsList(fields: any) {
    this.errorFieldsList = fields;
    this.errorFieldsListObs = of(fields);
  };
  @Input() selectedFields = [];

  // Flag to idenftify if current rule is coming under duplicate master rules
  @Input() isDRChild = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  // checks if lookup rule type is Dataset
  get isDatasetLookup() {
    return this.currentLookupType === LookupTypes.WITHIN_DATASET;
  }

  // checks if lookup rule type is SAP table lookup
  get isSAPTableLookup() {
    return this.currentLookupType === LookupTypes.SAP_TABLE_LOOKUP;
  }

  // checks if lookup rule type is SAP check code
  get isSAPFunctionCall() {
    return this.currentLookupType === LookupTypes.SAP_CHECK_CODE;
  }

  // used for checking validations on save click from parent component
  @Input() set checkValidation(val: boolean) {
    if (val === true) {
      this.saveData();
    }
  };
  @Output() saveRule: any = new EventEmitter<boolean>();

  submitted = false;
  currentLookupType = '';
  editMode = false;
  prevSelectedDataset: any;

  constructor(
    private schemaDetailsService: SchemaDetailsService,
    private schemaService: SchemaService,
    public snackBar: MatSnackBar,
    public globalDialogService: GlobaldialogService,
    private coreService: CoreService
  ) { }

  ngOnInit(): void {
    this.buildLookupForm();
    this.createSearchSubscriptions();
    this.getDatasetList();

    if (this.operatorsList.length) {
      const operators = JSON.parse(JSON.stringify(this.operatorsList[0]));
      const opeartorChilds = operators.childs;
      operators.childs = [opeartorChilds[0], opeartorChilds[1], opeartorChilds[2]];
      this.SAPWhenOperatorsList = [operators];
    }
  }

  /**
   * sets values in some form controls when br is opened for edit
   * @param data existing business rule info
   */
  setExistingValues(data: CoreSchemaBrInfo) {
    if (data.lookupRuleMetadata.lookupType) {
      this.lookupForm.controls.lookupType.setValue(data.lookupRuleMetadata.lookupType);
      this.currentLookupType = this.lookupForm.value.lookupType;
      this.selectSingle('lookupType', {option:{value:data.lookupRuleMetadata.lookupType}}, undefined, true);
    }

    const checkCodeGrp = this.lookupForm.controls.checkCodeGroup as FormGroup;
    if (data.lookupRuleMetadata.checkCodes && data.lookupRuleMetadata.checkCodes.length) {
      checkCodeGrp.controls.code.setValue(data.lookupRuleMetadata.checkCodes[0]);
    }
    if (data.lookupRuleMetadata.checkCodeDesc) {
      checkCodeGrp.controls.description.setValue(data.lookupRuleMetadata.checkCodeDesc);
    }

    this.whenBlocksList.blocksList = data.udrData?.when || [];
    this.thenBlocksList.blocksList = data.udrData?.then || [];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub?.unsubscribe();
    });
  }

  /**
   * fetches list of datasets...
   */
  getDatasetList() {
    const params = {
      lang: 'en',
      fetchsize: 50,
      fetchcount: 0,
      description: ''
    };
    const obsv = this.coreService.searchAllObjectType(params, this.isDataFiltering ? [ this.moduleId ] : []);
    const sub = obsv.subscribe((data: ModuleInfo[]) => {
      if (data) {
        this.datasetList = data;
        this.datasetListObs = of(data);
        this.whenBlocksList.datasetList = this.datasetList;
        this.thenBlocksList.datasetList = this.datasetList;

        if (this.existingData && this.existingData.lookupRuleMetadata) {
          this.setExistingValues(this.existingData);
          this.editMode = true;
        } else {
          this.currentLookupType = LookupTypes.WITHIN_DATASET;
        }

        if (this.isDatasetLookup && this.existingData && this.existingData.lookupRuleMetadata) {
          const datasetId = this.existingData.lookupRuleMetadata.lookupDataset || this.moduleId;
          const dataset = this.datasetList.find(x => x.moduleId === String(datasetId));
          if(dataset)
            this.lookupForm.controls.datasetCtrl.setValue(dataset);
          this.selectSingle('datasetCtrl', {option:{value:dataset}});
        }
      }
    });

    this.subscriptions.push(sub);

    return obsv;
  }

  /**
   * gets and sets metadata fields (little by little) for conditional blocks
   * @param fields fieldIds for fetching metadata
   * @param type lookup type
   * @param searchString search string if any
   */
  checkMetadataFields(fields: string[], type, searchString = '', initialLoad = false) {
    const missingModules = [];
    fields.forEach((fld) => {
      if (!this.datasetList.find(x => String(x.moduleId) === String(fld))) {
        missingModules.push(fld);
      }
    });

    if (missingModules.length) {
      this.coreService.searchAllObjectType({lang: 'en', fetchsize: 50, fetchcount: 0, description: ''}, missingModules).subscribe((data) => {
        if (data) {
          this.datasetList = [...this.datasetList, ...data];
        }
        this.getMetadataFields(fields, type, searchString, initialLoad);
      }, (err) => {
        this.getMetadataFields(fields, type, searchString, initialLoad);
      });
    } else {
      this.getMetadataFields(fields, type, searchString, initialLoad);
    }
  }

  getMetadataFields(fields: string[], type, searchString = '', initialLoad = false) {
    fields = fields.filter(field => field);
    const sub = this.coreService.getMetadataFieldsByModuleId(fields, searchString).subscribe((res: any) => {
      if (res) {
        let fieldsList = [];
        const moduleDetails = [];
        const modulesList = Object.keys(res);
        const isSingleModule = modulesList.includes('headers');
        modulesList.forEach((key) => {
          const module = this.datasetList.find(x => x.moduleId === key);
          fieldsList = [...fieldsList, ...this.transformFieldRes(isSingleModule ? res : res[key], module?.moduleDesc, module?.moduleId)];
          moduleDetails.push({id: module?.moduleId, desc: module?.moduleDesc});
        });

        if (!this.moduleId) {
          fieldsList = [...fieldsList, {
            fieldDescri: 'Header fields',
            fieldId: 'header_fields',
            isGroup: true,
            childs: this.errorFieldsList
          }];
        }

        if (type === 'datasetWhen') {
          this.datasetWhenSourceFieldsList = fieldsList;
        } else if (type === 'datasetThen') {
          this.datasetThenSourceFieldsList = fieldsList;
        } else if (type === 'dataset') {
          this.datasetWhenSourceFieldsList = fieldsList;
          this.datasetThenSourceFieldsList = fieldsList;

          if (initialLoad) {
            this.datasetInitialSourceFieldsList = fieldsList;
          }
        } else if (type === 'SAP' && initialLoad) {
          this.getSAPMetadataFields(fieldsList);
        } else if (type === 'SAPWhen') {
          this.SAPWhenSourceFieldsList = this.searchSAPFields(searchString);
        } else if (type === 'SAPThen') {
          const filteredSAPFields = this.searchSAPFields(searchString);
          this.SAPThenSourceFieldsList = [...fieldsList, filteredSAPFields];
        }
      }
    });

    this.subscriptions.push(sub);
  }

  /**
   * searched SAP fields from block level
   * @param searchString search string for SAP fields
   * @returns filtered fields
   */
  searchSAPFields(searchString) {
    const SAPFields = this.lookupTableMetaDataFields[0].childs;
    const fields = SAPFields.filter(fld => fld.fieldDescri.toLowerCase().includes(searchString.toLowerCase()));
    const filteredFields = [{
      fieldId: 'SAP Fields',
      fieldDescri: 'SAP Fields',
      isGroup: true,
      moduleName: 'SAP Fields',
      childs: [...fields]
    }];

    return filteredFields;
  }

  /**
   * fetches SAP fields
   * @param fieldsList MDO dataset fields to be combined with SAP fields
   */
  getSAPMetadataFields(fieldsList: Metadata[] = []) {
    const targetSystem = this.lookupForm.value.targetSystem;
    const connId = targetSystem.connid;
    const tableName = this.lookupForm.value.lookupTable;
    const fields = fieldsList;
    const sub = this.schemaDetailsService.getLookupTablesMetadata(connId, tableName).subscribe(res => {
      if (res) {
        const SAPFields: Metadata = {
          fieldId: 'SAP Fields',
          fieldDescri: 'SAP Fields',
          isGroup: true,
          moduleName: 'SAP Fields',
          moduleId: '_SAP',
          childs: []
        };

        res.forEach(fld => {
          const field: Metadata = {
            fieldId: fld.fieldname,
            fieldDescri: fld.fieldtext,
            childs: [],
            moduleName: 'SAP Fields',
            moduleId: '_SAP',
            isGroup: false
          };
          SAPFields.childs.push(field);
        });
        this.lookupTableMetaDataFields = [SAPFields];
        this.SAPWhenSourceFieldsList = [SAPFields];

        fields.push(SAPFields);
        this.SAPInitialSourceFieldsList = fields;
        this.SAPThenSourceFieldsList = fields;
      }
    });

    this.subscriptions.push(sub);
  }

  /**
   * gets all metadata for target field id
   * @param fldId target field id
   */
  getTargetFieldMetaData(fldId: string): void {
    this.coreService.getMetadataFieldsByModuleId([fldId]).subscribe((res) => {
      if (res) {
        this.datasetTargetMetaData = res;
        this.SAPTargetMetaData = res;
      }
    });
  }

  /**
   * gets target system list
   */
  getTargetSystems() {
    this.schemaDetailsService.getTargetSystems().subscribe(res => {
      if (res) {
        this.targetSystems = res;
        this.targetSystemsObs = of(res);

        if (this.existingData && this.existingData.lookupRuleMetadata) {
          const val = this.targetSystems.find(fld => fld.connid.toString() === this.existingData.lookupRuleMetadata.targetSystem.toString());
          if (val) {
            this.lookupForm.controls.targetSystem.setValue(val);
            this.selectSingle('targetSystem', {option:{value:val}});
          }
        }
      }
    });
  }

  /**
   * gets list of lookup tables
   * @param connId selected target system
   * @param searchString search string
   */
  getLookupTables(connId: number | string, searchString = '') {
    this.schemaDetailsService.getLookupTables(connId, searchString).subscribe(res => {
      if (res) {
        this.lookupTables = res;
        this.lookupTablesObs = of(res);

        if (this.existingData && this.existingData.lookupRuleMetadata && !searchString) {
          const val = this.lookupTables.find(fld => fld === this.existingData.lookupRuleMetadata.lookupTable);
          if (val) {
            this.lookupForm.controls.lookupTable.setValue(val);
            this.selectSingle('lookupTable', {option:{value:val}});
          }
        }
      }
    });
  }

  /**
   * builds control for lookup form
   */
  buildLookupForm() {
    const controls = {
      lookupType: new FormControl(LookupTypes.WITHIN_DATASET, [Validators.required]),
      datasetCtrl: new FormControl(''),
      datasetSelected: new FormControl(''),
      targetSystem: new FormControl(''),
      lookupTable: new FormControl(''),
      errorDisplayFld: new FormControl(''),
      dataSetWhenBlock: new FormGroup({
        blocks: new FormArray([])
      }),
      dataSetThenBlock: new FormGroup({
        blocks: new FormArray([])
      }),
      SAPWhenBlock: new FormGroup({
        blocks: new FormArray([])
      }),
      SAPThenBlock: new FormGroup({
        blocks: new FormArray([])
      }),
      checkCodeGroup: new FormGroup({
        code: new FormControl(''),
        description: new FormControl('')
      })
    };

    this.allControls = controls;
    this.lookupForm = new FormGroup(controls);

    this.applyValidators();
  }

  /**
   * creates logic for updating dropdown fields list for autocomplete fields based on search string
   */
  createSearchSubscriptions() {
    const ctrls = ['lookupType', 'datasetCtrl', 'targetSystem', 'lookupTable', 'errorDisplayFld'];
    ctrls.forEach(ctrl => {
      const sub = this.lookupForm.controls[ctrl].valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe((searchString) => {

        if (typeof(searchString) !== 'string') {
          return;
        } else if (ctrl === 'datasetCtrl') {
          this.datasetListObs = of(this.datasetList);
        }

        switch (ctrl) {
          case 'lookupType':
            this.lookupTypesFiltered = this.lookupTypes.filter(x => x.ruleDesc.toLowerCase().includes(searchString.toLowerCase()));
            break;
          case 'datasetCtrl':
            const obsv = this.coreService.searchAllObjectType({lang: 'en', fetchsize: 50, fetchcount: 0, description: searchString});
            const subs = obsv.subscribe((data: ModuleInfo[]) => {
              const list = data.filter(x => x.moduleDesc?.toLowerCase().includes(searchString.toLowerCase()));
              this.datasetListObs = of(list);
              this.lookupForm.controls.datasetSelected.setValue(searchString);
            });
            this.subscriptions.push(subs);

            break;
          case 'targetSystem':
            const targetSystems = this.targetSystems.filter(x => x.name.toLowerCase().includes(searchString.toLowerCase()));
            this.targetSystemsObs = of(targetSystems);
            break;
          case 'lookupTable':
            const targetSystem = this.lookupForm.value.targetSystem;
            if (this.isSAPTableLookup && targetSystem && targetSystem.connid) {
              this.getLookupTables(targetSystem.connid, searchString);
            }
            break;
          case 'errorDisplayFld':
            const errorFields = this.errorFieldsList.filter(x => x.fieldDescri.toLowerCase().includes(searchString.toLowerCase()));
            this.errorFieldsListObs = of(errorFields);
            break;
        }
      });

      this.subscriptions.push(sub);
    });
  }

  /**
   * updates form control values
   * @param ctrl form control name
   * @param ev autocomplete event
   * @param inputEl input element
   */
  selectSingle(ctrl, ev, inputEl?, skipConfirmation = false) {
    this.lookupForm.controls[ctrl].setValue(ev ? ev.option.value : '');
    const fields = this.moduleId ? [this.moduleId] : [];
    const label = 'This change will remove the rule setup below. Do you wish to continue?';
    if (ctrl === 'lookupType' && !skipConfirmation && this.currentLookupType && (this.lookupForm.value.lookupType !== this.currentLookupType)) {
      this.globalDialogService.confirm({label}, (res) => {
        if (res && res === 'yes') {
          this.applyValidators();
          if (ev.option.value !== LookupTypes.WITHIN_DATASET) {
            this.getTargetSystems();
          }
          this.currentLookupType = ev.option.value;
          this.clearValues();
        } else {
          this.lookupForm.controls.lookupType.setValue(this.currentLookupType);
        }
      });
    } else if (ctrl === 'lookupType' && (skipConfirmation || !this.currentLookupType)) {
      this.applyValidators();
      if (ev.option.value !== LookupTypes.WITHIN_DATASET) {
        this.getTargetSystems();
      }
      this.currentLookupType = ev.option.value;
    } else if (ctrl === 'datasetCtrl') {
      if (this.prevSelectedDataset && this.prevSelectedDataset !== this.lookupForm.value.datasetCtrl) {
        this.globalDialogService.confirm({label}, (res) => {
          if (res && res === 'yes') {
            const clearArrayList = ['dataSetWhenBlock', 'dataSetThenBlock'];
            clearArrayList.forEach(item => {
              const grp = this.lookupForm.controls[item] as FormGroup;
              const array = grp.controls.blocks as FormArray;
              this.clearFormArray(array);
            });

            this.whenBlocksList = {
              ...this.whenBlocksList,
              blocksList: []
            };
            this.thenBlocksList = {
              ...this.thenBlocksList,
              blocksList: []
            };
          } else {
            this.lookupForm.controls.datasetCtrl.setValue(this.prevSelectedDataset);
          }
        });
      }
      const val = ev?.option?.value?.moduleId || '';
      this.lookupForm.controls.datasetSelected.setValue(val);
      if (val !== this.moduleId) {
        fields.push(val);
      }
      this.checkMetadataFields(fields, 'dataset', '', true);
      this.getTargetFieldMetaData(val);
    } else if (ctrl === 'targetSystem') {
      const val = ev.option.value;
      if (this.isSAPTableLookup) {
        this.getLookupTables(val.connid || '');
      }
    } else if (ctrl === 'lookupTable' && ev.option.value) {
      if (this.moduleId) {
        this.getTargetFieldMetaData(this.moduleId);
      }
      this.checkMetadataFields(fields, 'SAP', '', true);
    }

    if (inputEl) {
      inputEl.blur();
    }
  }

  /**
   * clears values in form based on selected lookup type
   */
  clearValues() {
    let clearList = [];
    let clearArrayList = [];
    const checkCodeGrp = this.lookupForm.controls.checkCodeGroup as FormGroup;
    if (this.isDatasetLookup) {
      clearList = ['targetSystem', 'lookupTable', 'errorDisplayFld'];
      clearArrayList = ['SAPWhenBlock', 'SAPThenBlock'];
      checkCodeGrp.controls.code.setValue('');
      checkCodeGrp.controls.description.setValue('');
    } else if (this.isSAPTableLookup) {
      clearList = ['datasetCtrl', 'datasetSelected', 'errorDisplayFld'];
      clearArrayList = ['dataSetWhenBlock', 'dataSetThenBlock'];
      checkCodeGrp.controls.code.setValue('');
      checkCodeGrp.controls.description.setValue('');
    } else if (this.isSAPFunctionCall) {
      clearList = ['datasetCtrl', 'datasetSelected', 'errorDisplayFld', 'targetSystem', 'lookupTable'];
      clearArrayList = ['dataSetWhenBlock', 'dataSetThenBlock', 'SAPWhenBlock', 'SAPThenBlock'];
    }

    clearList.forEach((item) => {
      this.lookupForm.controls[item].setValue('');
    });

    clearArrayList.forEach(item => {
      const grp = this.lookupForm.controls[item] as FormGroup;
      const array = grp.controls.blocks as FormArray;
      this.clearFormArray(array);
    });
  }

  /**
   * clears all controls in the provided form array
   * @param array form array
   */
  clearFormArray(array: FormArray) {
    while (array.length !== 0) {
      array.removeAt(0)
    }
  }

  /**
   * applies validations based on selected lookup type
   */
  applyValidators() {
    this.submitted = false;
    const selectedRuleType = this.lookupForm.controls.lookupType.value;
    let requiredFields = ['lookupType'];
    if (selectedRuleType === LookupTypes.WITHIN_DATASET) {
      requiredFields = [...requiredFields, 'datasetCtrl'];
    } else if (selectedRuleType === LookupTypes.SAP_TABLE_LOOKUP) {
      requiredFields = [...requiredFields, 'targetSystem', 'lookupTable'];
    } else if (selectedRuleType === LookupTypes.SAP_CHECK_CODE) {
      requiredFields = [...requiredFields, 'targetSystem'];
    }

    const checkCodeGrp = this.lookupForm.controls.checkCodeGroup as FormGroup;
    if (selectedRuleType === LookupTypes.SAP_CHECK_CODE) {
      checkCodeGrp.controls.code.setValidators([Validators.required]);
      checkCodeGrp.controls.description.setValidators([Validators.required]);
    } else {
      checkCodeGrp.controls.code.setValidators(null);
      checkCodeGrp.controls.code.clearValidators();
      checkCodeGrp.controls.description.setValidators(null);
      checkCodeGrp.controls.description.clearValidators();
    }

    const controlKeys: any[] = Object.keys(this.allControls);
    const excludedKeys = ['dataSetWhenBlock', 'dataSetThenBlock', 'SAPWhenBlock', 'SAPThenBlock'];
    controlKeys.map((key) => {
      const index = requiredFields.findIndex(reqKey => reqKey === key);
      if (index === -1) {
        if (excludedKeys.includes(key)) {
          return;
        }

        this.lookupForm.controls[key].setValidators(null);
        this.lookupForm.controls[key].clearValidators();
        this.lookupForm.controls[key].updateValueAndValidity();
      } else {
        this.lookupForm.controls[key].setValidators([Validators.required]);
        this.lookupForm.controls[key].updateValueAndValidity();
      }
    });
  }

  /**
   * validates all fields
   */
  checkValidations() {
    // if (!this.isDRChild && !this.selectedFields.length) {
    //   return 'Please select error fields';
    // }

    const formVal = this.lookupForm.value;

    if (!this.lookupTypes.find(x => x.ruleType === formVal.lookupType)) {
      return 'Please select valid lookup type';
    }

    if (this.isDatasetLookup && !this.datasetList.find(x => x.moduleId === formVal.datasetSelected)) {
      return 'Please select valid dataset';
    }

    if (this.isSAPTableLookup && !this.lookupTables.find(x => x === formVal.lookupTable)) {
      return 'Please select valid lookup table';
    }

    if ((this.isSAPTableLookup || this.isSAPFunctionCall) && !this.targetSystems.find(x => x.connid === formVal.targetSystem.connid)) {
      return 'Please select valid target system';
    }
  }

  /**
   * provides dropdown current position icon name based on autocomplete dropdown state
   * @param el autocomplete element
   * @returns dropdown position
   */
  getDropdownPos(el: MatAutocomplete) {
    let pos = 'chevron-down';
    if (el && el.isOpen) {
      pos = 'chevron-up';
    }

    return pos;
  }

  /**
   * updates field list based on search string from api
   * @param ev output event that contains search string and update list type
   */
  updateFldList(ev, type) {
    if (ev && ev.searchString && typeof(ev.searchString) !== 'string') {
      return;
    };

    const searchStr = ev.searchString || '';
    if (ev && ev.type === 'sourceList') {
      const val = this.lookupForm.controls.datasetSelected.value;
      const fields = this.moduleId ? [this.moduleId] : [];
      if (val !== this.moduleId) {
        fields.push(val);
      }
      this.checkMetadataFields(fields, type, searchStr);
    }
  }

  /**
   * gets lookup rule readable value from rule type
   * @param value lookup rule type
   * @returns readable value of rule type
   */
  displayRuleFn(value?: string) {
    return value ? this.lookupTypes.find(type => type.ruleType === value)?.ruleDesc : '';
  }

  /**
   * resets dropdown values to original values
   * @param type list type
   */
  resetValues(type) {
    if (type === 'lookup') {
      this.lookupTypesFiltered = LOOKUP_TYPES;
    }
  }

  /**
   * returns module description from module object
   * @param val dataset object
   * @returns module description
   */
  displayDatasetFn(val: ModuleInfo) {
    return val?.moduleDesc || '';
  }

  /**
   * returns target system name from code
   * @param val selected target system
   * @returns system name
   */
  displayTrgtSystemFn(val: TargetSystemResponse) {
    return val.name || '';
  }

  /**
   * returns provided form control as form group
   * @param ctrl form control group
   * @returns required control as form group
   */
  getBlocksGrp(ctrl) {
    return this.lookupForm.get(ctrl) as FormGroup;
  }

  /**
   * converts raw metadata into metadata fields
   * @param response metadata model response from API
   * @param moduleName module name to be set in front of section headers
   * @returns parsed list of metadata fields
   */
  transformFieldRes(response: MetadataModeleResponse, moduleName = '', moduleId = ''): Metadata[] {
    const metadata: Metadata[] = [];

    // for header
    const headerChilds: Metadata[] = [];

    // pushing object number to lookup rule source field
    headerChilds.push({
      fieldId: 'id',
      fieldDescri: 'Object Number',
      isGroup: false,
      childs: [],
      moduleName,
      moduleId
    });

    if(response.headers) {
      Object.keys(response.headers).forEach(header=>{
        const res = response.headers[header];
        this.addHeaderFields(res);
        headerChilds.push({
          fieldId: res.fieldId,
          fieldDescri: res.fieldDescri,
          isGroup: false,
          childs: [],
          moduleName,
          moduleId
        });
      });
    }
    metadata.push({
      fieldId: 'header_fields',
      fieldDescri: moduleName ? `${moduleName}/Header fields` : 'Header fields',
      isGroup: true,
      childs: headerChilds,
      moduleName,
      moduleId
    });

    // for grid response transformations
    if(response && response.grids) {
      Object.keys(response.grids).forEach(grid=>{
        const childs : Metadata[] = [];
        if(response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(fld=>{
            const fldCtrl = response.gridFields[grid][fld];
            if (+fldCtrl.moduleId === +this.moduleId) {
              this.addGridTypeFields(response, grid, fld, fldCtrl);
            }
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[],
                moduleName,
                moduleId
              });
          });
        }
        metadata.push({
          fieldId: grid,
          fieldDescri: moduleName ? `${moduleName}/${response.grids[grid].fieldDescri}` : response.grids[grid].fieldDescri,
          isGroup: true,
          childs,
          moduleName,
          moduleId
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
            this.addHierarchyFields(fldCtrl);
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[],
                moduleName,
                moduleId
              });
          });
        }
        metadata.push({
          fieldId: hierarchy.heirarchyId,
          fieldDescri: moduleName ? `${moduleName}/${hierarchy.heirarchyText}` : hierarchy.heirarchyText,
          isGroup: true,
          childs,
          moduleName,
          moduleId
        });
      });
    }
    return metadata;
  }

  /**
   * will add searched header fields in parent dataset/current dataset fields
   */
  addHeaderFields(res: Fieldlist) {
    if (+res.moduleId === +this.moduleId) {
      const headers = this.parentMetadata['headers'] || {};
      const index = Object.keys(headers).findIndex(key => key === res.fieldId);
      if (index === -1) {
        this.parentMetadata['headers'] = {
          ...headers,
          [res.fieldId]: res
        }
      }
    }
  }

  /**
   * will add searched hierarchy fields in parent dataset/current dataset fields
   */
  addHierarchyFields(fldCtrl: Fieldlist) {
    if (+fldCtrl.moduleId === +this.moduleId) {
      if (this.parentMetadata['hierarchyFields'].hasOwnProperty(fldCtrl?.structureId)) {
        const index = Object.keys(this.parentMetadata.hierarchyFields[fldCtrl.structureId]).findIndex(key => key === fldCtrl.fieldId);
        if (index === -1) {
          this.parentMetadata.hierarchyFields[fldCtrl.structureId] = {
            ...this.parentMetadata.hierarchyFields[fldCtrl.structureId],
            [fldCtrl.fieldId]: fldCtrl
          }
        }
      } else {
        this.parentMetadata['hierarchyFields'] = {
          [fldCtrl.structureId]: {[fldCtrl.fieldId]: fldCtrl}
        }
      }
    }
  }

  /**
   * will add searched fields inside grid in parent dataset/current dataset fields
   */
  addGridTypeFields(response, grid, fld, fldCtrl) {
    const gridFieldIndex = Object.keys(this.parentMetadata['gridFields']).findIndex(key => key === grid);
    if (gridFieldIndex === -1) {
      this.parentMetadata['grids'] = {
        ...this.parentMetadata['grids'],
        [grid]: response.grids[grid]
      }
      this.parentMetadata['gridFields'] = {
        ...this.parentMetadata['gridFields'],
        [grid]: {
          [fld]: fldCtrl
        }
      }
    } else {
      this.parentMetadata['gridFields'][grid] = {
        ...this.parentMetadata['gridFields'][grid],
        [fld]: fldCtrl
      }
    }
  }

  /**
   * updated selected fields list based on selected error field
   * @param event mat autocomplete event
   * @param inputEl input element binded to autocomplete
   */
  selectErrorFields(event, inputEl) {
    const alreadyExists = this.selectedFields.find(item => item.fieldId === event.option.value);
    if (alreadyExists) {
      this.snackBar.open('This field is already selected', 'error', { duration: 5000 });
    } else {
      this.selectedFields.push({
        fieldDescri: event.option.viewValue,
        fieldId: event.option.value
      });
    }
    this.lookupForm.controls.errorDisplayFld.setValue('');

    if (inputEl) {
      inputEl.blur();
      inputEl.value = '';
    }

    this.errorFieldsListObs = of(this.errorFieldsList);
  }

  /**
   * resets error fields to original list
   */
  resetErrorFields() {
    this.errorFieldsListObs = of(this.errorFieldsList);
  }

  /**
   * gets name from code
   * @param value metadata field
   */
  displayFn(value) {
    return value ? value.fieldDescri : '';
  }

  /**
   * removes appropriate field from selected fields list
   * @param i index
   */
  remove(field, i) {
    this.selectedFields.splice(i, 1);
  }

  /**
   * contains save logic and handles validations for lookup form
   */
  saveData() {
    this.submitted = true;
    const formVal = this.lookupForm.value;
    let errorMsg = '';

    (Object).values(this.lookupForm.controls).forEach(control => {
      if (control.invalid)
        control.markAsTouched();
    });

    if (!this.lookupForm.valid) {
      this.lookupForm.markAllAsTouched();
      errorMsg = 'Please fill the required fields';
    }

    errorMsg = errorMsg || this.checkValidations();
    let data: CoreSchemaBrInfo = {} as CoreSchemaBrInfo;

    if (!errorMsg) {
      const lookupRuleMetadata = new LookupRuleMetadata();
      const udrData =  new ConditionBlocks();
      lookupRuleMetadata.lookupType = formVal.lookupType;
      udrData.when = [];
      udrData.then = [];
      data = {
        udrData,
        lookupRuleMetadata,
        fields: this.selectedFields.map(item => item.fieldId).join(','),
      } as CoreSchemaBrInfo;
      if (this.isDatasetLookup) {
        lookupRuleMetadata.lookupDataset = formVal.datasetSelected;
        udrData.when = this.getBlocksData(formVal.dataSetWhenBlock.blocks, [], formVal.datasetSelected);
        udrData.then = this.getBlocksData(formVal.dataSetThenBlock.blocks, [], formVal.datasetSelected);
      } else if (this.isSAPTableLookup) {
        lookupRuleMetadata.targetSystem = formVal.targetSystem.connid;
        lookupRuleMetadata.lookupTable = formVal.lookupTable;
        udrData.when = this.getBlocksData(formVal.SAPWhenBlock.blocks, [], (this.moduleId || ''));
        udrData.then = this.getBlocksData(formVal.SAPThenBlock.blocks, [], (this.moduleId || ''));
      } else if (this.isSAPFunctionCall) {
        lookupRuleMetadata.targetSystem = formVal.targetSystem.connid;
        lookupRuleMetadata.checkCodes = [formVal.checkCodeGroup.code];
        lookupRuleMetadata.checkCodeDesc = formVal.checkCodeGroup.description;
      }
    }

    this.saveRule.emit({data, errorMsg});
  }

  /**
   * converts form data into response format of block data
   * @param blocks block data
   * @param res prev response on which the data is to be pushed
   * @param targetObjId target field id
   * @returns converted blocks list
   */
  getBlocksData(blocks, res = [], targetObjId = '') {
    const possibleConditions = ['And', 'Or'];
    blocks.forEach((blk, ind) => {
      const data = new UDRBlocksModel();
      data.conditionFieldId = blk.preSelectedSourceFld;
      data.conditionValueFieldId = blk.preSelectedTargetFld;
      data.conditionFieldValue = blk.preSelectedTargetFld;
      data.conditionFieldStartValue = blk.conditionFieldStartValue;
      data.conditionFieldEndValue = blk.conditionFieldEndValue;
      data.blockType = blk.condition;
      data.conditionOperator = blk.operator;
      data.blockDesc = possibleConditions.find(x => x.toLowerCase() === blk.condition.toLowerCase());
      data.objectType = this.moduleId || '';
      data.sRegex = blk.regexCtrl;
      data.targetInfo = blk.targetInfo;
      // data.conditionalFieldValueCtrl = blk.targetFldCtrl;
      data.conditionFieldIdCtrl = blk.sourceFldCtrl;
      data.childs = blk.childs ? this.getBlocksData(blk.childs, [], targetObjId) : [];
      data.order = ind;
      data.sourceObjectType = blk.sourceFldObjType;
      data.targetObjectType = (blk.targetInfo === TragetInfo.VALUE) ? '' : targetObjId;

      res.push(data);
    });

    return res;
  }


  /**
   * Check the RESULT_COUNT field .. if exits then should be hidden for other blocks
   */
  get isResultCountAdd() {
    return this.lookupForm.get('dataSetThenBlock').get('blocks').value.find(f=> f.preSelectedSourceFld  === 'RESULT_COUNT') ? false : true;
  }

}
