import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Daxe } from '@store/models/daxe.model';
import { TransientService } from 'mdo-ui-library';
import { DAXE_TEST_DATA } from '../_services/daxe.service';

@Component({
  selector: 'pros-daxe-change-history',
  templateUrl: './daxe-change-history.component.html',
  styleUrls: ['./daxe-change-history.component.scss']
})
export class DaxeChangeHistoryComponent implements OnInit {
  dataSource: Daxe[] = DAXE_TEST_DATA;
  displayedColumns = ['settings', 'version', 'modifiedOn', 'modifiedBy', 'whatsNew'];

  constructor(
    private dialogRef: MatDialogRef<DaxeChangeHistoryComponent>,
    private transientService: TransientService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  submit() {

  }
}
