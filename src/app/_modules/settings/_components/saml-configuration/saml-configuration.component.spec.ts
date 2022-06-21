import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SAMLConfigurationComponent } from './saml-configuration.component';

describe('SAMLConfigurationComponent', () => {
  let component: SAMLConfigurationComponent;
  let fixture: ComponentFixture<SAMLConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SAMLConfigurationComponent ],
      imports:  [ AppMaterialModuleForSpec, SharedModule, RouterTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SAMLConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
