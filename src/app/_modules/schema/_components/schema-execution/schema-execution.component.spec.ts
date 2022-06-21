import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaExecutionComponent } from './schema-execution.component';
import { BreadcrumbComponent } from 'src/app/_modules/shared/_components/breadcrumb/breadcrumb.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemalistService } from 'src/app/_services/home/schema/schemalist.service';
import { of } from 'rxjs';
import { SchemaListDetails } from 'src/app/_models/schema/schemalist';
import { SchemaExecutionRequest } from '@models/schema/schema-execution';
import { SchemaExecutionService } from '@services/home/schema/schema-execution.service';
import { Router } from '@angular/router';
import { SharedModule } from '@modules/shared/shared.module';

describe('SchemaExecutionComponent', () => {
  let component: SchemaExecutionComponent;
  let fixture: ComponentFixture<SchemaExecutionComponent>;
  let schemaListServiceSpy: SchemalistService;
  let schenaexecutionSpy: SchemaExecutionService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule, RouterTestingModule, SharedModule],
      declarations: [ SchemaExecutionComponent, BreadcrumbComponent ],
      providers: [ SchemalistService, SchemaExecutionService ]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaExecutionComponent);
    component = fixture.componentInstance;
    schemaListServiceSpy = fixture.debugElement.injector.get(SchemalistService);
    schenaexecutionSpy = fixture.debugElement.injector.get(SchemaExecutionService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getSchemaDetail() , should invoke for get schema details by schema id ', async(()=>{
    const schemaId = '87365726767288';
    const schemalist: SchemaListDetails = new SchemaListDetails();
    component.schemaId = schemaId;
    spyOn(schemaListServiceSpy, 'getSchemaDetailsBySchemaId').withArgs(schemaId).and.returnValue(of(schemalist));
    component.getSchemaDetail(component.schemaId);
    expect(schemaListServiceSpy.getSchemaDetailsBySchemaId).toHaveBeenCalledWith(schemaId);
  }));

  it('scheduleSchema() , should invoke for get schema details by schema id ', async(()=>{
    const schemaId = '87365726767288';
    component.schemaId = schemaId;
    const schemaExecutionReq: SchemaExecutionRequest = new SchemaExecutionRequest();
    schemaExecutionReq.schemaId = component.schemaId;
    schemaExecutionReq.variantId = '0';
    const data = {} as any;
    const isRunWithCheckedData = false;
    spyOn(schenaexecutionSpy, 'scheduleSChema').withArgs(schemaExecutionReq, isRunWithCheckedData).and.returnValue(of(data));
    spyOn(router, 'navigate');
    component.scheduleSchema();
    expect(schenaexecutionSpy.scheduleSChema).toHaveBeenCalledWith(schemaExecutionReq, isRunWithCheckedData);
    expect(router.navigate).toHaveBeenCalledWith(['/home/schema']);
  }));

  it('ngOnInit(), loaded pre required', async(()=>{
    spyOn(schemaListServiceSpy,'getSchemaDetailsBySchemaId').withArgs(component.schemaId).and.returnValue(of());
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
    expect(schemaListServiceSpy.getSchemaDetailsBySchemaId).toHaveBeenCalledWith(component.schemaId);
  }));
});
