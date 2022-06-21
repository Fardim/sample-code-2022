import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldMetaData } from '@models/core/coreModel';
import { FieldControlType } from '@models/list-page/listpage';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { InlineTableColumnFilterComponent } from './inline-table-column-filter.component';

describe('InlineTableColumnFilterComponent', () => {
  let component: InlineTableColumnFilterComponent;
  let fixture: ComponentFixture<InlineTableColumnFilterComponent>;
  let coreService: CoreService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineTableColumnFilterComponent ],
      imports: [ AppMaterialModuleForSpec,  SharedModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineTableColumnFilterComponent);
    component = fixture.componentInstance;

    coreService = fixture.debugElement.injector.get(CoreService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges(), ngonchange component hooks ', async(()=>{

    spyOn(component, 'getFldMetadata');

    let changes = {
      fieldId:{
        currentValue:'region',
        firstChange:true,
        isFirstChange:null,
        previousValue:null
      }
    } as SimpleChanges;

    component.ngOnChanges(changes);

    changes = {} as SimpleChanges;
    component.ngOnChanges(changes);

    expect(component.getFldMetadata).toHaveBeenCalledTimes(1);

    }));

    it('should getFldMetadata', () => {

      component.getFldMetadata(null);

      const response = [{
            fieldId: 'name',
            fieldDescri: 'name'
      }] as FieldMetaData[];

      spyOn(coreService, 'getMetadataByFields')
        .and.returnValues(of(response), throwError({message: 'api error'}));


      component.getFldMetadata('name');
      expect(coreService.getMetadataByFields).toHaveBeenCalled();
      expect(component.fieldMetaData).toEqual(response[0]);


      // api error
      spyOn(console, 'error');
      component.getFldMetadata('name');
      expect(console.error).toHaveBeenCalled();

    });

    it('should getFieldControlType', () => {

      component.fieldMetaData = {
        fieldId: 'TEXT', picklist:'0', dataType:'CHAR'
      } as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.TEXT);

      component.fieldMetaData = {
        fieldId: 'PASS', picklist:'0', dataType:'PASS'
      } as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.PASSWORD);


      component.fieldMetaData = {
        fieldId: 'EMAIL', picklist:'0', dataType:'EMAIL'
      } as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.EMAIL);


      component.fieldMetaData = {
        fieldId: 'TEXT_AREA', picklist:'22', dataType:'CHAR'
      } as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.TEXT_AREA);


      component.fieldMetaData = {
        fieldId: 'NUMBER', picklist:'0', dataType:'NUMC'
      } as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.NUMBER);


      component.fieldMetaData = {
        fieldId: 'MULTI_SELECT', picklist:'1', isMultiselect:'true'
      } as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.MULTI_SELECT);


      component.fieldMetaData = {
        fieldId: 'SINGLE_SELECT', picklist:'1', isMultiselect:'false'
      } as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.SINGLE_SELECT);


      component.fieldMetaData = {
        fieldId: 'DATS', picklist:'0', dataType:'DATS'
      } as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.DATE);


      component.fieldMetaData = {
        fieldId: 'TIMS', picklist:'0', dataType:'TIMS'
      } as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.TIME);


      component.fieldMetaData = {} as FieldMetaData;
      expect(component.fieldControlType).toEqual(FieldControlType.TEXT);

    });
});
