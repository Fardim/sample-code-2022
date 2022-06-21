import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishingPackageFormComponent } from './publishing-package-form.component';

describe('PublishingPackageFormComponent', () => {
  let component: PublishingPackageFormComponent;
  let fixture: ComponentFixture<PublishingPackageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublishingPackageFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishingPackageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
