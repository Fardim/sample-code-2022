import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertPdfTemplateComponent } from './upsert-pdf-template.component';

describe('UpsertPdfTemplateComponent', () => {
  let component: UpsertPdfTemplateComponent;
  let fixture: ComponentFixture<UpsertPdfTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpsertPdfTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpsertPdfTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
