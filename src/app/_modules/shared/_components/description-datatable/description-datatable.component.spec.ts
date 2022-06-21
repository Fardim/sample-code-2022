import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionDatatableComponent } from './description-datatable.component';

describe('DescriptionDatatableComponent', () => {
  let component: DescriptionDatatableComponent;
  let fixture: ComponentFixture<DescriptionDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DescriptionDatatableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptionDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
