import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListItemSkeletonComponent } from './list-item-skeleton.component';

describe('ListItemSkeletonComponent', () => {
  let component: ListItemSkeletonComponent;
  let fixture: ComponentFixture<ListItemSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListItemSkeletonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListItemSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
