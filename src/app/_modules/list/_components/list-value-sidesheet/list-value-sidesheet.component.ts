import { UserPasswordPolicyService } from '@services/user/user-password-policy.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { RuleService } from './../../../../_services/rule/rule.service';
import { TransientService } from 'mdo-ui-library';
import { FilterBusinessList, ListValue, ListValueColumns, ListValueResponse } from './../../../../_models/list-page/listpage';
import { GlobaldialogService } from '@services/globaldialog.service';
import { takeUntil, filter, debounceTime, distinctUntilChanged, take, catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, Inject, LOCALE_ID, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { Subject, combineLatest, Observable, of } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { ListValueDataSource } from './list-value-datasource';
import { CoreService } from '@services/core/core.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'pros-list-value-sidesheet',
  templateUrl: './list-value-sidesheet.component.html',
  styleUrls: ['./list-value-sidesheet.component.scss'],
})
export class ListValueSidesheetComponent implements OnInit, OnDestroy {
  @ViewChild('valueInput', { static: false }) valueInput: ElementRef;
  @ViewChild('codeInput', { static: false }) codeInput: ElementRef;
  @ViewChild('uploadInput') uploadInput: ElementRef;
  /**
   * it can be f, child, subchild based on the root field f = grid or not
   */
  fieldId = '';
  /**
   * Input type of the code field
   */
  inputType = 'text';
  /**
   * Input length
   */
   maxLength: string;
  /**
   * a grid field(rootFieldId) can have child, subchild
   */
  rootFieldId = '';

  moduleId = '';
  /**
   * radio type can have limit property, list values cannot be added more than the limit value
   */
  limit = 0;
  dependentfieldType = '';
  listValues: ListValue[] = [];
  /**
   * default datatable page size
   */
  recordsPageSize = 15;

  /**
   * Hold total records count
   */
  totalCount = 0;

  /**
   * for table records paging
   */
  recordsPageIndex = 0;
  /**
   * When scolling down, stop multiple API CALL TILL THE existing call finish
   */
  infinteScrollLoading = false;

  /**
   * To identify that db has more tags. Once the API endpoint retuns empty tag, that means the db has no more data. it will be true. and on scroll down we will no more call backend
   */
  hasMoreData = true;
  /**
   * search text
   */
  fieldsSearchString = '';
  /**
   * subject to emit search key from the lib-search library
   */
  searchFieldSub: Subject<string> = new Subject();
  /**
   * on close this side sheet clear the limit property if exist from the query params
   */
  queryParams = null;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  /**
   * to disable Save button when saving
   */
  saving = false;

  /**
   * Flag for the read only ... dropdown value s..
   */
  isReadOnlyMode = false;

  displayedColumns: string[] = ['_select', 'code', 'language', 'text', 'sync_enable'];
  isClassificationScreen :boolean = false;

  formListHasData = false;
  selection = new SelectionModel<any>(true, []);
  dataSource: ListValueDataSource = undefined;

  columns = ListValueColumns;

  selectedRecordsList = [];

  showSkeleton = false;

  totalData = {};

  filterData: FilterBusinessList = new FilterBusinessList();

  /**
   * Checkbox options list;
   */
  CheckboxOptions = [
    {
      label: 'Select this page',
      value: 'select_this_page',
    },
    {
      label: 'Select all page',
      value: 'select_all_page',
    },
    {
      label: 'Select none',
      value: 'select_none',
    },
  ];

  selectedPages = [];

  showNewElement = false;
  dropDownValues = '';

  showInfoBanner = false;
  bannerErrorMsg = '';

  newListValueFormGroup: FormGroup = null;

