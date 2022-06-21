import { FormGroup } from '@angular/forms';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';

import { CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SecondaryNavRefresh, SecondaynavType } from '@models/menu-navigation';
import { ListPageViewDetails } from '@models/list-page/listpage';
import { DataScopeSidesheet } from '@models/schema/schema';
import { TeamMember } from '@models/teams';

/**
 * Action for pubsub
 */
export interface Action<T = any>{
  type: string;
  payload?: T;
}

/**
 * INIT behavior for pubsub
 */
export const INIT = '@@INIT'

/**
 * EMPTY state of the pubsub
 */
export const EMPTY = '@@EMPTY'

/**
 * Initial action
 */
export const initAction: Action = { type: INIT };

/**
 * Empty action
 */
export const emptyAction: Action = { type: INIT };

@Injectable({
  providedIn: 'root',
})
export class SharedServiceService {
  /**
   * common action behavior for pubsub
   * initial action 'INIT'
   */
  private actions$ = new BehaviorSubject<Action>(initAction);

  private chooseColumnSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private afterBrSaveUpdate: BehaviorSubject<any> = new BehaviorSubject(null);

  private reportListData: BehaviorSubject<any> = new BehaviorSubject(null);

  private virtualDatasetListData: BehaviorSubject<any> = new BehaviorSubject(null);

  private togglePrimaryEmit: BehaviorSubject<any> = new BehaviorSubject(null);

  public secondaryBarData: BehaviorSubject<any> = new BehaviorSubject(null);

  private refreshSecondaryNav: Subject<SecondaryNavRefresh> = new Subject<SecondaryNavRefresh>();

  private afterSubscriberSave: BehaviorSubject<any> = new BehaviorSubject(null);


  /**
   * obervable to signal loading state for components
   */
  public loader: BehaviorSubject<boolean> = new BehaviorSubject(null);
  /**
   * obervable to signal subscriber to call api for update notification
   */
  public updateNotifications: BehaviorSubject<any> = new BehaviorSubject(null);
  /**
   * behavior subject to contain settings info of the report-data-table widget
   */
  public reportDataTableSetting: BehaviorSubject<any> = new BehaviorSubject(null);

  /**
   * Trigger to refresh schema list so the latest running schema appears on top
   */
  public refresSchemaListTrigger: BehaviorSubject<any> = new BehaviorSubject(null);

  public updateGlobalCounts: BehaviorSubject<any> = new BehaviorSubject(null);

  private updateSchemaRunningState: BehaviorSubject<any> = new BehaviorSubject(null);

  /**
   * Identify whether loged in from msteam .. or web
   */
  private isFromMsTeamLogedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Behavior subject to identidy that scheduler is edit/add
   */
  private afterEditSchedule: BehaviorSubject<any> = new BehaviorSubject(null);

  /**
   * Behavior subject for duplicate rule exclusion edit
   */
  private updateRuleFieldExclusion: BehaviorSubject<any> = new BehaviorSubject(null);

  /**
   * Subject for Business rule saving
   */
  private saveBr: Subject<CoreSchemaBrInfo> = new Subject();

  /**
   * Behavior subject for data scope saving
   */
  private afterSaveDataScope: Subject<any> = new Subject();

  private viewDetailsSub: Subject<ListPageViewDetails> = new Subject();

  private taskinboxViewDetailsSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private schemaRunSub: Subject<boolean> = new Subject();

  private isSecondaySideNavBarOpen: Subject<boolean> = new Subject();

  /**
   * Subject for after saved  trans and reload in br map ...
   */
  private transSavedBehaviourSub: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Flag after save mappings ...
   */
  private afterMappingSaved: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private datascopeSheetState: BehaviorSubject<any> = new BehaviorSubject(null);

  private afterVariantDeleted: BehaviorSubject<any> = new BehaviorSubject(null);

  private filterCriteraSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private reloadDataSetModules: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private displayCriteraSub: Subject<string> = new Subject();

  private gridColumnResolveSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private filterTableBrData: BehaviorSubject<{ index: number, value: string }> = new BehaviorSubject(null);

  private afterGridRowSave: Subject<boolean> = new Subject();

  private transactionGridFormValue: Subject<any> = new Subject();

