import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { ListFilters, ListPageRow } from '@models/list-page/listpage';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EndpointsClassicService } from './_endpoints/endpoints-classic.service';

@Injectable({
  providedIn: 'root'
})
export class ListPageService {
  sampleList: ListPageRow[] = [
    {
      MaterialID: 'Material ID 1231',
      Description: 'Lorem ipsum dolor sit amet, consectetur',
      MaterialType: 'ERSA-Spare Parts',
      Modifiedby: 'John Smith',
      Modifiedon: 'DD/MM',
      Status: 'In progress',
      Tags: [
        {
          color: '#e1d3ff',
          value: 'Tag1'
        },
        {
          color: '#bed2ff',
          value: 'Tag2'
        }
      ]
    },
  {
      MaterialID: 'Material ID 1232',
      Description: 'Lorem ipsum dolor sit amet, consectetur',
      MaterialType: 'ERSA-Spare Parts',
      Modifiedby: 'John Smith',
      Modifiedon: 'DD/MM',
      Status: 'In progress',
      Tags: [
        {
          color: '#e1d3ff',
          value: 'Tag1'
        },
        {
          color: '#bed2ff',
          value: 'Tag2'
        }
      ]
    },
  {
      MaterialID: 'Material ID 1233',
      Description: 'Lorem ipsum dolor sit amet, consectetur',
      MaterialType: 'ERSA-Spare Parts',
      Modifiedby: 'John Smith',
      Modifiedon: 'DD/MM',
      Status: 'In progress',
      Tags: [
        {
          color: '#e1d3ff',
          value: 'Tag1'
        },
        {
          color: '#bed2ff',
          value: 'Tag2'
        }
      ]
    },
  {
      MaterialID: 'Material ID 1234',
      Description: 'Lorem ipsum dolor sit amet, consectetur',
      MaterialType: 'ERSA-Spare Parts',
      Modifiedby: 'John Smith',
      Modifiedon: 'DD/MM',
      Status: 'In progress',
      Tags: [
        {
          color: '#e1d3ff',
          value: 'Tag1'
        },
        {
          color: '#bed2ff',
          value: 'Tag2'
        }
      ]
    },
  {
      MaterialID: 'Material ID 1235',
      Description: 'Lorem ipsum dolor sit amet, consectetur',
      MaterialType: 'ERSA-Spare Parts',
      Modifiedby: 'John Smith',
      Modifiedon: 'DD/MM',
      Status: 'In progress',
      Tags: [
        {
          color: '#e1d3ff',
          value: 'Tag1'
        },
        {
          color: '#bed2ff',
          value: 'Tag2'
        }
      ]
    },
  {
      MaterialID: 'Material ID 1236',
      Description: 'Lorem ipsum dolor sit amet, consectetur',
      MaterialType: 'ERSA-Spare Parts',
      Modifiedby: 'John Smith',
      Modifiedon: 'DD/MM',
      Status: 'In progress',
      Tags: [
        {
          color: '#e1d3ff',
          value: 'Tag1'
        },
        {
          color: '#bed2ff',
          value: 'Tag2'
        }
      ]
    },
  {
      MaterialID: 'Material ID 1237',
      Description: 'Lorem ipsum dolor sit amet, consectetur',
      MaterialType: 'ERSA-Spare Parts',
      Modifiedby: 'John Smith',
      Modifiedon: 'DD/MM',
      Status: 'In progress',
      Tags: [
        {
          color: '#e1d3ff',
          value: 'Tag1'
        },
        {
          color: '#bed2ff',
          value: 'Tag2'
        }
      ]
    },
  {
      MaterialID: 'Material ID 1238',
      Description: 'Lorem ipsum dolor sit amet, consectetur',
      MaterialType: 'ERSA-Spare Parts',
      Modifiedby: 'John Smith',
      Modifiedon: 'DD/MM',
      Status: 'In progress',
      Tags: [
        {
          color: '#e1d3ff',
          value: 'Tag1'
        },
        {
          color: '#bed2ff',
          value: 'Tag2'
        }
      ]
    },
  {
      MaterialID: 'Material ID 1239',
      Description: 'Lorem ipsum dolor sit amet, consectetur',
      MaterialType: 'ERSA-Spare Parts',
      Modifiedby: 'John Smith',
      Modifiedon: 'DD/MM',
      Status: 'In progress',
      Tags: [
        {
          color: '#e1d3ff',
          value: 'Tag1'
        },
        {
          color: '#bed2ff',
          value: 'Tag2'
        }
      ]
    }
  ]


  // columnDefinitions = [
  //   { Def: 'star', Label: 'star', Visible: true, Disabled: true},
  //   { Def: 'select', Label: 'select', Visible: true, Disabled: true},
  //   { Def: 'MaterialID', Label: 'MaterialID', Visible: true, Disabled: true},
  //   { Def: 'Description', Label: 'Description', Visible: true, Disabled: false},
  //   { Def: 'MaterialType', Label: 'MaterialType', Visible: true, Disabled: false},
  //   { Def: 'Modifiedby', Label: 'Modifiedby', Visible: true, Disabled: false},
  //   { Def: 'Modifiedon', Label: 'Modifiedon', Visible: true, Disabled: false},
  //   { Def: 'Status', Label: 'Status', Visible: true, Disabled: false},
  //   { Def: 'Tags', Label: 'Tags', Visible: true, Disabled: false}
  // ]

