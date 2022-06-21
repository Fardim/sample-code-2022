import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { BusinessRuleType, CoreSchemaBrInfo, UDRBlocksModel, UdrModel, RULE_TYPES, PRE_DEFINED_REGEX, TransformationRuleType, TransformationModel, DuplicateRuleModel, TransformationMappingResponse, TransformationMappingTabResponse, TransformationRuleMapped, ApiRulesInfo, DR_CHILD_RULES, DR_CHILD_TIEBREAKER_RULES, DescriptionRule, BlocksList, DescriptiveConditionList, TRANSFORMATION_TYPES, ZeroRuleTypes, crossDataRuleInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { CategoryInfo, ConstantRule, ZeroRule, FieldConfiguration, LookupFields, MetadataModeleResponse, TransformationFormData, EmptySpaceRule, TransformationInfo } from '@models/schema/schemadetailstable';
import { of, Observable } from 'rxjs';
import { startWith, map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Regex } from '@modules/admin/_components/module/business-rules/regex-rule/regex-rule.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '@services/home/schema.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { BlockType } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-cdktree.service';
import { CONDITIONS } from 'src/app/_constants/brrule';
import { TransformationRuleComponent } from '@modules/shared/_components/transformation-rule/transformation-rule.component';
import { ValidationError } from '@models/schema/schema';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { RuleDependentOn } from '@models/collaborator';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { GlobaldialogService } from '@services/globaldialog.service';
import { TransientService } from 'mdo-ui-library';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { debounce } from 'lodash';
import { CoreService } from '@services/core/core.service';
import { MatTableDataSource } from '@angular/material/table';
import { TragetInfo } from 'src/app/_constants';
import { AutoExtensionService } from '@services/auto-extension.service';
import { LookupDatasetRuleComponent } from './lookup-dataset-rule/lookup-dataset-rule.component';
import { notifInfo } from './notification-rule/notification-rule.modal';
import { MdoMappings } from '@models/mapping';
import { Fieldlist } from '@models/list-page/listpage';

class ConditionalOperator {
  desc: string;
  childs: string[];
}

@Component({
  selector: 'pros-brrule-side-sheet',
  templateUrl: './brrule-side-sheet.component.html',
  styleUrls: ['./brrule-side-sheet.component.scss']
})
export class BrruleSideSheetComponent implements OnInit {
  currentWeightage: number;
  /**
   * Class contructor
   * @param dialogRef refernce to matdialog
   * @param data data recieved from parent
   * @param schemaDetailsService service class
   */
  constructor(
    private schemaDetailsService: SchemaDetailsService,
    private snackBar: MatSnackBar,
    private activatedRouter: ActivatedRoute,
    private schemaService: SchemaService,
    private router: Router,
    private sharedService: SharedServiceService,
    private formBuilder: FormBuilder,
    private globalService: GlobaldialogService,
    private transientService: TransientService,
    private coreService: CoreService,
  ) { }

  /**
   * getter for transformation types...
   */
  get transformationType() {
    return TransformationRuleType;
  }

  get selectedRuleDesc() {
    const value = this.form?.get('rule_type').value;
    return (this.brId || this.isDRChildRule && this.schemaService.drChildRequest?.coreSchemBrInfo?.brType) ? this.businessRuleTypes.find(x => x.ruleType === value)?.ruleDesc : '';
  }

  get isDuplicateRule(): boolean {
    return this.form?.get('rule_type').value === BusinessRuleType.BR_DUPLICATE_RULE;
  }

  /**
   * Getter for selected transformation type
   */
  get selectedTransformationType() {
    if (this.form && this.form.controls) {
      return this.form.controls.transformationRuleType.value;
    }
    return '';
  }

  /**
   * Getter for selected transformation type for radio button
   */
  get selectedTransRuleTypeRadio() {
    if (this.form && this.form.controls) {
      return this.transRuleTypeList.find(ruleType => this.form.controls.transformationRuleType.value === ruleType.value);
    }
    return '';
  }
  get businessRuleTypesFiltered() {
    const searchStr = this.searchRuleTypeStr?.toLowerCase();
    return this.businessRuleTypes.filter(x =>
      (!this.isDRChildRule ? !x.dontMapped : (this.isDRTieBreaker ? DR_CHILD_TIEBREAKER_RULES : DR_CHILD_RULES).includes(x.ruleType))
      && (x.ruleDesc?.toLowerCase().includes(searchStr) || x.ruleType?.toLowerCase().includes(searchStr)));
  }
  get preDefinedRegexFiltered() {
    const searchStr = this.searchRegexFunctionStr?.toLowerCase();
    return this.preDefinedRegex.filter(x => x.FUNC_NAME?.toLowerCase().includes(searchStr) || x.FUNC_TYPE?.toLowerCase().includes(searchStr));
  }

  /**
   * filter source field dropdown
   */
  get sourceFieldsFiltered() {
    const searchStr = this.form.value.sourceFieldSearchStr?.toLowerCase();
    return this.sourceFieldsObject.list.filter(x => x[this.sourceFieldsObject.labelKey]?.toLowerCase().includes(searchStr) || x[this.sourceFieldsObject.valueKey]?.toLowerCase().includes(searchStr));
  }

  get isFormLoading() {
    return Boolean(this.moduleId && !this.parentMetadata);
  }

  /**
   * get the current weightage value
   */
  get currentweightageValue() {
    return this.schemaService.currentweightageValue;
  }

  /**
   * getter to show field on the basis of rule type
   */
  get isRegexType() {
    return this.form.controls.rule_type.value === BusinessRuleType.BR_REGEX_RULE
  }

  /**
   * check if rule type is Manufacturer Part Number Identification
   */
  get isMPNI() {
    return this.form.controls.rule_type.value === BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI
  }

  /**
   * Check if rule type is User defined rule
   */
  get isUDR() {
    return this.form.controls.rule_type.value === 'BR_CUSTOM_SCRIPT'
  }

  // check if rule is lookup dataset rule
  get isDaxeRule() {
    return this.form.controls.rule_type.value === BusinessRuleType.DAXE;
  }

  /**
   * getter to show field on the basis of rule type
   */
  get isDuplicateType() {
    return this.form.controls.rule_type.value === BusinessRuleType.BR_DUPLICATE_RULE;
  }

  get isWebServiceCall() {
    return this.form.controls.rule_type.value === BusinessRuleType.BR_SAP_CHECK_CODE_RULE;
  }

  /**
   * getter to check if current window is opened for DR tie breaker rule
   */
  get isDRTieBreaker() {
    return this.schemaService.drChildRequest?.isTieBreaker;
  }

  /**
   * getter to check if a rule is transformation rule
   */
  get isTransformationRule(): boolean {
    return (this.form.controls.rule_type.value === BusinessRuleType.BR_TRANSFORMATION || this.isOnlyForTrans);
  }

  get isAutoExtensionRule(): boolean {
    return this.form.controls.rule_type.value === BusinessRuleType.AUTO_EXTENSION_RULE;
  }

  get crossDatasetRule(): boolean {
    return this.form.controls.rule_type.value === BusinessRuleType.BR_CROSS_DATASET_RULE;
  }

  get notificationRule(): boolean {
    return this.form.controls.rule_type.value === BusinessRuleType.NOTIFICATION_RULE;
  }

  get isLookupRule() {
    return this.form.controls.rule_type.value === 'BR_LOOKUP_RULE'
  }
  /**
   * Enable the trans for all these rules....
   */
  get isTransEnabled() {
    const enableFor = ['BR_METADATA_RULE', 'BR_MANDATORY_FIELDS', 'BR_REGEX_RULE', 'BR_CUSTOM_SCRIPT'];
    if (this.form && this.form.value.rule_type && enableFor.indexOf(this.form.value.rule_type) !== -1) {
      return true;
    } else if (this.coreSchemaBrInfo && enableFor.indexOf(this.coreSchemaBrInfo.brType) !== -1) {
      return true;
    }

    return false;
  }

  /**
   * getter to display fields tool tip
   */
  get fieldsTooltip() {
    let tooltipText = '';
    switch (this.form.controls.rule_type.value) {
      case BusinessRuleType.BR_MANDATORY_FIELDS:
        tooltipText = `Enter the field(s) to apply the missing value rule to`;
        break;
      case BusinessRuleType.MRO_CLS_MASTER_CHECK:
        tooltipText = `Select the fields to be checked and matched against existing material classification data`;
        break;
      case BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP:
        tooltipText = `Select the fields to determine the manufacturer part number look up`;
        break;
    }
    return tooltipText;
  }

  /**
   * getter to check if current window is opened for classification rule
   */
  get classificationRule() {
    return this.form.controls.rule_type.value === BusinessRuleType.BR_CLASSIFICATION_RULE;
  }

  /**
   * Check if current window is opened as child rule for a duplicate rule
   */
  isDRChildRule = false;

  /**
   * Array to store all Grid And Hirarchy records
   */
  allGridAndHirarchyData = [];

  classicRuleForm: FormGroup;
  form: FormGroup;
  businessRuleTypes: BusinessRules[] = RULE_TYPES;
  preDefinedRegex: Regex[] = PRE_DEFINED_REGEX;
  /**
   * source fields for transformation rule
   */
  sourceFieldsObject: FieldConfiguration = {
    list: [],
    labelKey: '',
    valueKey: ''
  }

  /**
   * target fields for transformation rule
   */
  targetFieldsObject: FieldConfiguration = {
    list: [],
    labelKey: '',
    valueKey: ''
  }

  /**
   * Lookup data from transformation rule component
   */
  lookupData: LookupFields[] = [];

  /**
   * Existing transformation schema used to
   * patch transformation rule for Lookup
   */
  transformationLookUpData: LookupFields[] = [];

  /**
   * Transformation Data model
   */
  transformationData: TransformationFormData;

  /**
   * Transformation Info model
   */
  transInfo: TransformationInfo = {};

  /**
   * current rule
   */
  currentSelectedRule: string;

  /**
   * List of categories
   */
  categoryList: CategoryInfo[] = []

  /**
   * List of fields
   */
  fieldsList = [];

  /**
   * observable for autocomplete
   */
  filteredModules: Observable<{} | string | void> = of([]);

  /**
   * obervable for autocomplete in target field multiselect dropdown
   */
  targetFilteredModules: Observable<{} | string | void> = of([]);

  /**
   * array to save the selected fields
   */
  selectedFields = [];

  /**
   * array to save the selected target fields
   */
  selectedTargetFields = [];

  /**
   * list of event to consider as selection
   */
  separatorKeysCodes: number[] = [ENTER, COMMA];


  operators = [];
  operatorsFiltered = [];
  submitted = false;
  initialConditions = ['And', 'Or'];
  /**
   * Current schema id which is from activated router ..
   */
  schemaId: string;

  /**
   * Current module  id which is from activated router ..
   */
  moduleId: string;

  /**
   * Current business rule id  id which is from activated router ..
   */
  brId: string;

  /**
   * While edit hold br information ..
   */
  coreSchemaBrInfo: CoreSchemaBrInfo = new CoreSchemaBrInfo();

  /**
   * hold the form controls in this variable
   */
  currentControls: any = {};

  /**
   * hold data from the route event for further use
   */
  routeData: any;

  /**
   * hold duplicate rule form reference
   */
  duplicateFormRef: FormGroup;
  /**
   * hold Web service call rule form reference
   */
  webServiceCallFormRef: FormGroup;

  /**
   * Store current active outlet
   */
  activeOutlet = 'sb';

  /** Hold all field list for the block hierarcy component */
  initialFieldList = [];
  fieldListFiltered = [];
  udrBlockList: BlocksList = {
    blocksList: [],
    datasetList: []
  };
  /** New UDR form that holds all the UDR data */
  udrNodeForm: FormGroup;

  /**
   * reference to the input
   */
  @ViewChild('fieldsInput') fieldsInput: ElementRef;

  /**
   * reference to target field search input
   */
  @ViewChild('targetFieldsInput') targetFieldsInput: ElementRef;

  /* To access properties of Child for validation purpose
   */
  @ViewChild(TransformationRuleComponent) transformationRuleComponent: TransformationRuleComponent;
  @ViewChild(LookupDatasetRuleComponent) lookupRuleComponent: LookupDatasetRuleComponent;

  /**
   * To hold information about validation errors.
   */
  validationError: ValidationError = {
    status: false,
    message: ''
  }

  /**
   * Tree child
   */
  @ViewChild('tree') tree = null;

  /**
   * tree control
   */
  treeControl = null;

  /**
   * treeFlattener
   */
  treeFlattener = null;

  /**
   * data source
   */
  dataSource = null;
  /**
   * Hold search string for business rule type ....
   */
  searchRuleTypeStr = '';
  /**
   * Hold search string for regex functions ....
   */
  searchRegexFunctionStr = '';
  /**
   * has child
   */
  hasChild = null;

  /**
   * Hold the metadata fields response ....
   */
  parentMetadata: MetadataModeleResponse = null;
  initialMetadata: MetadataModeleResponse = null;

  /**
   * transformation rule type list
   */
  transRuleTypeList = TRANSFORMATION_TYPES;

  /**
   * Formcontrol for the enable transformation inside the rule
   */
  hasAppliedTransformationCtrl: FormControl;

  /**
   * Hold the active tab index
   */
  transTabIndex = 0;

  /**
   * All transformation rule inside ... the main rule
   */
  attachedTransRules: TransformationMappingResponse;

  /**
   * Check for enable only transformation ...
   */
  isOnlyForTrans = false;

  transformationRules: CoreSchemaBrInfo[] = [];

  /**
   * Hold all the api rules
   */
  apiRules: ApiRulesInfo[] = [];


  /**
   * Search the trans rule from map lib..
   */
  delayedCallWithTransLib = debounce((searchText: string) => {
    this.getTransRules(searchText);
  }, 400);


  /**
   * Search the trans rule from map lib..
   */
  delayedCallForApis = debounce((searchText: string) => {
    this.getApisRule(searchText);
  }, 400);

  saveRule = false;

  tableConditionError = '';
  classicForm: FormGroup;
  ruleSettingForm: FormGroup;
  selectedDescSettingsOptions = [];
  descValidationError = '';
  limit = 2;
  dataSourceRule: MatTableDataSource<any> = [] as any;
  tableData = [] // this is for showing condition table
  tableData2 = [] // this is for sending classification data with API
  columnDesc = { nounModSep: 'Noun modifier separator', shortDescSep: 'Short description separator', longDescSep: 'Long description separator', longDescFormat: 'Long description format', attSep: 'Attribute separator format', attrFormatLongDesc: 'Attribute format for long description', shortDescActive: 'Short description active', classificationActive: 'Transfer to classification', longDescActive: 'Long description active', manuallyDesc: 'Allow user to maintain description manually' }
  displayedColumns: any = [];
  conditonSidesheet = false;
  storeClassificationTable: any = [];
  tableDescFieldsOptions: any = [];
  descriptionType = ['Short description', 'Long description']
  languageFieldsOptions: any = [];
  tableNameOptions: any = [];
  locale = 'en';
  descSettingsField: any = [];
  proposeNounField: any = [];
  shortDescList: any = [];
  longDescList: any = [];
  initialMetaClassic: any = [];

  autoExtensionFormGroup: FormGroup;
  crossDatasetFormGroup: FormGroup;
  notificationRuleFormGroup: FormGroup;

  mappingRule = {
    isMappingRule: false,
    ruleType: '',
    selectedMappingFieldDesc: {} as MdoMappings,
    mappedSourceFieldDesc: {} as Fieldlist,
    isAppliedNewRuleForMapping: false
  }

  /**
   * function to format slider thumbs label.
   * @param percent percent
   */
  rangeSliderLabelFormat(percent) {
    return `${percent}%`;
  }

  /**
   * transformer = return tree object.
   * @param node node
   * @param level level
   */
  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      id: node.id,
      parent: node.parent,
      allData: node.allData,
      fldCtrl: node?.fldCtrl
    };
  }

  showGrouping:boolean = true;

  /**
   * Angular hook
   */
  ngOnInit(): void {
    this.dataSource = [];
    this.displayedColumns = [];
    this.hasAppliedTransformationCtrl = new FormControl(false);
    this.filterRuleTypes();
    this.getCategories();
    this.filteredModules = of(this.fieldsList);
    this.targetFilteredModules = of(this.fieldsList);
    this.operators = this.possibleOperators();

    this.treeControl = new FlatTreeControl<{ name: string, level: number, expandable: boolean, id: string, parent: string }>(
      node => node.level, node => node.expandable);

    this.treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.hasChild = (_: number, node: { name: string, level: number, expandable: boolean, id: string, parent: string }) => node.expandable;

    this.activatedRouter.params.subscribe(res => {
      this.routeData = res;
      this.moduleId = res.moduleId;
      this.schemaId = res.schemaId !== 'new' ? res.schemaId : null;
      this.activeOutlet = res.outlet || 'sb';
      this.isDRChildRule = Boolean(res.brId === 'DRChild');
      if (this.isDRChildRule && !this.schemaService.drChildRequest) {
        this.close();
      }
      this.brId = res.brId && res.brId !== 'new' && !this.isDRChildRule ? res.brId : '';
      this.buildCommonDataForm().then(() => {
        this.initUDRForm();
        if (this.isDRChildRule) {
          this.getDRChildRuleInfo();
        }
        this.createAutoExtensionForm();
        this.createCrossDatasetRuleForm();
        this.createNotificationRuleForm();
        if (this.brId || this.coreSchemaBrInfo.brId) {
          (this.brId !== 'transformation') ? this.getBusinessRuleInfo(this.brId || this.coreSchemaBrInfo.brId) : this.applyTransformationRule();
          // set is trans edit only
          this.activatedRouter.queryParams.subscribe(q => {
            if (this.activeOutlet === 'sb3' && q.r && q.r === 'BR_TRANSFORMATION') {
              this.isOnlyForTrans = true;
            } else {
              this.isOnlyForTrans = false;
            }

            if (q?.mappingRule) {
              this.setMappingRuleInfo(q);
            }

            if (q?.isTransactionRuleApplied) {
              this.mappingRule.isMappingRule = true;
            }
          });
        } else {
          this.getFieldsByModuleId(this.moduleId);
          // not required missing rule bydefault...
          // this.form.controls.rule_type.setValue(BusinessRuleType.BR_MANDATORY_FIELDS);
          this.activatedRouter.queryParams.subscribe(q => {
            if (this.activeOutlet === 'sb3' && q.r && q.r === 'BR_TRANSFORMATION') {
              // update manually if has only for transformation rule
              setTimeout(() => {
                this.applyValidatorsByRuleType(BusinessRuleType.BR_TRANSFORMATION);
              }, 200);
              this.isOnlyForTrans = true;
            } else {
              this.isOnlyForTrans = false;
            }

            if (q?.mappingRule) {
              this.mappingRule.isAppliedNewRuleForMapping = true;
              this.setMappingRuleInfo(q);
            }

            if (q?.isTransactionRuleApplied) {
              this.mappingRule.isMappingRule = true;
            }
          });
        }
      });
    });

    /**
     * After add the transformation from side sheet should add on the rules...
     */
    this.sharedService.getAfterBrSave().subscribe((res: CoreSchemaBrInfo[]) => {
      if (res) {
        if (Array.isArray(res) && res.map(m => m.brType === BusinessRuleType.BR_TRANSFORMATION).length === res.length) {
          this.addTransRules(res);
        } else if (!Array.isArray(res)) {
          this.addTransRules(res);
        }

      }
    });

    /**
     * Call api to get the transformation ....
     */
    this.hasAppliedTransformationCtrl.valueChanges.subscribe(r => {
      if (r && !this.attachedTransRules) {
        this.getMappedTransformationRules();
      }
      if (r && this.transformationRules.length === 0) {
        this.getTransRules();
      }
    });

    this.sharedService.gettransSavedBehaviourSub().subscribe(s => {
      if (s) {
        this.getTransRules();
      }
    });


    // this.form.controls.apiSno.valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe(res=>{
    //   if(typeof res ==='string') {
    //     this.getApisRule(res);
    //   }
    // });

    this.form.controls.fields.valueChanges.pipe(distinctUntilChanged(), debounceTime(500)).subscribe((keyword) => {
      if (keyword) {
        keyword = keyword.toLowerCase();
        this.coreService.getMetadataFieldsByModuleId([this.moduleId], keyword).subscribe((res: MetadataModeleResponse) => {
          this.parseMetadataModelResponse(res, false);
        });
      } else {
        this.parseMetadataModelResponse(this.initialMetadata, false);
      }
    });

    this.createClassicForm();
    this.initRuleForm();
    this.schemaService.conditionSheetStatusChange().subscribe(res => {
      this.tableData = [];
      this.tableData2 = [];
      if (res) {
        this.schemaService.conditionSideSheetDataFunc().subscribe(response => {
          this.classificationConditionFormatting(response);
        })
        this.conditionTableDataSet();
      }
      this.dataSourceRule = new MatTableDataSource<any>(this.tableData);
    });

    this.coreService.getDatasetBusinessRuleList(0, 50, {}).subscribe((res: any) => {
      this.storeClassificationTable = res?.content;
    },
      (error) => {
        console.error(`Error : ${error.message}`);
      });

    this.classicForm.controls.nounField.valueChanges.pipe(startWith(''), distinctUntilChanged(), debounceTime(500)).subscribe((searchStr) => {
      if (searchStr) {
        this.coreService.getMetadataFieldsByModuleId([this.moduleId], searchStr).subscribe((data: MetadataModeleResponse) => {
          const fieldList = [];
          const keys = Object.keys(data.headers);
          keys.forEach((key) => {
            fieldList.push(data.headers[key])
          });
          this.proposeNounField = fieldList;
        }, (error) => {
          console.error(`Error : ${error.message}`);
        });
      } else {
        this.proposeNounField = this.initialMetaClassic;
      }
    });

    this.classicForm.controls.descSetField.valueChanges.pipe(distinctUntilChanged(), debounceTime(500)).subscribe((searchStr) => {
      if (searchStr) {
        this.coreService.getMetadataFieldsByModuleId([this.moduleId], searchStr).subscribe((data: MetadataModeleResponse) => {
          const fieldList = [];
          const keys = Object.keys(data.headers);
          keys.forEach((key) => {
            fieldList.push(data.headers[key]);
          });
          this.descSettingsField = fieldList;
        }, (error) => {
          console.error(`Error : ${error.message}`);
        });
      } else {
        this.descSettingsField = this.initialMetaClassic;
      }
    });
  }

  applyTransformationRule() {
    const coreSchemaBrInfo = new CoreSchemaBrInfo();
    coreSchemaBrInfo.brType = BusinessRuleType.BR_TRANSFORMATION;
    this.setValueToElement(coreSchemaBrInfo);
    this.getFieldsByModuleId(this.moduleId);
  }

  setMappingRuleInfo(params) {
    this.mappingRule.isMappingRule = true;
    this.mappingRule.ruleType = params?.ruleType;
    if (this.mappingRule.isMappingRule) {
      this.getTargetFieldDetails();
    }
  }

  getTargetFieldDetails() {
    let transformationRuleList = [];
    this.sharedService.getTargetFieldDetails().subscribe((respones: {type: string, fieldDetails: any}) => {
      if (respones?.type === 'fieldSelected') {
        this.mappingRule.selectedMappingFieldDesc = respones.fieldDetails as MdoMappings;

        if (respones?.fieldDetails?.translation?.transalationIds?.length) {
          this.getExistedTransformationRuleInfo(respones?.fieldDetails?.translation?.transalationIds);
          return;
        }
        this.applyFilteredTransformationList(TRANSFORMATION_TYPES);
      }
    })
  }

  applyFilteredTransformationList(filteredRuleList) {
    let transRuleTypeList = [];
    this.transRuleTypeList = [];
    if (this.mappingRule?.selectedMappingFieldDesc?.mdoFieldId) {
      transRuleTypeList = filteredRuleList.filter(rule => rule.key !== TransformationRuleType.CONSTANT && rule.key !== TransformationRuleType.REGEX);
      this.getTargetSourceFieldDetails();
    } else {
      transRuleTypeList = filteredRuleList.filter(rule => rule.key === TransformationRuleType.CONSTANT);
    }
    this.transRuleTypeList.push(...transRuleTypeList);
    this.applyValidatorsByRuleType(this.mappingRule.ruleType);
  }

  getExistedTransformationRuleInfo(transalationIds: string[]) {
    let transformationRuleList = [...TRANSFORMATION_TYPES];
    transalationIds.forEach(ruleId => {
      this.schemaService.getBusinessRuleInfo(ruleId).subscribe((businessRuleInfo: CoreSchemaBrInfo) => {
        if (businessRuleInfo && businessRuleInfo?.transInfo) {
          if (businessRuleInfo.transInfo?.type === 'zero') {
            transformationRuleList = transformationRuleList.filter(rule => rule.key !== TransformationRuleType.ZERO);
          }

          if (businessRuleInfo.transInfo?.type === 'lookup') {
            transformationRuleList = transformationRuleList.filter(rule => rule.key !== TransformationRuleType.LOOKUP);
          }

          if (businessRuleInfo.transInfo?.type === 'constant') {
            transformationRuleList = transformationRuleList.filter(rule => rule.key !== TransformationRuleType.CONSTANT);
          }

          if (businessRuleInfo.transInfo?.type === 'empty_space') {
            transformationRuleList = transformationRuleList.filter(rule => rule.key !== TransformationRuleType.EMPTY);
          }
        }
        this.applyFilteredTransformationList(transformationRuleList);
      })
    });
  }

  getTargetSourceFieldDetails() {
    this.coreService.getFieldDetails(this.moduleId, this.mappingRule.selectedMappingFieldDesc.mdoFieldId)
      .subscribe((resp: Fieldlist) => {
        this.mappingRule.mappedSourceFieldDesc = resp;
      }, error => {
        console.error(`Error:: ${error.message}`);
        this.mappingRule.mappedSourceFieldDesc = null;
      });
  }


  createAutoExtensionForm() {
    this.autoExtensionFormGroup = this.formBuilder.group({
      autoExeInfo: [{}]
    })
  }

  createCrossDatasetRuleForm() {
    this.crossDatasetFormGroup = this.formBuilder.group({
      crossDatasetId: ['']
    })
  }

  createNotificationRuleForm() {
    this.notificationRuleFormGroup = this.formBuilder.group({
      notificationInfo: [{}]
    })
  }

  // added condition for showing on table and sending with API
  classificationConditionFormatting(response: any) {
    response.forEach(item => {
      const dataItem1 = JSON.parse(JSON.stringify(item));
      const dataItem2 = JSON.parse(JSON.stringify(item));
      dataItem1.attrFormatLongDesc = item.attrFormatLongDesc ? item.attrFormatLongDesc.key : '';
      dataItem2.attrFormatLongDesc = item.attrFormatLongDesc ? item.attrFormatLongDesc.value : '';
      if (this.selectedDescSettingsOptions[1]) {
        const newKey = this.selectedDescSettingsOptions[1].description.replace(/\s+/g, '');
        dataItem2[newKey] = item.field2;
      }
      if (this.selectedDescSettingsOptions[0]?.description) {
        const newKey = this.selectedDescSettingsOptions[0].description.replace(/\s+/g, '');
        dataItem2[newKey] = item.field1;
      }
      this.tableData.push(dataItem2);
      this.tableData2.push(dataItem1);

    });
  }

  // condition table change to show description setting fields in table
  conditionTableDataSet() {
    this.tableData = this.tableData.map(({ field1, field2, fieldValue, conditionName, conditionId, ...rest }) => ({ ...rest }));
    this.tableData2 = this.tableData2.map(({ field1, field2, conditionName, conditionId, ...rest }) => ({ ...rest }));
    this.displayedColumns = this.tableData[0] ? Object.keys(this.tableData[0]) : [];
    //keeping only required columns
    this.displayedColumns = ['shortDescSep', 'longDescSep', 'shortDescActive', 'longDescActive', 'attSep', 'nounModSep', 'attrFormatLongDesc', 'UpperCase']
    //Adding fields of description settings
    if (this.selectedDescSettingsOptions[1]?.description) {
      const newKey = this.selectedDescSettingsOptions[1].description.replace(/\s+/g, '');
      this.displayedColumns.unshift(newKey);
    }
    if (this.selectedDescSettingsOptions[0]?.description) {
      const newKey = this.selectedDescSettingsOptions[0].description.replace(/\s+/g, '');
      this.displayedColumns.unshift(newKey);
    }

    if (this.selectedDescSettingsOptions[1]) {
      const newKey = this.selectedDescSettingsOptions[1].description.replace(/\s+/g, '');
      this.columnDesc[newKey] = this.selectedDescSettingsOptions[1].description;
    }
    if (this.selectedDescSettingsOptions[0]?.description) {
      const newKey = this.selectedDescSettingsOptions[0].description.replace(/\s+/g, '');
      this.columnDesc[newKey] = this.selectedDescSettingsOptions[0].description;
    }
  }

  /**
   * Removes untested rule types
   */
  filterRuleTypes() {
    const testedTypes = ['BR_METADATA_RULE', BusinessRuleType.DAXE, BusinessRuleType.BR_SAP_CHECK_CODE_RULE, 'BR_MANDATORY_FIELDS', 'BR_REGEX_RULE', 'BR_CUSTOM_SCRIPT', 'BR_DUPLICATE_CHECK', 'BR_TRANSFORMATION', 'BR_API_RULE', 'MRO_MANU_PRT_NUM_LOOKUP', 'MRO_CLS_MASTER_CHECK', 'MRO_MANU_PRT_NUM_IDENTI', 'BR_LOOKUP_RULE', 'BR_CLASSIFICATION', BusinessRuleType.AUTO_EXTENSION_RULE, BusinessRuleType.BR_CROSS_DATASET_RULE, BusinessRuleType.NOTIFICATION_RULE];
    this.businessRuleTypes = this.businessRuleTypes.filter((x) => testedTypes.includes(x.ruleType));
  }

  /**
   * Initialize UDR form
   */
  initUDRForm() {

    this.udrNodeForm = this.formBuilder.group({
      blocks: this.formBuilder.array([])
    });
  }

  /**
   * get businessrule data from api to patch in sidesheet
   */
  getBusinessRuleInfo(brId) {
    this.schemaService.getBusinessRuleInfo(brId).subscribe((businessRuleInfo: CoreSchemaBrInfo) => {
      this.coreSchemaBrInfo = businessRuleInfo;
      if (this.coreSchemaBrInfo) {
        // Patch received data
        this.setValueToElement(this.coreSchemaBrInfo);
        this.getFieldsByModuleId(this.moduleId);
        if (this.coreSchemaBrInfo.brType === BusinessRuleType.BR_CUSTOM_SCRIPT) {
          this.editUdr(businessRuleInfo);
        }
        // check the transformation enable for this rule if yes then call for get all transformation rule inside this rule
        if (businessRuleInfo.isTransformationApplied) {
          this.getMappedTransformationRules();
          this.getTransRules();
        }

        // set the api rule
        if (this.coreSchemaBrInfo.brType === BusinessRuleType.BR_API_RULE) {
          this.getApisRule('', this.coreSchemaBrInfo.apiSno);
        }


        if(this.coreSchemaBrInfo.brType === BusinessRuleType.AUTO_EXTENSION_RULE) {
          const formValue = {
            brInfo: this.coreSchemaBrInfo.brInfo,
            brDescription: this.coreSchemaBrInfo?.brDescription,
            autoExeInfo: this.coreSchemaBrInfo.autoExeInfo,
            editValue: true
          }

          this.autoExtensionFormGroup.get('autoExeInfo').patchValue(formValue);
        }

        if (this.coreSchemaBrInfo.brType === BusinessRuleType.NOTIFICATION_RULE) {
          this.notificationRuleFormGroup.get('notificationInfo').patchValue({
            businessRuleInfo,
            editValue: true
          })
        }

        if (this.coreSchemaBrInfo.brType === BusinessRuleType.BR_CROSS_DATASET_RULE) {
          this.crossDatasetFormGroup.get('crossDatasetId').patchValue({
            refId: this.coreSchemaBrInfo.refId,
            patchValue: true
          })
        }
      }
    }, error => console.error(`Error : ${error.message}`));
  }

  getBusinessRuleBasicInfo(brId) {
    this.schemaService.getBusinessRuleInfo(brId).subscribe((info) => {
      this.sharedService.setAfterBrSave(info);
    });
  }

  getDRChildRuleInfo() {
    if (this.schemaService.drChildRequest?.coreSchemBrInfo) {
      // Patch received data
      const brInfo: any = this.schemaService.drChildRequest.coreSchemBrInfo;
      this.coreSchemaBrInfo = brInfo;
      if (brInfo.brIdStr && !brInfo.isEdited) {
        this.getBusinessRuleInfo(this.coreSchemaBrInfo.brIdStr);
      } else {
        this.setValueToElement(this.coreSchemaBrInfo);
        this.getFieldsByModuleId(this.moduleId);
        if (this.coreSchemaBrInfo.brType === BusinessRuleType.BR_CUSTOM_SCRIPT) {
          this.editUdr(this.coreSchemaBrInfo);
        }

        // set the api rule
        if (this.coreSchemaBrInfo.brType === BusinessRuleType.BR_API_RULE) {
          this.getApisRule('', this.coreSchemaBrInfo.apiSno);
        }
      }
    }
  }

  /**
   * Initialize autocomplete for field names
   */
  initiateAutocomplete() {
    this.targetFilteredModules = this.form.controls.target_field.valueChanges.pipe(startWith(''), map(keyword => {
      if (keyword) {
        keyword = keyword.toLowerCase();

        return this.fieldsList.filter(item => {
          return item.fieldDescri.toString().toLowerCase().indexOf(keyword) !== -1
        }).length >= 1
          ?
          this.fieldsList.filter(item => {
            return item.fieldDescri.toString().toLowerCase().indexOf(keyword) !== -1
          })
          :
          [{ fieldDescri: 'No header data found', fieldId: null }];
      } else {
        return this.fieldsList;
      }
    }));
  }
  /**
   * return grid fields by grid key
   * @param metadataModeleResponse metaData Object
   * @param gridKey grid Key to identify
   * @param parentDesc parent desc name
   */
  getGridFieldsByGridKey(metadataModeleResponse: MetadataModeleResponse, gridKey: string, parentDesc: string) {
    const dataToPush = [];
    for (const key in metadataModeleResponse.gridFields[gridKey]) {
      if (metadataModeleResponse.gridFields[gridKey].hasOwnProperty(key)) {
        const field = metadataModeleResponse.gridFields[gridKey];
        if (!this.crossDatasetRule) {
          dataToPush.push({ name: field[key].fieldDescri, id: field[key].fieldId, parent: parentDesc, children: [], fldCtrl: field[key] });
        }
        if (this.mappingRule.isMappingRule || this.notificationRule) {
          this.sourceFieldsObject.list.push(field[key]);
        }
      }
    }
    return dataToPush;
  }

  /**
   * return Hierarchy field by key
   * @param metadataModeleResponse metaData Object
   * @param hierarchyKey hirechy key
   * @param parentDesc parent dsc name
   * @param heirarchyId heirarchy id
   */
  getHierarchyFieldsByHierarchyKey(metadataModeleResponse: MetadataModeleResponse, hierarchyKey: string, parentDesc: string, heirarchyId: string) {
    const dataToPush = [];
    for (const key in metadataModeleResponse.hierarchyFields[heirarchyId]) {
      if (metadataModeleResponse.hierarchyFields[heirarchyId].hasOwnProperty(key)) {
        const field = metadataModeleResponse.hierarchyFields[heirarchyId];
        if (!this.crossDatasetRule) {
          dataToPush.push({ name: field[key].fieldDescri, id: field[key].fieldId, parent: parentDesc, children: [], fldCtrl: field[key] });
        }

        if (this.mappingRule.isMappingRule || this.notificationRule) {
          this.sourceFieldsObject.list.push(field[key]);
        }
      }
    }
    return dataToPush;
  }

  /**
   * Initialize tree view
   * @param metadataModeleResponse metadate Object
   */
  initGridAndHierarchyToAutocompleteDropdown(metadataModeleResponse: MetadataModeleResponse) {
    const data = [];
    for (const key in metadataModeleResponse.grids) {
      if (metadataModeleResponse.grids.hasOwnProperty(key)) {
        const objToPush = {
          name: metadataModeleResponse.grids[key].fieldDescri,
          id: metadataModeleResponse.grids[key].fieldId,
          parent: null,
          children: this.getGridFieldsByGridKey(metadataModeleResponse, metadataModeleResponse.grids[key].fieldId, metadataModeleResponse.grids[key].fieldDescri)
        }
        if (!this.crossDatasetRule) {
          data.push(objToPush);
        }
      }
    }

    for (const key in metadataModeleResponse.hierarchy) {
      if (metadataModeleResponse.hierarchy.hasOwnProperty(key)) {
        const objToPush = {
          name: metadataModeleResponse.hierarchy[key].heirarchyText,
          id: metadataModeleResponse.hierarchy[key].fieldId,
          parent: null,
          children: this.getHierarchyFieldsByHierarchyKey(metadataModeleResponse, metadataModeleResponse.hierarchy[key].fieldId, metadataModeleResponse.hierarchy[key].heirarchyText,
            metadataModeleResponse.hierarchy[key].heirarchyId)
        }

        if(!this.crossDatasetRule) {
          data.push(objToPush);
        }
      }
    }
    if (this.dataSource !== null) {
      this.dataSource.data = data;
    }
    this.allGridAndHirarchyData = data;
  }

  /**
   * Initialize the form object and
   * subscribe to any required control value changes
   */
  buildCommonDataForm() {
    return new Promise((resolve, reject) => {
      const controls = {
        rule_type: new FormControl('', [Validators.required]),
        rule_name: new FormControl('', [Validators.required]),
        error_message: new FormControl('', [Validators.required]),
        standard_function: new FormControl(''),
        regex: new FormControl(''),
        fields: new FormControl(''),
        apiKey: new FormControl(''),
        sourceFld: new FormControl(''),
        targetFld: new FormControl(''),
        excludeScript: new FormControl(''),
        includeScript: new FormControl(''),
        udrTreeData: new FormControl(),
        weightage: new FormControl(0, [Validators.required]),
        categoryId: new FormControl(null),
        transformationRuleType: new FormControl(''),
        source_field: new FormControl(''),
        target_field: new FormControl(''),
        accuracyScore: new FormControl(0),
        sourceFieldSearchStr: new FormControl(''),
        apiSno: new FormControl('', [Validators.required])
      };

      this.currentControls = controls;
      this.form = new FormGroup(controls);

      // Apply conditional validation based on rule type
      this.form.controls.rule_type.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((selectedRule) => {
          if (selectedRule) {
            this.applyValidatorsByRuleType(selectedRule);
          }
          // call get the apis rule if the selected rule type is API
          if (selectedRule === BusinessRuleType.BR_API_RULE) {
            this.getApisRule('');
          }

          // call getField api for classification rule
          if (selectedRule === BusinessRuleType.BR_CLASSIFICATION_RULE) {
            this.getDescFields();
          }
        });
      this.form.controls.transformationRuleType.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((type) => {
          if (this.form.value.rule_type !== BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI && this.isTransformationRule) {
            this.applyValidatorsByRuleType(BusinessRuleType.BR_TRANSFORMATION);
          }
          if (this.mappingRule?.isMappingRule) {
            this.setTransformationRuleValue(type);
          }
        });

      resolve(null);
    });
  }

  setTransformationRuleValue(ruleType) {
    if (ruleType === 'EMPTY_SPACE' || ruleType === 'ZERO' || ruleType === 'DATE') {
      this.mappingRule.mappedSourceFieldDesc.fieldDesc = this.mappingRule?.mappedSourceFieldDesc?.shortText ? this.mappingRule?.mappedSourceFieldDesc?.shortText[this.locale]?.description : '';
      const fields = [{
          fldId: this.mappingRule?.mappedSourceFieldDesc?.fieldId,
          fldCtrl: this.mappingRule.mappedSourceFieldDesc,
          order: 0
      }]
      const payload: TransformationInfo = {
        type: ruleType,
        ...(ruleType === 'EMPTY_SPACE' && {
          empty_space: {
            isRemoveLeadingSpace: false,
            isRemoveTraillingSpace: false,
            isRemoveAll: false,
            fields
          }
        }),
        ...(ruleType === 'ZERO' && {
          zero: {
            type: 'add_leading_zero',
            fields
          }
        }),
        ...(ruleType === 'DATE' && {
          date: {
            fldId: this.mappingRule?.mappedSourceFieldDesc?.fieldId,
            fields
          }
        })
      }

      this.patchTransformationFormData(payload);
    }
  }

  setDateTargetField($event) {}

  /**
   * function to return formField
   */
  formField(field: string) {
    return this.form.get(field);
  }

  /**
   * function to UPDATE Transformation rule type when lib radio is clicked
   */
  updateTransformationRuleType($event) {
    if (this.form) {
      this.form.controls.transformationRuleType.setValue($event);
    }
  }

  /**
   * Apply conditional form validation based on rule type
   * keep the required field updated based on a selected rule type
   * loop through the required keys and add validators to all required fields
   * also nullify validators for all not required fields at the same time
   * @param selectedRule selected rule type
   */
  applyValidatorsByRuleType(selectedRule: string) {
    if (!this.businessRuleTypes.find(x => x.ruleType === selectedRule)) {
      return;
    }

    this.submitted = false;
    this.currentSelectedRule = selectedRule;
    const controlKeys: any[] = Object.keys(this.currentControls);
    let requiredKeys: string[] = [];
    if (selectedRule === BusinessRuleType.BR_CUSTOM_SCRIPT || selectedRule === BusinessRuleType.BR_SAP_CHECK_CODE_RULE) {
      requiredKeys = [/* 'categoryId', */ 'rule_name', 'error_message'];
    }

    if (selectedRule === BusinessRuleType.BR_LOOKUP_RULE) {
      requiredKeys = ['rule_name', 'error_message'];
    }

    if (selectedRule === BusinessRuleType.BR_REGEX_RULE) {
      requiredKeys = ['categoryId', 'rule_name', 'error_message', 'fields', 'regex'];
    }
    if (selectedRule === BusinessRuleType.BR_MANDATORY_FIELDS || selectedRule === BusinessRuleType.BR_METADATA_RULE || selectedRule === BusinessRuleType.MRO_CLS_MASTER_CHECK) {
      requiredKeys = ['categoryId', 'rule_name', 'error_message', 'fields'];
    }
    if (selectedRule === BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI) {
      requiredKeys = ['categoryId', 'rule_name', 'error_message', 'source_field', 'accuracyScore', 'apiKey'];
    }
    if (selectedRule === BusinessRuleType.BR_TRANSFORMATION) {
      requiredKeys = ['rule_name', 'categoryId', 'transformationRuleType', 'error_message'];
      if (this.selectedTransformationType === this.transformationType.REGEX) {
        requiredKeys = ['rule_name', 'categoryId', 'transformationRuleType', 'error_message', 'sourceFld'];
      }
      else if (this.selectedTransformationType === this.transformationType.LOOKUP) {
        requiredKeys = ['rule_type', 'rule_name', 'categoryId', 'transformationRuleType', 'error_message'];
      }
    }
    if (selectedRule === BusinessRuleType.BR_DUPLICATE_RULE) {
      requiredKeys = ['rule_name'];
    }

    if ((selectedRule === BusinessRuleType.BR_CLASSIFICATION_RULE) || (selectedRule === BusinessRuleType.BR_CROSS_DATASET_RULE) || (selectedRule === BusinessRuleType.NOTIFICATION_RULE)) {
      requiredKeys = ['rule_type', 'rule_name'];
    }

    if (selectedRule === BusinessRuleType.MRO_GSN_DESC_MATCH || selectedRule === BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP) {
      requiredKeys = ['rule_name', 'error_message', 'categoryId', 'apiKey', 'fields'];
    }

    if (selectedRule === BusinessRuleType.BR_API_RULE) {
      requiredKeys = ['categoryId', 'rule_name', 'error_message', 'fields', 'apiSno'];
    }

    if ([BusinessRuleType.BR_CUSTOM_SCRIPT, BusinessRuleType.BR_SAP_CHECK_CODE_RULE].includes(this.form?.get('rule_type').value) && requiredKeys.indexOf('categoryId') > -1) {
      requiredKeys.splice(requiredKeys.indexOf('categoryId'), 1);
    }

    // Remove Error message for Duplicate Master Rules
    if (this.isDRChildRule && requiredKeys.includes('error_message')) {
      requiredKeys.splice(requiredKeys.indexOf('error_message'), 1);
    }

    if (selectedRule === BusinessRuleType.AUTO_EXTENSION_RULE) {
      requiredKeys = ['rule_type'];
    }

    controlKeys.map((key) => {
      const index = requiredKeys.findIndex(reqKey => reqKey === key);
      if (index === -1) {
        this.form.controls[key].setValidators(null);
        this.form.controls[key].clearValidators();
        this.form.controls[key].updateValueAndValidity();
        if (key !== 'rule_type' && key !== 'weightage' && key !== 'accuracyScore' && key !== 'transformationRuleType') {
          this.form.controls[key].setValue(null);
          this.form.controls[key].updateValueAndValidity();
        }
      } else {
        this.form.controls[key].setValidators([Validators.required]);
        this.form.controls[key].updateValueAndValidity();
      }
    });

    // this.form.updateValueAndValidity();
  }

  /**
   * method to patch initial data when editing a business rule
   * There's a patchlist array that decides what value to patch
   * based on the business rule type received
   * @param br Pass the business rule data to be patched
   */
  setValueToElement(br: CoreSchemaBrInfo) {
    const dataToPatch = {
      rule_type: br.brType,
      rule_name: br.brInfo,
      error_message: br.message,
      standard_function: br.standardFunction,
      regex: br.regex,
      fields: br.fields,
      apiKey: br.apiKey,
      apiSno: br.apiSno,
      sourceFld: '',
      targetFld: '',
      excludeScript: '',
      includeScript: '',
      udrTreeData: '',
      weightage: br.brWeightage,
      categoryId: br.categoryId,
      transformationRuleType: '',
      source_field: br.source_field || '',
      target_field: br.target_field || '',
      accuracyScore: br.accuracyScore || 0
    };
    // set the value for transformation ...
    this.hasAppliedTransformationCtrl.setValue(br.isTransformationApplied ? br.isTransformationApplied : false);

    let patchList = [];

    if (br.brType === BusinessRuleType.BR_METADATA_RULE || br.brType === BusinessRuleType.BR_MANDATORY_FIELDS || br.brType === BusinessRuleType.MRO_CLS_MASTER_CHECK) {
      patchList = ['rule_type', 'rule_name', 'error_message', 'weightage', 'categoryId'];
    }
    if (br.brType === BusinessRuleType.BR_CUSTOM_SCRIPT || br.brType === BusinessRuleType.BR_SAP_CHECK_CODE_RULE || br.brType === BusinessRuleType.BR_LOOKUP_RULE) {
      patchList = ['rule_type', /* 'categoryId', */  'rule_name', 'weightage', 'error_message'];
    }
    if (br.brType === BusinessRuleType.BR_TRANSFORMATION || this.form.controls.rule_name.value === BusinessRuleType.BR_LOOKUP_RULE) {
      dataToPatch.transformationRuleType = this.getTrRuleType(br.transFormationSchema);
      patchList = ['rule_type', 'rule_name', 'error_message', 'weightage', 'categoryId', 'transformationRuleType'];
      if (this.brId !== 'transformation') {
        this.patchTransformationFormData(br.transInfo,this.form.controls.rule_name.value,dataToPatch.transformationRuleType,br.transFormationSchema);
      }
    }
    if (br.brType === BusinessRuleType.BR_REGEX_RULE) {
      patchList = ['rule_type', 'rule_name', 'error_message', 'weightage', 'categoryId', 'standard_function', 'regex'];
    }

    if (br.brType === BusinessRuleType.BR_DUPLICATE_RULE) {
      patchList = ['rule_type', 'rule_name'];
    }

    if (br.brType === BusinessRuleType.MRO_GSN_DESC_MATCH || br.brType === BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP) {
      patchList = ['rule_type', 'rule_name', 'error_message', 'weightage', 'categoryId', 'apiKey'];
    }

    if (br.brType === BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI) {
      patchList = ['rule_type', 'rule_name', 'error_message', 'weightage', 'categoryId', 'apiKey', 'accuracyScore', 'source_field'];
    }

    if (br.brType === BusinessRuleType.BR_API_RULE) {
      patchList = ['rule_type', 'rule_name', 'error_message', 'weightage', 'categoryId', 'apiSno'];
    }

    if (br.brType === BusinessRuleType.BR_CLASSIFICATION_RULE || br.brType === BusinessRuleType.NOTIFICATION_RULE || br.brType === BusinessRuleType.BR_CROSS_DATASET_RULE) {
      patchList = ['rule_type', 'rule_name'];
    }

    if (br.brType === BusinessRuleType.AUTO_EXTENSION_RULE) {
      patchList = ['rule_type'];
    }

    if (patchList && patchList.length > 0) {
      patchList.map((key) => {
        if (dataToPatch[key]) {
          this.form.controls[key].setValue(dataToPatch[key]);
        }
      });
    }

    this.form.get('rule_type').disable({ onlySelf: true, emitEvent: true });
    this.form.get('transformationRuleType').disable({ onlySelf: true, emitEvent: true });
  }

  /**
   * Patch transformation form data
   * @param transformationSchema transformation rule details to be passed
   */
  patchTransformationFormData(transInfo: TransformationInfo,rule_name?: string,currentType1?,transformationSchema?) {
    const currentType = transInfo.type.toUpperCase();
    this.form.controls.transformationRuleType.setValue(currentType);
    this.transInfo.type = currentType.toLowerCase();
    if (currentType === this.transformationType.ZERO) {
      this.transInfo.zero = transInfo.zero;
    }
    if (currentType === this.transformationType.EMPTY) {
      this.transInfo.empty_space = transInfo.empty_space;
    }
    if (currentType === this.transformationType.CONSTANT) {
      this.transInfo.constant = transInfo.constant;
    }
    if (currentType === this.transformationType.DATE) {
      this.transInfo.date = transInfo.date;
    }
    if (currentType === this.transformationType.LOOKUP) {
      this.coreSchemaBrInfo.lookupRuleMetadata = {
        lookupDataset: transInfo.lookup.lookupRuleMetadata.lookupDataset,
        lookupType: transInfo.lookup.lookupRuleMetadata.lookupType,
        sno: transInfo.lookup.lookupRuleMetadata.sno,
        lookupStr: transInfo.lookup.lookupRuleMetadata.lookupStr,

      }
      this.coreSchemaBrInfo.udrData = transInfo.lookup.udrData;
    }

    if (rule_name === BusinessRuleType.BR_LOOKUP_RULE) {
      if (currentType1 === this.transformationType.REGEX) {
        if (transformationSchema && transformationSchema.length > 0) {
          const data: TransformationModel = transformationSchema[0];
          const { excludeScript, includeScript, sourceFld, targetFld, udrBlockModel } = data;
          this.transformationData = {
            excludeScript,
            includeScript,
            sourceFld,
            targetFld,
            parameter: udrBlockModel
          }
        }
    }
      if (transformationSchema.length > 0) {
        const lookupFields: LookupFields[] = [];
        transformationSchema.map((schema) => {
          lookupFields.push({
            enableUserField: false,
            fieldDescri: '',
            fieldId: schema.sourceFld,
            fieldLookupConfig: {
              lookupColumn: schema.udrBlockModel ? schema.udrBlockModel.conditionFieldId : '',
              lookupColumnResult: schema.udrBlockModel ? schema.udrBlockModel.conditionValueFieldId : '',
              moduleId: schema.udrBlockModel ? schema.udrBlockModel.objectType : ''
            },
            lookupTargetField: schema.targetFld,
            lookupTargetText: ''
          })
        });
        this.transformationLookUpData = lookupFields;
      }
    }
  }

  /**
   * get transformation sub type
   * @param transformationSchema pass the transformation schema Object
   */
  getTrRuleType(transformationSchema: TransformationModel[]) {
    if (transformationSchema && transformationSchema.length > 0) {
      const schema = transformationSchema[0];
      if (schema.transformationRuleType === this.transformationType.LOOKUP) {
        return this.transformationType.LOOKUP;
      }
      if (schema.transformationRuleType === this.transformationType.REGEX) {
        return this.transformationType.REGEX;
      }
    }
    return '';
  }

  // setting classification rule data for edit
  setClassificationRuleData(br: any) {
    const tableSetting = br.descriptionRule?.tableSetting || [];
    const frm = this.classificatiobNodeArray();
    frm.clear();
    tableSetting.forEach((value, index) => {
      const row = this.blockCtrlRule();
      if (value.tableName) {
        row.controls.tableName.setValue(value.tableName);
      }
      if (value.descType) {
        row.controls.descType.setValue(value.descType);
      }
      if (value.descField) {
        row.controls.descField.setValue(value.descField);
      }
      if (value.langField) {
        row.controls.langField.setValue(value.langField);
      }
      frm.push(row);
    });
    // frm.removeAt(0);
    this.tableData2 = [];
    this.tableData = [];
    this.getTableNameFields();
    const conditionSetField = br.descriptionRule?.descSetField || [];
    // this.setOtherClassificationFields(br.descriptionRule);
    this.selectedDescSettingsOptions = this.descSettingsField.filter(d => conditionSetField.indexOf(d.fieldId) > -1);
    const conditionListData = this.formatConditionDataForEdit(br.descriptionRule?.conditionList);
    this.schemaService.conditionSideSheetData.next(conditionListData);
    this.classificationConditionFormatting(conditionListData);
    this.conditionTableDataSet();
    this.createClassicForm(br.descriptionRule);
    this.dataSourceRule = new MatTableDataSource<any>(this.tableData);
  }

  setOtherClassificationFields(value: string, field: string) {
    let fieldObj;
    if (field === 'shortDescription') {
      fieldObj = this.shortDescList.filter(d => d.fieldId === value)[0];
    } else if (field === 'longDescription') {
      fieldObj = this.longDescList.filter(d => d.fieldId === value)[0];
    } else if (field === 'nounField') {
      fieldObj = this.proposeNounField.filter(d => d.fieldId === value)[0];
    }
    return fieldObj;
  }

  // formatting the added condition for edit
  formatConditionDataForEdit(conditionList: Array<DescriptiveConditionList>) {
    const updateConditionList = [];
    conditionList?.forEach((data, index) => {
      updateConditionList[index] = { ...data, conditionId: index, conditionName: 'Condition ' + index };
      if (data.fieldValue) {
        updateConditionList[index].field1 = this.formattingForDate(data.fieldValue[0], 0);
        updateConditionList[index].field2 = this.formattingForDate(data.fieldValue[1], 1);
      }
    });
    return updateConditionList;
  }

  // formatting date to show on condition table
  formattingForDate(field: any, index: number) {
    let value = field?.fieldValue;
    if (this.selectedDescSettingsOptions?.[index]) {
      const selectedDescField = this.selectedDescSettingsOptions[index];
      if (selectedDescField?.pickList === '52') {
        value = new Date(+field.fieldValue);
      }
    }
    return value;
  }

  /**
   * Initilize form while edit ..
   * @param br initilize form while edit ..
   */
  editUdr(br: CoreSchemaBrInfo) {
    // const parentBlocks = br.udrData?.when || [];
    // const parentFormArray = (this.udrNodeForm.get('blocks') as FormArray);
    // if(parentBlocks.length) {
    //   const addChildBlocks = (formArray: FormArray, blocks: Array<UDRBlocksModel>) => {
    //     blocks.forEach((block, index) => {
    //       const control = this.blockCtrl(block, block.blockType || 'AND');
    //       formArray.push(control);
    //       if(block.childs?.length) {
    //         addChildBlocks(control.get('childs') as FormArray, block.childs);
    //       }
    //     });
    //   }
    //   parentFormArray.removeAt(0);
    //   addChildBlocks(parentFormArray, parentBlocks);
    // }
    this.udrBlockList = {
      ...this.udrBlockList,
      blocksList: br.udrData?.when || []
    };
  }

  /**
   * Add parent UDR object
   * @param udr pass the udr block object
   */
  addParentBlock(udr?: UDRBlocksModel) {
    const parentArray = (this.udrNodeForm.get('blocks') as FormArray);
    parentArray.push(this.blockCtrl(udr, parentArray.at(0)?.get('blockType')?.value));
  }

  /**
   * Initialize block formgroup
   * @param udr pass the udr block object
   */
  blockCtrl(udr?: UDRBlocksModel, blockType?: string): FormGroup {
    console.log(udr);
    return this.formBuilder.group({
      condition: new FormControl(udr ? udr.blockType : (blockType ? blockType : 'AND'), [Validators.required]),
      conditionFieldEndValue: new FormControl(udr ? udr.conditionFieldEndValue : ''),
      conditionFieldId: new FormControl(udr ? udr.conditionFieldId : '', [Validators.required]),
      conditionFieldStartValue: new FormControl(udr ? udr.conditionFieldStartValue : ''),
      conditionFieldValue: new FormControl(udr ? udr.conditionFieldValue : ''),
      sRegex: new FormControl(udr ? udr.sRegex : ''),
      conditionalFieldValueCtrl: new FormControl(udr ? udr.conditionalFieldValueCtrl : null),
      targetInfo: new FormControl(udr ? udr.targetInfo : ''),
      conditionOperator: new FormControl(udr ? udr.conditionOperator : '', [Validators.required]),
      conditionValueFieldId: new FormControl(udr ? udr.conditionValueFieldId : '', [Validators.required]),
      id: new FormControl(udr ? udr.id : Math.floor(Math.random() * 1000000000000).toString()),
      objectType: new FormControl(this.moduleId),
      udrid: new FormControl(this.brId),
      childs: this.formBuilder.array([])
    });
  }

  /**
   * Add childs block..
   * @param parentBlockIndx parent index item where add childs ..
   */
  addChildBlock(parentBlockIndx: number, udr?: UDRBlocksModel, subParentIdx?: number) {
    const chldArray = this.getChildAsControl(parentBlockIndx, subParentIdx);
    chldArray.push(this.blockCtrl(udr, chldArray.at(0)?.get('blockDesc').value));
  }

  /**
   * Get parent node array .
   */
  udrNodeArray(): FormArray {
    return this.udrNodeForm.get('blocks') as FormArray
  }

  /**
   * Get childs form array ..
   * @param index get childs node by parent id
   */
  getChildAsControl(rootParentIdx: number, subParentIdx?: number): FormArray {
    const rootChilds = this.udrNodeArray().at(rootParentIdx).get('childs') as FormArray;
    if (subParentIdx !== undefined) {
      return rootChilds.at(subParentIdx).get('childs') as FormArray;
    }
    return rootChilds;
  }

  /**
   * Remove parent node..
   * @param index removeable index
   */
  removeParentNode(index: number) {
    const frmArray = this.udrNodeArray();
    frmArray.removeAt(index);
  }

  /**
   * Remove child node element
   * @param parentNodeId parent node id ..
   * @param childNodeId child node id ..
   */
  removeChildNode(parentNodeId: number, childNodeId: number, subParentIndex?: number) {
    console.log(parentNodeId, childNodeId, subParentIndex);
    const chldArray = this.getChildAsControl(parentNodeId, subParentIndex);
    chldArray.removeAt(childNodeId);
  }

  /**
   * function to get the fields on basis of module
   */
  getFieldsByModuleId(moduleId) {
    if (!moduleId) { return };

    this.coreService.getMetadataFieldsByModuleId([moduleId]).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      this.initialMetadata = metadataModeleResponse;
      this.parseMetadataModelResponse(metadataModeleResponse);
    }, (err) => {
      this.parseMetadataModelResponse(this.parentMetadata);
    });
  }

  parseMetadataModelResponse(metadataModeleResponse: MetadataModeleResponse, resetFields = true) {
    if (!metadataModeleResponse) {
      return;
    }

    this.fieldsList = [];
    this.parentMetadata = metadataModeleResponse;
    const keys = Object.keys(metadataModeleResponse.headers);
    keys.forEach((key) => {
      this.fieldsList.push(metadataModeleResponse.headers[key])
    });

    this.sourceFieldsObject = {
      labelKey: 'fieldDescri',
      valueKey: 'fieldId',
      list: this.fieldsList
    }
    this.targetFieldsObject = {
      labelKey: 'fieldDescri',
      valueKey: 'fieldId',
      list: this.fieldsList
    }
    this.targetFilteredModules = of(this.fieldsList);
    this.filteredModules = of(this.fieldsList);
    this.initialFieldList = [...this.fieldsList];
    this.fieldListFiltered = this.transformFieldRes(metadataModeleResponse);
    this.initGridAndHierarchyToAutocompleteDropdown(metadataModeleResponse);
    this.initiateAutocomplete();
    if ((this.brId || this.isDRChildRule) && this.coreSchemaBrInfo) {
      try {
        const fldIds = this.coreSchemaBrInfo.fields ? this.coreSchemaBrInfo.fields.split(',') : [];
        const targetFlds = this.coreSchemaBrInfo.target_field ? this.coreSchemaBrInfo.target_field.split(',') : [];
        if (resetFields) {
          this.selectedFields = [];

          this.selectedTargetFields = [];
          if (this.coreSchemaBrInfo.fieldCtrl) {
            Object.keys(this.coreSchemaBrInfo.fieldCtrl).forEach((key) => {
              const fld = this.coreSchemaBrInfo.fieldCtrl[key];
              if (!this.selectedFields.find(x => x.fieldId === key)) {
                this.selectedFields.push({ fieldDescri: (fld?.fieldDesc || fld?.fieldDescri || fld?.description), fieldId: key });
              }
            });
          }
          fldIds.forEach(fld => {
            const fldCtrl = this.fieldsList.find(fil => fil.fieldId === fld);
            if (fldCtrl && !this.selectedFields.find(x => x.fieldId)) {
              this.selectedFields.push({ fieldDescri: fldCtrl.fieldDescri, fieldId: fld });
            } else {
              const fieldsselected = this.allGridAndHirarchyData.find(parent => { return parent.children.find(child => { return child.id === fld }) });
              if (fieldsselected && fieldsselected.children.length >= 1) {
                const field = fieldsselected.children.find(child => child.id === fld);
                if (field && !this.selectedFields.find(x => x.fieldId)) {
                  this.selectedFields.push({ fieldDescri: field.parent + '/' + field.name, fieldId: field.id });
                }
              }
            }
          });
        }
        targetFlds.forEach(fld => {
          const fldCtrl = this.fieldsList.find(fil => fil.fieldId === fld);
          if (fldCtrl) {
            this.selectedTargetFields.push({ fieldDescri: fldCtrl.fieldDescri, fieldId: fld });
          }
        });

        if (this.coreSchemaBrInfo.source_field) {
          const fld = this.sourceFieldsObject.list.find(fil => fil.fieldId === this.coreSchemaBrInfo.source_field);
          if (fld) {
            this.form.controls.sourceFieldSearchStr.setValue(fld.fieldId);
          }
        }
      } catch (ex) { console.error(ex) }
    }
    if (this.isOnlyForTrans) {
      this.form.controls.transformationRuleType.setValue(this.transformationType.REGEX);
    }
  }

  onSelectingTransformationRule(type){
    let metadataModeleResponse = this.parentMetadata;
    let fieldOptionsForTransformationRules = [];
    if(this.isTransformationRule && ((this.selectedTransformationType === this.transformationType.CONSTANT) || (this.selectedTransformationType === this.transformationType.EMPTY) || (this.selectedTransformationType === this.transformationType.ZERO))){
      let itemKeys = Object.keys(metadataModeleResponse.gridFields);
      itemKeys.forEach((item)=>{
        let dataKeys = Object.keys(metadataModeleResponse.gridFields[item]);
        dataKeys.forEach((key)=>{
          fieldOptionsForTransformationRules.push(metadataModeleResponse.gridFields[item][key]);
        })
      })
      itemKeys = Object.keys(metadataModeleResponse.hierarchyFields);
      itemKeys.forEach((item)=>{
        let dataKeys = Object.keys(metadataModeleResponse.hierarchyFields[item]);
        dataKeys.forEach((key)=>{
          fieldOptionsForTransformationRules.push(metadataModeleResponse.hierarchyFields[item][key]);
        })
      })

    } else{
      const keys = Object.keys(metadataModeleResponse.headers);
      keys.forEach((key) => {
        fieldOptionsForTransformationRules.push(metadataModeleResponse.headers[key])
      });
    }
    this.sourceFieldsObject.list = fieldOptionsForTransformationRules;
  }

  transformFieldRes(response: MetadataModeleResponse): Metadata[] {
    const metadata: Metadata[] = [];

    // for header
    const headerChilds: Metadata[] = [];
    if(response.headers) {
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

    if (this.showGrouping) {
      metadata.push({
        fieldId: 'header_fields',
        fieldDescri: 'Header fields',
        isGroup: true,
        childs: headerChilds
      });
    } else {
      headerChilds.forEach(child => metadata.push(child));
    }

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
                childs:[],
                fieldType: {
                  fieldId: grid,
                  fieldDescri: response.grids[grid].fieldDescri
                },
                fldCtrl
              });
          });
        }

        if (this.showGrouping) {
          metadata.push({
            fieldId: grid,
            fieldDescri: response.grids[grid].fieldDescri,
            isGroup: true,
            childs
          });
        } else {
          childs.forEach(child => metadata.push(child));
        }
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
                childs:[],
                fieldType: {
                  fieldId: hierarchy.heirarchyId,
                  fieldDescri: hierarchy.heirarchyText
                },
                fldCtrl
              });
          });
        }

        if (this.showGrouping) {
          metadata.push({
            fieldId: hierarchy.heirarchyId,
            fieldDescri: hierarchy.heirarchyText,
            isGroup: true,
            childs
          });
        } else {
          childs.forEach(child => metadata.push(child));
        }

      });
    }
    return metadata;
  }

  /**
   * function to filter the list
   * @param val fitering text
   */
  filter(val: string): any[] {
    return this.fieldsList.filter(option => {
      return option.fieldDescri.toLowerCase().indexOf(val.toLowerCase()) === 0;
    })
  }

  /**
   * function to save the array of ids of selected fields
   * @param event selected item eent
   */
  selectField(event) {
    if (!!event.option.value) {
      const alreadyExists = this.selectedFields.find(item => item.fieldId === event.option.value);
      if (alreadyExists) {
        this.snackBar.open('This field is already selected', null, { duration: 5000 });
      } else {
        this.selectedFields.push({
          fieldDescri: event.option.viewValue,
          fieldId: event.option.value
        });
      }
      this.form.get('fields').patchValue('');
      const txtfield = document.getElementById('fieldsInput') as HTMLInputElement;
      if (txtfield) {
        txtfield.value = '';
      }
      if (this.fieldsInput) {
        this.fieldsInput.nativeElement.blur();
      }
    }
  }
  /**
   * While clicking on Tree node
   * @param selectedNode selected node
   */
  clickTreeNode(selectedNode) {
    const selectedNodes = {
      fieldDescri: selectedNode.parent + '/' + selectedNode.name,
      fieldId: selectedNode.id
    }
    const alreadyExists = this.selectedFields.find(item => item.fieldId === selectedNodes.fieldId);
    if (alreadyExists) {
      this.snackBar.open('This field is already selected', 'error', { duration: 5000 });
    } else {
      this.selectedFields.push(selectedNodes);
    }
    this.form.get('fields').patchValue('');
    const txtfield = document.getElementById('fieldsInput') as HTMLInputElement;
    if (txtfield) {
      txtfield.value = '';
    }
    if (this.fieldsInput) {
      this.fieldsInput.nativeElement.blur();
    }
  }

  /**
   * function to remove the value
   * @param field the field to be removed
   */
  remove(field, i) {
    this.selectedFields.splice(i, 1);
  }

  /**
   * func to select target field
   * @param event selected target field
   */
  selectTargetField(event) {
    if (!!event.option.value) {
      const alreadyExists = this.selectedTargetFields.find(item => item.fieldId === event.option.value);
      if (alreadyExists) {
        this.transientService.open(`This field is already selected`, `Close`, { duration: 2000 });
      } else {
        this.selectedTargetFields.push({
          fieldDescri: event.option.viewValue,
          fieldId: event.option.value
        });
      }
      this.form.get('target_field').patchValue('');
      const txtfield = document.getElementById('targetFieldsInput') as HTMLInputElement;
      if (txtfield) {
        txtfield.value = '';
      }
      if (this.targetFieldsInput) {
        this.targetFieldsInput.nativeElement.blur();
      }
    }
  }

  /**
   * fn to remove selected target fields
   * @param i index of the field to be removed
   */
  removeTargetField(i) {
    this.selectedTargetFields.splice(i, 1);
  }

  /**
   * function to set the value in the form
   * @param value entered value
   * @param field the selected field of form
   */
  getFormValue(value, field) {
    this.form.controls[field].setValue(value);
  }

  /**
   * function to close the dialog
   */
  close() {
    if (this.isDRChildRule) {
      delete this.schemaService.drChildRequest;
      this.schemaService.drChildReponse.next(null);
      this.router.navigate([{ outlets: { sb3: null } }]);
    } else if (this.isOnlyForTrans) {
      this.router.navigate([{ outlets: { [`${this.activeOutlet}`]: null } }]);
    } else if(this.mappingRule.isMappingRule) {
      this.router.navigate([{ outlets: { [`${this.activeOutlet}`]: null } }]);
      this.sharedService.setMappingPositionOnScroll(false);
    } else {
      this.router.navigate([{ outlets: { [`${this.activeOutlet}`]: null } }], { queryParamsHandling: 'preserve' });
    }
  }
  /**
   * function to set form values from mat auto complete
   */
  selectSingle(form: FormGroup, controlName: string, $event) {
    form.controls[controlName].setValue($event.option.value);
    if (controlName === 'standard_function') {
      const code = this.preDefinedRegex.find(x => x.FUNC_TYPE === $event.option.value)?.FUNC_CODE;
      form.controls.regex.setValue(code);
    }
    if (controlName === 'rule_type') {
      const categoryValidators = (this.isDuplicateType || this.isUDR || this.isWebServiceCall) ? [] : [Validators.required];
      this.form.controls.categoryId.setValidators(categoryValidators);
    }
  }

  /**
   * function to display category name in mat auto complete
   */
  displayCategoryFn(value?: string) {
    return value ? this.categoryList.find(category => `${category.categoryId}` === `${value}`)?.categoryDesc : '';
  }

  /**
   * function to display rule desc in mat auto complete
   */
  displayRuleFn(value?: string) {
    return value ? this.businessRuleTypes.find(rule => rule.ruleType === value)?.ruleDesc : '';
  }

  /**
   * function to display Regex name in mat auto complete
   */
  displayRegexFn(value?: string) {
    return value ? this.preDefinedRegex.find(rule => rule.FUNC_TYPE === value)?.FUNC_NAME : '';
  }

  /**
   * function to fetch field description from field field id
   * @param value field object
   * @returns field description
   */
  displaySourceFieldFn(value?: string) {
    return value ? this.sourceFieldsObject.list.find(field => field[this.sourceFieldsObject.valueKey] === value)?.[this.sourceFieldsObject.labelKey] : '';
  }

  onScroll(event) {
    if (event) {
      const viewPortHeight = event.target.offsetHeight; // height of the complete viewport
      const scrollFromTop = event.target.scrollTop;     // height till user has scrolled
      const sideSheetHeight = event.target.scrollHeight; // complete scrollable height of the side sheet document
      const limit = sideSheetHeight - scrollFromTop;

      if (limit !== viewPortHeight) {
       const crossDataset = this.crossDatasetFormGroup.get('crossDatasetInfo').value?.payload?.mappings;
       if (crossDataset?.length) {
         this.sharedService.setMappingPositionOnScroll(true);
       }
      }
    }
  }

  scrollEnd() {
    this.sharedService.setMappingPositionOnScroll(false);
  }

  /**
   * function to save the form data
   */
  async save() {
    if(!this.form.controls['rule_name'].valid){
      this.showValidationError("Please fill the rule name");
      return;
    }
    if (!this.isOnlyForTrans && !this.businessRuleTypes.find(x => x.ruleType === this.form.controls.rule_type.value)) {
      this.form.controls.rule_type.setValue('');
      return;
    }

    if (this.categoryList && !this.categoryList.find(x => x.categoryId === this.form.controls.categoryId.value)) {
      this.form.controls.categoryId.setValue('');
    }

    if (this.form.value && this.form.controls.rule_type.value === BusinessRuleType.NOTIFICATION_RULE) {
      const notificationValue = this.notificationRuleFormGroup.value?.notificationInfo;

      if (!notificationValue.Recipients?.emailRecipients?.length) {
        this.showValidationError('Please enter Recipients Values');
        return;
      }

      if (!notificationValue?.eventRuleSetting?.isFormValid && !notificationValue?.eventRuleSetting?.isUpdated) {
        this.showValidationError('Please select event Type or select event from event list');
        return;
      }

      let payload = new notifInfo();
      payload.ruleType = notificationValue.trigger;
      payload.notifyType = notificationValue.notificationSetting?.notifyType || 'EMAIL';
      payload.priority = notificationValue.notificationSetting?.priority || 'LOW';
      payload.templateId = notificationValue.notificationSetting?.templateId?.toString() || '';
      payload.reciptients = notificationValue.Recipients?.emailRecipients || [];
      payload.eventName = notificationValue.eventRuleSetting.payload || notificationValue.eventRuleSetting.event.value;

      if (notificationValue?.uuid) {
        payload.uuid = notificationValue.uuid;
      }

      if (notificationValue.trigger === 'DATE') {
        payload.startTime = notificationValue.dateRuleSetting.datePayload.start;
        payload.fieldArr = notificationValue.dateRuleSetting.datePayload.fieldArr;
        payload.intervalData = notificationValue.dateRuleSetting.datePayload.interval;
        payload.reminder = notificationValue.dateRuleSetting.datePayload.reminder;
        payload.repeatCount = notificationValue.dateRuleSetting.datePayload.repeatCount;
        payload.isFormValid = notificationValue?.dateRuleSetting?.isFormValid || false;

        if (notificationValue?.dateRuleSetting?.datePayload?.end) {
          payload.endTime = notificationValue.dateRuleSetting.datePayload.end;
        }
      }

      if (notificationValue.trigger === 'EMAIL') {
        payload.fieldArr = notificationValue?.emailRuleSetting?.emailFields.slice();
        payload.isFormValid = notificationValue?.emailRuleSetting?.isFormValid || false;
      }

      if (notificationValue.trigger === 'FIELD') {
        payload.fieldArr = notificationValue?.fieldValueRuleSetting?.fieldValueTrigger;
        payload.isFormValid = notificationValue?.fieldValueRuleSetting?.isFormValid || false;
      }

      if (notificationValue.trigger === 'UDR') {
        if (notificationValue.customRuleSetting.customTrigger.blocks.length && !notificationValue.customRuleSetting.customTrigger.udrId) {
          const processBlocks = (blocklist: Array<any>): Array<UDRBlocksModel> => blocklist.map((block, ind) => ({
            id: block.id,
            udrid: block.udrid,
            conditionFieldId: block.preSelectedSourceFld,
            conditionValueFieldId: block.preSelectedTargetFld,
            conditionFieldValue: block.preSelectedTargetFld,
            conditionFieldStartValue: block.conditionFieldStartValue,
            conditionFieldEndValue: block.conditionFieldEndValue,
            blockType: block.condition,
            conditionOperator: block.operator,
            blockDesc: block.condition.toLowerCase(),
            objectType: this.moduleId || '',
            sRegex: block.regexCtrl,
            targetInfo: block.targetInfo,
            conditionFieldIdCtrl: block.sourceFldCtrl,
            childs: Array.isArray(block.childs) ? processBlocks(block.childs) : [],
            order: ind,
            sourceObjectType: block.sourceFldObjType,
            targetObjectType: (block.targetInfo === TragetInfo.VALUE) ? '' : this.moduleId,
          }));
          const when = processBlocks(notificationValue.customRuleSetting.customTrigger.blocks);
          payload.objectType = this.moduleId;
          payload.udrData = {
            when
          } as UdrModel;
        }

        if (notificationValue.customRuleSetting.customTrigger.udrId) {
          payload.urdId = notificationValue.customRuleSetting.customTrigger.udrId;
        }

        payload.isFormValid = notificationValue?.customRuleSetting?.isFormValid || false;
      }

      if (notificationValue.trigger === 'DEFAULT') {
        payload.isFormValid = notificationValue?.eventRuleSetting?.isFormValid;
      }

      if (payload.isFormValid) {
        let notificationRule = new CoreSchemaBrInfo();
        notificationRule = {
          schemaId : this.schemaId,
          brId: this.brId,
          brType: BusinessRuleType.NOTIFICATION_RULE,
          message: 'test',
          brInfo: this.form.value.rule_name,
          fields: '',
          moduleId: this.moduleId,
          brWeightage: '0',
          categoryId: '0',
          isCopied: false,
          copiedFrom: '',
          dependantStatus: RuleDependentOn.ALL,
          order: this.coreSchemaBrInfo.order || 0,
          status: this.coreSchemaBrInfo.status || '1',
          standardFunction: null,
          apiKey: null,
          apiSno: null,
          source_field: '',
          target_field: '',
          accuracyScore: 0,
          regex: '',
          isTransformationApplied: false,
          transformationMappingDTO: [],
          duplicacyField: [],
          duplicacyMaster: [],
          masterRules: [],
          sno: null,
          refId: null,
          script: null,
          brExpose: null,
          totalWeightage: null,
          tableName: '',
          transformation: null,
          transFormationSchema: null,
          brIdStr: this.brId.toString(),
          plantCode: null,
          qryScript: null,
          percentage: null,
          notifInfo: payload
        }

        if (payload?.udrData?.when?.length) {
          notificationRule.udrData = {...payload.udrData}
        }
        delete notificationRule.notifInfo.isFormValid;
        this.schemaService.createUpdateBr(notificationRule).subscribe(res => {
          this.snackBar.open(`Successfully saved !`, 'Close', { duration: 3000 });
          this.sharedService.setAfterBrSave(res);
          this.sharedService.isBuisnessRuleListUpdated.next(true);
            this.close();
          return;
        }, error => {
          this.showValidationError(error?.error?.errorMsg || 'Something went wrong');
          return;
        });
      }

      return;
    }

    if (this.form.value && this.form.controls.rule_type.value === BusinessRuleType.AUTO_EXTENSION_RULE) {
      this.form.get('rule_name').setValidators([]);
      this.form.get('error_message').setValidators([]);
      this.form.get('weightage').setValidators([]);
      this.form.get('apiSno').setValidators([]);
      this.form.get('rule_name').updateValueAndValidity();
      this.form.get('error_message').updateValueAndValidity();
      this.form.get('weightage').updateValueAndValidity();
      this.form.get('apiSno').updateValueAndValidity();

      const autoExtenstionFormValue = this.autoExtensionFormGroup.get('autoExeInfo').value;
      if (autoExtenstionFormValue.isFormValid) {
        let autoExtension = new CoreSchemaBrInfo();
        autoExtension = {
          schemaId : this.schemaId,
          brId: this.brId,
          brType: "AUTO_EXTENSION_RULE",
          message: 'test',
          brInfo: autoExtenstionFormValue.payload.brInfo,
          fields: '',
          moduleId: this.moduleId,
          brWeightage: '0',
          categoryId: '0',
          isCopied: false,
          copiedFrom: '',
          dependantStatus: RuleDependentOn.ALL,
          order: this.coreSchemaBrInfo.order || 0,
          status: this.coreSchemaBrInfo.status || '1',
          standardFunction: null,
          apiKey: null,
          apiSno: null,
          source_field: '',
          target_field: '',
          accuracyScore: 0,
          regex: '',
          isTransformationApplied: false,
          transformationMappingDTO: [],
          duplicacyField: [],
          duplicacyMaster: [],
          masterRules: [],
          sno: null,
          refId: null,
          script: null,
          brExpose: null,
          totalWeightage: null,
          tableName: '',
          transformation: null,
          transFormationSchema: null,
          brIdStr: this.brId.toString(),
          plantCode: null,
          qryScript: null,
          percentage: null,
          autoExeInfo: {
            conditions: autoExtenstionFormValue.payload.conditions,
            strCtrl: autoExtenstionFormValue.payload.strCtrl,
            strId: autoExtenstionFormValue.payload.strId
          },
          brDescription: autoExtenstionFormValue.payload.brDescription
        }

        this.schemaService.createUpdateBr(autoExtension).subscribe(res => {
          this.snackBar.open(`Successfully saved !`, 'Close', { duration: 3000 });
          this.sharedService.setAfterBrSave(res);
          this.autoExtensionFormGroup.get('autoExeInfo').patchValue({
            ...this.autoExtensionFormGroup.get('autoExeInfo').value,
            isAutoExeFormSaved: false
          })
          this.sharedService.isBuisnessRuleListUpdated.next(true);
          this.close();
          return;
        }, error => {this.showValidationError(error?.error?.errorMsg || 'Something went wrong');
          return;
        });

        return;
      }
      else {
        this.showValidationError('Please fill the required fields');
        return;
      }
    }

    if (this.form.value && this.form.controls.rule_type.value === BusinessRuleType.BR_CLASSIFICATION_RULE) {
      if (!this.tableData.length) {
        this.tableConditionError = 'You can not save this business rule until at least 1 condition is created';
        return;
      } else {
        this.tableConditionError = '';
        const frm = this.classificatiobNodeArray();
        const tableSetting = [];
        for (let i = 0; i < frm.length; i++) {
          const row = frm.at(i) as FormGroup;
          const value = row.value as any;
          value.tableName = value?.tableName?.description;
          tableSetting.push(value);
          if (!value.tableName) {
            row.controls.tableName.markAsTouched();
          }
          if (!value.descType) {
            row.controls.descType?.markAsTouched();
          }
          if (!value.descField) {
            row.controls.descField?.markAsTouched();
          }
          if (!value.langField) {
            row.controls.langField?.markAsTouched();
          }
        }
        const selectedDescField = this.selectedDescSettingsOptions.map(item => item.fieldId);
        console.log('dhfhg==', this.tableData2)
        const descRule: DescriptionRule = {
          tableSetting,
          shortDescription: this.classicForm.get('shortDescription').value ? this.classicForm.get('shortDescription').value.fieldId : '',
          longDescription: this.classicForm.get('longDescription').value ? this.classicForm.get('longDescription').value.fieldId : '',
          nounField: this.classicForm.get('nounField').value ? this.classicForm.get('nounField').value.fieldId : '',
          descSetField: selectedDescField,
          conditionList: this.tableData2
        };

        let classic = new CoreSchemaBrInfo();
        classic = {
          brId: this.brId || this.coreSchemaBrInfo.brId,
          brType: this.form.value.rule_type, brInfo: this.form.value.rule_name,
          message: this.form.value.error_message,
          moduleId: this.moduleId,
          brWeightage: this.form.value.weightage,
          categoryId: this.form.value.categoryId,
          isCopied: false,
          copiedFrom: '',
          dependantStatus: RuleDependentOn.ALL,
          order: 0,
          status: '1',
          standardFunction: null,
          apiKey: null,
          apiSno: null,
          source_field: '',
          target_field: '',
          accuracyScore: 0,
          regex: '',
          isTransformationApplied: false,
          transformationMappingDTO: [],
          fields: '',
          descriptionRule: descRule,
          duplicacyField: [],
          duplicacyMaster: [],
          masterRules: [],
          sno: null,
          refId: null,
          script: null,
          brExpose: null,
          totalWeightage: null,
          tableName: '',
          transformation: null,
          transFormationSchema: null,
          brIdStr: null,
          plantCode: null,
          qryScript: null,
          percentage: null,
          schemaId: this.schemaId
        }
        console.log('classification rule==', classic);
        if (this.form.value.rule_name) {
          this.schemaService.createUpdateBr(classic).subscribe(res => {
            this.snackBar.open(`Successfully saved !`, 'Close', { duration: 3000 });
            this.schemaService.conditionSideSheetData.next([]);
            // this.sharedService.setAfterBrSave(res);
            this.sharedService.isBuisnessRuleListUpdated.next(true);
            this.close();
            this.sharedService.setAfterBrSave(res);
            return;
          }, error => {
            // this.snackBar.open(`Something went wrong `, 'Close', { duration: 3000 });
            this.showValidationError(error?.error?.errorMsg || 'Something went wrong');
            return;
          });
        }

        return;
      }
    }

    this.submitted = true;

    if (this.coreSchemaBrInfo.brType === BusinessRuleType.BR_CLASSIFICATION_RULE) {
      return;
    }

    if (!this.isDRChildRule && !await this.canAllowNewBR()) {
      return false;
    }
    this.form.controls.fields.setValue(this.selectedFields.map(item => item.fieldId).join(','), { emitEvent: false });
    this.form.controls.target_field.setValue(this.selectedTargetFields.map(item => item.fieldId).join(','));
    (Object).values(this.form.controls).forEach(control => {
      if (control.invalid)
        control.markAsTouched();
    });
    if (this.transformationRuleComponent)
      (Object).values(this.transformationRuleComponent.form.controls).forEach(control => {
        this.transformationRuleComponent.submitted = true;
        if (control.invalid)
          control.markAsTouched();
      });

    let brType: string = this.form.value ? this.form.value.rule_type : '';
    brType = brType ? brType : this.coreSchemaBrInfo.brType;

    if (this.isOnlyForTrans || this.mappingRule.ruleType === BusinessRuleType.BR_TRANSFORMATION) {
      brType = BusinessRuleType.BR_TRANSFORMATION;
    }

    if (brType === BusinessRuleType.BR_API_RULE) {
      const hasInDrop = this.apiRules.find(a => a.sno === this.form.get('apiSno').value);
      if (!hasInDrop) {
        this.form.controls.apiSno.markAsDirty();
        this.form.controls.apiSno.markAsTouched();
        this.form.controls.apiSno.setValue('');
        // this.form.controls.apiSno;
        return false;
      }
    }

    if (!this.form.valid && (this.form.value && ![BusinessRuleType.BR_CLASSIFICATION_RULE, BusinessRuleType.BR_TRANSFORMATION,BusinessRuleType.BR_LOOKUP_RULE, BusinessRuleType.BR_CROSS_DATASET_RULE, BusinessRuleType.NOTIFICATION_RULE].includes(this.form.controls.rule_type.value))) {
      console.log(this.form.controls);

      this.form.markAllAsTouched();
      this.showValidationError('Please fill the required fields.');
      if (brType !== 'BR_CUSTOM_SCRIPT') {
        return;
      }
    }

    if (this.isMPNI && !this.selectedTargetFields.length) {
      return;
    }

    if (brType === BusinessRuleType.BR_TRANSFORMATION) {
      if (this.selectedTransformationType === TransformationRuleType.CONSTANT) {
        if (!this.transInfo.constant || this.transInfo.constant && this.transInfo.constant.filter(item => !item.fldId).length > 0) {
          this.showValidationError('Please select field in constant rule.');
          return;
        }
        if (this.hasDuplicateKey(this.transInfo.constant, 'fldId')) {
          this.showValidationError('Duplicate field exists in constant rule.');
          return;
        }
      }
      if (this.selectedTransformationType === TransformationRuleType.ZERO) {
        if (!this.transInfo.zero || this.transInfo.zero && this.transInfo.zero.fields.filter(item => !item.fldId).length > 0) {
          this.showValidationError('Please select field in zero rule.');
          return;
        }
        if (this.hasDuplicateKey(this.transInfo.zero.fields, 'fldId')) {
          this.showValidationError('Duplicate field exists in zero rule.');
          return;
        }
      }
      if (this.selectedTransformationType === TransformationRuleType.EMPTY) {
        if (!this.transInfo.empty_space || this.transInfo.empty_space && this.transInfo.empty_space.fields.filter(item => !item.fldId).length > 0) {
          this.showValidationError('Please select field in empty rule.');
          return;
        }
        if (this.hasDuplicateKey(this.transInfo.empty_space.fields, 'fldId')) {
          this.showValidationError('Duplicate field exists in empty rule.');
          return;
        }
      }
    }

    if (brType === 'BR_CUSTOM_SCRIPT') {

      if (!this.selectedFields.length) {
        return;
      }

      // for user defined rule
      const udrDto: UdrModel = new UdrModel();
      udrDto.brInfo = {
        brId: this.brId, brIdStr: this.brId,
        brType, brInfo: this.form.value.rule_name,
        message: this.form.value.error_message,
        schemaId: this.schemaId,
        moduleId: this.moduleId,
        brWeightage: this.form.value.weightage,
        categoryId: this.form.value.categoryId,
        isCopied: false,
        copiedFrom: '',
        dependantStatus: this.coreSchemaBrInfo.dependantStatus || RuleDependentOn.ALL,
        order: this.coreSchemaBrInfo.order || 0,
        status: this.coreSchemaBrInfo.status || '1',
        fields: this.form.value.fields
      } as CoreSchemaBrInfo;

      const blocks: UDRBlocksModel[] = [];
      const frm = this.udrNodeArray();
      for (let i = 0; i < frm.length; i++) {
        const row = frm.at(i) as FormGroup;
        const value = row.value as UDRBlocksModel;
        blocks.push(value);
        if (!value.blockType && row.controls?.blockType) {
          row.controls.blockType.markAsTouched();
        }
        if (!value.conditionOperator && row.controls.conditionOperator) {
          row.controls.conditionOperator?.markAsTouched();
        }
        if (!value.conditionFieldId && row.controls.conditionFieldId) {
          row.controls.conditionFieldId?.markAsTouched();
        }
        (row.controls.childs as any).controls.forEach((childRow) => {
          childRow.markAllAsTouched();
        });
      }

      this.udrNodeForm.markAllAsTouched();
      if (!this.udrNodeForm.valid) {
        this.showValidationError('Please complete the required field(s).');
        return;
      }
      if (!this.form.valid) {
        return;
      }
      const processBlocks = (blocklist: Array<any>): Array<UDRBlocksModel> => blocklist.map((block, ind) => ({
        id: block.id,
        udrid: block.udrid,
        conditionFieldId: block.preSelectedSourceFld,
        conditionValueFieldId: block.preSelectedTargetFld,
        conditionFieldValue: block.preSelectedTargetFld,
        conditionFieldStartValue: block.conditionFieldStartValue,
        conditionFieldEndValue: block.conditionFieldEndValue,
        blockType: block.condition,
        conditionOperator: block.operator,
        blockDesc: block.condition.toLowerCase(),
        objectType: this.moduleId || '',
        sRegex: block.regexCtrl,
        targetInfo: block.targetInfo,
        conditionFieldIdCtrl: block.sourceFldCtrl,
        childs: Array.isArray(block.childs) ? processBlocks(block.childs) : [],
        order: ind,
        sourceObjectType: block.sourceFldObjType,
        targetObjectType: (block.targetInfo === TragetInfo.VALUE) ? '' : this.moduleId,
      }));
      udrDto.when = processBlocks(this.udrNodeForm.value.blocks);
      udrDto.objectType = this.moduleId;

      // attach the transformation for this rule
      udrDto.brInfo.isTransformationApplied = this.hasAppliedTransformationCtrl?.value ? this.hasAppliedTransformationCtrl.value : false;
      const sendMappings: TransformationRuleMapped[] = [];
      if (this.attachedTransRules) {
        // add for success
        this.attachedTransRules.success.forEach(s => {
          sendMappings.push({ order: sendMappings.length, isEnabled: s.isEnabled ? s.isEnabled : false, isConfigured: s.isConfigured, status: 'SUCCESS', transformationRule: s.ruleInfo?.brIdStr });
        });
        // add for error
        this.attachedTransRules.error.forEach(s => {
          sendMappings.push({ order: sendMappings.length, isEnabled: s.isEnabled ? s.isEnabled : false, isConfigured: s.isConfigured, status: 'ERROR', transformationRule: s.ruleInfo?.brIdStr });
        });
      }
      udrDto.brInfo.transformationMappingDTO = sendMappings;
      if (this.isDRChildRule) {
        this.schemaService.drChildReponse.next({
          data: udrDto,
          type: brType
        });
        this.close();
      } else {
        const udrBrInfo: CoreSchemaBrInfo = udrDto.brInfo;
        udrBrInfo.udrData = {
          when: udrDto.when
        } as UdrModel;
        this.schemaService.saveUpdateUDR(udrBrInfo).subscribe(res => {
          this.snackBar.open(`Successfully saved !`, 'Close', { duration: 3000 });
          this.getBusinessRuleBasicInfo(res);
          this.close();
        }, error => {
          this.snackBar.open(`Something went wrong `, 'Close', { duration: 3000 });
        });
      }

    } else if (brType === BusinessRuleType.BR_DUPLICATE_RULE) {
      // save duplicate rule
      this.saveDuplicateRule();
      // this.sharedService.emitSaveBrEvent(brInfo);

    } else if (brType === BusinessRuleType.BR_TRANSFORMATION || brType === BusinessRuleType.BR_LOOKUP_RULE) {
      const response = {
        formData: this.form.getRawValue(),
        tempId: '',
        lookupData: this.lookupData,
        transformationData: this.transformationData
      };
      const finalFormData = {
        ...this.form.getRawValue(),
        brId: this.brId && this.brId !== 'transformation' ? this.brId : '',
        brType,
        sno: this.coreSchemaBrInfo?.sno,
        transFormationSchema: this.mapTransformationData(response, brType),
        transInfo: this.transInfo
      }
      const brObject = this.createBrObject(finalFormData);
      if(this.isLookupRule) {
        delete brObject.transInfo;
        brObject.lookupRuleMetadata = this.transInfo.lookup.lookupRuleMetadata;
        brObject.udrData = this.transInfo.lookup.udrData;
      }
      brObject.dependantStatus = this.coreSchemaBrInfo.dependantStatus || RuleDependentOn.ALL;
      brObject.order = this.coreSchemaBrInfo.order || 0;
      brObject.status = this.coreSchemaBrInfo.status || '1';

      if (this.isOnlyForTrans) {
        brObject.dontMapped = true;
      }
      this.schemaService.createBusinessRule(brObject).subscribe(res => {
        if (this.isOnlyForTrans) {
          this.sharedService.settransSavedBehaviourSub(true);
          this.applyValidatorsByRuleType(this.form.controls.rule_type.value);
        }
        if (this.mappingRule.isMappingRule) {
          this.sharedService.setTargetFieldSelected({type: this.brId && this.brId !== 'transformation' ? 'edit' : 'new', requestPayload: brObject, response: res});
        }
        this.sharedService.setAfterBrSave(res);
        this.close();
      }, err => console.error(`Error : ${err.message}`));
    } else {
      const request: CoreSchemaBrInfo = new CoreSchemaBrInfo();
      request.brId = this.brId ? this.brId : '';
      request.brType = brType;
      request.message = this.form.value.error_message;
      request.brInfo = this.form.value.rule_name;
      request.fields = this.form.value.fields;
      request.apiKey = this.form.value.apiKey;
      request.apiSno = this.form.value.apiSno;
      request.regex = this.form.value.regex;
      request.standardFunction = this.form.value.standard_function;
      request.schemaId = this.schemaId;
      request.moduleId = this.moduleId;
      request.brWeightage = this.form.value.weightage;
      request.categoryId = this.form.value.categoryId || this.coreSchemaBrInfo.categoryId;
      request.isCopied = false;
      request.copiedFrom = '';
      request.dependantStatus = this.coreSchemaBrInfo.dependantStatus || RuleDependentOn.ALL;
      request.order = this.coreSchemaBrInfo.order || 0;
      request.status = this.coreSchemaBrInfo.status || '1';
      request.source_field = this.form.value.source_field || '';
      request.target_field = this.form.value.target_field || '';
      request.accuracyScore = this.form.value.accuracyScore || 0;
      if (brType === BusinessRuleType.BR_SAP_CHECK_CODE_RULE) {
        if (!this.webServiceCallFormRef.valid) {
          this.webServiceCallFormRef.markAllAsTouched();
          this.showValidationError('Please fill the required fields.');
          return;
        }
        const wsFormObject = this.webServiceCallFormRef.value;
        const lookupRuleMetadata: any = {
          targetSystem: wsFormObject.target_system,
          checkCodes: [
            wsFormObject.check_code?.code
          ],
          checkCodeDesc: wsFormObject.check_code?.description
        };
        lookupRuleMetadata.sno = `${this.coreSchemaBrInfo?.lookupRuleMetadata?.lookupStr ?? this.coreSchemaBrInfo?.lookupRuleMetadata?.sno ?? ''}`;
        request.lookupRuleMetadata = lookupRuleMetadata;
      }
      // attach the transformation for this rule
      request.isTransformationApplied = this.hasAppliedTransformationCtrl?.value ? this.hasAppliedTransformationCtrl.value : false;
      const sendMappings: TransformationRuleMapped[] = [];
      if (this.attachedTransRules) {
        // add for success
        this.attachedTransRules.success.forEach(s => {
          sendMappings.push({ order: sendMappings.length, isEnabled: s.isEnabled ? s.isEnabled : false, isConfigured: s.isConfigured, status: 'SUCCESS', transformationRule: s.ruleInfo?.brIdStr });
        });
        // add for error
        this.attachedTransRules.error.forEach(s => {
          sendMappings.push({ order: sendMappings.length, isEnabled: s.isEnabled ? s.isEnabled : false, isConfigured: s.isConfigured, status: 'ERROR', transformationRule: s.ruleInfo?.brIdStr });
        });
      }
      request.transformationMappingDTO = sendMappings;

      if (this.crossDatasetRule) {
        request.refId = this.crossDatasetFormGroup.value?.crossDatasetId?.ruleRefId;
      }

      if (this.isDRChildRule) {
        this.schemaService.drChildReponse.next({
          data: {
            brInfo: request
          },
          type: brType
        });
        this.close();
      } else {
        this.schemaService.createBusinessRule(request).subscribe(res => {
          this.sharedService.setAfterBrSave(res);
          this.close();
          this.coreService.updateBrRuleList(true);
        }, err => console.error(`Error : ${err.message}`));
      }
    }
    this.sharedService.isBuisnessRuleListUpdated.next(true);
  }

  saveRuleData() {
    if ((this.isTransformationRule && this.selectedTransformationType === this.transformationType.LOOKUP) || this.form.controls.rule_type.value === BusinessRuleType.BR_LOOKUP_RULE) {
      this.saveRule = true;
    } else {
      this.save();
    }

    if (this.form.value && this.form.controls.rule_type.value === BusinessRuleType.NOTIFICATION_RULE) {
      this.notificationRuleFormGroup.get('notificationInfo').patchValue({
        ...this.notificationRuleFormGroup.get('notificationInfo').value,
        isNotificationFormSaved: true
      })
    }

    if (this.form.value && this.form.controls.rule_type.value === BusinessRuleType.AUTO_EXTENSION_RULE) {
      this.autoExtensionFormGroup.get('autoExeInfo').patchValue({
        ...this.autoExtensionFormGroup.get('autoExeInfo').value,
        isAutoExeFormSaved: true
      })
    }
  }
  hasDuplicateKey(ary, key: string) {
    let hasDuplicates = false;
    const dataset = new Set();
    for (const item of ary) {
      if (dataset.has(item[key])) {
        hasDuplicates = true;
        break;
      } else {
        dataset.add(item[key])
      }
    }
    return hasDuplicates;
  }

  /**
   * Function to decide if we can allow current business rule to be saved based on some validations
   */
  async canAllowNewBR(): Promise<boolean> {
    if (this.brId) {
      return true;
    }
    const rules: {
      [index: string]: Array<string>
    } = {
      duplicate: [
        BusinessRuleType.BR_DUPLICATE_RULE
      ],
      classification: [
        BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP,
        BusinessRuleType.MRO_GSN_DESC_MATCH,
        BusinessRuleType.MRO_CLS_MASTER_CHECK
      ],
      dataQuality: [
        BusinessRuleType.BR_MANDATORY_FIELDS,
        BusinessRuleType.BR_METADATA_RULE,
        BusinessRuleType.BR_CUSTOM_SCRIPT,
        BusinessRuleType.BR_TRANSFORMATION,
        BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI,
        BusinessRuleType.BR_REGEX_RULE
      ]
    };
    if (!this.schemaId) return true;
    const brList = await this.schemaDetailsService.getSchemaBrInfoList(this.schemaId).toPromise();
    const ruleViewByType = (ruleType: string) => Object.keys(rules).find(ruleView => rules[ruleView].includes(ruleType)) || 'dataQuality';
    const currentRuleType = this.form.get('rule_type').value;
    let error = '';
    // Find current schema view
    const currentRuleView = ruleViewByType(currentRuleType);
    // Check if All are same view
    const isSameView = brList.every(rule => ruleViewByType(rule.brType) === currentRuleView);

    // Check if same rule type already exists
    const isSameType = brList.find((rule: any) => rule.brType === currentRuleType && rule.strBrId !== this.brId);
    if (!isSameView) {
      error = 'A rule with a different view cannot be added to a schema!';
    } else if (isSameType && currentRuleView !== 'dataQuality') {
      error = `Multiple ${currentRuleView} rules cannot be added to one schema!`;
    }
    if (error) {
      this.transientService.open(error, 'ok', { duration: 2000 });
    }
    return !Boolean(error);
  }

  /**
   * function to create br
   * @param object newly created Br
   */
  createBrObject(object, udrTreeData = { when: [] }): CoreSchemaBrInfo {

    return {
      sno: object.sno ? object.sno : 0,
      brId: object.brId ? object.brId : '',
      brType: object.brType ? object.brType : object.rule_type,
      refId: object.refId ? object.refid : 0,
      fields: object.fields,
      apiKey: object.apiKey,
      regex: object.regex,
      order: 1,
      message: object.message ? object.message : object.error_message,
      script: object.script ? object.script : '',
      brInfo: object.brInfo ? object.brInfo : object.rule_name,
      brExpose: object.brExpose ? object.brExpose : 0,
      status: object.status ? object.status : '1',
      categoryId: object.categoryId,
      standardFunction: object.standardFunction ? object.standardFunction : object.standard_function,
      brWeightage: object.brWeightage ? object.brWeightage : object.weightage,
      totalWeightage: 100,
      transformation: object.transformation ? object.transformation : 0,
      tableName: object.tableName ? object.tableName : '',
      qryScript: object.qryScript ? object.qryScript : '',
      dependantStatus: object.dependantStatus ? object.dependantStatus : 'ALL',
      plantCode: object.plantCode ? object.plantCode : '0',
      percentage: object.percentage ? object.percentage : 0,
      schemaId: this.schemaId,
      brIdStr: object.brIdStr ? object.brIdStr : '',
      udrData: {
        when: object.when || []
      },
      transInfo: object.transInfo,
      isCopied: object.isCopied ? object.isCopied : false,
      moduleId: this.moduleId
    } as CoreSchemaBrInfo;
  }

  /**
   * method to map transformation rule data from form
   * object to transformationschema format
   * @param response pass the response with formData and lookup object
   */
  mapTransformationData(response, ruleType) {
    const { sourceFld, targetFld, includeScript, excludeScript, transformationRuleType } = response.formData;
    const transformationList: TransformationModel[] = [];
    if (ruleType === BusinessRuleType.BR_TRANSFORMATION) {
      if (response.lookupData && response.lookupData.length > 0) {
        response.lookupData.map((param: LookupFields) => {
          const udr = this.createUDRBlockFromLookup(param);
          transformationList.push({
            brId: '',
            sourceFld: param.fieldId,
            targetFld: param.lookupTargetField,
            includeScript,
            excludeScript,
            transformationRuleType,
            lookUpObjectType: udr.objectType,
            lookUptable: '',
            udrBlockModel: udr
          })
        })
      } else {
        transformationList.push({
          brId: '',
          sourceFld,
          targetFld,
          includeScript,
          excludeScript,
          transformationRuleType,
          lookUpObjectType: '',
          lookUptable: '',
          udrBlockModel: null
        });
      }
      return transformationList;
    }
    return null;
  }

  /**
   * create UDR block data from lookup field
   * @param lookupData lookup data to be passed here
   */
  createUDRBlockFromLookup(lookupData: LookupFields): UDRBlocksModel {
    return {
      id: Math.floor(Math.random() * 100000000000).toString(),
      udrid: '',
      conditionFieldId: lookupData.fieldLookupConfig.lookupColumn,
      conditionValueFieldId: lookupData.fieldLookupConfig.lookupColumnResult,
      conditionFieldValue: '',
      conditionFieldStartValue: '',
      conditionFieldEndValue: '',
      blockType: BlockType.COND,
      conditionOperator: 'EQUAL',
      sRegex: '',
      conditionalFieldValueCtrl: null,
      targetInfo: '',
      blockDesc: '',
      objectType: lookupData.fieldLookupConfig.moduleId,
      childs: []
    }
  }

  /**
   * Method to set the regex value in form control
   * @param event pass the event
   */
  setRegex(event) {
    const selectedRegex = this.preDefinedRegex.find(item => item.FUNC_TYPE === event.value);
    this.form.controls.regex.setValue(selectedRegex.FUNC_CODE);
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

  /**
   * method to set the comparison value
   * @param value pass the value to set
   * @param index pass the index
   */
  setComparisonValue(value: string | { start: string; end: string; }, index: number) {
    console.log('Comparision value for parent', value, index);
    const array = this.udrNodeArray().at(index);
    if (typeof value === 'object') {
      if (typeof value === 'object' && (value as any).fieldId) {
        array.get('targetInfo').setValue(TragetInfo.FIELD);
        array.get('conditionFieldValue').setValue((value as any).fieldId);
        array.get('conditionValueFieldId').setValue((value as any).fieldId);
        array.get('conditionalFieldValueCtrl').setValue(value);
      } else {
        array.get('conditionFieldStartValue').setValue(value.start);
        array.get('conditionValueFieldId').setValue('');
        array.get('conditionFieldEndValue').setValue(value.end);
        array.get('targetInfo').setValue(TragetInfo.VALUE);
      }
    } else {
      array.get('conditionFieldValue').setValue(value);
      array.get('conditionValueFieldId').setValue('');
      array.get('targetInfo').setValue(TragetInfo.VALUE);
    }
  }

  /**
   * method to set the comparison value for child
   * @param value pass the value
   * @param chldNode pass the child node
   * @param parentNode pass the parent node
   */
  setComparisonValueForChild(value: string | { start: string; end: string; }, chldNode: number, parentNode: number, subParentNode?: number) {
    console.log('Comparision value for child', value, chldNode, parentNode);
    const childArray = this.getChildAsControl(parentNode, subParentNode).at(chldNode);
    if (typeof value === 'object') {
      if (typeof value === 'object' && (value as any).fieldId) {
        childArray.get('conditionFieldValue').setValue((value as any).fieldId);
        childArray.get('conditionValueFieldId').setValue((value as any).fieldId);
        childArray.get('targetInfo').setValue(TragetInfo.FIELD);
        childArray.get('conditionalFieldValueCtrl').setValue(value);
      } else {
        childArray.get('conditionValueFieldId').setValue('');
        childArray.get('conditionFieldStartValue').setValue(value.start);
        childArray.get('conditionFieldEndValue').setValue(value.end);
        childArray.get('targetInfo').setValue(TragetInfo.VALUE);
      }
    } else {
      childArray.get('conditionFieldValue').setValue(value);
      childArray.get('conditionValueFieldId').setValue('');
      childArray.get('targetInfo').setValue(TragetInfo.VALUE);
    }
  }

  /**
   * Method to set range for child values for custom rule
   * @param value range value
   * @param rangeText range text
   * @param childObject pass the child object
   * @param parentIndex pas sthe parent's index
   */
  setRangeValueForChild(value, rangeText, childObject, parentIndex) {
    const childArray = this.getChildAsControl(parentIndex).at(childObject);
    if (rangeText === 'start') {
      childArray.get('conditionFieldStartValue').setValue(value);
    }
    if (rangeText === 'end') {
      childArray.get('conditionFieldEndValue').setValue(value);
    }
  }

  /**
   * get available condition string
   */
  getConditions() {
    return ['And', 'Or']
  }

  /**
   * method to set range values
   * @param value pass the value
   * @param rangeText pass the range text
   * @param parentBlockIndex Pass the parent block index
   */
  setRangeValue(value, rangeText, parentBlockIndex) {
    const control = this.udrNodeArray().at(parentBlockIndex);
    if (rangeText === 'start') {
      control.get('conditionFieldStartValue').setValue(value);
    }
    if (rangeText === 'end') {
      control.get('conditionFieldEndValue').setValue(value);
    }
  }

  /**
   * Get all categories from the api
   */
  getCategories() {
    this.schemaDetailsService.getAllCategoryInfo().subscribe((response: CategoryInfo[]) => {
      if (response && response.length > 0) {
        this.categoryList = response;
        if (this.form) {
          this.form.controls.categoryId.setValue(this.form.value.categoryId);
        }
      }
    })
  }

  /**
   * format label for autoselect
   * @param value pass the selected value
   */
  formatLabel(value) {
    return `${value}`;
  }

  /**
   * Set transformation data output from Transformation rule to business rule form
   * @param transformationData pass transformation data
   */
  setTransformationFormData(transformationData: TransformationFormData) {
    const {
      sourceFld,
      excludeScript,
      includeScript,
      selectedTargetFields
    } = transformationData;
    this.form.controls.targetFld.setValue(selectedTargetFields.map(item => item.fieldId).join(','));
    if (sourceFld) { this.form.controls.sourceFld.setValue(sourceFld); };
    if (excludeScript) { this.form.controls.excludeScript.setValue(excludeScript); };
    if (includeScript) { this.form.controls.includeScript.setValue(includeScript); };
  }

  /**
   * Set lookup dtaa output to business rule form
   * @param lookupData pass lookup data
   */
  setLookupData(lookupData: LookupFields[]) {
    this.lookupData = lookupData;
  }

  setConstantRuleData(constData: ConstantRule[]) {
    if (this.selectedTransformationType === this.transformationType.CONSTANT) {
      this.transInfo = { constant: constData, type: this.selectedTransformationType.toLowerCase() };
    }
  }

  setZeroRuleData(zeroRuleData: ZeroRule) {
    if (this.selectedTransformationType === this.transformationType.ZERO) {
      this.transInfo = { zero: zeroRuleData, type: this.selectedTransformationType.toLowerCase() };
    }
  }

  setEmptySpaceRuleData(emptySpaceRuleData: EmptySpaceRule) {
    if (this.selectedTransformationType === this.transformationType.EMPTY) {
      this.transInfo = { empty_space: emptySpaceRuleData, type: this.selectedTransformationType.toLowerCase() };
    }
  }

  /**
   * modified the value to show
   * @param value pass the value object
   */
  displayFn(value) {
    return value ? value.fieldDescri : '';
  }

  /**
   * Setting form reference for duplicate rule
   * @param formRef pass th form reference
   */
  setDuplicateFormRef(formRef: FormGroup) {
    // console.log(formRef);
    this.duplicateFormRef = formRef;
  }

  /**
   * Setting form reference for web service call rule
   * @param formRef pass th form reference
   */
  setupWebServiceCallFormRef(formRef: FormGroup) {
    this.webServiceCallFormRef = formRef;
  }

  /**
   * Save the created suplicate rule
   */
  saveDuplicateRule() {
    const brInfo = {
      brId: this.brId,
      brIdStr: this.brId,
      brType: BusinessRuleType.BR_DUPLICATE_RULE,
      brInfo: this.form.value.rule_name,
      message: this.form.value.error_message,
      schemaId: this.schemaId,
      categoryId: this.coreSchemaBrInfo.categoryId,
      dependantStatus: this.coreSchemaBrInfo.dependantStatus || RuleDependentOn.ALL,
      order: this.coreSchemaBrInfo.order || 0,
      status: this.coreSchemaBrInfo.status || '1'
    } as CoreSchemaBrInfo;

    if (!this.duplicateFormRef.valid) {
      this.showValidationError('Please fill the required fields.');
      return;
    }

    const totalFieldsWeightage = this.duplicateFormRef.value.addFields.reduce((total, row) => {
      return total + Number(row.weightage);
    }, 0);

    if (!this.duplicateFormRef.get('addFields').value.length) {
      this.showValidationError('Please configure at least one field.');
      return;
    }
    if (totalFieldsWeightage !== 100) {
      this.showValidationError('The sum of the weightage assigned to fields on the slider must be exactly 100%');
      return;
    }


    if (this.duplicateFormRef.get('masterRules').value.find(rule => !Boolean(rule.coreSchemBrInfo?.isConfigured))) {
      this.showValidationError('Please configure all master rules!');
      return;
    }


    if (!this.duplicateFormRef.get('errWarLevels').value.length) {
      this.showValidationError('Please configure at least one error warning level!');
      return;
    }

    const model = new DuplicateRuleModel();
    model.coreBrInfo = { ...brInfo, brType: BusinessRuleType.BR_DUPLICATE_RULE };

    model.addFields = this.duplicateFormRef.value.addFields;
    model.mergeRules = this.duplicateFormRef.value.mergeRules;
    model.masterRules = this.duplicateFormRef.value.masterRules;
    model.selCriteria = this.duplicateFormRef.value.selCriteria;
    model.removeList = this.duplicateFormRef.value.removeList;
    model.errWarLevels = this.duplicateFormRef.value.errWarLevels;
    model.coreBrInfo.brWeightage = `${this.duplicateFormRef.value.brWeightage}`;

    const processBlocks = (blocklist: Array<any>): Array<UDRBlocksModel> => blocklist.map((block, ind) => ({
      id: block.id,
      udrid: block.udrid,
      conditionFieldId: block.preSelectedSourceFld,
      conditionValueFieldId: block.preSelectedTargetFld,
      conditionFieldValue: block.preSelectedTargetFld,
      conditionFieldStartValue: block.conditionFieldStartValue,
      conditionFieldEndValue: block.conditionFieldEndValue,
      blockType: block.condition,
      conditionOperator: block.operator,
      blockDesc: block.condition.toLowerCase(),
      objectType: this.moduleId || '',
      sRegex: block.regexCtrl,
      targetInfo: block.targetInfo,
      conditionFieldIdCtrl: block.sourceFldCtrl,
      childs: Array.isArray(block.childs) ? processBlocks(block.childs) : [],
      order: ind,
      sourceObjectType: block.sourceFldObjType,
      targetObjectType: (block.targetInfo === TragetInfo.VALUE) ? '' : this.moduleId,
    }));

    const blocks = processBlocks(this.duplicateFormRef.value.blocks);
    model.scope = [
      {
        when: blocks,
        then: []
      }
    ];
    const params = { objectId: this.moduleId, autoMerge: '', groupId: '' };

    this.schemaService.saveUpdateDuplicateRule(model, params).subscribe(res => {
      this.snackBar.open(`Successfully saved !`, 'Close', { duration: 5000 });
      console.log(res);
      this.sharedService.setAfterBrSave(res);
      this.close();
    }, error => {
      this.snackBar.open(`Something went wrong `, 'Close', { duration: 5000 });
    });

  }

  /**
   * Function to hide validation error
   * @param message: error message to display..
   */
  showValidationError(message: string) {
    this.validationError.status = true;
    this.validationError.message = message;
    setTimeout(() => {
      this.validationError.status = false;
    }, 3000)
  }

  /**
   * Update udr node fieldids .....
   * @param field selected field ctrl
   * @param controlIndex parent ctrl index
   * @param childElementCtrl child ctrl index ...
   */
  udrFieldSelectionChange(field: Metadata[], controlIndex: number, childElementCtrl?: number, subChildCtrlIndex?: number) {
    console.log('Update condition field', field, controlIndex, childElementCtrl, subChildCtrlIndex);
    if (subChildCtrlIndex !== undefined) {
      this.getChildAsControl(controlIndex, childElementCtrl).at(subChildCtrlIndex).get('conditionFieldId').setValue(field[0] ? field[0].fieldId : '');
    } else if (childElementCtrl !== undefined) {
      this.getChildAsControl(controlIndex).at(childElementCtrl).get('conditionFieldId').setValue(field[0] ? field[0].fieldId : '');
    } else {
      this.udrNodeArray().at(controlIndex).get('conditionFieldId').setValue(field[0] ? field[0].fieldId : '');
    }
    console.log(this.udrNodeArray());
  }

  /**
   * Open the side sheet for transformation rule library...
   */
  openTransRuleLib() {
    this.router.navigate(['', {
      outlets: {
        sb: `sb/schema/business-rule/${this.moduleId}/${this.schemaId}/${this.brId}`,
        outer: `outer/schema/businessrule-library/${this.moduleId}/${this.schemaId}/outer`
      }
    }], { queryParams: { t: true, s: this.transTabIndex === 0 ? 'success' : 'error' } });
  }

  /**
   * Get the transformation rules per rule id ...
   */
  getMappedTransformationRules() {
    this.schemaService.getMappedTransformationRules(this.brId, this.schemaId, 0, 100, '').subscribe(res => {
      this.attachedTransRules = res;
    }, error => console.error(`Exception : ${error.message}`));
  }

  /**
   * Update the business rule status based on configuration !!!
   * @param br update able busiess rule
   * @param tab either success || error
   * @param status checkbox status ....
   */
  updateTransStatus(br: TransformationMappingTabResponse, tab: string, status: boolean) {
    if (!this.attachedTransRules) { return; }

    if (tab === 'success') {
      const idx = this.attachedTransRules.success.findIndex(f => f.ruleInfo.brIdStr === br.ruleInfo.brIdStr);
      this.attachedTransRules.success[idx].isEnabled = status;
    } else {
      const idx = this.attachedTransRules.error.findIndex(f => f.ruleInfo.brIdStr === br.ruleInfo.brIdStr);
      this.attachedTransRules.error[idx].isEnabled = status;
    }
  }

  /**
   * Remove the trans rule from main rule ....
   * @param br removeable business rule
   * @param tab status eaither succes || error
   */
  removeTrans(br: TransformationMappingTabResponse, tab: string) {
    this.globalService.confirm({ label: 'Are you sure to delete ?' }, (s) => {
      if (s === 'yes') {
        if (tab === 'success') {
          const idx = this.attachedTransRules.success.findIndex(f => f.ruleInfo.brIdStr === br.ruleInfo.brIdStr);
          this.attachedTransRules.success.splice(idx, 1);
        } else {
          const idx = this.attachedTransRules.error.findIndex(f => f.ruleInfo.brIdStr === br.ruleInfo.brIdStr);
          this.attachedTransRules.error.splice(idx, 1);
        }
      }
    });

  }

  /**
   * Create new business rules ...
   */
  openBusinessRuleSideSheet() {
    console.log(this.activatedRouter.url);
    /* this.router.navigate([`sb3:sb3/schema/business-rule/${this.moduleId}/${this.schemaId}/new/sb3`],
    {queryParams:{r:'BR_TRANSFORMATION'}, relativeTo: this.activatedRouter}); */
    /* this.router.navigateByUrl(`../(sb3:sb3/schema/business-rule/${this.moduleId}/${this.schemaId}/new/sb3)`,
    {queryParams:{r:'BR_TRANSFORMATION'}, relativeTo: this.activatedRouter}); */
    this.router.navigate(['', { outlets: { sb3: `sb3/schema/business-rule/${this.moduleId}/${this.schemaId}/new/sb3` } }],
      { queryParams: { r: 'BR_TRANSFORMATION' } });
  }

  /**
   * Get the all trans rule from lib...
   */
  getTransRules(searchStr?: string) {
    this.schemaService.transformationRules(this.moduleId, 0, 100, searchStr ? searchStr : '').subscribe(rules => {
      this.transformationRules = rules;
    }, err => console.error(`Execption : ${err.message}`));
  }

  /**
   * Add the business rule inside the tabs ...
   * @param rule adable rule ....
   * @param tab add rule based on this tab ... status
   */
  addTransRule(rule: CoreSchemaBrInfo, tab: string) {
    if (tab === 'success') {
      const idx = this.attachedTransRules.success.findIndex(f => f.ruleInfo?.brIdStr === rule.brIdStr);
      if (idx === -1) {
        this.attachedTransRules.success.push({ isConfigured: false, isEnabled: false, ruleInfo: rule });
      } else {
        this.transientService.open('Rule already added ', 'ok', { duration: 2000 });
      }
    } else {
      const idx = this.attachedTransRules.error.findIndex(f => f.ruleInfo?.brIdStr === rule.brIdStr);
      if (idx === -1) {
        this.attachedTransRules.error.push({ isConfigured: false, isEnabled: false, ruleInfo: rule });
      } else {
        this.transientService.open('Rule already added ', 'ok', { duration: 2000 });
      }
    }

  }

  /**
   * Reorder the rule ...
   * @param event br that going to be reordered
   * @param tab based on this will append over there...
   */
  reorderTrans(event: CdkDragDrop<CoreSchemaBrInfo>, tab: string) {
    if (tab === 'success') {
      moveItemInArray(this.attachedTransRules.success, event.previousIndex, event.currentIndex);
    } else {
      moveItemInArray(this.attachedTransRules.error, event.previousIndex, event.currentIndex);
    }

  }

  /**
   * Search the transformation rule ...
   * @param searchStr search the rule based on this params
   */
  searchTransRules(searchStr: string) {
    this.delayedCallWithTransLib(searchStr);
  }

  /**
   * Edit the exiting transformation....
   */
  editTransRule(br: TransformationMappingTabResponse, tab: string) {
    this.router.navigate(['', { outlets: { sb3: `sb3/schema/business-rule/${this.moduleId}/${this.schemaId}/${br.ruleInfo?.brIdStr}/sb3` } }],
      { queryParams: { r: 'BR_TRANSFORMATION' } });
  }

  /**
   * Add the trans rules from library ...
   * @param res from side sheet
   */
  addTransRules(res: CoreSchemaBrInfo[]) {
    res = Array.isArray(res) ? res : [res];
    if (!this.attachedTransRules) { return; };

    if (this.transTabIndex === 0) {
      res.forEach(r => {
        const isExits = this.attachedTransRules.success.some(s => s.ruleInfo?.brIdStr === r.brIdStr);
        if (!isExits) {
          this.attachedTransRules.success.push({
            isConfigured: false,
            isEnabled: false,
            ruleInfo: r
          });
        }
      });
    } else {
      res.forEach(r => {
        const isExits = this.attachedTransRules.error.some(s => s.ruleInfo?.brIdStr === r.brIdStr);
        if (!isExits) {
          this.attachedTransRules.error.push({
            isConfigured: false,
            isEnabled: false,
            ruleInfo: r
          });
        }
      });
    }
  }


  /**
   * Search the rules based on searchStrig and moduleId
   * @param searchString search the rules by text ....
   */
  getApisRule(searchString: string, prefer?: string) {
    this.schemaService.getApisRule(this.moduleId, searchString, 0, 10, prefer).subscribe(res => {
      this.apiRules = res ? res : [];
      if (prefer) {
        this.form.controls.apiSno.patchValue(this.coreSchemaBrInfo.apiSno);
      }
    }, err => console.error(`Error : ${err.message}`));
  }

  /**
   * function to display rule desc in mat auto complete
   */
  displayApisRuleFn(value?: string) {
    return value ? this.apiRules.find(rule => rule.sno === value)?.description : '';
  }

  searchApisRules(val: string) {
    this.delayedCallForApis(val);
  }

  /**
   * function to set selected operator value in the form field
   */
  udrOperatorSelected(condition: FormControl, $event) {
    condition.setValue($event.option.value);
  }

  /**
   * function to fitler operator list in auto complete
   */
  filterOperator(value: string) {
    value = (value?.replace(/\s/g, '_') || '').toLowerCase();
    this.operatorsFiltered = this.operators.map(operator => ({
      ...operator,
      childs: operator.childs.filter(child => child.toLowerCase().includes(value))
    }))
      .filter(operator => operator.childs.length);
  }

  /**
   * function to display formatted value in auto complete field
   */
  displayOperatorFn(child?: string) {
    // return value === 'EQUALS' ? 'EQUAL' : value?.replace(/_/g, ' ') || '';
    if (child === 'EQUAL') { return 'EQUALS' }
    if (child === 'LENGTH_GREATER_THEN') { return 'LENGTH GREATER THAN' }
    if (child === 'LENGTH_LESS_THEN') { return 'LENGTH LESS THAN' }
    return child ? child.replace(/_/g, ' ') : '';
  }

  /**
   * update parent blocks block type
   * @param event new block type
   */
  updateBlocksType(event) {
    this.udrNodeArray().controls.forEach(ctrl => {
      ctrl.get('blockType').setValue(event.value);
    });
  }

  /**
   * update childs block desc
   * @param event new block desc
   * @param parentIndex root parent block index
   * @param subParentIndex sub parent block index
   */
  updateBlocksDesc(event, parentIndex: number, subParentIndex?: number) {
    const childs = this.getChildAsControl(parentIndex, subParentIndex);
    childs.controls.forEach(ctrl => {
      ctrl.get('blockDesc').setValue(event.value);
      ctrl.get('blockType').setValue(event.value);
    })
  }

  setLookupRuleData(ev) {
    if (ev) {
      this.saveRule = false;
      if ((ev.data && this.selectedTransformationType === TransformationRuleType.LOOKUP) || (ev.data && this.form.controls.rule_type.value === BusinessRuleType.BR_LOOKUP_RULE)) {
        this.transInfo = {
          lookup: {
            type: ev.data.lookupRuleMetadata.lookupType,
            lookupRuleMetadata: {
              lookupDataset: ev.data.lookupRuleMetadata.lookupDataset,
              lookupType: ev.data.lookupRuleMetadata.lookupType,
              sno: this.coreSchemaBrInfo?.lookupRuleMetadata?.lookupStr
            },
            udrData: ev.data.udrData
          },
          type: this.selectedTransformationType.toLowerCase(),
        };
        if (this.lookupRuleComponent.lookupForm.valid) {
          this.save();
        }
      }
    }
  }

  /**
   * updates field list based on search string from api for the udr block hierarchy
   * @param ev output event that contains search string and update list type
   */
  updateUDRFldList(ev) {
    if (typeof (ev?.searchString) !== 'string') {
      return;
    };
    this.coreService.getMetadataFieldsByModuleId([this.moduleId], ev.searchString).subscribe((res) => {
      // const fieldsList = [];
      // Object.keys(res).forEach((moduleId) => {
      //   const moduleFields = res[moduleId];
      //   Object.keys(moduleFields).forEach((fldType) => {
      //     Object.keys(moduleFields[fldType]).forEach((fld) => {
      //       fieldsList.push(moduleFields[fldType][fld]);
      //     });
      //   });
      // });
      // this.fieldsList = fieldsList;
      // this.fieldListFiltered=  [{
      //   fieldDescri: 'Header fields',
      //   fieldId: 'header_fields',
      //   isGroup: true,
      //   childs: this.fieldsList
      // }];
      this.parseMetadataModelResponse(res);
    }, error => {
      console.error('Error while getting field list', error);
    });
  }

  /*
   * method to create formControl
   */
  createClassicForm(dRule?: DescriptionRule) {
    this.classicForm = new FormGroup({
      shortDescription: new FormControl(dRule ? this.setOtherClassificationFields(dRule.shortDescription, 'shortDescription') : ''),
      longDescription: new FormControl(dRule ? this.setOtherClassificationFields(dRule.longDescription, 'longDescription') : ''),
      nounField: new FormControl(dRule ? this.setOtherClassificationFields(dRule.nounField, 'nounField') : ''),
      descSetField: new FormControl(''),
    });
  }

  initRuleForm() {
    this.ruleSettingForm = this.formBuilder.group({
      frmArray: this.formBuilder.array([this.formBuilder.group({
        tableName: new FormControl(''),
        descType: new FormControl(''),
        descField: new FormControl(''),
        langField: new FormControl('')
      })
      ])
    });
  }

  /**
   * method to add new rule settings...
   */
  addNewRule() {
    const parentArray = (this.ruleSettingForm.get('frmArray') as FormArray);
    parentArray.push(this.blockCtrlRule());
  }

  /**
   * Initialize block formgroup
   */
  blockCtrlRule(): FormGroup {
    return this.formBuilder.group({
      tableName: new FormControl(''),
      descType: new FormControl(''),
      descField: new FormControl(''),
      langField: new FormControl('')
    });
  }

  /**
   * Remove rule setting
   * @param index removeable index
   */
  removeRuleSetting(index: number) {
    const frmArray = this.ruleSettingForm.get('frmArray') as FormArray
    frmArray.removeAt(index);
  }

  /**
   * method to open condition sidesheet
   */
  addNewCondition() {
    if (this.selectedDescSettingsOptions?.length) {
      this.schemaService.currentDescFieldValues.next(this.selectedDescSettingsOptions);
      if (this.router.url.includes('schema/check-data')) {
        this.router.navigate(['', {
          outlets: {
            sb: `sb/schema/check-data/${this.moduleId}/${this.schemaId}`,
            outer: `outer/schema/business-rule/${this.moduleId}/${this.schemaId}/${this.brId || this.coreSchemaBrInfo.brId || 'new'}/outer`,
            sb3: `sb3/schema/business-rule/new-condition/${this.moduleId}/${this.schemaId}/${this.brId || this.coreSchemaBrInfo.brId || 'new'}/sb3`
          }
        }]);
      } else if (this.router.url.includes('list/dataset-settings')) {
        this.router.navigate(['', {
          outlets: {
            sb: `sb/list/dataset-settings/${this.moduleId}/business-rule/${this.moduleId}`,
            outer: `outer/schema/business-rule/${this.moduleId}/new/new/outer`,
            sb3: `sb3/schema/business-rule/new-condition/${this.moduleId}/new/new/sb3`
          }
        }]);
      } else if (this.router.url.includes('schema/business-rule')) {
        this.router.navigate(['', {
          outlets: {
            sb: `sb/list/dataset-settings/${this.moduleId}/business-rule/${this.moduleId}`,
            outer: `outer/schema/business-rule/${this.moduleId}/null/${this.brId}/outer`,
            sb3: `sb3/schema/business-rule/new-condition/${this.moduleId}/${this.schemaId}/${this.brId || this.coreSchemaBrInfo.brId || 'new'}/sb3`
          }
        }]);
      }
    }
  }

  selectedDescSettings(event) {
    if (this.selectedDescSettingsOptions.length < 2) {
      const selectIndex = this.selectedDescSettingsOptions.findIndex((item) => item.fieldId === event.option.value.fieldId);
      if (selectIndex === -1) {
        this.selectedDescSettingsOptions.push(event.option.value);
      }
    } else {
      this.descValidationError = 'You can not maintain more than 2 fields for defining the description settings.';
    }
    this.checkConditionDesc();
    this.classicForm.controls.descSetField.setValue(null);
  }

  removeDescSetting(option) {
    const index = this.selectedDescSettingsOptions.indexOf(option);
    if (index >= 0) {
      this.selectedDescSettingsOptions.splice(index, 1);
    }
    this.checkConditionDesc();
    this.descValidationError = '';
  }

  /**
   * Get parent node array .
   */
  classificatiobNodeArray(): FormArray {
    return this.ruleSettingForm.get('frmArray') as FormArray
  }

  checkConditionDesc() {
    if(this.storeClassificationTable.length == 0){
      this.conditonSidesheet = true;
      this.tableConditionError = '';
    }

    this.storeClassificationTable.forEach(storeData => {
      if (storeData.brType === BusinessRuleType.BR_CLASSIFICATION_RULE) {
        const descRule = storeData.descriptionRule?.descSetField;
        const containsAll = this.selectedDescSettingsOptions.every(ele => {
          return descRule?.includes(ele);
        });
        if (containsAll) {
          this.conditonSidesheet = true;
          this.tableConditionError = '';
        } else {
          this.conditonSidesheet = false;
          this.tableConditionError = 'All classification rules defined for the dataset must use same fields for description settings. Fields for description settings conflict with rule ' + this.coreSchemaBrInfo.brInfo + ' , using fields ' + descRule.join(',');
        }
      } else {
        this.conditonSidesheet = true;
        this.tableConditionError = '';
      }
    });

    if (!this.selectedDescSettingsOptions.length) {
      this.conditonSidesheet = false;
      this.tableConditionError = '';
    }

    // if (this.coreSchemaBrInfo && this.coreSchemaBrInfo?.descriptionRule && this.selectedDescSettingsOptions.length) {
    //   const descRule = this.coreSchemaBrInfo.descriptionRule?.descSetField;
    //   // const descRule = ['Value1','Value2']
    //   const containsAll = this.selectedDescSettingsOptions.every(ele => {
    //     return descRule.includes(ele);
    //   })
    //   if(containsAll) {
    //     this.conditonSidesheet = true;
    //     this.tableConditionError = '';
    //   } else {
    //     this.conditonSidesheet = false;
    //     this.tableConditionError = 'All classification rules defined for the dataset must use same fields for description settings. Fields for description settings conflict with rule '+ this.coreSchemaBrInfo.brInfo +' , using fields '+ descRule.join(',');
    //   }
    // } else {
    //   this.conditonSidesheet = true;
    //   this.tableConditionError = '';
    // }
  }

  /**
   * method to get table description field
   */
  getTableNameFields() {
    const requestDTO = {
      description: '',
      pickList: '15'
    };
    // const moduleId = 600;
    this.coreService.tableDescFields(0, 50, requestDTO, this.moduleId, this.locale).subscribe((res: any) => {
      this.tableNameOptions = res ? res?.pickListField : [];
    },
      (error) => {
        console.error(`Error : ${error.message}`);
      });
  }

  gridColumnsLanguage(gridField: string, index: number, searchTerm: string) {
    this.coreService.getGridColumns(0, 50, gridField, this.moduleId, this.locale, searchTerm).subscribe((res: any) => {
      this.languageFieldsOptions[index] = res ? res.childfields : [];
    },
      (error) => {
        console.error(`Error : ${error.message}`);
      });
  }

  gridColumnsDescField(gridField: string, index: number, searchTerm: string) {
    this.coreService.getGridColumns(0, 50, gridField, this.moduleId, this.locale, searchTerm).subscribe((res: any) => {
      this.tableDescFieldsOptions[index] = res ? res.childfields : [];
    },
      (error) => {
        console.error(`Error : ${error.message}`);
      });
  }

  tableNameSelected(event: any, index: number) {
    const gridField = event.option.value.fieldId;
    (this.ruleSettingForm.get('frmArray') as FormArray).at(index).get('langField').setValue('');
    (this.ruleSettingForm.get('frmArray') as FormArray).at(index).get('descField').setValue('');
    this.tableDescFieldsOptions[index] = [];
    this.languageFieldsOptions[index] = [];
    this.gridColumnsDescField(gridField, index, '');
    this.gridColumnsLanguage(gridField, index, '');
  }

  languageSearching(event, index) {
    const gridField = (this.ruleSettingForm.get('frmArray') as FormArray).at(index).get('tableName').value;
    this.gridColumnsLanguage(gridField.fieldId, index, event);
  }

  descFieldSearching(event, index) {
    const gridField = (this.ruleSettingForm.get('frmArray') as FormArray).at(index).get('tableName').value;
    this.gridColumnsDescField(gridField.fieldId, index, event);
  }

  displayDescData(opt) {
    const type = typeof (opt);
    if (opt && type === 'string') {
      return opt;
    } else {
      return opt ? opt.description : null;
    }
  }

  getDescFields() {
    this.coreService.getMetadataFieldsByModuleId([this.moduleId]).subscribe((data: MetadataModeleResponse) => {
      const fieldList = []
      const keys = Object.keys(data.headers);
      keys.forEach((key) => {
        fieldList.push(data.headers[key]);
      });
      this.descSettingsField = fieldList;
      this.proposeNounField = fieldList;
      this.initialMetaClassic = fieldList;
      this.shortDescList = this.getShortDescFields(fieldList);
      this.longDescList = this.getLongDescFields(fieldList);
      if (this.coreSchemaBrInfo.brId) {
        this.setClassificationRuleData(this.coreSchemaBrInfo);
      }
    }, (error) => {
      console.error(`Error : ${error.message}`);
    });
  }

  /**
   * Get description...
   * @param data get current module
   */
  displayWithProposeNoun(data: any): string {
    return data ? data.description : '';
  }

  getShortDescFields(headerList) {
    const fieldList = [];
    headerList.forEach((key) => {
      if ((key?.pickList === '0') && key?.isDescription) {
        fieldList.push(key);
      }
    });
    return fieldList;
  }

  getLongDescFields(headerList) {
    const fieldList = [];
    headerList.forEach((key) => {
      if (key?.pickList === '0') {
        fieldList.push(key);
      }
    });
    return fieldList;
  }

  get disableSaveForClassificationAndAutoExtension(){
    if((this.form.controls.rule_type.value === BusinessRuleType.BR_CLASSIFICATION_RULE)){
      if(this.tableData2.length>0) return false;
      else return true;
    } else if((this.form.controls.rule_type.value === BusinessRuleType.AUTO_EXTENSION_RULE)){
      return !this.autoExtensionFormGroup.value?.autoExeInfo?.payload?.conditions?.length;
    } else if(this.form.controls.rule_type.value === BusinessRuleType.BR_CROSS_DATASET_RULE) {
      return !this.crossDatasetFormGroup.value?.crossDatasetId?.uuid;
    }
    else{
      return false;
    }
  }
}
