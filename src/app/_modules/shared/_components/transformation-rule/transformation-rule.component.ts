import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BusinessRuleType } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { FieldConfiguration, TransformationFormData } from '@models/schema/schemadetailstable';

@Component({
  selector: 'pros-transformation-rule',
  templateUrl: './transformation-rule.component.html',
  styleUrls: ['./transformation-rule.component.scss']
})
export class TransformationRuleComponent implements OnInit, OnChanges {

  /**
   * create a form instance
   */
  form: FormGroup;

  /**
   * hold filtered target fields
   */
  filteredTargetFields: Observable<any[]> = of([]);

  /**
   * hold selected target fields
   */
  selectedTargetFields: any[] = [];

  /**
   * hold filtered source fields
   */
  filteredSourceFields: Observable<any[]> = of([]);

  /**
   * hold selected source fields
   */
  selectedSourceField: any = null;

  /**
   * list of event to consider as selection
   */
  separatorKeysCodes: number[] = [ENTER, COMMA];

  /**
   * target field array from a module
   */
  @Input()
  targetFieldsObject: FieldConfiguration = {
    valueKey: '',
    labelKey: '',
    list: []
  };

  /**
   * source field array from a module
   */
  @Input()
  sourceFieldsObject: FieldConfiguration = {
    valueKey: '',
    labelKey: '',
    list: []
  };

  /**
   * Input property to check if the parent form has been submitted
   */
  @Input()
  submitted = false;

  /**
   * Hold the selected rule type e.g. Regex or Lookup
   */
  @Input()
  selectedRuleType: string;

  /**
   * existing transformation data, used to patch values in case of edit
   */
  @Input()
  initialTransformationData: TransformationFormData;

  /**
   * reference to source input element
   */
  @ViewChild('sourceFieldInput') sourceFieldInput: ElementRef;

  /**
   * reference to target input element
   */
  @ViewChild('targetFieldInput') targetFieldInput: ElementRef;

  /**
   * Output property to emit transformation rule data back to parent component
   */
  @Output()
  transformationFormOutput: EventEmitter<TransformationFormData> = new EventEmitter(null);
  constructor(private snackBar: MatSnackBar, private elementRef: ElementRef) { }

  /**
   * Angular hook for on init
   */
  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the form object and
   * subscribe to any required control value changes
   * or the whole form values
   */
  initializeForm() {
    this.form = new FormGroup({
      sourceFld: new FormControl(''),
      targetFld: new FormControl(''),
      excludeScript: new FormControl('', [Validators.required]),
      includeScript: new FormControl('', [Validators.required]),
    });

    this.initTargetAutocomplete();
    this.initSourceAutocomplete();
    // Apply conditional validation based on rule type
    this.form.valueChanges.subscribe((formData) => {
      this.transformationFormOutput.emit({
        ...formData,
        selectedTargetFields: this.selectedTargetFields
      });
    });

    this.patchFormValues(this.initialTransformationData);
  }

   /**
    * function to return formField
    */
  formField(field: string) {
    return this.form.get(field);
  }

  /**
   * Patch form values with the existing value
   * @param initialData form data to patch
   */
  patchFormValues(initialData: TransformationFormData) {
    if (initialData) {
      this.form.patchValue(initialData);
      if (initialData.sourceFld && this.sourceFieldsObject.list.length > 0) {
        this.selectedSourceField = this.sourceFieldsObject.list.find(field => field[this.sourceFieldsObject.valueKey] === initialData.sourceFld);
      }
      if (initialData.targetFld && this.targetFieldsObject.list.length > 0) {
        const fields: string[] = initialData.targetFld.split(',');
        this.selectedTargetFields = this.targetFieldsObject.list.filter(field => fields.indexOf(field[this.sourceFieldsObject.valueKey]) > -1);
      }
      this.emitTransformationOutput();
    }
  }

  /**
   * delete selected source field
   */
  removeSourceField() {
    this.selectedSourceField = null;
    this.form.controls.sourceFld.setValue('');
  }

  /**
   * Initialize autocomplete for targetfield values
   */
  initTargetAutocomplete() {
    this.filteredTargetFields = this.form.controls.targetFld.valueChanges
      .pipe(
        startWith(''),
        map(keyword => {
          return keyword ?
            this.targetFieldsObject.list.filter(item => {
              return item[this.targetFieldsObject.labelKey].toString().toLowerCase().indexOf(keyword) !== -1
            }) : this.targetFieldsObject.list
        }),
      )
  }

