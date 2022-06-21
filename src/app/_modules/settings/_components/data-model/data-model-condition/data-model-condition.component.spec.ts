import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelConditionComponent } from './data-model-condition.component';

describe('DataModelConditionComponent', () => {
  let component: DataModelConditionComponent;
  let fixture: ComponentFixture<DataModelConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataModelConditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataModelConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
