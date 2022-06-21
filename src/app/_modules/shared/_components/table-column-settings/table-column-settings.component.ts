import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { MetadataModel, MetadataModeleResponse, SchemaTableViewRequest, SchemaTableViewFldMap, TableActionViewType, SchemaTableAction, CrossMappingRule, DetailView, STANDARD_TABLE_ACTIONS } from 'src/app/_models/schema/schemadetailstable';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { SharedServiceService } from '../../_services/shared-service.service';
import { SchemaDetailsService } from 'src/app/_services/home/schema/schema-details.service';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { SchemaListDetails } from '@models/schema/schemalist';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { debounceTime, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaExecutionNodeType } from '@models/schema/schema-execution';


@Component({
  selector: 'pros-table-column-settings',
  templateUrl: './table-column-settings.component.html',
  styleUrls: ['./table-column-settings.component.scss']
})
export class TableColumnSettingsComponent implements OnInit, OnDestroy{

  getMdmr: MetadataModeleResponse[];
  headerFieldObs: Observable<MetadataModel[]> = of([]);

  data = null;
  editEnabledList = [];

  userDetails = new Userdetails();

  /**
   * Current schema info ..
   */
  schemaInfo: SchemaListDetails;

  actionsForm: FormGroup;

  actionsList: SchemaTableAction[] = [];

  configTabSelectedIndex = 0;

  COMMON_ACTIONS = [
    {actionText: 'Approve', schemaCategories: [DetailView.DATAQUALITY_VIEW, DetailView.DUPLICACY_VIEW, DetailView.MRO_CLASSIFICATION_VIEW, DetailView.POTEXT_VIEW],
    actionCode: STANDARD_TABLE_ACTIONS.APPROVE, actionIconLigature: 'check' },
    {actionText: 'Reject', schemaCategories: [DetailView.DATAQUALITY_VIEW, DetailView.DUPLICACY_VIEW, DetailView.MRO_CLASSIFICATION_VIEW, DetailView.POTEXT_VIEW],
    actionCode: STANDARD_TABLE_ACTIONS.REJECT, actionIconLigature: 'ban'},
    {actionText: 'Delete', schemaCategories: [DetailView.DUPLICACY_VIEW], actionCode: STANDARD_TABLE_ACTIONS.DELETE, actionIconLigature: 'trash-alt'},
    {actionText : 'Generate description', actionIconLigature: 'file-alt', schemaCategories: [DetailView.MRO_CLASSIFICATION_VIEW], actionCode: STANDARD_TABLE_ACTIONS.GENERATE_DESC}
  ];

  TableActionViewType = TableActionViewType;

  crossMappingRules: CrossMappingRule[]= [];


  /**
   * hold initial action text while edit starts
   */
  previousActionText = '';

  /**
   * Get all selected or non-selected fields based on selected nodeid ...
   */
  fields: SchemaTableViewFldMap[] = [];

  /**
   * fields obserable to help the render data ...
   */
  fieldsObs: Observable<SchemaTableViewFldMap[]> = of([]);

  /**
   * Search input subject .. will help to make http with debounce time
   */
  serachFieldsSub: BehaviorSubject<string> = new BehaviorSubject(null);

  /**
   * Scoll cout ...
   */
  ftchCnt = 0 ;

  /**
   * Hold all selected fields before save call
   */
  beforeSaveState: SchemaTableViewFldMap[] = [];

  subscriptions: Subscription[] = [];

  constructor(
    private sharedService: SharedServiceService,
    private router: Router,
    private schemaDetailsService: SchemaDetailsService,
    private userService: UserService,
    private schemaListService: SchemalistService,
    private glocalDialogService: GlobaldialogService,
    private schemaService: SchemaService
  ){}

  ngOnDestroy(): void {
    this.subscriptions.forEach(f=> f.unsubscribe());
    this.serachFieldsSub.complete();
    this.serachFieldsSub.unsubscribe();
  }

  ngOnInit() {

    this.sharedService.getChooseColumnData().pipe(take(1)).subscribe(data=>{
      console.log(data);
      if (data) {
        if (data.editActive) {
          this.data = JSON.parse(JSON.stringify(data));
          this.getSchemaDetails();
          this.getFields('');
        }
      } else {
        this.close();
      }
    });

    this.userService.getUserDetails().subscribe(res => {
      this.userDetails = res;
    }, error => console.error(`Error : ${error.message}`));

    this.serachFieldsSub.pipe(filter(res=> res !== null), debounceTime(200), distinctUntilChanged()).subscribe(res=>{
      this.ftchCnt = 0;
      this.getFields(res);
    });

  }

