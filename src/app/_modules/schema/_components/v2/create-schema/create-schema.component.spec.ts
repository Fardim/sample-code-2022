import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSchemaComponent } from './create-schema.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormInputComponent } from '@modules/shared/_components/form-input/form-input.component';
import { SharedModule } from '@modules/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaListDetails } from '@models/schema/schemalist';
import { ObjectTypeResponse } from '@models/schema/schema';

describe('CreateSchemaComponent', () => {
  let component: CreateSchemaComponent;
  let fixture: ComponentFixture<CreateSchemaComponent>;
  let schemaListService: SchemalistService;
  let router: Router;
  let schemaService: SchemaService;
  const routeParams = {moduleId: '1005', schemaId: '1'};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSchemaComponent, FormInputComponent ],
      imports:[
        AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule
      ],
      providers: [{provide: ActivatedRoute, useValue:  {params: of(routeParams)}}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSchemaComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();

    schemaListService = fixture.debugElement.injector.get(SchemalistService);
    schemaService = fixture.debugElement.injector.get(SchemaService);
    router = fixture.debugElement.injector.get(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init component', () => {

    spyOn(schemaListService, 'getSchemaDetailsBySchemaId').and.returnValue(of(new SchemaListDetails()));
    spyOn(component, 'getAllObjectType');
    component.ngOnInit();
    expect(component.moduleId).toEqual('1005');

    expect(schemaListService.getSchemaDetailsBySchemaId).toHaveBeenCalledTimes(1);

    component.schemaListDetails = {moduleId: '1005',  schemaDescription: 'test', schemaThreshold: '100', schemaCategory: 'DATAQUALITY_VIEW'} as SchemaListDetails;
    component.schemaInfo.next(new SchemaListDetails());
    component.moduleListOb.next([{objectid: '1005', objectdesc: 'material'} as ObjectTypeResponse]);
    expect(component.form.get('moduleId').disabled).toBeTrue();

    routeParams.moduleId = '';
    routeParams.schemaId = '';
    component.ngOnInit();
    expect(component.getAllObjectType).toHaveBeenCalled();

  });

  it('should schemaField()', () => {
    component.initForm();
    expect(component.schemaField('moduleId')).toBeDefined();
  });

  it('should changedSchemaName', () => {
    component.initForm();
    component.changedSchemaName('test schema');
    expect(component.schemaField('schemaDescription').value).toEqual('test schema');
  });

  it('should close()', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);
  });

  it('should save', () => {
    spyOn(component, 'close');
    spyOn(schemaService, 'createUpdateSchema').and.returnValue(of('success'));

    component.initForm();
    component.save();
    expect(schemaService.createUpdateSchema).toHaveBeenCalled();
  });

  it('should getAllObjectType', () => {
    spyOn(schemaService, 'getAllObjectType').and.returnValue(of([]));
    component.getAllObjectType();
    expect(schemaService.getAllObjectType).toHaveBeenCalled();
  })


});
