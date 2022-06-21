import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionTimePickerComponent } from './transaction-time-picker.component';

describe('TransactionTimePickerComponent', () => {
  let component: TransactionTimePickerComponent;
  let fixture: ComponentFixture<TransactionTimePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionTimePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
