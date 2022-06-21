import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRestrictionComponent } from './data-restriction.component';

describe('DataRestrictionComponent', () => {
  let component: DataRestrictionComponent;
  let fixture: ComponentFixture<DataRestrictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataRestrictionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataRestrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
