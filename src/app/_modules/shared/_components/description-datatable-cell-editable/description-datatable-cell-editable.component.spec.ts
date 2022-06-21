import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionDatatableCellEditableComponent } from './description-datatable-cell-editable.component';

describe('DescriptionDatatableCellEditableComponent', () => {
  let component: DescriptionDatatableCellEditableComponent;
  let fixture: ComponentFixture<DescriptionDatatableCellEditableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DescriptionDatatableCellEditableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptionDatatableCellEditableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
