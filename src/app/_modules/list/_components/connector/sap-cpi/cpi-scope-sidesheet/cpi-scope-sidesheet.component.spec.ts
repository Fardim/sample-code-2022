import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpiScopeSidesheetComponent } from './cpi-scope-sidesheet.component';

describe('CpiScopeSidesheetComponent', () => {
  let component: CpiScopeSidesheetComponent;
  let fixture: ComponentFixture<CpiScopeSidesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpiScopeSidesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpiScopeSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
