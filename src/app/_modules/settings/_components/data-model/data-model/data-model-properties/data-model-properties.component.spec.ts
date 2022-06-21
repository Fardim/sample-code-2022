import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelPropertiesComponent } from './data-model-properties.component';

describe('DataModelPropertiesComponent', () => {
  let component: DataModelPropertiesComponent;
  let fixture: ComponentFixture<DataModelPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataModelPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataModelPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
