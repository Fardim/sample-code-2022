import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossDatasetRuleComponent } from './cross-dataset-rule.component';

describe('CrossDatasetRuleComponent', () => {
  let component: CrossDatasetRuleComponent;
  let fixture: ComponentFixture<CrossDatasetRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrossDatasetRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossDatasetRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