  /**
   * Get all the fields based on nodeId and nodeType
   * @param srchStr the search string ...
   * @param frmScroll the flag to identify the call from scroll or normal call ....
   */
  getFields(srchStr: string, frmScroll?: boolean) {
    const sub = this.schemaService.getallFieldsbynodeId((this.data?.activeNode?.nodeType || SchemaExecutionNodeType.HEADER), (this.data?.activeNode?.nodeId || 'header'), this.data.schemaId, this.data.variantId, this.ftchCnt,srchStr,false).subscribe(res=>{

        const flds: SchemaTableViewFldMap[] = [];
        res.selectedFields = res.selectedFields? res.selectedFields : [];
        res.unselectedFields = res.unselectedFields? res.unselectedFields : [];
        res.selectedFields.forEach(f=> f.isSelected = true);
        flds.push(...res.selectedFields);

        res.unselectedFields.forEach((f, index)=>{
          const fld: SchemaTableViewFldMap = new SchemaTableViewFldMap();
          fld.isEditable = true; fld.fieldId = f.fieldId; fld.editable = true;
          fld.metadataCreateModel = f; fld.order = flds.length -1;
          flds.push(fld);
        });

        if(frmScroll) {
          this.fields.push(...flds);
          this.fieldsObs = of(this.fields);
        } else {
          this.fieldsObs = of(flds);
          this.fields = flds;
        }

        // keep updated selectd node ...
        this.fields.filter(f=> f.isSelected === true).forEach(f=>{
          if(this.beforeSaveState.findIndex(idx=> idx.fieldId === f.fieldId) === -1) {
            this.beforeSaveState.push(f);
          }
        });
      }, err=> console.error(`Exception : ${err.message}`));
      this.subscriptions.push(sub);
  }


  close()
  {
    // this.sharedService.setChooseColumnData({...this.data, tableActionsList: this.actionsList, editActive: false});
    this.router.navigate([{ outlets: { sb: null }}],  {queryParamsHandling: 'preserve'});
  }

  public persistenceTableView(selFld: SchemaTableViewFldMap[]) {
    const schemaTableViewRequest: SchemaTableViewRequest = new SchemaTableViewRequest();
    schemaTableViewRequest.schemaId = this.data.schemaId;
    schemaTableViewRequest.variantId = this.data.variantId ? this.data.variantId: '0';
    schemaTableViewRequest.schemaTableViewMapping = selFld;

    this.schemaDetailsService.updateSchemaTableView(schemaTableViewRequest).subscribe(response => {
      console.log(response);
      this.sharedService.setChooseColumnData({...this.data, selectedFields: this.beforeSaveState, editActive: false});
      this.close();
    }, error => {
      console.error('Exception while persist table view');
    });
  }


  /**
   * Search field by value change
   * @param value changed input value
   */
  searchFld(value: string) {
    this.serachFieldsSub.next(value);
  }

  /**
   * While change checkbox state ..
   * @param fld changeable checkbox
   */
  selectionChange(evt, fld: MetadataModel) {
    console.log(evt);
    const selIndex =  this.beforeSaveState.findIndex(f => f.fieldId === fld.fieldId);
    if(selIndex !==-1) {
      this.beforeSaveState[selIndex].isSelected = evt;
      this.beforeSaveState[selIndex].isEditable = true;

      this.fields[selIndex].isSelected = evt;
      this.fields[selIndex].isEditable = true;
      this.fieldsObs = of(this.fields);
    } else {
      const fieldView = new SchemaTableViewFldMap();
      fieldView.fieldId = fld.fieldId; fieldView.isSelected = true;
      fieldView.isEditable = true;
      fieldView.nodeId = fld.nodeId; fieldView.nodeType = fld.nodeType;
      this.beforeSaveState.push(fieldView);
    }
  }

  /**
   * checked is checked
   * @param fld field for checking is selected or not
   */
  isChecked(fld: MetadataModel): boolean {
    const selCheck = this.beforeSaveState.find(f => fld.fieldId === f.fieldId && f.isSelected === true);
    return selCheck ? true : false;
  }

