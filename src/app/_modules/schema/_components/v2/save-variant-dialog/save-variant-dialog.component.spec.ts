import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveVariantDialogComponent } from './save-variant-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormInputComponent } from '@modules/shared/_components/form-input/form-input.component';
import { SchemaVariantsModel } from '@models/schema/schemalist';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { of } from 'rxjs';
import { SharedModule } from '@modules/shared/shared.module';

describe('SaveVariantDialogComponent', () => {
  let component: SaveVariantDialogComponent;
  let fixture: ComponentFixture<SaveVariantDialogComponent>;
  let schemaVariantServiceSpy : SchemaVariantService;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveVariantDialogComponent, FormInputComponent ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, { provide: MAT_DIALOG_DATA, useValue: {}
        },
        SchemaVariantService
      ],
      imports:[ MdoUiLibraryModule,
        HttpClientTestingModule, RouterTestingModule, AppMaterialModuleForSpec, SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveVariantDialogComponent);
    component = fixture.componentInstance;
    schemaVariantServiceSpy = fixture.debugElement.injector.get(SchemaVariantService);  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('variantNameChange(), changed variant name', async(() => {
    component.schemaVarInfo = {variantId:'876564', variantName:'test'} as SchemaVariantsModel;
    component.variantNameChange('Test');
    expect(component.schemaVarInfo.variantName).toEqual('Test');
  }));

  it('saveUpdateSchemaVariant(), Save update variants', async(() => {
    component.schemaVarInfo = {variantId:'876564', variantName:'test'} as SchemaVariantsModel;
    const res = '98675433';
    spyOn(schemaVariantServiceSpy,'saveUpdateSchemaVariant').withArgs([component.schemaVarInfo]).and.returnValue(of(res));
    component.saveUpdateSchemaVariant();
    expect(schemaVariantServiceSpy.saveUpdateSchemaVariant).toHaveBeenCalledWith([component.schemaVarInfo]);
  }));

  it('should init component', () => {
    component.data = null;
    component.ngOnInit();
    component.data = { schemaInfo: { schemaId: '123'} };
    component.ngOnInit();
    expect(component.schemaVarInfo.schemaId).toEqual('123');
  })

});
