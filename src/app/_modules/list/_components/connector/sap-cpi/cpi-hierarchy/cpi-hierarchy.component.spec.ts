import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpiHierarchyComponent } from './cpi-hierarchy.component';

describe('CpiHierarchyComponent', () => {
  let component: CpiHierarchyComponent;
  let fixture: ComponentFixture<CpiHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpiHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpiHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
