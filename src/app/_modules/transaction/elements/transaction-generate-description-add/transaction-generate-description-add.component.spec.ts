import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionGenerateDescriptionAddComponent } from './transaction-generate-description-add.component';

describe('TransactionGenerateDescriptionAddComponent', () => {
  let component: TransactionGenerateDescriptionAddComponent;
  let fixture: ComponentFixture<TransactionGenerateDescriptionAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionGenerateDescriptionAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionGenerateDescriptionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
