import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleSettingsComponent } from './rule-settings.component';

describe('RuleSettingsComponent', () => {
  let component: RuleSettingsComponent;
  let fixture: ComponentFixture<RuleSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
