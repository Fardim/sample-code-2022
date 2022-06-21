import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Characteristics, languages } from '@modules/classifications/_models/classifications';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-characteristics-reorder',
  templateUrl: './characteristics-reorder.component.html',
  styleUrls: ['./characteristics-reorder.component.scss']
})
export class CharacteristicsReorderComponent implements OnInit {
  characteristicsField;
  columns = [];
  dataSource = new MatTableDataSource();
  limit = 1;
  showSkeleton = true;
  bannerMessage: string;

  constructor(public dialogRef: MatDialogRef<CharacteristicsReorderComponent>,
    private ruleService: RuleService,
    private transientService: TransientService,
    private sharedService: SharedServiceService,
    private router: Router,
    private activatedRoute: ActivatedRoute
    ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((res) => {
      const data = JSON.parse(res?.data)
      if (data) {
        this.showSkeleton = true;
        this.columns = data.columns;
        this.dataSource.data = data?.data || [];
        this.characteristicsField = data.characteristicsFields;
      }
    });
  }

  getLabel(field) {
    return this.characteristicsField.find((d) => d.id === field).name;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    this.dataSource.data = this.dataSource.data.slice();
  }

  onCancelClick() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }

  save() {
    const payload = this.dataSource.data.map((data: Characteristics, index: number) => ({ uuid: data.uuid, charOrder: `${ index + 1 }`}));

    this.ruleService.reorderCharacteristicList(payload).subscribe((res: any) => {
      if (res.acknowledged) {
         this.transientService.open('Successfully reordered!', null, { duration: 2000, verticalPosition: 'bottom' });
        this.sharedService.publish({ type: 'CHARACTERISTICS/UPDATED', payload: res.responses });
        this.sharedService.refreshReorderList.emit('RefreshList');
      } else {
        this.transientService.open('Something went wrong. Please try again after some time.', null, { duration: 2000, verticalPosition: 'bottom' });
        // this.bannerMessage = 'Something went wrong. Please try again after some time.'; //res.errorMsg || 'Something went wrong!';
      }
    }, (error) => {
      this.transientService.open('Something went wrong. Please try again after some time.', null, { duration: 2000, verticalPosition: 'bottom' });
      // this.bannerMessage = 'Something went wrong. Please try again after some time.'; //res.errorMsg || 'Something went wrong!';
    });
  }

  hasLimit(arr): boolean {
    return arr.length > this.limit;
  }

  getLanguage(language) {
    let label;
    const languag = languages.filter(x => x.id === language);
    if (languag) {
      label = languag[0].name;
    }
    return label;
  }
}
