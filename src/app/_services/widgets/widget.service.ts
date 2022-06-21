import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as XLSX from 'xlsx';
import {
  BarChartWidget,
  WidgetHeader,
  TimeSeriesWidget,
  WidgetImageModel,
  WidgetHtmlEditor,
  ReportingWidget,
  LayoutTabResponse,
  MDORECORDESV3,
  WidgetColorPalette,
  DuplicateReport,
  DisplayCriteria,
  ImportReport,
  WidgetViewDetails,
  WidgetViewRequestPayload,
} from 'src/app/_modules/report/_models/widget';
import { Criteria,WidgetType, Count } from '@modules/report-v2/_models/widget';
import { TreeModel } from '@modules/report/view/dashboard-container/filter/hierarchy-filter/hierarchy-filter.component';
import { EndpointsAnalyticsService } from '@services/_endpoints/endpoints-analytics.service';
import { Widget } from '@modules/report-v2/_models/widget';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WidgetService {
  public count: BehaviorSubject<any> = new BehaviorSubject<any>(0);

  public filterWidgetList: Widget[] = [];
  public filterdCriteria: Criteria[] = [];

  public isSideSheetClose: Subject<Criteria[]> = new Subject();
  public isPropertyPanelDataChanged: Subject<boolean> = new Subject();

  constructor(private http: HttpClient, private endpointAnalyticService: EndpointsAnalyticsService,private location:Location) {}

  /**
   * Call this method for widget data
   * Provide widgetId , and filterCriteria
   */
  public getWidgetData(widgetId: string, filterCriteria: Criteria[],searchString?:string, searchAfter?:string, timeZone?:string, location?: string , selectedPeriodOption :string = ''): Observable<any> {
    const url = this.location.path();
    const reportId = url.split('edit/')[1] || url.split('view/')[1];
    const liveEditMode = url.includes('report/edit') + '';
    searchString = !searchString ? '': searchString;
    filterCriteria = filterCriteria ? filterCriteria : [];
    searchAfter = searchAfter ? searchAfter : '';
    timeZone = timeZone ? timeZone :'';
    location = location ? location :'';
    selectedPeriodOption = selectedPeriodOption ? selectedPeriodOption : '';
    if(!liveEditMode && !reportId) {
      return this.http.post<any>(this.endpointAnalyticService.widgetDataUrl(), filterCriteria,
        { params: { widgetId,searchString,searchAfter,timeZone,location,seriesWith : selectedPeriodOption}});
    } else {
      return this.http.post<any>(this.endpointAnalyticService.widgetDataUrl(), filterCriteria,
        { params: { widgetId,searchString,searchAfter,timeZone,location,seriesWith : selectedPeriodOption, liveEditMode, reportId}});
    }
  }

  public getListdata(size, from, widgetId: string, filterCriteria: Criteria[], sortMapStr: any, location: string): Observable<any> {
    filterCriteria = filterCriteria ? filterCriteria : [];
    location = location ? location : '';
    if (sortMapStr) {
      sortMapStr = JSON.stringify(sortMapStr);
      return this.http.post<any>(this.endpointAnalyticService.widgetDataUrl(), filterCriteria, {
        params: { widgetId, size, from, sortMapStr, location },
      });
    } else {
      return this.http.post<any>(this.endpointAnalyticService.widgetDataUrl(), filterCriteria, {
        params: { widgetId, size, from, location },
      });
    }
  }

  public getStackChartMetadata(widgetId): Observable<any> {
    return this.http.get<any>(this.endpointAnalyticService.getStackBarChartMetaData(widgetId));
  }

  public getFilterMetadata(widgetId): Observable<any> {
    return this.http.get<any>(this.endpointAnalyticService.getFiltertMetaData(widgetId));
  }

  public getListTableMetadata(widgetId, objectType: string,widgetRequest): Observable<ReportingWidget[]> {
    const url = this.location.path();
    const liveEditValue = url.includes('report/edit');
    return this.http.post<ReportingWidget[]>(this.endpointAnalyticService.getListTableMetaData(widgetId, objectType,liveEditValue),{widgetRequest});
  }

  public getBarChartMetadata(widgetId): Observable<BarChartWidget> {
    return this.http.get<BarChartWidget>(this.endpointAnalyticService.getBarChartMetaData(widgetId));
  }

  public getCountMetadata(widgetId): Observable<Count> {
    return this.http.get<Count>(this.endpointAnalyticService.getCountMetadata(widgetId));
  }

  public getHeaderMetaData(widgetId): Observable<WidgetHeader> {
    return this.http.get<WidgetHeader>(this.endpointAnalyticService.getHeaderMetaData(widgetId));
  }

  public getTimeseriesWidgetInfo(widgetId: number): Observable<TimeSeriesWidget> {
    return this.http.get<TimeSeriesWidget>(this.endpointAnalyticService.getTimeseriesWidgetInfoUrl(widgetId));
  }

  public getimageMetadata(widgetId): Observable<WidgetImageModel> {
    return this.http.get<WidgetImageModel>(this.endpointAnalyticService.getimageMetadata(widgetId));
  }

  public getHTMLMetadata(widgetId): Observable<WidgetHtmlEditor> {
    return this.http.get<WidgetHtmlEditor>(this.endpointAnalyticService.getHTMLMetadata(widgetId));
  }

  public updateCount(count) {
    this.count.next(count);
  }

  downloadImage(dataURI: string, imgName: string) {
    dataURI = dataURI.split('data:image/png;base64,')[1];
    const url = window.URL.createObjectURL(this.dataURItoBlob(dataURI));
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = imgName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

  downloadCSV(excelFileName: string, data: any[]) {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, excelFileName + '.csv');
    } catch (e) {}
  }

  getLayoutMetadata(widgetId: string, objectNumber: string, layoutId: string, roleId: string): Observable<LayoutTabResponse[]> {
    return this.http.get<any>(this.endpointAnalyticService.getLayoutMetadata(widgetId, objectNumber, layoutId), { params: { roleId } });
  }

  getlayoutData(widgetId: string, objectNumber: string): Observable<MDORECORDESV3> {
    return this.http.get<any>(this.endpointAnalyticService.getlayoutData(widgetId, objectNumber));
  }

  getAttachmentData(snos: object): Observable<any> {
    return this.http.post<any>(this.endpointAnalyticService.getAttachmentData(), snos);
  }
  /**
   * Call http for save or define widget color palette
   * @param req define color palette request for widget
   */
  defineWidgetColorPalette(req: WidgetColorPalette): Observable<WidgetColorPalette> {
    return this.http.post<WidgetColorPalette>(this.endpointAnalyticService.defineColorPaletteForWidget(), req);
  }

  /**
   * Call http to get location hireeachy
   */
  getLocationHirerachy(
    topLocation: string,
    fieldId: string,
    searchString: string,
    searchFunc: string,
    plantCode: string
  ): Observable<TreeModel[]> {
    return this.http.get<TreeModel[]>(
      this.endpointAnalyticService.getLocationHierarchyUrl(topLocation, fieldId, searchString, searchFunc),
      { params: { plantCode } }
    );
  }

  /**
   * Call http to copy / duplicate a report
   */
  public copyReport(reportId: string, reportName: string): Observable<DuplicateReport> {
    return this.http.post<DuplicateReport>(this.endpointAnalyticService.copyReport(reportId), {
      reportName,
    });
  }

  /**
   * Call http to get DisplayCriteria for a Widget
   */
  public getDisplayCriteria(widgetId: string, widgetType: WidgetType): Observable<any> {
    return this.http.get<any>(this.endpointAnalyticService.displayCriteriaV2(widgetId, widgetType));
  }

  /**
   * Call http to save DisplayCriteria for a Widget
   */
  public saveDisplayCriteria(widgetId: string, widgetType: WidgetType, displayCriteria: DisplayCriteria, body = null): Observable<any> {
    const url = displayCriteria ? `&displayCriteria=${displayCriteria}` : '';
    return this.http.post<any>(this.endpointAnalyticService.displayCriteria(widgetId, widgetType) + url, body);
  }

  /**
   * Call http to export a report
   */
  public exportReport(reportId: string, reportName: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get(this.endpointAnalyticService.exportReport(reportId, reportName), { headers, responseType: 'text' });
  }

  /**
   * Call http to import a report to upload file
   */
  public importUploadReport(file: File): Observable<ImportReport> {
    /* Form Data */
    const formData = new FormData();
    // Store form name as "file" with file data
    formData.append('file', file, file.name);
    return this.http.post<ImportReport>(this.endpointAnalyticService.importUploadReport(), formData);
  }

  public deleteLogs(reportId): Observable<any> {
    return this.http.delete<any>(this.endpointAnalyticService.deleteLogs(reportId));
  }

  /**
   * Call http to import a report to upload file
   */
  public importReport(file: File, fileSno: string = '', replaceOld: boolean, keepCopy: boolean, reportId: string = '', newReportId: string = '', isValidated: boolean = false): Observable<ImportReport> {
    const formData = new FormData();
    // Store form name as "file" with file data
    formData.append('file', file, file.name);
    return this.http.post<ImportReport>(this.endpointAnalyticService.importReport(fileSno, replaceOld, keepCopy, reportId, newReportId, isValidated), formData);
  }

  /**
   * Call http to get widget view type
   */
  public getWidgetView(reportId: string, widgetId: string) {
    return this.http.get<WidgetViewDetails>(this.endpointAnalyticService.getWidgetView(reportId, widgetId));
  }

  public saveWidgetView(requestBody: WidgetViewRequestPayload) {
    return this.http.post<WidgetViewDetails>(this.endpointAnalyticService.saveAndUpdateWidgetView(), requestBody);
  }

  public updateWidgetView(requestBody: WidgetViewRequestPayload) {
    return this.http.put<WidgetViewDetails>(this.endpointAnalyticService.saveAndUpdateWidgetView(), requestBody);
  }

  get getFilterWidgetList(): Widget[] {
    return this.filterWidgetList;
  }

  public setFilterWidgetList(widgetList: Widget[]) {
    this.filterWidgetList = widgetList;
  }

  get getFilterCriteria(): Criteria[] {
    return this.filterdCriteria;
  }

  public setFilterCriteria(criteria: Criteria[]) {
    this.filterdCriteria = criteria;
  }

  public sideSheetStatusChange() {
    return this.isSideSheetClose.asObservable();
  }

  /**
   * Call http to update chkPackageId for a Report
   */
  public updatepackageId(reportId: number, chkPackageId: string): Observable<any> {
    return this.http.put<any>(this.endpointAnalyticService.updatepackageId(reportId, chkPackageId),null);
  }

  /**
   * method to disable save button on builder
   */
  public disableSave() {
    return this.isPropertyPanelDataChanged.asObservable();
  }
}
