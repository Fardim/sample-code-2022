import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { debounce } from 'lodash';
import { ListValue } from '@models/list-page/listpage';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Observable, of, Subscription } from 'rxjs';
import { RuleService } from '@services/rule/rule.service';
import { ListService } from '@services/list/list.service';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { FilterCriteria } from '@models/schema/schemadetailstable';
import { DataReferenceTabDetails } from '@modules/transaction/model/transaction';
import { Utilities } from '@models/schema/utilities';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-transaction-dataref',
  templateUrl: './transaction-dataref.component.html',
  styleUrls: ['./transaction-dataref.component.scss']
})
export class TransactionDatarefComponent extends TransactionControlComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() allowSingleSelect: boolean;
  @ViewChild('optionsInput') optionsInput: ElementRef<HTMLInputElement>;
  @ViewChild('autocompleteTrigger') matACTrigger: MatAutocompleteTrigger;
  intialCall = false;
  selectedOptions: ListValue[] = [];
  optionList: Observable<Array<ListValue>> = of([]);

  /**
   * Susbcriptions ..
   */
  subscriptions: Subscription[] = [];
  /**
   * Search the dropdown options..
   */
  delayedCallWithTransLib = debounce((searchText: string) => {
    this.getOptions(searchText);
  }, 400);

  get isRecordExists() {
    return this.optionsInput && this.optionsInput.nativeElement.value ? true : false;
  }

  get isNewRecordExists() {
    return this.newRecordDetails && !this.isRecordExists;
  }

  constructor(
    private router: Router,
    private listService: ListService,
    private ruleService: RuleService,
    public transService: TransactionService,
    private sharedServices: SharedServiceService,
    public dataControlService: DataControlService,
    private cd: ChangeDetectorRef,
    private utilityService: Utilities,
    private transiantService: TransientService,
  ) {
    super(transService, dataControlService);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }

  ngOnInit(): void {
    super.ngOnInit();
    // this.getOptions();
  }

  ngAfterViewInit(): void {

    this.subscriptions.push(this.sharedServices.getModuleListData.subscribe(val => {
      if (val.fromType === 'datatable' && val.data)
        this.setDropdownData(val.data);
    }));

    if (this.control.value && this.control.value.length) {
      this.control.value.forEach((item) => {
        const displayValue = item.text || item.code;
        if (displayValue) {
          if (!item.id)
            item.id = displayValue;
          this.selectedOptions.push(item);
          if (this.allowSingleSelect && this.optionsInput) this.optionsInput.nativeElement.value = displayValue;
        }
      });
    }

    this.cd.detectChanges();
  }

  /**
   * Search the transformation rule ...
   * @param searchStr search the rule based on this params
   */
  searchOption(searchStr: string) {
    this.delayedCallWithTransLib(searchStr);
  }
  /**
   * get options values for autocomplete
   * @param str pass the search string
   */
  getOptions(str: string): void {
    this.intialCall = true;
    const refObj = this.fieldObj.fieldCtrl.refDataset;
    const refObjFld = this.fieldObj.fieldCtrl.refDatasetField;
    const lookupRuleId = this.fieldObj.fieldCtrl?.lookupRuleId;

    if (!refObj || !refObjFld) {
      throw new Error(`Reference mapping not found ... please map that `);
    }
    // inline serach request
    const request: FilterCriteria = new FilterCriteria();
    request.fieldId = refObjFld?.fieldId;
    request.esFieldPath = `hdvs.${request.fieldId}`;
    request.operator = 'CONTAINS';
    request.values = [str];
    request.type = 'INLINE';

    this.listService.getTableData(String(refObj?.datasetId), '', 1, [request] as any, lookupRuleId ? lookupRuleId : '').subscribe(res => {
      this.optionList = of(res);
    }, error => {
      console.error(`Error : ${error.message}`);
    });
  }

  inputFocus() {
    if (!this.intialCall) {
      this.getOptions('');
    }
  }
  /**
   * get display value for autocomplete
   * @param value pass the selected value Object
   * @returns the field label
   */
  formatValue(value: ListValue): string {
    if (value) {
      return value.text || value.id;
    }
  }

  selected(event: MatAutocompleteSelectedEvent, isSingleSelect: boolean): void {
    const selectedObj = event.option.value;
    if (isSingleSelect) {
      this.selectedOptions = [selectedObj];
      this.optionsInput.nativeElement.value = selectedObj.text || selectedObj.id;
    } else {
      if (selectedObj) {
        if (this.selectedOptions.find(obj => obj.id === selectedObj.id)) {
          this.selectedOptions = [...this.selectedOptions.filter(obj => obj.id !== selectedObj.id)];
        } else {
          this.selectedOptions.push(selectedObj);
        }

        this.clear(true);
      } else {
        // clear selection
        this.selectedOptions = [];
        requestAnimationFrame(() => {
          this.openAuto(this.matACTrigger);
        });
      }
    }

    this.patchControlAndRunRules();
  }

  patchControlAndRunRules() {
    this.control.patchValue(this.selectedOptions.map((m) => { return { code: m.id, text: null } }));
    super.validateFieldRules();
    const activeForm = this.dataControlService.activeForm$.getValue();
    this.transService.getReferredData(this.moduleId, activeForm, this.process, this.fieldObj, this.selectedOptions[0].id, 'en');
  }

  clear(openDropdown: boolean): void {
    this.optionsInput.nativeElement.value = '';
    if (openDropdown) {
      // keep the autocomplete opened after each item is picked.
      requestAnimationFrame(() => {
        this.openAuto(this.matACTrigger);
      });
    } else {
      this.selectedOptions = [];
      this.control.patchValue([]);
    }
  }

  openAuto(trigger: MatAutocompleteTrigger): void {
    trigger.openPanel();
    this.optionsInput.nativeElement.focus();
  }

  isItemChecked(selObj: ListValue): boolean {
    const dataObj = this.selectedOptions.find(obj => obj.id === selObj.id);
    return dataObj ? true : false;
  }

  remove(index: number): void {
    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
      this.control.patchValue(this.selectedOptions);
    }
  }

  openFilterModal() {
    this.sharedServices.setModuleListData({ fromType: 'dataRef', data: this.selectedOptions });
    this.router.navigate([{ outlets: { sb: [...(this.router as any).currentUrlTree.root.children.sb.segments.map(m => m.path)], outer: `outer/list/datatable/${this.fieldObj.fieldCtrl.refDataset.datasetId}` } }],
      { queryParams: { ss: true }, queryParamsHandling: 'merge', preserveFragment: true });
  }

  setDropdownData(selectedVal) {
    // remove already selected value
    this.selectedOptions = [...this.selectedOptions.filter(obj => !obj.isDialogSelection)];

    selectedVal.forEach(obj => {
      obj.isDialogSelection = true;
      obj.id = obj.OBJECTNUMBER.fieldData;
      obj.text = obj.OBJECTNUMBER.fieldData;
      obj.textRef = obj.OBJECTNUMBER.fieldData;
      this.selectedOptions.push(obj);
    });
    if (this.allowSingleSelect && this.selectedOptions.length > 0) {
      this.optionsInput.nativeElement.value = this.selectedOptions[0]?.text || this.selectedOptions[0]?.id;
    }

    this.patchControlAndRunRules();
  }

  addReferenceRecord() {
    const layoutDetails: any = this.transService.getDatasetRefDetails(this.layoutId, this.fieldObj.fieldCtrl.refDataset.datasetId);
    if (!layoutDetails) {
      this.transiantService.open(`No form exist for this field!`, '', { duration: 4000 });
      return;
    }
    const activeForm = this.dataControlService.activeForm$.getValue();
    const realtedDatasetTab: DataReferenceTabDetails = {
      fieldId: this.fieldObj.fieldId,
      parentModuleId: activeForm.moduleId,
      path: 'hdvs',
      parentRecordNumber: activeForm.objnr,
      isParentModulePrimary: activeForm.isPrimary,
      relatedDatasetObjnr: this.dataControlService.getTempnumber(layoutDetails?.refdataSetDesc || 'Unknown'),
      moduleId: layoutDetails.referenceDatasetId || '',
      formId: layoutDetails.formId || '',
    }
    layoutDetails.description = this.fieldObj.fieldCtrl.description;
    layoutDetails.moduleDesc = layoutDetails?.formDesc || 'Untitled';
    layoutDetails.realtedDatasetTab = realtedDatasetTab;
    this.transService.loadDataReflayout.next(layoutDetails);
  }

  viewReferenceRecord() {
    const layoutDetails: any = this.transService.getDatasetRefDetails(this.layoutId, this.fieldObj.fieldCtrl.refDataset.datasetId);
    if (!layoutDetails) {
      this.transiantService.open(`No form exist for this field!`, '', { duration: 4000 });
      return;
    }

    const activeForm = this.dataControlService.activeForm$.getValue();
    const realtedDatasetTab: DataReferenceTabDetails = {
      fieldId: this.fieldObj.fieldId,
      parentModuleId: activeForm.moduleId,
      path: 'hdvs',
      parentRecordNumber: activeForm.objnr,
      isParentModulePrimary: activeForm.isPrimary,
      relatedDatasetObjnr: this.utilityService.getRandomString(12),
      moduleId: layoutDetails.referenceDatasetId || '',
      formId: layoutDetails.formId || '',
    }
    layoutDetails.description = this.fieldObj.fieldCtrl.description;
    layoutDetails.moduleDesc = layoutDetails?.formDesc || 'Untitled';
    layoutDetails.realtedDatasetTab = realtedDatasetTab;
    this.transService.loadDataReflayout.next(layoutDetails);
  }

  get isPlusShouldVisiable(): boolean {
    if((`${this.fieldObj.fieldCtrl?.refDataset?.datasetId}` === `${this.transService.parentDatasetIdSub.getValue()}`)) {
      return false;
    }
    return true;
  }

}
