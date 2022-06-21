import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { DataReferencingComponent } from './data-referencing.component';

describe('DataReferencingComponent', () => {
  let component: DataReferencingComponent;
  let fixture: ComponentFixture<DataReferencingComponent>;
  let router: Router;
  const queryParams = { f: '1' };
  const routeParams = { moduleId: '1005', fieldId: '1' };
  const panel = 'property-panel';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DataReferencingComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        TransientService,
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataReferencingComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should close sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  });
});
