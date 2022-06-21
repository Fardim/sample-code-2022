import { Component, forwardRef, Inject, Input, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { CoreService } from '@services/core/core.service';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AutoExtensionService } from '@services/auto-extension.service';
import FormField from '@models/form-field';

@Component({
  selector: 'pros-auto-extension-rule',
  templateUrl: './auto-extension-rule.component.html',
  styleUrls: ['./auto-extension-rule.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AutoExtensionRuleComponent)
    }]
})
export class AutoExtensionRuleComponent extends FormField implements OnInit, OnDestroy {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  autoExtensionRuleForm: FormGroup;

  @Input() moduleId = '';

  structureList = [];
  structureObs = of([]);
  selectedStructureDetails = {
    structureId: '',
    strucDesc: '',
    strCtrl: {},
  };

  patchedAutoExtensionValue;

  submitted = false;

  constructor(
    private coreService: CoreService,
    @Inject(LOCALE_ID) public locale: string,
    private router: Router,
    public fb: FormBuilder,
    private transientService: TransientService,
    private autoExtensionService: AutoExtensionService
  ) {
    super();
  }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.getAllStructures();
    this.createAutoExtensionRuleForm();

    this.autoExtensionService.dataRefresh$.subscribe(res => {
      if (res) {
        const conditionList = this.autoExtensionService.getData();
        this.autoExtensionRuleForm.get('conditions').setValue(conditionList);
      }
    })
  }

  writeValue(formData): void {
    if (this.autoExtensionRuleForm && formData.editValue) {
      const conditionsList = formData?.autoExeInfo?.conditions || [];
      this.autoExtensionRuleForm.patchValue({
        brInfo: formData?.brInfo || '',
        brDescription: formData?.brDescription || '',
        conditions: conditionsList
      })
      this.autoExtensionService.setConditionListValue(conditionsList);

      this.patchedAutoExtensionValue = formData;
    }

    this.submitted = formData.isAutoExeFormSaved ? formData.isAutoExeFormSaved : false;
  }

  getAllStructures() {
    if (!this.moduleId || !this.locale) {
      return;
    }
    this.coreService.getAllStructures(this.moduleId, this.locale, 0, 50).subscribe((response) => {
      if (response?.length) {
        this.transformStructureList(response);
      }
    });
  }

  transformStructureList(response) {
    let structureList = [];

    response.forEach((structure) => {
      if (structure.structureId !== 1) {
        let structureDesc = '';
        if (structure.parentStrucId === 1) {
          structureDesc = structure.strucDesc;
        } else {
          const parentStructure = response.find((stru) => stru.structureId === structure.parentStrucId)?.strucDesc;
          structureDesc = `${parentStructure}/${structure.strucDesc}`;
        }

        structureList.push({
          strucDesc: structureDesc,
          structureId: structure.structureId,
          strCtrl: structure,
        });
      }
    });

    this.structureList = structureList.sort((a, b) => a.structureId - b.structureId);
    this.structureObs = of(this.structureList);

    if (this.patchedAutoExtensionValue?.autoExeInfo?.strId) {
      this.patchStructureValue();
    }
  }

  patchStructureValue() {
    const structure = this.structureList.find(structure => structure.structureId === +this.patchedAutoExtensionValue.autoExeInfo.strId);
    if (structure) {
      this.autoExtensionRuleForm.get('structure').setValue(structure);
      this.selectedStructureDetails = structure;
    }
  }

  createAutoExtensionRuleForm() {
    this.autoExtensionRuleForm = this.fb.group({
      brInfo: ['', Validators.required],
      brDescription: [''],
      structure: [null,Validators.required],
      conditions: []
    });


    this.autoExtensionRuleForm.valueChanges.subscribe(data => {
      const payload = {
        conditions: data.conditions ? data.conditions : [],
        strCtrl: data?.structure?.strCtrl ? data?.structure?.strCtrl : {},
        strId: data?.structure?.structureId ? data?.structure?.structureId : '',
        brInfo: data?.brInfo || '',
        brDescription: data?.brDescription || ''
      }

     this.onChange({payload, isFormValid: this.autoExtensionRuleForm.valid && data?.structure?.strucDesc});
    })
  }

  displayStructureDetail(structureDetail) {
    return structureDetail?.strucDesc || '';
  }

  selectedStructure($event, element) {
    if (this.selectedStructureDetails.structureId && this.autoExtensionRuleForm.get('conditions').value.length) {
      this.autoExtensionRuleForm.get('structure').setValue(this.selectedStructureDetails);
      this.transientService.confirm(
        {
          data: {
            dialogTitle: 'Confirmation?',
            label:
              'Changing the structure will cause any previously defined conditions to be reset. Would you like to continue?',
          },
          autoFocus: false,
          width: '400px',
          panelClass: 'create-master-panel',
          backdropClass: 'no-backdrop',
        },
        (response) => {
          if (response === 'yes') {
            this.autoExtensionRuleForm.get('structure').setValue($event.option.value);
            this.resetStructureValues($event);
          }
          element.blur();
          this.autocomplete.closePanel();
        }
      );
    } else {
      this.resetStructureValues($event);
    }
  }

  resetStructureValues($event) {
    this.selectedStructureDetails = $event.option.value;
    this.autoExtensionService.setConditionListValue([]);
  }

  openConditionSidesheet(type,index) {
    if (this.selectedStructureDetails.structureId) {
      this.router.navigate(['', { outlets: { sb3: `sb3/schema/new-condition/${this.moduleId}/${this.selectedStructureDetails.structureId}/${type}` } }],
      {
        queryParams: { structureDesc: this.selectedStructureDetails.strucDesc, conditionId: index },
        queryParamsHandling: 'merge',
      });
    }
  }

  cloneConditionValues(condition, index) {
    this.autoExtensionService.cloneConditionValues(condition, index);
  }

  removeConditionValues(index){
    this.transientService.confirm({
      data: {label: 'Are you sure want to delete ?', dialogTitle: 'Confirmation'
    },
    disableClose: true,
      autoFocus: false,
      width: '600px',
     }, (resp) => {
      if (resp && resp === 'yes') {
        this.autoExtensionRuleForm.get('conditions').value.splice(index, 1);
      }
    });
  }

  ngOnDestroy(): void {
    this.autoExtensionService.disconnectCondtions();
  }
}
