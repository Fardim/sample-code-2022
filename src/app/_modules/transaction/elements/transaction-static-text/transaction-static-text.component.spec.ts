import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionStaticTextComponent } from './transaction-static-text.component';

describe('TransactionStaticTextComponent', () => {
  let component: TransactionStaticTextComponent;
  let fixture: ComponentFixture<TransactionStaticTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionStaticTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionStaticTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
