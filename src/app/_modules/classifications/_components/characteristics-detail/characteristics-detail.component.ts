import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output, ViewChild, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationError } from '@models/schema/schema';
import { Characteristics, Dimensions, Language, LanguageLabel, languages, ResultInfo } from '@modules/classifications/_models/classifications';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import * as moment from 'moment';
import { BehaviorSubject, forkJoin, Subject, Subscription } from 'rxjs';
import { debounceTime, take, takeWhile } from 'rxjs/operators';
import { CharacteristicsReorderComponent } from '../characteristics-reorder/characteristics-reorder.component';

export const characteristicsField = [
  { id: 'charCode', name: $localize`:@@name:Name` },
  { id: 'charDesc', name: $localize`:@@description:Description` },
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
  selector: 'pros-characteristics-detail',
  templateUrl: './characteristics-detail.component.html',
  styleUrls: ['./characteristics-detail.component.scss']
})
export class CharacteristicsDetailComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() showAction: boolean = false;
  @Input() showPaginator: boolean = false;

  _classId: string;
  @Input() set classId(id: string) {
    this._classId = id;
  }

  @ViewChild('table') table: MatTable<any>;

  _relatedDatasetId: string;
  @Input() set relatedDatasetId(id: string) {
    this._relatedDatasetId = id;
  }

  @Input() emptyState: { title: string; description: string };

  @Output() hasDataChanged = new EventEmitter<number>();
  @Output() languageListChanged = new EventEmitter<Language[]>();

  outlet: string;
  subscriptionEnabled = true;

  searchString = '';
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
  availableLanguages: Language[] = [];
  selectedLanguage: Language;

  loading = true;
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

  searchSub = new Subject<string>();
  dimensionSearchSub = new Subject<string>();

  isEmpty = false;
  selectedType: string;
  allType: string[] = ['All', 'TEXT', 'DROPDOWN', 'DATE', 'TIME', 'CURRENCY', 'RICH TEXT EDITOR'];

  selectedDimension: Dimensions = {
    description: 'All',
    values: [],
  };

  dimensions: Dimensions[] = [];
  dimensionsObj = new BehaviorSubject<Dimensions[]>([]);

  subScription : Subscription;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
    private sharedService: SharedServiceService,
    private userService: UserService,
    private ruleService: RuleService,
    private transientService: TransientService,
    private ngZone: NgZone,
  ){
    this._locale = this.locale?.split('-')?.[0] || 'en';
  }

  ngOnInit(): void {
    this.subScription = this.sharedService.refreshReorderList.subscribe(
      res => {
        if(res) {
          this.page = 1;
          this.getCharacteristicsList();
        }
      }
    )
    this.selectedLanguage = languages.find(language => language.id === this._locale);

    this.activateRoute.params.subscribe((params) => {
      this.outlet = params.outlet;
    });

    if (!this.showAction) {
      this.columns = characteristicsField.map(data => data.id);
    }

    this.loadDimensions();
    this.loadData();

    this.dimensionSearchSub.pipe(debounceTime(1000)).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((query: string) => {
      this.filterDimensions(query);
    });

    this.searchSub.pipe(debounceTime(1000)).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((query: string) => {
      this.searchString = query;
      this.searchCharacteristics();
    });

    // this.sharedService.ofType<any>('CHARACTERISTICS_LIST/EMPTY').pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
    //   this.isEmpty = true;
    // });

    this.sharedService.ofType<any>('CHARACTERISTICS/SAVED').pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      this.page = 1;
      this.loadData();
    });

    this.sharedService.ofType<any>('CHARACTERISTICS/DELETED').pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      this.page = 1;
      this.loadData();
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
  updateTableStyling() {
    this.ngZone.onMicrotaskEmpty.pipe(take(3)).subscribe(() => {
      this.table.updateStickyColumnStyles();
      this.table.updateStickyHeaderRowStyles();
      this.table.updateStickyFooterRowStyles();
    });
  }
  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
    this.subScription.unsubscribe();
  }

  loadDimensions() {
    this.ruleService.getDimensions<ResultInfo<Dimensions[]>>().pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res) => {
      this.dimensions = res.response;
      this.dimensionsObj.next(this.dimensions);
    });
  }

  filterDimensions(query: string) {
    if (query?.trim()) {
      const items = this.dimensions.filter((dimension) => dimension.description.toLowerCase().includes(query.toLowerCase()));

      this.dimensionsObj.next(items);
    } else {
      this.dimensionsObj.next(this.dimensions);
    }
  }

  searchCharacteristics() {
    this.page = 1;

    this.loadData();
  }

  setSelectedType(item) {
    this.selectedType = !item || item === 'All' ? '' : item;
    this.searchCharacteristics();
  }

  setSelectedDimension(item: Dimensions) {
    this.selectedDimension = item;
    this.searchCharacteristics();
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
    this.getCharacteristicsList();
  }

  /**
   * get list of characteristics
   */
  getCharacteristicsList() {
    const selectedDimension = this.selectedDimension?.uuid || '';
    const selectedType = this.selectedType || '';

    return this.ruleService.getCharacteristicsList(this._classId, this.page, this.size, this.searchString, this.tanentId, selectedType, selectedDimension).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res: any) => {
      this.loading = false;
      if (res.acknowledged) {
        if (!selectedDimension && !selectedType && !this.searchString) {
          this.hasData = res.response.length > 0;
          this.hasDataChanged.emit(res.response.length);

          this.extractLanguageData(res.response);
        }

        const data = res.response.sort(this.sortCharacters);
        this.dataSource = new MatTableDataSource<any>(data);
        this.dataSource.data = this.dataSource.data.sort(x=>x.charOrder);
        this.totalCount = res.pagination.total;
        this.updateTableStyling();
      }
    }, (error) => {
      this.hasData = false;
      this.loading = false;
      this.submitError.status = true;
    });
  }

  extractLanguageData(data: Characteristics[]) {
    const labels = [].concat( ...data.map(item => item.labels));

    const values = labels.reduce((p, c: LanguageLabel) => {
      if (!p[c.language]) {
        p[c.language] = languages.find(l => l.id === c.language?.toLowerCase())?.name;
      };

      return p;
    }, {});

    this.availableLanguages =  Object.keys(values).map<Language>(key => ({ id: key, name: values[key] }));

    console.log(this.availableLanguages);

    this.languageListChanged.emit(this.availableLanguages);
  }

  languageChanged(language: Language) {
    this.selectedLanguage = language;
  }

  sortCharacters(a: Characteristics, b: Characteristics) {
    const order1 = a.charOrder.padStart(5, '0');
    const order2 = b.charOrder.padStart(5, '0');

    if (order1 > order2) return 1;
    if (order1 < order2) return -1;

    return 0;
  }

  getDimensionName(uuid: string): string {
    if (uuid) {
      return this.dimensions?.find((d) => d.uuid === uuid)?.description || '';
    }

    return '';
  }

  getDescription(data: Characteristics): string {
    const label = data.labels.find(l => l.language?.toLowerCase() === this.selectedLanguage.id);

    return label?.label || '';
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
              // this.page = 1;
              // this.getCharacteristicsList();

              this.sharedService.publish({ type: 'CHARACTERISTICS/DELETED' });
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

  newCharacteristics() {
    this.router.navigate(['', {
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/characteristics/new`
      },
    }],
      { state: { classId: this._classId } }
    );
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
    this.router.navigate([{ outlets: { sb: `sb/settings/classifications`, outer: `outer/characteristices/reorder` } }],{
        queryParams: {data: JSON.stringify({data: [...this.dataSource.data],
          columns: ['action', ...characteristicsField.map(data => data.id)],
          characteristicsFields: characteristicsField})}
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

      let outlets: any = {
        sb: `sb/settings/classifications`,
        // outer: `outer/classifications/characteristics-details/${this.classId}/${this.relatedDatasetId}/abc}/${this.showAction}`,
        outer: `outer/classifications/dropdown-values/${column}/${element.uuid}`
      };

      if (this.outlet === 'outer') {
        outlets = {
          sb: `sb/settings/classifications`,
          outer: `outer/classifications/characteristics-details/${this._classId}/${this._relatedDatasetId || '0'}/${this.title}/${this.showAction}`,
          sb3: `sb3/classifications/dropdown-values/${column}/${element.uuid}`,
        };
      }

      this.router.navigate([{
        outlets,
        }], {
        queryParams: {
          readOnlyMode: !this.showAction,
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
