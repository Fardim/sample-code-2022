import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepPartnerUpdateComponent } from './step-partner-update.component';

describe('StepPartnerUpdateComponent', () => {
  let component: StepPartnerUpdateComponent;
  let fixture: ComponentFixture<StepPartnerUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepPartnerUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepPartnerUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
