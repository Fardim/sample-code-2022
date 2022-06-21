import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionTabsComponent } from './transaction-tabs.component';

describe('TransactionTabsComponent', () => {
  let component: TransactionTabsComponent;
  let fixture: ComponentFixture<TransactionTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