  constructor(
    private location: Location,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private ruleService: RuleService,
    private globalDialogService: GlobaldialogService,
    private transientService: TransientService,
    @Inject(LOCALE_ID) public locale: string,
    private coreService: CoreService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private userPasswordPolicyService: UserPasswordPolicyService,
  ) {
    this.dataSource = new ListValueDataSource(this.coreService, this.locale, this.ruleService);
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';

    this.activatedRouter.url.pipe(takeUntil(this.unsubscribeAll$)).subscribe((urlPath) =>{
      if(urlPath.filter(e => e.path === 'classifications').length > 0){
        //this.displayedColumns = ['_select', 'Short desc', 'language', 'Long desc', 'sync_enable'];
        this.isClassificationScreen = true;
      }
    })

    combineLatest([
      this.activatedRouter.params.pipe(takeUntil(this.unsubscribeAll$)),
      this.ruleService.alreadtUpdatedDropvalListSubject$.pipe(take(1)),
      this.activatedRouter.queryParams.pipe(takeUntil(this.unsubscribeAll$)),
    ])
      .pipe(
        filter((resp) => {
          return resp[0].fieldId ? true : false;
        }),
        takeUntil(this.unsubscribeAll$)
      )
      .subscribe((resp) => {
        // this.fieldId = resp[0].fieldId;
        this.rootFieldId = resp[0].fieldId;
        this.fieldId = resp[2].subChildField ? resp[2].subChildField : resp[2].childField ? resp[2].childField : resp[2].f ? resp[2].f : resp[0].fieldId;
        this.moduleId = resp[0].moduleId || '0';
        this.limit = resp[2].limit || 0;

        this.queryParams = JSON.parse(JSON.stringify(resp[2]));

        this.inputType = resp[2].dataType === 'NUMC' ? 'number' : 'text';
        this.maxLength = resp[2].length;
        this.isReadOnlyMode = this.queryParams?.syncData || this.queryParams?.readOnlyMode === 'true' || false;
        if (this.isReadOnlyMode) {
          this.dropDownValues = resp[0].dependentfieldType;

          this.showSkeleton = true;
          this.dataSource.reset();
          this.getTableData();
        } else {
          const listvalueSaveModel = resp[1].find((d) => d.fieldId === this.fieldId && d.moduleId === this.moduleId);
          if (listvalueSaveModel && listvalueSaveModel.dropvals.length > 0) {
            this.listValues = listvalueSaveModel.dropvals;
          } else {
            this.listValues = [];
            this.recordsPageIndex = 0;
            this.hasMoreData = true;
            this.getListValues();
          }
        }
      });

    this.dataSource.loading$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (!resp) {
        this.showSkeleton = false;
      }
    });

    this.dataSource.hasDataSubject.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (resp) {
        this.formListHasData = resp;
      }
    });

    this.dataSource.totalData.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: any) => {
      if (resp) {
        this.totalCount = resp?.length;
        this.listValues = resp;
        this.totalData = resp;
      }
    });

    this.searchFieldSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      console.log(searchString);
      this.fieldsSearchString = searchString || '';
      if (this.isReadOnlyMode) {
        this.recordsPageIndex = 0;
        this.getTableData();
      } else {
        this.listValues = [];
        this.getListValues();
      }
    });

    this.createNewListValueFormGroup();
  }

  createNewListValueFormGroup() {
    this.newListValueFormGroup = this.fb.group({
      code: ['', [Validators.required]],
      value: ['', [Validators.required]],
    })
  }

  syncNow() {
    this.showInfoBanner = true;
    this.bannerErrorMsg = 'Syncing is in progress';
  }

  /**
   * call through datasource to get the list values by pagination, search
   */
  getTableData() {
    this.dataSource.getData(this.fieldId, this.moduleId, this.fieldsSearchString);

    this.dataSource.connect().subscribe((response) => {
      if (response && response.length) {
        this.listValues = response;
        if (this.selectedPages.includes('all')) {
          this.selection.clear();
          this.dataSource.docValue().forEach((row) => this.selection.select(row));
        } else if (this.selectedPages.includes(this.recordsPageIndex)) {
          this.dataSource.docValue().forEach((row) => this.selection.select(row));
        }
      }
    });
  }

  // display page records range
  get displayedRecordsRange(): string {
    const endRecord =
      this.recordsPageIndex * this.recordsPageSize < this.totalCount ? this.recordsPageIndex * this.recordsPageSize : this.totalCount;
    return this.totalCount ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (event.pageIndex > event.length) {
      event.pageIndex = event.length;
    } else if (event.pageIndex < 0) {
      event.pageIndex = 1;
    }
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      this.getTableData();
    }
  }

  getListValues(fetchCount?,fetchSize?) {
    const dto: { searchString: string; parent: any,fetchCount: number,fetchSize: number } = {
      searchString: this.fieldsSearchString,
      parent: {},
      fetchCount: fetchCount || 0,
      fetchSize: fetchSize || 20
    };
    let subscription: Observable<ListValueResponse>;
    subscription = this.ruleService.getDropvals(this.moduleId, this.fieldId, this.locale, dto).pipe(take(1));
    // if (this.fieldsSearchString) {
    //   subscription = this.ruleService
    //     .searchListValues(this.fieldId, this.recordsPageIndex, this.recordsPageSize, this.fieldsSearchString)
    //     .pipe(take(1));
    // } else {
    //   subscription = this.ruleService.getAllListValues(this.fieldId, this.recordsPageIndex, this.recordsPageSize).pipe(take(1));
    // }
    subscription.subscribe((resp: ListValueResponse) => {
      this.listValues = [];
      if (resp.content.length > 0) {
        this.hasMoreData = true;
        this.listValues.push(...resp.content);
        this.validateCodes();
      } else {
        this.hasMoreData = false;
      }
      console.log(resp);
      this.infinteScrollLoading = false;
    });
  }

  /**
   * save the list values
   */
  OnSave() {
    this.validateCodes();
    if (this.showInfoBanner) {
      return;
    }
    this.saving = true;
    const dropvalsObservables$: Observable<ListValueResponse> = this.ruleService
      .saveDropvals(this.listValues, this.moduleId, this.fieldId, this.locale)
      .pipe(
        take(1),
        catchError((err) => of(null))
      );
    dropvalsObservables$.pipe(take(1)).subscribe(
      (resp) => {
        this.transientService.open('List values save successfully.', 'ok', {
          duration: 2000,
        });

        this.getListValues();
        this.saving = false;
      },
      (err) => {
        console.log(err);
        this.saving = false;
      }
    );
  }

  /**
   * On scroll down getTags is called to load more tags, with the flag infinteScrollLoading to true so that multiple call cannot hit
   */
   scroll(loadMore: boolean) {
    if (!this.infinteScrollLoading && this.hasMoreData) {
      if (loadMore) {
        this.recordsPageIndex++;
      } else {
        this.recordsPageIndex = 0;
      }
      this.infinteScrollLoading = true;
      this.getListValues(this.recordsPageIndex,20);
    } else {
      return null;
    }
  }

  /**
   * Can delete indiviaual or all selected tag, first will call a confirmation dialog, on 'yes' call the deleteTag method to delete
   */
  deleteSelectedListValues(listValue?: ListValue) {
    this.globalDialogService.confirm({ label: $localize`:@@delete_message:Are you sure to delete ?` }, (response) => {
      if (response === 'yes') {
        if (listValue.textRef) {
          // call the api to delete the listvalue
          const payload = {
            code: listValue.code,
          }
          this.saving = true;
          this.ruleService.deleteDropvals(this.moduleId, this.fieldId, listValue.textRef, this.locale,payload).pipe(take(1)).subscribe(resp => {
            const index = this.listValues.findIndex((d) => d.code === listValue.code);
            this.listValues.splice(index, 1);
            this.saving = false;
          }, err => {
            this.saving = false;
            console.error(err);
          });
        } else {
          const index = this.listValues.findIndex((d) => d.code === listValue.code);
          this.listValues.splice(index, 1);
        }
      } else {
        return null;
      }
    });
  }

  /**
   * Add a row at the top of the table to Add a new tag with id= '' . But the table should not contain an existing New tag with id =''
   */
  addNewListValue() {
    this.listValues.unshift({
      code: 'New Code',
      text: 'New Text',
    });
  }

  addNewListValueOnEnter() {
    if(!this.newListValueFormGroup.valid) {
      this.userPasswordPolicyService.validateAllFormFields(this.newListValueFormGroup);
      return;
    }
    if(this.limit>0 && this.listValues.length >= this.limit) {
      this.showInfoBanner = true;
      this.bannerErrorMsg = 'Maximum limit reached';
      return;
    } else {
      this.showInfoBanner = false;
      this.bannerErrorMsg = '';
    }
    this.listValues.unshift({
      code: this.newListValueFormGroup.value.code,
      text: this.newListValueFormGroup.value.value,
    });
    this.validateCodes();
    this.newListValueFormGroup.reset();

    document.getElementById('dropdown_list_value_sidesheet_focus').focus();

    this.OnSave();
  }

  cloneListValues(listValue: ListValue, index: number) {
    let listVal: ListValue;
    listVal = {
      code: listValue.code,
      text: listValue.text,
      editcode: true,
      edittext: false,
    };
    this.listValues.splice(index + 1, 0, listVal);
  }

  /**
   * Trackby of the list value
   */
  listValueCode(index, item: ListValue) {
    return item.code;
  }

  cloneElements(element, i) {
    this.dataSource.cloneElement(element, i);
  }

  getLabel(dynCol) {
    const columnNameList = ['Sync Enable', 'Copy', 'Delete'];
    const columnName = this.columns.find((d) => d.id === dynCol)?.name;
    return columnNameList.indexOf(columnName) === -1 ? columnName : '';
  }

  isArray(col) {
    return !!Array.isArray(col);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(event?) {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.docValue().forEach((row) => this.selection.select(row));
    switch (event?.value) {
      case 'select_this_page': {
        if (!this.selectedPages.includes(this.recordsPageIndex)) {
          this.selectedPages.push(this.recordsPageIndex);
        }
        if (this.selectedPages.includes('all')) {
          this.selectedPages.splice(this.selectedPages.indexOf('all'), 1);
        }
        if (this.selectedPages.includes(this.recordsPageIndex)) {
          this.dataSource.docValue().forEach((row) => {
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
        this.dataSource.docValue().forEach((row) => this.selection.select(row));
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

    this.cd.detectChanges();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.docLength();
    return numSelected === numRows;
  }

  close() {
    // // this.updateNextDropvalSubject();
    // const url = this.router.url;
    // if (!url.includes('/outer')) {
    //   this.router.navigate([{ outlets: { sb: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
    // } else {
    //   this.router.navigate([{ outlets: { outer: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
    // }
    // // this.router.navigate([{ outlets: { sb: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });

    this.location.back();
  }

  updateNextDropvalSubject() {
    this.ruleService.nextDropvalSubject({
      moduleId: this.moduleId,
      fieldId: this.fieldId,
      dropvals: this.listValues.map((d) => {
        return {
          code: d.code,
          text: d.text,
          language: d.language,
        };
      }),
    });
  }

  toggle(element) {
    this.cd.detectChanges();
    this.selection.toggle(element);
    if (this.selectedRecordsList.indexOf(element) === -1) {
      this.selectedRecordsList.push(element);
    } else {
      this.selectedRecordsList.splice(this.selectedRecordsList.indexOf(element), 1);
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
  }

  isChecked(row: any): boolean {
    const found = this.selection.selected.find((e) => e.email === row.email && e.userName === row.userName);
    if (found) return true;
    return false;
  }

  scheduleSync() {
    this.router.navigate(
      [
        {
          outlets: {
            sb: `sb/list/dropdown-values/${this.dropDownValues}/${this.moduleId}/${this.fieldId}`,
            outer: `outer/list/outer/schedule-sync`,
          },
        },
      ],
      {
        queryParams: { syncNow: this.isReadOnlyMode },
        queryParamsHandling: 'merge',
        preserveFragment: true,
      }
    );
  }

  /**
   * show info banner when the user have duplicate code. Because backend are not saving the values when they have duplicate code. Only one value is saving by backend
   */
  validateCodes() {
    const codes = this.listValues.map(d => d.code);
    const uniq = codes.map(code => {
      return {
        count: 1,
        code
      }
    }).reduce((acc, curr) => {
      acc[curr.code] = (acc[curr.code] || 0) + curr.count;
      return acc;
    }, {});
    const duplicates = Object.keys(uniq).filter(k => uniq[k] > 1);
    if (duplicates.length > 0) {
      this.showInfoBanner = true;
      this.bannerErrorMsg = 'Cannot have duplicate code! Values with duplicate code will not be saved.';
    } else {
      this.showInfoBanner = false;
      this.bannerErrorMsg = '';
    }
  }

  importValues(fileInput: any) {
    let file = fileInput.target.files[0];
    let fileName = file.name;

    let formData: FormData = new FormData();
    formData.append('request', JSON.stringify({moduleId: this.moduleId, fieldId: this.fieldId}));
    formData.append('dropDownRequestFile', file, fileName);

    this.ruleService.dropDownBulkUpload(formData).pipe(take(1)).subscribe((resp: any) => {
      if (resp && resp.acknowledged) {
        this.transientService.open('Uploaded succesfully', 'ok', {
          duration: 2000
        });
        this.getListValues();
      } else {
        this.transientService.open(resp.errorMsg, 'ok', {
          duration: 2000
        });
      }
      this.uploadInput.nativeElement.value = '';
    }, err => {
      this.transientService.open('Something went wrong!', 'ok', {
        duration: 2000
      });
      console.error(err);
      this.uploadInput.nativeElement.value = '';
    });

  }

  exportValues() {
    this.ruleService.dropDownDownload(this.moduleId, this.fieldId).pipe(take(1)).subscribe((resp: any) => {
      console.log(resp);
      let blob = new Blob([resp], {type: 'text/csv' })
      // saveAs(blob, "myFile.csv");
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);

      a.href = url;
      a.download = 'myFile.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }, err => console.error(err));
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
