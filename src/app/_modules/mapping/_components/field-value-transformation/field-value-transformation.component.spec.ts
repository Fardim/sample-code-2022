import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { Router } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldValueTransformationComponent } from './field-value-transformation.component';

describe('FieldValueTransformationComponent', () => {
  let component: FieldValueTransformationComponent;
  let fixture: ComponentFixture<FieldValueTransformationComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldValueTransformationComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldValueTransformationComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();

    component.isInbound = true;
    component.ngOnInit();
    expect(component.leadingZeroesTooltip).toEqual('This property can be enabled to remove the leading zeroes from the value');
  });

  it('openTranslationRuleSidesheet()', async(() => {
    spyOn(router, 'navigate');
    let translationRuleId = null;
    component.openTranslationRuleSidesheet(translationRuleId);
    const extras: any = { };
    extras.preserveFragment = true;
    extras.queryParamsHandling = 'preserve';
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/mapping/field-mapping`, outer: `outer/mapping/field-value-transform/${component.fieldId}/${translationRuleId ? translationRuleId : 'new'}` } }], extras);

    translationRuleId = '1';
    component.openTranslationRuleSidesheet(translationRuleId);
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/mapping/field-mapping`, outer: `outer/mapping/field-value-transform/${component.fieldId}/${translationRuleId ? translationRuleId : 'new'}` } }], extras);
  }));

});
