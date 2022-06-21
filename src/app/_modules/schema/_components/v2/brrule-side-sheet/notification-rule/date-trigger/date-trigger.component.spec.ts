import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTriggerComponent } from './date-trigger.component';

describe('DateTriggerComponent', () => {
  let component: DateTriggerComponent;
  let fixture: ComponentFixture<DateTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateTriggerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
