import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { Dataset, FilterType, SchemaCriteria, SchemaListReq } from '@models/schema/schema';
import { BusinessRuleType, RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { CoreService } from '@services/core/core.service';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, take } from 'rxjs/operators';

export class DiwListDataSourceResponse {
  docs: DiwListDataSource[];
  totalCount: number;
}

export class DiwListDataSource {
  brs: [{
    brId: string,
    brDescription: string,
    brType: BusinessRuleType
  }];
  correctedCnt: number;
  createdBy: string;
  dateModified: string;
  errorCnt: number;
  exeEndDate: string;
  exeStrtDate: string;
  moduleDesc: string;
  moduleId: string;
  outdatedCnt: number;
  runId: string;
  running: boolean;
  schemaDescription: string;
  schemaId: string;
  skippedCnt: number;
  successCnt: number;
  totalCnt: number;
}
@Component({
  selector: 'pros-diw-list',
  templateUrl: './diw-list.component.html',
  styleUrls: ['./diw-list.component.scss']
})
export class DiwListComponent implements OnInit, OnDestroy {
  @ViewChild('table') table: MatTable<any>;

  /**
   * Columns
   */
  displayedFields = ['_row_sel','_row_actions','schema','dataset','business_rules','result','started','finished','exe_by'];

  /**
   * Datasource ...
   */
  dataSource: DiwListDataSource[] = [];

  /**
   * FormControl for searching the schemas. ...
   */
  search: FormControl = new FormControl('');

  /**
   * FormControl for searching the business rules ..
   */
  searchBrs: FormControl = new FormControl('');


  /**
   * FormControl for seraching the datasets ...
   */
  serachDataset: FormControl = new FormControl('');

  /**
   * Susbcriptions ..
   */
  subscriptions: Subscription[] = [];

  /**
   * Filtercriteria for the schema request
   */
  filterCriteria: BehaviorSubject<SchemaListReq> = new BehaviorSubject<SchemaListReq>({from:0,size:100,schemaCriteria:[], searchString:'',sort:{}});

  /**
   * All applied business rule store here ...
   */
  appliedBrList: BusinessRules[] = [];

  /**
   * Business rule which will use for filter the list based on this ....
   */
  filterableRulesOb: Observable<BusinessRules[]> = of(RULE_TYPES);

  /**
   * Business rule which will use for filter the list based on this ....
   */
   filterableDatasetOb: Observable<Dataset[]> = of([]);

   /**
    * All applied business rule store here ...
    */
   appliedDatasetList: Dataset[] = [];

   /**
    * All business rules ...
    */
   businessRuleTypes: BusinessRules[] = RULE_TYPES;

   /**
    * Loading state for loaders
    */
   dataLoaders = {
     loadTable: false,
     tableHasData: false
   }

   paginationCtrl = {
     currentPage: 1,
     pageSize: 20,
     totalCnt: 0
   };
   totalData = [];
   showLoader = false;

   selection = new SelectionModel<any>(true, []);

   brRuleFilterDesc: string []= ["ALL"];
   brDatasetDesc: string []= ["ALL"];
   /**
    * Emiiter for open the specific tab ...
    */
   @Output()
   openTab: EventEmitter<any> = new EventEmitter(null);

