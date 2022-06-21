import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectionService } from '@services/connection/connection.service';
import { CoreService } from '@services/core/core.service';
import { TransientService } from 'mdo-ui-library';
import { finalize } from 'rxjs/operators';
import { viewInterfaceDetails } from '../../connectivity';


export enum InterfaceTypeList {
  DATA_UPLOAD = 'DATA_UPLOAD',
  DATA_PULL = 'DATA_PULL',
  DROPDOWN = 'DROPDOWN',
  SYNCCHECK = 'SYNCCHECK'
}

export const ELEMENT_DATA = [
  { header: 'Interface name', cell: '' },
  { header: 'Dataset name', cell: '' },
  { header: 'Interface type', cell: '' },
  { header: 'Interface status', cell: '' },
  { header: 'Import files', cell: '' }
];

@Component({
  selector: 'pros-new-interface',
  templateUrl: './new-interface.component.html',
  styleUrls: ['./new-interface.component.scss']
})
export class NewInterfaceComponent implements OnInit {

  newInterfaceForm: FormGroup;

  interfaceType = [
    { label: 'Data upload', value: InterfaceTypeList.DATA_UPLOAD},
    { label: 'Dropdown pull', value: InterfaceTypeList.DROPDOWN},
    { label: 'Data extraction', value: InterfaceTypeList.DATA_PULL},
    { label: 'Sync check', value: InterfaceTypeList.SYNCCHECK}
  ]

  dataSource = ELEMENT_DATA;

  dataSetModules: any[] = [];

  selectedFile: File;

  currentConnectionId = '';

  displayedColumns: string[] = ['header', 'cell'];

