import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionGridFormViewComponent } from './transaction-grid-form-view.component';

describe('TransactionGridFormViewComponent', () => {
  let component: TransactionGridFormViewComponent;
  let fixture: ComponentFixture<TransactionGridFormViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionGridFormViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionGridFormViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
