import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule, TransientService } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { PreviewMappingComponent } from './preview-mapping.component';

describe('PreviewMappingComponent', () => {
  let component: PreviewMappingComponent;
  let fixture: ComponentFixture<PreviewMappingComponent>;
  let router: Router;
  let transientService: TransientService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewMappingComponent ],
      imports: [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule ],
      providers: [TransientService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewMappingComponent);
    component = fixture.componentInstance;
    router = fixture.debugElement.injector.get(Router);
    transientService = fixture.debugElement.injector.get(TransientService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openConfirmation, should open confirmation popup', () => {
    spyOn(transientService, 'confirm');
    component.openConfirmation('interface save');
    expect(transientService.confirm).toHaveBeenCalled();
  })

  it('close, should close Preview Mapping', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' })
  })
});
