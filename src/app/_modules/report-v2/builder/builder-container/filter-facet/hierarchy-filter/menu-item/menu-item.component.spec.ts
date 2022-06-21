import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MenuItemComponent } from './menu-item.component';
import { TreeModel } from '../hierarchy-filter.component';
import { SimpleChanges } from '@angular/core';
import { DisplayCriteria } from '@modules/report-v2/_models/widget';

describe('MenuItemComponent', () => {
  let component: MenuItemComponent;
  let fixture: ComponentFixture<MenuItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MenuItemComponent, SearchInputComponent],
      imports: [MdoUiLibraryModule,
        HttpClientTestingModule, AppMaterialModuleForSpec, SharedModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clickedActive(), should select or deselect the checkbox', async () => {
    const element = { nodeId: '5-001', nodeDesc: 'JK', child: null, checked: true }
    const emitEventSpy = spyOn(component.valueChange, 'emit');
    component.clickedActive(element);
    expect(emitEventSpy).toHaveBeenCalled();
  })

  it('getCheckedAmount(), should return selected/deselected checkbox', async () => {
    const data = {
      nodeId: '100-001',
      nodeDesc: 'India',
      child: [
        {
          nodeId: '1005-001',
          nodeDesc: 'RAJASTHAN',
          child: [
            {
              nodeId: '5-001',
              nodeDesc: 'JK',
              child: null,
              checked: true,
            },
            {
              nodeId: '1-001',
              nodeDesc: 'UP',
              child: null,
              checked: true,
            }
          ],
          checked: false
        }
      ],
      checked: true
    } as TreeModel
    component.selectedNode = [{ nodeId: '100-001', nodeDesc: 'India', child: [{ nodeId: '100222', nodeDesc: 'J&K', checked: true, child: null }] }, { nodeId: '100222', nodeDesc: 'J&K', checked: true, child: null }, { nodeDesc: 'UP' }] as TreeModel[];
    const res = component.getCheckedAmount(data);
    expect(res).toBeTrue();

    const data1 = {
      nodeId: '100-001',
      nodeDesc: 'India',
      child: [
        {
          nodeId: '100223',
          nodeDesc: 'Bihar',
          checked: true,
          child: [{
            nodeId: '193949',
            nodeDesc: 'GSHS',
            checked: true,
            parent: 'false'
          }],
          parent: 'false',
        },
        {
          nodeId: '100222',
          nodeDesc: 'J&K',
          checked: true,
          child: null,
          parent: 'false',
        }
      ],
      checked: false
    } as TreeModel
    const res1 = component.getCheckedAmount(data1);
    expect(res1).toBeFalse();

    component.selectedNode = [{ nodeId: '100-001', nodeDesc: 'India', child: [{ nodeId: '100222', nodeDesc: 'J&K', checked: true, child: null }] }] as TreeModel[];
    const data2 = {
      nodeId: '100-001',
      nodeDesc: 'India',
      child: [
        {
          nodeId: '100223',
          nodeDesc: 'Bihar',
          checked: false,
          child: null,
          parent: 'false',
        },
        {
          nodeId: '100222',
          nodeDesc: 'J&K',
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

  it('ngOnChanges()', async () => {
    component.displayCriteria = DisplayCriteria.CODE;
    const changes = {
      displayCriteria : {
        currentValue: 'TEXT',
        previousValue: 'CODE',
        firstChange: false,
        isFirstChange() { return null }
      }
    } as SimpleChanges;

    component.ngOnChanges(changes);
    expect(component.displayCriteria).toEqual(DisplayCriteria.TEXT);
  })
})