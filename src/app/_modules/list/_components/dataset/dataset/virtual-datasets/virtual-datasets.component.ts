import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CoreService } from '@services/core/core.service';

@Component({
  selector: 'pros-virtual-datasets',
  templateUrl: './virtual-datasets.component.html',
  styleUrls: ['./virtual-datasets.component.scss']
})
export class VirtualDatasetsComponent implements OnInit {
  // form
  virtualDatasetForm: FormGroup;

  // for error banner
  formErrMsg = '';
  showErrorBanner = false;

  // output event emitter
  @Output()
  cancelClick: EventEmitter<{ toRefreshApis: boolean, moduleId?: number }> = new EventEmitter<{ toRefreshApis: boolean, moduleId?: number }>();

  @Output()
  backClick: EventEmitter<any> = new EventEmitter<any>();


  constructor(private coreService: CoreService) { }

  ngOnInit(): void {
    this.editVirtualDatasetForm();
  }
  // will create form on init
  editVirtualDatasetForm() {
    this.virtualDatasetForm = new FormGroup({
      vdName: new FormControl('', [Validators.required]),
      vdDescription: new FormControl(''),
    });
  }

  // output close click event
  onCancelClick() {
    this.cancelClick.emit({ toRefreshApis: false, moduleId: null });
  }

  // show wizard on back click and reset form
  back() {
    this.backClick.emit();
  }

  // create  button click check if form is valid or not and if not show banner
  onSubmitClick() {
    if (!this.virtualDatasetForm.valid) {
      Object.values(this.virtualDatasetForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      this.formErrMsg = 'Please correct errors below before saving the dataset';
      this.showErrorBanner = true;
    } else {
      this.coreService.saveVirtualDataSet(this.virtualDatasetForm.value).subscribe(res => {
        if (res) {
          this.cancelClick.emit({ toRefreshApis: true, moduleId: null });
        }
      });
    }
  }
}
