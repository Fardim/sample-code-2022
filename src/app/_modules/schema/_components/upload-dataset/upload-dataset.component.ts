import { Component, OnInit, ViewChild, Inject, AfterViewInit, HostListener, ElementRef } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ObjectTypeResponse, ObjectType, DataSource, ValidationError, AddFilterOutput, SubscriberFields } from '@models/schema/schema';
import { MetadataModeleResponse, MetadataModel, FilterCriteria, NewBrDialogResponse, LookupFields } from '@models/schema/schemadetailstable';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { NewBusinessRulesComponent } from '../new-business-rules/new-business-rules.component';
import { GlobaldialogService } from '@services/globaldialog.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CoreSchemaBrInfo, TransformationModel, DropDownValue, UDRBlocksModel, BusinessRuleType, LookupRuleMetadata } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { distinctUntilChanged } from 'rxjs/operators';
import { NewSchemaCollaboratorsComponent } from '../new-schema-collaborators/new-schema-collaborators.component';
import { values, pick } from 'lodash';
import { BusinessrulelibraryDialogComponent } from '../businessrulelibrary-dialog/businessrulelibrary-dialog.component';
import { PermissionOn, UserMdoModel, SchemaDashboardPermission, ROLES, RuleDependentOn } from '@models/collaborator';
import { ScheduleDialogComponent } from '@modules/shared/_components/schedule-dialog/schedule-dialog.component';
import { SchemaScheduler } from '@models/schema/schemaScheduler';
import { Utilities } from '@models/schema/utilities';
import { GLOBALCONSTANTS } from '../../../../_constants';
import { LoadDropValueReq, PermissionType } from '@models/schema/schemalist';
import { BlockType } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-cdktree.service';
import { TransientService } from 'mdo-ui-library';
import { DmsService } from '@services/dms/dms.service';

type UploadedDataType = any[][];

@Component({
  selector: 'pros-upload-dataset',
  templateUrl: './upload-dataset.component.html',
  styleUrls: ['./upload-dataset.component.scss']
})
export class UploadDatasetComponent implements OnInit, AfterViewInit {
  /**
   * mat stepper element reference
   */
  @ViewChild(MatStepper) stepper!: MatStepper;

  /**
   * form instance for dataTableCtrl
   */
  dataTableCtrl: FormGroup;

  /**
   * form instance for slected field control
   */
  selectedMdoFldCtrl: FormControl;

  /**
   * Displayed columns list for table
   */
  displayedColumns = ['excel', 'excelfrstrowdata', 'mapping', 'field'];

  /**
   * Table data source
   */
  dataSource: DataSource[] = [];

  /**
   * Filtered modules list
   */
  filteredModules: Observable<ObjectTypeResponse[]>;

  /**
   * form instance for module input
   */
  moduleInpFrmCtrl: FormControl;

  /**
   * List for excel headers
   */
  excelHeader: string[];

  /**
   * hold the metadata fields
   */
  metadataFields: MetadataModeleResponse;

  /**
   * hold metadata fields list
   */
  metaDataFieldList: MetadataModel[] = [];

  /**
   * Hold the header fields
   */
  headerFieldsList: MetadataModel[] = [];

  /**
   * Hold the uploaded file data
   */
  uploadedData: UploadedDataType;
  excelMdoFieldMappedData: DataSource[] = [];
  triggerValue = false;

  /**
   * File to be uploaded
   */
  uploadedFile: File;

  /**
   * Status for upload button
   */
  uploadDisabled = true;

  /**
   * error object for upload
   */
  uploadError: ValidationError = {
    status: false,
    message: ''
  };

  /**
   * hold the plantcode
   */
  plantCode: string;

  fieldsBySubscriber: SubscriberFields[] = [];
  loaded = false;
  uploadLoader = false;
  objectTypes: Array<ObjectType> = [];
  editableFieldIds: string[] = [];
  currentSchedule: SchemaScheduler;
  /**
   * Fetch count for subscribers
   */
  fetchCount = 0;

  /**
   * progress bar value setting variable
   */
  progressBar = 0;
  /**
   * array of headers
   */
  headerText = [
    'Upload data',
    'Name your dataset',
    'Select business rule',
    'Collaborator',
    'Run the schema'
  ];

  /**
   * to identify existing BR
   * and differentiate from newly created ones
   */
  existingTempIds: string[] = [];

  /**
   * index of active header
   */
  headerTextIndex = 1;

  /**
   * Modules list to pre-populate
   */
  modulesList = [];

  /**
   * copy of modules list
   */
  modulesListCopy = [];

  /**
   * List of all selected business rules
   */
  selectedBusinessRules = [];

  /**
   * List of all selected business rules
   */
  businessRulesList = [];

  /**
   * This is used to store user details
   */
  userDetails: Userdetails;

  /**
   * form to send to server
   */
  requestForm: FormGroup;

  /**
   * form to make changes to header
   */
  headerForm: FormGroup;

  currentRuleId: string;

  /**
   * subscribers list
   */
  subscribersList = [];

  /**
   * subscribers list
   */
  allSubscribers = [];

  /**
   * object to store the core_schema object
   */
  coreSchemaObject = {
    discription: '',
    tenantId: '',
    schemaLimit: 1,
    owner: '',
    status: '',
    category: '',
  }

  reInilize = true;

  /**
   * Serial no of file uploaded
   */
  fileSno: string;

  /**
   * common structure to create fields object for
   * request structure
   */
  fieldsObject = {
    fieldDescri: '',
    fieldId: '',
    dataType: 'CHAR',
    maxChar: '200',
    mandatory: '0',
    parentField: null,
    tableName: null,
    isCheckList: 'false',
    isComBased: '0'
  }

  roles = ROLES;
  /**
   * List of all selected business rules
   */
  existSchemaBrList = [];

  /**
   * module ID of current module
   */
  moduleId: string;

  loadDopValuesFor: LoadDropValueReq;

  /**
   * To have the info about schedule
   */
  scheduleInfo: SchemaScheduler;

  /**
   * To check whether show edit schedule or add schedule button
   */
  canEditSchedule: boolean;

  /**
   * Define schema execution final view
   */
  schemaCategory: FormControl;

  /**
   * keep the dialog subscriptions
   */
  dialogSubscriber = new Subscription();

  /**
   * form instance for input
   */
  inputModel = new FormControl();

  /**
   * Subscriber filtered fields list
   */
  subscriberFilterFields = [];

  /**
   * active chip value
   */
  activeChipValue = {};

  /**
   * Loading state for subscriber
   */
  subscriberLoader = false;

  /**
   * reference to editable fields on click
   */
  @ViewChild('clickToEdit') clickToEdit: ElementRef;

  /**
   * reference to upload input element
   */
  @ViewChild('uploadInput') uploadInput: ElementRef;

  /**
   * Hold the final step after submissiion
   */
  stepSubmitted = false;
  dependantStatusList = [
    {
      key: 'ALL',
      value: 'ALL'
    },
    {
      key: 'SUCCESS',
      value: 'SUCCESS'
    },
    {
      key: 'ERROR',
      value: 'FAILURE'
    }
  ];

  runningScheduleList = [{
    value: 'dontRunSchema',
    key: 'Do not run the schema now'
  }, {
    value: 'runSchemaOnce',
    key: 'Run the schema once now'
  }]
  /**
   * Track the click event
   * in order to detect outside cick
   * @param event pass the event
   */
  @HostListener('document:click', ['$event'])
  public onClick(event) {
    const fieldId = event.target.id;
    if (!fieldId || this.editableFieldIds.indexOf(fieldId) === -1) {
      this.editableFieldIds = [];
    }
  }

