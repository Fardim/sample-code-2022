import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaTileComponent } from './schema-tile.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbComponent } from 'src/app/_modules/shared/_components/breadcrumb/breadcrumb.component';
import { SubstringPipe } from 'src/app/_modules/shared/_pipes/substringpipe.pipe';
import { SchemaService } from '@services/home/schema.service';
import { SchemaStaticThresholdRes } from '@models/schema/schemalist';
import { of } from 'rxjs';
import { SchemaExecutionService } from '@services/home/schema/schema-execution.service';
import { SchemaExecutionRequest } from '@models/schema/schema-execution';
import { SharedModule } from '@modules/shared/shared.module';

describe('SchemaTileComponent', () => {
  let component: SchemaTileComponent;
  let fixture: ComponentFixture<SchemaTileComponent>;
  let schemaService: SchemaService;
  let schemaExecutionService: SchemaExecutionService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule,
        SharedModule
      ],
      declarations: [SchemaTileComponent, BreadcrumbComponent, SubstringPipe],
      providers:[
        SchemaService,
        SchemaExecutionService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaTileComponent);
    component = fixture.componentInstance;
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaExecutionService = fixture.debugElement.injector.get(SchemaExecutionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('getSchemaThresholdStatics(), get schema threshold static', async(()=>{
    // mock data
    const res: SchemaStaticThresholdRes = new SchemaStaticThresholdRes();
    res.successCnt = 10;
    res.schemaId = '35235235334634';
    res.thresHoldStatus = 'GOOD';
    res.threshold = 23.3534543523;

    component.schemaId = '62546256563';
    component.variantId = '2736472637';


    spyOn(schemaService,'getSchemaThresholdStatics').withArgs(component.schemaId, component.variantId).and.returnValue(of(res));

    component.getSchemaThresholdStatics();

    expect(schemaService.getSchemaThresholdStatics).toHaveBeenCalledWith(component.schemaId, component.variantId);
    expect(component.thresholdRes.threshold).toEqual(Math.round((res.threshold + Number.EPSILON) * 100) / 100);
  }));

  it('scheduleSchemaGetCnt(), get count while click schedule ', async(()=>{
    component.schemaId = '725646732';
    const expactedVal = 100;

    spyOn(schemaService, 'scheduleSchemaCount').withArgs(component.schemaId).and.returnValue(of(expactedVal));

    component.scheduleSchemaGetCnt();

    expect(component.runAllLebal).toEqual('Run all');
    expect(component.state).toEqual('readyForRun');
    expect(component.totalCount).toEqual(expactedVal);
    expect(schemaService.scheduleSchemaCount).toHaveBeenCalledWith(component.schemaId);
  }));

  it('scheduleSchema(), while click on schedule schema', async(()=>{
    component.schemaId = '2342352';
    const schemaExecutionReq: SchemaExecutionRequest = new SchemaExecutionRequest();
    schemaExecutionReq.schemaId =  component.schemaId;
    schemaExecutionReq.variantId = '0'; // 0 for run all
    const expactedRunId = 32254;
    const isRunWithCheckedData = false;
    spyOn(schemaExecutionService,'scheduleSChema').withArgs(schemaExecutionReq, isRunWithCheckedData).and.returnValue(of(expactedRunId));

    component.scheduleSchema();

    expect(component.state).toEqual('inRunning');
    expect(schemaExecutionService.scheduleSChema).toHaveBeenCalledWith(schemaExecutionReq, isRunWithCheckedData);

  }));

});
