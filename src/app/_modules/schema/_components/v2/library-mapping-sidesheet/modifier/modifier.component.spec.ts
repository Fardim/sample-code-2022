import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ModifierComponent } from './modifier.component';

describe('ModifierComponent', () => {
  let component: ModifierComponent;
  let fixture: ComponentFixture<ModifierComponent>;
  let router: Router;
  let nounModifierService: NounModifierService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifierComponent ],
      imports: [ AppMaterialModuleForSpec, RouterTestingModule, SharedModule ],
      providers: [{
        provide: ActivatedRoute,
        useValue: {params : of({moduleId: '1005', matlGroup: 'valve', nounCode: 'Bearing'})}
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierComponent);
    component = fixture.componentInstance;

    nounModifierService = fixture.debugElement.injector.get(NounModifierService);
    router = TestBed.inject(Router);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build the modifier form', () => {

    component.buildForm();
    expect(component.modifierForm).toBeDefined();

  });

  it('should set form control value', () => {

    component.buildForm();
    component.setControlValue('modeCode', '20012');
    expect(component.modifierForm.value.modeCode).toEqual('20012');

  });

  it('close sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }], {queryParamsHandling: 'preserve'})
  });

  it(`To get FormControl from fromGroup `, async(() => {
    component.buildForm()
    const field=component.formField('modeCode');
    expect(field).toBeDefined();
   }));

  it('should init component', () => {
    component.ngOnInit();
    expect(component.moduleId).toEqual('1005');
  });


  it('should save', () => {

   spyOn(component, 'close');
   spyOn(nounModifierService, 'createNounModifier').and.returnValue(of('success'));

   component.buildForm();
   component.save();
   expect(component.submitted).toBeTrue();

   component.setControlValue('modeCode', 'Ball');
   component.save();

   component.setControlValue('shortDescActive', true);
   component.setControlValue('active', true);
   component.save();

   expect(nounModifierService.createNounModifier).toHaveBeenCalledTimes(2);

  })

});
