
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FieldMetaData } from '@models/core/coreModel';
import { FieldControlType, FilterCriteria, ListPageFilters } from '@models/list-page/listpage';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ListFilterComponent } from './list-filter.component';

describe('ListFilterComponent', () => {
  let component: ListFilterComponent;
  let fixture: ComponentFixture<ListFilterComponent>;
  let coreService: CoreService;
  let router: Router;
  const pathPrams = { moduleId: '4' };
  const queryParams = { f: '' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListFilterComponent],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [{ provide: ActivatedRoute, useValue: { params: of(pathPrams), queryParams: of(queryParams) } }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFilterComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    router = TestBed.inject(Router);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should getModuleFldMetadata', () => {
    expect(() => component.getModuleFldMetadata()).toThrowError('Module id cant be null or empty');

    const response = [
      { fieldDescri: 'Material Type', dataType: 'CHAR', picklist: '1', maxChar: '50', strucId: '1', fieldId: 'MATL_TYPE4' },
    ];

    component.moduleId = '4';
    spyOn(coreService, 'getMetadataByFields').and.returnValues(of(response), of(response), of([]), throwError({ message: 'api error' }));

    component.getModuleFldMetadata(true);
    expect(coreService.getMetadataByFields).toHaveBeenCalledWith(
      component.moduleId,
      component.fieldsPageIndex,
      component.fieldsSearchString,
      20,
      component.locale
    );
    expect(JSON.stringify(component.moduleFieldsMetatdata)).toEqual(JSON.stringify(response));

    // load more
    component.getModuleFldMetadata(true);
    expect(coreService.getMetadataByFields).toHaveBeenCalledWith(component.moduleId, 1, component.fieldsSearchString, 20, component.locale);
    expect(component.moduleFieldsMetatdata.length).toEqual(2);

    // load more empty response
    component.getModuleFldMetadata(true);
    expect(coreService.getMetadataByFields).toHaveBeenCalledWith(component.moduleId, 2, component.fieldsSearchString, 20, component.locale);
    expect(component.moduleFieldsMetatdata.length).toEqual(2);
    expect(component.fieldsPageIndex).toEqual(2);

    // api error
    spyOn(console, 'error');
    component.getModuleFldMetadata();
    expect(console.error).toHaveBeenCalled();
  });

  it('should getfilterFieldsMetadata', () => {
    component.getfilterFieldsMetadata([]);

    const response = [
      { fieldDescri: 'Material Type', dataType: 'CHAR', picklist: '1', maxChar: '50', strucId: '1', fieldId: 'MATL_TYPE4' },
    ];
    component.moduleId = '4';
    spyOn(coreService, 'getMetadataByFields')
      .withArgs(component.moduleId, 0, '', 20, 'en')
      .and.returnValues(of(response), throwError({ message: 'api error' }));

    component.getfilterFieldsMetadata(['name']);
    expect(coreService.getMetadataByFields).toHaveBeenCalledWith(component.moduleId, 0, '', 20, 'en');
    expect(JSON.stringify(component.filterFieldsMetadata)).toEqual(JSON.stringify(response));

    // api error
    spyOn(console, 'error');
    component.getfilterFieldsMetadata(['name']);
    expect(console.error).toHaveBeenCalled();
  });

  it('should close sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], { queryParams: {} });

    component.filtersList.filterCriteria.push({ fieldId: 'MTL_TYPE', values: ['pen'] } as FilterCriteria);
    const filters = btoa(JSON.stringify(component.filtersList));
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }], { queryParams: { f: filters } });
  });

  it('should applyFilter', () => {
    component.activeFilter = new FilterCriteria();
    component.activeFilter.fieldId = 'MTL_GROUP';

    component.applyFilter();
    component.applyFilter();
    expect(component.filtersList.filterCriteria.length).toEqual(1);
  });

  it('should upsertFilter', () => {
    component.moduleFieldsMetatdata = [{ fieldId: 'MTL_GROUP', fieldDescri: 'Material groupe' }] as FieldMetaData[];

    component.upsertFilter('MTL_GROUP');
    expect(component.activeFilter.fieldId).toEqual('MTL_GROUP');

    component.applyFilter();
    component.filtersList.filterCriteria[0].values = ['grp1'];
    component.upsertFilter('MTL_GROUP');
    expect(component.activeFilter.values).toEqual(['grp1']);
  });

  it('should getFieldDescription', () => {
    expect(component.getFieldDescription('any')).toEqual('Unknown');

    component.moduleFieldsMetatdata = [{ fieldId: 'MTL_GRP', fieldDescri: 'Material groupe' }] as FieldMetaData[];

    expect(component.getFieldDescription('MTL_GRP')).toEqual('Material groupe');
  });

  it('should updateFilterValue', () => {
    component.activeFilter = new FilterCriteria();
    component.updateFilterValue('new value');
    expect(component.activeFilter.values).toEqual(['new value']);
  });

  it('should init component', fakeAsync(() => {
    spyOn(component, 'getfilterFieldsMetadata');
    spyOn(component, 'getModuleFldMetadata');

    component.ngOnInit();

    expect(component.moduleId).toEqual('4');
    expect(component.filtersList).toEqual(new ListPageFilters());

    const filters = new ListPageFilters();
    filters.filterCriteria.push({ fieldId: 'region', values: ['TN'] } as FilterCriteria);

    queryParams.f = btoa(JSON.stringify(filters));
    component.ngOnInit();
    expect(component.filtersList.filterCriteria[0].fieldId).toEqual('region');

    component.searchFieldSub.next('material');
    tick(1000);
    expect(component.suggestedFilters.length).toEqual(0);
  }));

  it('should getFieldControlType', () => {
    component.moduleFieldsMetatdata = [
      { fieldId: 'TEXT', picklist: '0', dataType: 'CHAR' },
      { fieldId: 'PASS', picklist: '0', dataType: 'PASS' },
      { fieldId: 'EMAIL', picklist: '0', dataType: 'EMAIL' },
      { fieldId: 'TEXT_AREA', picklist: '22', dataType: 'CHAR' },
      { fieldId: 'NUMBER', picklist: '0', dataType: 'NUMC' },
      { fieldId: 'MULTI_SELECT', picklist: '30', dataType: 'CHAR', isMultiselect: 'true' },
      { fieldId: 'SINGLE_SELECT', picklist: '30', dataType: 'CHAR', isMultiselect: 'false' },
      { fieldId: 'DATS', picklist: '0', dataType: 'DATS' },
      { fieldId: 'TIMS', picklist: '0', dataType: 'TIMS' },
    ] as FieldMetaData[];

    expect(component.getFieldControlType('TEXT')).toEqual(FieldControlType.TEXT);
    expect(component.getFieldControlType('PASS')).toEqual(FieldControlType.PASSWORD);
    expect(component.getFieldControlType('EMAIL')).toEqual(FieldControlType.EMAIL);
    expect(component.getFieldControlType('TEXT_AREA')).toEqual(FieldControlType.TEXT_AREA);
    expect(component.getFieldControlType('NUMBER')).toEqual(FieldControlType.NUMBER);
    expect(component.getFieldControlType('MULTI_SELECT')).toEqual(FieldControlType.MULTI_SELECT);
    expect(component.getFieldControlType('SINGLE_SELECT')).toEqual(FieldControlType.SINGLE_SELECT);
    expect(component.getFieldControlType('DATS')).toEqual(FieldControlType.DATE);
    expect(component.getFieldControlType('TIMS')).toEqual(FieldControlType.TIME);
    expect(component.getFieldControlType('default')).toEqual(FieldControlType.TEXT);
  });
});
