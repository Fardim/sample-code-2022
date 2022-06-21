import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Class, ClassType, ColloquialNames } from '@modules/classifications/_models/classifications';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ClassLanguageComponent } from './class-language.component';

describe('ClassLanguageComponent', () => {
  let component: ClassLanguageComponent;
  let fixture: ComponentFixture<ClassLanguageComponent>;
  let ruleService: RuleService;
  let dialog: MatDialog;
  const queryParams = { language: '1' };
  const routeParams = { uid: '1' };
  const mockDialogRef = { close: jasmine.createSpy('close'), open: jasmine.createSpy('open') };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClassLanguageComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, AppMaterialModuleForSpec, RouterTestingModule],
      providers: [TransientService,
        SharedServiceService,
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams) } },
        { provide: MatDialogRef, useValue: mockDialogRef }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassLanguageComponent);
    component = fixture.componentInstance;
    ruleService = fixture.debugElement.injector.get(RuleService);
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should call ngOnInit', (() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('closeDialog()', () => {
    spyOn(component, 'closeDialog').and.callThrough();
    component.closeDialog();
    expect(component.closeDialog).toHaveBeenCalled();
  });

  it('add(), while search and enter then value should be reset ', () => {
    const event = { input: { value: '' } } as MatChipInputEvent;
    // call actual method
    component.addColloquial(event);
    expect(component.addColloquial).toBeTruthy();

    const event1 = { value: '' } as MatChipInputEvent;
    // call actual method
    component.addColloquial(event1);
    expect(component.addColloquial).toBeTruthy();
  });

  it('remove(), shuld remove ', async(() => {
    const coll: ColloquialNames[] = [{
      calloquialName: 'abc',
      collorder: 1,
      language: 'EN',
      xref: ''
    }]

    component.colloquialsList = coll;

    component.remove(coll[0]);

    expect(component.colloquialsList.length).toEqual(0);

  }));

  it('check noun values after entering some value and validation', () => {
    const nounElement: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#languageForm').querySelectorAll('input')[0];
    const nounLongElement: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('#languageForm').querySelectorAll('input')[1];
    nounElement.value = 'Test';
    nounLongElement.value = 'Test';
    nounElement.dispatchEvent(new Event('input'));
    nounLongElement.dispatchEvent(new Event('input'));
    const isLanguageFormValid = component.languageForm.valid;
    expect(isLanguageFormValid).toBeTruthy();
    // fixture.whenStable().then(() => {
    //   expect(isLanguageFormValid).toBeTruthy();
    // });
  });

  it('addLanguage', () => {
    spyOn(component, 'addLanguage').and.callThrough();
    component.classInfo = new Class();
    const classLabel = {
      code: 'test',
      codeLong: 'test01',
      mod: '',
      modLong: '',
      language: 'EN',
      label: ''
    };
    component.classInfo.classLabels = [];
    component.classInfo.classLabels.push(classLabel);
    component.addLanguage({ id: 'EN', name: 'English' });
    expect(component.addLanguage).toHaveBeenCalled();
  });

  it('getUpdatedData', () => {
    spyOn(component, 'getUpdatedData').and.callThrough();
    component.selectedLanguage = { id: 'EN', name: 'English' };
    component.classInfo = new Class();
    const classLabel = {
      code: 'test',
      codeLong: 'test01',
      mod: '',
      modLong: '',
      language: 'EN',
      label: ''
    };
    component.classInfo.classLabels = [];
    component.classInfo.classLabels.push(classLabel);
    component.getUpdatedData();
    expect(component.getUpdatedData).toHaveBeenCalled();
  })

  it('save()', () => {
    spyOn(component, 'save').and.callThrough();
    spyOn(ruleService, 'saveUpdateClass').and.returnValue(of({ success: true }));
    const classLabel = {
      code: 'test',
      codeLong: 'test01',
      mod: '',
      modLong: '',
      language: 'EN',
      label: ''
    };
    component.selectedLanguage = { id: 'EN', name: 'English' };
    component.initForm(classLabel);
    component.classInfo = new Class();
    component.classInfo.classType = new ClassType();
    component.classInfo.classType.uuid = '121';
    component.classInfo.uuid = '121';
    component.classInfo.classLabels = [];
    component.classInfo.classLabels.push(classLabel);
    component.save();
    expect(component.save).toHaveBeenCalled();
  });

  it('save(), should form invalid', () => {
    spyOn(component, 'save').and.callThrough();
    spyOn(ruleService, 'saveUpdateClass').and.returnValue(of({ success: true }));
    const classLabel = {
      code: 'test',
      codeLong: '',
      mod: '',
      modLong: '',
      language: { id: 'EN', name: 'English' },
      label: ''
    };
    component.selectedLanguage = { id: 'EN', name: 'English' };
    component.classInfo = new Class();
    component.classInfo.classLabels = [];
    component.classInfo.classType = new ClassType();
    component.initForm(classLabel);
    component.save();
    expect(component.save).toHaveBeenCalled();
  });

  it('deleteLanguage', () => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({ result: 'yes' }), close: null });
    spyOn(dialog, 'open').and.returnValues(dialogRefSpyObj);
    component.deleteLanguage('EN');
    expect(dialog.open).toHaveBeenCalled();
  });

  it('setSelectedLanguage', () => {
    spyOn(component, 'setSelectedLanguage').and.callThrough();
    const classLabel = {
      code: 'test',
      codeLong: 'test01',
      mod: '',
      modLong: '',
      language: 'EN',
      label: ''
    };
    component.classInfo = new Class();
    component.classInfo.classLabels = [];
    component.classInfo.classLabels.push(classLabel);
    component.setSelectedLanguage('en', true);
    expect(component.setSelectedLanguage).toHaveBeenCalled();
  });

  it('isFormValid', () => {
    spyOn(component, 'isFormValid').and.callThrough();
    const classLabel = {
      code: 'test',
      codeLong: 'test01',
      mod: '',
      modLong: '',
      language: 'EN',
      label: ''
    };
    component.selectedLanguage = { id: 'EN', name: 'English' };
    component.classInfo = new Class();
    component.classInfo.classLabels = [];
    component.classInfo.classLabels.push(classLabel);
    component.initForm(classLabel);
    component.isFormValid();
    expect(component.isFormValid).toHaveBeenCalled();
  });

  it('isFormValid, else part', () => {
    spyOn(component, 'isFormValid').and.callThrough();
    const classLabel = {
      code: 'test',
      codeLong: 'test01',
      mod: '',
      modLong: '',
      language: 'EN',
      label: ''
    };
    component.selectedLanguage = { id: 'FN', name: 'English' };
    component.classInfo = new Class();
    component.classInfo.classLabels = [];
    component.classInfo.classLabels.push(classLabel);
    component.initForm(classLabel);
    component.isFormValid();
    expect(component.isFormValid).toHaveBeenCalled();
  });

});
