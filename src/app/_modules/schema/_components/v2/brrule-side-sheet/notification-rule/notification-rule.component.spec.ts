import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationRuleComponent } from './notification-rule.component';

describe('NotificationRuleComponent', () => {
  let component: NotificationRuleComponent;
  let fixture: ComponentFixture<NotificationRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