  constructor(
    private schemaService: SchemaService,
    private toasterService: TransientService,
    private coreService: CoreService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s=>{
      s.unsubscribe();
    });
    this.filterCriteria.complete();
    this.filterCriteria.unsubscribe();
  }

  ngOnInit(): void {

    // get all the schema list ...
    this.filterCriteria.subscribe(f=>{
      this.doFilter(f);
    });


    this.subscriptions.push(this.search.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(v=>{
      this.filterCriteria.getValue().searchString = v;
      this.filterCriteria.next(this.filterCriteria.getValue());
    }));

    // get the all rules
    this.getRules();

    this.subscriptions.push(this.searchBrs.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(v=>{
      this.filterableRulesOb = of(this.businessRuleTypes.filter(f=> f.ruleDesc.toLowerCase().indexOf(v.toLowerCase()) !== -1 ));
    }));

    this.subscriptions.push(this.serachDataset.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(r=>{
      this.datasets(r);
    }));

    // get all the datasets ...
    this.datasets();

    this.subscriptions.push(this.schemaService.getRefeshSchemaList().subscribe((res) => {
      if (res) {
        this.doFilter(this.filterCriteria.getValue());
      }
    }));
  }

  /**
   * use this method to update the UI after dynamic columns are displayed
   */
   updateTableStyling() {
    this.ngZone.onMicrotaskEmpty.pipe(take(3)).subscribe(() => {
      this.table?.updateStickyColumnStyles();
      this.table?.updateStickyHeaderRowStyles();
      this.table?.updateStickyFooterRowStyles();
    });
  }

  // public getRuleType(ruleType: string) {
  //   return BusinessRuleType
  // }

  public getRuleDesc(ruleType: string) {
   return RULE_TYPES.find((rule) => rule.ruleType === ruleType)?.ruleDesc;
  }

  public getUniqueRuleNames(brs: any): string[] {
    return Array.from(new Set(brs.map(br => br.brType)));
  }



  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.forEach(row => this.selection.select(row));
  }

  /**
   * Data filter ...
   * @param req reuquest for filter the data
   */
  doFilter(req: SchemaListReq) {
    this.showLoader = true;
    const sub = this.schemaService.diwList(req).pipe(finalize(() => this.showLoader = false)).subscribe(res=>{
      this.selection.clear();
      this.paginationCtrl.currentPage = 1;
      this.totalData = res?.docs || [];
      this.paginationCtrl.totalCnt = res?.totalCount || 0;
      this.dataSource = this.totalData.slice(0, this.paginationCtrl.pageSize);
      this.updateTableStyling();
    }, err=>{
      this.dataLoaders.loadTable = false;
      this.dataSource = [];
      console.error(`Exception : ${err}`);
    });

    this.subscriptions.push(sub);
  }

  goTo(ev) {
    if (ev) {
      this.paginationCtrl.currentPage = ev.pageIndex;
      this.dataSource = this.totalData.slice(((this.paginationCtrl.currentPage - 1)*this.paginationCtrl.pageSize), this.paginationCtrl.currentPage*this.paginationCtrl.pageSize);
      this.updateTableStyling();
    }
  }

  /**
   * Update the filter criteria ...
   * @param fieldId the field id ...
   * @param value will be an array for the same
   */
  updateFilterCriteria(fieldId: string, value: any) {
    const val =  this.filterCriteria.getValue();
    const currentEle = val.schemaCriteria.find(f=> f.criteria === fieldId);
    value = Array.isArray(value) ? value : [value];
    if(currentEle) {
      if(fieldId === FilterType.NEW || fieldId === FilterType.RUNNING) {
        currentEle.values = !value[0] ? [] : value;
      } else if(value.length >0){
        currentEle.values = [];
        currentEle.values.push(...value);
        currentEle.values = Array.from(new Set(currentEle.values));
      } else {
        currentEle.values = [];
      }

    } else {
      const obj = {criteria:fieldId, values:value ? value : []} as SchemaCriteria;
      val.schemaCriteria.push(obj);
    }
    this.filterCriteria.next(val);
  }

  get filterHasValue() {
    return this.filterCriteria.getValue();
  }

  /**
   * Get the filtered applied description dynamic ...
   */
   /* get brRuleFilterDesc() {
    return this.appliedBrList.length > 0 ? (this.appliedBrList.length === 1 ? this.appliedBrList[0].ruleDesc : this.appliedBrList.length) : 'All';
  } */

  /**
   * Get the filtered applied description dynamic ...
   */
  /*  get brDatasetDesc() {
    return this.appliedDatasetList.length > 0 ? (this.appliedDatasetList.length === 1 ? this.appliedDatasetList[0].moduleDesc : this.appliedDatasetList.length) : 'All';
  } */

  /**
   * Delete the schema based on schema id ...
   * @param schemaId delete this element from table ..
   */
  deleteSchema(schemaId: string) {

    this.toasterService.confirm(
      {
        data: { dialogTitle: 'Confirmation', label: `Are you sure you want to delete this ?` },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if('yes' === response) {
          this.subscriptions.push(this.schemaService.deleteSChema(schemaId)
          .subscribe(resp => {
            // refresh after delete ...
            this.doFilter(this.filterCriteria.getValue());
          }, error => {
            this.toasterService.open('Something went wrong', 'ok', { duration: 2000 });
          }));
        }
      }
    );
  }

  /**
   * Get all the rules ...
   */
  getRules(s?: string) {
    // this.filterableRulesOb = this.schemaService.getAllBusinessRules(s);
  }

  /**
   *
   * @param br buisness rule which going to select or deselect ....
   * @param state checkbox state ....
   */
   addFilterFromBrRule(br: BusinessRules, state: boolean) {
    if (state && !this.appliedBrList.some(s => s.ruleType === br.ruleType)) {
      this.appliedBrList.push(br);
    } else {
      this.appliedBrList.splice(this.appliedBrList.findIndex(f => f.ruleType === br.ruleType), 1);
    }
  }


  /**
   *
   * @param br buisness rule which going to select or deselect ....
   * @param state checkbox state ....
   */
   addFilterFromDataset(br: Dataset, state: boolean) {
    if (state && !this.appliedDatasetList.some(s => s.moduleId === br.moduleId)) {
      this.appliedDatasetList.push(br);
    } else {
      this.appliedDatasetList.splice(this.appliedDatasetList.findIndex(f => f.moduleId === br.moduleId), 1);
    }
  }

  /**
   * Check whether current business rule applied or not
   * @param ckbox the current business rule ...
   * @returns will return true if exits otherwise return false
   */
   isBrAppliedChecked(ckbox: BusinessRules): boolean {
    return this.appliedBrList.some(s => s.ruleType === ckbox.ruleType)
  }

  /**
   * Check whether current business rule applied or not
   * @param ckbox the current business rule ...
   * @returns will return true if exits otherwise return false
   */
   isDatasetAppliedChecked(ckbox: Dataset): boolean {
    return this.appliedDatasetList.some(s => s.moduleId === ckbox.moduleId)
  }

  /**
   * Apply the selected business rules ...
   */
  apply(type: any, forRset?: boolean) {
    if(type === FilterType.BRTYPE) {
      this.brRuleFilterDesc = forRset ? ['ALL'] : Array.from(new Set(this.appliedBrList.map(m=> m.ruleDesc)));
      this.updateFilterCriteria('BRTYPE', forRset ? [] : this.appliedBrList.map(m=> m.ruleType));
    } else if(type === FilterType.DATASETS) {
      this.brDatasetDesc = forRset? ['ALL'] :  Array.from(new Set(this.appliedDatasetList.map(m=> m.moduleDesc)));
      this.updateFilterCriteria('DATASETS', forRset? [] : this.appliedDatasetList.map(m=> m.moduleId));
    }

  }

  /**
   * Get the percentage for the status of execution
   * @param type will be success | error | skipped | corrections
   * @param rIndex the row index
   * @returns the percentage for the same
   */
  getStats(type: string, rIndex: number) {
    const data = this.dataSource[rIndex];
    data[type] = data[type] ? data[type] : 0;
    return Math.ceil((data[type] / data.totalCnt) * 100);
  }

  /**
   * Get all datasets list ...
   * @param s serachstring ...
   */
  datasets(s?: string) {
   this.filterableDatasetOb =  this.coreService.getDataSets(s);
  }

  /**
   * The schema wich will become the tabs
   * @param schemaId the schema id which needs to open
   */
  openSchemaTab(schemaId: string, view = 'details', schemaDetails) {
    this.schemaService.setActiveTabDetails(schemaDetails);
    this.openTab.emit({schemaId, view});
  }

  openChckData(row: DiwListDataSource) {
    this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${row.moduleId}/${row.schemaId}` } }], { queryParamsHandling: 'preserve' })
  }

  exportSchema(schemaId) {
    this.schemaService.exportSchema(schemaId)
      .subscribe(resp => {
        console.log(resp)
        this.toasterService.open('The schema configuration has been exported', '', { duration: 2000 });
      }, error => {
        this.toasterService.alert({
          data: {dialogTitle: 'Alert', label: `There was an error exporting the schema: ${error?.message}`},
          disableClose: true,
          autoFocus: false,
          width: '600px',
          panelClass: 'create-master-panel',
        }, (response) => {});
      });
  }

  /**
   * Check the NEW or RUNNING is selected or not
   * @param type its may be NEW || RUNNING
   * @returns will return true or false for same
   */
  isSelected(type: string) {
    return this.filterCriteria.getValue()?.schemaCriteria?.find(f=> f.criteria === type)?.values[0];
  }

  cancelSchema(schemaId) {
    const sub = this.schemaService.cancleSchema(schemaId).pipe(finalize(() => { this.doFilter(this.filterCriteria.getValue()) })).subscribe((res) => {
      this.toasterService.open('Cancelled schema run successfully', undefined, { duration: 2000 });
    }, (err) => {
      console.log(err.message);
      this.toasterService.open('Something went wrong', undefined, { duration: 2000 });
    });
    this.subscriptions.push(sub);
  }
}
