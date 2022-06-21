import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BlocksList, ConditionalOperator, UDRBlocksModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BlockType } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-cdktree.service';
import { TragetInfo, OldValueInfo } from 'src/app/_constants';

@Component({
  selector: 'pros-blocks-hierarchy',
  templateUrl: './blocks-hierarchy.component.html',
  styleUrls: ['./blocks-hierarchy.component.scss']
})
export class BlocksHierarchyComponent implements OnInit, OnChanges {

  @Input() moduleId: string;
  // holds operator list for block operator
  @Input() operatorsList: any = [];
  // holds form group for blocks
  @Input() blocksGrp: FormGroup;
  // holds source fields list for blocks
  @Input() sourceFldList: ConditionalOperator[] = [];
  @Input() createDefaultBloc = true;
  // emits event for triggering fields list update based on search string
  @Output() updateFldList: EventEmitter<any> = new EventEmitter();
  // gets conditional blocks list
  @Input() set blocksList(data: BlocksList) {
    this.datasetList = data.datasetList || [];

    if (data.blocksList.length) {
      this.setBlockFormData(data.blocksList, this.blocksGrp, 'blocks');
    } else if (!data.blocksList.length && this.createDefaultBloc && data.blockType !== 'when') {
      const block: UDRBlocksModel = new UDRBlocksModel();
      block.blockType = BlockType.AND;
      block.conditionOperator = '';
      const blocks: UDRBlocksModel[] = [block];
      this.setBlockFormData(blocks, this.blocksGrp, 'blocks');
    }
  };

  // source field list
  @Input() sourceList: any;
  // target field metadata
  @Input() targetListMetaData: any;
  // show/hide regex boolean
  @Input() showRegex: boolean;
  @Input() parentMetadata: any;
  @Input() initialSrcList: any;
  @Input() isNewModule: any;
  @Input() showResultCount: boolean;
  @Input() submitted: boolean;

  // oldField metadata
  @Input() oldListMetaData: any;
  @Input() isShowOldValue = false;
  datasetList = [];
  @Input() blockNotMandatory: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * creates form data based on blocks list recursively for childs as well
   * @param blocks list of conditional blocks
   * @param formGrp form group that contains form array
   * @param arrayName form array that holds conditional blocks
   */
  setBlockFormData(blocks, formGrp, arrayName) {
    const formArr = this.getFormArray(formGrp, arrayName);
    blocks.forEach((blk: UDRBlocksModel) => {
      const formGroup = new FormGroup({
        condition: new FormControl(blk.blockType, [Validators.required]),
        operator: new FormControl(blk.conditionOperator, [Validators.required]),
        sourceFldCtrl: new FormControl(this.getSourceFldCtrl(blk.conditionFieldIdCtrl, blk.sourceObjectType), [Validators.required]),
        preSelectedSourceFld: new FormControl(blk.conditionFieldId),
        sourceFldObjType: new FormControl(blk.sourceObjectType),
        targetFldCtrl: new FormControl(blk.conditionalFieldValueCtrl),
        preSelectedTargetFld: new FormControl((blk.targetInfo === TragetInfo.VALUE ? blk.conditionFieldValue : blk.conditionValueFieldId)),
        childs: new FormArray([]),
        regexCtrl: new FormControl(blk.sRegex),
        conditionFieldStartValue: new FormControl(blk.conditionFieldStartValue),
        conditionFieldEndValue: new FormControl(blk.conditionFieldEndValue),
        targetInfo: new FormControl(blk.targetInfo),
        oldFldCtrl: new FormControl(blk.conditionalOldValueCtrl),
        preSelectedOldFld: new FormControl((blk.oldValueInfo === OldValueInfo.VALUE ? blk.oldFieldValue : blk.oldValueFieldId)),
        oldValueInfo: new FormControl(blk.oldValueInfo)
      });
      formArr.push(formGroup);

      if (blk.childs && blk.childs.length) {
        this.setBlockFormData(blk.childs, formGroup, 'childs');
      }
    });
  }

  /**
   * updates field descri in source ctrl...
   * @param ctrl source field ctrl
   * @param srcModuleId selected source field ctrl
   * @returns updated ctrl
   */
  getSourceFldCtrl(ctrl, srcModuleId) {
    let res: any;
    if (ctrl) {
      res = ctrl;
      if (srcModuleId && this.datasetList) {
        const module = this.datasetList.find(x => x.moduleId === srcModuleId);
        if (module) {
          const desc = res.fieldDescri ? res.fieldDescri : (res.fieldDesc ? res.fieldDesc : res.fieldId);
          if (!desc.includes(`${module.moduleDesc}/`)) {
            res.fieldDescri = `${module.moduleDesc}/${desc}`;
          }
        }
      }
    }

    return res;
  }

  /**
   * returns form array from a form group
   * @param formGrp form group that contains the form array
   * @param arrayName form array name
   * @returns form array
   */
  getFormArray(formGrp: FormGroup, arrayName: string): FormArray {
    const blocks = formGrp.get(arrayName) as FormArray;
    return blocks;
  }

  /**
   * adds block as child or parent based on type
   * @param ev output event that contains type and form group
   * @param parentFormArr parent form array
   */
  addBlock(ev, parentFormArr: FormArray) {
    let condition = 'AND';
    if (ev && ev.type === 'parent') {
      if (parentFormArr.controls.length) {
        const formGrp = parentFormArr.controls[0] as FormGroup;
        condition =  formGrp?.controls?.condition?.value || 'AND';
      }
    } else if (ev && ev.type === 'child') {
      const child = ev.formGrp.get('childs') as FormArray;
      if (child.controls.length) {
        const formGrp = child.controls[0] as FormGroup;
        condition =  formGrp.controls.condition.value;
      }
    }

    const block = new FormGroup({
      condition: new FormControl(condition, [Validators.required]),
      targetFldCtrl: new FormControl(''),
      preSelectedTargetFld: new FormControl(''),
      operator: new FormControl('', [Validators.required]),
      sourceFldCtrl: new FormControl('', [Validators.required]),
      preSelectedSourceFld: new FormControl(''),
      sourceFldObjType: new FormControl(''),
      childs: new FormArray([]),
      regexCtrl: new FormControl(''),
      conditionFieldStartValue: new FormControl(''),
      conditionFieldEndValue: new FormControl(''),
      targetInfo: new FormControl(TragetInfo.VALUE),
      oldFldCtrl: new FormControl(''),
      preSelectedOldFld: new FormControl(''),
      oldValueInfo: new FormControl('')

    });

    if (ev && ev.formGrp && ev.type === 'child') {
      const child = ev.formGrp.get('childs') as FormArray;
      child.push(block);
    } else if (ev && ev.type === 'parent') {
      parentFormArr.push(block);
    }
  }

  /**
   * removes block at the provided index from provided form array
   * @param formArr form array
   * @param index current index of form group in form array
   */
  removeBlock(formArr: FormArray, index: number): void {
    formArr.removeAt(index);
  }

  /**
   * triggers fields list update in parent component
   * @param ev event that contains list type and search string
   */
  updateList(ev) {
    this.updateFldList.emit(ev);
  }

  /**
   * updates condition for all parents of same level
   * @param ev output event
   * @param formArr form array that contains updated condition
   */
  updateParallelCondition(ev, formArr: FormArray) {
    formArr.controls.forEach((block) => {
      const formGrp = block as FormGroup;
      formGrp.controls.condition.setValue(ev);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
      if(changes?.submitted?.currentValue) {
        this.submitted = changes?.submitted?.currentValue;
      }
  }
}
