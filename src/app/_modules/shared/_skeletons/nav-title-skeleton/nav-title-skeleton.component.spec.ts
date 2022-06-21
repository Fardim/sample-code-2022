import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavTitleSkeletonComponent } from './nav-title-skeleton.component';

describe('NavTitleSkeletonComponent', () => {
  let component: NavTitleSkeletonComponent;
  let fixture: ComponentFixture<NavTitleSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavTitleSkeletonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavTitleSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
