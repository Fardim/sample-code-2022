import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CoreService } from '@services/core/core.service';

import { FormControl } from '@angular/forms';
import { Component, OnInit, OnDestroy, OnChanges, Inject, LOCALE_ID } from '@angular/core';
export const DEBOUNCE_TIME = 700;

@Component({
  selector: 'pros-dash-menu-base',
  template: '',
})
export abstract class DashMenuBaseComponent implements OnInit, OnDestroy {
  isLoading = false;
  descprev = '';
  fetchcount = 0;
  filteredHeaderData = [];
  headerData = (this.filteredHeaderData = HeaderData);

  moduleList: IMenuItem[] = [];
  moduelListCtrl: FormControl = new FormControl(null);

  flowItems: IMenuItem[] = FlowMenuItems;
  filteredflowItems: IMenuItem[] = FlowMenuItems;
  flowItemsCtrl: FormControl = new FormControl(null);

  flowcommentItems: IMenuItem[] = FlowCommentItems;
  filteredflowcommentItems: IMenuItem[] = FlowCommentItems;
  flowcommentItemsCtrl: FormControl = new FormControl(null);

  flowusertypeItems: IMenuItem[] = FlowUserTypeItems;
  filteredflowusertypeItems: IMenuItem[] = FlowUserTypeItems;
  flowusertypeItemsCtrl: FormControl = new FormControl(null);

  flowfieldItems: IMenuItem[] = FlowFieldItems;
  filteredflowfieldItems: IMenuItem[] = FlowFieldItems;
  flowfieldItemsCtrl: FormControl = new FormControl(null);

  datasetlistItems: IMenuItem[] = []; // some item are dynamic
  filtereddatasetlistItems: IMenuItem[] = []; // some item are dynamic
  datasetlistItemsCtrl: FormControl = new FormControl(null);

  recordnoItems: IMenuItem[] = RecordnoItems;
  filteredrecordnoItems: IMenuItem[] = RecordnoItems;
  recordnoItemsCtrl: FormControl = new FormControl(null);

  recordnoEndItems: IMenuItem[] = RecordnoEndItems;
  filteredrecordnoEndItems: IMenuItem[] = RecordnoEndItems;
  recordnoEndItemsCtrl: FormControl = new FormControl(null);

  datasetfieldsItems: FieldItems[] = DatasetFieldsItems;
  filtereddatasetfieldsItems: FieldItems[] = DatasetFieldsItems;
  datasetfieldsItemsCtrl: FormControl = new FormControl(null);

  datasetfieldendItems: IMenuItem[] = [];
  filtereddatasetfieldendItems: IMenuItem[] = [];
  datasetfieldendItemsCtrl: FormControl = new FormControl(null);

  recordDataRecordnoItems: IMenuItem[] = RecordDataRecordnoItems;
  filteredrecordDataRecordnoItems: IMenuItem[] = RecordDataRecordnoItems;
  recordDataRecordnoCtrl: FormControl = new FormControl(null);

  systemFieldItems: IMenuItem[] = SystemFieldItems;
  filteredsystemFieldItems: IMenuItem[] = SystemFieldItems;
  recordFieldItems: IMenuItem[] = RecordFieldItems;
  filteredrecordFieldItems: IMenuItem[] = RecordFieldItems;
  systemFieldCtrl: FormControl = new FormControl(null);

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(public coreService: CoreService, @Inject(LOCALE_ID) public locale: string) {}

  ngOnInit(): void {
    this.moduelListCtrlSubscribe();
    this.flowItemsCtrlSubscribe();
  }

