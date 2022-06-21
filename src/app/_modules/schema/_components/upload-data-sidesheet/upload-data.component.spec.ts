import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDataComponent } from './upload-data.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbComponent } from 'src/app/_modules/shared/_components/breadcrumb/breadcrumb.component';
import { AddTileComponent } from 'src/app/_modules/shared/_components/add-tile/add-tile.component';
import { MatStepper } from '@angular/material/stepper';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { SchemaService } from '@services/home/schema.service';
import { DataSource } from '@models/schema/schema';
import { SchemaListModuleList } from '@models/schema/schemalist';
import { MetadataModel, MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { SharedModule } from '@modules/shared/shared.module';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CoreService } from '@services/core/core.service';

describe('UploadDataComponent', () => {
  let component: UploadDataComponent;
  let fixture: ComponentFixture<UploadDataComponent>;
  let schemaDetailsServiceSpy: SchemaDetailsService;
  let coreServiceSpy: CoreService;
  let schemaService: SchemaService;
  let router: Router;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      declarations: [ UploadDataComponent, BreadcrumbComponent, AddTileComponent ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, { provide: MAT_DIALOG_DATA, useValue: {}
        },
         SchemaDetailsService,
         SchemaService,
         CoreService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDataComponent);
    component = fixture.componentInstance;
    schemaDetailsServiceSpy = fixture.debugElement.injector.get(SchemaDetailsService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    coreServiceSpy = fixture.debugElement.injector.get(CoreService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prepareDataSource(), should prepare datasource', async(()=>{
    const uploadedData = [[1,2],[4,7]]
    component.uploadedData = uploadedData;
    component.prepareDataSource();
    expect(component.prepareDataSource).toBeTruthy();
  }));

  it('updateMapFields(), should upate map fields', async(()=>{
    const data = {index: 0, execlFld: 'Test112', fieldId: 'objnr',fieldDesc: 'Objectnumber', excelFrstRow: null};
    component.excelMdoFieldMappedData =  [{columnIndex: 1, mdoFldId: 'Test'}as DataSource];
    component.updateMapFields(data);
    expect(component.excelMdoFieldMappedData.length).toEqual(2);

    const data1 = {index: 1, execlFld: 'Test112', fieldId: 'objnr',fieldDesc: 'Objectnumber', excelFrstRow: null};
    component.excelMdoFieldMappedData =  [{columnIndex: 1, mdoFldId: 'Test'}as DataSource];
    component.updateMapFields(data1);
    expect(component.excelMdoFieldMappedData.length).toEqual(1);

    const data2 = {index: 1, execlFld: 'Test112', fieldId: '',fieldDesc: 'Objectnumber', excelFrstRow: null};
    component.excelMdoFieldMappedData =  [{columnIndex: 1, mdoFldId: 'Test'}as DataSource];
    component.updateMapFields(data2);
    expect(component.excelMdoFieldMappedData.length).toEqual(0);

    const data3 = {index: 1, execlFld: 'Test112', fieldId: '',fieldDesc: 'Objectnumber', excelFrstRow: null};
    component.excelMdoFieldMappedData =  [{columnIndex: 0, mdoFldId: 'Test'}as DataSource];
    component.updateMapFields(data3);
    expect(component.excelMdoFieldMappedData.length).toEqual(1);
  }));

  it('controlStepChange(), should control the stepper', async(()=>{
    // controlstepchange
    const event = {selectedIndex:0};

    spyOn(component, 'prepareDataSource');

    component.controlStepChange(event);
    expect(component.controlStepChange).toBeTruthy();

    event.selectedIndex = 1;
    component.controlStepChange(event);
    expect(component.prepareDataSource).toHaveBeenCalled();
  }));

  it('getMetadataFields(), get existing metadata fields', async(() =>{
    const moduleId = '6576576';
    const metadataModeleResponse = { headers: [{ fieldId: 'MATL', fieldDescri: 'material location' }] } as MetadataModeleResponse;
    spyOn(coreServiceSpy, 'getMetadataFieldsByModuleId').and.returnValue(of(metadataModeleResponse));
    spyOn(component,'makeMetadataControle');
    component.getMetadataFields(moduleId);
    expect(coreServiceSpy.getMetadataFieldsByModuleId).toHaveBeenCalledWith([moduleId], '');
    expect(component.metadataFields).toEqual(metadataModeleResponse);
    expect(component.uploadDisabled).toBeFalsy();
    expect(component.makeMetadataControle).toHaveBeenCalled();
  }));

  // it('makeMetadataControle(), help to make metadata control for all header , hierarchy and grid field ', async(()=>{
  //   component.metadataFields = {
  //   gridFields:{ADDINFO:{ADD_HEIGHT:{fieldId:'ADD_HEIGHT'}}},
  //   grids:{ADDINFO:{fieldId: 'ADDINFO'}}, headers:{AACR:{fieldId: 'AACR'}},
  //   // hierarchy: [{ heirarchyId: '1', heirarchyText: 'Plant DATA' ,fieldId: 'PLANT', objectType: '1005', objnr: 1, structureId: '0002', tableName: 'PLANTDATA_0002' }],
  //   hierarchyFields:{1:{ABC_INDIC:{fieldId:'ABC_INDIC'}}}
  // }
  //   component.makeMetadataControle();
  //   expect(component.metaDataFieldList.length).toEqual(3);

  //   // component.metaDataFieldList = [];
  //   component.metadataFields = {} as MetadataModeleResponse;
  //   component.makeMetadataControle();
  //   expect(component.metaDataFieldList.length).toEqual(0)
  // }));

  it('uploadFile(), should click on uploadFile input ', async(()=>{
    component.moduleInfo = {moduleId:'1005'} as SchemaListModuleList;
    component.uploadFile();
    expect(component.uploadFile).toBeTruthy();
  }));

  it('ngOnInit(), should call ngOnInit', (() => {
    component.moduleInfo = {moduleId:'1005'} as SchemaListModuleList;;
    spyOn(schemaDetailsServiceSpy,'getMetadataFields').withArgs(undefined).and.returnValue(of());
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('fileChange, should upload file to server', async(()=>{
    let event;
    component.fileChange(event);
    component.uploadFileStepCtrl = new FormGroup({
      uploadFileCtrl : new FormControl('')
    })

    expect(component.fileChange).toBeTruthy();
    expect(component.uploadError.status).toEqual(false);

    event = {
      target: {
        files: [
          {
            name: 'Ashish.xls'
          },
          {
            name: 'AshishGoyal.xlxs'
          }
        ]
      }
    };
    component.fileChange(event);

    expect(component.uploadError.status).toEqual(true);

    event = {
      target: {
        files: [
          {
            name: 'Ashish.JPEG'
          }
        ]
      }
    };
    component.fileChange(event);

    expect(component.uploadError.status).toEqual(true);

    event = {
      target: {
        files: [
          // {
            new File([], 'AshishGoyal.xlsx')
            // name: 'AshishGoyal.xlsx',
            // size: 50000
          // }
        ]
      }
    }
    component.importcorrectedRec = true;
    component.fileChange(event);

    expect(component.uploadError.status).toEqual(false);

    component.importcorrectedRec = false;
    component.fileChange(event);

    expect(component.uploadError.status).toEqual(false)
  }));

  it('uploadDataHttpCall()  ', ()=>{
    const stepper: MatStepper = {next:null} as MatStepper;
    component.moduleInfo = {moduleId:'1005'} as SchemaListModuleList;
    component.excelMdoFieldMappedData = [{excelFld:'id',excelFrstRow:'3',mdoFldId:'1005',mdoFldDesc:'Material',columnIndex:1}];

    component.schemaId = '276822';
    component.runid = '87264528';
    component.dataTableCtrl = new FormGroup({
      dataTableFldCtrl: new FormControl('')
    });

    spyOn(schemaService,'uploadData').withArgs(component.excelMdoFieldMappedData,'1005', component.fileSno).and.returnValue(of('123456743'));

    spyOn(schemaService, 'uploadCorrectionData').withArgs(component.excelMdoFieldMappedData, '1005',component.schemaId, component.runid, component.plantCode, component.fileSno).and.returnValue(of('1223455656767'));

    component.uploadDataHttpCall(stepper) ;

    component.importcorrectedRec = true;
    component.uploadDataHttpCall(stepper) ;
    expect(component.uploadDataHttpCall).toBeTruthy();

    expect(schemaService.uploadCorrectionData).toHaveBeenCalledWith(component.excelMdoFieldMappedData, '1005',component.schemaId, component.runid, component.plantCode, component.fileSno);

    component.schemaId = '';
    component.runid = null;

    component.uploadDataHttpCall(stepper);
    expect(component.uploadError.status).toEqual(true);

    component.importcorrectedRec = false;
    expect(schemaService.uploadData).toHaveBeenCalledWith(component.excelMdoFieldMappedData,'1005', component.fileSno);

  });

  it('uploadFileData()  ', async(()=>{
    const mockUploadResponse = '12345678901';
    const stepper: MatStepper = {next:null} as MatStepper;
    component.dataTableCtrl = new FormGroup({
      dataTableFldCtrl: new FormControl('')
    });
    component.uploadFileStepCtrl = new FormGroup({
      uploadFileCtrl: new FormControl('')
    });
    component.excelMdoFieldMappedData = [{columnIndex:0,mdoFldId:'MATL_DEC'} as DataSource];

    spyOn(component, 'uploadDataHttpCall')
    spyOn(schemaService,'uploadUpdateFileData').withArgs(component.uploadFileStepCtrl.get('uploadFileCtrl').value, component.fileSno).and.returnValue(of(mockUploadResponse));
    component.uploadFileData(stepper);

    // component.uploadFileData(stepper);

    expect(component.uploadFileData).toBeTruthy();
    expect(schemaService.uploadUpdateFileData).toHaveBeenCalled();
    expect(component.fileSno).toEqual(mockUploadResponse);

    component.excelMdoFieldMappedData.length = 0;
    component.uploadFileData(stepper);

    expect(component.uploadError.status).toEqual(true);
  }));

  it('getSelectedFieldId()  ', async(()=>{
    component.excelMdoFieldMappedData =  [{columnIndex: 1, mdoFldId: 'Test'}as DataSource];
    expect('Test').toEqual(component.getSelectedFieldId(1));

    expect('').toEqual(component.getSelectedFieldId(0));
  }));

  it('suggestmatches(), get suggested rec ..', async(()=>{
    // mock data
    component.excelHeader = ['Module obj nr ', 'Material type'];

    component.dataSource = [{columnIndex:0} as DataSource, {columnIndex:1} as DataSource];

    component.metaDataFieldList = [{fieldId: 'MATL_TYPE', fieldDescri:'Material type'} as MetadataModel];

    // call actual method ..
    component.suggestmatches();

    // verify
    expect(component.excelMdoFieldMappedData.length).toEqual(2);
    expect(component.excelMdoFieldMappedData[1].mdoFldId).toEqual('MATL_TYPE');

  }));

  it('close(), should close upload data sidesheet', async() => {
    component.outlet = 'outer';

    spyOn(router, 'navigate');
    component.close();

    expect(router.navigate).toHaveBeenCalledWith([{outlets: {[component.outlet] : null}}])
  });

  it('getSchemaList(), should get schema list from service', async() => {
    const mockRes = {
      moduleId: '1005',
      moduleDesc: 'Material_Module',
      schemaLists: []
    } as SchemaListModuleList;
    component.moduleId = '1005';

    // spyOn(component, 'getMetadataFields');
    spyOn(schemaService, 'getSchemaInfoByModuleId').withArgs(component.moduleId).and.returnValue(of(mockRes));
    spyOn(component, 'getMetadataFields').withArgs(mockRes.moduleId).and.returnValue();

    component.getSchemaList();
    expect(schemaService.getSchemaInfoByModuleId).toHaveBeenCalledWith(component.moduleId);
    expect(component.moduleInfo).toEqual(mockRes);
    // expect(component.getMetadataFields).toHaveBeenCalled();
  });
});
