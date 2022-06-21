import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelListComponent } from './data-model-list.component';

describe('DataModelListComponent', () => {
  let component: DataModelListComponent;
  let fixture: ComponentFixture<DataModelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataModelListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataModelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
