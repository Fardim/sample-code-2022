import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDatePickerComponent } from './transaction-date-picker.component';

describe('TransactionDatePickerComponent', () => {
  let component: TransactionDatePickerComponent;
  let fixture: ComponentFixture<TransactionDatePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionDatePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
