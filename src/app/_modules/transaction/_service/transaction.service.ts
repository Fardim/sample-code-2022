import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Validators, FormGroup } from '@angular/forms';
import { DatasetForm, ListValueSaveModel } from '@models/list-page/listpage';
import { Subject, BehaviorSubject } from 'rxjs';
import { Process, FieldResponse, FieldMapping, TabResponse, CurrentReferenceFormDetails, MSGFN, ActiveForm } from '../model/transaction';
import { AlphaNumericCheck } from '@modules/transaction/validators/alpha-num-check';
import { isEqual } from 'lodash';
import { TransformationService } from '../../../_services/transformation/transformation.service';
import { RuleTransformationReq } from '@models/transformation';
import { Utilities } from '@models/schema/utilities';
import { CoreService } from '@services/core/core.service';
import { TransientService } from 'mdo-ui-library';

@Injectable()
export class  TransactionService {

  /**
   * The data object data ...
   */
  /*  {
    primary: {[key: string]: {[key: string]: MDORecord}},
    relatedDatasets: {[key: string]: {[key: string]: MDORecord}}
  } */
  masterData: any = { primary: {}, relatedDatasets: {} };
  parentDatasetIdSub: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private newAttributeSub: Subject<ListValueSaveModel> = new Subject();

  /**
   * saved records
   */
  savedRecordData$: BehaviorSubject<any> = new BehaviorSubject<any>('INITIAL');

  /**
   * Behaviour subject to run all rules on load
   */
  runAllRules$: BehaviorSubject<any> = new BehaviorSubject<boolean>(false);

  /**
   * update control validators as per the rules
   */
  updateValidators: Subject<any> = new Subject<any>();
  /**
   * fieldDetails
   */
  fieldDetails: FieldMapping = {};

  /**
   * update table field validators
   */
  updateTableValidators: Subject<any> = new Subject<any>();

  /**
   * Update dependent Dropdowns
   */
  updateDependentDropdownOptions: Subject<any> = new Subject<any>();

  descriptionFormData;

  /**
   * Number of tabs in the form
   */
  numberOfTabs: number | undefined = undefined;

  /**
   * Number of tabs whose fields are loaded
   */
  numberOfLoadedTabs: number | undefined = undefined;

  /**
   * is Form Rules loaded
   */
  isFormRulesLoaded = false;

  /**
   * Holds the rules list
   */
  rules: any = {};

  /**
   * layout details
   */
  layoutDetails: DatasetForm;

  hierarchyKeyFieldDetails: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  hierarchiesRowsTemplates: any = {};
  hierarchyListDetails = { primary: {}, relatedDatasets: {} };
  datasetToTemplateMapping: { [moduleId: string]: {} } = {};
  newChildRecordAdded: Subject<string> = new Subject<string>();
  numberSettingChange: Subject<any> = new Subject<any>();
  dataReferenceFieldToLayoutMapping: { [fieldId: string]: { layoutId: string; moduleId: string } } = {};
  formToDataRefMapping: { [formId: string]: { [moduleId: string]: {} } } = {};

  loadDataReflayout: Subject<any> = new Subject<any>();

  activeStructuresSub: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([1]);
  activeStructures$ = this.activeStructuresSub.asObservable();
  duplicateRecordsDetails: BehaviorSubject<{ brId: string; resultList: any }> = new BehaviorSubject(null);

  constructor(
      @Inject(LOCALE_ID) public locale: string,
      private transformationService: TransformationService,
      private utilityService: Utilities,
      private coreService: CoreService,
      private transientService: TransientService,
    ) { }

  getLocale(): string {
    const locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    return locale;
  }
  getMasterData(isPrimaryDataset?, datasetId?, objnr?, refDetail: CurrentReferenceFormDetails | null = null) {
    let moduleId = datasetId;
    let isPrimary = isPrimaryDataset;
    if(refDetail) {
      moduleId = refDetail.parentModuleId;
      isPrimary = refDetail.isParentModulePrimary;
    }
    if (!moduleId) {
      return this.masterData;
    }
    let allRecords: any = {};
    if(isPrimary) {
      allRecords = this.masterData.primary[moduleId] ? this.masterData.primary[moduleId] : null;
      return !refDetail ? allRecords : allRecords?.mdoRecordES?.[refDetail.path]?.[refDetail.fieldId]?.mdoRecord;
    } else {
      allRecords = this.masterData.relatedDatasets[moduleId];
    }
    if(!allRecords) return null;
    const objectNumber = objnr ? objnr : (Object.keys(allRecords).length ? Object.keys(allRecords)[0] : null);
    return objectNumber ? (!refDetail ? allRecords[objectNumber] : allRecords?.[objectNumber]?.mdoRecordES?.[refDetail.path]?.[refDetail.fieldId]?.mdoRecord) : null;
  }

  getRelatedDatasetMasterData(moduleId) {
    if(!moduleId)
      return this.masterData;
    return this.masterData?.relatedDatasets?.[moduleId] || {};
  }

