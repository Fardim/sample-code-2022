import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldValueTriggerComponent } from './field-value-trigger.component';

describe('FieldValueTriggerComponent', () => {
  let component: FieldValueTriggerComponent;
  let fixture: ComponentFixture<FieldValueTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldValueTriggerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldValueTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
