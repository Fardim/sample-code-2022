import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyFieldListComponent } from './hierarchy-field-list.component';

describe('HierarchyFieldListComponent', () => {
  let component: HierarchyFieldListComponent;
  let fixture: ComponentFixture<HierarchyFieldListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HierarchyFieldListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyFieldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