  moduelListCtrlSubscribe() {
    this.moduelListCtrl.valueChanges
      .pipe(debounceTime(DEBOUNCE_TIME), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
      .subscribe((search: string) => {
        search = search ? search.toLowerCase(): '';
        this.getModules({
          lang: 'en',
          fetchsize: 20,
          fetchcount: 0,
          description: search
        });
      });
  }
  flowItemsCtrlSubscribe() {
    this.flowItemsCtrl.valueChanges
    .pipe(debounceTime(DEBOUNCE_TIME), distinctUntilChanged(), takeUntil(this.unsubscribeAll$))
    .subscribe((search) => {
      search = search ? search.toLowerCase(): '';
      this.filteredflowItems = search
        ? this.flowItems.filter((d) => d.value.toLowerCase().indexOf(search) >= 0)
        : this.flowItems;
    });
  }

  resetvariables() {
    this.moduelListCtrl.setValue(null);
    this.flowItemsCtrl.setValue(null);
    this.flowcommentItemsCtrl.setValue(null);
    this.flowusertypeItemsCtrl.setValue(null);
    this.flowfieldItemsCtrl.setValue(null);
    this.datasetlistItemsCtrl.setValue(null);
    this.recordnoItemsCtrl.setValue(null);
    this.datasetfieldsItemsCtrl.setValue(null);
    this.datasetfieldendItemsCtrl.setValue(null);
    this.recordDataRecordnoCtrl.setValue(null);
    this.systemFieldCtrl.setValue(null);
  }

  getModules(options = { lang: 'en', fetchsize: 20, fetchcount: 0, description: ''}, isScrolled?: boolean) {
    let { lang, fetchsize, fetchcount, description } = options;
    if(!isScrolled) {
      this.isLoading = true;
    }
    if(options.description != this.descprev){
      this.descprev = options.description;
      this.moduleList = []
      this.isLoading = true;
      this.fetchcount = 0;
    }
    this.coreService
      .searchAllObjectType({ lang, fetchsize, fetchcount, description })
      .pipe(take(1))
      .subscribe(
        (resp: any) => {
          resp.forEach((d: any) => {
            this.moduleList.push({
              id: d.moduleId,
              value: d.moduleDesc,
              dataType: dataTypes.datasetlist,
              endnode: false,
              insertText: d.moduleId,
            });
          });
          this.isLoading = false;
        },
        (err) => (this.isLoading = false)
      );
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}

export enum dataTypes {
  header = 'header',
  datasetlist = 'datasetlist',
  datasetinfos = 'datasetinfos',
  flowitem = 'flowitem',
  flowcomment = 'flowcomment',
  flowcommentitem = 'flowcommentitem',
  flowusertype = 'flowusertype',
  flowusertypeitem = 'flowusertypeitem',
  flowfield = 'flowfield',
  flowfielditem = 'flowfielditem',
  recordno = 'recordno',
  recordnoitem = 'recordnoitem',
  recordnoitemend = 'recordnoitemend',
  recorddata = 'recorddata',
  recordDataRecordno = 'recordDataRecordno',
  datasetfields = 'datasetfields',
  datasetfielditem = 'datasetfielditem',
  datasetfielditemend = 'datasetfielditemend',
}

export interface IMenuItem {
  id: string;
  value: string;
  dataType: dataTypes;
  endnode: boolean;
  insertText: string;
  icon?: string;
}
export interface FieldItems extends IMenuItem {
  childs?: FieldItems[];
}

export const HeaderData: IMenuItem[] = [
  { id: '1', value: 'Dataset', dataType: dataTypes.header, icon: 'storage', endnode: false, insertText: 'Dataset' },
  { id: '2', value: 'Flow', dataType: dataTypes.header, icon: 'crop_landscape', endnode: false, insertText: 'Flow' },
  // { id: '3', value: 'Image', dataType: dataTypes.header, icon: 'image', endnode: false, insertText: 'Image' },
  // { id: '4', value: 'Link', dataType: dataTypes.header, icon: 'link', endnode: false, insertText: 'Link' },
];

export const FlowMenuItems: IMenuItem[] = [
  { id: 'Name', value: 'Name', dataType: dataTypes.flowitem, endnode: true, insertText: 'Name' },
  { id: '1', value: 'Dataset', dataType: dataTypes.header, endnode: false, insertText: 'Dataset' },
  { id: 'TaskId', value: 'TaskId', dataType: dataTypes.flowitem, endnode: true, insertText: 'TaskId' },
  { id: 'RecordNo', value: 'RecordNo', dataType: dataTypes.flowitem, endnode: true, insertText: 'RecordNo' },
  {
    id: 'ProcessInstanceId',
    value: 'ProcessInstanceId',
    dataType: dataTypes.flowitem,
    endnode: true,
    insertText: 'ProcessInstanceId',
  },
  { id: 'Action', value: 'Action', dataType: dataTypes.flowitem, endnode: true, insertText: 'Action' },
  { id: 'Comment', value: 'Comment', dataType: dataTypes.flowcomment, endnode: false, insertText: 'Comment' },
  { id: 'From', value: 'From', dataType: dataTypes.flowusertype, endnode: false, insertText: 'From' },
  { id: 'To', value: 'To', dataType: dataTypes.flowusertype, endnode: false, insertText: 'To' },
  { id: 'ClaimedBy', value: 'ClaimedBy', dataType: dataTypes.flowusertype, endnode: false, insertText: 'ClaimedBy' },
  {
    id: 'InitiatedBy',
    value: 'InitiatedBy',
    dataType: dataTypes.flowusertype,
    endnode: false,
    insertText: 'InitiatedBy',
  },
  { id: 'ForwardBy', value: 'ForwardBy', dataType: dataTypes.flowusertype, endnode: false, insertText: 'ForwardBy' },
  { id: 'FieldId', value: 'FieldId', dataType: dataTypes.flowfield, endnode: false, insertText: 'FieldId' },
];

export const FlowCommentItems: IMenuItem[] = [
  {
    id: 'RequestComment',
    value: 'RequestComment',
    dataType: dataTypes.flowcommentitem,
    endnode: true,
    insertText: 'RequestComment',
  },
  { id: 'history', value: 'history', dataType: dataTypes.flowcommentitem, endnode: true, insertText: 'history' },
  {
    id: 'SendForCorrection',
    value: 'SendForCorrection',
    dataType: dataTypes.flowcommentitem,
    endnode: true,
    insertText: 'SendForCorrection',
  },
  { id: 'Reset', value: 'Reset', dataType: dataTypes.flowcommentitem, endnode: true, insertText: 'Reset' },
  { id: 'Delete', value: 'Delete', dataType: dataTypes.flowcommentitem, endnode: true, insertText: 'Delete' },
  { id: 'Forward', value: 'Forward', dataType: dataTypes.flowcommentitem, endnode: true, insertText: 'Forward' },
];

export const FlowUserTypeItems: IMenuItem[] = [
  { id: 'UserId', value: 'UserId', dataType: dataTypes.flowusertypeitem, endnode: true, insertText: 'UserId' },
  { id: 'UserName', value: 'UserName', dataType: dataTypes.flowusertypeitem, endnode: true, insertText: 'UserName' },
  { id: 'UserRole', value: 'UserRole', dataType: dataTypes.flowusertypeitem, endnode: true, insertText: 'UserRole' },
];

export const FlowFieldItems: IMenuItem[] = [
  { id: 'UUID', value: 'UUID', dataType: dataTypes.flowfielditem, endnode: true, insertText: 'UUID' },
];

export const RecordnoItems: IMenuItem[] = [
  {
    id: 'Record no #1',
    value: 'Record no #1',
    dataType: dataTypes.recordnoitem,
    endnode: true,
    insertText: 'Record no #1',
  },
  {
    id: 'Record no #2',
    value: 'Record no #2',
    dataType: dataTypes.recordnoitem,
    endnode: true,
    insertText: 'Record no #2',
  },
  {
    id: 'Record no #3',
    value: 'Record no #3',
    dataType: dataTypes.recordnoitem,
    endnode: true,
    insertText: 'Record no #3',
  },
  {
    id: 'Record no #4',
    value: 'Record no #4',
    dataType: dataTypes.recordnoitem,
    endnode: true,
    insertText: 'Record no #4',
  },
];

export const RecordnoEndItems: IMenuItem[] = [
  { id: 'No', value: 'No', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'No' },
  { id: 'Field', value: 'Field', dataType: dataTypes.datasetfields, endnode: false, insertText: 'Field' },
  { id: 'LastModifiedOn', value: 'LastModifiedOn', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'LastModifiedOn' },
  { id: 'LastModifiedBy', value: 'LastModifiedBy', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'LastModifiedBy' },
  { id: 'CreatedBy', value: 'CreatedBy', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'CreatedBy' },
  { id: 'CreatedOn', value: 'CreatedOn', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'CreatedOn' },
];

export const DatasetFieldsItems: FieldItems[] = [
  {
    id: 'Field #1 ID',
    value: 'Field #1',
    dataType: dataTypes.datasetfielditem,
    endnode: false,
    insertText: 'Field #1',
  },
  {
    id: 'Field #2 ID',
    value: 'Field #2',
    dataType: dataTypes.datasetfielditem,
    endnode: false,
    insertText: 'Field #2',
  },
  {
    id: 'Field #3 ID',
    value: 'Field #3',
    dataType: dataTypes.datasetfielditem,
    endnode: false,
    insertText: 'Field #3',
  },
  {
    id: 'Field #4 ID',
    value: 'Field #4',
    dataType: dataTypes.datasetfielditem,
    endnode: false,
    insertText: 'Field #4',
  },
];

export const RecordDataRecordnoItems: IMenuItem[] = [
  {
    id: 'Record no #1',
    value: 'Record no #1',
    dataType: dataTypes.recordDataRecordno,
    endnode: false,
    insertText: `RecordNo.${'Record no #1'}.`,
  }, // `RecordNo.${item.id}.`
  {
    id: 'Record no #2',
    value: 'Record no #2',
    dataType: dataTypes.recordDataRecordno,
    endnode: false,
    insertText: `RecordNo.${'Record no #2'}.`,
  },
  {
    id: 'Record no #3',
    value: 'Record no #3',
    dataType: dataTypes.recordDataRecordno,
    endnode: false,
    insertText: `RecordNo.${'Record no #3'}.`,
  },
  {
    id: 'Record no #4',
    value: 'Record no #4',
    dataType: dataTypes.recordDataRecordno,
    endnode: false,
    insertText: `RecordNo.${'Record no #4'}.`,
  },
];

export const SystemFieldItems: IMenuItem[] = [
  {
    id: 'Last modified on',
    value: 'Last modified on',
    dataType: dataTypes.datasetfielditem,
    endnode: true,
    insertText: 'Last modified on',
  },
  {
    id: 'Last modified by',
    value: 'Last modified by',
    dataType: dataTypes.datasetfielditem,
    endnode: true,
    insertText: 'Last modified by',
  },
  {
    id: 'Created by',
    value: 'Created by',
    dataType: dataTypes.datasetfielditem,
    endnode: true,
    insertText: 'Created by',
  },
  {
    id: 'Created on',
    value: 'Created on',
    dataType: dataTypes.datasetfielditem,
    endnode: true,
    insertText: 'Created on',
  },
];

export const RecordFieldItems: IMenuItem[] = [
  { id: 'Field #1', value: 'Field #1', dataType: dataTypes.datasetfielditem, endnode: true, insertText: 'Field #1' },
  { id: 'Field #2', value: 'Field #2', dataType: dataTypes.datasetfielditem, endnode: true, insertText: 'Field #2' },
  { id: 'Field #3', value: 'Field #3', dataType: dataTypes.datasetfielditem, endnode: true, insertText: 'Field #3' },
  { id: 'Field #4', value: 'Field #4', dataType: dataTypes.datasetfielditem, endnode: true, insertText: 'Field #4' },
];

export interface FieldItemsFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}