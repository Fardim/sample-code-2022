import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GridMergeDetails, GridRowDetails } from '@models/merge-conflict/mergeConflictModel';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-grid-conflict-details',
  templateUrl: './grid-conflict-details.component.html',
  styleUrls: ['./grid-conflict-details.component.scss']
})
export class GridConflictDetailsComponent implements OnInit {

  @Input()
  grid: GridMergeDetails;

  @Output()
  decisionChanged: EventEmitter<GridMergeDetails> = new EventEmitter();

  ACTIVE_GRID_VIEW = {
    0: {
      title :'Conflict only',
      helpText: 'Conflict only view displays the data where conflict is found with base record and the respective grid lines are expected to get updated or deleted. Further, users can take informed actions on identified data conflicts.'
    },
    1: {
      title: 'CR only',
      helpText: 'CR only view displays the additional data added into Change request which is not there in the base record. Further, users can decide if they want to continue/discontinue with the addition of new lines.'
    },
    2: {
      title: 'Base record',
      helpText: 'Base record only view displays the additional data that got added in the base record from another CR, and will not be updated with the current CR.'
    }
  }

  constructor(private router: Router,
      private sharedService: SharedServiceService) { }

  ngOnInit(): void {
  }

  getGridFieldValue(record: GridRowDetails, fieldId: string, origin: 'base | cr') {
    const fieldDetails = record.fields.find(field => field.fieldId === fieldId);
    return fieldDetails ? fieldDetails[origin].value || '' : '';
  }

  notifyDecisionChange() {
    this.decisionChanged.emit(this.grid);
  }

  openColumnResolveSC(gridRow: GridRowDetails) {
    this.sharedService.setGridRowDetails(gridRow);
    this.router.navigate([{ outlets: { outer: 'outer/cr/merge-conflict/grid/column-resolve'}}], {queryParamsHandling: 'preserve'});
  }

}