  /**
   * Initialize autocomplete for targetfield values
   */
  initSourceAutocomplete() {
    this.filteredSourceFields = this.form.controls.sourceFld.valueChanges
      .pipe(
        startWith(''),
        map(keyword => {
          return keyword ?
            this.sourceFieldsObject.list.filter(item => {
              return item[this.sourceFieldsObject.labelKey].toString().toLowerCase().indexOf(keyword) !== -1
            }) : this.sourceFieldsObject.list;
        }),
      )
  }

  /**
   * method to prepare target values
   * @param list array of objects
   */
  updateTargetValue({ list, labelKey, valueKey }) {
    this.targetFieldsObject = {
      labelKey,
      valueKey,
      list
    }
  }

  /**
   * method to prepare source values
   * @param list array of objects
   */
  updateSourceValue({ list, labelKey, valueKey }) {
    this.sourceFieldsObject = {
      labelKey,
      valueKey,
      list
    }
  }

  /**
   * Select target fields from the array of Objects
   * @param event pass the value to be added
   */
  selectTargetField(event) {
    const { valueKey, labelKey } = this.targetFieldsObject;
    const alreadyExists = this.selectedTargetFields.find(item => item[valueKey] === event.option.value);
    if (alreadyExists) {
      this.snackBar.open('This field is already selected', 'Okay', { duration: 5000 });
    } else {
      this.selectedTargetFields.push({
        [labelKey]: event.option.viewValue,
        [valueKey]: event.option.value
      });
    }

    this.emitTransformationOutput();
    const inputField = this.elementRef.nativeElement?.querySelector('#targetFieldId');
    if(inputField) {
      inputField.value = '';
    }
    this.form.controls.targetFld.setValue('');
    if(this.targetFieldInput){
      this.targetFieldInput.nativeElement.blur();
    }
  }

  /**
   * method to emit the form and target field data
   */
  emitTransformationOutput(){
    this.transformationFormOutput.emit({
      ...this.form.value,
      selectedTargetFields: this.selectedTargetFields
    });
  }

  /**
   * Select source fields from the array of Objects
   * different implementation to allow only one value
   * to be selected
   * @param event pass the value to be added
   */
  selectSourceField(event) {
    const { valueKey, labelKey } = this.sourceFieldsObject;
    this.selectedSourceField = {
      [labelKey]: event.option.viewValue,
      [valueKey]: event.option.value
    };
    this.form.controls.sourceFld.setValue('');
    const inputField = this.elementRef.nativeElement?.querySelector('#sourceFieldId');
    if(inputField) {
      inputField.value = '';
    }
    if(this.sourceFieldInput) {
      this.sourceFieldInput.nativeElement.blur();
    }
  }

  /**
   * remove selected target field
   * @param id pass the id to remove
   */
  removeTargetField(id) {
    this.selectedTargetFields.splice(id, 1);
    this.emitTransformationOutput();
  }

  // Getter to check if the rule is TransformationRule
  get isTransformationRule() {
    return this.selectedRuleType === BusinessRuleType.BR_TRANSFORMATION;
  }

  /**
   * method to modified the data to view in mat autocomplete
   * @param value value to be modified
   */
  displayFnTarget(value) {
    return value ? value[this.targetFieldsObject.labelKey] : '';
  }

  /**
   * method to modified the data to view in mat autocomplete
   * @param value value to be modified
   */
  displayFnSource(value) {
    return value ? value[this.sourceFieldsObject.labelKey] : '';
  }

  /**
   * Angular hook to detect changes in the input values
   * @param changes check for change using changes variable
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.targetFieldsObject && !isEqual(changes.targetFieldsObject.previousValue, changes.targetFieldsObject.currentValue)) {
      this.updateTargetValue(changes.targetFieldsObject.currentValue);
      if (this.form) {
        this.patchFormValues(this.initialTransformationData);
      }
    }
    if (changes.sourceFieldsObject && !isEqual(changes.sourceFieldsObject.previousValue, changes.sourceFieldsObject.currentValue)) {
      this.updateSourceValue(changes.sourceFieldsObject.currentValue);
      if (this.form) {
        this.patchFormValues(this.initialTransformationData);
      }
    }
    if (changes.selectedRuleType && !isEqual(changes.selectedRuleType.previousValue, changes.selectedRuleType.currentValue)) {
      this.selectedRuleType = changes.selectedRuleType.currentValue;
    }
    if (changes.submitted && !isEqual(changes.submitted.previousValue, changes.submitted.currentValue)) {
      this.submitted = changes.submitted.currentValue;
    }
  }
}