  modeType = 'New interface';
  isReadOnly = false;
  isSave = false;
  showTestConnectionMsg = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private coreService: CoreService,
    private connectionService: ConnectionService,
    private activatedRoute: ActivatedRoute,
    private transientService: TransientService,
    @Inject(LOCALE_ID) public locale: string
  ) { }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.createNewInterfaceForm();
    this.getDatasetModules();
    this.getCurrentConnectionId();
  }

  getCurrentConnectionId() {
    this.activatedRoute.params.subscribe(params => {
      this.currentConnectionId = params.connectionId;
    })

    this.activatedRoute.queryParams.subscribe(queryParam => {
      this.modeType = (queryParam?.t === 'edit') ? 'Edit interface' : 'New interface';
      if (queryParam?.t === 'edit' || queryParam?.t === 'view') {
        this.connectionService.getInterfaceDetail(queryParam?.interfaceId).subscribe((res: any) => {
          if (res.acknowledge) {
            const interfaceDetail = res.response;
            if (interfaceDetail?.scenarioDesc && queryParam?.t === 'view') {
              this.modeType = interfaceDetail.scenarioDesc;
              this.isReadOnly = true;
            }
            const interData = {
              interfaceName: interfaceDetail.scenarioDesc,
              datasetName: interfaceDetail.objectType,
              interfaceType: this.interfaceType.find(data => data.value === interfaceDetail.interfaceType),
              interfaceStatus: interfaceDetail.active,
              moduleId: interfaceDetail.objectType,
              fileName: interfaceDetail.filename
            }

            if (this.isReadOnly) {
              this.getDatasetName(interData);
            } else {
              this.setValidationForFileControl(interfaceDetail.interfaceType);
              this.newInterfaceForm.patchValue(interData);
              this.newInterfaceForm.patchValue({interfaceId: interfaceDetail.scenarioId})
            }
          }
        })
      }
    })
  }

  setInterfaceDetails(interData: viewInterfaceDetails) {
    ELEMENT_DATA[0].cell = interData.interfaceName ? interData.interfaceName : '';
    ELEMENT_DATA[1].cell = interData.datasetName ? interData.datasetName : '';
    ELEMENT_DATA[2].cell = interData.interfaceType.label ? interData.interfaceType.label : '';
    ELEMENT_DATA[3].cell = interData?.interfaceStatus ? 'Active' : 'Inactive';
    ELEMENT_DATA[4].cell = interData.fileName ? interData.fileName : 'no file uploaded';
  }

  getDatasetName(interData) {
    this.coreService.searchAllObjectType({ lang: this.locale, fetchsize: 1, fetchcount: 0, description: '' }, [interData.moduleId])
    .subscribe((data) => {
      interData.datasetName = (data.length && data[0].moduleDesc) ? data[0].moduleDesc : 'Untitled';
      this.setInterfaceDetails(interData);
    },error => {
      interData.datasetName = 'Untitled';
      this.setInterfaceDetails(interData);
    });
  }

  createNewInterfaceForm() {
    this.newInterfaceForm = this.fb.group({
      interfaceName: ['', [Validators.required,this.noWhitespaceValidator]],
      datasetName: ['', [Validators.required]],
      interfaceType: ['', [Validators.required]],
      interfaceStatus: [false],
      file: [''],
      fileName: [''],
      moduleId: [''],
      interfaceId: ['']
    });
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespacePresent = (control.value || '').trim().length === 0;
    const isValid = !isWhitespacePresent;
    return isValid ? null : { whitespace: true };
  }

  getDatasetModules() {
    this.coreService.getAllObjectType(this.locale, 20, 0).subscribe(
      (response: any[]) => {
        if (response?.length) {
          this.dataSetModules = response.map((module) => {
            return {
              moduleId: module.moduleId,
              moduleName: module.moduleDescriptionRequestDTO.description,
            };
          });

        } else {
          this.dataSetModules = [];
        }
      },
      (err) => {
        console.error('error while fetching modules', err);
        this.dataSetModules = [];
      }
    );
  }

  fileChange(event: any) {
    this.newInterfaceForm.controls.file.markAsTouched();
    if (event && event.target) {
      const file = event.target.files[0] as File;

      if (file) {
        this.selectedFile = file;
        this.newInterfaceForm.get('file').setValue(this.selectedFile);
        this.newInterfaceForm.get('fileName').setValue(this.selectedFile.name);
      }
    }
  }

  saveNewInterface() {
    if (this.newInterfaceForm.valid) {
      const payload = {
        active: this.newInterfaceForm.value.interfaceStatus,
        interfaceType: this.newInterfaceForm.value.interfaceType.value,
        objectType: this.newInterfaceForm.value.moduleId.toString(),
        scenarioDesc: this.newInterfaceForm.value.interfaceName.trim(),
        sourceSystem: this.currentConnectionId,
        targetSystem: this.currentConnectionId,
      };
      const file = this.newInterfaceForm.get('file').value;
      if (this.newInterfaceForm.get('interfaceId').value) {
        /* eslint-disable @typescript-eslint/dot-notation */
        payload['scenarioId'] = this.newInterfaceForm.get('interfaceId').value;
      }
      this.isSave = true;
      this.connectionService.saveNewInterfaceDetails(payload,file)
      .pipe(
        finalize(() => {
          this.showTestConnectionMsg = false;
          this.isSave = false;
        })
      )
      .subscribe((response: any) => {
        if (response.acknowledge) {
          this.connectionService.nextUpdateInterfaceListSubject(this.currentConnectionId);
          this.transientService.open('Successfully saved !', null, { duration: 2000, verticalPosition: 'bottom' });
          this.close();
        }
      },error => {
        console.log('Error:',error);
        this.transientService.open('Something went wrong', null, { duration: 2000, verticalPosition: 'bottom' });
      })
    } else {
      Object.values(this.newInterfaceForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  displayNewInterfaceType(interfaceType): string {
    return interfaceType.label;
  }

  onSelectInterfaceType($event) {
    this.removeValidationForFileControl();
    const selectedOption = $event.option.value.value;
    this.setValidationForFileControl(selectedOption);
  }

  removeValidationForFileControl() {
    this.newInterfaceForm.controls.file.setValidators(null);
    this.newInterfaceForm.controls.file.updateValueAndValidity();
  }

  setValidationForFileControl(interfaceType) {
    if (interfaceType === 'DATA_UPLOAD' || interfaceType === 'DATA_PULL') {
      this.newInterfaceForm.controls.file.setValidators([Validators.required]);
      this.newInterfaceForm.controls.file.updateValueAndValidity();
    }
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParams: null });
  }

}
