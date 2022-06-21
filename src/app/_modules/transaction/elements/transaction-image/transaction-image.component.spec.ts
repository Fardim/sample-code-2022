import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionImageComponent } from './transaction-image.component';

describe('TransactionImageComponent', () => {
  let component: TransactionImageComponent;
  let fixture: ComponentFixture<TransactionImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
