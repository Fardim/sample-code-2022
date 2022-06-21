import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ActivatedRoute, Router } from '@angular/router';
import { MappingFiltersComponent } from '../mapping-filters/mapping-filters.component';

import { FieldMappingComponent} from './field-mapping.component';
import { FieldValueTransformationComponent } from '../field-value-transformation/field-value-transformation.component';
import { MappingData, MappingRequestBody, MdoFieldMapping, SaveMappingResponse } from '@models/mapping';
import { SharedModule } from '@modules/shared/shared.module';
import { SOURCE_FIELD, TARGET_FIELD } from '@modules/mapping/_common/utility-methods';
import { MappingService } from '@services/mapping/mapping.service';
import { of } from 'rxjs';
import { TransientService } from 'mdo-ui-library';
import { MappingWrapperComponent } from '../mapping-wrapper/mapping-wrapper.component';

describe('FieldMappingComponent', () => {
  let component: FieldMappingComponent;
  let fixture: ComponentFixture<FieldMappingComponent>;
  let router: Router;
  let mappingService: MappingService;
  let transientService: TransientService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FieldMappingComponent,
        MappingFiltersComponent,
        MappingFiltersComponent,
        FieldValueTransformationComponent,
        MappingWrapperComponent
      ],
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
              params: of({ moduleId: 199 , scenarioId: 2})
          }
      }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
    mappingService = fixture.debugElement.injector.get(MappingService);
    transientService = fixture.debugElement.injector.get(TransientService);
    component.locale = 'en';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sourceFields, should have an initial default value', () => {
    expect(component.sourceFields).toEqual([]);
  });

  it('targetFields, should have an initial default value', () => {
    expect(component.targetFields).toEqual([]);
  });

  it('existingMapping, should have an initial default value', () => {
    expect(component.existingMapping).toEqual([]);
  });

  it('close(), should navigate to the relative route', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: null } }]);
  });

  it('getSourceMapping(), should get source mapping list as Observable', async(done) => {
    const mdoFieldMapping = {
      fields: SOURCE_FIELD
    } as MdoFieldMapping;

    spyOn(mappingService, 'getMdoMappings').withArgs('en', 199).and.returnValue(of(mdoFieldMapping));

    component.getSourceMapping('en', 199).subscribe(res => {
      expect(res).toEqual(mdoFieldMapping.fields);
      done();
      expect(mappingService.getMdoMappings).toHaveBeenCalledWith('en', 199);
    });
  });

  it('getTargetMapping(), should get target mapping list as Observable', async(done) => {
    const response: MappingData = {
      acknowledge: true,
      errorMsg: '',
      response: {
        wsdlDetails: [],
        segmentMappings: TARGET_FIELD
      }
    };

    spyOn(mappingService, 'getExternalMappings').withArgs(2).and.returnValue(of(response));
    component.getTargetMapping(2).subscribe(res => {
      expect(res).toEqual(response.response.segmentMappings);
      expect(mappingService.getExternalMappings).toHaveBeenCalledWith(2);
      done();
    });
  });

  it('ngOnInit(), should call api to get the source and target data', () => {
    spyOn(component, 'getSourceMapping').withArgs('en', 199).and.returnValue(of(SOURCE_FIELD));
    spyOn(component, 'getTargetMapping').and.returnValue(of(TARGET_FIELD));
    component.ngOnInit();
    expect(component.getSourceMapping).toHaveBeenCalledWith('en', 199);
    expect(component.getTargetMapping).toHaveBeenCalled();
  });

  it('saveMapping(), should save the target data by calling the save api', () => {
    const request: MappingRequestBody = {
      wsdlDetails: [],
      segmentMappings: TARGET_FIELD
    };
    const resp: SaveMappingResponse = {
      acknowledge: true,
      errorMsg:    '',
      response:    ''
    }

    spyOn(mappingService, 'saveOrUpdateMapping').withArgs(request, 2).and.returnValue(of(resp));
    component.saveMapping(request);
    expect(mappingService.saveOrUpdateMapping).toHaveBeenCalledWith(request, 2);
  });

  it('saveMapping(), should show transient if required data is null', () => {
    spyOn(transientService, 'open').withArgs('Fields not mapped, map some fields to save them', 'Dismiss');
    spyOn(mappingService, 'saveOrUpdateMapping').withArgs(null, 2);
    spyOn(component, 'getTargetMapping');
    component.saveMapping(null);
    expect(transientService.open).toHaveBeenCalledWith('Fields not mapped, map some fields to save them', 'Dismiss');
    expect(mappingService.saveOrUpdateMapping).not.toHaveBeenCalled();
  });

  it('updateMappedTarget(), should create a body for save api', () => {
      component.externalMappingData = {
        acknowledge: true,
        errorMsg: '',
        response: {
          wsdlDetails: [],
          segmentMappings: []
        }
      }

      component.updateMappedTarget({ wsdlDetails: [], segmentMappings: TARGET_FIELD });
      expect(component.saveTargetMappings ).toEqual({ wsdlDetails: [], segmentMappings: TARGET_FIELD });
  });

  it('setBannerText(), should set banner text message', () => {
    component.setBannerText('Sample Text');
    expect(component.bannerText).toEqual('Sample Text');
  });
});
