import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CoreService } from '@services/core/core.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-child-dataset',
  templateUrl: './child-dataset.component.html',
  styleUrls: ['./child-dataset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildDatasetComponent implements OnInit {

  @Input()
  childForm: FormGroup;

  childCtrl = new FormArray([]);
  childArr;
  @Input() parentDatasetId: any;
  @Input() index: any;
  @Output() removeDataset: EventEmitter<number> = new EventEmitter<number>();
  @Input() childDatasets: any;
  @Input() type: string;
  @Output() addDataset: EventEmitter<number> = new EventEmitter<number>();
  @Output() loadNestedChildOptions: EventEmitter<string> = new EventEmitter<string>();
  @Input() nestedChildCount: number;
  // childDatasets = [];
  childFormsList = [];
  childDatasetId = '';
  formId = '';
  nestedDatasetOptions: Array<any> = [];
  constructor(
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string) {
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.childForm.controls.formId.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((layoutId: string) => {
      if(this.type === 'primary'){
        this.loadNestedChildOptions.emit(layoutId);
      }

      const form = this.childFormsList.find((form: any) => form.layoutId === layoutId);
      if(form && form.description)
        this.childForm.patchValue({
          formDesc: form.description
        })
    });
    this.getFormOptions('');
  }

  /**
   * Track the dropdown value changes
   * @param event mat event option selection change
   */
  optionSelected(event: any) {
    this.childDatasetId = event.option?.value?.dataSetId;
    this.childForm.patchValue({
      formId: ''
    });
    this.getFormOptions('');
  }

  formSelected(event: any) {
    this.formId = event.option.value.layoutId;
  }

  getFormOptions(s: string) {
    const childDatasetId = this.childForm.value.dataSetId;
    if (Number(childDatasetId > 0)) {
      this.coreService.getLayoutList(Number(childDatasetId), 0, 20, '', '', {}, s).subscribe(res => {
        if (res) {
          this.childFormsList = res;
          this.childForm.patchValue({
            formId: this.childForm.value.formId,
            dataSetId: this.childForm.value.dataSetId
          });
        }
      })
    }
  }

  getDatasetTitle(datasetId: string) {
    const dataset = (this.childDatasets || []).find((i: any) => i.childDatasetId === datasetId);
    return dataset?.childDescription || datasetId;
  }

  getFormTitle(layoutId: string) {
    const form = this.childFormsList.find((form: any) => form.layoutId === layoutId);
    return form?.description || layoutId;
  }

  remove() {
    this.removeDataset.emit(this.index);
  }

  add() {
    if (this.isAllowAddNewChild)
      this.addDataset.emit(this.index);
  }

  get isAllowAddNewChild(): boolean {
    const { valid } = this.childForm;
    return valid && !(this.nestedChildCount === this.nestedDatasetOptions.length);
  }

}
