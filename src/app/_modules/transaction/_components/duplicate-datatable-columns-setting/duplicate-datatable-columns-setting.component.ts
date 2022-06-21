import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FieldMetaData } from '@models/core/coreModel';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { CoreService } from '@services/core/core.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { size } from 'lodash';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'pros-duplicate-datatable-columns-setting',
  templateUrl: './duplicate-datatable-columns-setting.component.html',
  styleUrls: ['./duplicate-datatable-columns-setting.component.scss']
})
export class DuplicateDatatableColumnsSettingComponent implements OnInit, OnDestroy {

  /**
   * Hold current module id
   */
  moduleId: string;

  subscriptions: Subscription = new Subscription();

  submitted = false;

  fieldsPageIndex = 0;

  moduleFieldsMetatdata: FieldMetaData[] = [];

  selectedFieldsMetadata: FieldMetaData[] = [];

  suggestedFieldsMetadata: FieldMetaData[] = [];

  systemFields: FieldMetaData[] = [
    { fieldId: 'DATECREATED', fieldDescri: 'Created on' },
    { fieldId: 'DATEMODIFIED', fieldDescri: 'Modified on' },
    { fieldId: 'USERCREATED', fieldDescri: 'Created by' },
    { fieldId: 'USERMODIFIED', fieldDescri: 'Modified by' },
    { fieldId: 'STATUS', fieldDescri: 'Status' }] as FieldMetaData[];

  searchFieldSub: Subject<string> = new Subject();

  fieldsSearchString = '';

  allMetadataFields: FieldMetaData[] = [];

  @ViewChild('searchInput') searchInput: SearchInputComponent;

  selectedFields: string[] = [];

  selectedTabIndex = 0;

  constructor(
    private dialogRef: MatDialogRef<Component>,
    @Inject(MAT_DIALOG_DATA) public data,
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string
  ) { }

  ngOnInit() {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';

    if (this.data) {
      this.moduleId = this.data.moduleId;
      this.getModuleFldMetadata();

      const fieldsList = this.data.selectedColumns || [];
      if(fieldsList.length) {
        this.getSelectedFieldsMetadata(fieldsList);
      }
    }

    this.subscriptions.add(
      this.searchFieldSub.pipe(debounceTime(200), distinctUntilChanged()).subscribe((searchString) => {
        this.fieldsSearchString = searchString || '';
        this.getModuleFldMetadata();
      })
    );
  }

  /**
   * Change event of segments to set selected metadata fld list
   * @param selectedSegment selected segment
   */
  selectedTabChange(index) {
    this.selectedTabIndex = index;
    if (this.searchInput) {
      this.searchInput.clearSearch();
    }
    this.moduleFieldsMetatdata = this.allMetadataFields;
    this.mergeFieldsMetadata();
  }

  /**
   * Get module fields metadata
   */
  getModuleFldMetadata(loadMore?: boolean) {

    if(this.selectedTabIndex === 1) {
      this.mergeFieldsMetadata();
      return;
    }

    if (this.moduleId === undefined || this.moduleId.trim() === '') {
      throw new Error('Module id cant be null or empty');
    }

    if (loadMore) {
      this.fieldsPageIndex++;
    } else {
      this.fieldsPageIndex = 0;
    }

    this.subscriptions.add(
      this.coreService.getMetadataByFields(this.moduleId, this.fieldsPageIndex, this.fieldsSearchString, 20, this.locale).subscribe(
        (response) => {
          if (size(response) > 0) {
            loadMore ? (this.moduleFieldsMetatdata = this.moduleFieldsMetatdata.concat(response)) : this.moduleFieldsMetatdata = response;
            if (this.fieldsSearchString === '') {
              this.allMetadataFields = this.moduleFieldsMetatdata;
            }
          } else if (loadMore) {
            this.fieldsPageIndex--;
          } else {
            this.moduleFieldsMetatdata = [];
          }
          this.mergeFieldsMetadata();
        },
        (error) => {
          console.error(`Error : ${error.message}`);
          if (loadMore) {
            this.fieldsPageIndex--;
          }
        }
      )
    );
  }

