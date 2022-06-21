import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
export class DataList {
  objectId: string;
  objectDesc: string;
}

@Component({
  selector: 'pros-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent implements OnInit {
  tableColumns;
  dataSource = new MatTableDataSource();
  columnData:any=[];
  displayedColumns = {
    viewId: '123456789',
    ViewName: 'View 1',
    moduleId: '1005',
    isDefault: false,
    fieldsReqList: [
      {fieldId: 'MATL_TYPE',fieldOrder: 1,width: 100,isEditable: false},
      {fieldId: 'MATL_GROUP',fieldOrder: 3,width: 100,isEditable: false},
      {fieldId: 'MATL_DESc',fieldOrder: 2,width: 100,isEditable: false},
      {fieldId: 'MATL_DESc1',fieldOrder: 2,width: 100,isEditable: false},
      {fieldId: 'MATL_DESc2',fieldOrder: 2,width: 100,isEditable: false},
      {fieldId: 'MATL_DESc3',fieldOrder: 2,width: 100,isEditable: false},
    ]
  }

  constructor() { }
  ngOnInit(): void {
    const columnVisibleObject = []
    this.tableColumns = this.displayedColumns.fieldsReqList;
    this.tableColumns.forEach((column) => {
      columnVisibleObject.push({ visible: true, value: column.fieldId, order: column.fieldOrder, width: column.width })
    })
    this.columnData = columnVisibleObject.sort();
  }

  /**
   * This is used to display specific column
   * This will be OBSOLETE IN NEXT TASK
   */
  get getDisplayColumns() {
    const getActiveColumns = this.tableColumns;
    return getActiveColumns.map(column => column.fieldId);
  }
}
