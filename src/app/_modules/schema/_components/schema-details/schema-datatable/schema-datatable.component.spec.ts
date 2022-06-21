// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { SchemaDatatableComponent } from './schema-datatable.component';
// import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { FieldExitsResponse, MetadataModeleResponse, Heirarchy, SchemaBrInfo, MetadataModel, SchemaCorrectionReq } from 'src/app/_models/schema/schemadetailstable';
// import { PageEvent } from '@angular/material/paginator';
// import { RouterTestingModule } from '@angular/router/testing';
// import { SimpleChanges } from '@angular/core';
// import { SchemaStaticThresholdRes, SchemaListDetails } from '@models/schema/schemalist';
// import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
// import { Any2tsService } from '@services/any2ts.service';
// import { SchemalistService } from '@services/home/schema/schemalist.service';
// import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
// import { EndpointService } from '@services/endpoint.service';
// import { SchemaDataSource } from './schema-data-source';
// import { of } from 'rxjs';

// describe('SchemaDatatableComponent', () => {
//   let component: SchemaDatatableComponent;
//   let fixture: ComponentFixture<SchemaDatatableComponent>;
//   let schemaDataSourceService: SchemaDataSource;
//   let schemaDetailsService: SchemaDetailsService;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         AppMaterialModuleForSpec,
//         FormsModule,
//         ReactiveFormsModule,
//         RouterTestingModule
//       ],
//       declarations: [ SchemaDatatableComponent ],
//       providers:[
//         SchemalistService,
//         Any2tsService,
//         SharedServiceService,
//         EndpointService,
//         SchemaDetailsService
//       ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(SchemaDatatableComponent);
//     component = fixture.componentInstance;
//     // fixture.detectChanges();
//     schemaDataSourceService = new SchemaDataSource(fixture.debugElement.injector.get(SchemaDetailsService), fixture.debugElement.injector.get(EndpointService), null);
//     component.dataTableDataSource = schemaDataSourceService;
//     const schemaDetails: SchemaListDetails = new SchemaListDetails();
//     schemaDetails.totalCount = 2324;
//     component.schemaDetails = schemaDetails;

//     schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);

