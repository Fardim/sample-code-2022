import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DatasetForm } from '@models/list-page/listpage';
import { HierarchyService, Structure } from '@modules/list/_components/field/hierarchy-service/hierarchy.service';
import { SharedModule } from '@modules/shared/shared.module';
import { TabResponse } from '@modules/transaction/model/transaction';
import { CoreService } from '@services/core/core.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { TransactionDatasetTabComponent } from './transaction-dataset-tab.component';

describe('TransactionDatasetTabComponent', () => {
  let component: TransactionDatasetTabComponent;
  let fixture: ComponentFixture<TransactionDatasetTabComponent>;
  let coreService: CoreService;
  let hierarchyService: HierarchyService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionDatasetTabComponent ],
      imports: [ AppMaterialModuleForSpec, RouterTestingModule, SharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionDatasetTabComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    hierarchyService = fixture.debugElement.injector.get(HierarchyService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges()', () => {

    const changes = {
      moduleId:{
        currentValue:'500',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      },
      layoutId:{
        currentValue:'28467126471',
        firstChange:undefined,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;

    spyOn(component, 'getAllStructures');
    spyOn(component, 'getAllRules');
    spyOn(component, 'getLayoutDetails');
    spyOn(component, 'getLayoutTabList');

    component.ngOnChanges(changes);

    changes.moduleId.previousValue = changes.moduleId.currentValue;
    changes.layoutId.previousValue = changes.layoutId.currentValue;

    expect(component.getAllStructures).toHaveBeenCalledTimes(1);
    expect(component.getAllRules).toHaveBeenCalledTimes(1);
    expect(component.getLayoutDetails).toHaveBeenCalledTimes(1);
    expect(component.getLayoutTabList).toHaveBeenCalledTimes(1);
  });

  it('should getLayoutTabList()', () => {
    const response = [{
      description: 'Header',
      isTabHidden: false,
      isTabReadOnly: false,
      tabOrder: 0,
      tabid: '1701'
    }] as TabResponse[];

    spyOn(coreService, 'getDatasetFormTabs').and.returnValues(of(response), throwError({message: 'api error'}));
    spyOn(console, 'error');

    component.getLayoutTabList([1]);
    expect(component.tabList).toEqual(response);

    component.getLayoutTabList([1]);
    expect(console.error).toHaveBeenCalled();
  });

  it('should getLayoutDetails()', () => {
    const response = {
      layoutId: '1701',
      description: 'Material creation'
    } as DatasetForm;

    component.moduleId = '500';
    component.layoutId = '28467126471';

    spyOn(coreService, 'getDatasetFormDetail').and.returnValues(of(response), throwError({message: 'api error'}));
    spyOn(console, 'error');

    component.getLayoutDetails();
    expect(component.layoutDetails).toEqual(response);

    component.getLayoutDetails();
    expect(console.error).toHaveBeenCalled();
  });

  it('should getAllStructures()', () => {
    const response = [{
      isHeader: true,
      structureId: 1,
      language: 'en',
      moduleId: '500',
      parentStrucId: 0,
      strucDesc: 'Header Data',
    }] as Structure[];

    const result = component.getAllStructures();
    expect(result).toBeFalsy();

    component.moduleId = '500';
    component.locale = 'en';

    spyOn(coreService, 'getAllStructures').and.returnValues(of(response), throwError({message: 'api error'}));
    spyOn(console, 'error');

    component.getAllStructures();
    expect(hierarchyService.transformStructureToHierarchy).toHaveBeenCalledWith(response);
    expect(component.hierarchyList.length).toEqual(1);
    expect(component.hierarchyList[0].id).toEqual(1);

    component.getAllStructures();
    expect(console.error).toHaveBeenCalled();
  });

  it('should structureChanged()', () => {
    const structIds = [1, 4];
    spyOn(component, 'getLayoutTabList');

    component.structureChanged(structIds);
    expect(component.activeStructures).toEqual(structIds);
    expect(component.getLayoutTabList).toHaveBeenCalledWith(structIds);
  })

});
