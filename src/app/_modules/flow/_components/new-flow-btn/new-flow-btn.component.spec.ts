import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { NewFlowBtnComponent } from './new-flow-btn.component';

describe('NewFlowBtnComponent', () => {
  let component: NewFlowBtnComponent;
  let fixture: ComponentFixture<NewFlowBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewFlowBtnComponent ],
      imports: [ SharedModule,MdoUiLibraryModule, AppMaterialModuleForSpec]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFlowBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shouldcreate manually', () => {
    spyOn(window, 'open')
    component.manageFlows();
    expect(window.open).toHaveBeenCalled();
  });
});
