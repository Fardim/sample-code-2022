import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DiwCreateBusinessruleComponent } from '../diw-create-businessrule/diw-create-businessrule.component';
import { BusinessRuleType, CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'pros-diw-create-schema',
  templateUrl: './diw-create-schema.component.html',
  styleUrls: ['./diw-create-schema.component.scss']
})
export class DiwCreateSchemaComponent implements OnInit {


  brList: CoreSchemaBrInfo[] = [];
  brListOb : Observable<CoreSchemaBrInfo[]> = of([]);


  constructor(private  matDialog: MatDialog) { }

  ngOnInit(): void {
  }

  /**
   * Open create business rule dialog
   */
  createbusinessrule() {
    const dialogRef = this.matDialog.open(DiwCreateBusinessruleComponent, {
      height: '706px',
      width: '1100px',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  /**
   * Should return business rule type def..
   * @param val get business rule type
   */
  businessRuleTypeDef(val: string): string {
    let def = '';
    switch (val) {
      case BusinessRuleType.BR_MANDATORY_FIELDS:
        def= 'Missing Rule';
        break;

      case BusinessRuleType.BR_METADATA_RULE:
        def = 'Metadata Rule';
        break;

      case BusinessRuleType.BR_CUSTOM_SCRIPT:
        def = 'User Defined Rule';
        break;

      case BusinessRuleType.BR_DEPENDANCY_RULE:
        def = 'Dependency Rule';
        break;

      case BusinessRuleType.BR_DUPLICATE_RULE:
        def = 'Duplicate Rule';
        break;

      case BusinessRuleType.BR_API_RULE:
        def = 'API Rule';
        break;

      case BusinessRuleType.BR_EXTERNALVALIDATION_RULE:
        def = 'External Validation Rule';
        break;

      case BusinessRuleType.BR_REGEX_RULE:
        def = 'Regex Rule';
        break;
      default:
        break;
    }
    return def;
  }
}
