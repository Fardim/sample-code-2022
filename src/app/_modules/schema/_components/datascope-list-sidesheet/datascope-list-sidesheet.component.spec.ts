import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { VariantDetails } from '@models/schema/schemalist';
import { SharedModule } from '@modules/shared/shared.module';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of, throwError } from 'rxjs';

import { DatascopeListSidesheetComponent } from './datascope-list-sidesheet.component';

describe('DatascopeListSidesheetComponent', () => {
  let component: DatascopeListSidesheetComponent;
  let fixture: ComponentFixture<DatascopeListSidesheetComponent>;
  let router: Router;
  let schemaVariantsService: SchemaVariantService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatascopeListSidesheetComponent ],
      imports: [
        MdoUiLibraryModule,
        RouterTestingModule,
        HttpClientTestingModule,
        SharedModule,
        BrowserAnimationsModule
      ],
      providers: [{
        GlobaldialogService,
        provide: ActivatedRoute,
        useValue: {params: of({moduleId: '1005', schemaId: '123'})}
      }]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatascopeListSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    schemaVariantsService = fixture.debugElement.injector.get(SchemaVariantService);
  });

  it('should create', () => {
    component.schemaId = '123';
    expect(component).toBeTruthy();
  });

  it('getSchemaVariants()', async(() => {
    const res: VariantDetails[] = [];
    res.push(new VariantDetails());
    res[0].variantId = '123';
    res[0].variantName = 'Test';
    spyOn(schemaVariantsService, 'getDataScopesList').and.returnValue(of(res));

    component.getSchemaVariants('123', 'RUNFOR', 0);
    expect(component.variantsList.length).toEqual(1);
    expect(schemaVariantsService.getDataScopesList).toHaveBeenCalled();

    component.getSchemaVariants('123', 'RUNFOR', 1);
    expect(component.variantsList.length).toEqual(2);
  }));

  it('getSchemaVariants(), api failure', async(() => {
    spyOn(schemaVariantsService, 'getDataScopesList').and.returnValue(throwError({message: 'error'}));
    component.getSchemaVariants('123', '', 0, 10);

    expect(component.variantsList.length).toEqual(0);
  }));

  it('updateVariantsList()', async(() => {
    component.schemaId = '123';
    component.pageNo = 0;
    spyOn(component, 'getSchemaVariants');

    component.updateVariantsList();
    expect(component.getSchemaVariants).toHaveBeenCalled();

    component.schemaId = undefined;
    component.updateVariantsList();
  }));

  it('editDataScope()', async(() => {
    component.datascopeSheetState = {
      openedFrom: 'schemaInfo',
      listSheet: true,
      editSheet: false
    };
    expect(component.editDataScope('123')).toBeUndefined();
  }));

  it('deleteVariant()', async(() => {
    expect(component.deleteVariant('123')).toBeUndefined();
  }));

  it('deleteVariantAfterConfirm()', async(() => {
    spyOn(schemaVariantsService, 'deleteVariant').and.returnValue(of(true));
    component.deleteVariantAfterConfirm('yes', '123');

    expect(schemaVariantsService.deleteVariant).toHaveBeenCalled();

    component.variantsList = [new VariantDetails()];
    component.variantsList[0].variantId = '123';
    component.deleteVariantAfterConfirm('yes', '123')
    expect(component.variantsList.length).toEqual(0);

    expect(component.deleteVariantAfterConfirm('no', null)).toBeUndefined();
  }));

  it('deleteVariantAfterConfirm(), api empty response', async(() => {
    spyOn(schemaVariantsService, 'deleteVariant').and.returnValue(of(false));
    component.deleteVariantAfterConfirm('yes', '123');

    expect(component.variantsList.length).toEqual(0);
    expect(schemaVariantsService.deleteVariant).toHaveBeenCalled();
  }));

  it('deleteVariantAfterConfirm(), api fail case', async(() => {
    spyOn(schemaVariantsService, 'deleteVariant').and.returnValue(throwError({message: 'error'}));
    component.deleteVariantAfterConfirm('yes', '123');

    expect(schemaVariantsService.deleteVariant).toHaveBeenCalled();
  }));

  it('close()', async(() => {
    spyOn(router, 'navigate');
    component.datascopeSheetState = {
      openedFrom: 'schemaInfo',
      listSheet: true,
      editSheet: false
    };
    component.close();

    expect(router.navigate).toHaveBeenCalled();
  }));
});
