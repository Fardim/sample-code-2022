import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDatarefComponent } from './transaction-dataref.component';

describe('TransactionDatarefComponent', () => {
  let component: TransactionDatarefComponent;
  let fixture: ComponentFixture<TransactionDatarefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionDatarefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionDatarefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