  /**
   * While drag and drop on list elements
   * @param event dragable elemenet
   */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  /**
   * Submit selected columns ..
   */
  submitColumn() {
    const orderFld: SchemaTableViewFldMap[] = [];
    // const hdlFld = this.header.map(map=> map.fieldId);
    let choosenField: SchemaTableViewFldMap ;
    this.beforeSaveState.filter(field =>field.isSelected === true).forEach(h=>{
      choosenField = new SchemaTableViewFldMap();
      choosenField.order = this.fields.findIndex(f=> f.fieldId === h.fieldId);
      choosenField.isEditable = h.isEditable;
      choosenField.nodeId = h.nodeId ? h.nodeId : (this.data && this.data.activeNode ? this.data.activeNode.nodeId : null);
      choosenField.nodeType = h.nodeType ? h.nodeType : (this.data && this.data.activeNode ? this.data.activeNode.nodeType : null);;
      choosenField.fieldId = h.fieldId;
      orderFld.push(choosenField);
    });
    this.persistenceTableView(orderFld);
  }

  editableChange(fld: MetadataModel){
    const fieldIdx = this.beforeSaveState.findIndex(f => f.fieldId === fld.fieldId);
    if (fieldIdx !== -1){
      this.beforeSaveState[fieldIdx].isEditable = this.beforeSaveState[fieldIdx].isEditable ? false : true;
    }
  }

  isEditEnabled(fld : MetadataModel){
    return this.beforeSaveState.findIndex(field => (field.fieldId === fld.fieldId) && field.isEditable ) !== -1;
  }

  /**
   * Get schema info ..
   */
  getSchemaDetails() {
    this.schemaListService.getSchemaDetailsBySchemaId(this.data.schemaId).subscribe(res => {
      this.schemaInfo = res;
      if(this.isActionConfigAllowed) {
        this.getSchemaActions();
        this.getCrossMappingRules();
      }
    }, error => console.error(`Error : ${error.message}`))
  }

  getCrossMappingRules() {
    this.schemaDetailsService.getCrossMappingRules('0')
      .subscribe(rules => this.crossMappingRules = rules);
  }

  /**
   * get already saved schema actions
   */
  getSchemaActions() {
    this.schemaDetailsService.getTableActionsBySchemaId(this.data.schemaId).subscribe(actions => {
      console.log(actions);
      if(actions && actions.length) {
        this.actionsList = actions;
      } else {
        this.addCommonActions();
      }
    });
  }

  /**
   * create common actions if table actions list is empty
   */
  addCommonActions() {
    this.COMMON_ACTIONS.forEach( commonAction  => {
      if(commonAction.schemaCategories.includes(this.schemaInfo.schemaCategory as DetailView)) {
        const action = { schemaId: this.data.schemaId, isPrimaryAction: true, isCustomAction: false,
          actionViewType: TableActionViewType.ICON_TEXT, actionText:commonAction.actionText, createdBy: this.userDetails.userName,
          actionCode: commonAction.actionCode, actionIconLigature: commonAction.actionIconLigature } as SchemaTableAction;

          this.actionsList.push(action);
      }
    })
  }



  /**
   * update action on change
   * @param rowIndex action index
   * @param attributeKey changed key
   * @param attributeValue new value
   */
  actionChanged(rowIndex: number, attributeKey: string, attributeValue) {
    this.actionsList[rowIndex][attributeKey] = attributeValue;
  }

  /**
   * create update a schema action
   * @param action to be updated
   * @param rowIndex inside the actions list
   */
  createUpdateAction(action: SchemaTableAction, rowIndex?: number) {
    this.schemaDetailsService.createUpdateSchemaAction(action).subscribe(resp => {
      console.log(resp);
      rowIndex !== undefined ? this.actionsList[rowIndex] = resp : this.actionsList.splice(0, 0, resp);
      this.sharedService.setChooseColumnData({...this.data, tableActionsList: this.actionsList, editActive: false});
    })
  }

  /**
   * add a new custom action...
   */
  addCustomAction() {
    const action = {schemaId: this.data.schemaId, actionText: `My custom action ${this.actionsList.length}`, isPrimaryAction: false,
      actionViewType: TableActionViewType.TEXT, isCustomAction: true, createdBy: this.userDetails.userName, actionOrder: 0} as SchemaTableAction;

    this.actionsList.splice(0, 0, action);

  }

