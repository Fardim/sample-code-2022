import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'pros-payload-test-expansion-view',
  templateUrl: './payload-test-expansion-view.component.html',
  styleUrls: ['./payload-test-expansion-view.component.scss']
})
export class PayloadTestExpansionViewComponent implements OnInit {

  tableFormGroup: FormGroup;

  elementData = {};
  fieldInfo;

  tableData = [];
  tableDataSource;

  displayedColumns = ['columnName','value'];

  constructor(
    public dialogRef: MatDialogRef<PayloadTestExpansionViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
      this.elementData = data.elementTableRowData;
      this.fieldInfo = data?.fieldInfo;
   }

  ngOnInit(): void {
    this.tableData = Object.keys(this.elementData).map(keys => {
      return {
        columnName: this.getColumnName(keys),
        value: this.elementData[keys],
        fieldId: keys
      }
    })
    this.tableDataSource = new MatTableDataSource<any>(this.tableData);
  }

  getColumnName(keys) {
    return this.fieldInfo?.gridFieldValue?.find(field => field.fieldId === keys)?.fieldName || keys;
  }

  close() {
    this.dialogRef.close(this.tableDataSource.data);
  }
}
