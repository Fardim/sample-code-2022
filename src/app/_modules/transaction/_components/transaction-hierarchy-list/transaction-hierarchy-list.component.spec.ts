import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ListValueResponse } from '@models/list-page/listpage';
import { HierarchyListItem } from '@modules/list/_components/field/hierarchy-service/hierarchy.service';
import { SharedModule } from '@modules/shared/shared.module';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { TransactionHierarchyListComponent } from './transaction-hierarchy-list.component';

describe('TransactionHierarchyListComponent', () => {
  let component: TransactionHierarchyListComponent;
  let fixture: ComponentFixture<TransactionHierarchyListComponent>;
  let coreService: CoreService;
  let transactionService: TransactionService;
  let ruleService: RuleService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionHierarchyListComponent ],
      imports: [ AppMaterialModuleForSpec, RouterTestingModule, SharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionHierarchyListComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    transactionService = fixture.debugElement.injector.get(TransactionService);
    ruleService = fixture.debugElement.injector.get(RuleService);
    component.moduleId = '500';
    component.hierarchyList = [
      {id: 1, label: 'Header Data', isHeader: true, child: [{id: 2, label: 'Plant Data', isHeader: false}]}
    ] as HierarchyListItem[];
    component.dataSource.data = [{id: 1, label: 'Header Data', isHeader: true}];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges()', () => {

    const changes = {
      hierarchyList:{
        currentValue: [{id: 1, label: 'Header Data', isHeader: true, child: [{id: 2, label: 'Plant Data', isHeader: false}]}],
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;

    component.ngOnChanges(changes);
    expect(component.dataSource.data.length).toEqual(1);
    expect(component.dataSource.data[0].child.length).toEqual(0);

    changes.hierarchyList.currentValue[0].isHeader = false;
    expect(component.dataSource.data.length).toEqual(0);
  });

  it('navigateToNode()', () => {
    const node = component.dataSource.data[0];
    spyOn(transactionService, 'setKeyFieldsDetails');
    spyOn(component.structureChanged, 'emit');

    component.navigateToNode(node);
    expect(component.structureChanged.emit).toHaveBeenCalledWith([node.id]);
    expect(transactionService.setKeyFieldsDetails).toHaveBeenCalledWith(component.moduleId, null);
  });

  it('isActive()', () => {
    const node = component.dataSource.data[0];
    component.activeStructureId = '1';
    expect(component.isActive(node)).toBeTrue();
  });

  it('getHeaderNode()', () => {
    expect(component.getHeaderNode()).toEqual(component.hierarchyList[0]);
  });

  it('getChildsByNode()', () => {
    const node: any = component.hierarchyList[0];
    expect(component.getChildsByNode(node).length).toEqual(1);
  });

  it('getDropdownOptions()', async() => {
    const response = {
      content: [{code: '0003',  text: 'Pune'}
      ]
    } as ListValueResponse;

    spyOn(ruleService, 'getDropvals').and.returnValues(of(response));

    component.getDropdownOptions().subscribe(resp => {
      expect(resp).toEqual(response);
    })
  });

  it('getKeyFieldsByStructureId()', async() => {
    const response = [{
      fieldId: 'FLD_1640702791341'
    }];

    spyOn(coreService, 'getKeyFieldsByStructureId').and.returnValues(of(response));

    component.getKeyFieldsByStructureId(1).subscribe(resp => {
      expect(resp).toEqual(response);
    });
  });

  it('isOptionChecked()', () => {
    component.selectedKeyFieldOptions = [
      {isKeyValue: true, keyFieldId: 'FLD_1640702791341', keyFieldValueCode: 'TN', keyFieldValueText: 'Tunisia'}
    ];
    const option = {text: 'Tunisia', code: 'TN'};

    expect(component.isOptionChecked(option)).toBeTrue();
  });

  it('updateKeyFieldValues()', () => {
    const option = {text: 'Tunisia', code: 'TN'};
    const node = component.hierarchyList[0].child[0];
    const parentNode = component.hierarchyList[0];
    component.keyFieldId = 'FLD_1640702791341';

    component.updateKeyFieldValues(option, parentNode, node, true);
    expect(component.selectedKeyFieldOptions.length).toEqual(1);

    component.updateKeyFieldValues(option, parentNode, node, true);
    expect(component.selectedKeyFieldOptions.length).toEqual(0);
  });

  it('getNavigationData()', () => {
    let node = component.hierarchyList[0];
    let result = component.getNavigationData(node);
    expect(result.node.id).toEqual(1);

    node = component.hierarchyList[0].child[0];
    result = component.getNavigationData(node);
    expect(result.parentNode.id).toEqual(1);
  });
});
