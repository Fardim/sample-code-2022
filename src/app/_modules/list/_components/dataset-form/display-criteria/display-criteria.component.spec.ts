import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { DisplayCriteriaComponent } from './display-criteria.component';

describe('DisplayCriteriaComponent', () => {
  let component: DisplayCriteriaComponent;
  let fixture: ComponentFixture<DisplayCriteriaComponent>;
  let router: Router;
  const queryParams = { f: '1' };
  const routeParams = { moduleId: '187', fieldId: '1' };
  const panel = 'property-panel';


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayCriteriaComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        TransientService,
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayCriteriaComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  });
});
