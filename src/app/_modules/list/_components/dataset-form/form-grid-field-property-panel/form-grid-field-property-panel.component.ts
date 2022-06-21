import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-form-grid-field-property-panel',
  templateUrl: './form-grid-field-property-panel.component.html',
  styleUrls: ['./form-grid-field-property-panel.component.scss']
})
export class FormGridFieldPropertyPanelComponent implements OnInit, OnChanges {
  fieldFormGroup: FormGroup;
  @Input() fieldProperty: any = {};
  @Input() tabIndex: number;
  @Input() moduleId: string;
  @Output() updateFieldProperty: EventEmitter<any> = new EventEmitter();
  @Output() closed: EventEmitter<boolean> = new EventEmitter();

  sortFieldCtrl: FormControl = new FormControl();
  uniqueFieldCtrl: FormControl = new FormControl();
  sortFieldOrderCtrl: FormControl = new FormControl({label: 'Ascending', value: 'ASC'});

  formObs = {
    sortFieldsObs: of([]),
    sortOrderObs: of([
      {label: 'Ascending', value: 'ASC'},
      {label: 'Descending', value: 'DESC'}
    ]),
    sequenceFieldObs: of([]),
    uniqueRowObs: of([])
  }

  formSelectedValues = {
    selectedSortFields: [],
    selectedUniqueRow: []
  }

  limit = 2;


