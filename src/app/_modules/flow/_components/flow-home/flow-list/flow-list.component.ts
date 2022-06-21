import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Dataset, FilterType, SchemaListReq, SchemaCriteria } from '@models/schema/schema';
import { BusinessRuleType, RULE_TYPES } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { TaskListService } from '@services/task-list.service';
import { UserService } from '@services/user/userservice.service';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  selector: 'pros-flow-list',
  templateUrl: './flow-list.component.html',
  styleUrls: ['./flow-list.component.scss']
})
export class FlowListComponent implements OnInit, OnDestroy {

  allDataSource = [];
  /**
   * Columns
   */
  displayedFields = ['flow', 'reference_datasets', 'status', 'created', 'last_modified', 'modified_by'];

  /**
   * Datasource ...
   */
  dataSource = [];

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
  filterCriteria: BehaviorSubject<SchemaListReq> = new BehaviorSubject<SchemaListReq>({ from: 0, size: 10, schemaCriteria: [], searchString: '', sort: {} });

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
   * All status...
   */
  status = ['Configured', 'Not Configured', 'Not Defined'];

  dataLoaderSubject = new BehaviorSubject<any>({
    loadTable: false,
    tableHasData: false,
  });


  constructor(
    private coreService: CoreService,
    private router: Router,
    private taskListService: TaskListService,
    private sharedServices: SharedServiceService,
    private userService: UserService
  ) { }
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.filterCriteria.complete();
    this.filterCriteria.unsubscribe();
  }

  ngOnInit(): void {
    this.subscriptions.push(this.search.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(searchString => {
      if (!searchString)
        this.dataSource = [...this.allDataSource]
      else
        this.dataSource = [...this.allDataSource].filter(x => x.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1);
    }));

    this.subscriptions.push(this.searchBrs.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(v => {
      this.filterableRulesOb = of(this.businessRuleTypes.filter(f => f.ruleDesc.toLowerCase().indexOf(v.toLowerCase()) !== -1));
    }));

    this.subscriptions.push(this.serachDataset.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(r => {
      this.datasets(r);
    }));

    // get all the datasets ...
    this.datasets();
    this.getFlowListData();
  }

  get dataLoadersValue() {
    return this.dataLoaderSubject.getValue();
  }

  getFlowListData() {
    this.dataLoaderSubject.next({ loadTable: true, tableHasData: false });
    this.subscriptions.push(this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      this.taskListService.getFlowListData(user.plantCode).subscribe(
        (res) => {
          if(!this.dataLoadersValue?.tableHasData) {
            this.dataLoaderSubject.next({ loadTable: false, tableHasData: !!res?.length });
          } else {
            this.dataLoaderSubject.next({ loadTable: false, tableHasData: false });
          }
          this.dataSource = res;
          //Changing Datasets array to string form
          this.dataSource.forEach((ele)=>{
            let allDatasets= ele.refrenceDataSets.join();
            ele.refrenceDataSets = allDatasets;
          })
          this.allDataSource = res;
        },
        (error) => {
          this.dataLoaderSubject.next({ loadTable: false, tableHasData: false });
          console.error(`Error : ${error.message}`);
        }
      );
    }, err => {
      this.dataLoaderSubject.next({ loadTable: false, tableHasData: false });
    }));
  }

  /**
   * Update the filter criteria ...
   * @param fieldId the field id ...
   * @param value will be an array for the same
   */
  updateFilterCriteria(fieldId: string, value: any) {
    const val = this.filterCriteria.getValue();
    const currentEle = val.schemaCriteria.find(f => f.criteria === fieldId);
    value = Array.isArray(value) ? value : [value];
    if (currentEle) {
      if (fieldId === FilterType.NEW || fieldId === FilterType.RUNNING) {
        currentEle.values = !value[0] ? [] : value;
      } else if (value.length > 0) {
        currentEle.values.push(...value);
        currentEle.values = Array.from(new Set(currentEle.values));
      } else {
        currentEle.values = [];
      }

    } else {
      const obj = { criteria: fieldId, values: value ? value : [] } as SchemaCriteria;
      val.schemaCriteria.push(obj);
    }
    this.filterCriteria.next(val);
  }

  /**
   * Get the filtered applied description dynamic ...
   */
  get brRuleFilterDesc() {
    return this.appliedBrList.length > 0 ? (this.appliedBrList.length === 1 ? this.appliedBrList[0].ruleDesc : this.appliedBrList.length) : 'All';
  }

  /**
   * Get the filtered applied description dynamic ...
   */
  get brDatasetDesc() {
    return this.appliedDatasetList.length > 0 ? (this.appliedDatasetList.length === 1 ? this.appliedDatasetList[0].moduleDesc : this.appliedDatasetList.length) : 'All';
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
    if (type === FilterType.BRTYPE) {
      this.updateFilterCriteria('BRTYPE', forRset ? [] : this.appliedBrList.map(m => m.ruleType));
    } else if (type === FilterType.DATASETS) {
      this.updateFilterCriteria('DATASETS', forRset ? [] : this.appliedDatasetList.map(m => m.moduleId));
    }

  }


  /**
   * Get all datasets list ...
   * @param s serachstring ...
   */
  datasets(s?: string) {
    this.filterableDatasetOb = this.coreService.getDataSets(s);
  }

  openSidesheet(element) {
    this.taskListService.referenceDatasetResponse = element.refrenceDataSets;
    this.sharedServices.setFlowData(element);
    this.router.navigate([{ outlets: { sb: `sb/flow/sidesheet/${element.id}` } }], { queryParamsHandling: 'preserve' });
  }
}
