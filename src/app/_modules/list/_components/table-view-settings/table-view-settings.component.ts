import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { of, Subject, Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { ListService } from '@services/list/list.service';
import { ListPageViewDetails, ListPageViewFldMap } from '@models/list-page/listpage';
import { CoreService } from '@services/core/core.service';
import { FieldMetaData } from '@models/core/coreModel';
import { sortBy, size, uniq } from 'lodash';
import { debounceTime, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs/operators';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';

@Component({
  selector: 'pros-table-view-settings',
  templateUrl: './table-view-settings.component.html',
  styleUrls: ['./table-view-settings.component.scss'],
})
export class TableViewSettingsComponent implements OnInit, OnDestroy {
  /**
   * Hold current module id
   */
  moduleId: string;

  /**
   * Hold current view id
   */
  viewId: string;

  allChecked = false;
  allIndeterminate = false;

  /**
   * Hold current view config details
   */
  viewDetails = new ListPageViewDetails();

  subscriptions: Subscription = new Subscription();

  submitted = false;

  fldMetadataObs: Subject<FieldMetaData[]> = new Subject();

  fieldsPageIndex = 0;

  moduleFieldsMetatdata: FieldMetaData[] = [];

  viewFieldsMetadata: FieldMetaData[] = [];

  suggestedViewFieldsMetadata: FieldMetaData[] = [];

  mergedFieldsMetadata: FieldMetaData[] = [];

  staticFields: FieldMetaData[] = [
    { fieldId: 'DATECREATED', fieldDescri: 'Created on'},
    { fieldId: 'DATEMODIFIED', fieldDescri: 'Modified on'},
    { fieldId: 'USERCREATED', fieldDescri: 'Created by'},
    { fieldId: 'USERMODIFIED', fieldDescri:'Modified by'},
    { fieldId: 'STATUS', fieldDescri:'Status'}] as FieldMetaData[];

  selectedMetadataFldList: FieldMetaData[] = JSON.parse(JSON.stringify(this.staticFields));

  searchFieldSub: Subject<string> = new Subject();

  fieldsSearchString = '';

  selectedSegment = 'all';

  isSaving = false;

  allMetadataFields: FieldMetaData[] = [];

  @ViewChild('searchInput') searchInput: SearchInputComponent;

  optionsList = [
    { label: 'All', value: 'all' },
    { label: 'Visible only', value: 'visbleOnly' },
  ];

  constructor(
    private sharedService: SharedServiceService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private listService: ListService,
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string
  ) {}

  ngOnInit() {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.subscriptions.add(
      this.activatedRoute.params.subscribe((params) => {
        this.moduleId = params.moduleId;
        this.getModuleFldMetadata();

        this.viewId = params.viewId !== 'new' ? params.viewId : '';
        if (this.viewId) {
          this.getTableViewDetails();
        }
      })
    );

    this.subscriptions.add(
      this.fldMetadataObs.subscribe((fields) => {
        this.mergeFieldsMetadata();
      })
    );

    this.subscriptions.add(
      this.searchFieldSub.pipe(debounceTime(200), distinctUntilChanged()).subscribe((searchString) => {
        this.fieldsSearchString = searchString || '';
        this.suggestedViewFieldsMetadata = this.viewFieldsMetadata.filter((field) =>
          field.fieldDescri.toLowerCase().includes(this.fieldsSearchString.toLowerCase())
        );
        this.getModuleFldMetadata();
      })
    );
  }

  /**
   * get table view details
   */
  getTableViewDetails() {
    this.subscriptions.add(
      this.listService.getListPageViewDetails(this.viewId, this.moduleId).subscribe(
        (response) => {
          if(response){
          this.viewDetails = response;
          this.viewDetails.fieldsReqList = sortBy(this.viewDetails.fieldsReqList, 'fieldOrder');
          const fieldsList = this.viewDetails.fieldsReqList.map((field) => field.fieldId);
          this.getViewFieldsMetadata(fieldsList);
          }
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      )
    );
  }

  /**
    * Change event of segments to set selected metadata fld list
    * @param selectedSegment selected segment
    */
   segmentChange() {
   this.selectedSegment = this.selectedSegment === 'all' ? 'visbleOnly' : 'all';
    this.selectedMetadataFldList = [];
    if (this.searchInput) {
      this.searchInput.clearSearch();
    }
    if (this.selectedSegment === 'all') {
      this.selectedMetadataFldList = this.mergedFieldsMetadata;
    }
    this.FldMetadataOrders();
  }

  /**
   * Get module fields metadata
   */
  getModuleFldMetadata(loadMore?: boolean) {
    if (this.moduleId === undefined || this.moduleId.trim() === '') {
      throw new Error('Module id cant be null or empty');
    }

    if (loadMore) {
      this.fieldsPageIndex++;
    } else {
      this.fieldsPageIndex = 0;
    }
    const filteredStaticFields = this.fieldsSearchString ?
      this.staticFields.filter(f => f.fieldDescri.toLocaleLowerCase().includes(this.fieldsSearchString.toLocaleLowerCase()))
      : this.staticFields;

    this.subscriptions.add(
      this.coreService.getMetadataByFields(this.moduleId, this.fieldsPageIndex, this.fieldsSearchString, 20, this.locale).subscribe(
        (response) => {
          if (size(response) > 0) {
            loadMore ? (this.moduleFieldsMetatdata = this.moduleFieldsMetatdata.concat(response)) : (this.moduleFieldsMetatdata = filteredStaticFields.concat(response));
            if (this.fieldsSearchString === '') {
              this.allMetadataFields = this.moduleFieldsMetatdata;
            }
            this.fldMetadataObs.next([]);
          } else if (loadMore) {
            this.fieldsPageIndex--;
          } else {
            this.moduleFieldsMetatdata = filteredStaticFields;
            this.fldMetadataObs.next([]);
          }
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      )
    );
  }

  /**
   * Get view fields metadata
   */
  getViewFieldsMetadata(fieldsList: string[]) {
    if (!fieldsList || !fieldsList.length) {
      return;
    }
    this.subscriptions.add(
      this.coreService.getMetadataByFields(this.moduleId, this.fieldsPageIndex, this.fieldsSearchString, 20, 'en').subscribe(
        (response) => {
          this.viewFieldsMetadata = response;
          this.suggestedViewFieldsMetadata = this.viewFieldsMetadata;
          this.fldMetadataObs.next([]);
          this.FldMetadataOrders();
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      )
    );
  }

  /**
   * reorder fields metatdata based on saved columns orders
   */
  FldMetadataOrders() {
    let index = -1;
    this.viewDetails.fieldsReqList.forEach((field) => {
      const fieldPosition = this.selectedMetadataFldList.findIndex((f) => f.fieldId === field.fieldId);
      if (fieldPosition !== -1) {
        moveItemInArray(this.selectedMetadataFldList, fieldPosition, ++index);
      }
    });
  }

  /**
   * merge view fields and module fields
   */
  mergeFieldsMetadata() {
    const moduleFields = this.moduleFieldsMetatdata.filter((field) => !this.viewFieldsMetadata.find((f) => f.fieldId === field.fieldId));
    this.mergedFieldsMetadata = this.suggestedViewFieldsMetadata.concat(moduleFields);
    this.selectedMetadataFldList = this.mergedFieldsMetadata;
    this.FldMetadataOrders();
  }

  /**
   * close sidesheet
   */
  close() {
    const url = this.router.url;
    if(!url.includes('/outer')) {
      this.router.navigate([{ outlets: { sb: null } }], { queryParamsHandling: 'preserve' });
    }else {
      this.router.navigate([{ outlets: { sb3: null } }], { queryParamsHandling: 'preserve' });
    }
  }

  /**
   * Save view details
   */
  public save() {
    this.submitted = true;
    if (!this.viewDetails.viewName || (this.viewDetails.viewName && !this.viewDetails.viewName.trim())) {
      return;
    }

    this.viewDetails.moduleId = this.moduleId;

    let mergedFieldsMetadata = this.mergedFieldsMetadata;
    if(this.selectedSegment === 'visbleOnly') {
      const checkedData = this.selectedMetadataFldList;
      const uncheckedData = [];

      this.mergedFieldsMetadata.forEach(metafld => {
        const field = this.viewDetails.fieldsReqList.find((fld) => fld.fieldId === metafld.fieldId);
        if(!field) {
          uncheckedData.push(metafld);
        }
      });
      mergedFieldsMetadata = checkedData.concat(uncheckedData);
    }

    let order = 0;
    mergedFieldsMetadata.forEach((metafld) => {
      const field = this.viewDetails.fieldsReqList.find((fld) => fld.fieldId === metafld.fieldId);
      if (field) {
        field.fieldOrder = `${++order}`;
      }
    });

    this.viewDetails.fieldsReqList = sortBy(this.viewDetails.fieldsReqList, 'fieldOrder');
    this.viewDetails.isDefault = true;

    const isUpdate = !!this.viewDetails.viewId;

    this.isSaving = true;
    this.subscriptions.add(
      this.listService
        .upsertListPageViewDetails(this.viewDetails, this.moduleId)
        .pipe(
          tap((resp) => (this.viewDetails = { ...this.viewDetails, viewId: resp.viewId })),
          switchMap((res) => {
            if (!isUpdate) {
              return this.listService.updateDefaultView(this.moduleId, res.viewId);
            }
            return of(res.viewId);
          }),
          finalize(() => (this.isSaving = false))
        )
        .subscribe(
          (response) => {
            this.sharedService.setViewDetailsData({
              isUpdate,
              viewDetails: this.viewDetails,
            });
            this.close();
          },
          (error) => {
            console.error('Exception while persist table view');
          }
        )
    );
  }

  /**
   * While change checkbox state ..
   * @param fld changeable checkbox
   */
  selectionChange(fld: FieldMetaData) {
    const selIndex = this.viewDetails.fieldsReqList.findIndex((f) => f.fieldId === fld.fieldId);
    if (selIndex !== -1) {
      this.viewDetails.fieldsReqList.splice(selIndex, 1);
      this.viewFieldsMetadata = this.viewFieldsMetadata.filter((field) => field.fieldId !== fld.fieldId);
    } else {
      const fieldView = new ListPageViewFldMap();
      fieldView.fieldId = fld.fieldId;
      fieldView.isEditable = false;
      this.viewDetails.fieldsReqList.push(fieldView);
      this.viewFieldsMetadata.push(fld);
    }
  }

  /**
   * checked is checked
   * @param fld field for checking is selected or not
   */
  isChecked(fld: FieldMetaData): boolean {
    const selCheck = this.viewDetails.fieldsReqList.findIndex((f) => (f.fieldId ? f.fieldId : f) === fld.fieldId);
    return selCheck !== -1 ? true : false;
  }

  /**
   * While drag and drop on list elements
   * @param event dragable elemenet
   */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  editableChange(fld: FieldMetaData) {
    const field = this.viewDetails.fieldsReqList.find((f) => f.fieldId === fld.fieldId);
    if (field) {
      field.isEditable = !field.isEditable;
    }
  }

  searchField(event) {
    if (this.selectedSegment === 'all') {
      this.searchFieldSub.next(event);
    } else {
      this.filterSelectedFields();
      this.selectedMetadataFldList = this.selectedMetadataFldList.filter((fld) => {
        return fld.fieldDescri.toLowerCase().includes(event.toLowerCase());
      });
      this.selectedMetadataFldList = uniq(this.selectedMetadataFldList, 'fieldId');
    }
  }

  filterSelectedFields() {
    this.allMetadataFields.forEach((fld) => {
      if (this.viewDetails.fieldsReqList.findIndex((f) => (f.fieldId ? f.fieldId : f) === fld.fieldId) > -1) {
        this.selectedMetadataFldList.push(fld);
      }
    });
  }

  isEditEnabled(fld: FieldMetaData) {
    return this.viewDetails.fieldsReqList.findIndex((field) => field.fieldId === fld.fieldId && field.isEditable) !== -1;
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
