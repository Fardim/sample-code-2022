import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDatatableColumnSettingsComponent } from './report-datatable-column-settings.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from '../../../../../../app-material-for-spec.module';
import { Router } from '@angular/router';
import { MetadataModel, MetadataModeleResponse } from '../../../../../../_models/schema/schemadetailstable';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { SharedModule } from '@modules/shared/shared.module';
import { ReportService } from '@modules/report/_service/report.service';
import { of } from 'rxjs';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { DisplayCriteria } from '@modules/report/_models/widget';
import { By } from '@angular/platform-browser';

describe('ReportDatatableColumnSettingsComponent', () => {
  let component: ReportDatatableColumnSettingsComponent;
  let fixture: ComponentFixture<ReportDatatableColumnSettingsComponent>;
  let router: Router;
  let reportServiceSpy: ReportService;
  let sharedserviceSpy: SharedServiceService;
  let schemaDetailsService: SchemaDetailsService;
  const selectedColumns = (displayCriteria = DisplayCriteria.CODE) => {
    return [
      {
        fieldId: 'NDCTYPE',
        fieldDescri: 'NDC TYPE MATERIAL',
        displayCriteria,
      },
      {
        fieldId: 'MATL_TYPE',
        fieldDescri: 'MATERIAL TYPE',
        displayCriteria,
      },
    ] as MetadataModel[];
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportDatatableColumnSettingsComponent, SearchInputComponent],
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
    }).compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDatatableColumnSettingsComponent);
    component = fixture.componentInstance;
    reportServiceSpy = fixture.debugElement.injector.get(ReportService);
    sharedserviceSpy = fixture.debugElement.injector.get(SharedServiceService);
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close(), should close the side sheet', async () => {
    // fixture.detectChanges();
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { sb: null } }]);
  });

  it('selectAllCheckboxes(), should select/unselect all check boxes', async () => {
    component.allCheckboxSelected = true;
    component.headers = [
      {
        fieldId: 'NDCTYPE',
      } as MetadataModel,
    ];
    component.data = {
      objectType: 1005,
      selectedColumns: [],
      isWorkflowdataSet: false,
      widgetId: 123456,
    };
    component.selectAllCheckboxes();
    expect(component.allIndeterminate).toEqual(false);

    component.allCheckboxSelected = false;
    component.selectAllCheckboxes();
    expect(component.allIndeterminate).toEqual(false);
    // expect(component.data.selectedColumns.length).toEqual(1);
  });

  it('manageStateOfCheckbox(), should manage the state of checkboxes', async () => {
    component.headers = [
      {
        fieldId: 'NDCTYPE',
        fieldDescri: 'NDC TYPE MATERIAL',
      } as MetadataModel,
    ];

    component.data = {
      objectType: 1005,
      selectedColumns: [
        {
          fieldId: 'NDCTYPE',
          fieldDescri: 'NDC TYPE MATERIAL',
        },
        {
          fieldId: 'MATL_TYPE',
          fieldDescri: 'MATERIAL TYPE',
        },
      ],
      isWorkflowdataSet: false,
      widgetId: 123456,
    };

    component.hvyFields = [];
    component.gvsFields = [];
    component.manageStateOfCheckbox();
    expect(component.allIndeterminate).toEqual(true);

    component.headers = [
      {
        fieldId: 'NDCTYPE',
        fieldDescri: 'NDC TYPE MATERIAL',
      } as MetadataModel,
    ];

    component.data = {
      objectType: 1005,
      selectedColumns: [
        {
          fieldId: 'NDCTYPE',
          fieldDescri: 'NDC TYPE MATERIAL',
        },
      ],
      isWorkflowdataSet: false,
      widgetId: 123456,
    };

    component.manageStateOfCheckbox();
    expect(component.allIndeterminate).toEqual(false);
    expect(component.allCheckboxSelected).toEqual(true);
  });

  it('getCustomFields(), get Custom Fields of widget', async(() => {
    const obj = 'numberoflogin';
    component.data = {};
    const res = [
      { fieldId: 'USERID', fieldDescri: 'User Id' },
      { fieldId: 'TIMEZONE', fieldDescri: 'Time Zone' },
    ];
    spyOn(reportServiceSpy, 'getCustomDatasetFields').withArgs(obj).and.returnValue(of(res));
    spyOn(component, 'manageStateOfCheckbox');
    component.getCustomFields(obj);
    expect(reportServiceSpy.getCustomDatasetFields).toHaveBeenCalledWith(obj);
    expect(component.headers.length).toEqual(2);

    component.data = {
      selectedColumns: ['fname'],
    };
    component.getCustomFields(obj);
    expect(component.headers.length).toEqual(3);
  }));

  it('ngOnInit(), preloadaed function', async(() => {
    const response = {
      objectType: 'numberoflogin',
      selectedColumns: selectedColumns(),
      isWorkflowdataSet: false,
      isCustomdataSet: true,
      widgetId: '9876534433',
      isRefresh: false,
      displayCriteria: DisplayCriteria.TEXT,
    };
    spyOn(sharedserviceSpy, 'getReportDataTableSetting').and.returnValue(of(response));
    component.ngOnInit();
    expect(sharedserviceSpy.getReportDataTableSetting).toHaveBeenCalled();
    expect(component.data.objectType).toEqual('numberoflogin');
  }));

  it('ngOnInit(), preloadaed function', async(() => {
    const response = {
      objectType: 'numberoflogin,test',
      selectedColumns: selectedColumns(),
      isWorkflowdataSet: false,
      isCustomdataSet: true,
      widgetId: '9876534433',
      isRefresh: false,
      displayCriteria: DisplayCriteria.TEXT,
    };
    spyOn(sharedserviceSpy, 'getReportDataTableSetting').and.returnValue(of(response));
    component.ngOnInit();
    expect(sharedserviceSpy.getReportDataTableSetting).toHaveBeenCalled();
    expect(component.data.objectType).toEqual('numberoflogin,test');
  }));

  it('getWorkFlowFields(), get Workflow Fields of widget', async(() => {
    const obj = Array('1005');
    component.data = { displayCriteria: DisplayCriteria.CODE };
    const res = {
      static: [
        { fieldId: 'status', fieldDescri: 'Staus', displayCriteria: '' },
        { fieldId: 'CRID', fieldDescri: 'Criteria Id', displayCriteria: '' },
      ],
      dynamic: [{ fieldId: 'PO_UNIT', fieldDescri: 'Order Unit', displayCriteria: '' }],
      hierarchy: [{ fieldId: 'IND_SECTOR', fieldDescri: 'Indestory Sector', displayCriteria: '' }],
    };
    spyOn(schemaDetailsService, 'getWorkflowFields').withArgs(obj).and.returnValue(of(res));
    spyOn(component, 'manageStateOfCheckbox');
    component.getWorkFlowFields(obj);
    expect(schemaDetailsService.getWorkflowFields).toHaveBeenCalledWith(obj);
    expect(component.headers.length).toEqual(4);

    component.data = {
      selectedColumns: ['WFID'],
    };
    component.getWorkFlowFields(obj);
    expect(component.headers.length).toEqual(5);
  }));

  it('ngOnInit(), preloadaed function', async(() => {
    const response = {
      objectType: '1005',
      selectedColumns: selectedColumns(),
      isWorkflowdataSet: true,
      isCustomdataSet: false,
      widgetId: '9876534433',
      isRefresh: false,
      displayCriteria: DisplayCriteria.TEXT,
    };
    spyOn(sharedserviceSpy, 'getReportDataTableSetting').and.returnValue(of(response));
    component.ngOnInit();
    expect(sharedserviceSpy.getReportDataTableSetting).toHaveBeenCalled();
    expect(component.data.objectType).toEqual('1005');
  }));

  it('getAllMetaDataFields(), get metadata Fields of widget', async(() => {
    const obj = '1005';
    component.data = { selectedColumns: [] };
    const res = {
      headers: {
        MARA_NRFHG: {
          fieldId: 'MARA_NRFHG',
          fieldDescri: 'Qual.f.FreeGoodsDis',
        },
        GS_TO_DATE: {
          fieldId: 'GS_TO_DATE',
          fieldDescri: 'To Date',
        },
      },
      grids: { ADD_EANDATA: { fieldId: 'ADD_EANDATA', fieldDescri: 'Additional EAN Grid', dataType: 'CHAR', maxChar: '100' } },
      gridFields: {
        ADD_EANDATA: {
          ADD_EANCAT: { fieldId: 'ADD_EANCAT', fieldDescri: 'EAN category', dataType: 'CHAR', maxChar: '2', mandatory: '0' },
        },
      },
      hierarchy: [{ objnr: 1, heirarchyId: '1', heirarchyText: 'Plant Data', fieldId: 'PLANT', structureId: '0002' }],
      hierarchyFields: {
        1: { ABC_ID: { fieldId: 'ABC_ID', fieldDescri: 'ABC Indicator', dataType: 'CHAR', maxChar: '1', mandatory: '0' } },
      },
    } as MetadataModeleResponse;
    spyOn(schemaDetailsService, 'getMetadataFields').withArgs(obj).and.returnValue(of(res));
    spyOn(component, 'manageStateOfCheckbox');
    component.getAllMetaDataFields(obj);
    expect(schemaDetailsService.getMetadataFields).toHaveBeenCalledWith(obj);
    expect(component.headers.length).toEqual(7);
    expect(component.nestedDataSource.length).toEqual(2);

    component.data = {
      selectedColumns: [
        { fieldId: '\'GS_TO_DATE\'', fieldDescri: 'GS To DATE', displayCriteria: DisplayCriteria.TEXT },
        { fieldId: 'ABC_ID', fieldDescri: 'ABC Indicator', displayCriteria: DisplayCriteria.TEXT },
        { fieldId: '\'ADD_EANCAT\'', fieldDescri: 'EAN category', displayCriteria: DisplayCriteria.TEXT },
      ],
    };
    component.getAllMetaDataFields(obj);
    expect(component.headers.length).toEqual(7);
    expect(component.nestedDataSource.length).toEqual(2);
  }));

  it('ngOnInit(), preloadaed function', async(() => {
    const response = {
      objectType: '1005',
      selectedColumns: selectedColumns(),
      isWorkflowdataSet: false,
      isCustomdataSet: false,
      widgetId: '9876534433',
      isRefresh: false,
      displayCriteria: DisplayCriteria.TEXT,
    };
    spyOn(sharedserviceSpy, 'getReportDataTableSetting').and.returnValue(of(response));
    component.ngOnInit();
    expect(sharedserviceSpy.getReportDataTableSetting).toHaveBeenCalled();
    expect(component.data.objectType).toEqual('1005');
  }));

  it('manageAllDisplayCriteria(), allDisplayCriteria should equal TEXT', async(() => {
    component.headers = [{ displayCriteria: DisplayCriteria.TEXT }] as MetadataModel[];
    component.manageAllDisplayCriteria();
    expect(component.allDisplayCriteria).toEqual(DisplayCriteria.TEXT);
  }));

  it('manageAllDisplayCriteria(), allDisplayCriteria should equal CODE', async(() => {
    component.headers = [{ displayCriteria: DisplayCriteria.CODE }] as MetadataModel[];
    component.manageAllDisplayCriteria();
    expect(component.allDisplayCriteria).toEqual(DisplayCriteria.CODE);
  }));

  it('manageAllDisplayCriteria(), allDisplayCriteria should equal CODE_TEXT', async(() => {
    component.headers = [{ displayCriteria: DisplayCriteria.CODE_TEXT }] as MetadataModel[];
    component.manageAllDisplayCriteria();
    expect(component.allDisplayCriteria).toEqual(DisplayCriteria.CODE_TEXT);
  }));

  it('manageAllDisplayCriteria(), allDisplayCriteria should equal null', async(() => {
    component.headers = [{ displayCriteria: DisplayCriteria.CODE_TEXT }, { displayCriteria: DisplayCriteria.CODE }] as MetadataModel[];
    component.manageAllDisplayCriteria();
    expect(component.allDisplayCriteria).toEqual(null);
  }));

  it('changeAllDisplayCriteria(), should change all selectedColumns.displayCriteria to CODE_TEXT', async(() => {
    component.data = {
      objectType: 1005,
      selectedColumns: [
        {
          fieldId: 'NDCTYPE',
          fieldDescri: 'NDC TYPE MATERIAL',
          displayCriteria: DisplayCriteria.TEXT,
          picklist: '1',
        },
        {
          fieldId: 'MATL_TYPE',
          fieldDescri: 'MATERIAL TYPE',
          displayCriteria: DisplayCriteria.CODE,
          picklist: '30',
        },
        {
          fieldId: 'DATE',
          fieldDescri: 'DATE',
          displayCriteria: DisplayCriteria.CODE,
          picklist: '37',
        },
      ],
      isWorkflowdataSet: false,
      widgetId: 123456,
    };
    component.allDisplayCriteria = DisplayCriteria.CODE_TEXT;
    spyOn(component, 'manageConfigure');
    component.changeAllDisplayCriteria();
    expect(component.data.selectedColumns[0].displayCriteria).toEqual(DisplayCriteria.CODE_TEXT);
    expect(component.data.selectedColumns[1].displayCriteria).toEqual(DisplayCriteria.CODE_TEXT);
    expect(component.data.selectedColumns[2].displayCriteria).toEqual(DisplayCriteria.CODE_TEXT);
    expect(component.manageConfigure).toHaveBeenCalled();
  }));

  it('setOriginalConfigured(), should set tempHeaders and change all displayCriteria to default', async(() => {
    component.setOriginalConfigured();
    expect(component.tempHeaders).toEqual([]);

    component.data = {
      selectedColumns: selectedColumns(),
      displayCriteria: DisplayCriteria.CODE,
    };
    component.setOriginalConfigured();
    expect(component.tempHeaders).toEqual(component.data.selectedColumns);

    component.data.displayCriteria = DisplayCriteria.TEXT;
    component.setOriginalConfigured();
    expect(component.tempHeaders).toEqual(selectedColumns(DisplayCriteria.TEXT));
  }));

  it('manageConfigure(), should show or not show Banner', async(() => {
    component.data = {
      selectedColumns: selectedColumns(),
      displayCriteria: DisplayCriteria.CODE,
    };
    component.tempHeaders = selectedColumns();
    component.manageConfigure();
    expect(component.showConfiguredBanner).toBeFalsy();

    component.tempHeaders = selectedColumns(DisplayCriteria.TEXT);
    component.manageConfigure();
    expect(component.showConfiguredBanner).toBeTruthy();
  }));

  it('setUserConfigured(), should set userConfigured', async(() => {
    component.setUserConfigured(true);
    expect(component.userConfigured).toBeTruthy();

    component.data = {
      selectedColumns: selectedColumns(),
      displayCriteria: DisplayCriteria.TEXT,
    };
    component.headers = selectedColumns();
    component.tempHeaders = selectedColumns();
    component.setUserConfigured(false);
    expect(component.userConfigured).toBeFalsy();
    expect(component.headers[0].displayCriteria).toEqual(DisplayCriteria.TEXT);
    expect(component.headers[1].displayCriteria).toEqual(DisplayCriteria.TEXT);
  }));

  it('change displayCriteria(), change display criteria', async(() => {
    component.dataSource = [{ nodeId: 'ADD_EANDATA', nodeDesc: 'Additional EAN Grid', child: [{ fieldId: 'ADD_EANNO' } as MetadataModel] }];
    const data = { fieldId: 'ADD_EANNO', displayCriteria: 'CODE' };
    component.changeDisplayCriteria(data);
    expect(component.dataSource[0].child[0].displayCriteria).toEqual('CODE');
  }));

  it('searchHeader(), search header', async(() => {
    component.dataSource = [
      {
        nodeId: 'node',
        displayCriteria: null,
        nodeDesc: 'ABC',
        child: [],
      },
    ];
    component.searchHeader('');
    expect(component.nestedDataSource.length).toEqual(1);
    component.searchHeader('abc');
    expect(component.nestedDataSource.length).toEqual(1);
    component.searchHeader('def');
    expect(component.nestedDataSource.length).toEqual(0);
  }));

  it('isChecked(), check the checked property of items', async(() => {
    component.data = {
      objectType: 1005,
      selectedColumns: [
        {
          fieldId: 'NDCTYPE',
          fieldDescri: 'NDC TYPE MATERIAL',
        },
        {
          fieldId: 'ABC_ID',
          fieldDescri: 'ABC indicator',
        },
      ],
    };

    let header = { fieldId: 'ABC_ID' } as MetadataModel;
    component.isChecked(header);
    expect(component.isChecked(header)).toEqual(true);

    header = { fieldId: 'A_ID' } as MetadataModel;
    component.isChecked(header);
    expect(component.isChecked(header)).toEqual(false);
  }));

  it('selectionChange(),selection change handling of data', async(() => {
    component.data = {
      objectType: 1005,
      selectedColumns: [
        {
          fieldId: 'NDCTYPE',
          fieldDescri: 'NDC TYPE MATERIAL',
        },
        {
          fieldId: 'ABC_ID',
          fieldDescri: 'ABC indicator',
        },
      ],
    };
    let header = { fieldId: 'ABC_ID' } as MetadataModel;
    component.selectionChange(header);
    expect(component.data.selectedColumns.length).toEqual(1);

    header = { fieldId: 'ABC_ID1' } as MetadataModel;
    component.selectionChange(header);
    expect(component.data.selectedColumns.length).toEqual(2);
  }));

  it('updateHeaderData(),update headers list', async(() => {
    component.headersCountLimit = 0;
    component.updateHeaderData();
    expect(component.headersCountLimit).toEqual(20);
  }));

  it('updateNestedDatasourceData(),update nested datasource list', async(() => {
    component.dataSourceCountLimit = 0;
    component.updateNestedDatasourceData();
    expect(component.dataSourceCountLimit).toEqual(20);
  }));

  it('updateDataOnScroll(),update config data on scroll', async(() => {
    spyOn(component,'updateDataOnScroll');
    component.headersCountLimit = 0;
    component.headers = component.headers = [
      {
        fieldId: 'NDCTYPE',
        fieldDescri: 'NDC TYPE MATERIAL',
      } as MetadataModel,
    ];
    const el  = fixture.debugElement.query(By.css('#scrollEl'));
    component.updateDataOnScroll(el);
    expect(component.updateHeaderData).toBeTruthy();
  }));

  it('updateDataOnScroll(),update config data on scroll', async(() => {
    spyOn(component,'updateDataOnScroll');
    component.headersCountLimit = 20;
    component.headers = [
      {
        fieldId: 'NDCTYPE',
        fieldDescri: 'NDC TYPE MATERIAL',
      } as MetadataModel,
    ];
    component.dataSourceCountLimit = 0;
    component.nestedDataSource = [
      {
        nodeId: 'node',
        displayCriteria: null,
        nodeDesc: 'ABC',
        child: [],
      }
    ]
    const el  = fixture.debugElement.query(By.css('#scrollEl'));
    component.updateDataOnScroll(el);
    expect(component.updateNestedDatasourceData).toBeTruthy();
  }));
});