  setMasterData(
    isPrimaryDataset,
    moduleId,
    data,
    isTemplate = true,
    objnr = null,
    refRecord: CurrentReferenceFormDetails | null = null,
    process: string = Process.create,
    isCopied = false
  ) {

    if(isCopied){
      this.masterData = data;
      this.savedRecordData$.next('INITIAL');
      return;
    }
    const alreadySaved = isPrimaryDataset ? !!this.masterData.primary[moduleId] : !!this.masterData.relatedDatasets[moduleId];
    if (alreadySaved && isPrimaryDataset && !refRecord) {
      return;
    }
    let updatedData = data;

    if (!updatedData.mdoRecordES) {
      updatedData.mdoRecordES = {
        hdvs: data.hdvs || {},
        gvs: data.gvs || {},
        hyvs: data.hyvs || {}
      };
    }

    if (isTemplate) {
      updatedData = this.removeDefaultRowFromTemplate(moduleId, data);
    }

    if(process === Process.copy) {
      if(updatedData.mdoRecordES)
        updatedData = this.addCopyKeyToMasterData(updatedData);
    }

    const controlData = updatedData?.controlData;

    if (controlData && !controlData.moduleId) {
      const templateModuleId = refRecord ? refRecord.moduleId : moduleId;
      data.controlData.moduleId = templateModuleId;
    }


    if(isPrimaryDataset) {
      if(!refRecord)
        this.masterData.primary[moduleId] = updatedData;
      else{
        this.masterData.primary[moduleId].mdoRecordES[refRecord.path][refRecord.fieldId].mdoRecord = updatedData;
        this.masterData.primary[moduleId].mdoRecordES[refRecord.path][refRecord.fieldId].vc = [
          {
            c: refRecord.relatedDatasetObjnr,
            t: null
          }
        ];
      }
    } else {
      if (!this.masterData.relatedDatasets[moduleId]) {
        this.masterData.relatedDatasets[moduleId] = {};
      }
      if(!refRecord)
        this.masterData.relatedDatasets[moduleId][objnr] = updatedData;
      else{
        this.masterData.relatedDatasets[moduleId][objnr].mdoRecordES[refRecord.path][refRecord.fieldId].mdoRecord = updatedData;
        this.masterData.primary[moduleId].mdoRecordES[refRecord.path][refRecord.fieldId].vc = [{
          c: refRecord.relatedDatasetObjnr,
          t: null
        }];
      }
    }


    console.log('updated master Data: ', updatedData);

    this.datasetToTemplateMapping[moduleId] = JSON.parse(JSON.stringify(updatedData));
  }

  addCopyKeyToMasterData(masterData) {
    let updatedData = JSON.parse(JSON.stringify(masterData));
    let { mdoRecordES } = updatedData;
    let { hdvs, hyvs, gvs } = mdoRecordES;

    if(mdoRecordES) {
      if(hdvs)
        updatedData = { ...updatedData, mdoRecordES: {...updatedData.mdoRecordES, hdvs: this.addCopyKeyToHdvs(hdvs)}};
      if(hyvs)
        updatedData = { ...updatedData, mdoRecordES: {...updatedData.mdoRecordES, hyvs: this.addCopyKeyToHyvs(hyvs)}};
      if(gvs)
        updatedData = { ...updatedData, mdoRecordES: {...updatedData.mdoRecordES, gvs: this.addCopyKeyToGvs(gvs)}};
    }

    return updatedData;
  }

  addCopyKeyToHdvs(hdvs) {
    let updatedData: any = {};
    updatedData.isCopied = true;

    const headerFields = Object.keys(hdvs);

    headerFields.forEach((item) => {
      updatedData[item] = {
        ...hdvs[item],
        isCopied: true
      }
    });

    return updatedData;
  }

  addCopyKeyToHyvs(hyvs) {
    let updatedData: any = {};
    updatedData.isCopied = true;

    const structures = Object.keys(hyvs);

    structures.forEach((item: any) => {
      updatedData[item] = {
        isCopied: true,
        rows: []
      };

      hyvs[item].rows.forEach((fields) => {
        let updatedRow = {};

        const fieldsList = Object.keys(fields);

        fieldsList.forEach((e) => {
          updatedRow[e] = {
            ...fields[e],
            isCopied: true
          }
        });

        updatedData[item].rows.push(updatedRow);
      })
    })

    return updatedData;
  }

  /**
   * Only for the process copy
   * @param gvs Gvs of the master data
   * @returns add a key isCopied
   */
  addCopyKeyToGvs(gvs) {
    let updatedData: any = {};
    updatedData.isCopied = true;

    const fieldList = Object.keys(gvs);

    fieldList.forEach((item) => {
      updatedData[item] = {};

      const updatedRow = {
        ...gvs[item],
        rows: (gvs[item]?.rows || []).map((e) => {
          return {
            ...e,
            isCopied: true
          }
        })
      };

      updatedData[item] = updatedRow;
    })

    return updatedData;
  }

  getHDVSField(isPrimary: boolean, modueId: string, fieldId: string) {
    const masterData = this.getMasterData(isPrimary, modueId);
    return masterData?.mdoRecordES?.hdvs?.[fieldId];
  }

  removeGvsFieldsWithNoRows(obj) {
    if(typeof obj === 'object') {
      for(let i in obj) {
        if(typeof obj[i] === 'object' && obj[i] !== null) {

          if(obj[i].hasOwnProperty('rows') && Array.isArray(obj[i].rows) && obj[i].rows.length === 0) {
            delete obj[i];
          }else {
            obj[i] = this.removeGvsFieldsWithNoRows(obj[i]);
          }
        }
      }
    }
    return obj;
  }

  getUpdatedGvs(payload) {
    for(const item in payload?.gvs) {
      if(payload?.gvs[item].rows?.length === 0) {
        delete payload?.gvs[item];
      }
    }
    return payload;
  }

  setDescriptionFormData(data) {
    this.descriptionFormData = data;
  }

  getDescriptionFormData() {
    return this.descriptionFormData;
  }

  setLayoutDetails(data) {
    this.layoutDetails = data;
  }

