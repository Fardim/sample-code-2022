import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationComponent } from './organization.component';

describe('OrganizationComponent', () => {
  let component: OrganizationComponent;
  let fixture: ComponentFixture<OrganizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
