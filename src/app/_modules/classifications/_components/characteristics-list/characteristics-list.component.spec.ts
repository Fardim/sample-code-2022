import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacteristicsListComponent } from './characteristics-list.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { RuleService } from '@services/rule/rule.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';


describe('CharacteristicsListComponent', () => {
  let component: CharacteristicsListComponent;
  let fixture: ComponentFixture<CharacteristicsListComponent>;
  let ruleService: RuleService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicsListComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicsListComponent);
    component = fixture.componentInstance;
    ruleService = fixture.debugElement.injector.get(RuleService);
    router = fixture.debugElement.injector.get(Router);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getCharacteristicsList()', () => {
    spyOn(component, 'getCharacteristicsList').and.callThrough();
    spyOn(ruleService, 'getCharacteristicsList').and.returnValue(of({ acknowledged: true }));
    component.getCharacteristicsList();
    expect(component.getCharacteristicsList).toHaveBeenCalled();
  });

  it('isChecked(), is checked ', async(() => {
    component.dataSource = [{ fieldType: 'TEXT', dataType: 'CHAR' }];
    expect(component.isChecked({ fieldType: 'TEXT' })).toEqual(false);
    expect(component.isChecked({ fieldType: 'NUMC' })).toBeFalse();
  }));

  it('isAllSelected(), should return all rows selected', () => {
    component.dataSource = new MatTableDataSource<any>([{ fieldType: 'TEXT', dataType: 'CHAR' }]);

    component.selection.selected.length = 1;
    component.selection.toggle({ fieldType: 'TEXT', dataType: 'CHAR' });
    const result = component.isAllSelected();
    expect(result).toBeTrue();
  });

  it('toggle()', () => {
    spyOn(component, 'toggle').and.callThrough();
    component.toggle({});
    expect(component.toggle).toHaveBeenCalled();
  })

  it('displayedRecordsRange()', () => {
    spyOn(ruleService, 'getCharacteristicsList').and.returnValues(of({}));
    component.totalCount = 7;
    expect(component.totalCount).toEqual(7);
    expect(component.displayedRecordsRange).toEqual('1 to 7 of 7');

    component.totalCount = 0;
    expect(component.displayedRecordsRange).toEqual('');
  });

  it('onPageChange(), should call getTableData with updated pagination', async(() => {
    const pageEvent = {
      pageIndex: 2,
      pageSize: 50,
      length: 100,
    };
    component.ngOnInit();
    component.onPageChange(pageEvent);
    expect(component.page).toBe(pageEvent.pageIndex);

    const result = component.onPageChange(pageEvent);
    expect(result).toBeFalsy();
  }));

  it('hasLimit()', () => {
    spyOn(component, 'hasLimit').and.callThrough();
    component.hasLimit(['1212', '121212']);
    expect(component.hasLimit).toHaveBeenCalled();
  });

  it('getLanguage', () => {
    spyOn(component, 'getLanguage').and.callThrough();
    component.getLanguage('en');
    expect(component.getLanguage).toHaveBeenCalled();

    component.getLanguage('es');
    expect(component.getLanguage).toHaveBeenCalled();

    component.getLanguage('ja');
    expect(component.getLanguage).toHaveBeenCalled();

    component.getLanguage('hi');
    expect(component.getLanguage).toHaveBeenCalled();

    component.getLanguage('');
    expect(component.getLanguage).toHaveBeenCalled();
  })

  it('getLabel', () => {
    spyOn(component, 'getLabel').and.callThrough();
    component.getLabel('charCode');
    expect(component.getLabel).toHaveBeenCalled();
  })

  it('edit(), should open edit sidesheet', () => {
    spyOn(router, 'navigate').and.callThrough();
    component.edit({});
    expect(router.navigate).toHaveBeenCalledWith(
      [
        {
          outlets: {
            sb: `sb/settings/classifications`,
            outer: `outer/characteristics/undefined/edit`
          },
        },
      ],
      {
        queryParamsHandling: 'preserve',
        state: { characteristics: {} }
      }
    );
  });

  it('masterToggle()', () => {
    spyOn(component, 'masterToggle').and.callThrough();
    component.dataSource = new MatTableDataSource<any>([{ fieldType: 'TEXT', dataType: 'CHAR' }]);

    component.masterToggle({ value: 'select_none' });
    expect(component.masterToggle).toHaveBeenCalled();

    component.masterToggle({ value: undefined });
    expect(component.masterToggle).toHaveBeenCalled();

    component.masterToggle({ value: 'select_this_page' });
    expect(component.masterToggle).toHaveBeenCalled();

    component.selectedPages = ['all'];
    component.masterToggle({ value: 'select_all_page' });
    expect(component.masterToggle).toHaveBeenCalled();
  });

  it('should call _classId set function ', () => {
    fixture.componentInstance.classId = '158b70f8-6099-428d-8d3f-a3505a2dbced';
    fixture.detectChanges();
    expect(component._classId).toBe('158b70f8-6099-428d-8d3f-a3505a2dbced');
  });

  it('should call _relatedDatasetId set function ', () => {
    fixture.componentInstance.relatedDatasetId = '158b70f8';
    fixture.detectChanges();
    expect(component._relatedDatasetId).toBe('158b70f8');
  });

  it('duplicate', () => {
    spyOn(component, 'duplicate').and.callThrough();
    component.duplicate({ uuid: '123', charCode: 'test' });
    expect(component.duplicate).toHaveBeenCalled();
  })

});
