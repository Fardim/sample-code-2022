import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { PayloadTestComponent } from './payload-test.component';

describe('PayloadTestComponent', () => {
  let component: PayloadTestComponent;
  let fixture: ComponentFixture<PayloadTestComponent>;
  let router: Router;

  const elementDataTableData = [
    {
      column1: '1',
      column2: '2',
      column3: '3',
      column4: '4',
      column5: '5',
      column6: '6',
    },
    {
      column1: '7',
      column2: '8',
      column3: '9',
      column4: '10',
      column5: '11',
      column6: '12',
    }
  ]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayloadTestComponent ],
      imports:  [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayloadTestComponent);
    component = fixture.componentInstance;
    router = fixture.debugElement.injector.get(Router);
    component.payloadTestData = [
      {
        elementName: 'Header Data',
        elementData: {
          materialType: '',
          materialGroup: '',
          baseUnitOfMeasure: '',
        },
        elementTableData: {},
      }
    ]
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit, should initiate component', () => {
    spyOn(component,'patch');
    component.ngOnInit();
    expect(component.patch).toHaveBeenCalled();
    expect(component.formGroup).toBeDefined() ;
  })

  it('close, should close payload-test', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' })
  })

  it('testPayload, should show error banner', () => {
    component.testPayload();
    expect(component.showErrorBanner).toBeTruthy();
  })

  it('addTableData, should add table', () => {
    const tableData = component.addTableData();
    expect(tableData).toEqual(elementDataTableData);
  })

  it('addPayloadTestData, should add table', () => {
    component.addPayloadTestData();
    expect(component.payloadTestData[0].elementTableData).toEqual(elementDataTableData);
  })

  it('patchValues, should add table', () => {
    const value = component.patchValues('','','','',{});
    expect(value).toEqual({
      elementName: '',
      materialGroup: '',
      materialType: '',
      baseUnitOfMeasure: '',
      elementTableData: {
        newRow: false,
        tableData: elementDataTableData
      }
    });
  })
});