  get selectedRunningSchedule () {
    return this.requestForm.value.runTime? 'runSchemaOnce': 'dontRunSchema';
  }

  /**
   * Constructor of class
   * @param _formBuilder form builder object
   * @param schemaService schema service object
   * @param schemaDetailsService  service details service object
   * @param transientService transientService object
   * @param userService user service
   * @param dialogRef dailog ref object
   * @param moduleInfo the current selected module
   */
  constructor(
    private schemaService: SchemaService,
    private schemaDetailsService: SchemaDetailsService,
    private transientService: TransientService,
    private userService: UserService,
    public dialogRef: MatDialogRef<UploadDatasetComponent>,
    public globaldialogService: GlobaldialogService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private utilties: Utilities,
    private dmsService: DmsService
  ) {
    this.setProgressValue();
    this.moduleInpFrmCtrl = new FormControl();
    this.selectedMdoFldCtrl = new FormControl();
  }

  setProgressValue(index: number = 0) {
    if (index > 0) {
      this.progressBar = index * (100 / this.headerText.length);
    } else {
      this.progressBar = 100 / this.headerText.length;
    }
  }

  getObjectTypes() {
    this.schemaService.getAllObjectType().subscribe((modules: []) => {
      if (modules && modules.length > 0) {
        this.modulesList.push(...modules);
        this.modulesListCopy.push(...modules);
      }
    });
  }

  /**
   * Angular hook
   */
  ngOnInit(): void {
    this.createForm();
    this.getObjectTypes();

    // get logged in user details
    this.userService.getUserDetails().subscribe((userdetails: Userdetails) => {
      this.userDetails = userdetails;
      this.requestForm.controls.userId.setValue(this.userDetails.userName);
      this.requestForm.controls.plantCode.setValue(this.userDetails.plantCode);
    });

    this.requestForm.get('dataScope').setValue('Entire Dataset');
    this.requestForm.get('schemaThreshold').setValue(100);

    this.getBusinessRulesList(this.moduleId, '', '', '0');
    this.getCollaborators('', this.fetchCount);
  }

  /**
   * Function to build form
   */
  createForm() {
    this.requestForm = new FormGroup({
      file: new FormControl(),
      fileSerialNo: new FormControl(''),
      objectId: new FormControl(),
      objectDesc: new FormControl('', [Validators.required, Validators.minLength(1)]),
      objectfullDesc: new FormControl(''),
      lang: new FormControl('en'),
      parentObject: new FormControl({}),
      importFrom: new FormControl(''),
      salesFourceModule: new FormControl(''),
      createType: new FormControl(''),
      permissionAcive: new FormControl(''),
      plantCode: new FormControl(''),
      userId: new FormControl(''),
      fields: new FormControl([]),
      core_schema: new FormControl({
        discription: '',
        tenantId: '',
        schemaLimit: '1',
        owner: 'Role',
        status: '1',
        category: '2'
      }),
      coreSchemaBr: new FormControl([]),
      mappedData: new FormControl([]),
      subcribers: new FormControl([]),
      runTime: new FormControl(true),
      dataScope: new FormControl(),
      schemaThreshold: new FormControl(100),
      schemaId: new FormControl()
    });
    this.schemaCategory = new FormControl('DATAQUALITY_VIEW');
    this.requestForm.valueChanges.subscribe((formData) => {
      if(this.currentSchedule && formData.runTime) {
        this.currentSchedule.isEnable = formData.runTime;
      }
    })
  }

  /**
   * function to return formField
   */
  formField(field: string) {
    return this.requestForm.get(field);
  }

  /**
   * Angular hook
   */
  ngAfterViewInit() {
    this.stepper.selectionChange.subscribe((change) => {
      this.headerTextIndex = change.selectedIndex + 1;
      this.setProgressValue(this.headerTextIndex);
    });
  }

  /**
   * function to open explorer to select file to upload
   */
  openExplorer() {
    this.uploadError = {
      status: false,
      message: ''
    }
    document.getElementById('uploader').click();
  }

