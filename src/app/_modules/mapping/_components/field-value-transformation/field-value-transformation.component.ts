import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pros-field-value-transformation',
  templateUrl: './field-value-transformation.component.html',
  styleUrls: ['./field-value-transformation.component.scss'],
})
export class FieldValueTransformationComponent implements OnInit {
  @Input() isInbound = false;
  @Input() targetFieldIsMapped = false;
  optionCtrl = new FormControl();
  altnOptionCtrl = new FormControl();
  dateOptionCtrl = new FormControl();
  currentTranslationRule: { id: string; rulename: string; rulescount: number } = {
    id: '1',
    rulename: 'New Rule 101',
    rulescount: 13,
  };
  altnFields: any[] = [];
  dateFormates: string[] = dateFormatOptions;
  fieldId = '1';

  leadingZeroesTooltip = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.leadingZeroesTooltip = this.isInbound
      ? 'This property can be enabled to remove the leading zeroes from the value'
      : 'This property can be enabled to pass the leading zeroes with the value';
  }

  onSelectTranslationRule(event: any) {}

  onSelectALTN($event) {}

  openTranslationRuleSidesheet(translationRuleId: string) {
    this.router.navigate(
      [
        {
          outlets: {
            sb: 'sb/mapping/field-mapping',
            outer: `outer/mapping/field-value-transform/${this.fieldId}/${translationRuleId ? translationRuleId : 'new'}`,
          },
        },
      ],
      {
        queryParamsHandling: 'preserve',
        preserveFragment: true,
      }
    );
  }
}

export const dateFormatOptions: string[] = [
  'YYYY-MM-dd',
  'DDMMYYYY',
  'dd.MM.yy',
  'dd M,yy',
  'MM.dd.yy',
  'dd-MM-YYYY',
  'MM-dd-YYYY',
  'MMDDYYYY',
  'YYYYMMDD',
  'MM d, yy',
];
