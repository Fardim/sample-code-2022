import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateDatatableColumnsSettingComponent } from './duplicate-datatable-columns-setting.component';

describe('DuplicateDatatableColumnsSettingComponent', () => {
  let component: DuplicateDatatableColumnsSettingComponent;
  let fixture: ComponentFixture<DuplicateDatatableColumnsSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateDatatableColumnsSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateDatatableColumnsSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
