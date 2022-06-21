import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSortTableSettingsComponent } from './multi-sort-table-settings.component';
import { TableData } from '../table-data';

describe('MultiSortTableSettingsComponent', () => {
  let component: MultiSortTableSettingsComponent;
  let fixture: ComponentFixture<MultiSortTableSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiSortTableSettingsComponent ],
      imports: [AppMaterialModuleForSpec]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSortTableSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component._tableData = new TableData<any>([{id: 'firstName', name: 'First Name', isActive: false}]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
