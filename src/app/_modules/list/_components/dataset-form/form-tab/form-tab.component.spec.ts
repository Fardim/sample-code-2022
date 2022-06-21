import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormTabComponent } from './form-tab.component';

describe('FormTabComponent', () => {
  let component: FormTabComponent;
  let fixture: ComponentFixture<FormTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormTabComponent],
      imports:[AppMaterialModuleForSpec]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deleteFormWidget() ', () => {
    component.deleteFormWidget(null);
    expect(component).toBeTruthy();
  });
});
