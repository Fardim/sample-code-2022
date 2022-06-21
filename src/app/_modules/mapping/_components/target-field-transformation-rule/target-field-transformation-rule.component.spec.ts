import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetFieldTransformationRuleComponent } from './target-field-transformation-rule.component';

describe('TargetFieldTransformationRuleComponent', () => {
  let component: TargetFieldTransformationRuleComponent;
  let fixture: ComponentFixture<TargetFieldTransformationRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TargetFieldTransformationRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetFieldTransformationRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
