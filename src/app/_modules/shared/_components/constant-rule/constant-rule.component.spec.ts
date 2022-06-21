import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { OptionFilterComponent } from './../lookup/option-filter/option-filter.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstantRuleComponent } from './constant-rule.component';

describe('ConstantRuleComponent', () => {
  let component: ConstantRuleComponent;
  let fixture: ComponentFixture<ConstantRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstantRuleComponent, OptionFilterComponent ],
      imports:[ AppMaterialModuleForSpec ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstantRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
