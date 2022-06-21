import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacteristicsMutationNewLanguageComponent } from './characteristics-mutation-new-language.component';
import { Router } from '@angular/router';

import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';

describe('CharacteristicsMutationNewLanguageComponent', () => {
  let component: CharacteristicsMutationNewLanguageComponent;
  let fixture: ComponentFixture<CharacteristicsMutationNewLanguageComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicsMutationNewLanguageComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicsMutationNewLanguageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should open the dialog', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalled();
  });
});
