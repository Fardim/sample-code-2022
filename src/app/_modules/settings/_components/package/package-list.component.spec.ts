import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageListComponent } from './package-list.component';

describe('PackageComponent', () => {
  let component: PackageListComponent;
  let fixture: ComponentFixture<PackageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
