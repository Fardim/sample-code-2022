import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelHierarchyLevelComponent } from './data-model-hierarchy-level.component';

describe('DataModelHierarchyLevelComponent', () => {
  let component: DataModelHierarchyLevelComponent;
  let fixture: ComponentFixture<DataModelHierarchyLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataModelHierarchyLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataModelHierarchyLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
