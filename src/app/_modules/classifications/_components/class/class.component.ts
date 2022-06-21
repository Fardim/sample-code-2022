import { ValidationError } from '@models/schema/schema';
import { Component, Inject, Input, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { RuleService } from '@services/rule/rule.service';
import { Class } from '@modules/classifications/_models/classifications';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { TransientService } from 'mdo-ui-library';
import { DmsService } from '@services/dms/dms.service';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CharacteristicsDetailDialogComponent } from '../characteristics-detail-dialog/characteristics-detail-dialog.component';

@Component({
  selector: 'pros-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent implements OnInit, OnDestroy {
  _classId: string;
  tabIndex: number;
  subscriptionEnabled = true;
  @Input() set classId(id: string) {
    this._classId = id;
    this.getClassDetails(this._classId);
  }

  class: Class;
  relatedDatasetId: string;
  parentUuid: string;
  showSkeleton: boolean;
  submitError: ValidationError = {
    status: false,
    message: ''
  };
  bannerMessage: string;

  assignedCharacteristicsCount: number;
  inheritedCharacteristicsCount: number;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog,
    private transientService: TransientService,
    private dmsService: DmsService,
    private ruleService: RuleService,
    private sharedService: SharedServiceService,
    private router: Router
  ) {
    this.locale = this.locale?.split('-')?.[0] || 'en';
  }

  ngOnInit(): void {
    if (this._classId) {
      this.getClassDetails(this._classId);
      this.relatedDatasetId = this.class?.classType?.relatedDatasets?.[0]?.id || '';
    }

    this.sharedService.ofType<Class>('CLASS/UPDATED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        if (this._classId === data.payload.uuid) {
          this.getClassDetails(this._classId);
          this.relatedDatasetId = this.class?.classType?.relatedDatasets?.[0].id || '';
        }
      });

    this.sharedService.ofType<Class>('CLASS/LANGUAGES/SAVED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        if (this._classId === data.payload.uuid) {
          this.getClassDetails(this._classId);
          this.relatedDatasetId = this.class?.classType?.relatedDatasets?.[0].id || '';
        }
      });
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  acHasDataChanged(count: number): void {
    this.assignedCharacteristicsCount = count;
  }

  icHasDataChanged(count: number): void {
    this.inheritedCharacteristicsCount = count;
  }

  getClassDetails(classId) {
    this.showSkeleton = true;
    this.ruleService.getClassDetails(classId).subscribe((res: any) => {
      this.showSkeleton = false;
      this.submitError.status = false;
      this.parentUuid = '';

      if (res.acknowledged) {
        this.class = res.response;
        this.sharedService.classForCharacteristics = this.class;
        this.class.imageUrl = this.class.imageUrl.filter(image => image);

        this.loadImages();

        if (this.class.parentUuid && this.class.inheritAttributes) {
          this.parentUuid = this.class.parentUuid;
        }
      } else {
        this.submitError.status = true;
      }
    }, (error) => {
      this.showSkeleton = false;
      this.submitError.status = true;
    });
  }

  loadImages() {
    const observables = this.class.imageUrl.map((imageUrl) => this.getImage(imageUrl));

    if (observables.length) {
      forkJoin(observables).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
        console.log(data);
      });
    }
  }

  getImage(id: string) {
    return this.dmsService.downloadFile(id);
  }

  newCharacterictics() {
    this.router.navigate(['', {
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/characteristics/new`
      },
    }],
      { state: { classId: this._classId,classDesc:this.class.description } }
    );
  }

  addLanguagesManually(){
    this.router.navigate([{
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/classes/${this._classId}/languages`,
      },
    }], {queryParams: { language: this.locale }});
  }

  openDialog() {
    this.router.navigate(['', {
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/classes/${this._classId}/mapping`
      },
    }], { state: { sourceClass: this.class } });
  }

  openEditClass() {
    this.router.navigate([{
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/classes/${this.class?.uuid}`
      },
    }], { state: { classType: this.class?.classType } });
  }

  deleteClass() {
    this.transientService.confirm({
      data: { dialogTitle: 'Delete class?', label: 'Are you sure you want to delete this class?' },
      autoFocus: false,
      width: '400px',
      panelClass: 'create-master-panel',
    }, (response) => {
      if (response === 'yes') {
        this.ruleService.deleteClass(this.class?.uuid).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res) => {
          this.transientService.open('Successfully deleted!', null, { duration: 2000, verticalPosition: 'bottom' });

          this.sharedService.publish({
            type: 'CLASS/DELETED',
            payload: this.class,
          });

        }, (err) => {
          this.transientService.open('Something went wrong. Please try again later.', null, { duration: 2000, verticalPosition: 'bottom' });
        });
      }
    });
  }

  showCharsFullScreen(classId: string, showActions: boolean) {
    console.log(classId, showActions);

    const title = classId === this.parentUuid ? $localize`:@@inherited_characteristics:Inherited characteristics` : $localize`:@@assigned_characteristics:Assigned characteristics`;

    /*
    const dialogRef = this.dialog.open(CharacteristicsDetailDialogComponent, {
      width: '80%',
      height: '80%',
      data: {
        title,
        classId,
        showActions,
        relatedDatasetId: this.relatedDatasetId,
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
    });
    */

    this.router.navigate(['', {
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/characteristics-details/${classId}/${this.relatedDatasetId || '0'}/${title}/${showActions}`,
      }
    }], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }
}
