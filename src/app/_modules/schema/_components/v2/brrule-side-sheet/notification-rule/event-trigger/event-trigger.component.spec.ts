import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTriggerComponent } from './event-trigger.component';

describe('EventTriggerComponent', () => {
  let component: EventTriggerComponent;
  let fixture: ComponentFixture<EventTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventTriggerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
