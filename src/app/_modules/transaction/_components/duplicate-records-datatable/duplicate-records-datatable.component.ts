import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FieldMetaData } from '@models/core/coreModel';
import { CoreService } from '@services/core/core.service';
import { ListService } from '@services/list/list.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';
import { SchemaService } from '@services/home/schema.service';
import { CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { DuplicateRecordsDataSource } from './duplicate-records-data-source';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { DuplicateDatatableColumnsSettingComponent } from '../duplicate-datatable-columns-setting/duplicate-datatable-columns-setting.component';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { dataControlServiceFactory, transactionServiceFactory } from '@modules/transaction/_service/service-instance-sharing.service';

@Component({
  selector: 'pros-duplicate-records-datatable',
  templateUrl: './duplicate-records-datatable.component.html',
  styleUrls: ['./duplicate-records-datatable.component.scss'],
  providers: [
    {provide: TransactionService, useFactory: transactionServiceFactory},
    {provide: DataControlService, useFactory: dataControlServiceFactory}
  ]
})
export class DuplicateRecordsDatatableComponent implements OnInit {

  moduleId: string;

  brId: string;

  coreSchemaBrInfo: CoreSchemaBrInfo;

  dataSource: DuplicateRecordsDataSource;

  staticColumns: string[] = ['_settings', 'score', 'OBJECTNUMBER'];

  displayedColumns: BehaviorSubject<string[]> = new BehaviorSubject(this.staticColumns);

  metadataFldLst: FieldMetaData[] = [];

  showSkeleton = false;

  subscriptionsList: Subscription[] = [];

  /**
   * default datatable page size
   */
  recordsPageSize = 50;

  /**
   * for table records paging
   */
  recordsPageIndex = 1;

  searchTerm = '';

  subscriptions: Subscription = new Subscription();

  dialogSubscriber = new Subscription();

  systemFields: FieldMetaData[] = [
    { fieldId: 'DATECREATED', fieldDescri: 'Created on', picklist:'52' },
    { fieldId: 'DATEMODIFIED', fieldDescri: 'Modified on', picklist:'52' },
    { fieldId: 'USERCREATED', fieldDescri: 'Created by' },
    { fieldId: 'USERMODIFIED', fieldDescri: 'Modified by' },
    { fieldId: 'STATUS', fieldDescri: 'Status' }] as FieldMetaData[];

  constructor(@Inject(LOCALE_ID) public locale: string,
    private listService: ListService,
    private coreService: CoreService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private schemaService: SchemaService,
    private transactionService: TransactionService,
    private globaldialogService: GlobaldialogService
    ) { }

  ngOnInit(): void {

    this.subscriptions.add(
      this.activatedRoute.params.subscribe((params) => {
        if(params.moduleId && this.moduleId !== params.moduleId) {
          this.moduleId = params.moduleId;
          this.dataSource = new DuplicateRecordsDataSource(this.transactionService);
          this.dataSource.getData(this.recordsPageIndex, this.recordsPageSize, this.searchTerm);
        }
        if(params.brId && this.brId !== params.brId) {
          this.brId = params.brId;
          this.getBusinessRuleInfo(this.brId);
        }
      })
    );
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }

  openTableColumnsSetting() {
    const selectedColumns = this.displayedColumns.getValue().filter(fieldId => !this.isStaticCol(fieldId));
    // Open dialog for table columns setting
    this.globaldialogService.openDialog(DuplicateDatatableColumnsSettingComponent,
    {
      moduleId: this.moduleId,
      selectedColumns
    },
    {
      width: '600px',
      maxWidth: '600px'
    });

    this.dialogSubscriber = this.globaldialogService.dialogCloseEmitter
      .pipe(distinctUntilChanged())
      .subscribe((response: any) => {
        if(response) {
          const activeColumns = response.selectedColumns || [];
          this.displayedColumns.next(Array.from(new Set(this.staticColumns.concat(activeColumns))));
          let fieldsWithoutMetatdata = activeColumns.filter(fieldId => !this.systemFields.some(field => field.fieldId === fieldId));
          fieldsWithoutMetatdata = fieldsWithoutMetatdata.filter(fieldId => !this.metadataFldLst.some(field => field.fieldId === fieldId));
          if(fieldsWithoutMetatdata.length) {
            this.getFldMetadata(fieldsWithoutMetatdata);
          }
        }
        this.dialogSubscriber.unsubscribe();
    });
  }

  /**
   * check if a column is static
   * @param colId column id
   */
  isStaticCol(colId: string) {
    return this.staticColumns.includes(colId);
  }

  getFieldType(fieldId) {
    const systemField = this.systemFields.find((f) => f.fieldId === fieldId);
    if (systemField) return this.listService.getFieldType(systemField.picklist);
    const field = this.metadataFldLst.find((f) => f.fieldId === fieldId);
    return this.listService.getFieldType(field?.picklist);
  }

  /**
   * Get all fld metada based on module of schema
   */
  getFldMetadata(fieldIds: string[]) {
    this.locale = 'en';
    const sub = this.coreService.getMetadatFieldsByFields({fieldIds}, this.moduleId, this.locale).subscribe(
      (response) => {
        this.metadataFldLst = this.metadataFldLst.concat(this.coreService.mapFldMetadata(response));
      },
      (error) => {
        console.error(`Error : ${error.message}`);
      }
    );
    this.subscriptionsList.push(sub);
  }

  formatHtmlCell(text) {
    return text ? text.replace(/<[^>]*>?/gm, ''): '';
  }

  get displayedRecordsRangeValue() {
    const endRecord =
      this.recordsPageIndex * this.recordsPageSize < this.dataSource.docLength ? this.recordsPageIndex * this.recordsPageSize : this.dataSource.docLength;
    return this.dataSource.docLength ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.dataSource.docLength}` : '';
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      this.dataSource.getData(this.recordsPageIndex, this.recordsPageSize, this.searchTerm);
    }
  }

  /**
   * get field description based on field id
   * @param fieldId field id
   * @returns field description
   */
   getFieldDesc(fieldId: string): string {
    const systemField = this.systemFields.find((f) => f.fieldId === fieldId);
    if (systemField) return systemField?.fieldDescri || 'Unknown';
    const field = this.metadataFldLst.find((f) => f.fieldId === fieldId);
    return field ? field.fieldDescri || fieldId : fieldId;
  }

  /**
   * get businessrule data from api to patch in sidesheet
   */
   getBusinessRuleInfo(brId) {
    this.schemaService.getBusinessRuleInfo(brId).subscribe((businessRuleInfo: CoreSchemaBrInfo) => {
      this.coreSchemaBrInfo = businessRuleInfo;
      const duplicacyFields = this.coreSchemaBrInfo?.duplicacyField.map(field => field.fieldId);
      if(duplicacyFields?.length) {
        this.displayedColumns.next(Array.from(new Set(this.staticColumns.concat(duplicacyFields))));
        this.getFldMetadata(duplicacyFields);
      }
    }, error => console.error(`Error : ${error.message}`));
  }

  isDuplicatedField(row, fieldId) {
    return row._duplicatedFields?.fieldData?.includes(fieldId);
  }
}