  getLayoutDetails() {
    return this.layoutDetails;
  }

  getMappedTempateByDatasetId(datasetId: string) {
    if (this.datasetToTemplateMapping[datasetId]) return this.datasetToTemplateMapping[datasetId];
    else return null;
  }

  removeDefaultRowFromTemplate(moduleId, data) {
    const gridTemplate = data?.mdoRecordES?.gvs;

    if (gridTemplate) {
      for (const grid of Object.keys(gridTemplate)) {
        if (gridTemplate[grid].rows) {
          gridTemplate[grid].rows = gridTemplate[grid].rows.map((row) => {
            return {
              ...row,
              UUID: {
                ...row.UUID,
                vc: [
                  {
                    c: this.utilityService.getRandomString(12),
                    t: null
                  }
                ]
              }
            };
          });
        }
      }
    }

    const hierarchiesTemplate = data?.mdoRecordES?.hyvs;

    if (hierarchiesTemplate) {
      for (const hierarchy of Object.keys(hierarchiesTemplate)) {
        if (hierarchiesTemplate[hierarchy].rows.length) {
          this.hierarchiesRowsTemplates[moduleId] = {
            ...this.hierarchiesRowsTemplates[moduleId],
            [hierarchy]: hierarchiesTemplate[hierarchy].rows[0]
          };
        }
        hierarchiesTemplate[hierarchy].rows = [];
      }
    }

    return data;
  }

  public get getNewAttributeValue() {
    return this.newAttributeSub.asObservable();
  }

  public setNewAttributeValue(data: ListValueSaveModel) {
    this.newAttributeSub.next(data);
  }

  public setActiveStructuresSub(value: number[]) {
    this.activeStructuresSub.next(value);
  }

  public addFieldsToFieldDetails(fieldDetails: Array<FieldResponse>, tabDetails: TabResponse) {
    fieldDetails.forEach((item: FieldResponse) => {
      if (!this.fieldDetails[item.fieldId]) {
        this.fieldDetails[item.fieldId] = item;
        this.fieldDetails[item.fieldId].tabDetails = tabDetails;
        this.fieldDetails[item.fieldId].isRuleHidden = false;
      }

      if (item.fieldCtrl.pickList === '15' && item.fieldCtrl?.grid?.length !== 0) {
        item.fieldCtrl.grid?.forEach((childField: any) => {
          if (!this.fieldDetails[childField.fieldId]) {
            this.fieldDetails[childField.fieldId] = childField;
            this.fieldDetails[childField.fieldId].isRuleHidden = false;
          }
        });
      }
    });
  }

  public isFieldRuleHidden(fieldId: string) {
    if (this.fieldDetails[fieldId]) {
      return this.fieldDetails[fieldId].isRuleHidden;
    } else {
      return null;
    }
  }

  public updateRuleHidden(fieldId: string, isHidden: boolean) {
    if (this.fieldDetails[fieldId]) {
      this.fieldDetails[fieldId].isRuleHidden = isHidden;
    }
  }

  public resetFieldsDetails() {
    this.fieldDetails = {};
  }

  public getFieldDetailById(fieldId: string) {
    if (this.fieldDetails[fieldId]) {
      return this.fieldDetails[fieldId];
    } else {
      return null;
    }
  }

  /**
   * Set the number of tabs in the form
   */
  public setNumberOfTabs(tabsLength: number) {
    this.numberOfTabs = tabsLength;
    this.numberOfLoadedTabs = 0;
  }

  /**
   * Set the rules loaded flag to true
   */
  public setRules(moduleId: string, ruleList: Array<any>) {
    this.isFormRulesLoaded = true;
    this.rules[moduleId] = ruleList;
    if (this.numberOfTabs && this.numberOfLoadedTabs && this.numberOfTabs === this.numberOfLoadedTabs) {
      this.runAllRules$.next(true);
    }
  }

  /**
   * Get the rules list of the form
   */
  public getRules(moduleId?: string, returnAll: boolean = false) {
    if (returnAll) return this.rules;
    if (!moduleId) return [];
    return this.rules[moduleId] || [];
  }

  public getRuleIdList(moduleId) {
    const ruleIds = [];
    const rules = this.getRules(moduleId, false);
    rules.forEach((rule) => {
      rule.forEach((group) => {
        ruleIds.push(group.mappingId);
      });
    });

    return ruleIds;
  }

  /**
   * Increase the counter of loaded tabs
   */
  public tabFieldsLoadedSuccess() {
    this.numberOfLoadedTabs = this.numberOfLoadedTabs + 1;
    if (
      this.isFormRulesLoaded &&
      this.numberOfTabs &&
      this.numberOfLoadedTabs &&
      this.numberOfTabs === this.numberOfLoadedTabs
    ) {
      this.runAllRules$.next(true);
    }
  }

  /**
   * gets hint for errors in form fields
   */
  getFieldValidators(fieldObj: FieldResponse) {
    const validators = [];
    if (!fieldObj || !fieldObj.fieldCtrl) return validators;
    if (fieldObj.isMandatory || fieldObj.fieldCtrl.isMandatory) {
      validators.push(Validators.required);
    }
    if (fieldObj.fieldCtrl && fieldObj.fieldCtrl.numberOnly) {
      validators.push(AlphaNumericCheck);
    }
    if (fieldObj.fieldCtrl.maxChar) {
      validators.push(Validators.maxLength(Number(fieldObj.fieldCtrl.maxChar)));
    }
    if (fieldObj.fieldCtrl.dataType === 'EMAIL') {
      validators.push(Validators.email);
    }
    // if (fieldObj.minLength) {
    //   validators.push(Validators.minLength(fieldObj.minLength));
    // }
    // if (fieldObj.charType) {
    //   validators.push(AlphaCharCheck(fieldObj.charType));
    // }
    // if (fieldObj.decimalPos) {
    //   validators.push(AlphaDecimalCheck(fieldObj.decimalPos));
    // }
    return validators;
  }

