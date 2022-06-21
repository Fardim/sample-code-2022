import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CONDITIONS } from '@constants/brrule';
import { MetadataModeleResponse, NewBrDialogResponse } from '@models/schema/schemadetailstable';
import { BlocksList, BusinessRuleType, CoreSchemaBrInfo, DR_CHILD_RULES, DR_CHILD_TIEBREAKER_RULES, DuplicateMasterRule, RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { NewBusinessRulesComponent } from '@modules/schema/_components/new-business-rules/new-business-rules.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';

class ConditionalOperator {
  desc: string;
  childs: string[];
}

@Component({
  selector: 'pros-setup-duplicate-rule',
  templateUrl: './setup-duplicate-rule.component.html',
  styleUrls: ['./setup-duplicate-rule.component.scss']
})
export class SetupDuplicateRuleComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * input property for moduleId
   */
  @Input()
  moduleId: string;

  /**
   * input property for schemaId
   */
  @Input()
  schemaId: string;

  /**
   * input property for business rule
   */
  @Input()
  coreSchemaBrInfo: CoreSchemaBrInfo;

  @Input() set duplicateRuleInfo (data: CoreSchemaBrInfo) {
    this.coreSchemaBrInfo = data;
    this.patchDuplicateForm(data);
  }

  fieldsList = [];
  filteredFieldList = [];
  duplicateFieldsObs: Observable<any> = of(this.fieldsList);

  @Input() set duplicateFields(flds: any) {
    this.fieldsList = flds;
    this.duplicateFieldsObs = this.duplicateRuleForm.get('fieldSearch').valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value))
    );
    this.updateUDRFldList();
  };

  duplicateRuleForm: FormGroup;

  @Input()
  submitted = false;

  @Input()
  isCustomSchema = false;

  @Output()
  formChange: EventEmitter<FormGroup> = new EventEmitter();

  @Input()
  brId = '';

  @Input()
  metataData: MetadataModeleResponse;

  @Output()
  weightageEmitter: EventEmitter<number> = new EventEmitter();

  duplicateMasterRules: Array<DuplicateMasterRule> = [];

  get tieBreakerRules() {
    return this.duplicateMasterRules.filter(x => x.isTieBreaker);
  }
  get masterRules() {
    return this.duplicateMasterRules.filter(x => !x.isTieBreaker);
  }
  /**
   * Available merge rule types
   */
  MERGE_RULE_TYPES = [
    { label: 'Newest Record', value: 'NEWEST' },
    { label: 'Oldest Record', value: 'OLDEST' },
    { label: 'Maximum value in the field', value: 'MAX' },
    { label: 'Minimum value in the field', value: 'MIN' }
  ];

  /**
   * available merge rule fields
   */
  MERGE_RULE_FIELDS = [
    { label: 'User created', value: 'USERCREATED' },
    { label: 'User modified', value: 'USERMODIFIED' },
    { label: 'Modified On', value: 'APPDATE' },
    { label: 'Date Created', value: 'STAGE' }
  ];

  /**
   * available merge rule fields
   */
   TOKENIZED_MATCH_TYPE = [
    { label: 'Space', value: 'Space' },
    { label: 'Comma', value: 'Comma' },
    { label: 'Semi colon', value: 'Semi_Colon' },
    { label: 'Colon', value: 'Colon' },
    { label: 'Hyphen', value: 'Hyphen' },
    { label: 'Forward slash', value: 'Forward_Slash' },
    { label: 'Backward slash', value: 'Backward_Slash' },
    { label: 'Full stop', value: 'Full_Stop' }
  ];

  subscriptions: Subscription[] = [];

  allBusinessRulesList: CoreSchemaBrInfo[] = [];
  get businessRulesList() {
    return this.allBusinessRulesList.filter(rule => DR_CHILD_RULES.includes(rule.brType as BusinessRuleType));
  }
  get tieBreakerbusinessRulesList() {
    return this.allBusinessRulesList.filter(rule => DR_CHILD_TIEBREAKER_RULES.includes(rule.brType as BusinessRuleType));
  }
  /**
   * Applied search string on brs list
   */
  brSearchString = '';
  serachFieldsSub: BehaviorSubject<string> = new BehaviorSubject(null);
  brListFetchCount = 0;
  businessRuleData: CoreSchemaBrInfo[] = [];

  udrOperators = [];

  udrBlockList: BlocksList = {
    blocksList: [],
    datasetList: []
  };

  valueForAttributeMatchObj={};

  constructor(private formBuilder: FormBuilder,
    public globaldialogService: GlobaldialogService,
    private snackBar: MatSnackBar,
    private schemaService: SchemaService,
    private sharedService: SharedServiceService,
    private router: Router,
    private transientService: TransientService,
    private glocalDialogService: GlobaldialogService) {

    this.initDuplicateRuleForm();

  }


  /**
   * angular hook to detect input value chnages
   * @param changes changes object to detect value changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.coreSchemaBrInfo && changes.coreSchemaBrInfo.currentValue !== changes.coreSchemaBrInfo.previousValue) {
      this.patchDuplicateForm(this.coreSchemaBrInfo);
    }
    if (changes && changes.moduleId && changes.moduleId.currentValue !== changes.moduleId.previousValue) {
      this.getAllBusinessRulesList(this.moduleId, '', '');
    }

  }


  /**
   * Angular hook
   */
  ngOnInit() {

    this.udrOperators = this.possibleOperators();

    // emit duplicate form ref to parent component for validation and value
    this.formChange.emit(this.duplicateRuleForm);

    this.subscriptions.push(
      this.sharedService.getExclusionData()
      .subscribe(data => {
        if (data && !data.editActive) {
          this.updateFieldExclusion(data);
        }
      })
    );

  }

  /**
   * Initialize duplicate rule form
   */
  initDuplicateRuleForm() {

    this.duplicateRuleForm = this.formBuilder.group({
      fieldSearch: [''],
      addFields: this.formBuilder.array([]),
      selCriteria: this.formBuilder.array([]),
      mergeRules: this.formBuilder.array([]),
      removeList: this.formBuilder.array([]),
      masterRules: this.formBuilder.array([]),
      brWeightage: this.formBuilder.control(0, Validators.required),
      scope: this.formBuilder.array([]),
      errWarLevels: this.formBuilder.array([]),
      blocks: this.formBuilder.array([])
    });

    this.duplicateRuleForm.controls.addFields.valueChanges.subscribe((formData: any) => {
      console.log(formData);
      if(formData?.length === 1 && formData[0]?.weightage === `100`) {
        this.weightageEmitter.emit(100);
      }
    })
  }

  /**
   * Patch existing duplicate data
   * @param br pass the business rule data
   */
  patchDuplicateForm(br: CoreSchemaBrInfo) {
    const duplicacyField = br.duplicacyField || [];
    const duplicacyMaster = br.masterRules || [];
    this.udrBlockList.blocksList = br.scope?.length ? br.scope[0].when || [] : [];
    const errWarrLevels = br.errWarLevels || [];
    duplicacyField.forEach(field => this.addFieldRecord(field.fieldId, field));
    duplicacyMaster.sort((a,b) => a.brOrder > b.brOrder ? 1 : a.brOrder < b.brOrder ? -1 : 0).forEach(master => this.addMasterRule(master));
    this.duplicateRuleForm.patchValue({brWeightage: br.brWeightage});
    errWarrLevels.length ? errWarrLevels.forEach(level => this.addErrorWarLevel(level)) : this.addErrorWarLevel();
    this.emitFormData();
  }


  /**
   * function to filter the list
   * @param val fitering text
   */
  filter(val: string): any[] {
    return this.fieldsList.filter(option => {
      return option.fieldDescri.toString().toLowerCase().indexOf(val.toLowerCase()) > -1;
    })
  }

  /**
   * create a field row for duplicate rules
   */
  createFieldRecord(fId, row?) {
    return this.formBuilder.group({
      fId: [row ? row.fId || row.fieldId : fId, Validators.required],
      criteria: [row && row.criteria ? row.criteria.replaceAll(' ', '_') : '', Validators.required],
      exclusion: [row ? row.exclusion : '0'],
      inverse: [row ? row.inverse : '0'],
      weightage: [row ? row.weightage : `${this.totalFieldsWeightage < 100 ? (100 - this.totalFieldsWeightage) : 0}`],
      ival: [row && row.ival ? row.ival : ''],
      sval: [row && row.sval ? row.sval : ''],
      separator: [row && row.separator ? row.separator.replaceAll(' ', '_') : 'Space', Validators.required]
    });
  }

  addFieldRecord(fieldId, row?) {
    let index = this.fieldsList.findIndex((obj)=>obj.fieldId === fieldId);
    this.valueForAttributeMatchObj[fieldId] = this.fieldsList[index];
    if (!fieldId && !row.fieldId && !row.fId) {
      return;
    }

    if (!this.fieldRecords.value.some(v => v.fId === fieldId)) {
      this.fieldRecords.push(
        this.createFieldRecord(fieldId, row)
      );
    } else {
      this.snackBar.open('Field already added', 'okay', { duration: 4000 });
    }
  }

  /**
   * remove an array row from duplicate rule form
   * @param formArrayName name of the form array
   * @param index row index to be removed
   */
  removeFormArrayRow(formArrayName, index) {

    this.glocalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (resp) => {
      this.removeFomArrRowAfterConfirm(resp, formArrayName, index);
    })

  }

  removeFomArrRowAfterConfirm(resp, formArrayName, index) {
    if (resp && resp === 'yes') {
      (this.duplicateRuleForm.get(formArrayName) as FormArray)
        .removeAt(index)
        this.emitFormData()
    }
  }


  getFieldDesc = (fieldId) => {
    const field = this.fieldsList.find(f => f.fieldId === fieldId);
    return field ? field.fieldDescri : fieldId;
  }

  get fieldRecords() {
    return this.duplicateRuleForm.get('addFields') as FormArray;
  }

  get masterRecords() {
    return this.duplicateRuleForm.get('mergeRules') as FormArray;
  }

  /**
   * set control value for duplicate rule form arrays
   * @param arrayName name of the form array
   * @param controlName name of the control
   * @param value value to set
   * @param index index of the form group inside the form array
   */
  setControlValue(arrayName, controlName, value, index) {
    (this.duplicateRuleForm.get(arrayName) as FormArray)
      .at(index).get(controlName).setValue(value);
  }

  dropField(event, formArrayName: string) {

    if (event.previousIndex === event.currentIndex) {
      return;
    }

    // moveItemInArray((this.duplicateRuleForm.get('fields') as FormArray).controls, event.previousIndex, event.currentIndex);
    const formArray = this.duplicateRuleForm.get(formArrayName) as FormArray;
    const dir = event.currentIndex > event.previousIndex ? 1 : -1;

    const from = event.previousIndex;
    const to = event.currentIndex;

    const temp = formArray.at(from);
    for (let i = from; i * dir < to * dir; i = i + dir) {
      const current = formArray.at(i + dir);
      formArray.setControl(i, current);
    }

    formArray.setControl(to, temp);
  }

  getMergeRuleFieldDesc(fieldId) {
    const type = this.MERGE_RULE_FIELDS.find(t => t.value === fieldId);
    return type ? type.label : 'select';
  }

  getMergeRuleTypeDesc(ruleType) {
    const type = this.MERGE_RULE_TYPES.find(t => t.value === ruleType);
    return type ? type.label : ruleType;
  }

  /**
   * open exclusion sidesheet for edition
   * @param item selected field details
   */
  exclusionConf(item: FormGroup) {
    const data = { fId: item.value.fId, exclusion: item.value.exclusion, ival: item.value.ival, sval: item.value.sval, editActive: true };
    this.sharedService.setExclusionData(data)
    this.router.navigate(['', { outlets: { sb3: 'sb3/schema/setup-br-exclusion' } }]);
  }

  /**
   * update field exclusion
   * @param data new exclusion data
   */
  updateFieldExclusion(data) {

    const fieldIndex = this.fieldRecords.value.findIndex(field => field.fId === data.fId);
    if (fieldIndex !== -1) {
      const fieldGroup = this.fieldRecords.at(fieldIndex);
      fieldGroup.patchValue({
        exclusion: data.exclusion,
        ival: data.ival,
        sval: data.sval
      });

      this.sharedService.setExclusionData(null);

    }
  }

  filterNumFields(value) {
    const textFilteredList = this.filter(value) || [];
    return textFilteredList.filter(field => field.picklist === '0' && (field.dataType === 'NUMC' || field.dataType === 'DESC'));
  }

  setFieldValue(ruleType, fieldId, index) {
    const rulesValue = this.masterRecords.value;
    if (!rulesValue.some((rule, position) => (position !== index) && (rule.fieldId === fieldId) && (rule.ruleType === ruleType))) {
      this.setControlValue('mergeRules', 'fieldId', fieldId, index);
    } else {
      this.snackBar.open('Field already added !', 'okay', { duration: 3000 });
    }
  }

  getDuppCriteriaDesc(criteria) {
    if (!criteria) {
      return 'Select';
    }
    return (criteria === 'Exact_Match') ? 'Exact match'
      : criteria === 'Fuzzy' ? 'Fuzzy' : criteria === 'Tokenized_Match' ? 'Tokenized match' : criteria === 'Attribute_Match' ? 'Attribute Match' : '';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub?.unsubscribe());
  }

  /**
   * Function to get info of all business rules.
   * @param moduleId ID of module
   * @param searchString string to be searched
   * @param brType type of business rule
   * @param loadMore load more
   */
  getAllBusinessRulesList(moduleId: string, searchString: string, brType: string, loadMore?) {
    this.brSearchString = searchString || '';
    if (loadMore) {
      this.brListFetchCount++;
    } else {
      this.brListFetchCount = 0;
    }
    const getAllBrSubscription = this.schemaService.getBusinessRulesByModuleId(moduleId, searchString, brType, `${this.brListFetchCount}`).subscribe((rules: CoreSchemaBrInfo[]) => {
      if (loadMore) {
        if (rules && rules.length) {
          this.allBusinessRulesList = [...this.allBusinessRulesList, ...rules];
        } else {
          this.brListFetchCount--;
        }
      } else {
        this.allBusinessRulesList = rules || [];
      }
    }, (error) => {
      console.error('Error while getting all business rules list', error.message);
    });
    this.subscriptions.push(getAllBrSubscription);
  }

  triggerSearch(str) {
    this.serachFieldsSub.next(str);
  }

  /**
   * Function to open sidesheet to add business rule
   * @param isTieBreaker True if it is a tie breaker rule
   */
  public openBusinessRuleSideSheet(isTieBreaker = false) {
    if(this.isCustomSchema) {
      this.globaldialogService.openDialog(NewBusinessRulesComponent, {
        moduleId: this.moduleId,
        isDRChildRule: true,
        isTieBreaker,
        selectedBusinessRules: [],
        fields: this.fieldsList,
        maxWeightageLimit: this.availableWeightage('0')
      });
      const dialogSubscriber = this.globaldialogService.dialogCloseEmitter
        .pipe(distinctUntilChanged())
        .subscribe((response: NewBrDialogResponse) => {
          if (response && response.formData && response.isDRChildRule) {
            const formData= response.formData;
            delete formData.udrTreeData;
            delete formData.udrDto;
            const allowUDRBlocks = [BusinessRuleType.BR_CUSTOM_SCRIPT, BusinessRuleType.BR_LOOKUP_RULE].includes(formData.brType || formData.rule_type);
            if (!allowUDRBlocks) {
              formData.udrData = null;
            }
            const duplicateRule: DuplicateMasterRule = {
              sno: '',
              brOrder: this.duplicateMasterRules.length,
              coreSchemBrInfo: {
                sno: formData.sno,
                brId: formData.brId,
                lookupRuleMetadata: formData.lookupRuleMetadata,
                refId: formData.refId,
                fields: formData.fields,
                regex: formData.regex,
                order: formData.order,
                script: formData.script,
                brExpose: formData.brExpose,
                status: formData.status,
                categoryId: formData.categoryId,
                standardFunction: formData.standardFunction,
                qryScript: formData.qryScript,
                brIdStr: formData.brIdStr,
                // udrData: formData.udrData,
                duplicacyField: formData.duplicacyField,
                duplicacyMaster: formData.duplicacyMaster,
                masterRules: formData.masterRules,
                isCopied: formData.isCopied,
                copiedFrom: formData.copiedFrom,
                apiKey: formData.apiKey,
                schemaId: formData.schemaId,
                percentage: formData.percentage,
                plantCode: formData.plantCode,
                dontMapped: formData.dontMapped,
                source_field: formData.source_field,
                target_field: formData.target_field,
                accuracyScore: formData.accuracyScore,
                apiSno: formData.apiSno,
                checkCodeDesc: formData.checkCodeDesc,
                desc: formData.desc,
                isEdited: true,
                udrData: {
                  when: formData.udrData?.when || [],
                  then: formData.udrData?.then || []
                },
                brType: formData.rule_type,
                brInfo: formData.rule_name,
                brWeightage: formData.weightage,
                message: formData.error_message,
                isConfigured: true
              } as CoreSchemaBrInfo,
              brStatus: true,
              isTieBreaker
            };
            this.addMasterRule(duplicateRule);
            this.emitFormData();
          }
           dialogSubscriber?.unsubscribe();
        })
    } else {
      this.schemaService.currentweightage = this.availableWeightage('0');
      const dialogSubscriber = this.schemaService.getDRChildResponse({
        isTieBreaker,
        isDRChildRule: true
      }).subscribe((res) => {
        if (res?.data?.brInfo) {
          const duplicateRule: DuplicateMasterRule = {
            sno: '',
            brOrder: this.duplicateMasterRules.length,
            coreSchemBrInfo: {
              isConfigured: true,
              isEdited: true,
              ...res.data.brInfo,
              udrData: {
                when: res.data.when || [],
                then: res.data.then || []
              }
            },
            brStatus: true,
            isTieBreaker
          };
          this.addMasterRule(duplicateRule);
          this.emitFormData();
        }
        dialogSubscriber?.unsubscribe();
      });
      this.router.navigate([{ outlets: {
        sb3: `sb3/schema/business-rule/${this.moduleId}/${this.schemaId}/DRChild` } }]);
    }
  }

  /**
   * Add New Rule to Duplicate Rule Form and the list
   * @param duplicateRule Duplicate Master Rule Object
   */
  addMasterRule(duplicateRule: DuplicateMasterRule) {
    if(duplicateRule.isTieBreaker && this.tieBreakerRules.length) {
      this.deleteBr(this.tieBreakerRules[0]);
    }
    this.duplicateMasterRules.push(duplicateRule);
    const masterRules = this.duplicateRuleForm.get('masterRules') as FormArray;
    const formattedData: any = {};
    for (const key in duplicateRule) {
      if (duplicateRule.hasOwnProperty(key)) {
        formattedData[key] = [duplicateRule[key]];
      }
    }
    const masterRuleControl = this.formBuilder.group(formattedData);
    masterRules.push(masterRuleControl);
    this.formChange.emit(this.duplicateRuleForm);
  }

  /**
   * Update existing master Rule in the list and form
   * @param brIndex Rule Index to be updated
   * @param formData New data to be updated
   */
  updateMasterRule(brIndex, formData) {
    const dRule = this.duplicateMasterRules[brIndex];
    if (formData && dRule) {
      delete formData.udrTreeData;
      delete formData.udrDto;
      const allowUDRBlocks = [BusinessRuleType.BR_CUSTOM_SCRIPT, BusinessRuleType.BR_LOOKUP_RULE].includes(formData.brType || formData.rule_type);
      if (!allowUDRBlocks) {
        formData.udrData = null;
      }
      dRule.coreSchemBrInfo = {
        ...formData,
        brType: formData.rule_type,
        brInfo: formData.rule_name,
        brWeightage: formData.weightage,
        message: formData.error_message,
        isConfigured: true,
        isEdited: true,
        dontMapped: true
      };
    }
    this.emitFormData();
  }

  /**
   * Function to add business rule to schema
   * @param brInfo: business rule information for schema.
   */
  async addBusinessRule(brInfo, isTieBreaker = false) {
    const request: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    request.brId = '';
    request.schemaId = this.schemaId;
    request.brInfo = brInfo.brInfo;
    request.brType = brInfo.brType;
    request.fields = brInfo.fields;
    request.message = brInfo.message;
    request.moduleId = this.moduleId;
    request.isCopied = true;
    request.isEdited = true;
    request.copiedFrom = brInfo.brIdStr;
    request.brWeightage = '0';
    request.accuracyScore = brInfo.accuracyScore;
    request.categoryId = brInfo.categoryId;
    request.apiKey = brInfo.apiKey;
    request.target_field = brInfo.target_field;
    request.isConfigured = false;
    request.source_field = brInfo.source_field;
    request.dontMapped = true;
    request.status = '0';
    const duplicateRule: DuplicateMasterRule = {
      sno: '',
      brOrder: this.duplicateMasterRules.length,
      coreSchemBrInfo: request,
      brStatus: false,
      isTieBreaker
    };
    const brAlreadyExists = this.duplicateMasterRules.find(dupRule => duplicateRule.coreSchemBrInfo.copiedFrom && duplicateRule.coreSchemBrInfo.copiedFrom === dupRule.coreSchemBrInfo.copiedFrom);
    if (brAlreadyExists) {
      this.transientService.open('This business rule is already added.', 'Okay', {
        duration: 2000
      });
      return;
    }
    const dRule = await this.loadBusinessRuleData(duplicateRule,brInfo.brIdStr);
    if(dRule.coreSchemBrInfo.lookupRuleMetadata) {
      delete dRule.coreSchemBrInfo.lookupRuleMetadata.sno;
    }
    this.addMasterRule(dRule);
  }

  /**
   * Update order of business rule
   * @param event updateable ordrer
   */
  drop(event: CdkDragDrop<any>, listType: string) {
    if (event.previousContainer === event.container) {
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      moveItemInArray(this.duplicateMasterRules,
        this.duplicateMasterRules.findIndex(rule => rule === event.container.data[event.previousIndex]),
        this.duplicateMasterRules.findIndex(rule => rule === event.container.data[event.currentIndex])
      );
      this.emitFormData();
    }
  }

  /**
   * Update duplicate data in br side sheet component
   */
  emitFormData() {
    const masterRules= this.duplicateRuleForm.get('masterRules') as FormArray;
    this.duplicateMasterRules.forEach((rule, i) => {
      rule.brOrder = i;
      rule.coreSchemBrInfo.dontMapped = true;
      masterRules.at(i).setValue(rule);
    });
    this.formChange.emit(this.duplicateRuleForm);
  }


  /**
   * to convert rule type into rule description
   * @param ruleType ruleType of a business rule object
   */
  public getRuleDesc(ruleType: string) {
    return RULE_TYPES.find(rule => rule.ruleType === ruleType)?.ruleDesc;
  }

  /**
   * Function to check for the maximum available threshold for business rule
   * @param weightage threshold of the business rule.
   * @returns maximum value of slider to available.
   */
  availableWeightage(weightage = '0'): number {
    let sumOfAllWeightage = 0; // store sum of all business rules weightage
    let freeWeight = 0;        // store max free weightage for any business rule

    sumOfAllWeightage = this.duplicateMasterRules.reduce((total, businessRule) => {
      return total + Number(businessRule.coreSchemBrInfo.brWeightage) + sumOfAllWeightage;
    }, 0);
    freeWeight = 100 - sumOfAllWeightage;

    return freeWeight + Number(weightage); // max value to slide for a business rule
  }

  /**
   * Function to open business rule dialog for further configuration
   * @param rule the selected rule which is to be configured
   */
  configureRule(dRule: DuplicateMasterRule) {
    const brIndex = this.duplicateMasterRules.indexOf(dRule);
    if (this.isCustomSchema) {
      // destructure the business rule object
      const {
        brId,
        tempId,
        brType,
        brInfo,
        message,
        regex,
        udrData,
        brWeightage,
        standardFunction,
        categoryId,
        fields,
        apiKey,
        transFormationSchema,
        duplicacyField,
        duplicacyMaster,
        masterRules,
        source_field,
        accuracyScore,
        lookupRuleMetadata,
        target_field
      } = dRule.coreSchemBrInfo;
      const isTieBreaker = dRule.isTieBreaker;

      // Handle duplicacy rule data
      const duplicacyRuleData = { duplicacyField, duplicacyMaster, masterRules };
      const drData = {
        maxWeightageLimit: this.availableWeightage(dRule.coreSchemBrInfo.brWeightage),
        moduleId: this.moduleId,
        isDRChildRule: true,
        isTieBreaker,
        fields: this.fieldsList,
        tempId,
        brId,
        brIndex,
        createRuleFormValues: {
          rule_type: brType,
          rule_name: brInfo,
          error_message: message,
          lookupRuleMetadata,
          standard_function: standardFunction,
          regex,
          fields,
          apiKey,
          udrData,
          weightage: brWeightage,
          categoryId,
          transFormationSchema,
          duplicacyRuleData,
          accuracyScore,
          source_field,
          target_field
        }
      };
      // Open business rule configuration dialog
      this.globaldialogService.openDialog(NewBusinessRulesComponent, drData);
      // Subscribe the dialog close event
      const dialogSubscriber = this.globaldialogService.dialogCloseEmitter
        .pipe(distinctUntilChanged())
        .subscribe((response: NewBrDialogResponse) => {
          if (response?.isDRChildRule) {
            this.updateMasterRule(brIndex, response?.formData);
          }
          if(dialogSubscriber) {
            dialogSubscriber.unsubscribe();
          }
        });
    } else {
      this.schemaService.currentweightage = this.availableWeightage(dRule.coreSchemBrInfo.brWeightage);
      const dialogSubscriber = this.schemaService.getDRChildResponse(dRule)
        .subscribe((res) => {
          if (res?.data?.brInfo) {
            if (dRule) {
              const formData = res.data.brInfo;
              dRule.coreSchemBrInfo = {
                sno: formData.sno,
                brType: dRule.coreSchemBrInfo.brType,
                brId: formData.brIdStr || formData.brId,
                lookupRuleMetadata: formData.lookupRuleMetadata,
                refId: formData.refId,
                fields: formData.fields,
                regex: formData.regex,
                order: formData.order,
                script: formData.script,
                brExpose: formData.brExpose,
                status: formData.status,
                categoryId: formData.categoryId,
                standardFunction: formData.standardFunction,
                qryScript: formData.qryScript,
                brIdStr: formData.brIdStr,
                duplicacyField: formData.duplicacyField,
                duplicacyMaster: formData.duplicacyMaster,
                masterRules: formData.masterRules,
                isCopied: formData.isCopied,
                copiedFrom: formData.copiedFrom,
                apiKey: formData.apiKey,
                schemaId: formData.schemaId,
                percentage: formData.percentage,
                plantCode: formData.plantCode,
                dontMapped: formData.dontMapped,
                source_field: formData.source_field,
                target_field: formData.target_field,
                accuracyScore: formData.accuracyScore,
                apiSno: formData.apiSno,
                checkCodeDesc: formData.checkCodeDesc,
                desc: formData.desc,
                isConfigured: true,
                isEdited: true,
                brWeightage: formData.brWeightage,
                brInfo: formData.brInfo,
                udrData: {
                  when: res.data.when || [],
                  then: res.data.then || []
                },
                moduleId: formData.moduleId
              } as CoreSchemaBrInfo;
              delete dRule.coreSchemBrInfo.udrDto;
              this.emitFormData();
            }
          }
          if(dialogSubscriber) {
            dialogSubscriber.unsubscribe();
          }
        });
      this.router.navigate([{
        outlets: {
          sb3: `sb3/schema/business-rule/${this.moduleId}/${this.schemaId}/DRChild`
        }
      }]);
    }
  }

  /**
   * Delete business rule
   * @param dRule Master Rule Object
   */
  deleteBr(dRule: DuplicateMasterRule) {
    const dRuleIndex = this.duplicateMasterRules.indexOf(dRule);
    if(dRuleIndex> -1) {
      this.duplicateMasterRules.splice(dRuleIndex, 1);
      const masterRules = this.duplicateRuleForm.get('masterRules') as FormArray;
      masterRules.removeAt(dRuleIndex);
      this.emitFormData();
    }
  }

  deleteBrAfterConfirm(dRule: DuplicateMasterRule) {
    this.glocalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (resp) => {
      if(resp === 'yes') {
        this.deleteBr(dRule);
      }
    });
  }

  /**
   * Update weightage for a business rule
   */
  weightageChange(event: any, dRule: DuplicateMasterRule) {
    if(dRule.coreSchemBrInfo.isEdited) {
      dRule.coreSchemBrInfo.brWeightage = event.value;
      this.emitFormData();
    } else {
      this.schemaService.getBusinessRuleInfoV2(dRule.coreSchemBrInfo.brIdStr).subscribe((brInfo) => {
        brInfo.lookupRuleMetadata.sno = `${brInfo.lookupRuleMetadata ? brInfo.lookupRuleMetadata.lookupStr : ''}`;
        Object.assign(dRule.coreSchemBrInfo, {
          lookupRuleMetadata: brInfo.lookupRuleMetadata,
          udrData: brInfo.udrData,
          isEdited: true,
          brWeightage: event.value
        });
        this.emitFormData();
      }, (error) => {
        this.transientService.open('Error occured while updating the weightage!');
      });
    }
  }

  /**
   * Format weightage value
   */
  getWeightage(weithage) {
    return weithage ? Number(weithage) : 0;
  }

  /**
   * Toggle Master Rule Status
   * @param dRule Duplicate Master Rule Object
   */
  toggleBrStatus(dRule: DuplicateMasterRule) {
    const status = dRule.coreSchemBrInfo.status === '1' ? '0' : '1';
    dRule.brStatus = Boolean(status === '1');
    if(dRule.coreSchemBrInfo.isEdited) {
      dRule.coreSchemBrInfo.status = status;
      this.emitFormData();
    } else {
      this.schemaService.getBusinessRuleInfoV2(dRule.coreSchemBrInfo.brIdStr).subscribe((brInfo) => {
        brInfo.lookupRuleMetadata.sno = `${brInfo.lookupRuleMetadata ? brInfo.lookupRuleMetadata.lookupStr : ''}`;
        Object.assign(dRule.coreSchemBrInfo, {
          lookupRuleMetadata: brInfo.lookupRuleMetadata,
          udrData: brInfo.udrData,
          isEdited: true,
          status
        });
        delete dRule.coreSchemBrInfo.udrDto;
        this.emitFormData();
      }, (error) => {
        this.transientService.open('Error occured while updating the status!');
      });
    }
  }

  async loadBusinessRuleData(dRule: DuplicateMasterRule, brId: string) {
    if(!brId) { return; };

    try {
      const brInfo = await this.schemaService.getBusinessRuleInfoV2(brId).toPromise();
      Object.assign(dRule.coreSchemBrInfo, {
        lookupRuleMetadata: brInfo.lookupRuleMetadata,
        udrData: brInfo.udrData,
        isConfigured: true,
        isEdited: true,
        status: '1'
      });
      dRule.brStatus = true;
      delete dRule.coreSchemBrInfo.udrDto;
    } catch (e) {
      console.warn(`Error while loading business rule data for ${brId}`, e);
    }
    return dRule;
  }

  getTokenizedMatch(match) {
    if (!match) {
      return 'Select';
    }
    const tMatch = this.TOKENIZED_MATCH_TYPE.find(m => m.value === match);
    return tMatch ? tMatch.label : '';
  }

  fieldRecordWeightageChange(weightage: any, index: number) {
    this.setControlValue('addFields', 'weightage', `${weightage}`, index);
    if(index < (this.fieldRecords.length - 1)) {
      const weightageDiff = (100 - this.totalFieldsWeightage)/(this.fieldRecords.length - index - 1);
      for(let i=index+1; i<this.fieldRecords.length; i++) {
        const newWeightage = (+(Number(this.fieldRecords.value[i]?.weightage || 0) + weightageDiff)).toFixed(1);
        this.setControlValue('addFields', 'weightage', `${+newWeightage > 0 ? newWeightage : 0}`, i);
      }
    }

    const currentweightage = this.totalFieldsWeightage;
    this.weightageEmitter.emit(currentweightage);
  }

  get totalFieldsWeightage() {
    return this.fieldRecords.value.reduce((total, row) => {
      return total + Number(row.weightage);
    }, 0);
  }

  get errWarLevels() {
    return this.duplicateRuleForm.get('errWarLevels') as FormArray;
  }

  addErrorWarLevel(details?) {
    if(this.errWarLevels.length === 2) {
      return;
    } else if(this.errWarLevels.length===1) {
      const existingLevelType = this.errWarLevels.value[0].type;
      existingLevelType === 'ERROR' ? this.errWarLevels.insert(0, this.createErrWarnLevel(details))
        : this.errWarLevels.push(this.createErrWarnLevel(details));
    } else {
      this.errWarLevels.push(this.createErrWarnLevel(details));
    }
    this.manageErrWarnLimits();
  }

  /**
   * create an error or warning level
   */
  createErrWarnLevel(details?) {
    const formGroup = this.formBuilder.group({
      st: [details?.st || details?.start || null],
      et: [details?.et || details?.end || null],
      type: [details ? details.type : this.getAvailableErrWarnType()],
      order: [details ? details.order : '0'],
      message: [details ? details.message : ''],
    });
    if(formGroup.value.type === 'ERROR') {
      formGroup.get('message').addValidators(Validators.required);
      formGroup.get('message').updateValueAndValidity();
    }
    return formGroup;
  }

  errWarnWeightageChange(event, index) {
    const previousSt = this.errWarLevels.value[index].st;
    const previousEt = this.errWarLevels.value[index].et;
    if((previousSt !== event.min) && (event.min > previousEt)) {
      this.setControlValue('errWarLevels', 'st', `${previousEt}`, index);
    } else if((previousEt !== event.max) && (event.max < previousSt)) {
      this.setControlValue('errWarLevels', 'et', `${previousSt}`, index);
    } else {
      this.setControlValue('errWarLevels', 'st', `${event.min}`, index);
      this.setControlValue('errWarLevels', 'et', `${event.max}`, index);
    }
  }

  getErrWarnLimit(index, side: 'min' | 'max') {
    if(side === 'min') {
      if(index===0) return Number(this.duplicateRuleForm.value.brWeightage) || 0;
      return Number(this.errWarLevels.value[0].et);
    } else {
      if((this.errWarLevels.length===2) && (index===0)) return Number(this.errWarLevels.value[1].st);
      return 100;
    }
  }

  manageErrWarnLimits() {
    this.errWarLevels.value.forEach((level, index) => {
      if(!level.st)
      this.setControlValue('errWarLevels', 'st', this.getErrWarnLimit(index, 'min'), index);

      if(!level.et)
      this.setControlValue('errWarLevels', 'et', this.getErrWarnLimit(index, 'max'), index);
    });
  }

  getAvailableErrWarnType() {
    const selectedOptions = this.errWarLevels.value.map(v => v.type);
    const possibleOptions = ['ERROR', 'WARNING'];
    return possibleOptions.find(option => !selectedOptions.includes(option));
  }

  updateUDRFldList(searchString = '') {
    searchString = typeof searchString === 'string' ? searchString.toLowerCase() : '';
    this.filteredFieldList =  [{
        fieldDescri: 'Header fields',
        fieldId: 'header_fields',
        isGroup: true,
        childs: !searchString ? [...this.fieldsList] : this.fieldsList.filter(fld => fld.fieldDescri.toLowerCase().includes(searchString))
    }];
  }

  /**
   * Return all possible operators
   */
   possibleOperators(): ConditionalOperator[] {
    // get generic operators
    const genericOp: ConditionalOperator = new ConditionalOperator();
    genericOp.desc = CONDITIONS.common.desc;
    genericOp.childs = CONDITIONS.common.operators;

    // for numeric number field
    const onlyNum: ConditionalOperator = new ConditionalOperator();
    onlyNum.desc = CONDITIONS.numeric.desc;
    onlyNum.childs = CONDITIONS.numeric.operators;

    // for special operators
    const specialOpe: ConditionalOperator = new ConditionalOperator();
    specialOpe.desc = CONDITIONS.special.desc;
    specialOpe.childs = CONDITIONS.special.operators;

    return [genericOp, onlyNum, specialOpe];
  }
}
