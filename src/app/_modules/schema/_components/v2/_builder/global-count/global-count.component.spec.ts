import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalCounts } from '@models/schema/schemadetailstable';
import { SchemaService } from '@services/home/schema.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { GlobalCountComponent } from './global-count.component';

describe('GlobalCountComponent', () => {
  let component: GlobalCountComponent;
  let fixture: ComponentFixture<GlobalCountComponent>;
  let schemaService: SchemaService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GlobalCountComponent],
      imports: [HttpClientTestingModule, MdoUiLibraryModule, AppMaterialModuleForSpec],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    schemaService = fixture.debugElement.injector.get(SchemaService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges()', () => {
    // mock data
    const chnages: import('@angular/core').SimpleChanges = {
      schemaId: { currentValue: '7944828395059', previousValue: null, firstChange: null, isFirstChange: null },
    };

    spyOn(component, 'getGlobalCounts');

    // call actual method
    component.ngOnChanges(chnages);
    expect(component.ngOnChanges).toBeTruthy();
  });

  it(`getGlobalCounts(), get schema global count `, async(() => {
    component.globalCount = {
      successCount: 0,
      errorCount: 0,
      skippedCount: 0,
    };

    // mock response
    const response: GlobalCounts = {
      successCount: 32,
      errorCount: 0,
      skippedCount: 0,
    };

    component.schemaId = '7944828395059';

    spyOn(schemaService, 'getSchemaGlobalCounts')
      .withArgs(component.schemaId)
      .and.returnValue(of(response));

    component.getGlobalCounts();
    expect(schemaService.getSchemaGlobalCounts).toHaveBeenCalledWith(component.schemaId);
    expect(component.globalCount).toEqual(response);
  }));

  it(`getGlobalCounts(), get schema global count Error case`, async(() => {
    spyOn(schemaService, 'getSchemaGlobalCounts').and.returnValue(throwError({ message: 'api error' }));
     // api error
     spyOn(console, 'error');
     component.getGlobalCounts();
     expect(console.error).toHaveBeenCalled();
  }));
});
