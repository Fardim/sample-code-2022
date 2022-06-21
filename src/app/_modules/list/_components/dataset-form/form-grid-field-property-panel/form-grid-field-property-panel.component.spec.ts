import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormGridFieldPropertyPanelComponent } from './form-grid-field-property-panel.component';

describe('FormGridFieldPropertyPanelComponent', () => {
  let component: FormGridFieldPropertyPanelComponent;
  let fixture: ComponentFixture<FormGridFieldPropertyPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormGridFieldPropertyPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormGridFieldPropertyPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