  private cpiConnectionsReloadTrigger: Subject<boolean> = new Subject();
  private transactionGridFormViewSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private selectedDataset: BehaviorSubject<any> = new BehaviorSubject(null);

  private gridFormRowSaveSub: Subject<string> = new Subject();

  private dataReferenceDetailsSub: BehaviorSubject<any[]> = new BehaviorSubject(null);

  private dataReferenceSaveSub: Subject<any[]> = new Subject();

  /**
   * Refresh the the list page if wants ...
   */
  private refreshListPage: BehaviorSubject<any> = new BehaviorSubject(null);

  private moduleListData: BehaviorSubject<any> = new BehaviorSubject([]);

  private flowDataSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private flowStepDataSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private processvariableSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private stepDataSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private schemaDetailsTableDataAPICallState: BehaviorSubject<any> = new BehaviorSubject(null);

  /**
   * Subject for the task inbox datatable data ...
   */
  private refreshTaskListDatatable: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public tableListConfigureSaved: Subject<boolean> = new Subject();

  isUserDetailsUpdated: Subject<boolean> = new Subject();

  private transDupColumnsDetails: BehaviorSubject<any> = new BehaviorSubject(null);

  private partnerRolesSub: Subject<any> = new BehaviorSubject(null);

  private afterExpansionViewClose: Subject<any> = new Subject();

  private afterDescGeneratorExpansionViewClose: Subject<{fieldId: string, fg: FormGroup}> = new Subject();

  descGenFormGroupSub: BehaviorSubject<{fieldId: string, fg: FormGroup}> = new BehaviorSubject<{fieldId: string, fg: FormGroup}>(null);
  descGenFormGroup$ = this.descGenFormGroupSub.asObservable();

  /**
   * Subject for removing mapping line on scroll
   */
  private mappingPositionOnScroll: BehaviorSubject<any> = new BehaviorSubject(false);

  private targetFieldSelected: BehaviorSubject<any> = new BehaviorSubject(null);

  public refreshReorderList = new EventEmitter();

  classForCharacteristics;

  private dataRefArr = [];

  copiedMDORecord: BehaviorSubject<any> = new BehaviorSubject(null);

  private classificationDataSub: BehaviorSubject<any> = new BehaviorSubject(null);

  private classificationReqSub: BehaviorSubject<any> = new BehaviorSubject(null);
  isBuisnessRuleListUpdated: Subject<boolean> = new Subject();

  constructor() {}

  public updateStepsData(setData:boolean){
    this.stepDataSub.next(setData);
  }
  public getUpdatedStepsData(){
    return this.stepDataSub.asObservable();
  }
  /**
   * publish an action
   * example: this.sharedService.publish({ type: 'MODULE_SAVE', payload: data });
   */
  publish<T = any>(action: Action<T>): void {
    this.actions$.next(action);

    // to handle the empty state
    setTimeout(() => this.actions$.next({ type: EMPTY }), 100);
  }

  /**
   * subscribe to an action
   * example: this.sharedService.ofType('MODULE_SAVE').subscribe((data) => ...);
   */
  ofType<T = any>(actionType: string){
    return this.actions$.pipe(filter((action: Action<T>) => action.type === actionType));
  }

  public setFlowData(data: any) {
    this.flowDataSub.next(data);
  }
  public getFlowStepData(): Observable<any> {
    return this.flowStepDataSub.asObservable();
  }
  public setFlowStepData(data:any){
    this.flowStepDataSub.next(data);
  }
  public getFlowData(): Observable<any> {
    return this.flowDataSub.asObservable();
  }

  public setChooseColumnData(data: any) {
    this.chooseColumnSub.next(data);
  }

  public getChooseColumnData(): Observable<any> {
    return this.chooseColumnSub.asObservable();
  }

  /**
   * Function to pass business rule data inside BehaviourSubject.
   */
  public setAfterBrSave(data: any) {
    this.afterBrSaveUpdate.next(data);
  }

  /**
   * Function to get business rule data of a schema.
   */
  public getAfterBrSave(): Observable<any> {
    return this.afterBrSaveUpdate.asObservable();
  }

  public setReportListData(isPageReload: boolean = false, isFromDeleteorEdit: boolean = false) {
    this.reportListData.next({ isPageReload, isFromDeleteorEdit });
  }

