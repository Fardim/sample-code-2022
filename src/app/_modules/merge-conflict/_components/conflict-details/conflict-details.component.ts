import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConflictedRecordDetails, FieldMergeDetails } from '@models/merge-conflict/mergeConflictModel';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { MergeConflictService } from '@services/merge-conflict/merge-conflict.service';
import { TransientService } from 'mdo-ui-library';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'pros-conflict-details',
  templateUrl: './conflict-details.component.html',
  styleUrls: ['./conflict-details.component.scss']
})
export class ConflictDetailsComponent implements OnInit, OnDestroy {

  conflictedRecordDetails: ConflictedRecordDetails;
  changedRecords: any = {};
  crId: string;
  massId: string;
  subscriptions: Subscription[] = [];
  isChanged = false;
  isSaving = false;
  globalDesicion = '';
  hasChilds = false;
  parentCrId: string;
  isReseting = false;

  blankDataSource = [];
  blankColumnsList = [];

  constructor(private activatedRoute: ActivatedRoute,
    private conflictService: MergeConflictService,
    private transientService: TransientService,
    private sharedService: SharedServiceService,
    private globalDialogService: GlobaldialogService) {}


  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.crId = params.crId || '';
      this.massId = params.massId || '';
      if(this.crId && !this.massId) {
        this.getRecordsList();
      }
    });
    this.updateUserActions(false, false);

    const sub = this.sharedService.getAfterGridRowDetailsSave().subscribe(resp => {
      this.isChanged = true;
      console.log(this.conflictedRecordDetails);
    });
    this.subscriptions.push(sub);
  }

  getRecordDetails(crId: string, reset?) {
    if(this.isChanged) {
      this.changedRecords[this.crId] = this.conflictedRecordDetails;
      console.log('Changed ', this.changedRecords);
    }
    this.isChanged = false;
    this.crId = crId;
    if(!reset && Object.keys(this.changedRecords).some(key => key === this.crId)) {
      this.conflictedRecordDetails = this.changedRecords[this.crId];
      this.globalDesicion = '';
    } else {
      const sub = this.conflictService.getConflictedRecordDetails(this.crId)
        .subscribe(resp => {
          this.conflictedRecordDetails = resp;
          this.globalDesicion = '';
        }, error => {
          console.error(`Error:: ${error.message}`);;
      });
      this.subscriptions.push(sub);
    }
  }

  getRecordsList() {
    const sub = this.conflictService.getConflictedRecordsList(this.massId, this.crId, 0, 20, '')
      .subscribe(resp => {
        this.hasChilds = !!(resp && resp.length && resp[0].childs && resp[0].childs.length);
        this.parentCrId = this.crId;
        if(!this.hasChilds) {
          this.getRecordDetails(this.crId);
        }
      }, error => {
        console.error(`Error:: ${error.message}`);
      });
    this.subscriptions.push(sub);
  }

  save() {
    this.isSaving = true;
    this.changedRecords[this.crId] = this.conflictedRecordDetails;
    const sub = this.conflictService.saveConflicResolve(this.changedRecords, this.massId)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe(resp => {
        this.isChanged = false;
        this.transientService.open('Successfully saved', 'Okay', { duration: 2000, verticalPosition: 'bottom' });
        this.updateUserActions(true, false);
      }, error => {
        this.transientService.open('Something went wrong !', 'close', { duration: 2000, verticalPosition: 'bottom' });
        console.error(`Error:: ${error.message}`);
    });
    this.subscriptions.push(sub);
  }


  toggleMergeSelection(field: FieldMergeDetails, selected: 'cr' | 'base') {
    console.log('local selection ', selected);
    if(!this.hasFieldPermission(field)) {
      console.log('Field permission required');
      return;
    }
    if(selected === 'cr') {
      field.cr.isChecked = true;
      field.base.isChecked = false;
    } else {
      field.cr.isChecked = false;
      field.base.isChecked = true;
    }
    this.isChanged = true;
    console.log(this.conflictedRecordDetails);
  }

  getMergeSelection(field: FieldMergeDetails) {
    return field.base.isChecked ? 'base' : field.cr.isChecked ? 'cr' : '';
  }

  globalToggleMergeSelection(event) {
    console.log('Global toggle ', event);
    this.conflictedRecordDetails.header.fields.forEach(field => {
      this.toggleMergeSelection(field, event);
    });
    this.conflictedRecordDetails.hierarchy.forEach(hierarchy => {
      hierarchy.fields.forEach(field => this.toggleMergeSelection(field, event));
      if(hierarchy.childs) {
        hierarchy.childs?.forEach(child => {
          child.fields.forEach(field => this.toggleMergeSelection(field, event));

          if(child.childs) {
            child.childs.forEach(subChild => {
              subChild.fields?.forEach(subField => this.toggleMergeSelection(subField, event))
            });
          }
        });
      }
    });
  }

  hasFieldPermission(field: FieldMergeDetails) {
    return field.base.enabled && field.cr.enabled;
  }

  get disableSubmit() {
    return this.isSaving || (!this.isChanged && !Object.keys(this.changedRecords).length);
  }

  updateUserActions(submitted: boolean, reset: boolean) {
    const conflictUserAction = {
      stage: submitted ? 'saved' : 'changed',
      shouldClose: submitted,
      shouldReset: reset
    };
    localStorage.setItem('conflict_user_action', JSON.stringify(conflictUserAction));
  }

  reset() {
    this.globalDialogService.confirm({ label: 'Do you want to reset this change request ?' }, (response) => {
      if (response && response === 'yes') {
        this.isReseting = true;
        const sub = this.conflictService.resetConflictCR(this.crId)
          .pipe(finalize(() => this.isReseting = false))
          .subscribe(
          resp => {
            this.updateUserActions(false, true);
            this.transientService.open('Reset request successfully submitted', 'Okay', { duration: 2000, verticalPosition: 'bottom' });
          },
          error => {
            this.transientService.open('Something went wrong !', 'close', { duration: 2000, verticalPosition: 'bottom' });
            console.error(`Error:: ${error.message}`);
        });
        this.subscriptions.push(sub);
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

