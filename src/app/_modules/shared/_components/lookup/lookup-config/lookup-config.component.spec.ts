import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { LookupConfigComponent } from './lookup-config.component';

describe('LookupConfigComponent', () => {
  let component: LookupConfigComponent;
  let fixture: ComponentFixture<LookupConfigComponent>;
  let schemadetailsService: SchemaDetailsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, AppMaterialModuleForSpec],
      declarations: [ LookupConfigComponent ],
      providers: [
        SchemaDetailsService,
        HttpClientTestingModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupConfigComponent);
    component = fixture.componentInstance;
    schemadetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getFieldsByModuleId() should call getMetadataFields empty resp', async() => {
    spyOn(schemadetailsService, 'getMetadataFields').withArgs('test').and.callFake(() => of(null));
    component.getFieldsByModuleId('test');
    expect(schemadetailsService.getMetadataFields).toHaveBeenCalled();
  });

  it('getFieldsByModuleId() should call getMetadataFields', async() => {
    const resp = {headers: {region: {fieldId: 'region'}}} as MetadataModeleResponse
    spyOn(schemadetailsService, 'getMetadataFields').withArgs('test').and.returnValue(of(resp));
    component.getFieldsByModuleId('test');
    expect(component.moduleHeaderFields.length).toEqual(1);
  });

  it('patchInitialData() should patch form object', () => {

    component.initForm();
    spyOn(schemadetailsService, 'getMetadataFields').and.callFake(() => of(null));
    component.patchInitialData();
    expect(component.lookupForm.value.moduleId).toBeFalsy();

    component.initialData = {
      enableUserField: false,
      fieldDescri: '',
      fieldId: '',
      fieldLookupConfig: {
        lookupColumn: 'test column',
        lookupColumnResult: 'test result',
        moduleId: 'test'
      },
      lookupTargetField: '',
      lookupTargetText: ''
    }

    component.patchInitialData();
    expect(component.lookupForm.value).toEqual({
      lookupColumn: 'test column',
      lookupColumnResult: 'test result',
      moduleId: 'test'
    });
  });

  it('should init component', () => {
    spyOn(component, 'initForm');
    component.ngOnInit();
    expect(component.initForm).toHaveBeenCalled();
  });

  it('should save config', () => {
    spyOn(component.saveData, 'emit');
    component.initForm();
    component.saveConfig();
    expect(component.saveData.emit).toHaveBeenCalled();
  });

  it('should update on input change', () => {
    spyOn(component, 'initForm');
    let changes: SimpleChanges = {};
    component.ngOnChanges(changes);

    changes = {initialData: {currentValue: null, previousValue: null, firstChange: false, isFirstChange: null},
    reload: {currentValue: true, previousValue: false, firstChange: false, isFirstChange: null}};

    component.ngOnChanges(changes);
    expect(component.initForm).toHaveBeenCalledTimes(1);
  });

  it('should handle module change', () => {

    spyOn(component, 'getFieldsByModuleId');

    component.initForm();
    component.initialModuleId = '1003';
    component.lookupForm.controls.moduleId.setValue('1005');
    component.lookupForm.controls.moduleId.setValue('');

    expect(component.getFieldsByModuleId).toHaveBeenCalledTimes(1);

  })

  it('displayModuleHeaderFn should display Module Header', () => {
    component.moduleHeaderFields = [{
      fieldId: 'test',
      fieldDescri: 'Test'
    }];
    expect(component.displayModuleHeaderFn('test')).toEqual('Test');
    expect(component.displayModuleHeaderFn('id')).toEqual('Module Object Number');
    expect(component.displayModuleHeaderFn('')).toEqual('');
  });

  it('displayAvailableModuleFn should display Available Module', () => {
    component.availableModules = [{
      objectid: 'test',
      objectdesc: 'Test'
    }];

    expect(component.displayAvailableModuleFn('test')).toEqual('Test');
    expect(component.displayAvailableModuleFn('')).toEqual('');
  });

  it('filterAvailableModules should filter Available Modules', () => {
    component.availableModules = [{
      objectid: 'test',
      objectdesc: 'Test'
    }];
    component.filterAvailableModules('te');
    expect(component.availableModulesFiltered.length).toEqual(1);
  });

  it('filterModuleHeaderFields should filter Module Header Fields', () => {
    component.moduleHeaderFields = [{
      fieldId: 'test',
      fieldDescri: 'Test'
    }];
    component.filterModuleHeaderFields('te');
    expect(component.moduleHeaderFieldsFiltered.length).toEqual(1);
  });
});
