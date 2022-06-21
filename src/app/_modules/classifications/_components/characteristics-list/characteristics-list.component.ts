import { Component, Inject, Input, LOCALE_ID, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { UserService } from '@services/user/userservice.service';
import { RuleService } from '@services/rule/rule.service';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { ValidationError } from './../../../../_models/schema/schema';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { TransientService } from 'mdo-ui-library';
import { debounceTime, takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CharacteristicsReorderComponent } from '../characteristics-reorder/characteristics-reorder.component';
import { Characteristics, Dimensions, languages, ResultInfo } from '@modules/classifications/_models/classifications';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';

export const characteristicsField = [
  { id: 'charCode', name: $localize`:@@name:Name` },
  { id: 'language', name: $localize`:@@language:Language` },
  { id: 'numCode', name: $localize`:@@num_code:Characteristic numeric code` },
  { id: 'fieldType', name: $localize`:@@characteristic_type:Characteristic type` },
  { id: 'dataType', name: $localize`:@@data_type:Data Type` },
  { id: 'length', name: $localize`:@@length:Length` },
  { id: 'decimal', name: $localize`:@@decimal_places:Decimal Places` },
  { id: 'currency', name: $localize`:@@currency:Currency` },
  { id: 'prefix', name: $localize`:@@characteristic_prefix_for_short_description:Characteristic prefix for short description` },
  { id: 'longPrefix', name: $localize`:@@characteristic_prefix_for_long_description:Characteristic prefix for long description` },
  { id: 'suffix', name: $localize`:@@characteristic_suffix_for_short_description:Characteristic suffix for short description` },
  { id: 'longSuffix', name: $localize`:@@characteristic_suffix_for_long_description:Characteristic suffix for long description` },
  { id: 'isAllowMultipleValue', name: $localize`:@@allows_maintaining_multiple_values:Allows maintaining multiple values` },
  { id: 'isManatory', name: $localize`:@@required_characteristics:Required characteristic` },
  { id: 'isAllowValueRange', name: $localize`:@@allow_maintaining_value_range:Allows maintaining value range` },
  { id: 'isAllowUpperCase', name: $localize`:@@allow_maintaining_data_in_upper_case_only:Allow maintaining data in upper case only` },
  { id: 'isAllowNegative', name: $localize`:@@allow_maintaining_negative_values:Allow maintaining negative values` },
  { id: 'isAllowNewValue', name: $localize`:@@allow_maintaining_new_value:Allow maintaining new values` },
  { id: 'enableDuplicateCheck', name: $localize`:@@enable_for_duplicate_check:Enable for duplicate check` },
  { id: 'dimensionType', name: $localize`:@@dimension:Dimension` },
  { id: 'defaultUoM', name: $localize`:@@default_unit_of_measure:Default Unit of measure` },
  { id: 'status', name: $localize`:@@status:Status` },
  { id: 'validFrom', name: $localize`:@@valid_from:Valid From` },
  { id: 'validTo', name: $localize`:@@valid_to:Valid To` },
  { id: 'helpText', name: $localize`:@@help_text:Help Text` },
  { id: 'sapChars', name: $localize`:@@sap_chars:SAP characteristics` },
];

@Component({
  selector: 'pros-characteristics-list',
  templateUrl: './characteristics-list.component.html',
  styleUrls: ['./characteristics-list.component.scss']
})
export class CharacteristicsListComponent implements OnChanges, OnInit, OnDestroy {

  // @Input() classId;
  _classId: string;
  @Input() set classId(id: string) {
    this._classId = id;
    this.showSkeleton = true;
  }

  _relatedDatasetId: string;
  @Input() set relatedDatasetId(id: string) {
    this._relatedDatasetId = id;
  }

  @Input() showAction;

  subscriptionEnabled = true;

  searchString = '';
  type: string;
  dimension: string;
  tanentId: string;
  dateFormat = 'DD.MM.YYYY';
  _locale: string;

  page = 1;
  totalCount: number;
  size = 20;

  limit = 1;
  columns = ['select', 'action', ...characteristicsField.map(data => data.id)];
  dataSource;
  selection = new SelectionModel<any>(true, []);
  selectedRecordsList = [];
  selectedPages = [];
  dimensionTypeList: Dimensions[] = [];

  showSkeleton = true;
  submitError: ValidationError = {
    status: false,
    message: ''
  };
  hasData = false;

  CheckboxOptions = [
    {
      label: 'Delete',
      value: 'delete',
    },
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
    private sharedService: SharedServiceService,
    private userService: UserService,
    private ruleService: RuleService,
    private transientService: TransientService,
  ) {
    this._locale = this.locale?.split('-')?.[0] || 'en';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.classId?.previousValue !== changes.classId?.currentValue) {
      this.loadData();
    }
  }

  ngOnInit(): void {
    this.setTenantId()

    if (!this.showAction) {
      this.columns = characteristicsField.map(data => data.id);
    }

    // this.loadData();

    this.sharedService.ofType<any>('CHARACTERISTICS_LIST/SEARCH').pipe(debounceTime(1000), takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      if (data.payload) {
        this.searchString = data.payload.searchString;
        this.type = data.payload.type || '';
        this.dimension = data.payload.dimension || '';
      }
      this.page = 1;
      this.loadData();
    });

    this.sharedService.ofType<any>('CHARACTERISTICS/SAVED').pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      this.getCharacteristicsList();
    });

    this.sharedService.ofType<any>('CHARACTERISTICS/LABELS/SAVE').pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      const { characteristicId, labels } = data.payload;

      const characteristic = this.dataSource.data.find((char) => char.uuid === characteristicId);

      if (characteristic) {
        characteristic.labels = labels;
        setTimeout(() => this.updateCharacteristic(characteristic), 0);
      }
    });
  }

  // loadData() {
  //   if (this._classId) {
  //     this.getCharacteristicsList();
  //   } else {
  //     this.showSkeleton = false;
  //     this.submitError.status = true;
  //   }
  // }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  updateCharacteristic(characteristic: Characteristics) {
    const payload = {
      ...characteristic,
      defaultUoM: Array.isArray(characteristic.defaultUoM) ? characteristic.defaultUoM : (characteristic.defaultUoM ? [characteristic.defaultUoM] : []),
    };

    this.ruleService.saveCharacteristics<Characteristics,  ResultInfo<Characteristics>>(payload, this._classId)
    .subscribe((res) => {
      if (res.acknowledged) {
        characteristic.labels = res.response.labels;
      }
    });
  }

  setTenantId() {
    this.userService.getUserDetails().pipe(takeWhile(() => this.subscriptionEnabled)).subscribe(user => {
      this.tanentId = user.plantCode
      this.dateFormat = user.dateformat || 'DD.MM.YYYY';
    });
  }

  formatDate(timestamp) {
    if(timestamp && timestamp !== '0'){
      return moment(parseInt(timestamp, 10)).format(this.dateFormat);
    }
    return '';
  }

  /**
   * get Label
   * @param field to get Label
   * @returns string
   */
  getLabel(field) {
    return characteristicsField.find((d) => d.id === field).name;
  }

  getLanguage(language) {
    let ll = languages.find((l) => l.id === language);

    if (!ll) {
      ll = languages.find((l) => l.id === this._locale);
    }

    return ll.name || '';
  }

  loadData() {
    forkJoin([this.loadDimensions(), this.getCharacteristicsList()])
  }

  /**
   * get list of characteristics
   */
  getCharacteristicsList() {
    return this.ruleService.getCharacteristicsList(this._classId, this.page, this.size, this.searchString, this.tanentId, this.type, this.dimension).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res: any) => {
      this.showSkeleton = false;
      if (res.acknowledged) {
        this.hasData = true;
        if (res.pagination.total > 0 && res.response.length > 0) {
          const data = res.response.sort(this.sortCharacters);
          this.dataSource = new MatTableDataSource<any>(data);
          this.dataSource.data = this.dataSource.data.sort(x=>x.charOrder);
          this.totalCount = res.pagination.total;
        }else{
          this.sharedService.publish({ type: 'CHARACTERISTICS_LIST/EMPTY' });
        }
      } else {
        this.hasData = false;
      }
    }, (error) => {
      this.hasData = false;
      this.showSkeleton = false;
      this.submitError.status = true;
    });
  }

  sortCharacters(a: Characteristics, b: Characteristics) {
    const order1 = a.charOrder.padStart(5, '0');
    const order2 = b.charOrder.padStart(5, '0');

    if (order1 > order2) return 1;
    if (order1 < order2) return -1;

    return 0;
  }

  loadDimensions() {
    return this.ruleService.getDimensions().pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res: ResultInfo<Dimensions[]>) => {
      this.dimensionTypeList = res.response;
    });
  }

  getDimensionName(uuid: string): string {
    if (uuid) {
      return this.dimensionTypeList?.find((d) => d.uuid === uuid)?.description || '';
    }

    return '';
  }

  /**
   * check if row is selected
   * @param row to check
   * @returns boolean
   */
  isChecked(row: any): boolean {
    const found = this.selection.selected.find((e) => e.charCode === row.charCode);
    if (found) return true;
    return false;
  }

  /**
   * display page records range
   */
  get displayedRecordsRange(): string {
    const endRecord =
      this.page * this.size < this.totalCount ? this.page * this.size : this.totalCount;
    return this.totalCount ? `${(this.page - 1) * this.size + 1} to ${endRecord} of ${this.totalCount}` : '';
  }

  /**
   * handle on page change event
   * @param event PageEvent
   */
  onPageChange(event: PageEvent) {
    this.showSkeleton = true;
    if (event.pageIndex > event.length) {
      event.pageIndex = event.length;
    } else if (event.pageIndex < 0) {
      event.pageIndex = 1;
    }
    if (this.page !== event.pageIndex) {
      this.page = event.pageIndex;
      this.getCharacteristicsList();
    }
  }

  /**
   * Whether the number of selected elements matches the total number of rows.
   * @returns boolean
   */
  isAllSelected() {
    // return this.selectedPages.includes('all');
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * Selects all rows if they are not all selected; otherwise clear selection.
   */
  masterToggle(event) {
    switch (event?.value) {
      case 'delete': {
       this.deleteCharacteristics();
        break;
      }
      case 'select_this_page': {
        if (!this.selectedPages.includes(this.page)) {
          this.selectedPages.push(this.page);
        }
        if (this.selectedPages.includes('all')) {
          this.selectedPages.splice(this.selectedPages.indexOf('all'), 1);
        }
        if (this.selectedPages.includes(this.page)) {
          this.dataSource.data.forEach((row) => {
            this.selection.select(row);
            if (this.selectedRecordsList.indexOf(row) === -1) {
              this.selectedRecordsList.push(row);
            }
          });
        }
        break;
      }
      case 'select_all_page': {
        this.selection.clear();
        this.selectedPages = ['all'];
        this.dataSource.data.forEach((row) => this.selection.select(row));
        break;
      }
      case 'select_none': {
        this.selection.clear();
        this.selectedPages = [];
        this.selectedRecordsList = [];
        break;
      }
      default:
        break;
    }
  }

  deleteCharacteristic(id: string): void {
    this.transientService.confirm({
      data: { dialogTitle: 'Delete characteristic?', label: 'Are you sure you want to delete?' },
      autoFocus: false,
      width: '400px',
      panelClass: 'create-master-panel',
    }, (response) => {
      if (response === 'yes') {
        this.ruleService.deleteCharacteristic(id).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe(resp => {
          this.page = 1;
          this.getCharacteristicsList();
        }, err => {
          console.log(err);
        });
      }
    });
  }

  deleteCharacteristics() {
    if (this.selectedRecordsList.length) {
        this.transientService.confirm({
          data: { dialogTitle: 'Delete characteristics?', label: 'Are you sure you want to delete?' },
          autoFocus: false,
          width: '400px',
          panelClass: 'create-master-panel',
        }, (response) => {
          if (response === 'yes') {
            const payload = this.selectedRecordsList.map(record => this.ruleService.deleteCharacteristic(record.uuid));

            forkJoin(payload).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe(resp => {
              console.log(resp);

              this.page = 1;
              this.getCharacteristicsList();
            }, err => {
              console.log(err);

              this.page = 1;
              this.getCharacteristicsList();
            });
          }
        });
    }
  }

  /**
   * select/deselect the table row
   * @param element to select/deselect
   */
  toggle(element): void {
    this.selection.toggle(element);
    if (this.selectedRecordsList.indexOf(element) === -1) {
      this.selectedRecordsList.push(element);
    } else {
      this.selectedRecordsList.splice(this.selectedRecordsList.indexOf(element), 1);
    }
  }

  hasLimit(arr): boolean {
    return arr.length > this.limit;
  }

  /**
   * Edit element
   * @param element to edit
   */
  edit(element) {
    this.router.navigate([{
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/characteristics/${this._classId}/edit`
      },
    }],
      {
        queryParamsHandling: 'preserve',
        state: { characteristics: element },
      }
    );
  }

  /**
   * Duplicate element
   * @param element to duplicate
   */
  duplicate(element) {
    this.router.navigate([{
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/characteristics/${this._classId}/duplicate`
      },
    }],
      {
        queryParamsHandling: 'preserve',
        state: { characteristics: element, totalCount: this.totalCount },
      }
    );
  }

  // /**
  //  * Reorder element
  //  * @param element to reorder
  //  */
  reorder() {
    const dialogRef = this.dialog.open(CharacteristicsReorderComponent, {
        width: '800px',
        height: '515px',
        data: {
          data: [...this.dataSource.data],
          columns: ['action', ...characteristicsField.map(data => data.id)],
          characteristicsFields: characteristicsField
        },
        autoFocus: false,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.page = 1;
          this.getCharacteristicsList();
        }
      });
  }

  // /**
  //  * Delete element
  //  * @param element to delete
  //  */
  // delete(element) {
  // }

  openSideSheet(element, columnValue){
    const column = columnValue.toLowerCase().charAt(0).toUpperCase() + columnValue.toLowerCase().slice(1)
    if (columnValue.indexOf('DROPDOWN') !== -1){
      this.router.navigate([{
        outlets: {
          sb: `sb/settings/classifications`,
          outer: `outer/classifications/dropdown-values/${column}/${element.uuid}`}
        }], {
        queryParams: {
          update: true,
          s: 1,
          f: element.uuid,
          dataType: element.dataType,
          length: element.length,
        },
        queryParamsHandling: 'merge',
        preserveFragment: true
      });
    }
  }

  openLanguageSheet(characteristic: Characteristics) {
    this.router.navigate(['', {
      outlets: {
        sb: `sb/settings/classifications`,
        // outer: `outer/characteristics/${characteristic.uuid}/edit`,
        sb3: `sb3/classifications/characteristics/languages`
      }
    }], {
      queryParamsHandling: 'merge',
      queryParams: { action: 'save' },
      preserveFragment: true,
      state: { label: characteristic.labels, characteristicId: characteristic.uuid },
    });
  }
}
