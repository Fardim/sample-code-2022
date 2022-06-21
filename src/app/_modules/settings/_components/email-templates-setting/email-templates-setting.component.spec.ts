import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';

import { EmailTemplatesSettingComponent } from './email-templates-setting.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

describe('EmailTemplatesSettingComponent', () => {
  let component: EmailTemplatesSettingComponent;
  let fixture: ComponentFixture<EmailTemplatesSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailTemplatesSettingComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailTemplatesSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
