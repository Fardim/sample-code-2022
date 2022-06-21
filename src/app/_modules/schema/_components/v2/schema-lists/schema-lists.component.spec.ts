import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaListModuleList } from '@models/schema/schemalist';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

import { SchemaListsComponent } from './schema-lists.component';

describe('SchemaListsComponent', () => {
  let component: SchemaListsComponent;
  let fixture: ComponentFixture<SchemaListsComponent>;
  let SchemaServiceSpy: SchemaService;
  let router: Router;

  const routeParams = {moduleId: ''};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaListsComponent, SkeletonLoaderComponent ],
      imports: [ MdoUiLibraryModule,  AppMaterialModuleForSpec, RouterTestingModule, SharedModule ],
      providers: [ SchemaService,
      {
        provide: ActivatedRoute,
        useValue: {params: of(routeParams)}
      }]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaListsComponent);
    component = fixture.componentInstance;
    SchemaServiceSpy = fixture.debugElement.injector.get(SchemaService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getSchemaList(),get schema list according to module ID', async(()=> {
    component.moduleId = '1005';
    spyOn(SchemaServiceSpy,'getSchemaInfoByModuleId').withArgs(component.moduleId).and.returnValue(of({} as SchemaListModuleList));
    component.moduleData = {
      moduleDesc: '',
      moduleId: '',
      schemaLists: []
    };
    component.getSchemaList();
    expect(SchemaServiceSpy.getSchemaInfoByModuleId).toHaveBeenCalledWith(component.moduleId);
  }));

  it('openSchemaInfo(), function to open schema Info', async(() => {
    component.moduleId = '1005';
    const schemaId = '18765654554'
    spyOn(router, 'navigate');
    component.openSchemaInfo(schemaId);
    expect(router.navigate).toHaveBeenCalledWith([`/home/schema/schema-info/${component.moduleId}/${schemaId}`]);
  }));

  it('openUploadSideSheet(), should open the Upload data side sheet', async () => {
    component.moduleId = '1005';
    component.outlet = 'sb'
    spyOn(router, 'navigate');
    component.openUploadSideSheet();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/schema/upload-data/${component.moduleId}/${component.outlet}` } }])
  });

  it('should init component', () => {
    component.moduleData = {
      moduleDesc: '',
      moduleId: '',
      schemaLists: []
    };
    spyOn(component, 'getModuleInfo');
    component.ngOnInit();

    routeParams.moduleId = '1005';
    component.ngOnInit();

    expect(component.moduleId).toEqual('1005');
    expect(component.getModuleInfo).toHaveBeenCalledTimes(1);

  });

  it('openScheduleSideSheet(), should open Execution Trend Sidesheet', async(() => {
    const schema: any = {
      schedulerId:'test'
    };
    const schemaId = 'test';
    spyOn(SchemaServiceSpy, 'getSchedule').and.returnValue(of(schema));;
    spyOn(router, 'navigate');
    component.openScheduleSideSheet(schemaId);
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/schema/schedule/${schemaId}/${schema.schedulerId}` } }]);
   }));
});
