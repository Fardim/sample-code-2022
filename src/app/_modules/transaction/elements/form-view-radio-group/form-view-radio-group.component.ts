import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ListValue, ListValueResponse } from '@models/list-page/listpage';
import { RuleService } from '@services/rule/rule.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'pros-form-view-radio-group',
  templateUrl: './form-view-radio-group.component.html',
  styleUrls: ['./form-view-radio-group.component.scss']
})
export class FormViewRadioGroupComponent implements OnInit {

  @Input()
  control: FormControl;

  @Input()
  moduleId: string;

  @Input()
  fieldId: string;

  @Output()
  valueChange: EventEmitter<ListValue[]> = new EventEmitter<ListValue[]>();

  options$: Observable<any>;

  optionsList: ListValue[] = [];

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private ruleService: RuleService
  ) { }

  ngOnInit(): void {
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
    this.ruleService.getDropvals(this.moduleId, this.fieldId, this.locale, dto).subscribe((resp: ListValueResponse) => {
      const defaultOption = { code: '', text: 'None', textRef: 'none' };
      resp.content.unshift(defaultOption);
      this.control.setValue('');
      this.options$ = of(resp.content);
      this.optionsList = resp.content;
    }, (error) => console.error(`Error : ${error.message}`));
  }

  onValueChange(event) {
    const option = this.optionsList.filter(o => o.code === event);
    this.valueChange.emit(option);
  }
}
