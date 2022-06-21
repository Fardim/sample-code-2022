import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GroupDetails, RequestForGroupList, SearchAfter } from '@models/schema/duplicacy';
import { SharedModule } from '@modules/shared/shared.module';
import { CatalogCheckService } from '@services/home/schema/catalog-check.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { GroupDataTableComponent } from './group-data-table.component';

describe('GroupDataTableComponent', () => {
  let component: GroupDataTableComponent;
  let fixture: ComponentFixture<GroupDataTableComponent>;
  let catalogService : CatalogCheckService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDataTableComponent ],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDataTableComponent);
    component = fixture.componentInstance;

    catalogService = fixture.debugElement.injector.get(CatalogCheckService);
    component.moduleId = '1';
    component.schemaId = '1';
    component.variantId = '0';
    component.runId = '123';

    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit row clicked event', () => {

    spyOn(component.groupChange, 'emit');
    component.rowGroupClicked('1');

    expect(component.groupChange.emit).toHaveBeenCalled();

  });

  it('should get group list data', async(() => {

    const request = new RequestForGroupList();
    request.schemaId = component.schemaId;
    request.plantCode = '0';
    request.runId = component.runId;
    request.page = 0;
    request.size = 40;
    request.responseStatus = component.activeTab;
    request.searchAfter  = new SearchAfter() ;
    request.filterCriteria = [];

    spyOn(catalogService, 'getAllGroupIds').and.returnValues(of({groups:[{groupId: '', groupDesc: '' ,groupKey: ''}], searchAfter:{}}), of([]), throwError({status: 500}), throwError({status: 500}));

    component.filterCriteria = new BehaviorSubject([]);
    component.getDuplicacyGroupsList();
    expect(catalogService.getAllGroupIds).toHaveBeenCalledWith(request);

    component.getDuplicacyGroupsList(true);
    component.runId = null;
    request.runId = '';
    request.page = 1;
    request.searchAfter = new SearchAfter();
    expect(component.dataSource.data.length).toEqual(2);

    component.getDuplicacyGroupsList();
    component.getDuplicacyGroupsList(true);
    expect(component.dataSource.data.length).toEqual(0);

  }));

  it('should return all rows selected', () => {
    expect(component.isAllSelected()).toEqual(true);
  });

  it('should return all rows selected', () => {
    expect(component.isAllSelected()).toEqual(true);
  });

  it('should clear selection', () => {
    spyOn(component.selection, 'clear');
    component.masterToggle();
    expect(component.selection.clear).toHaveBeenCalled();

    component.dataSource.data = [{groupId: '1701'} as GroupDetails];
    component.masterToggle();
    expect(component.isAllSelected()).toBeTrue();
  });

  it('should update groups list on change', () => {

    spyOn(component, 'getDuplicacyGroupsList');

    let changes: SimpleChanges = {schemaId:{currentValue:'schema1', previousValue: '', firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes)

    changes = {activeTab:{currentValue:'success', previousValue: '', firstChange:null, isFirstChange:null}};
    component.ngOnChanges(changes);

    component.ngOnChanges({});

    expect(component.getDuplicacyGroupsList).toHaveBeenCalledTimes(2);

  });

  it('should init component', () => {

    component.filterCriteria = new BehaviorSubject([]);
    component.ngOnInit();
    expect(component.userDetails).toBeDefined();

    component.selection.select([{groupId: '1701'}]);
    expect(component.tableHeaderActBtn.length).toEqual(1);

    component.selection.clear();
    expect(component.tableHeaderActBtn.length).toEqual(0);
  });

  it('should handle scroll event', () => {

    spyOn(component, 'getDuplicacyGroupsList');
    component.scrollLimitReached = false;

    const event = {target: { offsetHeight: 500, clientHeight: 300, scrollTop: 300, scrollHeight: 800}};
    component.onScroll(event);

    event.target.scrollTop = 500;
    component.onScroll(event);

    expect(component.getDuplicacyGroupsList).toHaveBeenCalledTimes(1);
  })
});
