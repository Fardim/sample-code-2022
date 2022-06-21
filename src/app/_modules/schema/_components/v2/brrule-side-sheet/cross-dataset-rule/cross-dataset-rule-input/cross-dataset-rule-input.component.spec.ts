import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossDatasetRuleInputComponent } from './cross-dataset-rule-input.component';

describe('CrossDatasetRuleInputComponent', () => {
  let component: CrossDatasetRuleInputComponent;
  let fixture: ComponentFixture<CrossDatasetRuleInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrossDatasetRuleInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossDatasetRuleInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
