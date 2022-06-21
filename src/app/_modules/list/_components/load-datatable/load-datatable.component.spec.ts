import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadDatatableComponent } from './load-datatable.component';

describe('LoadDatatableComponent', () => {
  let component: LoadDatatableComponent;
  let fixture: ComponentFixture<LoadDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
