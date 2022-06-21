import { Component, ComponentFactoryResolver, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldlistContainer } from '@models/list-page/listpage';
import { ContainerRefDirective } from '@modules/shared/_directives/container-ref.directive';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivateDeactivateFieldComponent } from '../forms/activate-deactivate-field/activate-deactivate-field.component';
import { AttachmentFieldComponent } from '../forms/attachment-field/attachment-field.component';
import { CheckboxFieldComponent } from '../forms/checkbox-field/checkbox-field.component';
import { DatasetReferenceFieldComponent } from '../forms/dataset-reference-field/dataset-reference-field.component';
import { DateFieldComponent } from '../forms/date-field/date-field.component';
import { DateTimeFieldComponent } from '../forms/date-time-field/date-time-field.component';
import { DropdownFieldComponent } from '../forms/dropdown-field/dropdown-field.component';
import { EmailFieldComponent } from '../forms/email-field/email-field.component';
import { GridTypeFieldsComponent } from '../forms/grid-type-fields/grid-type-fields.component';
import { RadioButtonFieldComponent } from '../forms/radio-button-field/radio-button-field.component';
import { RichTextEditorFieldComponent } from '../forms/rich-text-editor-field/rich-text-editor-field.component';
import { TextFieldComponent } from '../forms/text-field/text-field.component';
import { TimeFieldComponent } from '../forms/time-field/time-field.component';
import { UrlFieldsComponent } from '../forms/url-fields/url-fields.component';

@Component({
  selector: 'pros-fields-properties',
  templateUrl: './fields-properties.component.html',
  styleUrls: ['./fields-properties.component.scss'],
})
export class FieldsPropertiesComponent implements OnInit, OnChanges {
  @Input() currentField: FieldlistContainer = null;

  /**
   * Form control for the input
   */
  optionCtrl2 = new FormControl();

  /**
   * hold the list of filtered options
   */
  filteredOptions: Observable<string[]>;

  /**
   * Available options list
   */
  allOptions: string[] = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

  /**
   * Reference to the input
   */
  @ViewChild('optionInput2') optionInput2: ElementRef<HTMLInputElement>;

  /**
   * reference to auto-complete
   */
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  @ViewChild('propertyContainerRef') containerRef: ContainerRefDirective;

  selectedValue: any;

  selected: any;

  fieldPropertyComponentRef: any = null;

  lastDataType: string = '';
  lastPickList: string = '';

  constructor(private router: Router, public readonly route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver) { }
  ngOnInit(): void {
    this.filteredOptions = this.optionCtrl2.valueChanges.pipe(
      startWith(''),
      map((num: string | null) => (num ? this._filter(num) : this.allOptions.slice()))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    const currentField = changes.currentField;
    if (
      currentField &&
      currentField.previousValue &&
      currentField.currentValue &&
      currentField.currentValue.fieldlist.fieldId === currentField.previousValue.fieldlist.fieldId &&
      currentField.currentValue.fieldlist.parentSubGridId === currentField.previousValue.fieldlist.parentSubGridId &&
      currentField.currentValue.fieldlist.childrenId === currentField.previousValue.fieldlist.childrenId &&
      currentField.currentValue.fieldlist.fieldType === currentField.previousValue.fieldlist.fieldType
    ) {
      if (
        currentField.currentValue.fieldlist.dataType !== this.lastDataType ||
        currentField.currentValue.fieldlist.pickList !== this.lastPickList
      ) {
        this.resolveFieldPropertyComponent();
      } else {
        if (this.fieldPropertyComponentRef) this.fieldPropertyComponentRef.instance.fieldlistContainer = this.currentField;
      }
    } else {
      this.resolveFieldPropertyComponent();
    }
    this.lastDataType = currentField && currentField.currentValue && currentField.currentValue.fieldlist && currentField.currentValue.fieldlist.dataType;
    this.lastPickList = currentField && currentField.currentValue && currentField.currentValue.fieldlist && currentField.currentValue.fieldlist.pickList;
  }
  /**
   * mehtod to filter items based on the searchterm
   * @param value searchTerm
   * @returns string[]
   */
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allOptions.filter((num) => num.toLowerCase().indexOf(filterValue) === 0);
  }

  /**
   * method to add item to selected items
   * for single sleect
   * @param event item
   */
  selectSingle(event: MatAutocompleteSelectedEvent): void {
    this.selectedValue = event.option.value;
  }

  close() {
    this.router.navigate(['.'], { relativeTo: this.route, fragment: null, queryParamsHandling: 'preserve' });
  }

  /**
   * Resolve Field Properties Component as per the current field type
   */
  resolveFieldPropertyComponent() {
    if (this.currentField && this.currentField?.fieldlist) {
      let componentFactory = null;
      if (this.containerRef.viewContainerRef) {
        this.containerRef.viewContainerRef.remove();
      }

      const component = this.getCurrentFieldPropertyComponentInstance();

      componentFactory = this.componentFactoryResolver.resolveComponentFactory(component as any);
      this.fieldPropertyComponentRef = this.containerRef.viewContainerRef.createComponent(componentFactory);
      this.fieldPropertyComponentRef.instance.fieldlistContainer = this.currentField;
    }
  }

  /**
   * Get current Field Property Component as per the current field type
   */
  getCurrentFieldPropertyComponentInstance() {
    switch (this.currentField?.fieldlist?.fieldType) {
      case 'number':
      case 'decimal':
      case 'text':
      case 'alternate-number':
        return TextFieldComponent;
      case 'list':
        return DropdownFieldComponent;
      case 'attachment':
        return AttachmentFieldComponent;
      case 'url':
        return UrlFieldsComponent;
      case 'checkbox':
        return CheckboxFieldComponent;
      case 'email':
        return EmailFieldComponent;
      case 'grid':
        return GridTypeFieldsComponent;
      case 'html':
        return RichTextEditorFieldComponent;
      case 'date':
        return DateFieldComponent;
      case 'date-time':
        return DateTimeFieldComponent;
      case 'time':
        return TimeFieldComponent;
      case 'radio':
        return RadioButtonFieldComponent;
      case 'activate-deactivate':
        return ActivateDeactivateFieldComponent;
      case 'dataset-reference':
        return DatasetReferenceFieldComponent;
    }
  }

}
