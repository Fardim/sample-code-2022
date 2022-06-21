import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormTabWidgetComponent } from './form-tab-widget.component';

describe('FormTabWidgetComponent', () => {
  let component: FormTabWidgetComponent;
  let fixture: ComponentFixture<FormTabWidgetComponent>;

  const mockdata = {
    metadata: [
        {
        description: 'Text Box',
        dataType: 'CHAR',
        pickList: '0',
        maxChar: 4,
        structureId: 1,
        fieldId: 'GENFLD0001'
        }
      ],
    isMandatory: true,
    isReadOnly: false,
    isHidden: false,
    moduleId: 154,
    isAdd: false,
    isDelete: false,
    order: 4,
    url: null,
    description: null,
    fieldType: 'FIELD',
    tabFieldUuid: '9cb2cfa8-162a-481e-a063-c2ae3956a45b'
    }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormTabWidgetComponent],
      imports: [AppMaterialModuleForSpec, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTabWidgetComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isHidden()', () => {
    mockdata.isReadOnly = false;
    component.tabFields = mockdata;
    component.isHidden(mockdata);
    expect(component.tabFields.isHidden).toEqual(true);
    // expect(component).toBeTruthy();
  });

  it('isReadOnly()', () => {
    mockdata.isHidden = false;
    component.tabFields = mockdata;
    component.isReadOnly(mockdata);
    expect(component.tabFields.isReadOnly).toEqual(true);
  });

  it('uploadTemplate()', () => {
    // fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('delete form widgets', () => {
    spyOn(component.deleteFormWidget, 'emit');
    component.delete(mockdata.tabFieldUuid);
    expect(component.deleteFormWidget.emit).toHaveBeenCalled();
  });
});
