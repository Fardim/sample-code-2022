import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FieldMergeDetails, GridRowDetails } from '@models/merge-conflict/mergeConflictModel';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { TransientService } from 'mdo-ui-library';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-grid-columns-resolve',
  templateUrl: './grid-columns-resolve.component.html',
  styleUrls: ['./grid-columns-resolve.component.scss']
})
export class GridColumnsResolveComponent implements OnInit, OnDestroy {

  srcRow: GridRowDetails;
  conflictedRow: GridRowDetails;

  subscriptions: Subscription[] = [];

  constructor(private router: Router,
      private sharedService: SharedServiceService,
      private transientService: TransientService) { }

  ngOnInit(): void {
    const sub = this.sharedService.getGridRowDetails().subscribe(row => {
      this.srcRow = row;
      this.conflictedRow = JSON.parse(JSON.stringify(row));
    });
    this.subscriptions.push(sub);
  }

  save() {
    if(!this.canSave()) {
      this.transientService.open('Please take decision on all fields to save your changes ', null, { duration: 3000, verticalPosition: 'bottom' });
    } else {
      Object.keys(this.srcRow).forEach(key => {
        this.srcRow[key] = this.conflictedRow[key];
      });
      this.srcRow._action.saveRow = true;
      this.sharedService.setAfterGridRowDetailsSave();
      this.close();
    }
  }

  toggleMergeSelection(field: FieldMergeDetails, selected: 'CR' | 'BASE') {
    console.log('local selection ', selected);
    if(!this.hasFieldPermission(field)) {
      console.log('Field permission required');
      return;
    }
    if(selected === 'CR') {
      field.cr.isChecked = true;
      field.base.isChecked = false;
    } else {
      field.cr.isChecked = false;
      field.base.isChecked = true;
    }
    this.conflictedRow._action.selectedRow = !this.conflictedRow.fields.some(fld => !fld.base.isChecked) ? 'BASE'
      : (!this.conflictedRow.fields.some(fld => !fld.cr.isChecked) ? 'CR': '');
  }

  globalToggleMergeSelection(event) {
    console.log('Global toggle ', event);
    this.conflictedRow.fields.forEach(field => {
      this.toggleMergeSelection(field, event);
    });
  }

  getMergeSelection(field: FieldMergeDetails) {
    return field.base.isChecked ? 'BASE' : field.cr.isChecked ? 'CR' : '';
  }

  hasFieldPermission(field: FieldMergeDetails) {
    return field.base.enabled && field.cr.enabled;
  }

  close() {
    this.router.navigate([{outlets: {outer: null}}], { queryParamsHandling: 'preserve'});
  }

  canSave() {
    return this.conflictedRow._action.selectedRow
           || !this.conflictedRow.fields.some(field => !field.base.isChecked && !field.cr.isChecked);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
