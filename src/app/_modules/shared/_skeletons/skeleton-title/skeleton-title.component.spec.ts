import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonTitleComponent } from './skeleton-title.component';

describe('SkeletonTitleComponent', () => {
  let component: SkeletonTitleComponent;
  let fixture: ComponentFixture<SkeletonTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkeletonTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
