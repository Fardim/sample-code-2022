import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdoGenericComponentsComponent } from './mdo-generic-components.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { FormInputComponent } from '@modules/shared/_components/form-input/form-input.component';
import { AddFilterMenuComponent } from '@modules/shared/_components/add-filter-menu/add-filter-menu.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FilterValuesComponent } from '@modules/shared/_components/filter-values/filter-values.component';
import { SharedModule } from '@modules/shared/shared.module';

describe('MdoGenericComponentsComponent', () => {
  let component: MdoGenericComponentsComponent;
  let fixture: ComponentFixture<MdoGenericComponentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MdoGenericComponentsComponent, SearchInputComponent, FormInputComponent, AddFilterMenuComponent, FilterValuesComponent ],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, ReactiveFormsModule, FormsModule, RouterTestingModule, SharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdoGenericComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
