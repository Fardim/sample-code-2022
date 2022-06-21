import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetRecordMappingComponent } from './dataset-record-mapping.component';

describe('DatasetRecordMappingComponent', () => {
  let component: DatasetRecordMappingComponent;
  let fixture: ComponentFixture<DatasetRecordMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetRecordMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetRecordMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
