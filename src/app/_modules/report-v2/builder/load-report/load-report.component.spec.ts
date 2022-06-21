import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadReportComponent } from './load-report.component';

describe('LoadReportComponent', () => {
  let component: LoadReportComponent;
  let fixture: ComponentFixture<LoadReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