  /**
   * Get view fields metadata
   */
  getSelectedFieldsMetadata(fieldIds: string[]) {
    if (!fieldIds || !fieldIds.length) {
      return;
    }

    const systemFields = this.systemFields.filter(field => fieldIds.includes(field.fieldId));
    fieldIds = fieldIds.filter(fieldId => !this.isSystemField(fieldId));

    if(!fieldIds.length) {
      this.selectedFieldsMetadata = systemFields;
      this.mergeFieldsMetadata();
      return;
    }
    this.subscriptions.add(
      this.coreService.getMetadatFieldsByFields({fieldIds}, this.moduleId, this.locale).subscribe(
        (response) => {
          this.selectedFieldsMetadata = systemFields.concat(this.coreService.mapFldMetadata(response));
          this.mergeFieldsMetadata();
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
    this.suggestedFieldsMetadata.forEach(fld => {
      const fieldPosition = this.selectedFieldsMetadata.findIndex((field) => field.fieldId === fld.fieldId);
      if (fieldPosition !== -1) {
        moveItemInArray(this.selectedFieldsMetadata, fieldPosition, ++index);
      }
    });
  }

  /**
   * merge view fields and module fields
   */
  mergeFieldsMetadata() {
    const filteredSelectedFields = this.selectedFieldsMetadata
      .filter(field => field.fieldDescri.toLocaleLowerCase().includes(this.fieldsSearchString.toLocaleLowerCase()));
    const filteredSystemFields = this.systemFields
      .filter(field => !this.selectedFieldsMetadata.some(fld => fld.fieldId === field.fieldId)
        && field.fieldDescri.toLocaleLowerCase().includes(this.fieldsSearchString.toLocaleLowerCase()));

    const moduleFields = this.moduleFieldsMetatdata.filter((field) => !this.selectedFieldsMetadata.some((f) => f.fieldId === field.fieldId));
    this.suggestedFieldsMetadata = filteredSelectedFields.concat(filteredSystemFields).concat(moduleFields);
  }

  /**
   * close sidesheet
   */
  close(response?) {
    this.dialogRef.close(response);
  }

  /**
   * Save view details
   */
  public save() {
    this.FldMetadataOrders();
    const selectedColumns = this.selectedFieldsMetadata.map(field => field.fieldId);
    this.close({fromTable: false, selectedColumns});
  }

  /**
   * While change checkbox state ..
   * @param fld changeable checkbox
   */
  selectionChange(fld: FieldMetaData) {
    const selIndex = this.selectedFieldsMetadata.findIndex(field => field.fieldId === fld.fieldId);
    if (selIndex !== -1) {
      this.selectedFieldsMetadata = this.selectedFieldsMetadata.filter((field) => field.fieldId !== fld.fieldId);
    } else {
      this.selectedFieldsMetadata.push(JSON.parse(JSON.stringify(fld)));
    }
  }

  /**
   * checked is checked
   * @param fld field for checking is selected or not
   */
  isChecked(fld: FieldMetaData): boolean {
    const selCheck = this.selectedFieldsMetadata.findIndex(field => field.fieldId === fld.fieldId);
    return selCheck !== -1 ? true : false;
  }

  /**
   * While drag and drop on list elements
   * @param event dragable elemenet
   */
  drop(event: CdkDragDrop<string[]>) {
    const fieldId = event.item.data;
    const shiftValue = !this.isSystemField(fieldId) ? this.systemFields.length : 0;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex + shiftValue, event.currentIndex + shiftValue);
    }
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  isSystemField(fieldId) {
    return this.systemFields.some(fld => fld.fieldId === fieldId);
  }

  showField(field) {
    return ((this.selectedTabIndex===0) && !this.isSystemField(field.fieldId))
          || ((this.selectedTabIndex===1) && this.isSystemField(field.fieldId));
  }
}
