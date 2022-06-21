import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfTemplateListFiltersComponent } from './pdf-template-list-filters.component';

describe('PdfTemplateListFiltersComponent', () => {
  let component: PdfTemplateListFiltersComponent;
  let fixture: ComponentFixture<PdfTemplateListFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfTemplateListFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfTemplateListFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