  /**
   * remove an existing custom action
   * @param rowIndex custom action index
   */
  removeCustomAction(rowIndex: number) {

    this.glocalDialogService.confirm({label:'Are you sure you want to delete this ?'}, (resp) => {
      this.removeActionAfterConfirm(resp, rowIndex);
    })


  }

  removeActionAfterConfirm(resp, rowIndex) {
    if (resp && resp === 'yes') {
      const action = this.actionsList[rowIndex];
      if (!action.sno) {
        this.actionsList.splice(rowIndex, 1);
      } else {
        this.schemaDetailsService.deleteSchemaTableAction(this.data.schemaId, action.actionCode)
          .subscribe(result =>  {
            this.actionsList.splice(rowIndex, 1);
      });
      }
    }
  }

  /**
   * check if current user has actions config permission
   */
  get isActionConfigAllowed() {
    if(this.schemaInfo && this.userDetails) {
      const isAdmin = this.schemaInfo.collaboratorModels?.isAdmin;
      const isSameUser = this.schemaInfo.createdBy === this.userDetails.userName;

      return isAdmin || isSameUser;
    }
  }


  get primaryActions() {
    return this.actionsList.filter(action => action.isPrimaryAction);
  }

  get secondaryActions() {
    return this.actionsList.filter(action => !action.isPrimaryAction);
  }

  editActionText(rowIndex: number) {
    console.log(rowIndex);

    if (!this.actionsList[rowIndex].isCustomAction) {
      console.log('Only custom actions can be renamed');
      return;
    }

    this.previousActionText = this.actionsList[rowIndex].actionText;

    if (document.getElementById('inpctrl_' + rowIndex)) {
      const inpCtrl = document.getElementById('inpctrl_' + rowIndex) as HTMLDivElement;
      const viewCtrl = document.getElementById('viewctrl_'+ rowIndex) as HTMLSpanElement;
      inpCtrl.style.display = 'block';
      // inpValCtrl.focus();
      viewCtrl.style.display = 'none';
    }
  }

  emitActionTextBlur(rowIndex: number, value) {
    if (document.getElementById('inpctrl_' + rowIndex)) {
      const inpCtrl = document.getElementById('inpctrl_' + rowIndex) as HTMLDivElement;
      const viewCtrl = document.getElementById('viewctrl_'+ rowIndex) as HTMLSpanElement;
      inpCtrl.style.display = 'none';
      viewCtrl.style.display = 'block';
      if (value && value !== this.previousActionText) {
        this.actionChanged(rowIndex, 'actionText', value);
      } else {
        this.actionsList[rowIndex].actionText = this.previousActionText;
      }
    }
  }

  getActionViewTypeDesc(viewType: TableActionViewType) {
    if (viewType === TableActionViewType.ICON) {
      return 'Icon only';
    }
    else if (viewType === TableActionViewType.ICON_TEXT) {
      return 'Icon and text';
    }
    else {
      return 'Text only';
    }
  }

  /**
   * create update a list of schema actions
   */
  saveTableActionsConfig() {
    this.actionsList.forEach((action, index) => action.actionOrder = index);
    this.schemaDetailsService.createUpdateSchemaActionsList(this.actionsList).subscribe(actions => {
      console.log(actions);
      this.sharedService.setChooseColumnData({selectedFields: this.beforeSaveState, tableActionsList: actions, editActive: false});
      this.close();
    }, error => {
      console.log('something went wrong!')
    })
  }

  /**
   * save updated config
   * @param activeTab current active tab 0-columns/1-actions
   */
  save(activeTab: number) {

    if (activeTab === 0) {
      this.submitColumn();
    } else if (activeTab === 1) {
      this.saveTableActionsConfig();
    }
  }

  /**
   * keep scrolling to get more data
   */
  keepScrolling() {
    this.ftchCnt++;
    this.getFields(this.serachFieldsSub.getValue() ? this.serachFieldsSub.getValue() : '', true);
  }

  /**
   * Check the field id can't be null
   * @param obj current object ...
   * @returns check field exits or not
   */
  fldTrackBy(obj: SchemaTableViewFldMap): string {
    return obj.fieldId ? obj.fieldId : null;
  }

}
