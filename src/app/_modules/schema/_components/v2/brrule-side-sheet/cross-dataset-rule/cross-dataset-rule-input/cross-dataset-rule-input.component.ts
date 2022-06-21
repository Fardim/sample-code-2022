import { Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Router, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import FormField from '@models/form-field';
import { CrossDatasetService } from '@services/cross-dataset.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaService } from '@services/home/schema.service';
import { Observable, of } from 'rxjs';
import { CrossDatasetRuleComponent } from '../cross-dataset-rule.component';

@Component({
  selector: 'pros-cross-dataset-rule-input',
  templateUrl: './cross-dataset-rule-input.component.html',
  styleUrls: ['./cross-dataset-rule-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CrossDatasetRuleInputComponent)
    }]
})
export class CrossDatasetRuleInputComponent extends FormField implements OnInit {

  @Input() moduleId = '';
  selectedCrossDatasetRule = null;

  opencrossDataset = false;
  openCrossDatasetListDialog = false;

  crossDatasetFormGroup: FormGroup;

  @ViewChild('drawer') drawer: MatDrawer;

  crossDatasetRuleList = [];
  crossDatasetRuleListObs: Observable<any> = of([]);

  constructor(
    private globaldialogService: GlobaldialogService,
    private schemaService: SchemaService,
    private router: Router,
    private formBuilder: FormBuilder,
    private crossDatasetService: CrossDatasetService
  ) {
    super();
   }

  ngOnInit(): void {
    this.getCrossDatasetRuleList(this.moduleId);
    this.crossDatasetFormGroup = this.formBuilder.group({
      crossDatasetInfo: [{}],
      crossDatasetId: [''],
      crossDatasetListInfo: ['']
    })

    this.crossDatasetFormGroup.get('crossDatasetInfo').valueChanges.subscribe(response => {
      if (response?.isDrawerClosed) {
        this.opencrossDataset = false;
        this.openCrossDatasetListDialog = true;
      }

      if (response?.isRefreshList) {
        this.getCrossDatasetRuleList(this.moduleId);
      }
    })

    this.crossDatasetFormGroup.get('crossDatasetListInfo').valueChanges.subscribe(response => {
      if (response?.editCrossDataset) {
        this.openCrossDatasetSideSheet(response.ruleId);
      }

      if (response?.closeDataListSideSheet) {
        this.openCrossDatasetListDialog = false;
        this.drawer.close();
      }
    })
  }

  getCrossDatasetRuleList(moduleId) {
    this.crossDatasetService.getAllCrossDatasetRuleInfo({ruleSourceModule: moduleId, number: 0, size: 10}).subscribe(response => {
      this.crossDatasetRuleList = response.content;
      this.crossDatasetRuleListObs = of(response.content)
    },error => {
      console.log('Error:',error);
      this.crossDatasetRuleListObs = of([]);
    })
  }

  addCrossDatasetRule($event) {
  }

  searchCrossDatasetRule($event) {}

  openCrossDatasetListSideSheet() {
    this.openCrossDatasetListDialog = true;
    this.drawer.open();
  }

  selectCrossDatasetRule($event) {
    this.selectedCrossDatasetRule = $event;
    this.onChange($event);
  }

  openCrossDatasetSideSheet(crossDatasetRuleId?) {
    this.crossDatasetFormGroup.get('crossDatasetInfo').patchValue({ruleId: crossDatasetRuleId});
    this.opencrossDataset = true;
    this.openCrossDatasetListDialog = false;
    this.drawer.open();
  }

  removeCrossDatasetRule() {
    this.selectedCrossDatasetRule = null;
    this.onChange(null);
  }

  writeValue(formData): void {
    if (formData?.patchValue) {
      this.getCrossDatasetRuleByRefId(formData?.refId);
    }
  }

  getCrossDatasetRuleByRefId(refId) {
    this.crossDatasetService.getCrossDatasetRuleByRefId(refId).subscribe(response => {
      this.selectedCrossDatasetRule = response.response;
      this.onChange(response.response);
    })
  }

  close() {
    this.drawer.close();
  }
}
