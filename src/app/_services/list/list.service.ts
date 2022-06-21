import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterCriteria, ListPageFilters, ListPageViewDetails, ListSearchEntry, ViewsPage } from '@models/list-page/listpage';
import { EndpointsListService } from '@services/_endpoints/endpoints-list.service';
import { EndpointsProcessService } from '@services/_endpoints/endpoints-process.service';
import { FlowAndFormDetails, FlowFormDetails, FlowForms } from '@modules/transaction/model/transaction';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor(private http: HttpClient,
    private endpointService: EndpointsListService,
    private endpointProcess: EndpointsProcessService) { }

  apiUrl = environment.apiurl;

  /**
   * get all list page views
   */
  public getAllListPageViews(moduleId, offSet): Observable<ViewsPage> {
    return this.http.get<ViewsPage>(this.endpointService.getAllListPageViewsUrl(), { params: { moduleId, offSet } });
  }

  /**
   * get list page view details
   * @param viewId view id
   */
  public getListPageViewDetails(viewId: string, moduleId): Observable<ListPageViewDetails> {
    return this.http.get<ListPageViewDetails>(this.endpointService.getListPageViewDetailsUrl(viewId), { params: { moduleId } });
  }

  /**
   * update list page view details
   */
  public upsertListPageViewDetails(viewDetails: ListPageViewDetails, moduleId): Observable<ListPageViewDetails> {
    return this.http.post<any>(this.endpointService.upsertListPageViewUrl(), viewDetails, { params: { moduleId } });
  }

  /**
   * delete list page view details
   */
  public deleteListPageView(viewId: string, moduleId): Observable<ListPageViewDetails> {
    return this.http.delete<any>(this.endpointService.deleteListPageViewUrl(viewId), { params: { moduleId } });
  }

  /**
   * get table records
   * @param moduleId module id
   * @param viewId active view id
   * @param pageId page index
   * @param filterCriterias applied filters
   * @returns page records
   */
  public getTableData(moduleId: string, viewId: string, pageId: number, filterCriterias: FilterCriteria[], ruleId?): Observable<any> {
    return this.http.post<any>(this.endpointService.getTableDataUrl(), filterCriterias, { params: { moduleId, viewId, pageId: `${pageId}`, ruleId } })
  }

  /**
   * get records count
   * @param moduleId module id
   * @param filterCriterias uplied filters
   * @returns total records count
   */
  public getDataCount(moduleId: string, filterCriterias: FilterCriteria[]): Observable<number> {
    return this.http.post<number>(this.endpointService.getDataCountUrl(), filterCriterias, { params: { moduleId } })
  }

  public upsertListFilters(filters: ListPageFilters): Observable<any> {
    return this.http.post<any>(this.endpointService.upsertListFiltersUrl(), filters)
  }

  /**
   * update default view
   * @param objectId module id
   * @param viewId view id
   * @returns acknowledgement
   */
  public updateDefaultView(objectId, viewId): Observable<any> {
    return this.http.put<any>(this.endpointService.updateDefaultViewUrl(), null, { params: { objectId, viewId } });
  }

  /**
   * get user global search history
   * @param objectId module id
   * @returns user search history
   */
  public getUserSearchHistory(objectId): Observable<ListSearchEntry[]> {
    return this.http.get<ListSearchEntry[]>(this.endpointService.getUserSearchHistoryUrl(), { params: { objectId } });
  }

  /**
   * save a new search entry
   * @param objectId object id
   * @param searchStr search string
   * @returns acknowledgment
   */
  public saveSearchHistory(objectId, searchStr): Observable<any> {
    return this.http.post<any>(this.endpointService.saveSearchHistoryUrl(), null, { params: { objectId, searchStr } });
  }

  public findDataByGlobalSearch(moduleId: string, fieldsMetadata, pageId: number, searchStr): Observable<any> {
    return this.http.post<any>(this.endpointService.findDataByGlobalSearchUrl(), fieldsMetadata, { params: { moduleId, pageId: `${pageId}`, searchStr } })
  }

  /**
   * clear user search history
   * @returns acknowledgment
   */
  public clearSearchHistory(): Observable<any> {
    return this.http.delete<any>(this.endpointService.clearSearchHistoryUrl());
  }

  public deleteFilter(filterId: string): Observable<any> {
    return this.http.delete<any>(`${this.endpointService.deleteFilterUrl()}/${filterId}`);
  }

  public getSavedFilters(moduleId: string, page: number) {
    return this.http.get<Partial<ListPageFilters>[]>(this.endpointService.getSavedFiltersUrl(), { params: { moduleId, page: `${page}` } });
    // return of(savedFilters);
  }

  /**
   * get flow list details
   * @param searchStr search string
   * @returns Flow list
   */
  public getFlowList(datasetId: string, eventId:string,searchString?: string, fetchCount?:string,fetchSize?: string,lang?: string): Observable<FlowAndFormDetails> {
    fetchCount = fetchCount || '0';
    fetchSize = fetchSize || '0';
    lang = lang || 'en';
    searchString = searchString || '';
    return this.http.get<any>(this.endpointProcess.getFlowListUrl(datasetId),{params:{eventId, fetchCount, fetchSize, lang, searchString}}).pipe(map(m=>{
      const array: FlowAndFormDetails = {flows:[],forms:[]};
      m?.flows?.forEach(ele => {
        const relatedDatasetsForms = [];
        if(ele.childMapping?.length) {
          ele.childMapping.forEach(cds => {
            const childdatasetId = Object.keys(cds) && Object.keys(cds).length && Object.keys(cds)[0] ;
            relatedDatasetsForms.push({
              dataSetId: childdatasetId,
              datasetDesc : cds[childdatasetId]?.datasetDesc,
              formId: cds[childdatasetId]?.formId,
              formDesc: cds[childdatasetId]?.formDesc,
              referenceDatasets: cds[childdatasetId]?.refernceDataSet,
            })
          });
        }
        const flowDetails: FlowFormDetails = {
          flowDesc: ele.flowDesc || '',
          flowId: ele.flowId || '',
          forms :[{
            dataSetId: datasetId,
            datasetDesc: ele?.parentMapping[datasetId]?.datasetDesc || '',
            formDesc : ele?.parentMapping[datasetId]?.formDesc || '',
            formId: ele?.parentMapping[datasetId]?.formId || '',
            referenceDatasets: ele?.parentMapping[datasetId]?.refernceDataSet || [],
          }],
          stepId: ele?.stepId,
          relatedDatasetsForms
        }
        array.flows.push(flowDetails);
      });

      if(array?.flows?.length === 0) {
        array.flows.push({
          isNoFlows: true,
          flowDesc: 'No Flow Found',
          flowId: '',
          forms: []
        } as any)
      }

      // for forms
      m.forms?.forEach(ele=>{
        const form: FlowForms = {
          dataSetId:'',
          datasetDesc:'',
          formDesc:ele?.formDesc || '',
          formId: ele?.formId || '',
        };
        array.forms.push(form);
      });

      if(array?.forms?.length === 0) {
        array.forms.push({
          isNoFlows: true,
          formDesc: 'No Form Found',
          formId: ''
        } as any)
      }
     return array;
    }));
  }

  /**
   * Checks the field type
   */
  getFieldType(pickList: string) {
    switch(pickList) {
      case '1':
      case '37':
        return 'DROPDOWN';
      case '38':
        return 'ATTACHMENT';
      case '15':
        return 'GRID';
      case '4':
        return 'RADIO';
      case '2':
        return 'CHECKBOX';
      case '55':
        return 'URL';
      case '54':
        return 'TIMEPICKER';
      case '52':
        return 'DATEPICKER';
      case '22':
        return 'TEXTAREA';
      case '36':
        return 'TOGGLE';
      case '30':
        return 'DATA-REF';
      case '31':
        return 'HTML-EDITOR'
      default :
        return 'TEXT'
    }
  }


  /**
   * Export the list page data with filters ...
   * @param dataSetId the dataset from where want to export the excel file
   * @param flowId download with this flow ...
   * @param stepId the step which will part of flow
   * @returns Observable of that content ...
   */
  public exportExcelAddin(dataSetId: string , flowId?: string , stepId?: string, _filter?:FilterCriteria[]): Observable<any> {
    if(!dataSetId) {
      throw new Error(`Dataset is request fields please pass dataset id`);
    }
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.post(this.endpointService.exportExcelAddin(), _filter || {}, { headers, responseType: 'text',params:{dataSetId: dataSetId || '', flowId: flowId || '', stepId: stepId || ''} });
  }
}

