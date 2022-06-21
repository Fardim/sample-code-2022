import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MatDialogRef } from '@angular/material/dialog';
import { PayloadTestTableComponent } from './payload-test-table.component';

describe('PayloadTestTableComponent', () => {
  let component: PayloadTestTableComponent;
  let fixture: ComponentFixture<PayloadTestTableComponent>;
  const mockDialogRef = { close: jasmine.createSpy('close'), open: jasmine.createSpy('open') };

  const tableDataObj = {
    newRow: false,
    tableData: [{
      column1: '',
      column2: '',
    }]
  };
  const displayedColumn = [
    { columnDef: '_select', header: '**' },
    { columnDef: 'column1', header: 'COLUMN1' },
    { columnDef: 'column2', header: 'COLUMN2' },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PayloadTestTableComponent],
      imports: [SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule],
      providers: [{ provide: MatDialogRef, useValue: mockDialogRef }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayloadTestTableComponent);
    component = fixture.componentInstance;
    component.tableData = tableDataObj.tableData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('addTableColumns, should initialize table columns', async(() => {
    component.addTableColumns();
    expect(component.tableColumns).toEqual(displayedColumn);
  }));

  it('patchValues,should added from control', () => {
    component.displayedColumns = displayedColumn;
    const formGroup = component.patchValues(tableDataObj.tableData);
    expect(formGroup).toBeDefined();
  });

  it('writeValue, should add value to tableData', () => {
    spyOn(component, 'addTableColumns');
    spyOn(component, 'addPayloadTestArray');
    component.writeValue(tableDataObj);
    expect(component.tableData).toEqual(tableDataObj.tableData);
    expect(component.addTableColumns).toHaveBeenCalled();
    expect(component.addPayloadTestArray).toHaveBeenCalled();
  });

  it('writeValue, should add new value to tableData', () => {
    tableDataObj.newRow = true;
    spyOn(component, 'setTableControlValue');
    component.writeValue(tableDataObj);
    expect(component.tableData).toEqual(tableDataObj.tableData);
    expect(component.payloadTableDataCtrl.value.newRow).toEqual(false);
    expect(component.setTableControlValue).toHaveBeenCalledWith({
      column1: '',
      column2: ''
    });
  });

  it('should isAllSelected', () => {
    component.tableDataSource = {
      data: [tableDataObj.tableData],
    };
    component.selection.selected.length = 1;
    const allSelected = component.isAllSelected();
    expect(allSelected).toBeTruthy();
  });
});
