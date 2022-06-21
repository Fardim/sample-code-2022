import { SelectionModel } from '@angular/cdk/collections';
import { Component, forwardRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import FormField from '@models/form-field';
import { PayloadTestExpansionViewComponent } from '../payload-test-expansion-view/payload-test-expansion-view.component';

@Component({
  selector: 'pros-payload-test-table',
  templateUrl: './payload-test-table.component.html',
  styleUrls: ['./payload-test-table.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PayloadTestTableComponent),
    },
  ],
})
export class PayloadTestTableComponent extends FormField implements OnInit {
  gridData = [];
  gridDataSource;

  gridColumns = [];

  displayGridColumns = [];
  selection = new SelectionModel<any>(true, []);

  @ViewChild(MatTable) table: MatTable<any>;

  payloadGridFormGroup = new FormGroup({
    newRow: new FormControl(false),
    tableData: new FormArray([])
  })

  gridFieldInfo;

  constructor(private fb: FormBuilder,private matDialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.payloadGridFormGroup.valueChanges.subscribe((data) => {
      this.gridFieldInfo.gridRowValue = [...data.tableData];
      this.onChange(this.gridFieldInfo);
    })
  }

  addGridColumns(gridFieldValue) {
    this.gridColumns = [{
      columnDef: '_select',
      header: '**'
    }];
    gridFieldValue.map(field => {
      this.gridColumns = [
        ...this.gridColumns,
        {
          columnDef: field?.fieldId,
          header: field?.fieldName
        }
      ]
    });
    this.displayGridColumns = this.gridColumns.map((c) => c.columnDef);
  }

  addGridRowsValue(gridFieldValue) {
    gridFieldValue.forEach(field => {
      this.setGridControlValue(field);
    });
  }

  setGridControlValue(field) {
    const arrayControl = this.payloadGridFormGroup.get('tableData') as FormArray;
    arrayControl.push(this.patchGridValues(field));
  }

  patchGridValues(fieldValue) {
    const fieldValueGroup = {};
    const dataKeys = Object.keys(fieldValue);
    this.displayGridColumns.map((columnDef) => {
      dataKeys.map((key) => {
        if (columnDef === key) {
          fieldValueGroup[key] = fieldValue[key] ? fieldValue[key] : '';
        }
      });
    });
    return this.fb.group(fieldValueGroup);
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.gridDataSource.data.forEach((row) => this.selection.select(row));
  }

  writeValue(value: any) {
    if (value?.fieldId) {
      if (!this.gridFieldInfo) {
        this.gridFieldInfo = value;
      }
      this.gridData = value?.gridRowValue;
      if ((this.gridData.length !== 0 ) && this.payloadGridFormGroup.value.tableData.length === 0) {
        if (value?.childFieldDetails?.length) {
          this.addGridColumns(value.gridFieldValue);
          this.addGridRowsValue(value.gridRowValue);
        }
      } else if(value.newRow) {
        const newTableElement = this.gridData[0];
        Object.keys(newTableElement).forEach(key => newTableElement[key]='');
        this.gridData.push(newTableElement);
        this.payloadGridFormGroup.get('newRow').patchValue(false);
        this.setGridControlValue(newTableElement);
      }

      this.gridDataSource = new MatTableDataSource<any>(this.gridData);
    }
  }

  duplicateRow(index) {
    const arrayControl = this.payloadGridFormGroup.get('tableData') as FormArray;
    const selectedRowValue = arrayControl.at(index).value;
    arrayControl.insert(index + 1, this.patchGridValues(selectedRowValue));
    this.gridData.splice(index + 1, 0, selectedRowValue);
    this.gridDataSource = new MatTableDataSource<any>(this.gridData);
  }

  deleteRow(index) {
    const arrayControl = this.payloadGridFormGroup.get('tableData') as FormArray;
    arrayControl.removeAt(index);
    this.gridData.splice(index, 1);
    this.gridDataSource = new MatTableDataSource<any>(this.gridData);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.gridDataSource.data.length;
    return numSelected === numRows;
  }

  openGridExpansionViewDialog(i) {
    const control = this.payloadGridFormGroup.get('tableData') as FormArray;
    const dialogRef = this.matDialog.open(PayloadTestExpansionViewComponent, {
      width: '800px',
      height: '600px',
      panelClass: 'new-connection-dialog',
      data: {
        fieldInfo: this.gridFieldInfo,
        elementTableRowData: control.at(i).value
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const resultData = {};
        result.map(data => {
          resultData[data.fieldId] = data.value
        })
        control.at(i).patchValue(resultData);
      }
    });
  }
}