  public getReportListData(): Observable<any> {
    return this.reportListData.asObservable();
  }

  public setVirtualDatasetListData(isPageReload: boolean = false) {
    this.virtualDatasetListData.next({ isPageReload });
  }

  public getVirtualDatasetListData(): Observable<any> {
    return this.virtualDatasetListData.asObservable();
  }

  public setTogglePrimaryEmit() {
    this.togglePrimaryEmit.next(true);
  }

  public getTogglePrimaryEmit(): Observable<any> {
    return this.togglePrimaryEmit.asObservable();
  }

  public getSecondaryNavbarList() {
    this.secondaryBarData.next('');
  }
  /**
   * Use for refresh .. secondary nav bar
   * @param activeMenu set refresh type parameters ...
   * @param activeMenuItemId active item inside selected menu
   */
  public setRefreshSecondaryNav(activeMenu: SecondaynavType, isPageReload, activeMenuItemId?: string, details: Partial<SecondaryNavRefresh> = {}) {
    this.refreshSecondaryNav.next({ activeMenu, isPageReload, activeMenuItemId, ...details });
  }

  /**
   * Return the latest refresh details ..
   */
  public isSecondaryNavRefresh(): Observable<SecondaryNavRefresh> {
    return this.refreshSecondaryNav.asObservable();
  }

  /**
   * Function to pass subscriber data inside BehaviourSubject.
   */
  public setAfterSubscriberSave(data: any) {
    return this.afterSubscriberSave.next(data);
  }

  /**
   * Function to get data of subscriber
   */
  public getAfterSubscriberSave(): Observable<any> {
    return this.afterSubscriberSave.asObservable();
  }
  /*
   * function to call the subscriber to get notifications
   */
  public getNotificationCount() {
    return this.updateNotifications.next(true);
  }

  /**
   * function to set data of report data-table settings
   */
  public setReportDataTableSetting(data: any) {
    return this.reportDataTableSetting.next(data);
  }

  /**
   * function to get data of report data-table settings
   */
  public getReportDataTableSetting(): Observable<any> {
    return this.reportDataTableSetting.asObservable();
  }

  /**
   * Set is from msteam loged in ..
   * @param status updated status ...
   */
  public setIsFromMsTeamLogedIn(status: boolean) {
    this.isFromMsTeamLogedIn.next(status);
  }

  /**
   * Get flag for is from msteam ..
   */
  public getIsFromMsTeamLogedIn(): Observable<boolean> {
    return this.isFromMsTeamLogedIn.asObservable();
  }

  /**
   * function to set schedule info
   * @param data: data of schedule
   */
  public setScheduleInfo(data: any) {
    this.afterEditSchedule.next(data);
  }

  /**
   * function to get schedule info
   */
  public getScheduleInfo(): Observable<any> {
    return this.afterEditSchedule.asObservable();
  }

  public setExclusionData(data) {
    return this.updateRuleFieldExclusion.next(data);
  }

  public getExclusionData(): Observable<any> {
    return this.updateRuleFieldExclusion.asObservable();
  }

  public emitSaveBrEvent(brInfo: CoreSchemaBrInfo) {
    this.saveBr.next(brInfo);
  }

  public getSaveBrObs(): Observable<CoreSchemaBrInfo> {
    return this.saveBr.asObservable();
  }

  /**
   * Function to set data scope info after saving
   * @param data: dataScope object
   */
  public setDataScope(data) {
    this.afterSaveDataScope.next(data);
  }

  /**
   * Function to get data scope info after saving
   */
  public getDataScope(): Observable<any> {
    return this.afterSaveDataScope.asObservable();
  }

  public setViewDetailsData(data: any) {
    this.viewDetailsSub.next(data);
  }

  public getViewDetailsData(): Observable<any> {
    return this.viewDetailsSub.asObservable();
  }
  public settaskinboxViewDetailsData(data: any) {
    this.taskinboxViewDetailsSub.next(data);
  }
  public gettaskinboxViewDetailsData(): Observable<any> {
    return this.taskinboxViewDetailsSub.asObservable();
  }

