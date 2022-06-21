
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SharedModule } from '@modules/shared/shared.module';
import { RuleService } from '@services/rule/rule.service';
import { TransientService } from 'mdo-ui-library';

import { CharacteristicsReorderComponent } from './characteristics-reorder.component';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

describe('CharacteristicsReorderComponent', () => {
  let component: CharacteristicsReorderComponent;
  let fixture: ComponentFixture<CharacteristicsReorderComponent>;
  let ruleService: RuleService;
  let transientService: TransientService;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicsReorderComponent],
      imports: [ReactiveFormsModule, AppMaterialModuleForSpec, HttpClientTestingModule, SharedModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: {}
        },
        TransientService,
        MatSnackBar,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicsReorderComponent);
    component = fixture.componentInstance;
    ruleService = fixture.debugElement.injector.get(RuleService);
    transientService = fixture.debugElement.injector.get(TransientService);
    const datasource = new MatTableDataSource<any>();
    datasource.data = ([{ fieldType: 'TEXT', charCode: 'CHAR' }]);
    component.dataSource = datasource;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), test prerequired ', async(() => {
    spyOn(component, 'ngOnInit').and.callThrough();
    const dialogData = {
      columns: ['action', 'charCode'],
      characteristicsDataSource: new MatTableDataSource([{ fieldType: 'TEXT', charCode: 'CHAR' }]),
      characteristicsFields: [{ id: 'charCode', name: 'name' },
      { id: 'charDesc', name: 'Language' }]
    };

    component.dialogData = dialogData;
    console.log(component.dialogData);
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();

  }));

  it('getLabel', () => {
    spyOn(component, 'getLabel').and.callThrough();
    component.characteristicsField = [{ id: 'charCode', name: 'name' },
    { id: 'charDesc', name: 'language' }];
    component.getLabel('charCode');
    expect(component.getLabel).toHaveBeenCalled();
  })

  it('drop()', async () => {
    spyOn(component, 'drop').and.callThrough();
    const previousContainers = { data: ['TEXT', 'CHAR'] } as CdkDropList<string[]>;
    const dropEvent = { previousIndex: 0, currentIndex: 1, container: previousContainers, previousContainer: previousContainers } as CdkDragDrop<string[]>;
    component.dataSource = new MatTableDataSource<any>();
    component.dataSource.data.push([{ fieldType: 'TEXT', charCode: 'CHAR' }]);
    component.drop(dropEvent);
    expect(component.drop).toHaveBeenCalled();

  });

  it('closeDialog() will call dialog service close function', async () => {
    spyOn(component, 'onCancelClick').and.callThrough();
    component.onCancelClick();
    expect(component.onCancelClick).toHaveBeenCalled();
  });

  it('save()', () => {
    const characteristicsDataSource = new MatTableDataSource<any>([{ fieldType: 'TEXT', charCode: 'CHAR' }]);
    spyOn(ruleService, 'reorderCharacteristicList').and.returnValue(of({ acknowledged: true }));
    spyOn(transientService, 'open').and.callThrough();
    component.dataSource = characteristicsDataSource;
    component.save();
    expect(transientService.open).toHaveBeenCalled();
  });

  it('hasLimit()', () => {
    spyOn(component, 'hasLimit').and.callThrough();
    component.hasLimit(['1212', '121212']);
    expect(component.hasLimit).toHaveBeenCalled();
  });

  it('getLanguage', () => {
    spyOn(component, 'getLanguage').and.callThrough();
    component.getLanguage('en');
    expect(component.getLanguage).toHaveBeenCalled();
  });
});
