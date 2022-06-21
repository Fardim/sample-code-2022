import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { FieldsPropertiesComponent } from './fields-properties.component';

describe('FieldsPropertiesComponent', () => {
  let component: FieldsPropertiesComponent;
  let fixture: ComponentFixture<FieldsPropertiesComponent>;
  let router: Router;
  const queryParams = { f: '1' };
  const routeParams = { moduleId: '1005', fieldId: '1' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FieldsPropertiesComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [{ provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), snapshot: {} } }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldsPropertiesComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('close()', () => {
    spyOn(router, 'navigate');
    component.close();
    const extras: any = { relativeTo: component.route };
    extras.fragment = null;
    extras.queryParamsHandling = 'preserve';
    expect(router.navigate).toHaveBeenCalledWith(['.'], extras);
  });
});