  columnDefinitions = [
    {
      dataType: null,
      fieldName: 'dynObjectNumber',
      colWidth: 100,
      enableEditing: false,
      filterCritera: '',
      fieldText: 'dynObjectNumber',
      pickList: null,
      textAlign: 'LFT',
      ischeckList: null,
      descField: null,
      criteriaDisplay: null
    },
    {
      dataType: 'ALTN',
      fieldName: 'ALT_NUMBER',
      colWidth: 50,
      enableEditing: false,
      filterCritera: '',
      fieldText: 'SAP Number',
      pickList: 0,
      textAlign: 'LFT',
      ischeckList: 'false',
      descField: 'false',
      criteriaDisplay: null
    },
    {
      dataType: 'CHAR',
      fieldName: 'MATL_TYPE',
      colWidth: 100,
      enableEditing: false,
      filterCritera: '',
      fieldText: 'Material Type',
      pickList: 1,
      textAlign: 'LFT',
      ischeckList: 'false',
      descField: 'false',
      criteriaDisplay: '0'
    },
    {
      dataType: 'CHAR',
      fieldName: 'MATL_DESC',
      colWidth: 200,
      enableEditing: false,
      filterCritera: '',
      fieldText: 'Material Desc(Standard)',
      pickList: 0,
      textAlign: 'LFT',
      ischeckList: 'false',
      descField: 'true',
      criteriaDisplay: ''
    },
    {
      dataType: 'CHAR',
      fieldName: 'MANUFACT',
      colWidth: 100,
      enableEditing: false,
      filterCritera: '',
      fieldText: 'Manufacturer Part Number(Standard)',
      pickList: 0,
      textAlign: 'LFT',
      ischeckList: 'false',
      descField: 'false',
      criteriaDisplay: ''
    },
    {
      dataType: null,
      fieldName: 'STATUS',
      colWidth: 100,
      enableEditing: false,
      filterCritera: '',
      fieldText: 'STATUS',
      pickList: null,
      textAlign: 'LFT',
      ischeckList: null,
      descField: null,
      criteriaDisplay: null
    },
    {
      dataType: null,
      fieldName: 'STAGE',
      colWidth: 100,
      enableEditing: false,
      filterCritera: '',
      fieldText: 'STAGE',
      pickList: null,
      textAlign: 'LFT',
      ischeckList: null,
      descField: null,
      criteriaDisplay: null
    },
    {
      dataType: null,
      fieldName: 'APPDATE',
      colWidth: 100,
      enableEditing: false,
      filterCritera: '',
      fieldText: 'APPDATE',
      pickList: null,
      textAlign: 'LFT',
      ischeckList: null,
      descField: null,
      criteriaDisplay: null
    },
    {
      dataType: null,
      fieldName: 'USERMODIFIED',
      colWidth: 100,
      enableEditing: false,
      filterCritera: '',
      fieldText: 'USERMODIFIED',
      pickList: null,
      textAlign: 'LFT',
      ischeckList: null,
      descField: null,
      criteriaDisplay: null
    }
  ]

  functionField = [
    {
      objectType: '100',
      objectDesc: 'Superior Functional Location'
    },
    {
      objectType: '105',
      objectDesc: 'Planner Group'
    }
  ]

  savedSearches = [
    { searchName: 'Search 1', id: 'ss-1' },
    { searchName: 'Search 2', id: 'ss-2' },
    { searchName: 'Search 3', id: 'ss-3' },
    { searchName: 'Search 4', id: 'ss-4' }
  ]

  sampleFilters: ListFilters = {
    textInput: '',
    status : [
      {
        display: 'In Progress',
        value: '1',
        selected: true
      }, {
        display: 'Completed',
        value: '2',
        selected: false
      }, {
        display: 'Pending',
        value: '3',
        selected: true
      }, {
        display: 'Approved',
        value: '4',
        selected: false
      }, {
        display: 'Draft',
        value: '5',
        selected: true
      }, {
        display: 'System',
        value: '6',
        selected: true
      }
    ],
    superior: [
      { display: 'All', value: 'All', checked: false },
      { display: 'Complete', value: 'Complete', checked: false },
      { display: 'Progress', value: 'Progress', checked: false },
      { display: 'Delete', value: 'Delete', checked: false }
    ],
    planner: [
      { display: 'Critical', value: 'Critical', checked: false },
      { display: 'High', value: 'High', checked: false },
      { display: 'Medium', value: 'Medium', checked: false },
      { display: 'Low', value: 'Low', checked: false }
    ],
    modified_from_date: '',
    modified_to_date: '',
    creation_from_date: '',
    creation_to_date: '',
    record: '',
  }



  /**
   * Constructor of @class ListPageService
   */
  constructor(
    public endpointService: EndpointsClassicService,
    private http: HttpClient
  ) { }

  /**
   * Function to get List Page from Service
   */
  getLists() {
    return of(this.sampleList)
  }

  public getDynamiclistcolumn(userDetails): Observable<any> {
    const url = this.endpointService.getDynamicColumnListsUrl();
    const params1 = new HttpParams().set('objectId', '1005').set('lang', 'EN').set('templateId', '').set('userRole', userDetails.currentRoleId).set('username', userDetails.userName);
    return this.http.get(url, { params: params1 });
  }

  /**
   * Function to get saves searches
   */
  getSavedSearches() {
    return of(this.savedSearches);
  }

  /**
   * Function to get filters
   */
  getFilters() {
    return of(this.sampleFilters)
  }

  /**
   * Function to get function filters
   */
  getFunFilters() {
    return of(this.functionField)
  }

  public getDynamicFiltermeta(userDetails): Observable<any> {
    const url = this.endpointService.getDynamicFiltermetaListsUrl();
    const params1 = new HttpParams().set('userId', userDetails.userName).set('plantCode', userDetails.plantCode).set('roleId', userDetails.currentRoleId).set('objectType', '1005').set('lang', 'en').set('clientId', '738');
    return this.http.get(url, { params: params1 });
  }

  /**
   * function to get columns(optional as of now)
   */
  getColumns() {
    return of(this.columnDefinitions);
  }

}