  getHdvsBlankObj(fieldId: string, fieldName: string) {
    const obj = {
      vc: [
        {
          c: null,
          t: null
        }
      ],
      oc: null,
      bc: null,
      ls: fieldName,
      fid: fieldId
    };
    return obj;
  }

  /**
   * Compare the json object ....
   * @param old the old value ...
   * @param latest the latest changes values
   */
  compareTheObject(old: any, latest: any) {
    return isEqual(old, latest);
  }

  /**
   * Update the header field value ....
   * @param frmCtrl the control
   * @param value the value
   */
  public updateHdvs(
      activeForm: ActiveForm,
      moduleId: string,
      objnr,
      frmCtrl: string,
      value: string[] = [],
      process: string,
      forMulti?: boolean,
      isListField?: boolean,
      fName: string = '',
      refDetail: CurrentReferenceFormDetails | null = null,
      emitValue = false
    ) {
    const hdvs = this.getMasterData(activeForm.isPrimary, moduleId, objnr, refDetail)?.mdoRecordES?.hdvs;
    if (!hdvs) {
      console.log(`Hdvs can't be null or `);
      return false;
    }

    if (
      this.compareTheObject(
        hdvs[frmCtrl]?.vc.map((v: any) => {
          return { c: v?.c || v };
        }),
        value.map((v: any) => {
          return { c: v?.c || v };
        })
      )
    ) {
      console.warn(`Old and new value are same can't update  `);
      return;
    }

    if (!hdvs[frmCtrl]) {
      hdvs[frmCtrl] = this.getHdvsBlankObj(frmCtrl, fName);
    }
    if ((process === Process.change || process === Process.approve) && !hdvs[frmCtrl]?.oc && !hdvs[frmCtrl].isChanged) {
      hdvs[frmCtrl].isChanged = true;
      const oldvcObj = hdvs[frmCtrl]?.oc;
      if (
        oldvcObj &&
        oldvcObj
          .map((m) => m.c)
          .toString()
          .trim() !==
          hdvs[frmCtrl].vc
            .map((m) => m.c)
            .toString()
            .trim()
      ) {
        hdvs[frmCtrl].oc = hdvs[frmCtrl]?.vc?.some((option) => option.c !== null)
          ? hdvs[frmCtrl]?.vc
          : [{ c: '', t: null }];
      } else if (
        !oldvcObj &&
        oldvcObj
          ?.map((m) => m.c)
          .toString()
          .trim() !==
          hdvs[frmCtrl]?.vc
            ?.map((m) => m.c)
            .toString()
            .trim()
      ) {
        hdvs[frmCtrl].oc = hdvs[frmCtrl]?.vc?.some((option) => option.c !== null)
          ? hdvs[frmCtrl]?.vc
          : [{ c: '', t: null }];
      }
    }
    if (hdvs[frmCtrl]?.vc) {
      if (isListField) {
        hdvs[frmCtrl].vc = value;
      } else if (forMulti) {
        value.forEach((v) => {
          hdvs[frmCtrl].vc.push({ c: v, t: '' });
        });
      } else {
        const val = [];
        value.forEach((v) => {
          val.push({ c: v, t: '' });
        });
        hdvs[frmCtrl].vc = val;
      }
    }
    console.log(frmCtrl);
    console.log(value);
    if (emitValue) this.savedRecordData$.next(frmCtrl);
  }

  /**
   * Update hierarchy field value ....
   * @param frmCtrl the control
   * @param value the value
   */
  public updateHyvs(
      activeForm: ActiveForm,
      moduleId: string,
      objnr,
      structureId,
      frmCtrl: string,
      value: string[] = [],
      process: string,
      isListField?: boolean,
      refDetail: CurrentReferenceFormDetails | null = null,
      emitValue = false
    ) {
    const hyvs = this.getMasterData(activeForm.isPrimary, moduleId, objnr, refDetail)?.mdoRecordES?.hyvs;
    if (!hyvs) {
      console.log(`Hyvs can't be null or `);
      return false;
    }

    if (this.compareTheObject(hyvs[frmCtrl]?.vc, value)) {
      console.warn(`Old and new value are same can't update  `);
      return;
    }

    const keyFieldDetails =
      this.hierarchyKeyFieldDetails.getValue() && this.hierarchyKeyFieldDetails.getValue()[moduleId];
    if (!keyFieldDetails) {
      console.error('Key field details are required !');
      return;
    }

    let row;
    if (structureId === keyFieldDetails.structureId) {
      row = hyvs[keyFieldDetails.structureId]?.rows?.find(
        (r) =>
          r[keyFieldDetails.keyFieldId]?.vc[0]?.c === keyFieldDetails.keyFieldValueCode &&
          (!keyFieldDetails.parentKeyFieldId ||
            r[keyFieldDetails.parentKeyFieldId]?.vc[0]?.c === keyFieldDetails.parentKeyFieldValueCode)
      );
    } else if (structureId === keyFieldDetails.parentStructureId) {
      row = hyvs[keyFieldDetails.parentStructureId]?.rows?.find(
        (r) => r[keyFieldDetails.parentKeyFieldId]?.vc[0]?.c === keyFieldDetails.parentKeyFieldValueCode
      );
    }

    if (!row[frmCtrl]) {
      row[frmCtrl] = { vc: [{ c: null, t: null }] };
    }
    // if (process === Process.change) {
    if ((process === Process.change || process === Process.approve) && !row[frmCtrl]?.oc && !row[frmCtrl].isChanged) {
      row[frmCtrl].isChanged = true;
      if (!row[frmCtrl]?.oc) {
        row[frmCtrl].oc = row[frmCtrl]?.vc.some((option) => option.c !== null)
          ? row[frmCtrl]?.vc
          : [{ c: '', t: null }];
      }
    }
    if (row[frmCtrl]?.vc) {
      if (isListField) {
        row[frmCtrl].vc = value;
      } else {
        const val = [];
        value.forEach((v) => {
          val.push({ c: v, t: '' });
        });
        row[frmCtrl].vc = val;
      }
    }
    console.log(hyvs);
    if (emitValue) this.savedRecordData$.next(frmCtrl);
  }

