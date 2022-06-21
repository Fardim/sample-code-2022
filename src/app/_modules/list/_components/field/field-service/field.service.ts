import { FieldControl } from './../field-utils';
import { FieldControlType, Fieldlist, FieldlistContainer, IconType } from '@models/list-page/listpage';
import { take, catchError, switchMap, map } from 'rxjs/operators';
import { CoreService } from '@services/core/core.service';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { of, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FieldService {

  /**
   * pre defined picklist values with icon and fieldType
   */
  picklistValues = picklistValues;

  constructor(private coreService: CoreService, @Inject(LOCALE_ID) public locale: string,) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  getFieldList(pagination: FieldPaginationDto) {
    // if(!structureId) { throw new Error('Structure id was not provided')};
    // this.fieldListLoadingState = loadingState;
    const { moduleId, fetchcount, fetchsize, searchterm, requestDTO } = pagination;
    return this.coreService
      .getListParentFields(moduleId, this.locale, fetchcount - 1, fetchsize, searchterm, requestDTO)
      .pipe(
        take(1),
        catchError((err) => of({ fieldIds: [], acknowledge: false })),
        switchMap((resp) => {
          if (resp.fieldIds && resp.fieldIds.length <= 0 || resp.acknowledge === false) {
            return of([]);
          }
          const fieldIds = resp.fieldIds;
          const observables = [];
          fieldIds.forEach((fieldId) => {
            observables.push(
              this.coreService.getFieldDetails(moduleId, fieldId).pipe(
                take(1),
                catchError((err) => of(null))
              )
            );
          });
          return forkJoin(observables).pipe(take(1));
        }),
        map((resp: Fieldlist[]) => {
          return resp.map(d => {
            return this.mapChildFieldTypes(d);
          })
        })
      );
  }

  mapChildFieldTypes(d: Fieldlist) {
    const fieldInfo = new FieldControl(d);
    const { type, icon, iconType } = fieldInfo;
    return {
      fieldId: d.fieldId,
      isNew: false,
      fieldlist: {
        ...d,
        fieldType: type,
        icon,
        iconType,
        childfields: d.childfields && d.childfields.map(child => {

          const childFieldinfo = new FieldControl(child);
          return {
            ...child,
            fieldType: childFieldinfo.type,
            icon: childFieldinfo.icon,
            iconType: childFieldinfo.iconType,
            childfields: child.childfields && child.childfields.map(subchild => {
              const subchildFieldinfo = new FieldControl(subchild);
              return {
                ...subchild,
                fieldType: subchildFieldinfo.type,
                icon: subchildFieldinfo.icon,
                iconType: subchildFieldinfo.iconType,
              }
            }) || []
          }
        }) || [],
      },
    };
  }

  patchedDraftedValue(d: Fieldlist, fieldlistContainer: Partial<FieldlistContainer>) {
    if (fieldlistContainer.fieldlist) {
      d.attachmentSize =
        fieldlistContainer.fieldlist.attachmentSize
          ? fieldlistContainer.fieldlist.attachmentSize
          : d.attachmentSize;
      d.dataType =
        fieldlistContainer.fieldlist.dataType
          ? fieldlistContainer.fieldlist.dataType
          : d.dataType;
      d.dateModified =
        fieldlistContainer.fieldlist.dateModified ? fieldlistContainer.fieldlist.dateModified : 0;
      d.decimalValue =
        fieldlistContainer.fieldlist.decimalValue
          ? fieldlistContainer.fieldlist.decimalValue
          : d.decimalValue;
      d.fileTypes =
        fieldlistContainer.fieldlist.fileTypes
          ? fieldlistContainer.fieldlist.fileTypes
          : d.fileTypes;
      d.pickList =
        fieldlistContainer.fieldlist.pickList
          ? fieldlistContainer.fieldlist.pickList
          : d.pickList;
      d.maxChar =
        fieldlistContainer.fieldlist.maxChar ? fieldlistContainer.fieldlist.maxChar : 0;
      d.isHeirarchy =
        fieldlistContainer.fieldlist.isHeirarchy
          ? fieldlistContainer.fieldlist.isHeirarchy
          : d.isHeirarchy; /* MDMF-1689 isHierarchy can be true based on some logic mentioned in the code. details is available in the code */
      d.isKeyField =
        fieldlistContainer.fieldlist.isKeyField ? fieldlistContainer.fieldlist.isKeyField : false;
      d.isCriteriaField =
        fieldlistContainer.fieldlist.isCriteriaField
          ? fieldlistContainer.fieldlist.isCriteriaField
          : false;
      d.isWorkFlowCriteria =
        fieldlistContainer.fieldlist.isWorkFlowCriteria
          ? fieldlistContainer.fieldlist.isWorkFlowCriteria
          : false;
      d.isNumSettingCriteria =
        fieldlistContainer.fieldlist.isNumSettingCriteria
          ? fieldlistContainer.fieldlist.isNumSettingCriteria
          : false;
      d.isWorkFlow =
        fieldlistContainer.fieldlist.isWorkFlow ? fieldlistContainer.fieldlist.isWorkFlow : false;
      d.isPermission =
        fieldlistContainer.fieldlist.isPermission ? fieldlistContainer.fieldlist.isPermission : false;
      d.isTransient =
        fieldlistContainer.fieldlist.isTransient ? fieldlistContainer.fieldlist.isTransient : false;
      d.isGridColumn =
        fieldlistContainer.fieldlist.isGridColumn
          ? fieldlistContainer.fieldlist.isGridColumn
          : d.isGridColumn;
      d.parentField =
        fieldlistContainer.fieldlist.parentField
          ? fieldlistContainer.fieldlist.parentField
          : d.parentField;
      d.isDescription =
        fieldlistContainer.fieldlist.isDescription ? fieldlistContainer.fieldlist.isDescription : false;
      d.textCase =
        fieldlistContainer.fieldlist.textCase
          ? fieldlistContainer.fieldlist.textCase
          : d.textCase;
      d.isSearchEngine =
        fieldlistContainer.fieldlist.isSearchEngine ? fieldlistContainer.fieldlist.isSearchEngine : false;
      d.isFutureDate =
        fieldlistContainer.fieldlist && fieldlistContainer.fieldlist.isFutureDate
          ? fieldlistContainer.fieldlist.isFutureDate
          : false;
      d.isPastDate =
        fieldlistContainer.fieldlist && fieldlistContainer.fieldlist.isPastDate
          ? fieldlistContainer.fieldlist.isPastDate
          : false;
      d.isDefault =
        fieldlistContainer.fieldlist && fieldlistContainer.fieldlist.isDefault
          ? fieldlistContainer.fieldlist.isDefault
          : false;
      d.helptexts =
        fieldlistContainer.fieldlist.helptexts
          ? fieldlistContainer.fieldlist.helptexts
          : d.helptexts;
      d.longtexts =
        fieldlistContainer.fieldlist.longtexts
          ? fieldlistContainer.fieldlist.longtexts
          : d.longtexts;
      d.moduleId =
        fieldlistContainer.fieldlist.moduleId
          ? fieldlistContainer.fieldlist.moduleId
          : d.moduleId;
      d.shortText =
        fieldlistContainer.fieldlist.shortText
          ? fieldlistContainer.fieldlist.shortText
          : d.shortText;
      d.optionsLimit =
        fieldlistContainer.fieldlist.optionsLimit
          ? fieldlistContainer.fieldlist.optionsLimit
          : 1;
      d.isNoun =
        fieldlistContainer.fieldlist.isNoun
          ? fieldlistContainer.fieldlist.isNoun
          : false;
      d.isRejection = fieldlistContainer.fieldlist.isRejection ? fieldlistContainer.fieldlist.isRejection : false;
      d.isRequest = fieldlistContainer.fieldlist.isRequest ? fieldlistContainer.fieldlist.isRequest : false;
      d.displayCriteria = fieldlistContainer.fieldlist.displayCriteria ? fieldlistContainer.fieldlist.displayCriteria : null;
      d.childfields = fieldlistContainer.fieldlist.childfields || d.childfields;
      d.isReference = fieldlistContainer.fieldlist.isReference ? fieldlistContainer.fieldlist.isReference : false;
      d.isCheckList = fieldlistContainer.fieldlist.isCheckList ? fieldlistContainer.fieldlist.isCheckList : false;
      d.refrules = fieldlistContainer.fieldlist.refrules ? fieldlistContainer.fieldlist.refrules : [];
      d.refDataset = fieldlistContainer.fieldlist.refDataset ? fieldlistContainer.fieldlist.refDataset : null;
      d.refDatasetField = fieldlistContainer.fieldlist.refDatasetField ? fieldlistContainer.fieldlist.refDatasetField : null;
      d.refDatasetStatus = fieldlistContainer.fieldlist.refDatasetStatus ? fieldlistContainer.fieldlist.refDatasetStatus : [];
      d.referenceSystem = fieldlistContainer.fieldlist.referenceSystem ? fieldlistContainer.fieldlist.referenceSystem : null;
      d.referenceSystemFld = fieldlistContainer.fieldlist.referenceSystemFld ? fieldlistContainer.fieldlist.referenceSystemFld : null;
      d.lookupRuleId = fieldlistContainer.fieldlist.lookupRuleId ? fieldlistContainer.fieldlist.lookupRuleId : null;
    }
  }
}

export class FieldPaginationDto {
  moduleId: string;
  language: string;
  fetchcount: number;
  fetchsize: number;
  searchterm: string;
  requestDTO: {
    structureId: string;
  };
}

export const picklistValues: { pickList: string; dataType: string; fieldType: string; icon: string, iconType?: string }[] = [
  {
    pickList: '0',
    dataType: 'CHAR',
    fieldType: FieldControlType.TEXT,
    icon: 'Text',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '55',
    dataType: 'CHAR',
    fieldType: FieldControlType.URL,
    icon: 'link',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'PASS',
    fieldType: FieldControlType.PASSWORD,
    icon: 'Text',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'EMAIL',
    fieldType: FieldControlType.EMAIL,
    icon: 'at',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'NUMC',
    fieldType: FieldControlType.NUMBER,
    icon: 'hashtag',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '1',
    dataType: 'CHAR',
    fieldType: FieldControlType.LIST, // Dropdown
    icon: 'list-ul',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'STATUS',
    fieldType: FieldControlType.LIST, // FieldControlType.STATUS
    icon: 'list-ul',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '0',
    dataType: 'DEC',
    fieldType: FieldControlType.DECIMAL,
    icon: 'hashtag',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '2',
    dataType: 'CHAR',
    fieldType: FieldControlType.CHECKBOX,
    icon: 'check',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '4',
    dataType: 'CHAR',
    fieldType: FieldControlType.RADIO,
    icon: 'scrubber',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '22',
    dataType: 'CHAR',
    fieldType: FieldControlType.TEXT_AREA,
    icon: 'Text',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '31',
    dataType: 'CHAR',
    fieldType: FieldControlType.HTML,
    icon: 'edit',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '37',
    dataType: 'CHAR',
    fieldType: FieldControlType.LIST, // FieldControlType.USERSELECTION,
    icon: 'list-ul',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '38',
    dataType: 'CHAR',
    fieldType: FieldControlType.ATTACHMENT,
    icon: 'paperclip',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '40',
    dataType: 'CHAR',
    fieldType: FieldControlType.GEOLOCATION,
    icon: 'location_on',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '44',
    dataType: 'CHAR',
    fieldType: FieldControlType.DIGITALSIGNATURE,
    icon: 'Text',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '51',
    dataType: 'CHAR',
    fieldType: FieldControlType.ALTN,
    icon: 'hashtag',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '52',
    dataType: 'NUMC',
    fieldType: FieldControlType.DATE,
    icon: 'calendar',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '53',
    dataType: 'NUMC',
    fieldType: FieldControlType.DATE_TIME,
    icon: 'calendar',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '54',
    dataType: 'TIMS',
    fieldType: FieldControlType.TIME,
    icon: 'clock',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '15',
    dataType: 'CHAR',
    fieldType: FieldControlType.GRID,
    icon: 'grid_on',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '36',
    dataType: 'CHAR',
    fieldType: FieldControlType.ACTIVATE_DEACTIVATE,
    icon: 'toggle-on',
    iconType: IconType.MATERIAL
  },
  {
    pickList: '30',
    dataType: 'CHAR',
    fieldType: FieldControlType.DATASET_REFERENCE,
    icon: 'list-ul',
    iconType: IconType.MATERIAL
  }
];

export const datasetFieldsCol1 = [
  { displayText: 'Text', value: FieldControlType.TEXT, explanation: 'Allows storing a value in a text format' },
  // { displayText: 'Numeric', value: FieldControlType.NUMBER },
  // { displayText: 'Text area', value: FieldControlType.TEXT_AREA },
  { displayText: 'Radio', value: FieldControlType.RADIO, explanation: 'Allows users to display multiple values on the screen to choose from, but only one can be selected.' },
  { displayText: 'URL', value: FieldControlType.URL, explanation: 'Allows users to enter a URL - the link to a website or web page.' },
  { displayText: 'List', value: FieldControlType.LIST, explanation: 'Allows storing a value in a dropdown fashion' },
  { displayText: 'Checkbox', value: FieldControlType.CHECKBOX, explanation: 'Allows users to collect data by checking or unchecking a box.' },
  { displayText: 'Date', value: FieldControlType.DATE, explanation: 'Allows users to maintain dates either with a textbox that validates the input or a date picker interface.' },
  { displayText: 'Time', value: FieldControlType.TIME, explanation: 'Allows users to maintain time either with a textbox that validates the input or a time picker interface.' },
  { displayText: 'Date and Time', value: FieldControlType.DATE_TIME, explanation: 'Allows users to maintain date & time either with a textbox that validates the input or a date & time picker interface.' },
  // { displayText: 'Radio group', value: FieldControlType.RADIO },
  // { displayText: 'User Seletion', value: FieldControlType.USERSELECTION },
];

export const datasetFieldsCol2 = [
  // { displayText: 'Attachment', value: FieldControlType.ATTACHMENT },
  { displayText: 'Table', value: FieldControlType.GRID, explanation: 'Allows users to maintain multiple rows of data in a table having two or more fields.' },
  { displayText: 'Attachment', value: FieldControlType.ATTACHMENT, explanation: 'Allows users to upload files as attachments' },
  { displayText: 'Rich Text Editor', value: FieldControlType.HTML, explanation: 'Allows users to maintain any combination of letters and numbers and apply rich text formatting options.' },
  // { displayText: 'Email', value: FieldControlType.EMAIL },
  // { displayText: 'Password', value: FieldControlType.PASSWORD },
  { displayText: 'Email', value: FieldControlType.EMAIL, explanation: 'Allows users to enter an email address, which is validated to ensure a proper format.' },
  // { displayText: 'Grid', value: FieldControlType.HTML },
  // { displayText: 'Digital signature', value: FieldControlType.DIGITALSIGNATURE },
  // { displayText: 'Location', value: FieldControlType.GEOLOCATION },
  // { displayText: 'Html', value: FieldControlType.HTML },
  // { displayText: 'Decimal', value: FieldControlType.DECIMAL },
  // { displayText: 'Status', value: FieldControlType.STATUS },
  { displayText: 'Activate/Deactivate', value: FieldControlType.ACTIVATE_DEACTIVATE, explanation: 'Allows users to activate/deactivate a data structure within a dataset, such that deactivated data structure cannot be modified.' },
  { displayText: 'Dataset Reference', value: FieldControlType.DATASET_REFERENCE, explanation: 'Allows users to select from a list such that, list displays the records maintained in referenced dataset for selection.' }
];
export const systemDatasetFieldsCol1 = [
  { displayText: 'Text', value: FieldControlType.TEXT, explanation: 'Allows storing a value in a text format' },
  { displayText: 'Date', value: FieldControlType.DATE, explanation: 'Allows users to maintain dates either with a textbox that validates the input or a date picker interface.' }
];
