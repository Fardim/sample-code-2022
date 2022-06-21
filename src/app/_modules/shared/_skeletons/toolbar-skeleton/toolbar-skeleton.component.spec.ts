import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarSkeletonComponent } from './toolbar-skeleton.component';

describe('ToolbarSkeletonComponent', () => {
  let component: ToolbarSkeletonComponent;
  let fixture: ComponentFixture<ToolbarSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolbarSkeletonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
