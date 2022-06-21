import { RoleRequestDto } from '@models/teams';
import { take, map, catchError } from 'rxjs/operators';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { debounce } from 'lodash';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { ListValue, ListValueResponse, ListValueSaveModel } from '@models/list-page/listpage';
import { RuleService } from '@services/rule/rule.service';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { TransactionDropdownAddNewValue, TransactionMaterialDescName } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { UserProfileService } from '@services/user/user-profile.service';

@Component({
  selector: 'pros-transaction-dropdown',
  templateUrl: './transaction-dropdown.component.html',
  styleUrls: ['./transaction-dropdown.component.scss']
})
export class TransactionDropdownComponent extends TransactionControlComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() reloadOptionSub: Subject<ListValueSaveModel>;
  @Input() availableOptions: Array<ListValue>;
  @Input() patchRuleData;
  @ViewChild('optionsInput') optionsInput: ElementRef<HTMLInputElement>;
  @ViewChild('autocompleteTrigger') matACTrigger: MatAutocompleteTrigger;
  transactionMaterialDescName = TransactionMaterialDescName;
  selectedOptions: ListValue[] = [];
  optionList: Observable<Array<ListValue>> = of([]);
  attrSubscription: Subscription;
  optionsLoadingRequired = true;
  /**
   * Trigger function to open side sheet
   */
  @Output()
  openSideSheet: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Search the dropdown options..
   */
  delayedCallWithTransLib = debounce((searchText: string) => {
    this.getOptions(searchText);
  }, 400);

  userPageNumber = 0;
  userPageSize = 20;

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private ruleService: RuleService,
    public transService: TransactionService,
    public dataControlService: DataControlService,
    public userProfileService: UserProfileService
  ) {
    super(transService, dataControlService);
  }

  pristine = true;

  ngOnInit(): void {
    super.ngOnInit();
    // this.getOptions('');
    if(this.patchRuleData){
      this.control.setValue(this.patchRuleData);
    }
    if (this.useFrom === TransactionMaterialDescName && !this.attrSubscription && this.reloadOptionSub) {
      this.attrSubscription = this.reloadOptionSub.subscribe((data: ListValueSaveModel) => {
        if (this.fieldObj.fieldId === data.fieldId) {
          this.getOptions('');
          if (this.fieldObj.fieldCtrl) {
            this.selectedOptions.push(data.dropvals[0]);
            this.control.patchValue(this.selectedOptions);
            if (this.fieldObj.fieldCtrl && !this.fieldObj.fieldCtrl.isCheckList) {
              this.optionsInput.nativeElement.value = data.dropvals[0].text;
            }
          }
        }
      });
    }

    if(!this.fieldObj?.fieldCtrl?.isCheckList) {
      this.control.valueChanges.subscribe((res) => {
         super.validateFieldRules();
        if(res && Array.isArray(res) && res.length > 0)
          this.optionsInput.nativeElement.value = res[0].text;
      })
    }
    this.attrSubscription = this.transService.updateDependentDropdownOptions.subscribe((resp: any) => {
      if (resp && resp.has(this.controlName)) {
        this.optionsLoadingRequired = true;
        this.optionList = of([]);
        this.control.setValue('');
      }
    });
  }

  getRestrictedOptions() {
    const fieldWithData = this.transService.getHDVSField(this.activeForm?.isPrimary, this.moduleId, this.fieldObj.fieldId);
    if (Array.isArray(fieldWithData?.rv) && fieldWithData.rv.length > 0) {
      return fieldWithData.rv.map(item => {
        item.code = item.c;
        item.text = item.t;
        return item;
      });
    }
    return [];
  }

  ngAfterViewInit(): void {
    /* if (this.control.value && this.control.value[0] && this.control.value[0].text)
      this.optionsInput.nativeElement.value = this.control.value[0].text; */
    if (this.useFrom === TransactionMaterialDescName) {
      // to patch the dropdown value
      const locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
      const record = this.transService.getMasterData(this.activeForm.isPrimary, this.moduleId)?.mdoRecordES;
      if (record?.descriptions && record.descriptions[0] && record.descriptions[0]?.attributes) {
        const { attributes } = record.descriptions[0];
        if (attributes[locale] && attributes[locale].attrs && attributes[locale].attrs[this.fieldObj.fieldId]) {
          const fieldDet = attributes[locale].attrs[this.fieldObj.fieldId];
          if (this.isUoM) {
            if (fieldDet.uom && fieldDet.uom.vc && fieldDet.uom.vc[0])
              this.updateDisplayedValue(fieldDet.uom.vc[0].c || fieldDet.uom.vc[0].t);
          } else
            this.updateDisplayedValue(fieldDet?.vc[0]?.c || fieldDet?.vc[0]?.t);
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.attrSubscription) {
      this.attrSubscription.unsubscribe();
    }
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
  getOptions(str: string, dependentParents = {}): void {
    this.availableOptions = this.getRestrictedOptions();
    if (this.availableOptions && this.availableOptions.length > 0) {
      this.optionList = of(this.availableOptions);
    } else {
      this.optionsLoadingRequired = false;
      this.findOptionsByListType(str, dependentParents);
    }
  }

  findOptionsByListType(str: string, dependentParents = {}) {
    const {pickList } = this.fieldObj.fieldCtrl;
    if(pickList === '37') {
      this.optionList = this.getUserList(str);
    } else if(pickList === '1' || (this.useFrom === TransactionMaterialDescName)) {
      this.optionList = this.getDropVals(str, dependentParents)
    }
  }

  getUserList(str: string): Observable<ListValue[]> {
    const requestDto: RoleRequestDto = {
      pageInfo: {
        pageNumer: this.userPageNumber,
        pageSize: this.userPageSize,
      },
      searchString: str,
    };
    return this.userProfileService
      .getUserInfoList(requestDto)
      .pipe(
        take(1),
        map(resp => {
          const users = resp.listPage.content.map(d=> {
            return {
              text: d.userName,
              code: d.userName
            } as ListValue;
          });
          return users;
        }),
        catchError(err => {
          console.error(`Error : ${err.message}`);
          return of([]);
        })
      );
  }
  getDropVals(str: string, dependentParents = {}): Observable<ListValue[]> {
    const dto: { searchString: string; parent: any } = {
      searchString: str,
      parent: dependentParents
    };
    const locale = this.transService.getLocale();
    return this.ruleService.getDropvals(this.moduleId, this.fieldObj.fieldId, locale, dto).pipe(
      take(1),
      map((resp: ListValueResponse) => {
        if (resp && resp.content)
          return resp.content;
        else
          return [];
      }),
      catchError(err => {
        console.error(`Error : ${err.message}`);
        return of([]);
      }));
  }

  inputFocus() {
    if (this.optionsLoadingRequired) {
      const dependentParents = this.getDependentSource();
      this.getOptions('', dependentParents);
      // this.getOptions('');
    }
    console.log('input focus');
  }

  getDependentSource() {
    const rules = super.rulesForControlAsTarget();
    const sourceDropdowns = new Set();
    rules.forEach((item: any) => {
      if (!item.propertyKey)
        sourceDropdowns.add(item.sourceField)
    });
    const parents = {};
    const activeForm = this.dataControlService.activeForm$.getValue();
    sourceDropdowns.forEach((item: string) => {
      const control = this.dataControlService.getControByFieldName(this.dataControl, activeForm, item);
      if (control && control.value.length) {
        if(typeof control?.value === 'object') {
          control?.value?.forEach((val) => {
            if(!!val.code)
              parents[item] = val.code;
          })
        }
      }
    });
    return parents;
  }

  /**
   * get display value for autocomplete
   * @param value pass the selected value Object
   * @returns the field label
   */
  formatValue(value: ListValue): string {
    if (value) {
      return value.text;
    }
  }

  selected(event: MatAutocompleteSelectedEvent, isSingleSelect: boolean): void {
    const selectedObj = event.option.value;
    // this.control.setValue(selectedObj);
    if (selectedObj !== TransactionDropdownAddNewValue) {
      if (isSingleSelect) {
        this.selectedOptions = [selectedObj];
        this.optionsInput.nativeElement.value = selectedObj.text;
      } else {
        if (selectedObj) {
          if (this.selectedOptions.find(obj => obj.code === selectedObj.code)) {
            this.selectedOptions = [...this.selectedOptions.filter(obj => obj.code !== selectedObj.code)];
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

      this.control.patchValue(this.selectedOptions);

      // super.validateFieldRules(true);
    } else if (selectedObj === TransactionDropdownAddNewValue && this.useFrom === TransactionMaterialDescName) {
      this.openSideSheet.emit({
        fieldId: this.fieldObj.fieldId
      });
    }

  }

  clear(openDropdown: boolean): void {
    this.optionsInput.nativeElement.value = '';
    this.control.setValue('');
    super.validateFieldRules(true);
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
    const dataObj = this.selectedOptions.find(obj => obj.code === selObj.code);
    return dataObj ? true : false;
  }

  remove(index: number): void {
    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
      this.control.patchValue(this.selectedOptions);
    }
  }

  /**
   * Update the displayed text on the autocomplete input
   * @param newValue the new value
   */
  updateDisplayedValue(newValue) {
    const txt = newValue ? Array.isArray(newValue) ? newValue.map(op => op.text || op.code) : [newValue] : [''];
    if(Array.isArray(txt) && txt.length > 0 && txt[0])
      this.optionsInput.nativeElement.value = txt[0];
  }

  checkInputValue(value) {
    this.pristine = false;
    if (!this.selectedOptions.some(o => o.text === value)) {
      this.optionsInput.nativeElement.value = '';
      this.selectedOptions = [];
      this.control.patchValue(this.selectedOptions);
    }
    setTimeout(() => {
      if(!this.optionsInput.nativeElement.value && value && this.selectedOptions.length === 0) {
        this.getOptions('');
      }
    }, 200);
  }
}