  /**
   * Function to get the excel file and get fields and data
   * @param evt file uploaded event
   */
  fileChange(evt: Event) {
    if (evt !== undefined) {
      this.uploadError.status = false;
      this.uploadError.message = '';
      const target: DataTransfer = (evt.target) as unknown as DataTransfer;
      if (target.files.length !== 1) throw new Error('Cannot use multiple files');
      // check file type
      let type = '';
      try {
        type = `${target.files[0].name}`.split('.')[1];
      } catch (ex) {
        console.error(ex);
      }
      if (type === 'xlsx' || type === 'xls' || type === 'csv') {
        // check size of file
        const size = target.files.item(0).size;
        const sizeKb = Math.round((size / 1024));
        if (sizeKb > (10 * 1024)) {
          this.uploadedFile = null;
          (evt.target as any).value = '';
          this.showValidationError('File size too large , upload less then 10 MB');
          return false;
        }
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
          /* read workbook */
          const bstr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
          /* grab first sheet */
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];
          /* save data */
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          this.uploadedData = (data as UploadedDataType);
          this.excelHeader = this.uploadedData[0] as string[];
          const file = target.files[0];
          this.uploadedFile = file;

          const dataS: DataSource[] = [];
          for (let i = 0; i < this.uploadedData[0].length; i++) {
            const datS: DataSource = {
              excelFld: this.uploadedData[0][i],
              excelFrstRow: this.uploadedData[1][i],
              mdoFldId: this.utilties.getRandomString(8),
              mdoFldDesc: '',
              columnIndex: i
            };
            dataS.push(datS);
          }
          // initialize excel header form here
          this.initHeaderForm(dataS).then(() => {
            this.dataSource = dataS;
            if (this.uploadedData) {
              this.schemaService.setExcelValues({ uploadedData: this.uploadedData, headerData: this.dataSource });
            }
          })
            .catch((err) => {
              console.log(err);
            });
        };

        reader.readAsBinaryString(target.files[0]);
        this.excelMdoFieldMappedData = [];
        this.requestForm.get('file').setValue(target.files[0]);
        this.uploadFileData();
      } else {
        this.uploadedFile = null;
        (evt.target as any).value = '';
        this.showValidationError('Unsupported file format, allowed file formats are .xlsx, .xls and .csv')
      }
    }
  }

  /**
   * Initialize header form dynamically with
   * received data from the excel file
   */
  initHeaderForm(dataSource: DataSource[]) {
    return new Promise((resolve, reject) => {
      try {
        const formBody = {};
        dataSource.map((data) => {
          formBody[data.mdoFldId] = new FormControl(data.excelFld, [Validators.required]);
        });
        this.headerForm = new FormGroup(formBody);
        this.headerForm.valueChanges.subscribe((value) => {
          this.excelHeader = values(value);
        });
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * function to create fields from excel
   * file and create structure to send
   * to server
   */
  createfieldObjectForRequest(dataSource: DataSource[], formData = this.headerForm.value) {
    return new Promise((resolve, reject) => {
      const fieldValues = [];
      try {
        if (dataSource && dataSource.length > 0) {
          dataSource.forEach((dataS) => {
            fieldValues.push({
              fieldDescri: formData[dataS.mdoFldId],
              fieldId: dataS.mdoFldId,
              dataType: 'CHAR',
              maxChar: '200',
              mandatory: '0',
              parentField: null,
              tableName: null,
              isCheckList: 'false',
              isComBased: '0'
            });
          });
        }
        resolve(fieldValues)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * function to set the header text dynamically
   */
  get toolbarHeaderText() {
    return this.headerText[this.headerTextIndex - 1];
  }

  /**
   * Close dialog after saved or click close
   */
  closeDialog() {
    this.dialogRef.close();
  }

  /**
   * check validation for each step here
   */
  validateStep() {
    if (!this.headerForm.valid || !this.requestForm.valid) {
      if(!this.headerForm.valid) { this.showValidationError('Please fix the error below to continue.'); }
      return false;
    }
    if (this.stepper.selectedIndex === 2) {
      const schema = this.requestForm.get('core_schema').value;
      if (!schema || !schema.discription) {
        this.showValidationError('Please fix the error below to continue.');
        return false;
      }
    }
    if (this.stepper.selectedIndex === 2) {
      if (this.selectedBusinessRules && this.selectedBusinessRules.length === 0) {
        this.showValidationError('Please add a Business Rule to continue.');
        return false;
      }
    }
    /* if (this.stepper.selectedIndex === 3) {
      if (this.subscribersList && this.subscribersList.length === 0) {
        this.snackBar.open('Please add a Subscriber to continue', 'Okay', { duration: 5000 });
        return false;
      }
    } */
    return true;
  }

  /**
   * stepping function
   * @param where value to move to next or previous
   * @param validateForm whether to validate the data entered (optional)
   */
  step(where: string, validateForm?: boolean) {
    this.stepSubmitted = true;
    // this.uploadError.status = false;

    if(this.stepper.selectedIndex===1 && this.requestForm.controls.objectDesc.invalid && where === 'next'){
      this.showValidationError('Please fix error below to continue.');
      this.requestForm.controls.objectDesc.markAsTouched();
    }
    if (validateForm && !this.validateStep()) {
      return;
    }
    if (where === 'next') {
      if (this.progressBar === 100) {
        return;
      }
      const currentStepIndex = this.stepper.selectedIndex;
      if (currentStepIndex === 1) {
        // there should be atleast one mapping
        const anyMapping = this.requestForm.controls.mappedData.value.length;
        const isNewSchema = this.requestForm.controls.objectId.value;

        if (anyMapping === 0 && isNewSchema) {
          this.showValidationError('Please select atleast one mapping.');
          return;
        }
      }

      if (currentStepIndex === 2) {
        // there should be atleast one Business rule
        const anyBR = this.requestForm.controls.coreSchemaBr.value;
        if (anyBR.length === 0) {
          this.showValidationError('Please create atleast one business rule');
          return;
        }
      }
    }

    if (this.headerTextIndex === 0) {
      const element = document.getElementById('uploader');
      if (element) {
        // document.getElementById('uploader').setAttribute('value', '');
      }
    }
    this.stepSubmitted = false;
    this.stepper[where]();
  }

  /**
   * Function to open global dialog
   * @param componentName name of the component that needs to be opened
   */
  openGlobalDialog(componentName = 'createBR') {
    if (componentName === 'createBR') {
      this.createfieldObjectForRequest(this.dataSource).then((finalValues) => {
        this.requestForm.controls.fields.setValue(finalValues);

        // Open dialog for new business rule creation
        this.globaldialogService.openDialog(NewBusinessRulesComponent, {
          moduleId: this.requestForm.controls.objectId.value,
          selectedBusinessRules: this.selectedBusinessRules,
          fields: this.requestForm.controls.fields.value,
          maxWeightageLimit: this.getCurrentWeightageLimit()
        });
      });

      this.dialogSubscriber = this.globaldialogService.dialogCloseEmitter
        .pipe(distinctUntilChanged())
        .subscribe((response: NewBrDialogResponse) => {
          if(!response?.isDRChildRule) {
            if (response && response.formData) {
              this.updateCurrentRulesList(response);
            }
            this.dialogSubscriber.unsubscribe();
          }
        })
    }
    if (componentName === 'existingBR') {
       // Open dialog for existing business rule
      this.globaldialogService.openDialog(BusinessrulelibraryDialogComponent, {
        selectedRules: this.selectedBusinessRules,
      });
      this.dialogSubscriber = this.globaldialogService.dialogCloseEmitter
        .pipe(distinctUntilChanged())
        .subscribe((response: CoreSchemaBrInfo[]) => {
          if (response && response.length > 0) {
            this.selectBusinessRule(response);
          }
          this.dialogSubscriber.unsubscribe();
        })
    }
  }

  /**
   * Get the available weightage value
   * @param brWeightage pass the current business rule weightage value
   */
  getCurrentWeightageLimit(brWeightage: any = 0) {
    let weightage = 100;
    const existingBrWeightage = Number(brWeightage);
    if(this.selectedBusinessRules && this.selectedBusinessRules.length>0) {
      this.selectedBusinessRules.map((rule) => {
        weightage = weightage - rule.brWeightage;
      });
    }

    return existingBrWeightage? weightage + existingBrWeightage: weightage;
  }

  /**
   * Function to add/updated rules to business rules list
   * @param response response from the newly created rule dialog
   * or from the existing rules selection
   */
  updateCurrentRulesList(response: any) {
    if (!response || !response.formData) { return; };

    let brObject: CoreSchemaBrInfo;
    const tempId = response.tempId ? response.tempId : '';
    const brId = response.brId ? response.brId : '';
    let formData = {...response.formData, brId};

    // Add transformation schema details from response to formData
    formData = { ...formData, transFormationSchema: this.mapTransformationData(response), duplicacyRuleData: response.duplicacyRuleData };

    // Check if the selected rule type is user defined i.e. custom
    brObject = this.createBrObject(formData);
    // Set default status to 1
    brObject.status = '1';

    if (this.selectedBusinessRules.length > 0) {
      let index = null;

      if(brId){
        index = this.selectedBusinessRules.findIndex(rule => rule.brId === brId);
      } else {
        index = this.selectedBusinessRules.findIndex(rule => rule.tempId === tempId);
      }

      if (index > -1) {
        this.selectedBusinessRules[index] = { ...brObject };
      } else {
        this.selectedBusinessRules.push(brObject);
      }

    } else {
      this.selectedBusinessRules.push(brObject);
    }

    this.requestForm.controls.coreSchemaBr.setValue(this.selectedBusinessRules);
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
      blockDesc: '',
      objectType: lookupData.fieldLookupConfig.moduleId,
      childs: []
    }
  }

  /**
   * Function to track rule Ids, later used to identify newly created
   * or existing rules. "Configure" option is shown based on this
   * @param tempId rule id
   */
  addTempIdToExisting(tempId: string) {
    return new Promise((resolve) => {
      this.existingTempIds.push(tempId);
      resolve(null);
    })
  }

  /**
   * Function to check if a rule is newly added
   * @param tempId rule id
   */
  isExistingRule(tempId: string) {
    return this.existingTempIds.indexOf(tempId) > -1;
  }

  /**
   * Function to open business rule dialog for further configuration
   * @param rule the selected rule which is to be configured
   */
  configureRule(rule: CoreSchemaBrInfo) {
    console.log(rule)
    this.createfieldObjectForRequest(this.dataSource).then((finalValues) => {
      this.requestForm.controls.fields.setValue(finalValues);
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
        lookupRuleMetadata,
        accuracyScore,
        target_field,
        scope,
        errWarLevels } = rule;

        // Handle duplicacy rule data
        const duplicacyRuleData = {duplicacyField, duplicacyMaster, masterRules, scope, errWarLevels};
        console.log('Duplicacy rule data ', duplicacyRuleData);

      // Open business rule configuration dialog
      this.globaldialogService.openDialog(NewBusinessRulesComponent, {
        maxWeightageLimit: this.getCurrentWeightageLimit(brWeightage),
        moduleId: this.requestForm.controls.objectId.value ? this.requestForm.controls.objectId.value : '',
        fields: this.requestForm.controls.fields.value,
        tempId,
        brId,
        createRuleFormValues: {
          rule_type: brType,
          rule_name: brInfo,
          error_message: message,
          standard_function: standardFunction,
          regex,
          fields,
          apiKey,
          udrTreeData: udrData,
          lookupRuleMetadata,
          weightage: brWeightage,
          categoryId,
          transFormationSchema,
          duplicacyRuleData,
          accuracyScore,
          source_field,
          target_field,
          udrData,
          masterRules,
          duplicacyField,
          scope,
          errWarLevels
        }
      });
    });

    // Subscribe the dialog close event
    this.dialogSubscriber = this.globaldialogService.dialogCloseEmitter
      .pipe(distinctUntilChanged())
      .subscribe((response: NewBrDialogResponse) => {
        console.log('Received on close ', response);
        if(!(response?.isDRChildRule)) {
          if (response && response.formData) {
            this.updateCurrentRulesList(response);
          }
          this.dialogSubscriber.unsubscribe();
        }
      });
  }

  /**
   * Function to toggle business rule status value
   * @param event value for status, checked or unchecked
   * @param Br Business rule
   */
  toggleBrStatus(event, Br) {
    this.requestForm.controls.coreSchemaBr.value.map((br) => {
      if (br.fields === Br.fields) {
        br.status = event ? '1' : '0';
      }
    });
  }

  /**
   * function to create br...
   * @param object newly created Br
   */
  createBrObject(object, udrTreeData = { when: [] }): CoreSchemaBrInfo {
    const allowUDRBlocks = [BusinessRuleType.BR_CUSTOM_SCRIPT, BusinessRuleType.BR_LOOKUP_RULE].includes(object.brType || object.rule_type);
    console.log('Object on createBrObject ', object);
    return {
      tempId: object.tempId ? object.tempId : this.utilties.getRandomString(8),
      sno: object.sno ? object.sno : 0,
      brId: object.brId ? object.brId : '',
      brType: object.brType ? object.brType : object.rule_type,
      refId: object.refId ? object.refid : 0,
      fields: object.fields,
      regex: object.regex,
      order: 1,
      apiKey: object.apiKey,
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
      plantCode: object.plantCode ? object.plantCode : (this.requestForm.value.plantCode || '0'),
      percentage: object.percentage ? object.percentage : 0,
      schemaId: object.schemaId ? object.schemaId : '',
      brIdStr: object.brIdStr ? object.brIdStr : '',
      lookupRuleMetadata: object.lookupRuleMetadata ? object.lookupRuleMetadata : new LookupRuleMetadata(),
      udrData: !allowUDRBlocks ? null : object.udrData || ({ when: object.when || udrTreeData?.when || [] }),
      transFormationSchema: object.transFormationSchema,
      isCopied: object.isCopied ? object.isCopied : false,
      duplicacyField: object.duplicacyRuleData.duplicacyField || [],
      duplicacyMaster: object.duplicacyRuleData.duplicacyMaster || [],
      masterRules: object.duplicacyRuleData.masterRules || [],
      source_field: object.source_field ? object.source_field : '',
      target_field: object.target_field ? object.target_field : '',
      accuracyScore: object.accuracyScore ? object.accuracyScore : 0,
      scope: object.duplicacyRuleData.scope,
      errWarLevels: object.duplicacyRuleData.errWarLevels,
    } as CoreSchemaBrInfo;
  }


  /**
   * method to map transformation rule data from form
   * object to transformationschema format
   * @param response pass the response with formData and lookup object
   */
  mapTransformationData(response) {
    const { sourceFld, targetFld, includeScript, excludeScript, transformationRuleType, rule_type } = response.formData;
    const transformationList: TransformationModel[] = [];
    if (rule_type === BusinessRuleType.BR_TRANSFORMATION) {
      if (response.lookupData && response.lookupData.length > 0) {
        response.lookupData.map((param: LookupFields) => {
          transformationList.push({
            brId: '',
            sourceFld: param.fieldId,
            targetFld: param.lookupTargetField,
            includeScript,
            excludeScript,
            transformationRuleType,
            lookUpObjectType: param.fieldLookupConfig.moduleId,
            lookUptable: '',
            udrBlockModel: this.createUDRBlockFromLookup(param)
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
   * Function to reoder the BR
   * @param event the dropped element
   */
  reoderBR(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedBusinessRules, event.previousIndex, event.currentIndex);
    this.selectedBusinessRules[event.currentIndex].order = event.currentIndex + 1;
  }

  drop(event: CdkDragDrop<any>) {
         moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }
  /**
   * function to set module data and navigate
   * @param selectedModule selected module data
   */
  setModuleValueAndTakeStep(selectedModule?) {
    if (selectedModule && Object.keys(selectedModule).length > 0) {
      this.requestForm.controls.objectDesc.setValue(selectedModule.objectdesc);
      this.requestForm.controls.objectfullDesc.setValue(selectedModule.objectdesc);
      this.requestForm.controls.objectId.setValue(selectedModule.objectid);
      this.getModulesMetaHeaders();
      if (selectedModule.schemaId) {
        this.getScheduleInfo(selectedModule.schemaId);
        this.getSchemaBrInfo(selectedModule);
        this.getSchemaCollaboratorInfo(selectedModule.schemaId);
      }
    } else {
      this.requestForm.controls.objectDesc.setValue('');
      this.requestForm.controls.objectfullDesc.setValue('');
      this.requestForm.controls.objectId.setValue('');
      this.createfieldObjectForRequest(this.dataSource).then((finalValues) => {
        this.requestForm.controls.fields.setValue(finalValues);
      });
    }
    this.step('next');
  }

  /**
   * get all metadata headers
   */
  getModulesMetaHeaders() {
    this.schemaDetailsService.getMetadataFields(this.requestForm.controls.objectId.value)
      .subscribe((res: MetadataModeleResponse) => {
        if (res && res.headers) {
          this.headerFieldsList.push({
            fieldId: 'objectnumber',
            fieldDescri: 'Module Object Number',
            dataType: 'CHAR',
            maxChar: '100',
            mandatory: '0',
            backEnd: 0,
            systemId: 'LOCAL',
            pickTable: null,
            picklist: '0',
            pickService: null,
            dependency: '0',
            validationService: '',
            defaultValue: '',
            eventService: '',
            outputLen: '',
            strucId: '',
            permission: '',
            intUse: '',
            intUseService: '',
            searchEngin: '',
            ajax: '',
            keys: '',
            flag: '',
            objecttype: '',
            parentField: '',
            reference: '',
            languageIndependent: '',
            gridDisplay: '',
            defaultDate: '',
            workFlowField: '',
            repField: '',
            locType: '',
            descField: '',
            refField: '',
            workflowCriteria: '',
            numberSettingCriteria: '',
            isCheckList: '',
            isCompBased: '',
            textAreaLength: '',
            textAreaWidth: '',
            plantCode: '',
            defaultDisplay: '',
            isCompleteness: '',
            criteriaDisplay: '',
            isShoppingCartRefField: false
          })
          Object.keys(res.headers).forEach(header => {
            this.metaDataFieldList.push(res.headers[header]);
            this.headerFieldsList.push(res.headers[header]);
          });
        }
      })
  }

  /**
   * function to update mapping
   * @param data the mapped data
   */
  updateMapFields(data) {
    if (data && data.fieldId !== '') {
      const mapData = { columnIndex: data.index, excelFld: data.execlFld, mdoFldId: data.fieldId, mdoFldDesc: data.fieldDesc, excelFrstRow: null };
      const availmap = this.excelMdoFieldMappedData.filter(fill => fill.columnIndex === data.index);
      if (availmap.length === 0) {
        this.excelMdoFieldMappedData.push(mapData);
      } else {
        const oldMapFld = availmap[0];
        this.excelMdoFieldMappedData.splice(this.excelMdoFieldMappedData.indexOf(oldMapFld, 1));
        oldMapFld.mdoFldId = data.fieldId;
        oldMapFld.mdoFldDesc = data.fieldDesc;
        this.excelMdoFieldMappedData.push(oldMapFld);
      }
    } else {
      const availmap = this.excelMdoFieldMappedData.filter(fill => fill.columnIndex === data.index);
      if (availmap.length !== 0) {
        this.excelMdoFieldMappedData.splice(this.excelMdoFieldMappedData.indexOf(availmap[0], 1));
      }
    }
    this.requestForm.controls.mappedData.value.length = 0;
    this.requestForm.controls.mappedData.value.push(...this.excelMdoFieldMappedData);
  }

  /**
   * The function to seach from Data structure
   * @param event entered key
   * @param whatToFilter the structure to update
   */
  search(event: string, whatToFilter: string) {
    if (whatToFilter === 'module') {
      if (!event) {
        this.modulesList.length = 0;
        this.modulesList.push(...this.modulesListCopy);
        return;
      }
      this.modulesList = this.modulesList.filter((module) => module.objectdesc.toLowerCase().startsWith(event.toLowerCase()))
    }
  }

  /**
   * function to set schema name
   * @param event name of schema
   */
  setschemaName(event) {
    const updatedSchemaValue = { ...this.requestForm.controls.core_schema.value };
    updatedSchemaValue.discription = event;
    this.requestForm.controls.core_schema.setValue(updatedSchemaValue);
  }

  isSchemaSet(value): boolean {
    if ((value && !value.discription) || !value) {
      return false;
    }
    return true;
  }

  /**
   * function to format slider thumbs label.
   * @param percent percent
   */
   rangeSliderLabelFormat(percent) {
    return `${percent}%`;
  }

  /**
   * function to set the value of scheduling
   * @param runId the value of scheduling
   */
  setRunningSchedule(runId: string) {
    this.requestForm.controls.runTime.setValue((runId === 'runSchemaOnce'));
  }

  /**
   * Clear the file input so new file can be detected
   */
  clearFileInput() {
    if(this.uploadInput) {
      this.uploadedData = null;
      this.uploadInput.nativeElement.value = '';
    }
  }

  /**
   * function to upload file to server
   */
  uploadFileData() {
    this.uploadLoader = true;
    this.dmsService.uploadFile(this.requestForm.get('file').value)
      .subscribe(res => {
        this.uploadLoader = false;
        this.requestForm.get('fileSerialNo').setValue(res);
        this.setModuleValueAndTakeStep(this.data.selecteddata);
      }, (err) => {
        this.uploadLoader = false;
        this.showValidationError('File could not be uploaded.');
      });
  }

  /**
   * method to find the selected field ID
   * @param columnInde pass the column index
   */
  getSelectedFieldId(columnInde: number): string {
    const availmap = this.excelMdoFieldMappedData.filter(fill => fill.columnIndex === columnInde);
    if (availmap.length > 0) {
      return availmap[0].mdoFldId;
    }
    return '';
  }

  /**
   * Function to open dialog box and set the recieved
   * subscibers to form
   */
  addSubscribers() {
    this.globaldialogService.openDialog(NewSchemaCollaboratorsComponent, {
      selectedSubscibersList: this.subscribersList
    });
    this.dialogSubscriber = this.globaldialogService.dialogCloseEmitter
      .pipe(distinctUntilChanged())
      .subscribe((response: UserMdoModel) => {
        this.updateSubscribersList(response);
        this.dialogSubscriber.unsubscribe();
      });
  }

  /**
   * update or add subscribers in selected subscribers list
   * @param response pass the response containing the subscribers list or Object
   */
  updateSubscribersList(response: any) {
    if (Array.isArray(response) && response.length > 0) {
      const receivedData: UserMdoModel[] = response;
      this.subscribersList = [];
      receivedData.forEach((subscriber: UserMdoModel) => {
        this.subscribersList.push(this.mapSubscriberInfo(subscriber));
      })
    } else if (response && typeof response === 'object') {
      const receivedData: UserMdoModel = response;
      const index = this.subscribersList.findIndex(sub => sub.userName === receivedData.userName);
      if (index > -1) {
        this.transientService.open('Subscriber already selected', 'Okay', {
          duration: 3000
        });
        return;
      }
      this.subscribersList.push(this.mapSubscriberInfo(receivedData));
    }
  }

  /**
   * Method to map subscriber to correct format
   * @param subscriber pass the subscriber object
   * @param permissions pass the permissions object
   */
  mapSubscriberInfo(subscriber, permissions = null) {
    const mappedData = {
      userName: subscriber.userName ? subscriber.userName : '',
      userid: subscriber.userName ? subscriber.userName : '',
      groupid: subscriber.groupid ? subscriber.groupid : '',
      isAdmin: permissions ? permissions.isAdmin : subscriber.roleDesc === 'Admin',
      isReviewer: permissions ? permissions.isReviewer : subscriber.roleDesc === 'Reviewer',
      isViewer: permissions ? permissions.isViewer : false,
      isEditer: permissions ? permissions.isEditer : true,
      permissionType: PermissionType.USER,
      roleId: subscriber.roleId,
      schemaId: '',
      sno: subscriber.sNo ? subscriber.sNo : Math.floor(Math.random() * 100000000000).toString(),
      description: '',
      plantCode: this.userDetails.plantCode,
      fName: subscriber.fName ? subscriber.fName : (subscriber.userMdoModel) ? subscriber.userMdoModel.fName : '',
      lName: subscriber.lName ? subscriber.lName : (subscriber.userMdoModel) ? subscriber.userMdoModel.lName : '',
      fullName: subscriber.fullName ? subscriber.fullName : (subscriber.userMdoModel) ? subscriber.userMdoModel.fullName : '',
      filterCriteria: (subscriber.filterCriteria) ? subscriber.filterCriteria : [],
      isCopied: false
    };

    return mappedData;
  }

  /**
   * function to save the form at the end
   * and make a API request
   */
  save() {
    this.requestForm.controls.objectfullDesc.setValue(this.requestForm.controls.objectDesc.value);

    const formObject = this.requestForm.value;
    // add schema view control variable value here
    if (formObject.core_schema) {
      formObject.core_schema.schemaCategory = this.schemaCategory.value;
    }

    const objectId = formObject.objectId;
    const variantId = '0';
    const fileSerialNo = formObject.fileSerialNo;
    this.requestForm.controls.subcribers.setValue([]);

    if (!this.requestForm.controls.objectId.value) {
      const mappedArray = [];
      this.requestForm.controls.fields.value.forEach((header, index) => {
        mappedArray.push({
          columnIndex: index,
          excelFld: header.fieldId,
          mdoFldId: header.fieldId,
          mdoFldDesc: header.fieldDescri,
          excelFrstRow: null
        })
      });
      this.requestForm.controls.mappedData.setValue(mappedArray);
    }

    this.requestForm.controls.subcribers.setValue(this.subscribersList);
    this.callSaveSchemaAPI(
      objectId,
      variantId,
      fileSerialNo
    )
  }

  /**
   * remove tempId from CoreSchemaBr objects
   * @param value pass the value to modify
   */
  removeTempId(value) {
    const modified = { ...value };
    const rules = value.coreSchemaBr.map((rule) => pick(rule, Object.keys(rule).filter(key => key !== 'tempId')));
    const flattenRules=[];
    let counter=0;
    rules.forEach(element => {
      element.order=counter;
      flattenRules.push(element)
      counter++;
    if(element.dep_rules)
     element.dep_rules.forEach(child => {
       child.order=counter;
      flattenRules.push(child)
      counter++;
     });
     delete element.dep_rules;
   });
    modified.coreSchemaBr = flattenRules;
    return modified;
  }

  /**
   * method to create schema
   * @param objectId pass the object ID
   * @param variantId pass the variant ID
   * @param fileSerialNo Pass the file serial number
   */
  callSaveSchemaAPI(objectId: string, variantId: string, fileSerialNo: string) {
    const formObject = this.removeTempId(this.requestForm.value);
    const runNow = formObject.runTime;

    delete formObject.objectId;
    delete formObject.file;
    delete formObject.fileSerialNo;
    delete formObject.runNow;
    delete formObject.runTime;

    formObject[GLOBALCONSTANTS.SCHEMA_SCHEDULER] = this.currentSchedule;
    this.schemaDetailsService.saveNewSchemaDetails(
      objectId,
      runNow,
      variantId,
      fileSerialNo,
      formObject
    ).subscribe((res) => {
      if(runNow) {
        this.transientService.open('Schema run triggered successfully, Check Home page for output', 'Okay', {
          duration: 5000
        });
      } else {
        this.transientService.open('Schema created successfully', 'Okay', {
          duration: 5000
        });
      }
      this.dialogRef.close();
    }, (err) => {
      this.transientService.open('Schema cannot be created', 'Okay', {
        duration: 5000
      });
    })
  }

  /**
   * function to removeBR
   * @param index index of object to be removed
   */
  deleteBR(rule: CoreSchemaBrInfo) {
    const indexofRule= this.selectedBusinessRules.indexOf(rule);
    let label='Are you sure you want to delete this ?';
    if(this.selectedBusinessRules[indexofRule].dep_rules)
    label='After delete the dependent rules will removed';
    this.globaldialogService.confirm({ label }, (response) => {
      if (response && response === 'yes') {
        let index = null;
        if (rule.tempId) {
          const existingruleIndex = this.existingTempIds.indexOf(rule.tempId);
          if (existingruleIndex > -1) {
            this.existingTempIds.splice(existingruleIndex, 1);
          }
        }
        if(rule.brId){
          index = this.selectedBusinessRules.findIndex((brule) => brule.brId === rule.brId);
        } else {
          index = this.selectedBusinessRules.findIndex((brule) => brule.tempId === rule.tempId);
        }
        this.selectedBusinessRules.splice(index, 1);
        this.requestForm.controls.coreSchemaBr.setValue([...this.selectedBusinessRules]);
      }
    });
  }

  /**
   * Delete child business rule  by id
   * @param br delete by br id
   */
  deleteBrChild(br: CoreSchemaBrInfo,parentbr: CoreSchemaBrInfo) {
    this.globaldialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response && response === 'yes') {
        const idx=this.selectedBusinessRules.indexOf(parentbr);
        const childIdx=this.selectedBusinessRules[idx].dep_rules;
        const brToBeDelete = childIdx.filter((businessRule) => businessRule.brId === br.brId)[0];
        const index = this.selectedBusinessRules.indexOf(brToBeDelete);
       this.selectedBusinessRules[idx].dep_rules.splice(index,1);

       const existingIdIndex=this.existingTempIds.indexOf(br.tempId);
       this.existingTempIds.splice(existingIdIndex,1);

      }
    });
  }

  /**
   * Function to remove subscriber
   * @param index index of object to be removed
   */
  deleteSubscriber(index) {
    this.globaldialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response && response === 'yes') {
        this.subscribersList.splice(index, 1);
        this.requestForm.controls.subcribers.value.splice(index, 1)
      }
    });
  }

  /**
   * Update the subscriber Role
   * @param value pass the updated Role
   * @param subscriber Pass the subscriber object
   */
  updateRole(value, subscriber) {
    const subscriberId = subscriber.sno;
    const subscriberInList = this.subscribersList.find(subscriberItem => subscriberItem.sno === subscriberId);
    subscriberInList.isAdmin = value === 'isAdmin' ? true : false;
    subscriberInList.isReviewer = value === 'isReviewer' ? true : false;
    subscriberInList.isViewer = value === 'isViewer' ? true : false;
    subscriberInList.isEditer = value === 'isEditer' ? true : false;
  }

  /**
   * Toggle isEnable value for schedule using slide toggle
   * @param event toggle event
   */
  toggleScheduleStatus(event) {
    if (this.currentSchedule) {
      this.currentSchedule.isEnable = event.checked;
      this.requestForm.controls.runTime.setValue(false);
    }
  }

  /**
   * method to create filter control for dropdown values
   * @param event Pass the filter output value
   * @param subscriberIndex pass index of the susbscriber
   * @param subscriber pass the subscriber object
   */
  makeFilterControl(event: AddFilterOutput, subscriberIndex, subscriber) {
    const exitingFilterCtrl = [];

    const filterCtrl: FilterCriteria = new FilterCriteria();
    filterCtrl.fieldId = event.fldCtrl.fieldId;
    filterCtrl.type = 'DROPDOWN';
    filterCtrl.values = event.selectedValues.map(map => map.CODE);
    filterCtrl.fldCtrl = event.fldCtrl;

    exitingFilterCtrl.push(filterCtrl);

    const filterCriteria = this.subscribersList[subscriberIndex].filterCriteria;
    if (filterCriteria.length === 0) {
      exitingFilterCtrl.forEach(data => {
        this.updatesubscriber(data);
        this.subscribersList[subscriberIndex].filterCriteria.push(data);
      });
      return;
    }
    filterCriteria.forEach(res => {
      if (event.fldCtrl.fieldId === res.fieldId) {
        res.values.push(...filterCtrl.values);
        this.updatesubscriber(res);
        this.subscribersList[subscriberIndex].filterCriteria.forEach(filterobject => {
          if (filterobject.fieldId === res.fieldId) {
            filterobject = res;
          }
        });
      } else {
        exitingFilterCtrl.forEach(data => {
          this.updatesubscriber(data);
          this.subscribersList[subscriberIndex].filterCriteria.push(data);
        });
      }
    })
  }

  /**
   * function to remove allocation
   * @param allocationIndex data allocation index
   * @param subscriberIndex subscriber index
   */
  removeAllocation(ctrl: FilterCriteria, sNo: number) {
    this.subscribersList.forEach((subscriber) => {
      if (subscriber.sno === sNo) {
        subscriber.filterCriteria.forEach((res) => {
          if (res.fieldId === ctrl.fieldId) {
            subscriber.filterCriteria.splice(subscriber.filterCriteria.indexOf(res), 1);
          }
        })
      }
    })
  }

  /**
   * method to Update the filter criteria
   * @param selectedValues pass the selected values
   * @param sNo pass the subscriber serial number
   */
  updateFilterCriteria(selectedValues, sNo: number) {
    if (selectedValues.length > 0) {
      this.subscribersList.forEach((subscriber) => {
        if (subscriber.sno === sNo) {
          subscriber.filterCriteria.forEach((res) => {
            if (res.fieldId === selectedValues[0].FIELDNAME) {
              res.values = [];
              res.values = selectedValues.map((value) => value.CODE)
            }
          })
        }
      })
    }
  }

  /**
   * set the selected value to form Object
   * @param field name of the field
   * @param value value of the field
   */
  setValueToForm(field, value) {
    if (typeof value === 'string') {
      this.requestForm.controls[field].setValue(value);
    } else {
      this.requestForm.controls[field].setValue(value.value);
    }
  }

  /**
   * Get business rule list from the api
   */
  getBusinessRulesList(moduleId: string, searchString: string, brType: string, fetchCount: string) {
    const modId = moduleId ? moduleId : '';
    if (modId) {
      this.schemaService.getBusinessRulesByModuleId(modId, searchString, brType, fetchCount)
        .subscribe((rules: CoreSchemaBrInfo[]) => {
          if (rules && rules.length > 0) {
            this.businessRulesList = rules.map((rule) => { return {...rule, tempId: this.utilties.getRandomString(8) }});
          }
        });
    } else {
      this.schemaService.getAllBusinessRules()
        .subscribe((rules: CoreSchemaBrInfo[]) => {
          if (rules && rules.length > 0) {
            this.businessRulesList = rules.map((rule) => { return {...rule, tempId: this.utilties.getRandomString(8) }});
          }
        });
    }
  }

  /**
   * method to select business rules
   * @param businessRules an array of businessRules or a single business rule
   */
  selectBusinessRule(businessRules: CoreSchemaBrInfo[] | CoreSchemaBrInfo) {
    const list = Array.isArray(businessRules) ? businessRules : [businessRules];
    if(list.find(br => !this.canAllowNewBR(br))) {
      return false;
    }
    console.log(this.selectedBusinessRules,businessRules)
    if (Array.isArray(businessRules)) {
      businessRules.map((rule) => {
        const updatedObj = { ...rule, brWeightage: 0, isCopied: true,dependantStatus:RuleDependentOn.ALL };
        this.addTempIdToExisting(updatedObj.tempId).then(() => {
          this.selectedBusinessRules.push(updatedObj);
        });
      });
    } else {
      if(!this.checkIfExist(businessRules)){
        const updatedObj = { ...businessRules, brWeightage: 0, isCopied: true,dependantStatus:RuleDependentOn.ALL };
        this.addTempIdToExisting(updatedObj.tempId).then(() => {
          this.selectedBusinessRules.push(updatedObj);
        });
      } else {
        this.transientService.open('This rule is already added', 'okay', {
          duration: 2000
        });
        return;
      }
    }

    this.requestForm.controls.coreSchemaBr.setValue(this.selectedBusinessRules);
  }

  /**
   * Function to decide if we can allow current business rule to be saved based on some validations
   */
  canAllowNewBR(brInfo): boolean {
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
    const brList = this.selectedBusinessRules;
    const currentRuleType = brInfo.brType;
    let error = '';
    // Find current schema view
    const ruleViewByType = (ruleType: string) => Object.keys(rules).find(ruleView => rules[ruleView].includes(ruleType)) || 'dataQuality';
    const currentRuleView = ruleViewByType(currentRuleType);
    // Check if All are same view
    const isSameView = brList.every(rule => ruleViewByType(rule.brType) === currentRuleView);
    // Check if same rule type already exists
    const isSameType = brList.find(rule => rule.brType === currentRuleType);
    if (!isSameView) {
      error = 'A rule with a different view cannot be added to a schema!';
    } else if (isSameType && currentRuleView!=='dataQuality') {
      error = `Multiple ${currentRuleView} rules cannot be added to one schema!`;
    }
    if(error) {
      this.transientService.open(error,'ok',{duration:2000});
    }
    return !Boolean(error);
  }

  /**
   * Check if rule already exists
   * @param rule pass the rule to be checked
   */
  checkIfExist(rule) {
    let isExist: boolean;
    if (rule && rule.tempId) {
      const hasExistingTempId = this.existingTempIds.indexOf(rule.tempId) > -1;
      const hasExistingBrId = this.selectedBusinessRules.find((br) => br.brId === rule.brId) !== undefined;
      isExist = hasExistingBrId || hasExistingTempId
    }

    return isExist;
  }

  /**
   * method to get collaboratos/subscribers from the api
   * @param queryString pass query param to fetch values from the api
   */
  getCollaborators(queryString, fetchCount: number = 0) {
    this.allSubscribers = [];
    this.subscriberLoader = true;
    this.schemaDetailsService.getAllUserDetails(queryString, fetchCount)
      .subscribe((response: PermissionOn) => {
        this.subscriberLoader = false;
        if (response && response.users) {
          const subscribers: UserMdoModel[] = response.users;
          subscribers.forEach((subscriber: UserMdoModel) => {
            subscriber.selected = false;
            subscriber.userId = subscriber.userId ? subscriber.userId : Math.floor(Math.random() * 1000000000000).toString()
          });

          this.allSubscribers = subscribers;
        }
      }, () => {
        this.subscriberLoader = false;
        this.transientService.open('Error getting subscribers', 'okay', {
          duration: 1000
        })
      });
  }

  /**
   * scheck if a field is  editable
   * @param data pass the field value
   */
  isEditable(data: DataSource) {
    const exists: boolean = this.editableFieldIds.indexOf(data.mdoFldId) !== -1;
    if (this.requestForm.controls.objectId.value) {
      return exists;
    }
    return true;
  }

  /**
   * make a field editable and update the field id in an array
   * @param data pass the field value
   */
  makeEditable(data: DataSource) {
    this.editableFieldIds = [];
    setTimeout(() => {
      this.editableFieldIds.push(data.mdoFldId);
    }, 0);
  }

  /**
   * Open add schedule sidesheet for adding a schedule
   */
  openScheduleSideSheet() {
    this.globaldialogService.openDialog(ScheduleDialogComponent, {
      currentScheduler: this.currentSchedule
    });
    this.dialogSubscriber = this.globaldialogService.dialogCloseEmitter
      .pipe(distinctUntilChanged())
      .subscribe((response: SchemaScheduler) => {
        if (response) {
          this.currentSchedule = response;
        }
        this.canEditSchedule = !!this.currentSchedule;
        this.dialogSubscriber.unsubscribe();
      });
  }

  /**
   * to convert name into shortName for subscriber tab
   * @param fname firstName of the subscriber
   * @param lname lastName of the subscriber
   */
  public shortName(fName: string, lName: string) {
    if (fName.length >= 1 && lName.length >= 1) {
      return fName[0] + lName[0];
    } else {
      return '';
    }
  }

  /**
   * to return true or false to disable input values
   */
  isdisabled(value: string | number): boolean {
    if (value !== '' && value) {
      return true;
    }
    else return false;
  }

  /**
   * Function to load dropdown values of already selcted filters
   */
  loadDropValues(fldC: FilterCriteria) {
    if (fldC) {
      const dropArray: DropDownValue[] = [];
      fldC.values.forEach(val => {
        const drop: DropDownValue = { CODE: val, FIELDNAME: fldC.fieldId } as DropDownValue;
        dropArray.push(drop);
      });
      this.loadDopValuesFor = { fieldId: fldC.fieldId, checkedValue: dropArray };
    }
  }

  /**
   * Function to show chips of selected filters
   * @param ctrl Filter criteria
   */
  prepareTextToShow(ctrl: FilterCriteria): string {
    const selCtrl = ctrl.filterCtrl.selectedValues.filter(fil => fil.FIELDNAME === ctrl.fieldId);
    if (selCtrl && selCtrl.length > 1) {
      return String(selCtrl.length);
    }
    return ((selCtrl && selCtrl.length === 1) ? (selCtrl[0].TEXT ? selCtrl[0].TEXT : selCtrl[0].CODE) : 'Unknown');
  }

  /**
   * Function to update selected filters
   * @param ctrl Filter criteria
   */
  updatesubscriber(data) {
    const filter: FilterCriteria = new FilterCriteria();
    filter.fieldId = data.fieldId;
    filter.type = data.type;
    filter.values = data.values;

    const dropVal: DropDownValue[] = [];
    filter.values.forEach(val => {
      const dd: DropDownValue = { CODE: val, FIELDNAME: data.fieldId } as DropDownValue;
      dropVal.push(dd);
    })
    filter.filterCtrl = { fldCtrl: data.fldCtrl, selectedValues: dropVal };
    data.filterCtrl = filter.filterCtrl;
  }

  /**
   * function to get schedule information
   * @param schemaId: Id of schema for which schedule info needed
   */
  getScheduleInfo(schemaId: string) {
    this.schemaService.getSchedule(schemaId).subscribe((response) => {
      this.currentSchedule = response;
      response ? this.canEditSchedule = true : this.canEditSchedule = false;
    }, (error) => {
      console.log('Something went wrong when getting schedule information.', error.message);
    })
  }

  /**
   * function to get Businessrule information
   * @param schemaId: Id of schema for which BR info needed
   */
  getSchemaBrInfo(SelectedData) {
    this.requestForm.controls.core_schema.value.discription = SelectedData.schemadesc;
    this.requestForm.controls.schemaId.setValue(SelectedData.schemaId);
    this.schemaService.getBusinessRulesBySchemaId(SelectedData.schemaId).subscribe((rules: CoreSchemaBrInfo[]) => {
      this.existSchemaBrList = rules;
      rules.forEach(rule => {
        this.updateCurrentRulesList(rule);
      });
    });
  }

  /**
   * function to get Subscriber information
   * @param schemaId: Id of schema for which Subscriber info needed
   */
  getSchemaCollaboratorInfo(schemaId: string) {
    this.schemaDetailsService.getCollaboratorDetails(schemaId).subscribe((responseData: SchemaDashboardPermission[]) => {
      responseData.forEach((subscriber) => {
        subscriber.filterCriteria.forEach((data) => {
          this.updatesubscriber(data);
          if (subscriber) {
            const permission = {
              isAdmin: subscriber.isAdmin ? subscriber.isAdmin : false,
              isReviewer: subscriber.isReviewer ? subscriber.isReviewer : false,
              isViewer: subscriber.isViewer ? subscriber.isViewer : true,
              isEditer: subscriber.isEditer ? subscriber.isEditer : false,
            };
            this.mapSubscriberInfo(subscriber, permission);
          }
        });
      });
    });
  }

  /**
   * handle weightage change
   * @param event pass the change event
   * @param i pass the business rule index
   */
  weightageChange(event, i) {
    const availableWeight: number = this.getCurrentWeightageLimit(this.selectedBusinessRules[i].brWeightage);

    if(event.value <= availableWeight) {
      this.selectedBusinessRules[i].brWeightage = event.value;
    } else {
      this.selectedBusinessRules[i].brWeightage = availableWeight;
    }
  }

  /**
   * get brrule weightage
   * @param rule pass the business rule
   */
  getWeightage(rule:CoreSchemaBrInfo): number {
    return Number(rule.brWeightage);
  }

  /**
   * Function to show validation error chip on wizard
   * @param message: error message to show.
   */
  showValidationError(message: string) {
    this.uploadError.status = true;
    this.uploadError.message = message;

    setTimeout(() => {
      this.uploadError.status = false;
    }, 3000)
  }

  updateDepRule(br: CoreSchemaBrInfo, event?: any) {
    let index=null;
    if(br.brId){
      index = this.selectedBusinessRules.findIndex((brule) => brule.brId === br.brId);
    } else {
      index = this.selectedBusinessRules.findIndex((brule) => brule.tempId === br.tempId);
    }
    if(event.value!==RuleDependentOn.ALL)
    { const tobeChild=this.selectedBusinessRules[index]
    console.log(tobeChild)
    console.log(this.selectedBusinessRules)
    if(this.selectedBusinessRules[index-1].dep_rules)
    {
     this.addChildatSameRoot(tobeChild,index)
    }
    else{
    this.selectedBusinessRules[index-1].dep_rules=[];
    this.addChildatSameRoot(tobeChild,index)
    }
       const idxforChild=this.selectedBusinessRules[index-1].dep_rules.indexOf(tobeChild);
    this.selectedBusinessRules[index-1].dep_rules[idxforChild].dependantStatus=this.getSelectedDependantStatus(event.value)?.key;
    this.selectedBusinessRules.splice(index,1)
    }
  }

  addChildatSameRoot(tobeChild:CoreSchemaBrInfo,index:number){
      this.selectedBusinessRules[index-1].dep_rules.push(tobeChild)
    if(tobeChild.dep_rules)
    tobeChild.dep_rules.forEach(element=>{
      this.selectedBusinessRules[index-1].dep_rules.push(element);
    });
  }

  updateDepRuleForChild(br: CoreSchemaBrInfo,index:number, event?: any) {
    let idx=null;
    if(br.brId){
      idx = this.selectedBusinessRules.findIndex((brule) => brule.brId === br.brId);
    } else {
      idx = this.selectedBusinessRules.findIndex((brule) => brule.tempId === br.tempId);
    }
    if (this.selectedBusinessRules[idx]?.dep_rules[index]) {
      this.selectedBusinessRules[idx].dep_rules[index].dependantStatus=this.getSelectedDependantStatus(event.value)?.key;
    }
    if(event.value===RuleDependentOn.ALL)
    { const childIdx=this.selectedBusinessRules[idx]?.dep_rules[index] || {};
      console.log(childIdx)
      childIdx.dep_rules=[];
      this.selectedBusinessRules.push(childIdx)
      this.selectedBusinessRules[idx].dep_rules.splice(index,1);
    }
   }
  getSelectedDependantStatus(value: string) {
    return this.dependantStatusList.find(x => x.key === value || x.value === value) || this.dependantStatusList[0];
  }

  /**
   * Sanitize Form control value
   * @param control Form control
   */
  sanitizeValue(control) {
    control.setValue(control.value.replace(/[^a-zA-Z0-9 ]/g, ''));
  }
  sanitizeSchemaName() {
    this.requestForm.get('core_schema').patchValue({
      discription: this.requestForm.get('core_schema').value.discription.replace(/[^a-zA-Z0-9 ]/g, '')
    });
  }

  /**
   * Choose a file after confirmation
   */
  chooseDiffFile() {
    this.globaldialogService.confirm({
      label: 'This will clear all previous settings. Would you like to continue?'
    }, (response) => {
      if (response && response === 'yes') {
        this.subscribersList = [];
        this.selectedBusinessRules = [];
        delete this.currentSchedule;
        this.requestForm.patchValue({
          schemaThreshold: 100,
          runTime: true,
          core_schema: {
            discription: '',
            tenantId: '',
            schemaLimit: '1',
            owner: 'Role',
            status: '1',
            category: '2'
          }
        });
        this.step('previous');
        this.clearFileInput();
      }
    });
  }
}