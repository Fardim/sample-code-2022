import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ProcessVariableComponent } from './process-variable.component';

describe('ProcessVariableComponent', () => {
  let component: ProcessVariableComponent;
  let fixture: ComponentFixture<ProcessVariableComponent>;
  let coreService: CoreService;
  let ruleService: RuleService
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessVariableComponent ],
      imports: [HttpClientModule, HttpClientTestingModule, RouterTestingModule, SharedModule, MdoUiLibraryModule, AppMaterialModuleForSpec]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessVariableComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    ruleService = fixture.debugElement.injector.get(RuleService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
