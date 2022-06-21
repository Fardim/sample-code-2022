import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateDescriptionExpansionViewComponent } from './generate-description-expansion-view.component';

describe('GenerateDescriptionExpansionViewComponent', () => {
  let component: GenerateDescriptionExpansionViewComponent;
  let fixture: ComponentFixture<GenerateDescriptionExpansionViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateDescriptionExpansionViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateDescriptionExpansionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
