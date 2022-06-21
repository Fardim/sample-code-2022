import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicensingInformationComponent } from './licensing-information.component';

describe('LicensingInformationComponent', () => {
  let component: LicensingInformationComponent;
  let fixture: ComponentFixture<LicensingInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LicensingInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LicensingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
