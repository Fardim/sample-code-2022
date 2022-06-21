import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MdoUiLibraryModule } from 'mdo-ui-library';

import { RelationDataSearchComponent } from './relation-data-search.component';

describe('RelationDataSearchComponent', () => {
  let component: RelationDataSearchComponent;
  let fixture: ComponentFixture<RelationDataSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelationDataSearchComponent ],
      imports: [ AppMaterialModuleForSpec,  MatMenuModule, MdoUiLibraryModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationDataSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
