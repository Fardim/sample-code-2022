import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicableFieldSidesheetComponent } from './applicable-field-sidesheet.component';

describe('ApplicableFieldSidesheetComponent', () => {
  let component: ApplicableFieldSidesheetComponent;
  let fixture: ComponentFixture<ApplicableFieldSidesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicableFieldSidesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicableFieldSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
