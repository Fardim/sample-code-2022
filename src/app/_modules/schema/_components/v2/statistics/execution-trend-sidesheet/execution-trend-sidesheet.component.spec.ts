import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaListDetails } from '@models/schema/schemalist';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ExecutionTrendSidesheetComponent } from './execution-trend-sidesheet.component';

describe('ExecutionTrendSidesheetComponent', () => {
  let component: ExecutionTrendSidesheetComponent;
  let fixture: ComponentFixture<ExecutionTrendSidesheetComponent>;
  let router: Router;
  let schemaListService: SchemalistService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutionTrendSidesheetComponent ],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
      providers: [{
        provide: ActivatedRoute,
        useValue: { params: of({moduleId: '1005', schemaId: '1', variantId: '0'})}
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionTrendSidesheetComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
    schemaListService = fixture.debugElement.injector.get(SchemalistService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clode sidesheet', () => {

    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], {queryParamsHandling: 'preserve'});

  });

  it('should init component', () => {
    spyOn(schemaListService, 'getSchemaDetailsBySchemaId').withArgs('1').and.returnValue(of(new SchemaListDetails()));
    component.ngOnInit();

    expect(component.moduleId).toEqual('1005');
    expect(schemaListService.getSchemaDetailsBySchemaId).toHaveBeenCalledWith('1');
    expect(component.statsFilterParams.unit).toEqual('day');
    expect(component.statsFilterParams._date_filter_type).toEqual('this_month');
  })
  it('getSchemaDetails(), get schema details .. ', async(()=>{

    component.schemaId = '1';
    spyOn(schemaListService, 'getSchemaDetailsBySchemaId').withArgs(component.schemaId).and.returnValue(of(null));

    component.getSchemaDetails();
    expect(schemaListService.getSchemaDetailsBySchemaId).toHaveBeenCalledWith(component.schemaId);

  }));
});
