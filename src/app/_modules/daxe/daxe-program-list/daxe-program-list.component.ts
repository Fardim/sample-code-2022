import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { GlobaldialogService } from '@services/globaldialog.service';
import { DaxeChangeHistoryComponent } from '../daxe-change-history/daxe-change-history.component';
import { DaxeCreationComponent } from '../daxe-creation/daxe-creation.component';
import * as daxeActions from '@store/actions/daxe.action';
import { getDaxeList, getNewDaxeList } from '@store/selectors/daxe.selector';
import { Observable, of } from 'rxjs';
import { Daxe, DaxeStatus } from '@store/models/daxe.model';
import { SaveDaxe, UpdateDaxe } from '@store/actions/daxe.action';

@Component({
  selector: 'pros-daxe-program-list',
  templateUrl: './daxe-program-list.component.html',
  styleUrls: ['./daxe-program-list.component.scss']
})
export class DaxeProgramListComponent implements OnInit {
  readonly DaxeStatus = DaxeStatus;

  dataSource: Observable<Daxe[]> = of([]);
  displayedColumns = ['settings', 'name', 'status', 'createdOn', 'createdBy', 'modifiedOn', 'modifiedBy'];
  moduleId: string;

  constructor(
    private dialogRef: MatDialogRef<DaxeProgramListComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private globaldialogService: GlobaldialogService,
    private store: Store
  ) {}

  ngOnInit(): void {
    if (this.data?.moduleId) {
      this.moduleId = this.data.moduleId;
      this.store.dispatch(new daxeActions.LoadDaxeRules(this.moduleId));
      this.dataSource = this.store.pipe(select(getDaxeList));
    } else {
      this.dataSource = this.store.pipe(select(getNewDaxeList));
    }
  }

  /**
   * function to close the dialog
   */
  close() {
    this.dialogRef.close();
  }

  search(value: string) {}

  newDaxe() {
    this.globaldialogService.openDialog(
      DaxeCreationComponent,
      {
        mode: 'new',
        moduleId: this.moduleId
      },
      { panelClass: ['mdo-dialog'] }
    );
  }

  editDaxe(daxe: Daxe) {
    this.globaldialogService.openDialog(
      DaxeCreationComponent,
      {
        mode: 'edit',
        moduleId: this.moduleId,
        daxe
      },
      { panelClass: ['mdo-dialog'] }
    );
  }

  openDaxeChangeHistory(daxe: Daxe) {
    this.globaldialogService.openDialog(
      DaxeChangeHistoryComponent,
      {
        daxe,
        moduleId: this.moduleId
      },
      { panelClass: ['mdo-dialog'] }
    );
  }

  toggleAssign(daxe: Daxe) {
    daxe.assignedState = !daxe.assignedState;
    if (daxe.status === DaxeStatus.ACTIVE) {
      daxe.status = DaxeStatus.INACTIVE;
    } else {
      daxe.status = DaxeStatus.INACTIVE;
    }
    if (this.moduleId) {
      daxe.dataSetId = this.moduleId;
      this.store.dispatch(new SaveDaxe(daxe));
    } else {
      this.store.dispatch(new UpdateDaxe(daxe));
    }
  }
}