  updateHyvsRows(activeForm: ActiveForm, moduleId, objnr, structureId, keyFieldOptions,isMultiField) {
    const mdoRecordES = this.getMasterData(activeForm.isPrimary, moduleId, objnr)?.mdoRecordES;
    if(!mdoRecordES?.hyvs) mdoRecordES.hyvs = {};
    const hyvs = mdoRecordES.hyvs;
    if (!hyvs[structureId]) {
      hyvs[structureId] = { hId: structureId, rows: [] };
    }

    if (!isMultiField) {
      keyFieldOptions.forEach((option) => {
        const index = hyvs[structureId]?.rows?.findIndex((r) => {
          if (r[option.keyFieldId]?.vc?.length) {
            return (
              r[option.keyFieldId]?.vc[0]?.c === option.keyFieldValueCode &&
              (!option.parentKeyFieldId || r[option.parentKeyFieldId]?.vc[0]?.c === option.parentKeyFieldValueCode)
            );
          }
        });
        if (index === -1) {
          let row;
          if (
            this.hierarchiesRowsTemplates &&
            this.hierarchiesRowsTemplates[moduleId] &&
            this.hierarchiesRowsTemplates[moduleId][structureId]
          ) {
            row = JSON.parse(JSON.stringify(this.hierarchiesRowsTemplates[moduleId][structureId]));
            row[option.keyFieldId]
              ? (row[option.keyFieldId].vc = [{ c: option.keyFieldValueCode, t: option.keyFieldValueText }])
              : (row[option.keyFieldId] = { vc: [{ c: option.keyFieldValueCode, t: option.keyFieldValueText }] });
          } else {
            row = { [option.keyFieldId]: { vc: [{ c: option.keyFieldValueCode, t: option.keyFieldValueText }] } };
          }
          if (option.parentKeyFieldId) {
            row[option.parentKeyFieldId]
              ? (row[option.parentKeyFieldId].vc = [
                  { c: option.parentKeyFieldValueCode, t: option.parentKeyFieldValueText }
                ])
              : (row[option.parentKeyFieldId] = {
                  vc: [{ c: option.parentKeyFieldValueCode, t: option.parentKeyFieldValueText }]
                });
          }
          hyvs[structureId].rows.push(row);
        }
      });
    } else {
      keyFieldOptions.forEach((optionList) => {
        const index1 = hyvs[structureId]?.rows?.findIndex((r) =>
          optionList.every((option1) => {
            if (r[option1.keyFieldId]?.vc?.length) {
              return (
                r[option1.keyFieldId]?.vc[0]?.c === option1.keyFieldValueCode &&
                (!option1.parentKeyFieldId || r[option1.parentKeyFieldId]?.vc[0]?.c === option1.parentKeyFieldValueCode)
              );
            }
          })
        );

        if (index1 === -1) {
          let row;
          if (
            this.hierarchiesRowsTemplates &&
            this.hierarchiesRowsTemplates[moduleId] &&
            this.hierarchiesRowsTemplates[moduleId][structureId]
          ) {
            row = JSON.parse(JSON.stringify(this.hierarchiesRowsTemplates[moduleId][structureId]));
            optionList.forEach((options) => {
              row[options.keyFieldId] && row[options.keyFieldId].fId === options.keyFieldId
                ? (row[options.keyFieldId].vc = [{ c: options.keyFieldValueCode, t: options.keyFieldValueText }])
                : (row[options.keyFieldId] = { vc: [{ c: options.keyFieldValueCode, t: options.keyFieldValueText }] });
            });
          } else {
            optionList.forEach((option) => {
              row = { [option.keyFieldId]: { vc: [{ c: option.keyFieldValueCode, t: option.keyFieldValueText }] } };
            });
          }
          optionList.forEach((option) => {
            if (option.parentKeyFieldId) {
              row[option.parentKeyFieldId]
                ? (row[option.parentKeyFieldId].vc = [
                    { c: option.parentKeyFieldValueCode, t: option.parentKeyFieldValueText }
                  ])
                : (row[option.parentKeyFieldId] = {
                    vc: [{ c: option.parentKeyFieldValueCode, t: option.parentKeyFieldValueText }]
                  });
            }
          });
          row = Object.assign({}, row);
          hyvs[structureId].rows.push(row);
        }
      });
    }

    console.log('Updated hyvs rows ', hyvs[structureId].rows);
  }


