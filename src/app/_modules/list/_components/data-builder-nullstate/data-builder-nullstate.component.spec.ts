import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { DataBuilderNullstateComponent } from './data-builder-nullstate.component';

describe('DataBuilderNullstateComponent', () => {
  let component: DataBuilderNullstateComponent;
  let fixture: ComponentFixture<DataBuilderNullstateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataBuilderNullstateComponent ],
      imports: [AppMaterialModuleForSpec, MdoUiLibraryModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataBuilderNullstateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