  public setSchemaRunNotif(data: boolean) {
    this.schemaRunSub.next(data);
  }
  public getSchemaRunNotif(): Observable<any> {
    return this.schemaRunSub.asObservable();
  }
  public showLoader() {
    this.loader.next(true);
  }
  public hideLoader() {
    this.loader.next(false);
  }

  public setSecondarySideNavBarState(data: boolean) {
    this.isSecondaySideNavBarOpen.next(data);
  }

  public getSecondarySideNavBarState(): Observable<any> {
    return this.isSecondaySideNavBarOpen.asObservable();
  }

  public settransSavedBehaviourSub(flag: boolean) {
    this.transSavedBehaviourSub.next(flag);
  }

  public gettransSavedBehaviourSub(): Observable<boolean> {
    return this.transSavedBehaviourSub.asObservable();
  }

  public setAfterMappingSaved(flag: boolean) {
    this.afterMappingSaved.next(flag);
  }

  public getAfterMappingSaved(): Observable<boolean> {
    return this.afterMappingSaved.asObservable();
  }

  public setdatascopeSheetState(data: DataScopeSidesheet) {
    this.datascopeSheetState.next(data);
  }

  public completeSchemaRunning() {
    this.updateGlobalCounts.next(true);
    this.refresSchemaListTrigger.next(true);
  }

  public getdatascopeSheetState() {
    return this.datascopeSheetState.asObservable();
  }

  public setAfterVariantDeleted(id: string) {
    return this.afterVariantDeleted.next(id);
  }

  public getAfterVariantDeleted() {
    return this.afterVariantDeleted.asObservable();
  }

  public updateSchemaById(schemaId: string, state: boolean) {
    return this.updateSchemaRunningState.next({ schemaId, state });
  }

  public getSchemaRunningState() {
    return this.updateSchemaRunningState.asObservable();
  }

  public setFilterCriteriaData(data: any) {
    this.filterCriteraSub.next(data);
  }

  public getFilterCriteriaData() {
    return this.filterCriteraSub.asObservable();
  }

  public getReloadDatasetModulesTrigger(): Observable<boolean> {
    return this.reloadDataSetModules.asObservable();
  }

  set reloadDatasetModulesTrigger(trigger: boolean) {
    this.reloadDataSetModules.next(trigger);
  }

