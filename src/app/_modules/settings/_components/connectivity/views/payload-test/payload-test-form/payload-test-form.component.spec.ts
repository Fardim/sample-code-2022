import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { PayloadTestFormComponent } from './payload-test-form.component';

describe('PayloadTestFormComponent', () => {
  let component: PayloadTestFormComponent;
  let fixture: ComponentFixture<PayloadTestFormComponent>;

  const payloadTestData = [
    {
      elementName: 'Header Data',
      elementData: {
        materialType: '',
        materialGroup: '',
        baseUnitOfMeasure: '',
      },
      elementTableData: [],
    }
  ]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayloadTestFormComponent ],
      imports:  [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayloadTestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit,should initalize form', () => {
    component.ngOnInit();
    expect(component.formGroup).toBeDefined();
  });

  it('patchValues,should added from control', () => {
    const formGroup = component.patchValues('','','',[]);
    expect(formGroup).toBeDefined();
  });

  it('writeValue,should added value to ', () => {
    spyOn(component,'addPayloadTestArray');
    component.writeValue(payloadTestData);
    expect(component.addPayloadTestArray).toHaveBeenCalled();
  });
});
