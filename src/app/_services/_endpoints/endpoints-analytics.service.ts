import { Injectable } from '@angular/core';
import { WidgetType } from '@modules/report-v2/_models/widget';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EndpointsAnalyticsService {

  constructor() { }

  apiUrl = environment.apiurl + '/analytics';
  datasetURL = environment.apiurl+'/MDOSF';

  public reportDashboardUrl(reportId: number) {
    return `${this.apiUrl}/report/report-info/${reportId}`;
  }

  public getFieldMetadatByFldUrl(fieldId: string): string {
    return `${this.apiUrl}/report/fields-description/${fieldId}`;
  }

  public getStackBarChartMetaData(widgetId): string {
    return `${this.apiUrl}/report/widget/stack-barChart/metadata/${widgetId}`;
  }

  public getFiltertMetaData(widgetId): string {
    return `${this.apiUrl}/report/widget/filter/metadata/${widgetId}`;
  }


  public getListTableMetaData(widgetId,objectType,liveEditMode): string {
    return `${this.apiUrl}/report/widget/report-list/metadata/${widgetId}?objectType=${objectType}&liveEditMode=${liveEditMode}`;
  }

  public getBarChartMetaData(widgetId): string {
    return `${this.apiUrl}/report/widget/bar-chart/metadata/${widgetId}`;
  }

  public getCountMetadata(widgetId): string {
    return `${this.apiUrl}/report/widget/count/metadata/${widgetId}`;
  }

  public getHeaderMetaData(widgetId): string {
    return `${this.apiUrl}/report/widget/header/metadata/${widgetId}`;
  }

  public getTimeseriesWidgetInfoUrl(widgetId: number): string {
    return `${this.apiUrl}/report/widget/timeseries/${widgetId}`;
  }

  public createUpdateReportUrl(): string {
    return `${this.apiUrl}/report/create-update`;
  }

  public getReportListUrl(): string {
    return `${this.apiUrl}/report/list`;
  }
  public getimageMetadata(widgetId): string {
    return `${this.apiUrl}/report/widget/image/metadata/${widgetId}`;
  }

  public getHTMLMetadata(widgetId): string {
    return `${this.apiUrl}/report/widget/html-editor/metadata/${widgetId}`;
  }

  public getReportConfigUrl(reportId: string): string {
    return `${this.apiUrl}/report/${reportId}`;
  }

  public deleteReport(reportId: string): string {
    return `${this.apiUrl}/report/delete/${reportId}`;
  }

  public docCountUrl(objectType: string): string {
    return `${this.apiUrl}/report/record-count/${objectType}`;
  }

  public getReportListUrlForMsTeams(): string {
    return `${this.apiUrl}/report`;
  }

  public getLayoutMetadata(widgetId, objectNumber, layoutId): string {
    return `${this.apiUrl}/report/layout-metadata/${widgetId}/${objectNumber}/${layoutId}`;
  }

  public getlayoutData(widgetId, objectNumber): string {
    return `${this.apiUrl}/report/layout-data/${widgetId}/${objectNumber}`;
  }

  public getAttachmentData(): string {
    return `${this.apiUrl}/report/attachment-data`;
  }

  public defineColorPaletteForWidget(): string {
    return `${this.apiUrl}/report/color-palette`;
  }

  /**
   * endpoint to update data table column setting
   */
  public createUpdateReportDataTable(widgetId: string): string {
    return this.apiUrl + `/report/table/view/create-update/${widgetId}`;
  }

  /**
   * endpoint to get location hierarchy
   */
  public getLocationHierarchyUrl(topLocation: string, fieldId: string, searchString: string, searchFunc: string): string {
    return this.apiUrl + `/report/loc/searchLocationNode?topLocation=${topLocation}&fieldId=${fieldId}&searchString=${searchString}&searchFunc=${searchFunc}`
  }

  public downloadWidgetDataUrl(widgetId: string): string {
    return `${this.apiUrl}/widget/download/${widgetId}`;
  }

  public widgetDataUrl(): string {
    return `${this.apiUrl}/widgetData`;
  }

  public getCustomDataUrl(): string {
    return `${this.apiUrl}/report/custom-data`;
  }

  public getDIWDatasetUrl(): string {
    return `${this.datasetURL}/fapi/schema/diw-dataset/list`;
  }

  public getCustomDatasetFieldsUrl(objectId: string): string {
    return `${this.apiUrl}/report/custom-dataset/fields/${objectId}`
  }

  public saveReportDownload(widgetId: string, userName: string, location?: string): string {
    return `${this.apiUrl}/widget/startdoDownloadFile/${widgetId}?userName=${userName}&location=${location}`;
  }

  /**
   * endpoint to copy endpoint
   */
  public copyReport(reportId: string): string {
    return `${this.apiUrl}/report/copy?reportId=${reportId}`;
  }

  /**
   * endpoint to get display-criteria endpoint
   */
  public displayCriteria(widgetId: string, widgetType: WidgetType): string {
    return `${this.apiUrl}/report/widget/display-criteria?widgetId=${widgetId}&widgetType=${widgetType}`;
  }

  /**
   * endpoint to display-criteria endpoint
   */
  public displayCriteriaV2(widgetId: string, widgetType: WidgetType): string {
    return `${this.apiUrl}/report/widget/display-criteria/v2/${widgetId}?widgetType=${widgetType}`;
  }

  /**
   * endpoint to export report
   */
  public exportReport(reportId: string, reportName: string): string {
    return `${this.apiUrl}/report/export-config?reportId=${reportId}&reportName=${reportName}`;
  }

  /**
   * endpoint to import report to upload file
   */
  public importUploadReport(): string {
    return `${this.apiUrl}/report/upload`;
  }

  public deleteLogs(reportId) : string{
    return `${this.apiUrl}/report/import/delete-logs?reportId=${reportId}`;
  }

  /**
   * endpoint to import report
   */
  public importReport(fileSno: string, replaceOld: boolean, keepCopy: boolean, reportId: string, newReportId: string, isValidated: boolean): string {
    return `${this.apiUrl}/report/import?fileSno=${fileSno}&replaceOld=${replaceOld}&keepCopy=${keepCopy}&reportId=${reportId}&newReportId=${newReportId}&isValidated=${isValidated}`;
  }

  public shareReport(reportId: string): string {
    return `${this.apiUrl}/report/share?reportId=${reportId}`;
  }

  public getImportLog(reportId: string, page: number, size: number): string {
    return `${this.apiUrl}/report/import/logs?reportId=${reportId}&_page=${page}&size=${size}`;
  }

  public updateImportLog(messageId: string, status: string): string {
    return `${this.apiUrl}/report/import/logs/update-status?messageId=${messageId}&status=${status}`;
  }

  public discardDraftReport(reportId: number): string {
    return `${this.apiUrl}/report/v2/draft/discard?reportId=${reportId}`;
  }

  public saveDraft(reportId: number): string {
    return `${this.apiUrl}/report/v2/draft/bulk?reportId=${reportId}`;
  }

  public deleteWidget(reportId: number, widgetId: number): string {
    return `${this.apiUrl}/report/v2/delete/widget/${widgetId}?reportId=${reportId}`;
  }

  public saveReport(reportId: number): string {
    return `${this.apiUrl}/report/v2/save-update?reportId=${reportId}`;
  }

  public getReport(reportId: number): string {
    return `${this.apiUrl}/report/v2/get?reportId=${reportId}`;
  }

  public getWidgetView(reportId: string, widgetId: string): string {
    return `${this.apiUrl}/report/widget-view/get/${reportId}/${widgetId}`;
  }

  public saveAndUpdateWidgetView(): string {
    return `${this.apiUrl}/report/widget-view/save-update`;
  }

  /**
   *
   * @param widgetId hold the string value of widget id
   * @returns the url to get drop down values
   */
  public dropDownValuesUrl(widgetId: string): string {
    return `${this.apiUrl}/report/data/control/dropdown/${widgetId}`;
  }

  /**
   *
   * @param widgetId hold the string value of object id
   * @param pickList hold the value of picklist
   * @returns the value of radio drop down
   */
  public radioButtonDropDownValuesUrl(widgetId: number, pickList: string): string {
    return `${this.apiUrl}/report/data/control/${pickList}/${widgetId}`;
  }

  /**
   * endpoint to change-packageId endpoint
   */
  public updatepackageId(reportId: number, chkPackageId: string): string {
    return `${this.apiUrl}/report/change/packageId?reportId=${reportId}&chkPackageId=${chkPackageId}`;
  }

  public saveUpdateReportCollaborator(): string {
    return `${this.apiUrl}/admin/permission/collaborators/permission/save-update`;
  }

  public deleteCollaboratorUrl(permissionId: string): string {
    return `${this.apiUrl}/admin/permission/collaborator/delete/${permissionId}`;
  }

  public returnCollaboratorsPermisisonUrl(reportId: string): string {
    return `${this.apiUrl}/admin/permission/collaborators/permission/${reportId}`;
  }
}
