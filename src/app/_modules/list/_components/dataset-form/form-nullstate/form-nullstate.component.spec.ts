import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNullstateComponent } from './form-nullstate.component';

describe('FormNullstateComponent', () => {
  let component: FormNullstateComponent;
  let fixture: ComponentFixture<FormNullstateComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormNullstateComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormNullstateComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('formTypeSelected(type: { id: string; name: string })', async(() => {
    spyOn(router, 'navigate');
    const extras: any = { relativeTo: component.route };
    extras.queryParams = { t: '2' };
    extras.fragment = 'property-panel';

    component.formTypeSelected({ id: '2', name: 'Flow' })
    expect(router.navigate).toHaveBeenCalledWith(['new'], extras);
  }));

});
