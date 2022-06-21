import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTriggerComponent } from './email-trigger.component';

describe('EmailTriggerComponent', () => {
  let component: EmailTriggerComponent;
  let fixture: ComponentFixture<EmailTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailTriggerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
