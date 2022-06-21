import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDateTimePickerComponent } from './transaction-date-time-picker.component';

describe('TransactionDateTimePickerComponent', () => {
  let component: TransactionDateTimePickerComponent;
  let fixture: ComponentFixture<TransactionDateTimePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionDateTimePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionDateTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