  /**
   * Download data from API
   * @param data response from API
   * @param fileName name of the file
   * @param type file type
   */
  public downloadFile(data, fileName, type) {
    const binaryData = [];
    binaryData.push(data);
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: 'text/plain' }));
    downloadLink.setAttribute('download', `${fileName}.${type}`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }

  public setDisplayCriteriaData(udrId: string) {
    this.displayCriteraSub.next(udrId);
  }

  public afterDisplayCriteriaSave() {
    return this.displayCriteraSub.asObservable();
  }

  public setGridRowDetails(data: any) {
    this.gridColumnResolveSub.next(data);
  }

  public getGridRowDetails() {
    return this.gridColumnResolveSub.asObservable();
  }

  public getFilterTableBrData(): Observable<{ index: number, value: string }> {
    return this.filterTableBrData.asObservable();
  }

  public setFilterTableBrData(data: { index: number, value: string }) {
    this.filterTableBrData.next(data);
  }

  public setAfterGridRowDetailsSave() {
    this.afterGridRowSave.next(true);
  }

  public getAfterGridRowDetailsSave() {
    return this.afterGridRowSave.asObservable();
  }
  public setOpenDataset() {
    this.selectedDataset.next(true);
  }

  public getOpenDataset() {
    return this.selectedDataset.asObservable();
  }
  public getCpiConnectionsReloadTrigger(): Observable<boolean> {
    return this.cpiConnectionsReloadTrigger.asObservable();
  }

  public set cpiConnectionsReloadTriggerValue(value) {
    this.cpiConnectionsReloadTrigger.next(value);
  }

  public setTransactionGridFormValue(data: any) {
    this.transactionGridFormValue.next(data);
  }

  public getTransactionGridFormValue() {
    return this.transactionGridFormValue.asObservable();
  }

  public setGridFormViewDetails(data: any) {
    this.transactionGridFormViewSub.next(data);
  }

  public getGridFormViewDetails() {
    return this.transactionGridFormViewSub.asObservable();
  }

  public setAfterGridFormRowSave(gridId: string) {
    this.gridFormRowSaveSub.next(gridId);
  }

  public getAfterGridFormRowSave() {
    return this.gridFormRowSaveSub.asObservable();
  }

  public setAfterDataRefSave(data: any[], fieldId: string) {
    const obj = { fieldId, rules: data };
    const index = this.dataRefArr.findIndex((data) => data.fieldId === fieldId);
    if(index === -1) {
      this.dataRefArr.push(obj);
    } else {
      this.dataRefArr[index] = obj;
    }
    this.dataReferenceSaveSub.next(data);
  }

  public getDatasetRefArr(fieldId: string) {
    const fieldData = this.dataRefArr.filter((data) => data.fieldId === fieldId);
    return fieldData.length? fieldData[0].rules : [];
  }

  public getAfterDataRefSave() {
    return this.dataReferenceSaveSub.asObservable();
  }

  public setDataRefDetails(data: any[]) {
    this.dataReferenceDetailsSub.next(data);
  }

  public getDataRefDetails() {
    return this.dataReferenceDetailsSub.asObservable();
  }

  public setRefreshListPage(value) {
    this.refreshListPage.next(value);
  }

  public get getRefreshListPage() {
    return this.refreshListPage.asObservable();
  }

  public setModuleListData(data) {
    this.moduleListData.next(data);
  }

  public get getModuleListData() {
    return this.moduleListData.asObservable();
  }

  public getSchemaDetailsTableDataAPICallState() {
    return this.schemaDetailsTableDataAPICallState.asObservable();
  }

  public setSchemaDetailsTableDataAPICallState(state: string){
    return this.schemaDetailsTableDataAPICallState.next(state);
  }


  public setRefreshTaskListDatatable(flag: boolean) {
    this.refreshTaskListDatatable.next(flag);
  }

  public getRefreshTaskListDatatable(): Observable<boolean> {
    return this.refreshTaskListDatatable.asObservable();
  }

  public onTableListConfigureSaved(): Observable<boolean> {
    return this.tableListConfigureSaved.asObservable();
  }

  public userProfileUpdated() {
    return this.isUserDetailsUpdated.asObservable();
  }

  public setTransDupColumnsDetails(data) {
    this.transDupColumnsDetails.next(data);
  }

  public getTransDupColumnsDetails(): Observable<any> {
    return this.transDupColumnsDetails.asObservable();
  }

  public setPartnerDetails(partnerInfo: TeamMember) {
    this.partnerRolesSub.next(partnerInfo);
  }

  public getPartnerDetails(): Observable<any> {
    return this.partnerRolesSub.asObservable();
  }

  public setAfterExpansionViewClose(data: any) {
    this.afterExpansionViewClose.next(data);
  }

  public getAfterExpansionViewClose(): Observable<any> {
    return this.afterExpansionViewClose.asObservable();
  }

  public setDescGenFormGroupSub(value: {fieldId: string, fg: FormGroup}) {
    this.descGenFormGroupSub.next(value);
  }

  public setAfterDescGeneratorExpansionViewClose(data: {fieldId: string, fg: FormGroup}) {
    this.afterDescGeneratorExpansionViewClose.next(data);
  }

  public getAfterDescGeneratorExpansionViewClose(): Observable<any> {
    return this.afterDescGeneratorExpansionViewClose.asObservable();
  }

  public setMappingPositionOnScroll(data: boolean) {
    this.mappingPositionOnScroll.next(data);
  }

  public getMappingPositionOnScroll(): Observable<boolean> {
    return this.mappingPositionOnScroll.asObservable();
  }

  public setTargetFieldSelected(data) {
    this.targetFieldSelected.next(data);
  }

  public getTargetFieldDetails(): Observable<any> {
    return this.targetFieldSelected.asObservable();
  }

  public setTClassificationData(data) {
    this.classificationDataSub.next(data);
  }

  public getTClassificationData(): Observable<any> {
    return this.classificationDataSub.asObservable();
  }

  public setClassificationReqData(data) {
    this.classificationReqSub.next(data);
  }

  public getClassificationReqData(): Observable<any> {
    return this.classificationReqSub.asObservable();
  }
}
