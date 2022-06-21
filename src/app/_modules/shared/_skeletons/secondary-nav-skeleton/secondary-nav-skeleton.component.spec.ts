import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryNavSkeletonComponent } from './secondary-nav-skeleton.component';

describe('SecondaryNavSkeletonComponent', () => {
  let component: SecondaryNavSkeletonComponent;
  let fixture: ComponentFixture<SecondaryNavSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecondaryNavSkeletonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondaryNavSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
