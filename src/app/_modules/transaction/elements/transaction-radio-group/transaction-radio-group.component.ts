import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ListValueResponse } from '@models/list-page/listpage';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { RuleService } from '@services/rule/rule.service';
import { Observable, of } from 'rxjs';
import { TransactionControlComponent } from '../transaction-control/transaction-control.component';

@Component({
  selector: 'pros-transaction-radio-group',
  templateUrl: './transaction-radio-group.component.html',
  styleUrls: ['./transaction-radio-group.component.scss']
})
export class TransactionRadioGroupComponent extends TransactionControlComponent implements OnInit {
  options$: Observable<any>;
  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private ruleService: RuleService,
    public transService: TransactionService,
    public dataControlService: DataControlService
  ) {
    super(transService, dataControlService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.getOptions('');
  }

    /**
     * get options values for autocomplete
     * @param str pass the search string
     */
     getOptions(str: string): void {
      const dto: { searchString: string; parent: any } = {
        searchString: str,
        parent: {}
      };
      this.ruleService.getDropvals(this.moduleId, this.fieldObj.fieldId, this.locale, dto).subscribe((resp: ListValueResponse) => {
        const defaultOption = { code: '', text: 'None', textRef: 'none' };
        resp.content.unshift(defaultOption);
        this.options$ = of(resp.content);
      }, (error) => console.error(`Error : ${error.message}`));
    }

    valueChange(event) {
      this.control.setValue(event);
      super.validateFieldRules();
    }

}
