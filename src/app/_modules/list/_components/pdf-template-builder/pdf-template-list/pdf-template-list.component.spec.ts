import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfTemplateListComponent } from './pdf-template-list.component';

describe('PdfTemplateListComponent', () => {
  let component: PdfTemplateListComponent;
  let fixture: ComponentFixture<PdfTemplateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfTemplateListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
