import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassCharacteristicsEmptyViewComponent } from './class-characteristics-empty-view.component';
import { Router } from '@angular/router';

import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';

describe('ClassCharacteristicsEmptyViewComponent', () => {
  let component: ClassCharacteristicsEmptyViewComponent;
  let fixture: ComponentFixture<ClassCharacteristicsEmptyViewComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClassCharacteristicsEmptyViewComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassCharacteristicsEmptyViewComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should open the dialog', () => {
    spyOn(router, 'navigate');
    component.newCharacterictics();
    expect(router.navigate).toHaveBeenCalled();
  });
});
