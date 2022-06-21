import { Component, OnInit, Inject, ViewChild, ElementRef, ComponentFactoryResolver, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import {
    MatDialogRef,
    MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { BlocksList, BusinessRuleType, CoreSchemaBrInfo, DR_CHILD_RULES, DR_CHILD_TIEBREAKER_RULES, PRE_DEFINED_REGEX, RULE_TYPES, TransformationModel, TransformationRuleType, UDRBlocksModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MetadataModeleResponse, CategoryInfo, FieldConfiguration, TransformationFormData, LookupFields } from '@models/schema/schemadetailstable';
import { of, Observable, Subject } from 'rxjs';
import { startWith, map, distinctUntilChanged } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Regex } from '@modules/admin/_components/module/business-rules/regex-rule/regex-rule.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlockType } from '@modules/report/_models/widget';
import { CONDITIONS } from 'src/app/_constants/brrule';
import { TransformationRuleComponent } from '@modules/shared/_components/transformation-rule/transformation-rule.component';
import { ValidationError } from '@models/schema/schema';
import { TransientService } from 'mdo-ui-library';
import { ContainerRefDirective } from '@modules/shared/_directives/container-ref.directive';
import { SetupDuplicateRuleComponent } from '../v2/brrule-side-sheet/duplicate-rule-config/setup-duplicate-rule/setup-duplicate-rule.component';
import { TragetInfo } from 'src/app/_constants';

class ConditionalOperator {
    desc: string;
    childs: string[];
}

@Component({
    selector: 'pros-new-business-rules',
    templateUrl: './new-business-rules.component.html',
    styleUrls: ['./new-business-rules.component.scss']
})
export class NewBusinessRulesComponent implements OnInit, AfterViewInit {

    /**
     * main rule form
     */
    form: FormGroup;

    /**
     * hold the form controls in this variable
     */
    currentControls: any = {};

    /**
     * all available business rules
     */
    businessRuleTypes: BusinessRules[] = RULE_TYPES;

    /**
     * Pre defined regex for regex rule
     */
    preDefinedRegex: Regex[] = PRE_DEFINED_REGEX;

    /**
     * current rule
     */
    currentSelectedRule: string;

    /**
     * Lookup data from transformation rule component
     */
    lookupData: LookupFields[] = [];

    /**
     * List of fields
     */
    fieldsList = [];
    fieldsListFiltered = [];
    initialFieldList = [];

    /**
     * observable for autocomplete
     */
    filteredModules: Observable<{} | string | void> = of([]);

    /**
     * observable to autocomplete target fields
     */
    targetFieldModules: Observable<{} | string | void> = of([]);

    /**
     * array to save the selected fields
     */
    selectedFields = [];

    /**
     * array to store the selected target fields
     */
    selectedTargetFields = [];

    /**
     * target fields for transformation rule
     */
    targetFieldsObject: FieldConfiguration = {
        list: [],
        labelKey: '',
        valueKey: ''
    }

    /**
     * source fields for transformation rule
     */
    sourceFieldsObject: FieldConfiguration = {
        list: [],
        labelKey: '',
        valueKey: ''
    }

    /**
     * list of event to consider as selection
     */
    separatorKeysCodes: number[] = [ENTER, COMMA];

    /**
     * Hold the list of UDR conditional Operators
     */
    operators = [];
    operatorsFiltered = [];

    /**
     * hold the form submitted state in order
     * to share it with another child component
     */
    submittedEmitter = new Subject();
    _submitted = false;
    get submitted() {
        return this._submitted;
    }
    set submitted(val) {
        this._submitted = val;
        this.submittedEmitter.next(val);
    }

    /* To access properties of Child for validation purpose
     */
    @ViewChild(TransformationRuleComponent) transformationRuleComponent: TransformationRuleComponent;

    /**
     * Available conditions
     */
    initialConditions = ['And', 'Or'];

    /**
     * List of categories
     */
    categoryList: CategoryInfo[] = [];

    /**
     * UDR object model
     */
    udrBlocks: UDRBlocksModel[] = [{
        id: Math.floor(Math.random() * 1000000000000).toString(),
        udrid: null,
        blockDesc: 'When',
        blockType: BlockType.AND,
        conditionFieldId: '', // field id from dropdown
        sRegex: '',
        objectType: '',
        conditionOperator: '', // operator value
        conditionValueFieldId: '', // comparison value
        conditionFieldValue: '',
        conditionFieldStartValue: '',
        conditionFieldEndValue: '',
        childs: []
    }];
    udrNodeForm: FormGroup;
    udrBlockList: BlocksList = {
        blocksList: [],
        datasetList: []
    };
    fieldControl = new FormControl();
    tempRuleId: string;

    /**
     * transformation rule type list
     */
    transRuleTypeList = [{ value: this.transformationType.REGEX, key: this.transformationType.REGEX }, { value: this.transformationType.LOOKUP, key: this.transformationType.LOOKUP }];

    /**
     * Transformation Data model
     */
    transformationData: TransformationFormData;

    /**
     * Existing transformation schema used to
     * patch transformation rule for Regex
     */
    transformationSchema: TransformationModel;

    /**
     * Existing transformation schema used to
     * patch transformation rule for Lookup
     */
    transformationLookUpData: LookupFields[] = [];
    maxWeightageLimit: number;

    /**
     * hold duplicate rule form reference
     */
    duplicateFormRef: FormGroup;
    /**
     * hold Web service call rule form reference
     */
    webServiceCallFormRef: FormGroup;
    /**
     * reference to the input
     */
    @ViewChild('fieldsInput') fieldsInput: ElementRef;

    /**
     * reference to target field search input
     */
    @ViewChild('targetFieldsInput') targetFieldsInput: ElementRef;

    /**
     * Hold the duplicacy rule data here
     */
    duplicacyRuleData: CoreSchemaBrInfo = new CoreSchemaBrInfo();

    /**
     * To hold information about validation error.
     */
    validationError: ValidationError = {
        status: false,
        message: ''
    }

    /**
     * Hold search string for business rule type ....
     */
    searchRuleTypeStr = '';

    /**
     * Holds search string for source field dropdown
     */
    searchSourceFieldStr = '';

    /**
     * Hold search string for regex functions ....
     */
    searchRegexFunctionStr = '';
    /**
     * While edit hold br information ..
     */
    coreSchemaBrInfo: CoreSchemaBrInfo = new CoreSchemaBrInfo();

    saveRule = false;

    /**
     * Class contructor
     * @param snackBar refernce to matSnackbar
     * @param dialogRef refernce to matdialog
     * @param data data recieved from parent
     * @param schemaDetailsService service class
     */
    constructor(
        private dialogRef: MatDialogRef<Component>,
        @Inject(MAT_DIALOG_DATA) public data,
        private schemaDetailsService: SchemaDetailsService,
        private snackBar: MatSnackBar,
        private toastService: TransientService,
        private componentFactoryResolver: ComponentFactoryResolver
    ) { }

    /**
     * get transformation type
     */
    get transformationType() {
        return TransformationRuleType;
    }

    /**
     * get selected transformation type
     */
    get selectedTransformationType() {
        if (this.form && this.form.controls) {
            return this.form.controls.transformationRuleType.value;
        }
        return '';
    }

    @ViewChild('containerRef') containerRef: ContainerRefDirective;

    /**
     * Angular hook
     */
    ngOnInit(): void {
        this.filterRuleTypes();
        // initialize form Object
        this.initializeForm();

        this.operators = this.possibleOperators();
        this.getCategories();

        if (this.data) {
            this.maxWeightageLimit = this.data.maxWeightageLimit;
            if(!this.fieldsList.length && this.data?.fields?.length)
                this.fieldsList = this.data?.fields;
                this.initialFieldList = [{
                    fieldDescri: 'Header fields',
                    fieldId: 'header_fields',
                    isGroup: true,
                    childs: [...this.fieldsList]
                }];
            this.updateUDRFldList();
        }
        // Patch data if working with existing business rule
        if (this.data && this.data.createRuleFormValues) {
            this.tempRuleId = (this.data && this.data.tempId) ? this.data.tempId : '';

            // destructure the received business rule data for patching
            const {
                rule_type,
                rule_name,
                error_message,
                standard_function,
                regex,
                fields,
                apiKey,
                weightage,
                categoryId,
                transFormationSchema,
                duplicacyRuleData,
                accuracyScore,
                source_field,
                target_field,
                lookupRuleMetadata,
                udrData } = this.data.createRuleFormValues;
                this.coreSchemaBrInfo = this.data.createRuleFormValues;
            const udrTreeData = udrData;
            // handle existing transformation data separately
            this.patchTransformationFormData(transFormationSchema);

            // handle existing Duplicacy data separately
            this.patchDuplicacyData(duplicacyRuleData);

            // Path the form object with existing values
            this.form.patchValue({
                rule_type,
                rule_name,
                error_message,
                apiKey,
                standard_function,
                regex,
                fields,
                weightage,
                categoryId,
                transformationRuleType: this.getTrRuleType(transFormationSchema),
                accuracyScore,
                source_field,
                target_field
            });

            // setting value for rule type single select dropdown
            this.searchRuleTypeStr = rule_type;
            // setting value for source field single select dropdown
            this.searchSourceFieldStr = source_field;

            // Disable the rule type field on patch
            this.form.controls.rule_type.disable();
            // Handle existing UDR data
            if (udrTreeData && udrTreeData.when) {
                this.udrNodeForm = new FormGroup({
                    blocks: new FormArray([])
                });
                this.udrBlockList = {
                    ...this.udrBlockList,
                    blocksList: udrTreeData.when || []
                };
            }
        } else {
            // setting missing rule as default rule
            // this.form.controls.rule_type.setValue(BusinessRuleType.BR_MANDATORY_FIELDS);
            this.searchRuleTypeStr = this.form.controls.rule_type.value;
        }

        if (this.data && this.data.moduleId) {
            this.getFieldsByModuleId();
        } else {
            // Patch selected fields here
            this.patchSelectedFields();
        }

        // Initializing autocomplete
        this.initiateAutocomplete();
    }

    ngAfterViewInit(): void {
        if (this.data.createRuleFormValues?.rule_type === BusinessRuleType.BR_DUPLICATE_RULE) {
            this.createDuplicateComponent(this.data.createRuleFormValues.rule_type);
        }
    }

    /**
     * Removes untested rule types
     */
    filterRuleTypes() {
        const testedTypes = ['BR_METADATA_RULE', BusinessRuleType.BR_SAP_CHECK_CODE_RULE, BusinessRuleType.DAXE, 'BR_MANDATORY_FIELDS', 'BR_REGEX_RULE', 'BR_CUSTOM_SCRIPT', 'BR_DUPLICATE_CHECK', 'MRO_MANU_PRT_NUM_LOOKUP', 'MRO_CLS_MASTER_CHECK', 'MRO_MANU_PRT_NUM_IDENTI', 'BR_LOOKUP_RULE'];
        this.businessRuleTypes = this.businessRuleTypes.filter((x) => testedTypes.includes(x.ruleType));
    }

    /**
     * Patch transformation form data
     * @param transformationSchema transformation rule details to be passed
     */
    patchTransformationFormData(transformationSchema: TransformationModel[]) {
        const currentType = this.getTrRuleType(transformationSchema);
        this.form.controls.transformationRuleType.setValue(currentType);
        if (currentType === this.transformationType.REGEX) {
            if(transformationSchema && transformationSchema.length>0){
                const data: TransformationModel = transformationSchema[0];
                const { excludeScript, includeScript, sourceFld, targetFld, transformationRuleType, udrBlockModel } = data;
                this.transformationData = {
                    excludeScript,
                    includeScript,
                    sourceFld,
                    targetFld,
                    parameter: udrBlockModel
                    // selectedTargetFields: []
                }
            }
        }
        if (currentType === this.transformationType.LOOKUP) {
            if(transformationSchema && transformationSchema.length>0) {
                const lookupFields: LookupFields[] = [];
                transformationSchema.map((schema) => {
                    lookupFields.push({
                        enableUserField: false,
                        fieldDescri: '',
                        fieldId: schema.sourceFld,
                        fieldLookupConfig: {
                            lookupColumn: schema.udrBlockModel.conditionFieldId,
                            lookupColumnResult: schema.udrBlockModel.conditionValueFieldId,
                            moduleId: schema.udrBlockModel.objectType
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
    }

    /**
     * Get all categories from the api
     */
    getCategories() {
        this.categoryList = [];
        this.schemaDetailsService.getAllCategoryInfo().subscribe((response) => {
            this.categoryList.push(...response)
        })
    }

    /**
     * Initialize the form object and...
     * subscribe to any required control value changes
     */
    initializeForm() {
        const controls = {
            rule_type: new FormControl('', [Validators.required]),
            rule_name: new FormControl('', [Validators.required]),
            error_message: new FormControl('', [Validators.required]),
            daxe: new FormControl('', [Validators.required]),
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
            categoryId: new FormControl(''),
            transformationRuleType: new FormControl(''),
            accuracyScore: new FormControl(0),
            source_field: new FormControl(''),
            target_field: new FormControl('')
        };

        this.currentControls = controls;
        this.form = new FormGroup(controls);
        // console.log(this.form)
        // Apply conditional validation based on rule type
        this.form.controls.rule_type.valueChanges
            .pipe(distinctUntilChanged())
            .subscribe((selectedRule) => {
                if (selectedRule) {
                    this.applyValidatorsByRuleType(selectedRule);
                }
            });
        this.form.controls.transformationRuleType.valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                this.applyValidatorsByRuleType(this.form.controls.rule_type.value);
            });
        this.udrNodeForm = new FormGroup({
                blocks: new FormArray([])
        });
    }

    /**
     * function to return formField
     */
    formField(field: string) {
        return this.form.get(field);
    }
    /**
     * function to get the fields on basis of module
     */
    getFieldsByModuleId() {
        this.schemaDetailsService.getMetadataFields(this.data.moduleId)
            .subscribe((metadataModeleResponse: MetadataModeleResponse) => {
                const keys = Object.keys(metadataModeleResponse.headers);
                keys.forEach((key) => {
                    this.fieldsList.push(metadataModeleResponse.headers[key])
                });
                if (this.data && this.data.createRuleFormValues && this.data.createRuleFormValues.fields) {
                    this.patchFieldvalues(this.data.createRuleFormValues.fields);
                }
                this.targetFieldsObject = {
                    labelKey: 'fieldDescri',
                    valueKey: 'fieldId',
                    list: this.fieldsList
                }
                this.sourceFieldsObject = {
                    labelKey: 'fieldDescri',
                    valueKey: 'fieldId',
                    list: this.fieldsList
                }
            });
    }


    /**
     * Patch the selected excel field values
     */
    patchSelectedFields() {
        this.fieldsList = [];
        this.createDSByFields().then(() => {
            if (this.data && this.data.createRuleFormValues && this.data.createRuleFormValues.fields) {
                this.patchFieldvalues(this.data.createRuleFormValues.fields);
            }
            if (this.data && this.data.createRuleFormValues && this.data.createRuleFormValues.target_field) {
                this.patchTargetFieldValues(this.data.createRuleFormValues.target_field);
            }
        });
    }

    /**
     * patch selected target field values, common function to be used with
     * excel and mudule fields
     * @param fields pass the comma separated fields
     */
    patchTargetFieldValues(fields) {
        const arr = fields.split(',');
        if (arr && arr.length > 0) {
            arr.map((selected) => {
                const fieldObj = this.fieldsList.filter((field) => field.fieldId === selected);
                if (fieldObj && fieldObj.length > 0) {
                    const tempObj = fieldObj[0];
                    this.selectedTargetFields.push({
                        fieldDescri: tempObj.fieldDescri,
                        fieldId: tempObj.fieldId
                    });
                }
            });
        }
    }

    /**
     * patch selected field values, common function to be used with
     * excel and mudule fields
     * @param fields pass the comma separated fields
     */
    patchFieldvalues(fields) {
        const arr = fields.split(',');
        if (arr && arr.length > 0) {
            arr.map((selected) => {
                const fieldObj = this.fieldsList.filter((field) => field.fieldId === selected);
                if (fieldObj && fieldObj.length > 0) {
                    const tempObj = fieldObj[0];
                    this.selectedFields.push({
                        fieldDescri: tempObj.fieldDescri,
                        fieldId: tempObj.fieldId
                    });
                }
            });
        }
    }

    /**
     * Initialize autocomplete for field names
     */
    initiateAutocomplete() {
        this.filteredModules = this.form.controls.fields.valueChanges
            .pipe(
                startWith(''),
                map(keyword => {
                    return keyword ?
                        this.fieldsList.filter(item => {
                            return item.fieldDescri.toString().toLowerCase().indexOf(keyword) !== -1
                        }) : this.fieldsList
                }),
            )

        this.targetFieldModules = this.form.controls.target_field.valueChanges.pipe(startWith(''), map(keyword => {
            return keyword
                ?
                this.fieldsList.filter(item => {
                    return item.fieldDescri.toString().toLowerCase().indexOf(keyword) !== -1
                })
                :
                this.fieldsList
        }));
    }

    /**
     * Apply conditional form validation based on rule type
     * keep the required field updated based on a selected rule type
     * loop through the required keys and add validators to all required fields
     * also nullify validators for all not required fields at the same time
     * @param selectedRule selected rule type
     */
    applyValidatorsByRuleType(selectedRule: string) {
        this.submitted = false;
        this.currentSelectedRule = selectedRule;
        const controlKeys: any[] = Object.keys(this.currentControls);
        let requiredKeys: string[] = [];
        if (selectedRule === BusinessRuleType.BR_LOOKUP_RULE) {
            requiredKeys = ['rule_type', 'rule_name', 'error_message'];
        }
        if (selectedRule === BusinessRuleType.BR_CUSTOM_SCRIPT) {
            requiredKeys = ['rule_type', 'categoryId', 'rule_name', 'error_message'];
        }
        if (selectedRule === BusinessRuleType.BR_REGEX_RULE) {
            requiredKeys = ['rule_type', 'categoryId', 'rule_name', 'error_message', 'fields', 'regex', 'standard_function'];
        }
        if (selectedRule === BusinessRuleType.BR_MANDATORY_FIELDS || selectedRule === BusinessRuleType.BR_METADATA_RULE || selectedRule === BusinessRuleType.MRO_CLS_MASTER_CHECK) {
            requiredKeys = ['rule_type', 'categoryId', 'rule_name', 'error_message', 'fields'];
        }

        if (selectedRule === BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI) {
            requiredKeys = ['rule_type', 'categoryId', 'rule_name', 'error_message', 'accuracyScore', 'source_field', 'apiKey'];
        }

        if (selectedRule === BusinessRuleType.BR_TRANSFORMATION) {
            requiredKeys = ['rule_name', 'categoryId', 'transformationRuleType', 'error_message'];
            if (this.selectedTransformationType === this.transformationType.REGEX) {
                requiredKeys = ['rule_type', 'rule_name', 'categoryId', 'transformationRuleType', 'error_message', 'sourceFld', 'targetFld'];
            } else if (this.selectedTransformationType === this.transformationType.LOOKUP) {
                requiredKeys = ['rule_type', 'rule_name', 'categoryId', 'transformationRuleType', 'error_message'];
            }
        }
        if (selectedRule === BusinessRuleType.MRO_GSN_DESC_MATCH || selectedRule === BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP) {
            requiredKeys = ['rule_name', 'error_message', 'categoryId', 'apiKey', 'fields'];
        }
        if (selectedRule === BusinessRuleType.BR_DUPLICATE_RULE) {
            requiredKeys = ['rule_name'];
        }
        if([BusinessRuleType.BR_CUSTOM_SCRIPT, BusinessRuleType.BR_SAP_CHECK_CODE_RULE].includes(this.form?.get('rule_type').value) && requiredKeys.indexOf('categoryId') > -1) {
            requiredKeys.splice(requiredKeys.indexOf('categoryId'), 1);
        }
        if(this.data?.isDRChildRule && requiredKeys.includes('error_message')) {
            requiredKeys.splice(requiredKeys.indexOf('error_message'), 1);
        }
        controlKeys.map((key) => {
            const index = requiredKeys.findIndex(reqKey => reqKey === key);
            if (index === -1) {
                this.form.get(key).setValidators(null);
                this.form.get(key).clearValidators();
                if (key !== 'rule_type' && key !== 'weightage' && key !== 'accuracyScore' && !this.data?.createRuleFormValues) {
                    this.form.get(key).setValue('');
                }
            } else {
                this.form.controls[key].setValidators([Validators.required]);
                this.form.controls[key].updateValueAndValidity();
            }
        });

        // this.form.updateValueAndValidity();
    }

    /**
     * function to create fields on the basis of excel sheet uploaded
     */
    createDSByFields() {
        return new Promise((resolve, reject) => {
            try {
                this.data.fields.forEach((field) => {
                    this.fieldsList.push({
                        fieldId: field.fieldId,
                        fieldDescri: field.fieldDescri
                    });
                });
                this.targetFieldsObject = {
                    labelKey: 'fieldDescri',
                    valueKey: 'fieldId',
                    list: this.fieldsList
                }
                this.sourceFieldsObject = {
                    labelKey: 'fieldDescri',
                    valueKey: 'fieldId',
                    list: this.fieldsList
                }
                resolve(null);
            } catch (error) {
                reject(error)
            }
        });
    }

    /**
     * function to save the array of ids of selected fields
     * @param event selected item eent
     */
    selectedField(event) {
        const alreadyExists = this.selectedFields.find(item => item.fieldId === event.option.value);
        if (alreadyExists) {
            this.snackBar.open('This field is already selected', 'Okay', { duration: 5000 });
        } else {
            this.selectedFields.push({
                fieldDescri: event.option.viewValue,
                fieldId: this.data.moduleId ? event.option.value : event.option.value.replace(' ', '_')
            });
        }
        this.form.controls.fields.setValue('');
        const txtfield = document.getElementById('fieldsInput') as HTMLInputElement;
        txtfield.value = '';
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
     * @param event value
     */
    selectTargetField(event) {
        const alreadyExists = this.selectedTargetFields.find(item => item.fieldId === event.option.value);
        if (alreadyExists) {
            this.toastService.open(`This field is already selected`, `Close`, { duration: 2000 });
        } else {
            this.selectedTargetFields.push({
                fieldDescri: event.option.viewValue,
                fieldId: event.option.value
            });
        }
        this.form.controls.target_field.setValue('');
        const txtfield = document.getElementById('targetFieldsInput') as HTMLInputElement;
        txtfield.value = '';
        if (this.targetFieldsInput) {
            this.targetFieldsInput.nativeElement.blur();
        }
    }

    /**
     * func to remove the value
     * @param i index of removable field
     */
    removeTargetField(i) {
        this.selectedTargetFields.splice(i, 1);
    }

    /**
     * getter to show field on the basis of rule type
     */
    get isRegexType() {
        return this.form.controls.rule_type.value === BusinessRuleType.BR_REGEX_RULE
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
    closeDialogComponent() {
        this.dialogRef.close();
    }

    /**
     * function to save the form data
     */
    save() {
        this.submitted = true;
        if(!this.canAllowNewBR(this.currentSelectedRule)) {
            return false;
          }

        if (!this.businessRuleTypes.find(x => x.ruleType === this.form.controls.rule_type.value)) {
            this.form.controls.rule_type.setValue('');
        }

        if(this.isLookupRule) {
            this.saveRule = true;
            return;
        }

        if (this.categoryList && !this.categoryList.find(x => x.categoryId === this.form.controls.categoryId.value)) {
            this.form.controls.categoryId.setValue('');
        }

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
        this.form.controls.fields.setValue(this.selectedFields.map(item => item.fieldId).join(','), {emitEvent: false});
        this.form.controls.target_field.setValue(this.selectedTargetFields.map(item => item.fieldId).join(','));
        if (!this.form.valid) {
            this.showValidationError('Please fill the required fields.');
            return;
        }

        if (this.currentSelectedRule === BusinessRuleType.BR_TRANSFORMATION &&
            this.selectedTransformationType === this.transformationType.LOOKUP &&
            this.lookupData.length === 0) {
            this.showValidationError('Please configure at least one field.');
            return;
        }
        // validation and value for duplicate rule type
        if (this.currentSelectedRule === BusinessRuleType.BR_DUPLICATE_RULE) {
            if (!this.duplicateFormRef.valid) {
                this.showValidationError('Please fill the required fields.');
                return;
            }

            if (!this.duplicateFormRef.get('addFields').value.length) {
                this.showValidationError('Please configure at least one field.');
                return;
            }

            const totalFieldsWeightage = this.duplicateFormRef.value.addFields.reduce((total, row) => {
                return total + Number(row.weightage);
            }, 0);

            if(totalFieldsWeightage !== 100) {
                this.showValidationError('The sum of the weightage assigned to fields on the slider must be exactly 100%');
                return;
            }

            if (!this.duplicateFormRef.get('masterRules').value.find(rule => !rule.isTieBreaker)) {
                this.showValidationError('Please configure at least one master rule.');
                return;
            }
            if (this.duplicateFormRef.get('masterRules').value.find(rule => !Boolean(rule.coreSchemBrInfo?.isConfigured))) {
                this.showValidationError('Please configure all master rules!');
                return;
            }

            if (!this.duplicateFormRef.get('blocks').value.length) {
                this.showValidationError('Please configure at least one duplicate identification.');
                return;
            }

            const modifiedDuplicacyField = [];
            const duplicacyField = [...this.duplicateFormRef.value.addFields];
            if (duplicacyField && duplicacyField.length > 0) {
                duplicacyField.map((field) => {
                    const { fId, criteria, exclusion, inverse, weightage, ival, sval } = field;
                    modifiedDuplicacyField.push({
                        fieldId: fId,
                        criteria,
                        exclusion,
                        inverse,
                        weightage,
                        ival,
                        sval,
                    })
                })
            }

            this.duplicacyRuleData.duplicacyField = modifiedDuplicacyField;
            this.duplicacyRuleData.masterRules = this.duplicateFormRef.value.masterRules;
            this.form.patchValue({brWeightage: `${this.duplicateFormRef.value.brWeightage}`});
            this.duplicacyRuleData.errWarLevels = this.duplicateFormRef.value.errWarLevels;

            const blocks  = this.processBlocks(this.duplicateFormRef.value.blocks);
            this.duplicacyRuleData.scope = [
            {
                when: blocks,
                then: []
            }
            ];
        }
        let lookupRuleMetadata;
        if (this.currentSelectedRule === BusinessRuleType.BR_SAP_CHECK_CODE_RULE) {
            if(!this.webServiceCallFormRef.valid) {
                this.webServiceCallFormRef.markAllAsTouched();
                this.showValidationError('Please fill the required fields.');
                return;
            }
            const wsFormObject = this.webServiceCallFormRef.value;
            lookupRuleMetadata = {
                targetSystem: wsFormObject.target_system,
                checkCodes: [
                    wsFormObject.check_code?.code
                ],
                checkCodeDesc: wsFormObject.check_code?.description
            };
        }
        const isInvalidBlocks = (blocks: Array<UDRBlocksModel>) => {
            return blocks.find((block) => !block.blockType || !block.conditionOperator || !block.conditionFieldId || isInvalidBlocks(block.childs || []));
        };
        if (this.currentSelectedRule === BusinessRuleType.BR_CUSTOM_SCRIPT) {
            if (!this.udrNodeForm.valid) {
                this.showValidationError('Please complete the required field(s).');
                return;
            }
        }
        const finalObject = {
            when: this.processBlocks(this.udrNodeForm.value.blocks),
            then: []
        }

        this.form.controls.udrTreeData.setValue(finalObject);
        this.dialogRef.close({
            formData: { ...this.form.value, lookupRuleMetadata, udrData:finalObject, rule_type: this.currentSelectedRule },
            tempId: this.tempRuleId,
            lookupData: this.lookupData,
            lookupRuleMetadata,
            brId: this.data.brId,
            isDRChildRule: Boolean(this.data.isDRChildRule),
            duplicacyRuleData: this.duplicacyRuleData
        });
    }

    processBlocks (blocklist: Array<any>): Array<UDRBlocksModel> {
        return blocklist.map((block, ind) => ({
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
        objectType: null,
        sRegex: block.regexCtrl,
        targetInfo: block.targetInfo,
        conditionFieldIdCtrl: block.sourceFldCtrl,
        childs: Array.isArray(block.childs)? this.processBlocks(block.childs) : [],
        order: ind,
        sourceObjectType: block.sourceFldObjType,
        targetObjectType: (block.targetInfo === TragetInfo.VALUE) ? '' : null,
        }));
    }

  /**
   * Function to decide if we can allow current business rule to be saved based on some validations
   */
  canAllowNewBR(brType): boolean {
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
    const brList = this.data.selectedBusinessRules || [];
    const currentRuleType = brType;
    let error = '';
    // Find current schema view
    const currentRuleView = Object.keys(rules).find(ruleView => rules[ruleView].includes(currentRuleType)) || 'dataQuality';
    // Check if All are same view
    const isSameView = brList.every(rule => rules[currentRuleView].includes(rule.brType));
    // Check if same rule type already exists
    const isSameType = brList.find(rule => rule.brType === currentRuleType);
    if (!isSameView) {
      error = 'A rule with a different view cannot be added to a schema!';
    } else if (isSameType && currentRuleView!=='dataQuality') {
      error = `Multiple ${currentRuleView} rules cannot be added to one schema!`;
    }
    if(error) {
      this.toastService.open(error,'ok',{duration:2000});
    }
    return !Boolean(error);
  }

    setRegex(event) {
        const selectedRegex = this.preDefinedRegex.find(item => item.FUNC_TYPE === event.value);
        this.form.controls.regex.setValue(selectedRegex.FUNC_CODE);
    }

    get isUDR() {
        return this.form.controls.rule_type.value === BusinessRuleType.BR_CUSTOM_SCRIPT;
    }

    get isTransformationRule() {
        return this.form.controls.rule_type.value === BusinessRuleType.BR_TRANSFORMATION;
    }

    get businessRuleTypesFiltered() {
        const searchStr = this.searchRuleTypeStr?.toLowerCase();
        return this.businessRuleTypes.filter(x =>
            (!this.data.isDRChildRule ? !x.dontMapped : (this.isDRTieBreaker ? DR_CHILD_TIEBREAKER_RULES : DR_CHILD_RULES).includes(x.ruleType))
            && (x.ruleDesc?.toLowerCase().includes(searchStr) || x.ruleType?.toLowerCase().includes(searchStr)));
    }

    get sourceFieldFiltered() {
        const searchStr = this.searchSourceFieldStr?.toLowerCase();
        return this.sourceFieldsObject.list.filter(x => x[this.sourceFieldsObject.labelKey]?.toLowerCase().includes(searchStr) || x[this.sourceFieldsObject.valueKey]?.toLowerCase().includes(searchStr));
    }

    get preDefinedRegexFiltered() {
        const searchStr = this.searchRegexFunctionStr?.toLowerCase();
        return this.preDefinedRegex.filter(x => x.FUNC_NAME?.toLowerCase().includes(searchStr) ||  x.FUNC_TYPE?.toLowerCase().includes(searchStr));
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
     * Set the value for key ComparisonValue
     * @param value pass the value
     * @param index pass the block index
     */
    setComparisonValue(value, index) {
        this.udrBlocks[index].conditionFieldValue = value
    }

    /**
     * Set the value for key ComparisonValue for child
     * @param value pass the value
     * @param child pass the child object
     */
    setComparisonValueForChild(value, child) {
        child.conditionFieldValue = value;
    }

    /**
     * Set initial condition
     * @param event pass the event
     * @param i pass the block index
     */
    setInitialCondition(event, i) {
        this.udrBlocks[i].blockType = event.value;
    }

    /**
     * Set range data for child here
     * @param value value of the range
     * @param rangeText text for the range
     * @param childObject pass the child object
     */
    setRangeValueForChild(value, rangeText, childObject) {
        if (rangeText === 'start') {
            childObject.rangeStartValue = value;
        }
        if (rangeText === 'end') {
            childObject.rangeEndValue = value;
        }
    }

    /**
     * Delete udr block from child array
     * @param parentBlockIndex pass the parent blocks index
     * @param childIndex pass the child block index
     * @param child pass the child object
     */
    deleteFromChildArray(parentBlockIndex, childIndex, child, subParentIndex?:number) {

        if(subParentIndex !== undefined) {
            (this.udrBlocks[parentBlockIndex].childs[subParentIndex] as any).childs.splice(childIndex, 1);
        } else {
            this.udrBlocks[parentBlockIndex].childs.splice(childIndex, 1);
        }
    }

    /**
     * method to delete the parend UDR block
     * @param i pass the index for the particular block
     */
    deleteParentBlock(i) {
        this.udrBlocks.splice(i, 1);
    }

    /**
     * get the basic conditions type
     */
    getConditions() {
        return ['And', 'Or']
    }

    /**
     * Set range data here
     * @param value value of the range
     * @param rangeText text for the range
     * @param parentBlockIndex pass the index for parentBlock
     */
    setRangeValue(value, rangeText, parentBlockIndex) {
        if (rangeText === 'start') {
            this.udrBlocks[parentBlockIndex].conditionFieldStartValue = value
        }
        if (rangeText === 'end') {
            this.udrBlocks[parentBlockIndex].conditionFieldEndValue = value
        }
    }

    /**
     * Set same level rules block type
     * @param event pass the select event
     * @param i pass the index for the block
     */
    setParentBlockTypeText(event, i) {
        this.udrBlocks.forEach(block => block.blockType = event.value);
    }

    /**
     * Method to add a UDR block
     * @param nested Whether the block is a nested node
     * @param parent pass the parent block data in case the current block is a child
     * @param i pass the index for current block
     * @param subParentIndex whenever the child is in the third level
     */
    addBlock(nested, parent, i, subParentIndex?:number) {
        const blockId = Math.floor(Math.random() * 1000000000000).toString();

        let existingBlockType = BlockType.AND;
        if(nested) {
            existingBlockType = parent.childs.length ? parent.childs[parent.childs.length - 1].blockType || BlockType.AND : BlockType.AND;
        } else {
            existingBlockType = this.udrBlocks[this.udrBlocks.length - 1].blockType || BlockType.AND;
        }

        if (`${existingBlockType}` === 'WHEN') {
            existingBlockType = BlockType.AND;
        }
        const udrBlock: UDRBlocksModel = {
            id: blockId,
            udrid: null,
            conditionValueFieldId: '',
            blockType: existingBlockType, // when/and/or
            objectType: '',
            blockDesc: existingBlockType,
            sRegex: '',
            conditionFieldId: '', // field id from dropdown
            conditionOperator: '', // operator value
            conditionFieldValue: '', // comparison value
            childs: [],
            conditionFieldStartValue: '',
            conditionFieldEndValue: ''
        }

        if (!nested) {
            this.udrBlocks.push(udrBlock);
        } else {
            parent.childs.push(udrBlock);
        }
    }

    /**
     * Get the type of Block for UDR conditions
     * @param type pass the type string
     */
    getBlockType(type: string) {
        if (type.toLowerCase() === 'when') {
            return BlockType.AND;
        } else {
            return BlockType[type.toUpperCase()];
        }
    }

    /**
     * method to get display values
     * @param value pass the value object
     */
    displayFn(value) {
        return value ? value.fieldDescri : '';
    }

    /**
     * method to format label data and convert it to string
     * @param value pass the label
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

        this.form.controls.targetFld.setValue(selectedTargetFields.map(item => item[this.targetFieldsObject.valueKey]).join(','));
        if (sourceFld) { this.form.controls.sourceFld.setValue(sourceFld); };
        if (excludeScript) { this.form.controls.excludeScript.setValue(excludeScript); };
        if (includeScript) { this.form.controls.includeScript.setValue(includeScript); };
    }

    /**
     * Set lookup data output to business rule form
     * @param lookupData pass lookup data
     */
    setLookupData(lookupData: LookupFields[]) {
        this.lookupData = lookupData;
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

    get isLookupRule() {
        return this.form.controls.rule_type.value === BusinessRuleType.BR_LOOKUP_RULE;
    }

    get isDaxeRule() {
        return this.form.controls.rule_type.value === BusinessRuleType.DAXE;
    }

    /**
     * getter to check if current window is opened for DR tie breaker rule
     */
    get isDRTieBreaker() {
        return this.data?.isTieBreaker;
    }

    /**
     * check if rule type is Manufacturer Part Number Identification
     */
    get isMPNI() {
        return this.form.controls.rule_type.value === BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI;
    }

    /**
     * Setting the duplicate form reference
     * @param formRef pass the form referene
     */
    setDuplicateFormRef(formRef: FormGroup) {
        // console.log(formRef);
        this.duplicateFormRef = formRef;
    }

    /**
     * Patch data for duplicacy rule
     * @param data pass the data to be patched
     */
    patchDuplicacyData(data) {
        if (data) {
            this.duplicacyRuleData = data as CoreSchemaBrInfo;
        }
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
        form.controls.categoryId.setValidators(categoryValidators);
        this.createDuplicateComponent($event.option.value);
      }
  }

  createDuplicateComponent(brType) {
    // get the componenet factory instances ...
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        SetupDuplicateRuleComponent
    );

    // invoke duplicate component as dynamic ....
    if(brType === BusinessRuleType.BR_DUPLICATE_RULE) {
        // Create componenet into the DOM ..
        const componentRef = this.containerRef.viewContainerRef.createComponent(componentFactory);
        componentRef.instance.isCustomSchema = true;
        componentRef.instance.duplicateRuleInfo = this.coreSchemaBrInfo;
        componentRef.instance.duplicateFields = this.fieldsList;
        componentRef.instance.submitted = this.submitted;
        this.submittedEmitter.subscribe(val => {
            componentRef.instance.submitted = this.submitted;
        });
        // subscribe the changes ...
        componentRef.instance.formChange.subscribe(val=> this.setDuplicateFormRef(val));
    } else {
        // clear it if the user select other rule ...
        this.containerRef.viewContainerRef.clear();
    }
  }

  /**
   * function to display rule desc in mat auto complete
   */
   displayRuleFn(value?: string) {
    return value ? this.businessRuleTypes.find(rule => rule.ruleType === value)?.ruleDesc : '';
  }

  /**
   * function to display category name in mat auto complete
   */
   displayCategoryFn(value?: string) {
    return value ? this.categoryList.find(category => category.categoryId === value)?.categoryDesc : '';
  }

  /**
   * function to return field name from code
   * @param value field code
   * @returns field display label name
   */
  displaySourceFieldFn(value?: string) {
    return value ? this.sourceFieldsObject.list.find(field => field[this.sourceFieldsObject.valueKey] === value)?.[this.sourceFieldsObject.labelKey] : '';
  }

  /**
   * function to UPDATE Transformation rule type when lib radio is clicked
   */
   updateTransformationRuleType($event) {
    if (this.form?.controls) {
      this.form.controls.transformationRuleType.setValue($event.value);
    }
  }

  /**
   * function to display Regex name in mat auto complete
   */
   displayRegexFn(value?: string) {
    return value ? this.preDefinedRegex.find(rule => rule.FUNC_TYPE === value)?.FUNC_NAME : '';
  }

 /**
  * function to display formatted value in auto complete field
  */
 displayOperatorFn(value?: string) {
   return value === 'EQUAL' ? 'EQUALS' : value?.replace(/_/g, ' ') || '';
 }

 /**
  * update parent blocks block type
  * @param event new block type
  * @param parent parent rule
  */
  updateBlocksType(event, parent) {
    parent.childs.forEach(child => {
      child.blockType = event.value;
      child.blockDesc = event.value;
    });
  }

    /**
     * function to fitler operator list in auto complete
     */
     filterOperator(value: string) {
        value = value?.replace(/\s/g, '_') || '';
        this.operatorsFiltered = this.operators.map(operator => ({
            ...operator,
            childs: operator.childs.filter(child => child.toLowerCase().includes(value))
        }))
        .filter(operator => operator.childs.length);
    }
    filterField(value: string) {
        value = value?.toLowerCase() || '';
        this.fieldsListFiltered = this.fieldsList.filter(row => row.fieldDescri.toLowerCase().includes(value));
    }
    displayFieldFn(fieldId: string) {
        return this.fieldsList.find(row => row.fieldId === fieldId)?.fieldDescri || '';
    }

    /**
     * getter to display fields tool tip
     */
    get fieldsTooltip() {
        let tooltipText = '';
        switch(this.form.controls.rule_type.value) {
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
     * Setting form reference for web service call rule
     * @param formRef pass th form reference
     */
    setupWebServiceCallFormRef(formRef: FormGroup) {
        this.webServiceCallFormRef = formRef;
    }

    saveLookupRule(ev) {
        this.saveRule = false;
        this.submitted = true;

        (Object).values(this.form.controls).forEach(control => {
          if (control.invalid)
            control.markAsTouched();
        });

        if (!this.form.valid) {
          this.form.markAllAsTouched();
          this.showValidationError('Please fill the required fields');
          return;
        }

        if (ev && ev.errorMsg) {
          this.submitted = false;
          this.showValidationError(ev.errorMsg);
        } else if (ev && ev.data) {
          const data = ev.data;
          this.form.controls.fields.setValue(data.fields);

          this.dialogRef.close({
            formData: { ...this.form.value, rule_type: this.currentSelectedRule, udrData: data.udrData, lookupRuleMetadata: data.lookupRuleMetadata },
            tempId: this.tempRuleId,
            lookupData: this.lookupData,
            brId: this.data.brId,
            isDRChildRule: Boolean(this.data.isDRChildRule),
            duplicacyRuleData: this.duplicacyRuleData
          });
        }
    }

    /**
     * Search and filter the field list for the udr blocks
     * @param searchString Search string
     */
    updateUDRFldList(searchString = '') {
        searchString = typeof searchString === 'string' ? searchString.toLowerCase() : '';
        this.fieldsListFiltered=  [{
            fieldDescri: 'Header fields',
            fieldId: 'header_fields',
            isGroup: true,
            childs: !searchString ? [...this.fieldsList] : this.fieldsList.filter(fld => fld.fieldDescri.toLowerCase().includes(searchString))
        }];
    }
}

