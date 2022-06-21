import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { of } from 'rxjs';
import { BusinessRuleListComponent } from './business-rule-list.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('BusinessRuleListComponent', () => {
  let component: BusinessRuleListComponent;
  let fixture: ComponentFixture<BusinessRuleListComponent>;

  const queryParams = { f: '1' };
  const routeParams = { moduleId: '1005', fieldId: '1' };
  const panel = 'property-panel';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessRuleListComponent],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessRuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onPageChange(), should call getTableData with updated pagination', async(() => {
    const pageEvent = {
      pageIndex: 2,
      pageSize: 50,
      length: 100,
    };
    component.ngOnInit();
    component.onPageChange(pageEvent);
    expect(component.recordsPageIndex).toBe(pageEvent.pageIndex);

    const result = component.onPageChange(pageEvent);
    expect(result).toBeFalsy();
  }));

  it('getRuleDesc(), should return rule description', async(() => {
    expect(component.getRuleDesc('BR_API_RULE')).toEqual('Custom validation');
    expect(component.getRuleDesc('testRule')).toBeFalsy();
  }));

  it('searchFieldSub next', fakeAsync(() => {
    spyOn(component, 'getTableData');
    component.ngOnInit();

    component.searchFieldSub.next('material');
    tick(1000);
    expect(component.getTableData).toHaveBeenCalled();
  }));

  it('searchModifyBySub next', fakeAsync(() => {
    spyOn(component, 'getModifybyUsers');
    component.ngOnInit();

    component.searchModifyBySub.next('user');
    tick(1000);
    expect(component.getModifybyUsers).toHaveBeenCalled();
  }));

  it('setSelectedModifyby(user: any)', async(() => {
    const user1 = { userName: 'prospecta' };
    const user2 = { userName: 'mdo' };
    component.setSelectedModifyby(user1);
    component.setSelectedModifyby(user2);
    expect(component.filterData.userModified.length).toEqual(2);

    component.setSelectedModifyby(user1);
    expect(component.filterData.userModified.length).toEqual(1);

    component.setSelectedModifyby(null);
    expect(component.filterData.userModified.length).toEqual(0);
  }));

  it('afterFilterMenuClosed(), should get getTableData on filter applied', async(() => {
    spyOn(component, 'getTableData');
    component.afterFilterMenuClosed();
    expect(component.recordsPageIndex).toEqual(1);
    expect(component.getTableData).toHaveBeenCalled();
  }));

  it('getLabel(), should find the label of the field of the table column', () => {
    component.columns = [
      {
        id: 'description',
        name: 'Form',
      },
    ];

    const label = component.getLabel('description');
    expect(label).toEqual('Form');
  });
});