  setActiveKey(node: any, activeForm: ActiveForm) {
    let mdoRecordES: any = this.getMasterData(
      activeForm.moduleId,
      activeForm.objnr,
      activeForm.referenceRecordDetails
    )?.mdoRecordES;
    if (!node?.parentStructureId) {
      if (mdoRecordES?.hdvs) {
        mdoRecordES.hdvs.ACTION = {
          fId: 'ACTION',
          vc: [{ c: '3', t: null }],
          oc: null,
          bc: null,
          ls: null
        };
      }
      return;
    }

    if (node?.keyFieldId && node?.keyFieldValueCode) {
      mdoRecordES.hyvs[node.structureId]?.rows.forEach((el, index) => {
        console.log(el.hasOwnProperty(node?.keyFieldId));
        if (el.hasOwnProperty(node?.keyFieldId)) {
          mdoRecordES.hyvs[node.structureId].rows[index] = {
            ...mdoRecordES.hyvs[node.structureId].rows[index],
            ACTION: {
              fId: 'ACTION',
              vc: [{ c: '3', t: null }],
              oc: null,
              bc: null,
              ls: null
            }
          };
          return;
        }
      });
    }
  }

  changeCopyStatus(node: any, activeForm: ActiveForm, isCopy: boolean) {
    let mdoRecordES: any = this.getMasterData(
      activeForm.moduleId,
      activeForm.objnr,
      activeForm.referenceRecordDetails
    )?.mdoRecordES;
    if (!node?.parentStructureId) {
      if (mdoRecordES?.hdvs) {
        mdoRecordES.hdvs.isCopied = isCopy;
      }
      return;
    }

    if(!node?.keyFieldValueCode) {
      mdoRecordES.hyvs[node.id].isCopied = isCopy;
      return;
    }

    if (node?.keyFieldId && node?.keyFieldValueCode) {
      mdoRecordES.hyvs[node.structureId]?.rows.forEach((el, index) => {
        if (el.hasOwnProperty(node?.keyFieldId)) {
          const keyFieldDetails = el[node.keyFieldId];
          if(keyFieldDetails?.vc?.[0]?.c === node.keyFieldValueCode) {
            mdoRecordES.hyvs[node.structureId].rows[index] = {
              ...mdoRecordES.hyvs[node.structureId].rows[index],
              isCopied: isCopy,
            };
          }
          return;
        }
      });
    }
  }

  resetMasterData() {
    this.masterData = { primary: {}, relatedDatasets: {} };
  }

  resetTemplateMapping() {
    this.datasetToTemplateMapping = {};
  }

  /**
   * Reset the transaction service
   */
  resetTransactioinService() {
    this.isFormRulesLoaded = false;
    this.numberOfLoadedTabs = undefined;
    this.numberOfTabs = undefined;
    this.rules = {};
    this.resetMasterData();
    this.resetFieldsDetails();
    this.resetTemplateMapping();
    this.savedRecordData$.next('INITIAL');
    this.runAllRules$.next(false);
    this.duplicateRecordsDetails.next(null);
    this.parentDatasetIdSub.next('');
  }

  public updateDescription(activeForm: ActiveForm, classCode: string , classMode: string, locale, shortDes, longDes, attributes, moduleId, objnr?) {
    const descriptionObj = [{
      classCode,
      classMode,
      isDesc: true,
      attributes: {
        [locale]: {
          shortDesc: shortDes,
          longDesc: longDes,
          attrs: attributes
        }
      }
    }]
    const mdoRecordES = this.getMasterData(activeForm.isPrimary, moduleId, objnr)?.mdoRecordES;
    if (mdoRecordES) {
      mdoRecordES.descriptions = descriptionObj;
    }
  }

  /**
   * Get control by controlName in the DataControl
   */
  // getControlByControlName(dataControl: FormGroup, moduleId: string, controlName: string) {
  //   const tabArray = ((dataControl.controls?.[moduleId] as FormGroup)?.controls?.formData as FormGroup)?.controls || [];
  //   let reqControl = null;
  //   if(tabArray.length) {
  //     (tabArray as any).some((item: any) => {
  //       let found = false;
  //       Object.keys(item.controls).some((control: string) => {
  //         if(control === controlName) {
  //           reqControl = item.controls[control];
  //           found = true;
  //           return true;
  //         }
  //       });
  //       if(found) {
  //         return true;
  //       }
  //     });
  //   }
  //   return reqControl;
  // }

  setKeyFieldsDetails(activeForm: ActiveForm, moduleId, keyFieldsDetails) {
    let data = this.hierarchyKeyFieldDetails.getValue();
    if (data) {
      data = { ...data, [moduleId]: keyFieldsDetails, updatedModule: moduleId };
    } else {
      data = { [moduleId]: keyFieldsDetails, updatedModule: moduleId };
    }
    console.log('All key fields details ', data);
    if (data[moduleId]) {
      const keyData = data[moduleId].isMultiField ? data[moduleId].multiFieldOptions : [data[moduleId]];
      this.updateHyvsRows(activeForm, moduleId, null, data[moduleId].structureId, keyData,false);
    }
    this.hierarchyKeyFieldDetails.next(data);
  }

  setHierarchyListDetails(activeForm: ActiveForm, moduleId, hierarchyListStructure, activeStructId) {
    if(activeForm.isPrimary) {
      this.hierarchyListDetails.primary[moduleId] = { hierarchyListStructure, activeStructId };
    } else {
      this.hierarchyListDetails.relatedDatasets[moduleId] = { hierarchyListStructure, activeStructId };
    }
  }

