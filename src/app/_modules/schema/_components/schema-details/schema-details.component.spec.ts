/* import { MdoUiLibraryModule } from 'mdo-ui-library';
import { SchemaDetailsComponent } from './schema-details.component';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '@modules/shared/_components/breadcrumb/breadcrumb.component';
import { OverviewChartComponent } from './overview-chart/overview-chart.component';
import { CategoriesChartComponent } from './categories-chart/categories-chart.component';
import { SchemaDatatableComponent } from './schema-datatable/schema-datatable.component';
import { SchemaStaticThresholdRes, SchemaListDetails } from '@models/schema/schemalist';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { ExecutionSummaryComponent } from './execution-summary/execution-summary.component';


describe('SchemaDetailsComponent', () => {
  let component: SchemaDetailsComponent;
  let fixture: ComponentFixture<SchemaDetailsComponent>;
  let schemaService: SchemaService;
  let schemaListService: SchemalistService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MdoUiLibraryModule,
        AppMaterialModuleForSpec,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [ SchemaDetailsComponent, BreadcrumbComponent, OverviewChartComponent,
        CategoriesChartComponent,
        SchemaDatatableComponent,
        ExecutionSummaryComponent
    ], providers:[
        SchemaService,
        SchemalistService
    ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaDetailsComponent);
    component = fixture.componentInstance;
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaListService = fixture.debugElement.injector.get(SchemalistService);
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
    res.threshold = 23.35;

    component.schemaId = '62546256563';
    component.variantId = '2736472637';


    spyOn(schemaService,'getSchemaThresholdStatics').withArgs(component.schemaId, component.variantId).and.returnValue(of(res));

    component.getSchemaThresholdStatics();

    expect(schemaService.getSchemaThresholdStatics).toHaveBeenCalledWith(component.schemaId, component.variantId);
    expect(component.thresholdRes.threshold).toEqual(Math.round((res.threshold + Number.EPSILON) * 100) / 100);
  }));

  it('ngOnInit(), load prerequired ', async(()=>{
    const res: SchemaStaticThresholdRes = new SchemaStaticThresholdRes();
    res.successCnt = 10;
    res.schemaId = '62546256563';
    res.thresHoldStatus = 'GOOD';
    res.threshold = 23.35;

    component.schemaId = '62546256563';
    component.variantId = '2736472637';


    spyOn(schemaService,'getSchemaThresholdStatics').withArgs('', undefined).and.returnValue(of(res));

    component.ngOnInit();

    expect(schemaService.getSchemaThresholdStatics).toBeTruthy();
  }));

  it('getSchemaDetailsBySchemaId(), get schema details by schema id ', async(() => {
    const res: SchemaListDetails = { schemaDescription: 'Testing schema ' } as SchemaListDetails;

    spyOn(schemaListService,'getSchemaDetailsBySchemaId').withArgs('5432564653').and.returnValue(of(res));
    component.getSchemaDetailsBySchemaId('5432564653');

    expect(schemaListService.getSchemaDetailsBySchemaId).toHaveBeenCalledWith('5432564653');
    expect(component.breadcrumb.heading).toEqual(res.schemaDescription + ' Details');
  }));
});
 */