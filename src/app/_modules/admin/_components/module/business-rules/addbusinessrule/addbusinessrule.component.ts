import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { Breadcrumb } from 'src/app/_models/breadcrumb';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreSchemaBrInfo, BusinessRuleType } from '../business-rules.modal';

@Component({
  selector: 'pros-addbusinessrule',
  templateUrl: './addbusinessrule.component.html',
  styleUrls: ['./addbusinessrule.component.scss']
})
export class AddbusinessruleComponent implements OnInit, OnChanges {

  @Input()
  schemaId: string;

  @Input()
  moduleId: string;

  @Input()
  schemaGroupId: string;

  @Input()
  brId: string;

  @Input()
  fragment: string = '';

  @Output()
  evtSavedBrInfo: EventEmitter<CoreSchemaBrInfo> = new EventEmitter<CoreSchemaBrInfo>();

  ruleFrmCtrl: FormControl = new FormControl();

  brType = 'BR_MANDATORY_FIELDS'; // default missing rule is enable

  breadcrumb: Breadcrumb = {
    heading: 'Add Business Rule',
    links: [
      {
        link: '/home/schema/',
        text: 'Schema group(s)'
      },
      {
        link: `/home/schema/create-schema`,
        text: 'Create Schema'
      }
    ]
  };

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute
  ) { }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if(changes.fragment) {
      this.updateBrTypeBasedOnFragement(changes.fragment.currentValue);
      this.ruleFrmCtrl.setValue(changes.fragment.currentValue);
    }
  }

  ngOnInit() {
    this.activatedRouter.queryParams.subscribe(params=>{
      this.brId = params.brId ? params.brId : '';
    });


    this.ruleFrmCtrl.valueChanges.subscribe(val=>{
      this.router.navigate(['/home/schema/create-schema', this.moduleId , this.schemaId], {fragment:val});

      // update br type
      this.updateBrTypeBasedOnFragement(val);
    });

    // update link
    this.breadcrumb.links[1].link = `/home/schema/create-schema/${this.moduleId}/${this.schemaId}`;
  }

  updateBrTypeBasedOnFragement(val: string) {
    switch (val) {
      case 'missing':
        this.brType = BusinessRuleType.BR_MANDATORY_FIELDS;
        this.breadcrumb.heading = 'Missing Rule';
        break;

      case 'metadata':
        this.brType = BusinessRuleType.BR_METADATA_RULE;
        this.breadcrumb.heading = 'Metadata Rule';
        break;

      case 'userdefined':
        this.brType = BusinessRuleType.BR_CUSTOM_SCRIPT;
        this.breadcrumb.heading = 'User Defined Rule';
        break;

      case 'dependency':
        this.brType = BusinessRuleType.BR_DEPENDANCY_RULE;
        this.breadcrumb.heading = 'Dependency Rule';
        break;

      case 'duplicate':
        this.brType = BusinessRuleType.BR_DUPLICATE_RULE;
        this.breadcrumb.heading = 'Duplicate Rule';
        break;

      case 'api':
        this.brType = BusinessRuleType.BR_API_RULE;
        this.breadcrumb.heading = 'API Rule';
        break;

      case 'external':
        this.brType = BusinessRuleType.BR_EXTERNALVALIDATION_RULE;
        this.breadcrumb.heading = 'External Validation Rule';
        break;

      case 'regex':
        this.brType = BusinessRuleType.BR_REGEX_RULE;
        this.breadcrumb.heading = 'Regex Rule';
        break;

      default:
        break;
    }
  }

  /**
   * Use for send back to create schema - page
   * @param evt after saved successfully then should navigate to create schema page
   */
  afterSaved(evt: CoreSchemaBrInfo) {
    if(evt) {
      this.evtSavedBrInfo.emit(evt);
    }
    this.router.navigate(['/home/schema/create-schema', this.moduleId , this.schemaId]);
  }

}
