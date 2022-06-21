import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CONDITIONS } from '@constants/brrule';
import { ValidationError } from '@models/schema/schema';
import { LookupRule, MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { BlocksList, ConditionalOperator, CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { LookupDatasetRuleComponent } from '@modules/schema/_components/v2/brrule-side-sheet/lookup-dataset-rule/lookup-dataset-rule.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-data-filtering',
  templateUrl: './data-filtering.component.html',
  styleUrls: ['./data-filtering.component.scss']
})
export class DataFilteringComponent implements OnInit {

  @ViewChild(LookupDatasetRuleComponent) lookupRuleComponent: LookupDatasetRuleComponent;

  coreSchemaBrInfo: CoreSchemaBrInfo = new CoreSchemaBrInfo();

  form: FormGroup = new FormGroup({
    moduleId: new FormControl('')
  });

  selectedDataref: {datasetDesc: string
  datasetId: number} = {datasetDesc: '', datasetId: 0};
  udrNodeForm: FormGroup = new FormGroup({
    blocks: new FormArray([])
  });
  operators = [];
  submitted = false;
  fieldListFiltered = [];
  udrBlockList: BlocksList = {
    blocksList: [],
    datasetList: []
  };
  moduleId;
  parentMetadata: MetadataModeleResponse = null;
  initialFieldList = [];
  isDRChild = false;
  saveRule = false;
  existingData = null;

   /**
   * To hold information about validation errors.
   */
  validationError: ValidationError = {
    status: false,
    message: ''
  }

  constructor(
    private router: Router,
    private sharedService: SharedServiceService,
    private coreService: CoreService,
    private schemaService: SchemaService,
    private snackBar: TransientService,
    private cdf: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.operators = this.possibleOperators();
    this.cdf.detectChanges();
    this.sharedService.getDataRefDetails().subscribe((details: any) => {
      if(details?.lookupRuleId) this.getBusinessRuleInfo(details.lookupRuleId);
      else this.existingData = this.getBlankReqObj();
      this.selectedDataref = details?.refDataset;
      this.moduleId = this.selectedDataref?.datasetId;
    });


  }

  close() {
    this.router.navigate([
      { outlets: { sb: null } }
    ],
      { preserveFragment: true, queryParamsHandling: 'preserve' }
    );
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
        this.parseMetadataModelResponse(res);
      }, error => {
        console.error('Error while getting field list', error);
      });
    }

    parseMetadataModelResponse(metadataModeleResponse: MetadataModeleResponse, resetFields = true) {
      if (!metadataModeleResponse) {
        return;
      }
      return;
    }


  /**
   * Return all possible operators
   */
  possibleOperators(): ConditionalOperator[] {
    // get generic operators
    const genericOp: any = new ConditionalOperator();
    genericOp.desc = CONDITIONS.common.desc;
    genericOp.childs = CONDITIONS.common.operators;

    // for numeric number field
    const onlyNum: any = new ConditionalOperator();
    onlyNum.desc = CONDITIONS.numeric.desc;
    onlyNum.childs = CONDITIONS.numeric.operators;

    // for special operators
    const specialOpe: any = new ConditionalOperator();
    specialOpe.desc = CONDITIONS.special.desc;
    specialOpe.childs = CONDITIONS.special.operators;

    return [genericOp, onlyNum, specialOpe];
  }

  saveRuleData() {
    this.saveRule = true;
    this.cdf.detectChanges();
  }

    setLookupRuleData (ev) {
      // code;
      if (ev) {
        this.saveRule = false;
        this.cdf.detectChanges();
        let reqPayload = this.getBlankReqObj();
        reqPayload.lookupRuleMetadata = ev.data.lookupRuleMetadata;
        reqPayload.udrData = ev.data.udrData;
        console.log('setLookupRuleData: reqPayload: ', reqPayload);
        this.schemaService.createUpdateBr(reqPayload).subscribe(res => {
          this.snackBar.open(`Successfully saved !`, 'Close', { duration: 3000 });
          this.sharedService.setAfterBrSave(res);
          this.close();
          return;
        }, error => {
          // this.snackBar.open(`Something went wrong `, 'Close', { duration: 3000 });
          this.showValidationError(error?.error?.errorMsg || 'Something went wrong');
          return;
        });
      }
    }

    getBusinessRuleInfo(brId) {
      this.schemaService.getBusinessRuleInfo(brId).subscribe((businessRuleInfo: CoreSchemaBrInfo) => {
        this.existingData = businessRuleInfo;
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

    getBlankReqObj() {
      return {
        sno: 0,
        brId: '',
        brType: 'BR_LOOKUP_RULE',
        refId: 0,
        fields: '',
        apiKey: null,
        regex: null,
        order: 0,
        message: null,
        script: '',
        brInfo: '',
        brExpose: 0,
        status: '1',
        categoryId: '',
        standardFunction: null,
        brWeightage: '0',
        totalWeightage: 100,
        transformation: 0,
        tableName: '',
        qryScript: '',
        dependantStatus: 'ALL',
        plantCode: '0',
        percentage: 0,
        schemaId: null,
        brIdStr: '',
        isCopied: false,
        moduleId: this.moduleId,
        udrData: {
          when: []
        },
        lookupRuleMetadata: {
          lookupDataset: this.moduleId,
          lookupType: "WITHIN_DATASET",
          type: 'WITHIN_DATASET'
        },
        transInfo: {
          lookup: {
            lookupRuleMetadata: {
              lookupDataset: this.moduleId,
              lookupType: "WITHIN_DATASET",
              type: 'WITHIN_DATASET'
            },
            udrData: {
              when: [],
              then: []
            },
            type: "WITHIN_DATASET",
          },
          lookupRuleMetadata: {
            lookupDataset: this.moduleId,
            lookupType: "WITHIN_DATASET",
            type: 'WITHIN_DATASET'
          },
          udrData: {
            when: [],
            then: []
          },
          type: "lookup"
        }
      }
    }

}
