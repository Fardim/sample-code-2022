import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { HierarchyFilter2Component, TreeModel } from './hierarchy-filter.component';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import { of } from 'rxjs';
import { WidgetService } from '@services/widgets/widget.service';
import { SimpleChanges } from '@angular/core';
import { Widget } from '@modules/report-v2/_models/widget';

describe('HierarchyFilter2Component', () => {
  let component: HierarchyFilter2Component;
  let fixture: ComponentFixture<HierarchyFilter2Component>;
  let userService: UserService;
  let widgetService: WidgetService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HierarchyFilter2Component, SearchInputComponent],
      imports: [MdoUiLibraryModule,
        HttpClientTestingModule, AppMaterialModuleForSpec, SharedModule
      ],
      providers: [UserService, WidgetService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyFilter2Component);
    component = fixture.componentInstance;
    userService = fixture.debugElement.injector.get(UserService);
    widgetService = fixture.debugElement.injector.get(WidgetService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clickedActive(), should select or deselect the checkbox', async() => {
    const elementWithoutChild : TreeModel = {nodeId : '1005', nodeDesc : 'INDIA', child: null, parent:'true', checked: false}
    component.clickedActive(elementWithoutChild);
    expect(elementWithoutChild.checked).toEqual(true);

    const elementWithChild : TreeModel = { nodeId : '1005', nodeDesc : 'INDIA', child: [{ nodeId : '1005-001', nodeDesc : 'RAJASTHAN', parent:'false', child: null, checked: false}], parent:'true', checked: false}
    component.clickedActive(elementWithChild);
    expect(elementWithChild.checked).toEqual(true);

    const elementWithoutChild1 : TreeModel = {nodeId : '1005', nodeDesc : 'INDIA',parent:'true',child: null, checked: true}
    component.selectedNode = [{nodeId:'1005', nodeDesc: 'INDIA'} as TreeModel];
    component.clickedActive(elementWithoutChild1);
    expect(component.selectedNode.length).toEqual(0);

    component.selectedNode = [{ nodeId : '1005-001', nodeDesc : 'RAJASTHAN', child: null, checked: true,parent:'false'}];
    const elementWithChild1 = { nodeId : '1005', nodeDesc : 'INDIA', parent:'true', child: [{ nodeId : '1005-001', nodeDesc : 'RAJASTHAN', child: [{ nodeId : '1005-001', nodeDesc : 'RAJASTHAN', child: null, parent:'false', checked: false}], parent:'false',checked: false}], checked: true}
    component.clickedActive(elementWithChild1);
    expect(elementWithChild.checked).toEqual(true);

    component.isFilterSiderSheet = 'true';
    component.clickedActive(undefined);
    expect(component.clickedActive).toBeTruthy();
  })

  it('getCheckedAmount(), should return selected/deselected checkbox' , async() =>{
    const data = {
      nodeId : '100-001',
      nodeDesc : 'India',
      child: [
        {
          nodeId : '1005-001',
          nodeDesc : 'RAJASTHAN',
          child: [
            {
              nodeId : '5-001',
              nodeDesc : 'JK',
              child: null,
              checked: true,
            },
            {
              nodeId : '1-001',
              nodeDesc : 'UP',
              child: null,
              checked: true,
            }
          ],
          checked: false
        }
      ],
      checked: true
    } as TreeModel
    component.selectedNode = [{nodeId : '100-001',nodeDesc:'India', child:[{nodeId:'100222',nodeDesc:'J&K',checked: true,child: null}]},{nodeId:'100222',nodeDesc:'J&K',checked: true,child: null},{nodeDesc:'UP'}] as TreeModel[];
    const res = component.getCheckedAmount(data);
    expect(res).toBeTrue();

    const data1 = {
      nodeId : '100-001',
      nodeDesc : 'India',
      child: [
        {
          nodeId:'100223',
          nodeDesc:'Bihar',
          checked: true,
          child: null,
          parent: 'false',
        },
        {
          nodeId:'100222',
          nodeDesc:'J&K',
          checked: true,
          child: null,
          parent: 'false',
        }
      ],
      checked: false
    } as TreeModel
    const res1 = component.getCheckedAmount(data1);
    expect(res1).toBeFalse();

    component.selectedNode = [{nodeId : '100-001',nodeDesc:'India', child:[{nodeId:'100222',nodeDesc:'J&K',checked: true,child: null}]}] as TreeModel[];
    const data2 = {
      nodeId : '100-001',
      nodeDesc : 'India',
      child: [
        {
          nodeId:'100223',
          nodeDesc:'Bihar',
          checked: false,
          child: null,
          parent: 'false',
        },
        {
          nodeId:'100222',
          nodeDesc:'J&K',
          checked: false,
          child: null,
          parent: 'false',
        }
      ],
      checked: false
    } as TreeModel
    component.getCheckedAmount(data2);
    expect(component.selectedNode.length).toEqual(0);
  });

  it('ngOnChanges()', async () => {
    component.topLocation = '';
    component.searchFunc = '';
    component.searchString = '';
    component.fieldId = 'MATL_GROUP';
    const changes = {
      fieldId: {
        currentValue: 'MATL_GROUP',
        previousValue: 'DATS',
        firstChange: false,
        isFirstChange() { return null }
      },
      value:{
        currentValue: [{CODE: '0023',TEXT:'INDIA'},'Australia'],
        previousValue: '',
        firstChange: false,
        isFirstChange() {return null}
      },
      filterCriteria: {
        previousValue: 'TEXT',
        currentValue: 'CODE',
        firstChange: false,
        isFirstChange() { return null }
      },
      widgetId: {
        previousValue: '12345',
        currentValue: '2345',
        firstChange: false,
        isFirstChange() { return null }
      },
      clearFilterClicked: {
        previousValue: '12345',
        currentValue: '2345',
        firstChange: false,
        isFirstChange() { return null }
      },
      isFilterWidget: {
        previousValue: 'false',
        currentValue: 'true',
        firstChange: false,
        isFirstChange() { return null }
      },
      isMenuClosed: {
        previousValue: 'false',
        currentValue: 'true',
        firstChange: false,
        isFirstChange() { return null }
      },
      displayCriteria: {
        previousValue: 'CODE',
        currentValue: 'TEXT',
        firstChange: false,
        isFirstChange() { return null }
      }
    } as SimpleChanges;

    const userDetails = {
      userName: 'abc',
      plantCode: '0',
      currentRoleId: 'AD',
      email: 'test@test.com'
    } as Userdetails;

    const data = [{
      nodeId: '1005-001',
      nodeDesc: 'RAJASTHAN',
      child: [{
          nodeId:'000220',
          nodeDesc: 'JJN',
          child: [{
            nodeId:'01234',
            nodeDesc: 'HB',
            child: null,
            checked: false
        }],
          checked: false
      }],
      checked: false
    } as any];
    component.widgetInfo = {} as Widget;
    component.filterCriteria = [];
    component.isEnableGlobalFilter = false;

    component.selectedNode = [{nodeId : '1005-001',nodeDesc:'Rajasthan', child:null,checked: true},{nodeId:'000220',nodeDesc:'JJN',checked: true,child: null}] as TreeModel[];
    spyOn(userService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(widgetService, 'getLocationHirerachy').withArgs('', '', '', '', '0').and.returnValue(of(data));
    spyOn(component,'applyFilter');
    component.ngOnChanges(changes);
    expect(widgetService.getLocationHirerachy).toHaveBeenCalledWith('', '', '', '', '0');
  });

  it('getSelectedData()', async(() => {
    component.selectedNode = [{ nodeId: '10022', nodeDesc: 'INDIA' } as TreeModel];

    const selectedDataList = component.getSelectedData();
    expect(selectedDataList.length).toEqual(1);
  }));

  it('getLabel(),should get label', async(() => {
    const opt = {
      nodeId: '1002',
      nodeDesc: 'INDIA'
    } as any

    component.displayCriteria = 'CODE_TEXT';
    const result = component.getLabel(opt);
    expect(result).toBe(opt.nodeId + '-' + opt.nodeDesc);

    component.displayCriteria = 'CODE';
    const result1 = component.getLabel(opt);
    expect(result1).toBe(opt.nodeId);

    component.displayCriteria = 'TEXT';
    const result2 = component.getLabel(opt);
    expect(result2).toBe(opt.nodeDesc);
  }));
})