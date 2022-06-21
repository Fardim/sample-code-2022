import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnekthubPackageComponent } from './connekthub-packages.component';

describe('ConnekthubPackagesComponent', () => {
  let component: ConnekthubPackageComponent;
  let fixture: ComponentFixture<ConnekthubPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnekthubPackageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnekthubPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
