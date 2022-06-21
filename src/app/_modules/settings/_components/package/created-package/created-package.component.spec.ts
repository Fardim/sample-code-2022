import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedPackageComponent } from './created-package.component';

describe('CreatedPackageComponent', () => {
  let component: CreatedPackageComponent;
  let fixture: ComponentFixture<CreatedPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatedPackageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatedPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
