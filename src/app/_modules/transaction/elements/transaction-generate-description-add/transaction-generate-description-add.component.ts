import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { RuleService } from '@services/rule/rule.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-transaction-generate-description-add',
  templateUrl: './transaction-generate-description-add.component.html',
  styleUrls: ['./transaction-generate-description-add.component.scss']
})
export class TransactionGenerateDescriptionAddComponent implements OnInit {
  frmGroup: FormGroup;
  moduleId: string;
  fieldId: string;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(LOCALE_ID) public locale: string,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transitenService: TransientService,
    private transactionService: TransactionService,
    private ruleService: RuleService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.moduleId = params.moduleId;
      this.fieldId = params.fieldId;
    });

    const lang = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.frmGroup = this.formBuilder.group({
      short: '',
      long: '',
      numeric: '',
      lang
    });
  }

  /**
   * close the side sheet
   */
  close() {
    this.router.navigate([{ outlets: { outer: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }

  /**
   * save the details
   */
  save() {
    const { value } = this.frmGroup;
    this.ruleService.saveDropvals([
      {
        code: value.short,
        text: value.long
      }
    ], this.moduleId, this.fieldId, value.lang).subscribe(
      (resp) => {
        if (resp && resp.acknowledged) {
          this.transactionService.setNewAttributeValue({
            fieldId: this.fieldId,
            moduleId: this.moduleId,
            dropvals: [{
              code: value.short,
              text: value.long
            }]
          });
          this.close();
        } else {
          this.transitenService.open(resp.errorMsg, 'ok', {
            duration: 2000,
          });
        }

      },
      (err) => {
        console.log(err);
      }
    );
  }

}