  getHierarchyListDetails(activeForm: ActiveForm, moduleId) {
    if(activeForm.isPrimary) {
      return this.hierarchyListDetails.primary[moduleId];
    } else {
      return this.hierarchyListDetails.relatedDatasets[moduleId];
    }
  }

  clearHierarchyDetails() {
    this.hierarchyListDetails = { primary: {}, relatedDatasets: {} };
    this.hierarchyKeyFieldDetails.next(null);
  }

  setDatasetRefDetails(layoutId: string, moduledId: string, dataRefDetails: any) {
    if (!this.formToDataRefMapping[layoutId]) {
      this.formToDataRefMapping[layoutId] = {
        [moduledId]: dataRefDetails
      };
      return;
    } else if (!this.formToDataRefMapping[layoutId][moduledId]) {
      this.formToDataRefMapping[layoutId][moduledId] = dataRefDetails;
    }
  }

  getDatasetRefDetails(layoutId: string, modueId: string) {
    if (this.formToDataRefMapping[layoutId] && this.formToDataRefMapping[layoutId][modueId])
      return JSON.parse(JSON.stringify(this.formToDataRefMapping?.[layoutId][modueId]));
    else return null;
  }

  /**
   * Run Transformation Rule
   */
  public runTransformationRule(
    activeForm: ActiveForm,
    ruleIds: number[],
    moduleId: string,
    objnr,
    refDetail: CurrentReferenceFormDetails | null = null,
    process: string,
    fieldObj: FieldResponse
  ) {
      let mdoRecordEs = this.getMasterData(activeForm.isPrimary, moduleId, objnr, refDetail)?.mdoRecordES;
      const structureId = fieldObj?.structureId;
      const isHdvs = structureId === 1 ? true : false;
      if(!isHdvs) {
        const hyvs = mdoRecordEs.hyvs;
        const keyFieldDetails = this.hierarchyKeyFieldDetails.getValue() && this.hierarchyKeyFieldDetails.getValue()[moduleId];
        if(!keyFieldDetails) {
          console.error('Key field details are required !');
          return;
        }

        let row;
        if(structureId === keyFieldDetails.structureId) {
          row = hyvs[keyFieldDetails.structureId]?.rows?.
          find(r => (r[keyFieldDetails.keyFieldId]?.vc[0]?.c === keyFieldDetails.keyFieldValueCode)
                 && (!keyFieldDetails.parentKeyFieldId || (r[keyFieldDetails.parentKeyFieldId]?.vc[0]?.c === keyFieldDetails.parentKeyFieldValueCode)));
        } else if (structureId === keyFieldDetails.parentStructureId) {
          row = hyvs[keyFieldDetails.parentStructureId]?.rows?.
          find(r => r[keyFieldDetails.parentKeyFieldId]?.vc[0]?.c === keyFieldDetails.parentKeyFieldValueCode);
        }

        mdoRecordEs = {...mdoRecordEs, hyvs: {...hyvs, [structureId]: { rows: [row]}}};
    }
    if (ruleIds.length && mdoRecordEs) {
      const payload: RuleTransformationReq = {
        brIds: ruleIds,
        doc: mdoRecordEs
      };

        this.transformationService.validate(payload).subscribe((resp: any) => {
          console.log('transaformation rule payload: ', resp);
          if(resp && resp.hdvs) {
            const fieldIds = Object.keys(resp.hdvs);
            fieldIds.forEach((id) => {
              const fieldCtrl = this.getFieldDetailById(id)?.fieldCtrl;
              const value = resp.hdvs[id].vc.map(item => item.c);
              this.updateHdvs(activeForm, moduleId, objnr, id, value, process, false, false, fieldCtrl.description, refDetail, true);
            });
          }

          if(resp && resp.hyvs) {
            resp.hyvs[structureId].rows.forEach((fields) => {
              Object.keys(fields).forEach((fid: string) => {
                const value = fields[fid].vc.map(item => item.c);
                this.updateHyvs(activeForm, moduleId, objnr, structureId, fid, value, process, false, refDetail, true);
              })
            })
          }
        });
      }
  }

