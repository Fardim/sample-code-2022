import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacteristicLanguagesComponent } from './characteristic-languages.component';

import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { GlobaldialogService } from '@services/globaldialog.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';

describe('CharacteristicLanguagesComponent', () => {
  let component: CharacteristicLanguagesComponent;
  let fixture: ComponentFixture<CharacteristicLanguagesComponent>;
  let globalDialogService: GlobaldialogService;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicLanguagesComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule, ReactiveFormsModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicLanguagesComponent);
    component = fixture.componentInstance;
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    location = TestBed.inject(Location);
    window.history.pushState({
      label: [{ label: 'en', language: 'English' }]
    }, '', '');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should call ngOnInit', (() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('should create and back should go back by location', () => {
    expect(component).toBeTruthy();
    spyOn(location, 'back');
    component.close();
    expect(location.back).toHaveBeenCalledTimes(1);
  });

  it('removeItem()', async(() => {
    spyOn(component, 'removeItem').and.callThrough();
    spyOn(globalDialogService, 'confirm').and.callFake(({ }, cb) => {
      expect(typeof cb).toBe('function');
      cb('yes');
    });
    component.initForm();
    component.removeItem(0);
    expect(component.removeItem).toHaveBeenCalled();

  }));

  it('save', () => {
    spyOn(component, 'save').and.callThrough();
    component.initForm();
    component.save();
    expect(component.save).toHaveBeenCalled();
  });

  it('save', () => {
    spyOn(component, 'save').and.callThrough();
    component.initForm();
    const labels = {
      label: 'en',
      language: 'english'
    }
    component.labelsFormArray.push(new FormControl(labels));
    component.save();
    expect(component.save).toHaveBeenCalled();
  });

  it('addLabel', () => {
    spyOn(component, 'addLabel').and.callThrough();
    component.initForm();
    component.addLabel();
    expect(component.addLabel).toHaveBeenCalled();
  });

  it('checkOptionSelected', () => {
    spyOn(component, 'checkOptionSelected').and.callThrough();
    component.initForm();
    component.labelsFormArray.patchValue([{ label: 'en', language: 'English' }]);
    component.selectedLanguageList = [];
    component.checkOptionSelected({ id: '1', name: 'English' }, 0)
    expect(component.checkOptionSelected).toHaveBeenCalled();

    component.selectedLanguageList = ['English'];
    component.checkOptionSelected({ id: '1', name: 'English' }, 0)
    expect(component.checkOptionSelected).toHaveBeenCalled();
  });

  it('checks validationErrors', () => {
    component.initForm();
    component.labelsFormArray.patchValue([{ label: 'en', language: 'en' }]);
    component.selectedLanguageList = [];

    expect(component.validationErrors).toEqual('');
  });
});
