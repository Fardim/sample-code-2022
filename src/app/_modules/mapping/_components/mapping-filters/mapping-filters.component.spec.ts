import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { MappingFiltersComponent } from './mapping-filters.component';

describe('MappingFiltersComponent', () => {
  let component: MappingFiltersComponent;
  let fixture: ComponentFixture<MappingFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingFiltersComponent ],
      imports: [AppMaterialModuleForSpec, MdoUiLibraryModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