  getReferredData(
    currentDataset: string,
    activeForm: ActiveForm,
    process: string,
    fieldObj: FieldResponse,
    recordId: string,
    lang: string
  ) {
    const referenceDataset = fieldObj.fieldCtrl.refDataset.datasetId;

    if (!referenceDataset) {
      this.transientService.open(`No reference dataset exists !`, '', { duration: 4000 });
      return;
    }
    let mdoRecordEs = JSON.parse(JSON.stringify(this.getMasterData(activeForm.isPrimary, currentDataset)?.mdoRecordES || {}));
    const structureId = fieldObj?.structureId;
    const isHdvs = structureId === 1 ? true : false;
    if (!isHdvs) {
      const hyvs = mdoRecordEs.hyvs;
      const keyFieldDetails =
        this.hierarchyKeyFieldDetails.getValue() && this.hierarchyKeyFieldDetails.getValue()[currentDataset];
      if (!keyFieldDetails) {
        console.error('Key field details are required !');
        return;
      }

      let row;
      if (structureId === keyFieldDetails.structureId) {
        row = hyvs[keyFieldDetails.structureId]?.rows?.find(
          (r) =>
            r[keyFieldDetails.keyFieldId]?.vc[0]?.c === keyFieldDetails.keyFieldValueCode &&
            (!keyFieldDetails.parentKeyFieldId ||
              r[keyFieldDetails.parentKeyFieldId]?.vc[0]?.c === keyFieldDetails.parentKeyFieldValueCode)
        );
      } else if (structureId === keyFieldDetails.parentStructureId) {
        row = hyvs[keyFieldDetails.parentStructureId]?.rows?.find(
          (r) => r[keyFieldDetails.parentKeyFieldId]?.vc[0]?.c === keyFieldDetails.parentKeyFieldValueCode
        );
      }

      mdoRecordEs = { ...mdoRecordEs, hyvs: { ...hyvs, [structureId]: { rows: [row] } } };
    }
    const payload = {
      mdoRecordES: mdoRecordEs
    };

    this.coreService.getFieldData(currentDataset, referenceDataset, recordId, payload, lang).subscribe((resp: any) => {
      console.log('@@@@ getFieldData: ', resp);
      const fieldList = Object.keys(resp);
      if (isHdvs) {
        fieldList.forEach((fid: string) => {
          if (fid !== 'id' && resp[fid]) {
            const isListField = this.isListField(fieldObj);
            const value = isListField ? resp[fid]?.vc : resp[fid]?.vc?.map((item) => item.c);
            const fieldCtrl = this.getFieldDetailById(fid)?.fieldCtrl;

            if(fieldCtrl)
              this.updateHdvs(activeForm, currentDataset, activeForm.objnr, fid, value, process, false, isListField, fieldCtrl.description, activeForm.referenceRecordDetails, true);
          }
        });
      } else {
        fieldList.forEach((fid: string) => {
          if(fid !== 'id' && resp[fid]) {
            const isListField = this.isListField(fieldObj);
            const value = isListField ? resp[fid]?.vc : resp[fid]?.vc?.map((item) => item.c);
            this.updateHyvs(activeForm, currentDataset, activeForm.objnr, structureId, fid, value, process, isListField, activeForm.referenceRecordDetails, true);
          }
        });
      }
    });
  }

  isListField(fieldObj): boolean {
    return (
      fieldObj?.fieldCtrl?.pickList === '1' ||
      fieldObj?.fieldCtrl?.pickList === '37' ||
      fieldObj?.fieldCtrl?.pickList === '30'
    );
  }


  createNewRow(isSubGrid, parentRowId, childMetadata) {
    const row = {
      UUID: {
        bc: null,
        fid: 'UUID',
        ls: null,
        oc: null,
        vc: [
          {
            c: this.utilityService.generate_UUID(),
            t: ''
          }
        ]
      },
      PARENT_UUID: {
        bc: null,
        fid: 'PARENT_UUID',
        ls: null,
        oc: null,
        vc: [
          {
            c: isSubGrid ? parentRowId : null,
            t: ''
          }
        ]
      },
      MSGFN: {
        bc: null,
        fid: 'MSGFN',
        ls: null,
        oc: null,
        vc: [
          {
            c: MSGFN.create,
            t: ''
          }
        ]
      }
    };
    childMetadata.forEach((child) => {
      row[child.fieldId] = {
        vc: [
          {
            c: '',
            t: null
          }
        ],
        oc: null,
        ls: null,
        fid: child.fieldId,
        bc: null
      };
    });
    return { childMetadata, row };
  }

  updateCopyStatusHdvs(
    activeForm: ActiveForm,
    moduleId: string,
    objnr,
    frmCtrl: string,
    fName: string = '',
    refDetail: CurrentReferenceFormDetails | null = null,
    isCopied: boolean = true
  ) {
    const hdvs = this.getMasterData(activeForm.isPrimary, moduleId, objnr, refDetail)?.mdoRecordES?.hdvs;
    if (!hdvs) {
      console.log(`Hdvs can't be null or `);
      return false;
    }

    if(!hdvs[frmCtrl]) {
      hdvs[frmCtrl] = this.getHdvsBlankObj(frmCtrl, fName);
    }

    hdvs[frmCtrl].isCopied = isCopied;

    console.log('hdvs isCopied status: ', hdvs[frmCtrl]);
  }

  updateCopyStatusHyvs(
    activeForm: ActiveForm,
    moduleId: string,
    objnr,
    structureId,
    frmCtrl: string,
    refDetail: CurrentReferenceFormDetails | null = null,
    isCopied: boolean = true,
  ) {
    const hyvs = this.getMasterData(activeForm.isPrimary, moduleId, objnr, refDetail)?.mdoRecordES?.hyvs;
    if (!hyvs) {
      console.log(`Hyvs can't be null or `);
      return false;
    }

    const keyFieldDetails = this.hierarchyKeyFieldDetails.getValue() && this.hierarchyKeyFieldDetails.getValue()[moduleId];
    if(!keyFieldDetails) {
      console.error('Key field details are required !');
      return;
    }

    let row;
    if(structureId === keyFieldDetails.structureId) {
      row = hyvs[keyFieldDetails.structureId]?.rows?.
      find(r => (r[keyFieldDetails.keyFieldId]?.vc[0]?.c === keyFieldDetails.keyFieldValueCode)
            && (!keyFieldDetails.parentKeyFieldId || (r[keyFieldDetails.parentKeyFieldId]?.vc[0]?.c === keyFieldDetails.parentKeyFieldValueCode)));
    } else if (structureId === keyFieldDetails.parentStructureId) {
      row = hyvs[keyFieldDetails.parentStructureId]?.rows?.
      find(r => r[keyFieldDetails.parentKeyFieldId]?.vc[0]?.c === keyFieldDetails.parentKeyFieldValueCode);
    }

    if(!row[frmCtrl]) {
      row[frmCtrl] = {vc: [{ c: null, t: null }]};
    }

    row[frmCtrl].isCopied = isCopied;

    console.log(hyvs);
  }

}
