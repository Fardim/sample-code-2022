import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTemplatesFiltersComponent } from './email-templates-filters.component';

describe('EmailTemplatesFiltesComponent', () => {
  let component: EmailTemplatesFiltersComponent;
  let fixture: ComponentFixture<EmailTemplatesFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailTemplatesFiltersComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailTemplatesFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
