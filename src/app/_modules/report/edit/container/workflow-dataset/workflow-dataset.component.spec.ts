import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDatasetComponent } from './workflow-dataset.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkflowResponse } from '@models/schema/schema';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';

describe('WorkflowDatasetComponent', () => {
  let component: WorkflowDatasetComponent;
  let fixture: ComponentFixture<WorkflowDatasetComponent>;
  let schemaServiceSpy : SchemaService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowDatasetComponent ],
      imports:[
        AppMaterialModuleForSpec,
        HttpClientTestingModule,
        SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowDatasetComponent);
    component = fixture.componentInstance;
    schemaServiceSpy = fixture.debugElement.injector.get(SchemaService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectAll(), should select and deselect all checkboxes', async() => {
    component.dataSetsWorkFlow = [{objectid:'1005', objectdesc:'material'}] as WorkflowResponse[];
    component.allChecked = true;
    component.selectAll();
    expect(component.allIndeterminate).toEqual(false);

    component.allChecked = false;
    component.selectAll();
    expect(component.allIndeterminate).toEqual(false);
  })

  it('isSelected(), should tell select/unselect state', () => {
    let item = {
      objectid : '1005',
      objectdesc: 'Material',
      isSelected: true
    }as WorkflowResponse
    let res = component.isSelected(item);
    expect(res).toEqual(true);

    item = {
      isSelected : false
    } as WorkflowResponse
    res = component.isSelected(item);
    expect(res).toEqual(false);
  })

  it('isChecked(), should tell checked/unchecked state', () => {
    let item = {
      objectid : '1005',
      objectdesc: 'Material',
      isSelected: true
    }as WorkflowResponse
    let res = component.isSelected(item);
    expect(res).toEqual(true);

    item = {
      isSelected : false
    } as WorkflowResponse
    res = component.isSelected(item);
    expect(res).toEqual(false);
  })

  it('manageStateOfCheckBox(), should manage all select functionality of checkboxes', () => {
    component.dataSetsWorkFlow = [
      {
        objectid : '1005',
        objectdesc: 'Material',
        isSelected: true
      },
      {
        objectid : '10051',
        objectdesc: 'Swap Equipment',
        isSelected: true
      },
      {
        objectid : '10052',
        objectdesc: 'Material 2',
        isSelected: false
      },
      {
        objectid : '10053',
        objectdesc: 'Swap Equipment 34',
        isSelected: true
      },
    ]
    component.manageStateOfCheckBox(false);
    expect(component.allChecked).toEqual(false);

    component.dataSetsWorkFlow = [
      {
        objectid : '1005',
        objectdesc: 'Material',
        isSelected: true
      },
      {
        objectid : '10051',
        objectdesc: 'Swap Equipment',
        isSelected: true
      },
      {
        objectid : '10052',
        objectdesc: 'Material 2',
        isSelected: true
      },
      {
        objectid : '10053',
        objectdesc: 'Swap Equipment 34',
        isSelected: true
      },
    ]

    component.manageStateOfCheckBox(false);
    expect(component.allChecked).toEqual(true);

    component.dataSetsWorkFlow = [
      {
        objectid : '1005',
        objectdesc: 'Material',
        isSelected: false
      }
    ]
    component.manageStateOfCheckBox(false);
    expect(component.allChecked).toEqual(false);
    expect(component.allIndeterminate).toEqual(false);

    component.manageStateOfCheckBox(true);
    expect(component.dataSetsWorkFlow[0].isSelected).toEqual(false);
  });

  it('isChecked()',async(() => {
    const module = {objectid:'1005', objectdesc:'material', isSelected: true} as WorkflowResponse;
    expect(component.isChecked(module)).toEqual(true);
  }));

  it('selectionChange()', async(() => {
    let fld = {objectid:'1005', objectdesc:'material', isSelected: true} as WorkflowResponse;
    component.dataSetsWorkFlow = [{objectid:'1005', objectdesc:'material', isSelected: true}];
    component.selectionChange(fld);
    expect(component.dataSetsWorkFlow[0].isSelected).toEqual(false);

    fld = {objectid:'1005', objectdesc:'material'} as WorkflowResponse;
    component.dataSetsWorkFlow = [{objectid:'1005', objectdesc:'material'}];
    component.selectionChange(fld);
    expect(component.dataSetsWorkFlow[0].isSelected).toEqual(true);
  }));

  it('ngOnInit()', async(() => {
    const res = [{objectid:'1005', objectdesc:'material', isSelected: false}];
    component.isWorkFlow = true;
    component.preSelectedObj = '1008';
    spyOn(schemaServiceSpy, 'getWorkflowData').and.returnValue(of(res));
    component.ngOnInit();
    expect(schemaServiceSpy.getWorkflowData).toHaveBeenCalled();
  }));

  it('ngOnInit()', async(() => {
    const res = [{objectid:'1008', objectdesc:'material', isSelected: false}];
    component.isWorkFlow = true;
    component.preSelectedObj = '1008';
    spyOn(schemaServiceSpy, 'getWorkflowData').and.returnValue(of(res));
    component.ngOnInit();
    expect(schemaServiceSpy.getWorkflowData).toHaveBeenCalled();
  }));

  it('ngOnInit()', async(() => {
    const res= [{objectid:'1005', objectdesc:'material', isSelected: false}];
    component.isWorkFlow = false;
    component.preSelectedObj = '1008';
    spyOn(schemaServiceSpy, 'getWorkflowData').and.returnValue(of(res));
    component.ngOnInit();
    expect(schemaServiceSpy.getWorkflowData).toHaveBeenCalled();
  }));

  it('ngOnChanges()',async(() => {
    const changes: import('@angular/core').SimpleChanges = {preSelectedObj:{currentValue:'1008', previousValue:'1005',firstChange:null,isFirstChange:null}};
    component.preSelectedObj = '1005';
    component.isWorkFlow = true;
    component.dataSetsWorkFlow = [{objectid:'1008', objectdesc:'Function location'}, {objectid:'1005', objectdesc:'Material'}] as WorkflowResponse[];
    component.ngOnChanges(changes);
    expect(component.dataSetsWorkFlow.length).toEqual(2);

    const changes1: import('@angular/core').SimpleChanges = {searchText:{currentValue:'mat', previousValue:'1005',firstChange:null,isFirstChange:null}};
    component.ngOnChanges(changes1);
    expect(component.dataSetsWorkFlow.length).toEqual(2);

    const changes2: import('@angular/core').SimpleChanges = {searchText:{currentValue:'', previousValue:'1005',firstChange:null,isFirstChange:null}};
    component.searchText = 'mat';
    component.ngOnChanges(changes2);
    expect(component.dataSetsWorkFlow.length).toEqual(2);

    const changes3: import('@angular/core').SimpleChanges = {isWorkFlow :{currentValue:false, previousValue:null,firstChange:null,isFirstChange:null}};
    component.ngOnChanges(changes3);
    expect(component.dataSetsWorkFlow.length).toEqual(2);

    const changes4: import('@angular/core').SimpleChanges = {isWorkFlow :{currentValue:true, previousValue:null,firstChange:null,isFirstChange:null}};
    component.isWorkFlow = false;
    component.ngOnChanges(changes4);
    expect(component.dataSetsWorkFlow.length).toEqual(2);
  }));

  it('getTooltip(), get tool tip', async () => {
    const obj = { objectid: '1', objectdesc: 'Custom dataset test/Duplicate With master' };
    expect(component.getTooltip(obj)).toEqual('Custom dataset test/Duplicate With master');
  });
});
