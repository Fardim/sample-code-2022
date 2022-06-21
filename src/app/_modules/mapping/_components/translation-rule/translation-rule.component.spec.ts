import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationRuleComponent } from './translation-rule.component';

describe('TranslationRuleComponent', () => {
  let component: TranslationRuleComponent;
  let fixture: ComponentFixture<TranslationRuleComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranslationRuleComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranslationRuleComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('close()', async(() => {
    spyOn(router, 'navigate');
    component.close();
    const extras: any = { };
    extras.preserveFragment = true;
    extras.queryParamsHandling = 'preserve';
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }], extras);
  }));

});
