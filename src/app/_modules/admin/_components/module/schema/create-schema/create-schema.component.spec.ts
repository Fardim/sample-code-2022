import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule, FormGroup, FormArray } from '@angular/forms';
import { CreateSchemaComponent } from './create-schema.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaService } from 'src/app/_services/home/schema.service';
import { SchemalistService } from 'src/app/_services/home/schema/schemalist.service';
import { SchemaListDetails } from 'src/app/_models/schema/schemalist';
import { of } from 'rxjs';
import { CoreSchemaBrInfo, Category, CreateUpdateSchema } from '../../business-rules/business-rules.modal';
import { ObjectTypeResponse } from '@models/schema/schema';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { SharedModule } from '@modules/shared/shared.module';


describe('CreateSchemaComponent', () => {
  let component: CreateSchemaComponent;
  let fixture: ComponentFixture<CreateSchemaComponent>;
  let service: SchemaService;
  let schemaListService: SchemalistService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSchemaComponent ],
      imports:[
        HttpClientTestingModule, AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule,
        RouterTestingModule, SharedModule
      ],
      providers:[
        SchemaService, SchemalistService
      ]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSchemaComponent);
    component = fixture.componentInstance;
    service = fixture.debugElement.injector.get(SchemaService);
    schemaListService = fixture.debugElement.injector.get(SchemalistService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), loaded pre required', async(()=>{
    component.ngOnInit();
    expect(component.dynCategoryFrmGrp.get('categories')).toBeTruthy();
  }));

  it('getSchemaData(), should call service for get schema details',async(()=>{
    // mock data
    const schemaId = '23472538';
    const schemaList: SchemaListDetails = new SchemaListDetails();
    component.schemaId = schemaId;
    spyOn(schemaListService, 'getSchemaDetailsBySchemaId').withArgs(schemaId).and.returnValue(of(schemaList));

    component.getSchemaData();

    expect(schemaListService.getSchemaDetailsBySchemaId).toHaveBeenCalledWith(schemaId);
  }));

  it('getCategoriesData(), get all categories', async(()=>{
    spyOn(service,'getAllCategoriesList').and.returnValue(of([]));

    component.getCategoriesData();

    expect(service.getAllCategoriesList).toHaveBeenCalledTimes(1);
  }));

  it('getBusinessRulesData(), get all business rules', async(()=>{
    const schemaId = '23472538';
    component.schemaId = schemaId;

    component.dynCategoryFrmGrp = new FormGroup({
      categories: new FormArray([])
    });

    spyOn(service, 'getBusinessRulesBySchemaId').withArgs(schemaId).and.returnValue(of([]));

    component.getBusinessRulesData();

    expect(service.getBusinessRulesBySchemaId).toHaveBeenCalledWith(schemaId);
  }));

  it('checkIsEmptycategoryAssigned(), check is category empty', async(()=>{
    component.categoryBrMap = null;
    const status =  component.checkIsEmptycategoryAssigned();
    expect(status).toEqual(false);
  }));

  it('addCategory(), add category', async(()=>{
    // mock data
    component.dynCategoryFrmGrp = new FormGroup({
      categories: new FormArray([])
    });

    component.addCategory();
    const array = component.dynCategoryFrmGrp.controls.categories as FormArray
    expect(array.length).toEqual(1);
  }));

  it('removeCategory(), remove category', async(()=>{
    component.dynCategoryFrmGrp = new FormGroup({
      categories: new FormArray([])
    });
    component.addCategory();
    component.removeCategory(0);
    const array = component.dynCategoryFrmGrp.controls.categories as FormArray
    expect(array.length).toEqual(0);
  }));

  it('afterSavedBrinfo(), after saved br info', async(()=>{
    // mock data
    const brIno: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    brIno.brId = '2735467235';

    component.brList = [];
    component.afterSavedBrinfo(brIno);

    expect(component.brList.length).toEqual(1);
  }));

  it('categoryDisplayWith(), return category description', async(()=>{
    const cat: Category = new Category();
    cat.categoryId = '623545281';
    cat.categoryDesc = 'Validness';

    const actualval = component.categoryDisplayWith(cat);

    expect(actualval).toEqual(cat.categoryDesc);


  }));

  it('updateCategoryId(), update category id ', async(()=>{

    // mock data
    const br1 = new CoreSchemaBrInfo();
    br1.brIdStr = '23627';
    component.brList = [br1];

    component.updateCategoryId('7235764823', '23627');

    expect(component.brList[0].categoryId).toEqual('7235764823');

  }));

  it('createUpdateSchema(), test create update schema', async(()=>{
    component.dynCategoryFrmGrp = new FormGroup({
      categories: new FormArray([])
    });

    const request: CreateUpdateSchema = new CreateUpdateSchema();
    request.moduleId = component.moduleId;
    request.discription = component.schemaName;
    request.schemaId = component.schemaId;
    request.brs = component.brList;
    request.schemaThreshold = component.schemaThresholdCtrl.value;

    spyOn(service,'createUpdateSchema').withArgs(request).and.returnValue(of(component.schemaId));

    component.createUpdateSchema();

    expect(service.createUpdateSchema).toBeTruthy();
  }));

  it('removeMappedBr(), should remove br mapped with categories', async(()=>{
    const br: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    br.brIdStr = '7324725857';

    component.categoryBrMap[0] = [br];

    expect(component.categoryBrMap[0].length).toEqual(1);
    component.removeMappedBr(br, 0);

    expect(component.categoryBrMap[0].length).toEqual(0);

  }));

  it('deleteBr(), should call http for delete', async(()=>{
    const brid = '332526634';
    const br: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    br.brIdStr = brid;

    component.brList = [br];

    component.categoryBrMap = {0:[br]};

    spyOn(service,'deleteBr').withArgs(brid).and.returnValue(of(true));

    component.deleteBr(brid);

    expect(service.deleteBr).toHaveBeenCalledWith(brid);

    expect(component.brList.length).toEqual(0, 'After remove br length should be 0');

  }));

  it('brWightageChange(), business rule weigthage change', async(()=>{
    const br: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    br.brIdStr = '723567';

    component.brList = [br];
    component.brWightageChange(br, '20');

    expect(component.brList[0].brWeightage).toEqual('20');
  }));

  it('displayFn(), test display fn', async(()=>{
    const objectType: ObjectTypeResponse = new ObjectTypeResponse();
    objectType.objectdesc = 'MAterial Desc';

    expect(component.displayFn(objectType)).toEqual(objectType.objectdesc);
  }));

  it('selectModule(), after select module', async(()=>{
    const objectType: ObjectTypeResponse = new ObjectTypeResponse();
    objectType.objectdesc = 'MAterial Desc';
    objectType.objectid ='1005';

    const event: MatAutocompleteSelectedEvent = {option:{value:{objectType}}} as MatAutocompleteSelectedEvent;

    component.selectModule(event);
    expect(component.moduleId).toEqual(undefined);

  }));

  it('navigateToListPage(), nab=vigate to schema list page ', async(() => {
    spyOn(router, 'navigate');
    component.navigateToListPage();
    expect(router.navigate).toHaveBeenCalledWith(['/home/schema']);
  }))
});
