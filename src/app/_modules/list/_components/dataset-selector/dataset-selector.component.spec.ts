import { SimpleChange, SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { ModuleInfo } from '@models/schema/schemalist';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { DatasetSelectorComponent, ModuleState, SelectedModuleInfo } from './dataset-selector.component';

describe('DatasetSelectorComponent', () => {
  let component: DatasetSelectorComponent;
  let fixture: ComponentFixture<DatasetSelectorComponent>;
  let schemaService: SchemaService;
  let schemaDetailsService: SchemaDetailsService;

  const transJoins: SelectedModuleInfo[] = [
    { type: 'GROUP', moduleId: null, id: 'join-01', desc: 'Join 1', tableName: '', columns: [] },
    { type: 'GROUP', moduleId: null, id: 'join-02', desc: 'Join 2', tableName: '', columns: [] },
    { type: 'GROUP', moduleId: null, id: 'transformation-02', desc: 'Transformation 2', tableName: '', columns: [] },
  ];

  const modules: ModuleInfo[] = [
    {
      moduleId: '4004',
      moduleDesc: 'GL Accounts',
      tenantId: '0',
    },
    {
      moduleId: '1005',
      moduleDesc: 'Material',
      tenantId: '0',
    },
    {
      moduleId: '6174297726',
      moduleDesc: 'Account',
      tenantId: '0',
    },
    {
      moduleId: '434445',
      moduleDesc: 'Maintenance Plan',
      tenantId: '0',
    },
    {
      moduleId: '4008',
      moduleDesc: 'Measuring Point',
      tenantId: '0',
    },
    {
      moduleId: '5068',
      moduleDesc: 'Purchase Requisition',
      tenantId: '0',
    }
  ];

  const moduleFields = {
    headers: {
      ACC_CURR: {
        fieldId: 'ACC_CURR',
        fieldDescri: 'Account Currency',
        dataType: 'CHAR',
        maxChar: '5',
        strucId: '4004',
        objecttype: '4004',
        tableName: null,
        tableType: '0'
      },
      KTOKS_COA: {
        fieldId: 'KTOKS_COA',
        fieldDescri: 'Account Group',
        dataType: 'CHAR',
        maxChar: '4',
        strucId: '4004',
        objecttype: '4004',
        tableName: null,
        tableType: '0'
      },
      GL_HKTID: {
        fieldId: 'GL_HKTID',
        fieldDescri: 'Account ID',
        dataType: 'CHAR',
        maxChar: '5',
        strucId: '4004',
        objecttype: '4004',
        tableName: null,
        tableType: '0'
      },
      COA_ACCMNG: {
        fieldId: 'COA_ACCMNG',
        fieldDescri: 'Account managed in existing system',
        dataType: 'CHAR',
        maxChar: '5',
        strucId: '4004',
        objecttype: '4004',
        tableName: null,
        tableType: '0'
      }
    },
    grids: {
      KEYWORDSACCOUNT: {
        fieldId: 'KEYWORDSACCOUNT',
        fieldDescri: 'Keywords in Chart of Accounts',
        dataType: 'CHAR',
        maxChar: '100',
        strucId: '4004',
        objecttype: '4004',
        tableName: 'META_TT_KEYWORDSACCOUNT',
        tableType: null
      },
      CURR_SAP: {
        fieldId: 'CURR_SAP',
        fieldDescri: 'Currency Item',
        dataType: 'CHAR',
        maxChar: '100',
        strucId: '4004',
        objecttype: '4004',
        tableName: 'META_TT_CURR_SAP',
        tableType: null
      },
      GLACC: {
        fieldId: 'GLACC',
        fieldDescri: 'G/L Account',
        dataType: 'CHAR',
        maxChar: '100',
        strucId: '4004',
        objecttype: '4004',
        tableName: 'META_TT_GLACC',
        tableType: null
      }
    },
    hierarchy: [
      {
        objnr: 937740034415718500,
        heirarchyId: '91',
        heirarchyText: 'Company Code',
        fieldId: 'GL_COMPCODESTR',
        structureId: '12',
        tableName: 'CompanyCodeData_12',
        objectType: '4004'
      }
    ],
    gridFields: {
      KEYWORDSACCOUNT: {
        GL_KEYWORD: {
          fieldId: 'GL_KEYWORD',
          fieldDescri: 'Keyword',
          dataType: 'CHAR',
          maxChar: '30',
          strucId: '4004',
          objecttype: '4004',
          tableName: null,
          tableType: null
        },
        LANGACC: {
          fieldId: 'LANGACC',
          fieldDescri: 'Language',
          dataType: 'CHAR',
          maxChar: '100',
          strucId: '4004',
          objecttype: '4004',
          tableName: null,
          tableType: null
        }
      },
      CURR_SAP: {
        SAP_AMT_CUR: {
          fieldId: 'SAP_AMT_CUR',
          fieldDescri: 'Amount in document currency',
          dataType: 'CHAR',
          maxChar: '100',
          strucId: '4004',
          objecttype: '4004',
          tableName: null,
          tableType: null
        },
        CUR_KEY: {
          fieldId: 'CUR_KEY',
          fieldDescri: 'Currency Key',
          dataType: 'CHAR',
          maxChar: '100',
          strucId: '4004',
          objecttype: '4004',
          tableName: null,
          tableType: null
        }
      },
      GLACC: {
        JDB_CUR: {
          fieldId: 'JDB_CUR',
          fieldDescri: 'Currency Items',
          dataType: 'CHAR',
          maxChar: '100',
          strucId: '4004',
          objecttype: '4004',
          tableName: 'META_TT_JDB_CUR',
          tableType: null
        },
        JDB_GBMCU: {
          fieldId: 'JDB_GBMCU',
          fieldDescri: 'Doc. Number',
          dataType: 'CHAR',
          maxChar: '100',
          strucId: '4004',
          objecttype: '4004',
          tableName: null,
          tableType: null
        },
        JDB_ITM: {
          fieldId: 'JDB_ITM',
          fieldDescri: 'Item',
          dataType: 'CHAR',
          maxChar: '100',
          strucId: '4004',
          objecttype: '4004',
          tableName: null,
          tableType: null
        },
        JDB_MIN_SAP_ID: {
          fieldId: 'JDB_MIN_SAP_ID',
          fieldDescri: 'JDB Ledger',
          dataType: 'CHAR',
          maxChar: '100',
          strucId: '4004',
          objecttype: '4004',
          tableName: null,
          tableType: null
        },
        JDB_PC: {
          fieldId: 'JDB_PC',
          fieldDescri: 'Profit Center',
          dataType: 'CHAR',
          maxChar: '100',
          strucId: '4004',
          objecttype: '4004',
          tableName: null,
          tableType: null
        },
        JDB_ACCNUM: {
          fieldId: 'JDB_ACCNUM',
          fieldDescri: 'Unique number within the Accounting Document Number',
          dataType: 'CHAR',
          maxChar: '100',
          strucId: '4004',
          objecttype: '4004',
          tableName: null,
          tableType: null
        }
      }
    },
    hierarchyFields: {
      91: {
        XMITK: {
          fieldId: 'XMITK',
          fieldDescri: 'Recon. Acct ready for Input',
          dataType: 'CHAR',
          maxChar: '5',
          strucId: '12',
          objecttype: '4004',
          tableName: null,
          tableType: null
        }
      }
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DatasetSelectorComponent],
      imports: [AppMaterialModuleForSpec, SharedModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load joins/transformations and tables', () => {
    component.items = transJoins;
    spyOn(schemaService, 'getAllDataSets').and.returnValue(of(modules));
    spyOn(schemaDetailsService, 'getMetadataFields').withArgs('4004').and.returnValue(of(moduleFields as MetadataModeleResponse));

    // spyOn(component, 'loadModuleDetails');
    const [module] = modules;
    component.loadModuleDetails({
      loading: false,
      expanded: false,
      loaded: false,
      hasError: false,
      module,
      moduleItems: null,
    });

    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
    expect(component.items[0].id).toBe(transJoins[0].id);
  });

  it('should filter data when \'join1\' is passed in search box', async () => {
    const previousValue: SelectedModuleInfo[] = [];

    const changesObj: SimpleChanges = {
      items: new SimpleChange(previousValue, transJoins, true),
    };

    spyOn(component, 'ngOnInit').and.callThrough();
    spyOn(component, 'ngOnChanges').and.callThrough();

    component.ngOnChanges(changesObj);
    fixture.detectChanges();
    expect(component.ngOnChanges).toHaveBeenCalled();

    component.items = transJoins;
    spyOn(schemaService, 'getAllDataSets').and.returnValue(of(modules));
    spyOn(schemaDetailsService, 'getMetadataFields').withArgs('4004').and.returnValue(of(moduleFields as MetadataModeleResponse));
    spyOn(component, 'filterData').and.callThrough();
    spyOn(component, 'openMenu').and.callThrough();
    spyOn(component, 'selectHeaders').and.callThrough();
    spyOn(component, 'selectHierarchy').and.callThrough();
    spyOn(component, 'selectGrid').and.callThrough();
    spyOn(component, 'selectTransJoin').and.callThrough();

    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();

    const modulesState = modules.map<ModuleState>((dataset: ModuleInfo) => ({
      module: dataset,
      moduleItems: null,
      expanded: false,
      loading: false,
      loaded: false,
      hasError: false,
    }));

    component.modulesState = modulesState;

    component.openMenu(modulesState[0]);

    expect(component.openMenu).toHaveBeenCalled();

    component.filterData('');
    component.filterData('join1');

    // await fixture.whenStable();

    component.selectHeaders(modules[0], moduleFields.headers);
    expect(component.selectHeaders).toHaveBeenCalled();

    component.selectHierarchy(modules[0], component.modulesState[0].moduleItems.hierarchy[0]);
    expect(component.selectHierarchy).toHaveBeenCalled();

    component.selectGrid(modules[0], moduleFields.grids.CURR_SAP);
    expect(component.selectGrid).toHaveBeenCalled();

    const module = modules[0];
    const grid = moduleFields.grids.CURR_SAP;
    const gridFields = moduleFields.gridFields[grid.fieldId];

    const data: SelectedModuleInfo = {
      type: 'MODULE',
      moduleId: module.moduleId,
      id: grid.fieldId,
      desc: grid.fieldDescri,
      tableName: grid.tableName,
      columns: Object.values(gridFields).map((field: any) => ({
        id: field.fieldId,
        desc: field.fieldDescri,
        dataType: field.dataType,
        maxChar: field.maxChar,
      })),
    };

    component.selectTransJoin(data);
    expect(component.selectTransJoin).toHaveBeenCalled();
  });
});
