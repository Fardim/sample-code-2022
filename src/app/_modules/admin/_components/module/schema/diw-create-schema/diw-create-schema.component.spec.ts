import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiwCreateSchemaComponent } from './diw-create-schema.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BusinessRuleType } from '../../business-rules/business-rules.modal';
import { SharedModule } from '@modules/shared/shared.module';

describe('DiwCreateSchemaComponent', () => {
  let component: DiwCreateSchemaComponent;
  let fixture: ComponentFixture<DiwCreateSchemaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiwCreateSchemaComponent ],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiwCreateSchemaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('`businessRuleTypeDef`(), Should return business rule type def ', async(()=>{
    let val = BusinessRuleType.BR_MANDATORY_FIELDS;
    expect(component.businessRuleTypeDef(val)).toEqual('Missing Rule');
    val = BusinessRuleType.BR_METADATA_RULE;
    expect(component.businessRuleTypeDef(val)).toEqual('Metadata Rule');
    val = BusinessRuleType.BR_CUSTOM_SCRIPT;
    expect(component.businessRuleTypeDef(val)).toEqual('User Defined Rule');
    val = BusinessRuleType.BR_DEPENDANCY_RULE;
    expect(component.businessRuleTypeDef(val)).toEqual('Dependency Rule');
    val = BusinessRuleType.BR_DUPLICATE_RULE;
    expect(component.businessRuleTypeDef(val)).toEqual('Duplicate Rule');
    val = BusinessRuleType.BR_API_RULE;
    expect(component.businessRuleTypeDef(val)).toEqual('API Rule');
    val = BusinessRuleType.BR_EXTERNALVALIDATION_RULE;
    expect(component.businessRuleTypeDef(val)).toEqual('External Validation Rule');
    val = BusinessRuleType.BR_REGEX_RULE;
    expect(component.businessRuleTypeDef(val)).toEqual('Regex Rule');
  }));
});
