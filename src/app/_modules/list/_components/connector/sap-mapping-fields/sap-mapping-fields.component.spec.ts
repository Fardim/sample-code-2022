import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SapMappingFieldsComponent } from './sap-mapping-fields.component';
import { SharedModule } from '@modules/shared/shared.module';
import { StructureLevelConfigComponent } from '../structure-level-config/structure-level-config.component';

describe('SapMappingFieldsComponent', () => {
  let component: SapMappingFieldsComponent;
  let fixture: ComponentFixture<SapMappingFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapMappingFieldsComponent, StructureLevelConfigComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SapMappingFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
