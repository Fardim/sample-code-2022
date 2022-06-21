import { Component, ElementRef, EventEmitter, Inject, LOCALE_ID, OnDestroy, OnInit, Output, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { ClassAttributeDetail, GenerateDescriptionResponse, ModuleClassResponse, Process } from '@modules/transaction/model/transaction';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { SchemaService } from '@services/home/schema.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';
import { debounce } from 'lodash';
import { ListValueSaveModel } from '@models/list-page/listpage';
import { LanguageList } from 'src/app/_constants';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { CoreCrudService } from '@services/core-crud/core-crud.service';

@Component({
  selector: 'pros-transaction-generate-description',
  templateUrl: './transaction-generate-description.component.html',
  styleUrls: ['./transaction-generate-description.component.scss']
})
export class TransactionGenerateDescriptionComponent extends TransactionControlComponent implements OnInit, OnDestroy {
  @ViewChild('classOptionsInput') classOptionsInput: ElementRef<HTMLInputElement>;
  isShowFieldSection = false;
  frmGroup: FormGroup;
  classList$: Observable<ModuleClassResponse[]>;
  attributeDropValues = [];
  attrSubscription: Subscription;
  attributeEditValue;
  // tenantId: string;
  isInitial = true;
  // isTriggerFormArrayProcess = false;
  /**
   * Subject used to reload dropdown options
   */
  reloadOptionSub: Subject<ListValueSaveModel> = new Subject<ListValueSaveModel>();
  /**
   * subscription array to hold all services subscriptions
   */
  subscriptions: Subscription[] = [];
  /**
   * subscription to hold formarray value change
   */
  formArraySubscription: Subscription;
  /**
   * Event emitter to update parent material description
   */
  @Output() evtParentDesciptionValueUpdate: EventEmitter<string> = new EventEmitter<string>();

  @Input() expansionview = false;

  @Input() flowId: string;
  @Input() stepId: string;

  /**
   * UOM dropdown options..
   */
  uomOptionList: Array<{ text: string, code: string }> = [];
  /***
   * Get form array controles
   */
  get frmArray() {
    return this.frmGroup.get('frmArray') as FormArray;
  }
  /**
   * Search the dropdown options..
   */
  delayedCallWithTransLib = debounce((searchText: string) => {
    this.getClassList(searchText);
  }, 400);
  // oldValuesArr = [];
  constructor(
    private router: Router,
    @Inject(LOCALE_ID) public locale: string,
    private formBuilder: FormBuilder,
    private schemaService: SchemaService,
    public transService: TransactionService,
    public dataControlService: DataControlService,
    private sharedService: SharedServiceService,
    private cdr: ChangeDetectorRef,
    private ruleService: RuleService,
    private coreCrudService: CoreCrudService
  ) {
    super(transService, dataControlService);
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';

    if(this.expansionview) {
      this.afterClick();
    }

    this.sharedService.getAfterDescGeneratorExpansionViewClose().subscribe(resp => {
      if(resp && resp.fieldId === this.fieldObj.fieldId) {
        this.frmGroup.patchValue({
          ...resp.fg.value
        });
        // this.frmGroup = resp.fg;
      }
    });

    this.frmGroup.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(() => {
      if(this.expansionview) {
        this.sharedService.setAfterDescGeneratorExpansionViewClose({fieldId: this.fieldObj.fieldId, fg: this.frmGroup});
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.attrSubscription) {
      this.attrSubscription.unsubscribe();
    }
    if (this.formArraySubscription)
      this.formArraySubscription.unsubscribe();
  }

  /**
   * Search the transformation rule ...
   * @param searchStr search the rule based on this params
   */
  searchOption(searchStr: string) {
    if(searchStr == '') {
      this.frmGroup.patchValue({
        shortDesc: '',
        longDesc: ''
      });
    }
    this.delayedCallWithTransLib(searchStr);
  }

  initForm() {
    const masterData = this.transService.getMasterData(this.activeForm.isPrimary, this.moduleId);
    let classModeField = '';
    let classCodeField = '';
    let shortDesc = '';
    let longDesc = '';

    if (masterData.mdoRecordES && masterData.mdoRecordES.descriptions && masterData.mdoRecordES.descriptions[0]) {
      const { classCode, classMode, attributes } = masterData.mdoRecordES.descriptions[0];
      if (attributes[this.locale]) {
        shortDesc = attributes[this.locale].shortDesc;
        longDesc = attributes[this.locale].longDesc;
        classModeField = classMode;
        classCodeField = classCode;
        this.attributeEditValue = attributes[this.locale].attrs;
      }
    }

    this.sharedService.descGenFormGroup$.subscribe(resp => {
      if(resp && resp.fieldId === this.fieldObj.fieldId) {
        this.frmGroup = resp.fg;
      } else {
        this.frmGroup = this.formBuilder.group({
          classMode: classModeField,
          classCode: classCodeField,
          classObj: '',
          classField: [{ value: '', disabled: this.isProcessView }],
          shortDesc: [{ value: shortDesc, disabled: true }],
          longDesc: [{ value: longDesc, disabled: true }],
          frmArray: this.formBuilder.array([])
        });
      }
    })
  }

  afterClick() {
    this.isShowFieldSection = !this.isShowFieldSection;
    if (this.isInitial) {
      this.initForm();
      this.getClassList('');
    }

    this.isInitial = false;
  }

  getDetails(type: string, formField) {
    const activeStructure = this.transService.getHierarchyListDetails(this.activeForm, this.moduleId);

    if (type === 'rules') {
      return [];
    } else if (type === 'tabDetails') {
      return {
        tabDetails: {
          isTabReadOnly: false
        }
      }
    } else if (type === 'control') {
      return formField.controls.attrFieldValue;
    } else if (type === 'uomControl') {
      return formField.controls.attrUomFieldValue;
    } else if (type === 'uomOptions') {
      return this.uomOptionList[formField.value.fieldId];
    } else {
      return {
        fieldId: formField.value.fieldId,
        structureId: activeStructure ? activeStructure.activeStructId : null,
        fieldCtrl: {
          isMandatory: formField.value.isMandatory,
          description: type === 'uomField' ? 'UoM' : formField.value.label,
          isCheckList: type === 'uomField' ? false : formField.value.isCheckList,
          numberOnly: formField.value.numberOnly,
        }
      }
    }
  }

  getClassList(str: string) {
    const subscription = this.ruleService.getAllClass(this.moduleId, str).subscribe((data: Array<ModuleClassResponse>) => {
      if (this.frmGroup.value.classMode && this.frmGroup.value.classCode && !str) {
        const { classMode, classCode } = this.frmGroup.value;
        const classObj = data.find(obj => obj.code === classCode && obj.mod === classMode);
        if (classObj) {
          this.frmGroup.patchValue({
            classObj,
            classCode: '',
            classMode: ''
          });
          this.classSelected(false);
        }
      }

      this.classList$ = of(data);
    }, error => console.error(`Error : ${error}`));
    this.subscriptions.push(subscription);
  }

  addNewDescription(data) {
    this.router.navigate([{ outlets: { sb: [...(this.router as any).currentUrlTree.root.children.sb.segments.map(m => m.path)], outer: `outer/add-material-description/${this.moduleId}/${data.fieldId}` } }], { queryParamsHandling: 'preserve' });

    if (!this.attrSubscription) {
      this.attrSubscription = this.transService.getNewAttributeValue.subscribe((attrData: ListValueSaveModel) => {
        this.reloadOptionSub.next(attrData);
      })
    }
  }

  isUoMExists(item): boolean {
    if (this.getDetails('uomOptions', item) && this.getDetails('uomOptions', item).length > 0) return true;
    return false;
  }

  classSelected(isFromSelection: boolean, event?: MatAutocompleteSelectedEvent) {
    let selectedObj = this.frmGroup.value.classObj;
    if (isFromSelection)
      selectedObj = event.option.value;

    if (selectedObj) {
      this.frmGroup.patchValue({
        classObj: selectedObj,
        classField: (`${selectedObj.modLong ? selectedObj.codeLong + ' - ' + selectedObj.modLong : selectedObj.codeLong}`)
      });
      const { uuid } = selectedObj;
      this.coreCrudService.getAttributeList(uuid).subscribe(res => {
        this.createAttibuteForm(res.response);
      }, error => console.error(`Error : ${error}`));
    }
  }

  createAttibuteForm(data: Array<ClassAttributeDetail>) {
    const frmArray = this.frmArray;
    frmArray.clear();// to clear already exist value
    // this.isTriggerFormArrayProcess = true;
    if (this.formArraySubscription)
      this.formArraySubscription.unsubscribe();

    data.forEach(obj => {
      let label = 'Unknown';
      const langLabelObj = obj.labels.find(langObj => langObj.language === this.locale);
      if (langLabelObj) {
        label = langLabelObj.label || obj.charDesc;
      }
      let attrFieldValue = '';
      if (this.attributeEditValue && this.attributeEditValue[obj.uuid]) {
        attrFieldValue = this.attributeEditValue[obj.uuid].vc[0].t || this.attributeEditValue[obj.uuid].vc[0].c;
      }
      frmArray.push(this.formBuilder.group({
        attrFieldValue,
        attrUomFieldValue: '',
        label, // hidden values
        dataType: obj.dataType,  // hidden values
        fieldId: obj.uuid,
        isCheckList: obj.isChecklist,
        numberOnly: obj.fieldType === 'NUMC' ? true : false,
        isMandatory: obj.isMandatory,
        charDesc: obj.charDesc,
        charCode: obj.charCode,
        fieldType: obj.fieldType
      }));

      let uomList = [];
      if (obj.defaultUoM && obj.defaultUoM.length > 0) {
        uomList = obj.defaultUoM.filter((item) => !!item).map(val => {
          return { text: val, code: val };
        });
      }
      this.uomOptionList[obj.uuid] = uomList;
      // this.oldValuesArr[obj.uuid] = { value: attrFieldValue };
    });
    this.formArraySubscription = this.frmArray.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(() => {
      this.generateDescriptionDetail();
    });
  }

  getAttributeDropdownList(uuid: string) {
    this.schemaService.getFieldDropValues(this.moduleId, uuid, '').subscribe((data: Array<DropDownValue>) => {
      this.attributeDropValues[uuid] = data;
    }, error => console.error(`Error : ${error}`));
  }

  filterValues(formValues) {
    const { fieldId } = formValues;
    return of(this.attributeDropValues[fieldId]);
  }

  generateDescriptionDetail() {
    const { classObj } = this.frmGroup.value;
    const formArrayControls = this.frmArray.controls;

    if (classObj && classObj.code && classObj.mod) {
      const attributeCorReq = [];
      const attrs = {};
      formArrayControls.forEach(frmCtrl => {
        const { value, invalid } = frmCtrl;
        if (!value.attrFieldValue || invalid) {
          return false;
        }
        let attributeValue = '';
        if ((value.fieldType === 'PICKLIST' || value.fieldType === 'DROPDOWN') && typeof value.attrFieldValue === 'object') {
          attributeValue = value.attrFieldValue.map(fldObj => fldObj.code).join(',');
        } else {
          attributeValue = value.attrFieldValue;
        }
        if (attributeValue) {
          let uomValue = '';
          if (value.attrUomFieldValue && value.attrUomFieldValue[0])
            uomValue = value.attrUomFieldValue[0].text;

          attributeCorReq.push({
            attributeCodevc: value.fieldId,
            attributeValvc: attributeValue,
            uomCodevc: uomValue
          });
          attrs[value.fieldId] = {
            fld: value.fieldId,
            vc: [{
              c: attributeValue,
              t: ''
            }],
            oc: null,
            bc: [],
            uom: {
              oc: [],
              vc: [{
                c: uomValue,
                t: ''
              }]
            }
          }

          if ((this.process === Process.change || this.process === Process.approve)) {
            if (this.attributeEditValue[value.fieldId]?.vc[0].c !== attributeValue) {
              attrs[value.fieldId].oc = [{ c: this.attributeEditValue[value.fieldId].vc[0].c, t: '' }];
            }
            if (this.attributeEditValue[value.fieldId]?.uom && this.attributeEditValue[value.fieldId].uom.vc && this.attributeEditValue[value.fieldId].uom.vc[0].c !== '' && this.attributeEditValue[value.fieldId]?.uom.vc[0].c !== uomValue) {
              attrs[value.fieldId].uom.oc = [{ c: this.attributeEditValue[value.fieldId].uom.vc[0].c, t: '' }];
            }
          }
        }
      });
      // used for error side sheet
      this.transService.setDescriptionFormData({ tabId: this.tabDetails.tabid, frmArray: this.frmArray });
      const activeForm = this.dataControlService.activeForm$.getValue();
      if (attributeCorReq.length > 0) {
        const descObj = {
          moduleId: this.moduleId,
          nounCodevc: classObj.code,
          modCodevc: classObj.mod,
          attributeCorReqDesList: attributeCorReq,
          languageList: LanguageList,
          recordES: this.transService.getMasterData(this.activeForm.isPrimary, this.moduleId, activeForm ? activeForm.objnr : null).mdoRecordES
        }
        // API CALL
        console.log('descObj', descObj);
        this.ruleService.getGenDescription(descObj).subscribe((resp: GenerateDescriptionResponse) => {
          this.frmGroup.patchValue({
            shortDesc: '',
            longDesc: ''
          });
          if (resp.response && resp.response.allLangDesc && resp.response.allLangDesc.length > 0) {
            const langObj = resp.response.allLangDesc.find(obj => obj.lang.toLowerCase() === this.locale);
            if (langObj) {
              this.frmGroup.patchValue({
                shortDesc: langObj.shortDesc,
                longDesc: langObj.longDesc
              });

              // update in master object
              this.transService.updateDescription(classObj.code, classObj.mod, this.locale, langObj.shortDesc, langObj.longDesc, attrs, this.moduleId, activeForm ? activeForm.objnr : null);
              // update the parent field description
              this.evtParentDesciptionValueUpdate.emit(langObj.shortDesc);
            }
          }
        }, error => console.error(`Error : ${error}`));
      }
    }
  }

  get isProcessView(): boolean {
    return this.process === Process.view;
  }

  openExpansionView() {
    this.sharedService.setDescGenFormGroupSub({fieldId: this.fieldObj.fieldId, fg: this.frmGroup});
    this.router.navigate([{ outlets: {sb: this.getSbOutletLink(), outer: `outer/transaction/${this.moduleId}/generate-descriptioin-expansion-view//${this.layoutId}/${this.recordId}/${this.tabDetails.tabid}/${this.fieldObj.fieldId}/${this.process}/${this.stepId}`}}], {queryParamsHandling: 'preserve', preserveFragment: true});
  }

  getSbOutletLink() {
    return [...(this.router as any).currentUrlTree.root.children.sb.segments.map(m=> m.path)];
  }
}