//     spyOn(component.dataTableDataSource,'getTableData').and.callFake(res=>{
//       of();
//     });
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('findFieldExitsOnMetaRes(), find the field parent ids ', async(()=>{
//     const mockRes: FieldExitsResponse = new FieldExitsResponse();
//     mockRes.fieldId = 'VALUE';
//     const actualValue =  component.findFieldExitsOnMetaRes('VALUE');
//     component.selectedGridIds = ['MATL_DESC_GRID'];
//     component.selectedHierarchyIds = ['420'];
//     component.allMetaDataFields.next(new MetadataModeleResponse());
//     expect(mockRes).toEqual(actualValue);


//   }));

//   it('dataTableTrackByFun(), data table track by ', async(()=>{
//       const mdaRec = {key:'MAT0000123'};
//       const actualValue =  component.dataTableTrackByFun(0, mdaRec);
//       expect(mdaRec.key).toEqual(actualValue);
//   }));

//   it('applyGridField(), update table view for selected grid fields ', async(()=>{
//     component.applyGridField('LANGUAGEGRID_01', true);
//     expect(component.selectedGridIds.length).toEqual(1);

//     component.applyGridField('LANGUAGEGRID_01', false);
//     expect(component.selectedGridIds.length).toEqual(0);

//   }));

//   it('applyHeirarchyField(), update table view for selected heirarchy fields', async(()=>{
//     component.applyHeirarchyField('420', true);
//     expect(component.selectedHierarchyIds.length).toEqual(1);

//     component.applyHeirarchyField('420', false);
//     expect(component.selectedHierarchyIds.length).toEqual(0);

//   }));

//   it('hierarchyTrackBy() , track by for hierarchy fields', async(()=>{
//     const heiObj: Heirarchy = new Heirarchy();
//     heiObj.fieldId = '420';
//     heiObj.heirarchyId = '420';
//     heiObj.heirarchyText = 'Testing Hei..';
//     expect(component.hierarchyTrackBy(heiObj)).toEqual(heiObj.heirarchyId);
//   }));

//   it('gridTrackBy() , track by for grid fields', async(()=>{
//     expect(component.gridTrackBy('HELLO_GRID_01')).toEqual('HELLO_GRID_01');
//   }));

//   it('hasError() , check the field is in error', async(()=>{
//     const row = {} as any;
//     expect(component.hasError(row, 'VALUE')).toEqual(false);
//     row.row_status = {fieldData:'Error,Success'};
//     row.VALUE = {isCorrected:false};
//     const brInfo: SchemaBrInfo = new SchemaBrInfo();
//     brInfo.fields =  ['VALUE','DESC'].toString();
//     component.schemaBrInfoList = [brInfo];
//     expect(component.hasError(row, 'VALUE')).toEqual(true);

//   }));

//   it('isCorrected(), check the field is corrected or not', async(()=>{
//     let row = {} as any;
//     row.VALUE = {isCorrected:true};
//     expect(component.isCorrected(row, 'VALUE',0)).toEqual(true);

//     row = {} as any;
//     expect(component.isCorrected(row, 'VALUE',0)).toEqual(false);

//   }));

//   it('isEditable(), check field is editable or note', async(()=>{
//     const metaDataFieldList: MetadataModel = {} as MetadataModel;
//     metaDataFieldList.fieldId = 'TEST123';
//     metaDataFieldList.dataType = 'CHAR';
//     metaDataFieldList.picklist = '0';
//     component.metaDataFieldList = {TEST123:metaDataFieldList};
//     const row = {} as any;
//     row.row_status = {fieldData:'Outdated'};
//     expect(component.isEditable('TEST123',row)).toEqual(false);

//     component.metaDataFieldList = {};
//     expect(component.isEditable('TEST123',row)).toEqual(false);

//   }));

//   it('showErrorMessages(), show error message matTooltip', async(()=>{
//     const row = {} as any;
//     row.row_status = {fieldData:'Error,Success'};
//     const brInfo: SchemaBrInfo = new SchemaBrInfo();
//     brInfo.fields =  ['VALUE','DESC'].toString();
//     brInfo.dynamicMessage = 'Testing br 1';
//     component.schemaBrInfoList = [brInfo];
//     expect(component.showErrorMessages(row, 'VALUE')).toEqual(brInfo.dynamicMessage);

//     component.schemaBrInfoList = [];
//     expect(component.showErrorMessages(row, 'VALUE')).toEqual('');

//     row.row_status = {fieldData:'Success'};
//     expect(component.showErrorMessages(row, 'VALUE')).toEqual('');
//   }));

//   it('doCorrection(), start correction on blur to field', async(()=>{
//       const row = {
//         OBJECTNUMBER :{
//           fieldData: '387632'
//         }
//       };
//       const fldExit: FieldExitsResponse = component.findFieldExitsOnMetaRes('HELLO_TEST');
//       const request: SchemaCorrectionReq = {id: '387632',fldId:'HELLO_TEST', gridId: fldExit.gridId, heirerchyId: fldExit.hierarchyId, rowSno:null,vc: 'Test123', isReviewed: null};

//       spyOn(schemaDetailsService,'doCorrection').withArgs(component.schemaId, request).and.returnValue(of());
//       expect(component.doCorrection(row, 'HELLO_TEST','Test123',0)).toEqual(undefined);
//   }));

//   it('editCurrentCell(), edit current cell', async(()=>{
//     expect(component.editCurrentCell('VALUE',1)).toEqual(undefined);
//   }));

//   it('`dynamicChipColor`(), get dynamic chip color ', async(()=>{
//     let status = 'error';
//     expect(component.dynamicChipColor(status)).toEqual('errorChip');
//     status = 'success';
//     expect(component.dynamicChipColor(status)).toEqual('successChip');
//     status = 'corrections';
//     expect(component.dynamicChipColor(status)).toEqual('correctedChip');
//     status = 'skipped';
//     expect(component.dynamicChipColor(status)).toEqual('skippedChip');
//     status = '';
//     expect(component.dynamicChipColor(status)).toEqual('');
//     status = 'outdated';
//     expect(component.dynamicChipColor(status)).toEqual('outdatedChip');
//   }));

//   it('doPagination(), call while pagination ', async(()=>{
//     const pageEvent = new PageEvent();
//     pageEvent.pageIndex = 0;
//     pageEvent.pageSize = 10;
//     expect(component.doPagination(pageEvent)).toEqual(undefined);
//   }));

//   it('loadSchameDataByStatus(), load the schema data based on status index ', async(()=>{
//     expect(component.loadSchameDataByStatus(0)).toEqual(undefined);
//     component.loadSchameDataByStatus(5);
//     expect(component.submitReviewedBtn).toEqual(false);
//   }));

//   it('isGroup(), check the group is enable or not', async(()=>{
//       expect(component.isGroup(0,{isGroup:true})).toEqual(true);
//       expect(component.isGroup(0,{isGroup:false})).toEqual(false);
//       expect(component.isGroup(0,{})).toEqual(undefined);
//   }));

//   it('masterToggle(), should toggle', async(()=>{
//     expect(component.masterToggle()).toEqual(undefined);
//   }));


//   it('matChipCountLabel(), should return the status count by status index', async(()=>{
//     component.schemaDetails.totalCount = 100;
//     const allCount =  component.matChipCountLabel(0);
//     expect(100).toEqual(allCount);

//     component.schemaDetails.errorCount = 20;
//     const errorCount =  component.matChipCountLabel(1);
//     expect(20).toEqual(errorCount);

//     component.schemaDetails.successCount = 79;
//     const successCount =  component.matChipCountLabel(2);
//     expect(79).toEqual(successCount);

//     component.schemaDetails.correctionValue = 1;
//     const correctedCount =  component.matChipCountLabel(4);
//     expect(1).toEqual(correctedCount);

//     component.schemaDetails.skippedValue = 1;
//     const skippedCount =  component.matChipCountLabel(3);
//     expect(1).toEqual(skippedCount);

//     component.schemaDetails.duplicateValue = 1;
//     const duplicateCount =  component.matChipCountLabel(5);
//     expect(1).toEqual(duplicateCount);
//   }));

//   it('ngOnChanges(), detect value change while loaded data ', async(()=>{
//     const changes: SimpleChanges = {thresholdRes:{
//       currentValue: {errorCnt:9,totalCnt:10,successCnt:1} as SchemaStaticThresholdRes,
//       firstChange: null,
//       isFirstChange: null,
//       previousValue:undefined
//     }};

//     component.ngOnChanges(changes);

//     expect(component.thresholdRes.successCnt).toEqual(1);
//     expect(component.thresholdRes.errorCnt).toEqual(9);
//     expect(component.thresholdRes.totalCnt).toEqual(10);
//   }));


// });
