import { ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Userdetails } from '@models/userdetails';
import { Dimensions, ResultInfo, SaveDimensionsRequest, SaveDimensionsResponse } from '@modules/classifications/_models/classifications';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import { forkJoin } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { DimensionAddComponent } from '../dimension-add/dimension-add.component';
import { DimensionsUomSyncComponent } from '../dimensions-uom-sync/dimensions-uom-sync.component';

@Component({
  selector: 'pros-dimension-uom',
  templateUrl: './dimensions-uom.component.html',
  styleUrls: ['./dimensions-uom.component.scss']
})
export class DimensionsUomComponent implements OnInit, OnDestroy {
  @Input() closable = false;
  @Output() close: EventEmitter<any> = new EventEmitter(null);

  loading = true;
  saving = false;
  subscriptionEnabled = true;

  // uomList: string[] = [];
  isInputVisible = false;
  readonly separatorKeysCodes = [ENTER] as const;

  selectedDimension: Dimensions;
  dimensionsList: Dimensions[] = [];
  tenantId: string;
  loadedDimensions: { [key: string]: boolean; } = {};

  constructor(
    private matDialog: MatDialog,
    private userService: UserService,
    private ruleService: RuleService,
    private transientService: TransientService,
    private sharedService: SharedServiceService,
  ) { }

  ngOnInit(): void {
    this.getUserDetails();
    this.loadDimensions();
    this.selectedDimension = this.dimensionsList[0];
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  get uomList() {
    const values = this.selectedDimension?.values || [];
    return values.map(value => value.uomValue) || [];
  }

  getUserDetails() {
    this.userService.getUserDetails().pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((response: Userdetails) => {
      this.tenantId = response.plantCode;
      // GetDimensionAPI called
    });
  }

  loadDimensions() {
    this.loading = true;

    this.ruleService.getDimensions<ResultInfo<Dimensions[]>>().pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((resp) => {
      this.loading = false;

      this.dimensionsList = resp.response;
      this.selectedDimension = this.dimensionsList[0];

      if (this.selectedDimension) {
        this.loadUoM(this.selectedDimension.uuid);
      }
    }, err => {
      this.loading = false;
    });
  }

  loadUoM(uuid: string) {
    if (uuid && !this.loadedDimensions[uuid]) {
      this.ruleService.getDimensionsById<ResultInfo<Dimensions>>(uuid).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((resp) => {
        this.selectedDimension.values = resp.response?.values || [];
        this.loadedDimensions[uuid] = true;
      });
    }
  }

  save() {
    const dimensions = this.dimensionsList.filter((m) => !m.uuid || this.loadedDimensions[m.uuid]);

    if (!dimensions.length) {
      return;
    }

    this.saving = true;

    const subs = dimensions.map((dimensionsModel) => {
      return this.ruleService.saveDimensions<SaveDimensionsRequest, SaveDimensionsResponse>({ dimensionsModel })
        .pipe(map((response) => {
          const data = response.response;
          dimensionsModel.uuid = data.uuid;
          dimensionsModel.values = data.values;
        }));
    });

    forkJoin(subs).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe(result => {
      this.transientService.open('Dimensions saved successfully!', null, { duration: 2000, verticalPosition: 'bottom' });
      this.sharedService.publish({ type: 'DIMENSIONS/SAVED', payload: result});
      this.saving = false;
      this.close.emit();
    }, err => {
      console.error(err);
      this.transientService.open('Something went wrong. Please try again later.', null, { duration: 2000, verticalPosition: 'bottom' });
      this.saving = false;
    });
  }

  sync() {
    this.matDialog.open(DimensionsUomSyncComponent, {
      width: '500px',
      disableClose: false,
    });
  }

  closeDialog() {
    this.close.emit();
  }

  addDimension() {
    const dialogRef = this.matDialog.open(DimensionAddComponent, {
      width: '500px',
      disableClose: false,
      data: {
        dimension: '',
      }
    });

    dialogRef.afterClosed().subscribe((description) => {
      if (description?.trim()) {
        const dimension: Dimensions = {
          description,
          values: [],
        };

        this.dimensionsList.push(dimension);
        this.setSelectedDimension(dimension);
      }
    });
  }

  edit(dimension: Dimensions) {
    const dialogRef = this.matDialog.open(DimensionAddComponent, {
      width: '500px',
      disableClose: false,
      data: {
        dimension: dimension?.description || '',
      },
    });

    dialogRef.afterClosed().subscribe(description => {
      if (description?.trim()) {
        this.selectedDimension.description = description;
      }
    });
  }

  delete(index: number) {
    const dialogMsg = 'Are you sure to clear the diamensions ?';

    this.transientService.confirm({
      data: { dialogTitle: 'Confirmation', label: dialogMsg },
      disableClose: true,
      autoFocus: false,
      width: '600px',
      panelClass: 'create-master-panel',
      backdropClass: 'cdk-overlay-transparent-backdrop',
    },
      (response) => {
        if (response === 'yes') {
          this.dimensionsList.splice(index, 1);
        this.setSelectedDimension(this.dimensionsList[0]);
        }
      });
  }

  setSelectedDimension(dimension: Dimensions) {
    this.selectedDimension = dimension;

    this.loadUoM(dimension?.uuid);

    // this.uomList = dimension.uomValue;
  }

  addDimUoM(event: MatChipInputEvent): void {
    // const input = event.input;
    // const value = (event.value || '').trim().toLowerCase();
    // const index = this.uomList.indexOf(value);

    // if (value && index < 0) {
    //   this.uomList.push(value);
    //   this.setUomDimensionValue(this.uomList);
    // }
    // // Reset the input value
    // if (input) {
    //   input.value = '';
    // }

    const text = (event.value || '').trim();

    if (text) {
      const item = this.selectedDimension.values.find((value) => value.uomValue.toLowerCase() === text.toLowerCase());

      if (!item) {
        this.selectedDimension.values.push({ type: this.selectedDimension.description, uomValue: text });
        event.input.value = '';
      }
    }
  }

  remove(index: number): void {
    if (index >= 0) {
      this.selectedDimension.values.splice(index, 1);
      // this.setUomDimensionValue(this.uomList);
    }
  }

  setUomDimensionValue(uomList: string[]) {
    // const indexOfDimension = this.dimensionsList.findIndex(x => x.id === this.selectedDimension.id)
    // if (indexOfDimension > 0) {
    //   this.dimensionsList[indexOfDimension].uomValue = uomList;
    // }

    const  { description } = this.selectedDimension;
    // this.selectedDimension.values = uomList.map(uom => ({ description,   }));
  }
}
