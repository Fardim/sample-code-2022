import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateRecordsDatatableComponent } from './duplicate-records-datatable.component';

describe('DuplicateRecordsDatatableComponent', () => {
  let component: DuplicateRecordsDatatableComponent;
  let fixture: ComponentFixture<DuplicateRecordsDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateRecordsDatatableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateRecordsDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
