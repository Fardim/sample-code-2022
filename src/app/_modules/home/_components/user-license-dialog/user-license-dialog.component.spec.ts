import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLicenseDialogComponent } from './user-license-dialog.component';

describe('UserLicenseDialogComponent', () => {
  let component: UserLicenseDialogComponent;
  let fixture: ComponentFixture<UserLicenseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserLicenseDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLicenseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
