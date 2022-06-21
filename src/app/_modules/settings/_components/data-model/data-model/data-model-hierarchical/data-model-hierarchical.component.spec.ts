import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelHierarchicalComponent } from './data-model-hierarchical.component';

describe('DataModelHierarchicalComponent', () => {
  let component: DataModelHierarchicalComponent;
  let fixture: ComponentFixture<DataModelHierarchicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataModelHierarchicalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataModelHierarchicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
