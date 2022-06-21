import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoExtensionRuleComponent } from './auto-extension-rule.component';

describe('AutoExtensionRuleComponent', () => {
  let component: AutoExtensionRuleComponent;
  let fixture: ComponentFixture<AutoExtensionRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoExtensionRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoExtensionRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