  constructor(
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fieldProperty?.currentValue !== changes.fieldProperty?.previousValue) {
      this.fieldProperty = changes?.fieldProperty?.currentValue;

      this.bindFormValues();
    }
  }

  bindFormValues() {
    this.createFieldFormGroup(this.fieldProperty?.permissions);
    this.addSortDropdownValues();
    this.addSequenceDropdownValues();
    this.addUniqDropdownValues();
    if (this.fieldProperty?.permissions) {
      this.patchFormValue(this.fieldProperty?.permissions);
    }
  }

  createFieldFormGroup(fieldForm?) {
    const fieldName = this.fieldProperty?.description || (this.fieldProperty?.metadata && this.fieldProperty?.metadata[0].description ? this.fieldProperty?.metadata[0].description : 'Field');
    this.fieldFormGroup = this.fb.group({
      fieldName: [fieldName ? fieldName : ''],
      invisible: [fieldForm?.invisible ? fieldForm?.invisible : false],
      nonEditable: [fieldForm?.nonEditable ? fieldForm?.nonEditable : false],
      required:[fieldForm?.required ? fieldForm?.required : false],
      defaultRowCnt: [fieldForm?.defaultRowCnt ? fieldForm?.defaultRowCnt : 5, Validators.maxLength(2)],
      addRow: [fieldForm ? fieldForm.addRow : true],
      editRow: [fieldForm ? fieldForm.editRow :true],
      removeRow: [fieldForm ? fieldForm.removeRow :true],
      removeMultipleRow: [fieldForm ? fieldForm.removeMultipleRow : true],
      copyRow: [fieldForm ? fieldForm.copyRow : true],
      export: [fieldForm ? fieldForm.export :true],
      import: [fieldForm ? fieldForm.import : true],
      sortFields: [fieldForm?.sortFields ? fieldForm?.sortFields : []],
      sortOrder: [fieldForm?.sortOrder ? fieldForm?.sortOrder : 'ASC'],
      sequenceField: [fieldForm?.sequenceField ? fieldForm?.sequenceField : {}],
      sequenceInterval: [fieldForm?.sequenceInterval ? fieldForm?.sequenceInterval : ''],
      sequenceStart: [fieldForm?.sequenceStart? fieldForm?.sequenceStart : ''],
      uniqueRow: [fieldForm?.uniqueRow ? fieldForm?.uniqueRow : []]
    });

    this.formSelectedValues.selectedSortFields = fieldForm?.sortFields ? fieldForm?.sortFields : [];
    this.formSelectedValues.selectedUniqueRow = fieldForm?.uniqueRow ? fieldForm?.uniqueRow : [];

    if(this.fieldProperty.childs && this.fieldProperty.metadata) {
      this.addGridChildsPicklist(this.fieldProperty.childs,this.fieldProperty.metadata[0].grid);
    }
    this.onFormValueChange();
  }

  patchFormValue(fieldForm?) {
    this.fieldFormGroup.patchValue({
      addRow: fieldForm?.addRow,
      editRow: fieldForm?.editRow,
      removeRow: fieldForm?.removeRow,
      removeMultipleRow: fieldForm?.removeMultipleRow,
      copyRow: fieldForm?.copyRow,
      export: fieldForm?.export,
      import: fieldForm?.import,
    })
  }

  addGridChildsPicklist(grids,metaDataGrids) {
    grids.forEach(grid => {
      metaDataGrids.forEach(element => {
        if(grid.fieldId === element.fieldId) {
          grid.pickList = element.pickList;
          grid.dataType = element.dataType;

          if (grid.childs && grid.childs.length && element.grid.length) {
            this.addGridChildsPicklist(grid.childs,element.grid);
          }
        }
      });
    });
  }

  addSortDropdownValues() {
    const sortFields = this.fieldProperty?.childs?.filter(child => child.pickList !== '15');
    this.formObs.sortFieldsObs = this.sortFieldCtrl.valueChanges.pipe(
    startWith(''),
    map((fieldName: string | null) => fieldName ? this._filter(fieldName,sortFields) : sortFields));
  }

  addSequenceDropdownValues() {
    const numericField = this.fieldProperty?.childs?.filter(child => child.pickList === '0' && (child.dataType === 'NUMC' || child.dataType === "DEC"));
    const sequenceFields = numericField?.map(data => {
      return {
        fieldId: data.fieldId,
        description: data.description
      }
    })
    this.formObs.sequenceFieldObs = this.fieldFormGroup.get('sequenceField').valueChanges.pipe(
    startWith(''),
    map((fieldName: string | null) => fieldName ? this._filter(fieldName,sequenceFields) : sequenceFields));
  }

  addUniqDropdownValues() {
    this.formObs.uniqueRowObs = this.uniqueFieldCtrl.valueChanges.pipe(
      startWith(''),
      map((fieldName: string | null) => fieldName ? this._filter(fieldName,this.fieldProperty.childs) : this.fieldProperty.childs));
  }

  _filter(fieldName, sortFields) {
    const searchString = fieldName?.description || fieldName;
    return sortFields.filter(option => option.description.toLowerCase().includes(searchString?.toLowerCase()));
  }

  onFormValueChange() {
    const fieldProperty = {...this.fieldFormGroup.value, defaultRowCnt: +this.fieldFormGroup.value.defaultRowCnt};
    this.fieldProperty.permissions = {...this.fieldFormGroup.value, defaultRowCnt: +this.fieldFormGroup.value?.defaultRowCnt};
    this.updateFieldProperty.emit({ fieldProperty: this.fieldProperty, index: this.tabIndex });
  }

  sequencyFieldSelected() {
    this.fieldFormGroup.patchValue({
      sequenceInterval: '0010',
      sequenceStart: '10'
    })
    this.onFormValueChange();
  }

  manageDropdownValue($event, dropdownType: 'selectedUniqueRow' | 'selectedSortFields') {
    let formControl = '';
    (dropdownType === 'selectedSortFields') ? (this.sortFieldCtrl.setValue(null),formControl = 'sortFields') : (this.uniqueFieldCtrl.setValue(null),formControl = 'uniqueRow');
    const index = this.formSelectedValues[dropdownType].findIndex(f => f.fieldId === $event.fieldId);
    (index === -1) ? this.formSelectedValues[dropdownType].push({
      fieldId: $event.fieldId,
      description: $event.description
    }) : this.formSelectedValues[dropdownType].splice(index,1);

    this.formSelectedValues[dropdownType].forEach((data,i) => {
      data.order = i
    })

    this.fieldFormGroup.patchValue({
      [formControl]: this.formSelectedValues[dropdownType]
    });

    this.onFormValueChange();
  }

  displaySequenceField(field): string {
    return (field?.description && field.description !== 'null') ? field?.description : '';
  }

  displaySortOrderField(opt) {
    return opt?.label || '';
  }

  manageSortOrderValue($event) {
    const option = $event.option.value;
    this.fieldFormGroup.get('sortOrder').setValue(option.value);
    this.onFormValueChange();
  }

  toggleInvisible(event) {
    this.fieldFormGroup.get('invisible').setValue(event);
    if(this.fieldFormGroup.get('nonEditable').value === true) {
      this.fieldFormGroup.get('nonEditable').setValue(false);
    }
  }
  toggleNonEditable(event) {
    this.fieldFormGroup.get('nonEditable').setValue(event);
    if(this.fieldFormGroup.get('invisible').value === true) {
      this.fieldFormGroup.get('invisible').setValue(false);
    }
  }

  close() {
    this.router.navigate(['./'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
    this.closed.emit(true);
  }

}
