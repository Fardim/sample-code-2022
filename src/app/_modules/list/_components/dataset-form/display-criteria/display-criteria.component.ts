import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { CoreService } from '@services/core/core.service';
import { CONDITIONS } from 'src/app/_constants/brrule';
import { BlocksList, BusinessRuleType, CoreSchemaBrInfo, UDRBlocksModel, UdrModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { TragetInfo } from 'src/app/_constants';

class ConditionalOperator {
  desc: string;
  childs: string[];
}

@Component({
  selector: 'pros-display-criteria',
  templateUrl: './display-criteria.component.html',
  styleUrls: ['./display-criteria.component.scss']
})
export class DisplayCriteriaComponent implements OnInit {

  moduleId: string;
  moduleName = '';
  udrId: string;
  operatorList = [];
  fieldsList = [];
  metataData: MetadataModeleResponse = null;

  criteriaForm: FormGroup = new FormGroup({
    blocks: new FormArray([]),
  });

  existingBloks: BlocksList = {
    blocksList: [],
    datasetList: []
  };;
  parentModuleId = '';

  initialFieldsList = [];
  submitted = false;

  constructor(public router: Router, public route: ActivatedRoute,
    private coreService: CoreService,
    private schemaService: SchemaService,
    private transientService: TransientService,
    private sharedService: SharedServiceService) { }


  ngOnInit() {
    this.operatorList = this.possibleOperators();
    this.route.params.subscribe(params => {
      this.moduleId = params.moduleId;
      this.getFieldsByModuleId('', true);
      this.udrId = params.udrId && params.udrId !=='new' ? params.udrId : '';
      if(this.udrId && this.udrId !== 'new') {
        this.getCriteriaDetails();
      }
    })
  }

  updateFldList(ev) {
    if (ev && ev.searchString && typeof(ev.searchString) !== 'string') {
      return;
    };

    const searchStr = ev.searchString || '';
    if (ev && ev.type === 'sourceList') {
      this.getFieldsByModuleId(searchStr, false);
    }
  }

  getCriteriaDetails() {
    this.schemaService.getBusinessRuleInfo(this.udrId)
    .subscribe(resp => {
      this.criteriaForm = new FormGroup({
        blocks: new FormArray([]),
      });
      this.existingBloks = {... this.existingBloks, blocksList: resp.udrData?.when || []};
    }, error => console.error(`Error : ${error.message}`));
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
   * function to get the fields on basis of module
   */
   getFieldsByModuleId(searchString, initialLoad = false) {
    if (!this.moduleId) { return };

    this.coreService.getMetadataFieldsByModuleId([this.moduleId], searchString).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      this.parseMetadataModelResponse(metadataModeleResponse, initialLoad);
    }, (err) => {
      console.error(`Error:: ${err.message}`);
      if (this.metataData) {
        this.parseMetadataModelResponse(this.metataData);
      }
    });
  }

  parseMetadataModelResponse(response: MetadataModeleResponse, initialLoad = false) {
    const fldGroups = [];
    // for header
    const headerChilds: Metadata[] = [];
    if(response.headers) {
      Object.keys(response.headers).forEach(header=>{
        const res = response.headers[header];
        headerChilds.push({
          fieldId: res.fieldId,
          fieldDescri: res.fieldDescri,
          isGroup: false,
          childs: [],
          moduleName: this.moduleName,
          moduleId: this.moduleId
        });
      });
    }
    fldGroups.push({
      fieldId: 'header_fields',
      fieldDescri: this.moduleName ? `${this.moduleName}/Header fields` : 'Header fields',
      isGroup: true,
      childs: headerChilds,
      moduleName: this.moduleName,
      moduleId: this.moduleId
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
                childs:[],
                moduleName: this.moduleName,
                moduleId: this.moduleId
              });
          });
        }
        fldGroups.push({
          fieldId: grid,
          fieldDescri: this.moduleName ? `${this.moduleName}/${response.grids[grid].fieldDescri}` : response.grids[grid].fieldDescri,
          isGroup: true,
          childs,
          moduleName: this.moduleName,
          moduleId: this.moduleId
        });
      })
    }

    // for hierarchy response transformations
    if(response && response.hierarchyFields) {
      Object.keys(response.hierarchyFields).forEach(hkey => {
        const childs: Metadata[] = [];
        Object.keys(response.hierarchyFields[hkey]).forEach(fld=>{
          const fldCtrl = response.hierarchyFields[hkey][fld];
          childs.push({
            fieldId: fldCtrl.fieldId,
            fieldDescri: fldCtrl.fieldDescri,
            isGroup: false,
            childs:[],
            moduleName: this.moduleName,
            moduleId: this.moduleId
          });
        });
        fldGroups.push({
          fieldId: `Hierarchy_${hkey}`,
          fieldDescri: `Hierarchy ${hkey}`,
          isGroup: true,
          childs,
          moduleName: this.moduleName,
          moduleId: this.moduleId
        });
      });
    }

    this.fieldsList = fldGroups;
    if(initialLoad) {
      this.metataData = response;
      this.initialFieldsList = JSON.parse(JSON.stringify(this.fieldsList));
    }
    console.log('Fields list ', this.fieldsList);
  }

  save() {
    console.log(this.criteriaForm.value);

    this.submitted = true;
    if(!this.criteriaForm.valid) {
      this.transientService.open('Please complete the required field(s).', null, { duration: 2000, verticalPosition: 'bottom'});
      return;
    }

    const udrDto: UdrModel = new UdrModel();
    udrDto.brInfo = {
      brId: this.udrId,
      brIdStr: this.udrId,
      brType: BusinessRuleType.BR_CUSTOM_SCRIPT,
      moduleId: this.moduleId,
      brWeightage: '10'
    } as CoreSchemaBrInfo;

    const blockList: Array<UDRBlocksModel> = this.getBlocksData(this.criteriaForm.value.blocks);
    udrDto.when = blockList;
    udrDto.objectType = this.moduleId;

    const udrBrInfo: CoreSchemaBrInfo = udrDto.brInfo;
    udrBrInfo.udrData = {
      when: blockList
    } as UdrModel;

    this.schemaService.saveUpdateUDR(udrBrInfo).subscribe(res => {
      console.log(res);
      if(res) {
        this.sharedService.setDisplayCriteriaData(res);
        this.close();
      }
    }, error => {
      this.transientService.open('Something went wrong !', null, { duration: 2000, verticalPosition: 'bottom'});
      console.error(`Error:: ${error.message}`);
    });
  }

  /**
   * converts form data into response format of block data
   * @param blocks block data
   * @param targetObjId target field id
   * @returns converted blocks list
   */
   getBlocksData(blocks, targetObjId = '') {
    const possibleConditions = ['And', 'Or'];
    const result = [];
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
      data.objectType = this.parentModuleId || '';
      data.sRegex = blk.regexCtrl;
      data.targetInfo = blk.targetInfo;
      data.childs = blk.childs ? this.getBlocksData(blk.childs, targetObjId) : [];
      data.order = ind;
      data.sourceObjectType = blk.sourceFldObjType;
      data.targetObjectType = (blk.targetInfo === TragetInfo.VALUE) ? '' : targetObjId;

      result.push(data);
    });

    return result;
  }

  /**
   * close the side sheet
   */
  close() {
    this.router.navigate([{ outlets: { outer: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }

}
