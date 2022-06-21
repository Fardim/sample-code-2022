import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'pros-svg-icon',
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.scss']
})
export class SvgIconComponent implements OnInit {

  // icon possible values
  iconPV: string[] = [
    'P_BR_METADATA_RULE',
    'P_BR_CUSTOM_SCRIPT',
    'P_BR_MANDATORY_FIELDS',
    'COUNT_WIDGET',
    'LIST_WIDGET',
    'FILTER_WIDGET',
    'BAR_WIDGET',
    'STACKEDBAR_WIDGET',
    'IMAGE_WIDGET',
    'HTML_WIDGET',
    'P_BR_API_RULE',
    'P_BR_DEPENDANCY_RULE',
    'P_BR_DUPLICATE_RULE',
    'P_BR_EXTERNALVALIDATION_RULE',
    'P_BR_REGEX_RULE',
    'MDO_LOGO',
    'BORDER_COLOR',
    'CONNECT_TO',
    'LOAD_FROM_FILE',
    'CREATE_MANUALLY',
    'DATA_OBJECT',
    'TOGGLE_ON',
    'WATCH_LATER',
    'ATTACH_FILE',
    'RADIO_BUTTON_CHECKED',
    'SALESFORCE',
    'SAP',
    'LEARNING_CENTRE',
    'EDIT_PROFILE',
    'INVITE',
    'DATA',
    'DIW',
    'CHECK_DATA',
    'LOAD_FILE',
    'CREATE',
    'BRING_OVER',
    'EXPLORE',
    'CUSTOM-SOLUTION',
    'PACKAGE-EXPLORE'
  ];

  @Input()
  size: string;

  @Input()
  icon: string;

  @Input()
  color: string;

  @Input()
  viewBox = '0 0 100 100';

  @Input()
  height = '';

  constructor() { }

  ngOnInit() {
  }

}
