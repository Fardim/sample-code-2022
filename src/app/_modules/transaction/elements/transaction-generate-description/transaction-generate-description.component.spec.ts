import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionGenerateDescriptionComponent } from './transaction-generate-description.component';

describe('TransactionGenerateDescriptionComponent', () => {
  let component: TransactionGenerateDescriptionComponent;
  let fixture: ComponentFixture<TransactionGenerateDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionGenerateDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionGenerateDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
