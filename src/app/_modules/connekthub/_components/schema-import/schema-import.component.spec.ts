import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaImportComponent } from './schema-import.component';

describe('SchemaImportComponent', () => {
  let component: SchemaImportComponent;
  let fixture: ComponentFixture<SchemaImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
