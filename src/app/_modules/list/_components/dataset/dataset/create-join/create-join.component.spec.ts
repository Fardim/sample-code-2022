import { SharedServiceService } from '@shared/_services/shared-service.service';
import { NO_ERRORS_SCHEMA, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupDetails, GroupJoinDetail } from '@models/schema/duplicacy';
import { SelectedModuleInfo } from '@modules/list/_components/dataset-selector/dataset-selector.component';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { CreateJoinComponent } from './create-join.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateJoinComponent', () => {
  let component: CreateJoinComponent;
  let fixture: ComponentFixture<CreateJoinComponent>;
  let sharedService: SharedServiceService;
  let schemaService: SchemaService;
  let schemaDetailsService: SchemaDetailsService;
  let virtualDatasetService: VirtualDatasetService;
  let router: Router;

  beforeEach(() => {
    // const routerStub = () => ({ navigate: (array, object) => ({}) });
    // const sharedServiceServiceStub = () => ({
    //   getFilterTableBrData: () => ({ subscribe: f => f({}) })
    // });
    // const schemaServiceStub = () => ({
    //   getAllDataSets: () => ({ toPromise: () => ({ then: () => ({}) }) })
    // });
    // const schemaDetailsServiceStub = () => ({
    //   getMetadataFields: moduleId => ({ subscribe: f => f({}) })
    // });
    // const virtualDatasetServiceStub = () => ({
    //   saveUpdateVirtualDataSet: object => ({ subscribe: f => f({}) }),
    //   getselectedStepData: object => ({ subscribe: f => f({}) }),
    // });

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [CreateJoinComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        // { provide: Router, useFactory: routerStub },
        // { provide: SharedServiceService, useFactory: sharedServiceServiceStub },
        // { provide: SchemaService, useFactory: schemaServiceStub },
        // { provide: SchemaDetailsService, useFactory: schemaDetailsServiceStub },
        // {
        //   provide: VirtualDatasetService,
        //   useFactory: virtualDatasetServiceStub
        // }
      ]
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateJoinComponent);
    component = fixture.componentInstance;
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    virtualDatasetService = fixture.debugElement.injector.get(VirtualDatasetService);
    fixture.detectChanges();
  });

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  it(`modules has default value`, () => {
    expect(component.modules).toEqual([]);
  });

  it(`subscriptions has default value`, () => {
    expect(component.subscriptions.length).toBeGreaterThan(0);
  });

  it(`showErrorBanner has default value`, () => {
    expect(component.showErrorBanner).toEqual(false);
  });

  it(`joinCounter has default value`, () => {
    expect(component.joinCounter).toEqual(1);
  });

  it(`transformCounter has default value`, () => {
    expect(component.transformCounter).toEqual(1);
  });

  it(`transJoins has default value`, () => {
    expect(component.transJoins).toEqual([]);
  });

  it(`tables has default value`, () => {
    expect(component.tables).toEqual([]);
  });

  it(`filterCounts has default value`, () => {
    expect(component.filterCounts).toEqual([]);
  });

  describe('ngOnChanges', () => {
    it('makes expected calls', () => {
      const simpleChangesStub: SimpleChanges = {} as any;
      spyOn(component, 'loadTransJoin').and.callThrough();
      component.loadTransJoin();
      component.ngOnChanges(simpleChangesStub);
      expect(component.loadTransJoin).toHaveBeenCalled();
    });
  });

  describe('onDatasetSelect', () => {
    it('makes expected calls', () => {
      spyOn(component, 'mapData').and.callThrough();
      component.mapData({ sourceOneType: 'MODULE', sourceTwoType: 'MODULE', joinMapping: [] }, {
        type: 'MODULE',
        moduleId: '1234', tempId: '1244',
        selectedTableType: 'HIERARCHY',
        id: '',
        tableName: 'Abc',
        desc: 'desc',
        columns: []
      });
      expect(component.mapData).toHaveBeenCalled();
    });
  });

  describe('setSelectedStepData', () => {
    it('makes expected calls', () => {
      const groupDetailsStub: GroupDetails = {} as any;
      spyOn(component, 'loadTransJoin').and.callThrough();
      component.loadTransJoin();
      component.setSelectedStepData(groupDetailsStub);
      expect(component.loadTransJoin).toHaveBeenCalled();
    });
  });

  describe('mapData', () => {
    it('makes expected calls', () => {
      const groupJoinDetailStub: GroupJoinDetail = {} as any;
      const selectedModuleInfoStub: SelectedModuleInfo = {} as any;
      spyOn(component, 'getTransJoinsColumns').and.callThrough();
      component.mapData(groupJoinDetailStub, selectedModuleInfoStub);
      expect(component.getTransJoinsColumns).toHaveBeenCalled();
    });
  });

  describe('getTransJoinsColumns', () => {
    it('makes expected calls', () => {
      const selectedModuleInfoStub: SelectedModuleInfo = {} as any;
      spyOn(component, 'getTransJoinsColumns').and.callThrough();
      spyOn(component, 'loadColumnsByModuleId').and.callThrough();
      component.loadColumnsByModuleId('1', 'moduleId');
      spyOn(component, 'mapTableColumns').and.callThrough();
      component.getTransJoinsColumns(selectedModuleInfoStub);
      expect(component.getTransJoinsColumns).toHaveBeenCalled();
      expect(component.loadColumnsByModuleId).toHaveBeenCalled();
      expect(component.mapTableColumns).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('makes expected calls', () => {

      spyOn(component, 'createVirtualDatasetForm').and.callThrough();
      spyOn(component, 'updateDmlTypeList').and.callThrough();
      component.joinCounter = 1;
      component.transformCounter = 1;
      component.virtualDatasetDetails = {
        vdId: '1',
        vdName: 'VD1',
        indexName: '1',
        tableName: '',
        tenantId: '0',
        userCreated: '',
        dateCreated: '',
        userModified: '',
        dateModified: '',
        vdDescription: 'VD desc',
        jobSchedulerId: '1',
        groupDetails: [],
        groupResult: []
      };

      component.virtualDatasetDetails.groupDetails.push({
        groupType: 'JOIN',
        order: 1,
        tenantId: 0,
        groupName: '',
        groupDescription: '',
        groupJoinDetail: []
      })
      component.updateDmlTypeList('Join');
      component.ngOnInit();
      // fixture.detectChanges();
      expect(component.createVirtualDatasetForm).toHaveBeenCalled();
      expect(component.updateDmlTypeList).toHaveBeenCalled();
    });
  });

  describe('registerUdrPub', () => {
    it('makes expected calls', () => {
      const sharedServiceServiceStub: SharedServiceService = fixture.debugElement.injector.get(
        SharedServiceService
      );
      spyOn(sharedServiceServiceStub, 'getFilterTableBrData').and.callThrough();
      component.registerUdrPub();
      expect(sharedServiceServiceStub.getFilterTableBrData).toHaveBeenCalled();
    });
  });

  describe('saveJoin', () => {
    it('makes expected calls', () => {
      const virtualDatasetServiceStub: VirtualDatasetService = fixture.debugElement.injector.get(
        VirtualDatasetService
      );
      spyOn(
        virtualDatasetServiceStub,
        'saveUpdateVirtualDataSet'
      ).and.callThrough();
      component.virtualDatasetDetails = {
        vdId: '1',
        vdName: 'VD1',
        indexName: '1',
        tableName: '',
        tenantId: '0',
        userCreated: '',
        dateCreated: '',
        userModified: '',
        dateModified: '',
        vdDescription: 'VD desc',
        jobSchedulerId: '1',
        groupDetails: [],
        groupResult: []
      };
      component.virtualDatasetForm = new FormGroup({});
      component.saveJoin();
      expect(
        virtualDatasetServiceStub.saveUpdateVirtualDataSet
      ).toHaveBeenCalled();
    });
  });
});
