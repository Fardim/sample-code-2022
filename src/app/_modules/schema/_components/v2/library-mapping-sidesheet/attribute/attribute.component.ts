import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Attribute, AttributeDataType } from '@models/schema/classification';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';

@Component({
  selector: 'pros-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.scss']
})
export class AttributeComponent implements OnInit {

  attributeForm: FormGroup;

  ATTRIBUTE_DATA_TYPE = AttributeDataType;

  submitted = false;

  nounSno: string;

  modifierCode: string;

  get defaultValueCount() {
    return this.nounModifierService.attributeValuesModels?.length || 0;
  }

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private nounModifierService: NounModifierService,
    private schemaDetailsService: SchemaDetailsService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.buildAttributeForm();

    this.activatedRoute.params.subscribe(params => {
      this.nounSno = params.nounSno;
      this.modifierCode = params.modifierCode ? params.modifierCode : '';
    });

  }

  /**
   * Build attribute form
   */
  buildAttributeForm() {
    this.attributeForm = this.formBuilder.group({
      attrCode: ['', Validators.required],
      attrDesc: ['', Validators.required],
      type: [this.ATTRIBUTE_DATA_TYPE.TEXT],
      attFieldLen: [''],
      prefix: ['']
    });
    if(this.nounModifierService.attributeFormValue) {
      this.attributeForm.patchValue(this.nounModifierService.attributeFormValue);
    }
  }

  /**
   * function to return formField
   */
  formField(field: string) {
    return this.attributeForm.get(field);
  }

  /**
   * set form control value
   * @param controlName from control name
   * @param value value to be set
   */
  setControlValue(controlName: string, value) {
    this.attributeForm.get(controlName).setValue(value);
  }

  /**
   * save new attribute details
   */
  save() {
    this.submitted = true;
    if (this.attributeForm.invalid || this.attributeForm.value.type === this.ATTRIBUTE_DATA_TYPE.LIST && !this.nounModifierService.attributeValuesModels?.length) {
      (Object).values(this.attributeForm.controls).forEach(control => {
        if (control.invalid)
          control.markAsTouched();
      });
      this.snackBar.open('Please enter the missing fields!', 'close', { duration: 3000 });
      return;
    }

    const attribute: Attribute = {
      ...this.attributeForm.value,
      attributeValuesModels: this.attributeForm.value.type === this.ATTRIBUTE_DATA_TYPE.LIST ? this.nounModifierService.attributeValuesModels : []
    };
    const request: Attribute[] = [attribute];

    this.nounModifierService.addAttribute(request, this.nounSno, this.modifierCode)
      .subscribe(resp => {
        this.nounModifierService.attributeSaved.next(resp);
        this.snackBar.open('Successfully created!', 'close', { duration: 3000 });
        this.close();
      },
        error => {
          this.snackBar.open('Something went wrong!', 'close', { duration: 3000 });
        });
  }

  close() {
    this.router.navigate([{ outlets: { [`outer`]: null } }], {
      queryParamsHandling: 'preserve'
    });
    this.nounModifierService.attributeValuesModels = [];
    delete this.nounModifierService.attributeFormValue;
  }

  openDefaultValueSideSheet() {
    this.nounModifierService.attributeFormValue = this.attributeForm.value;
    this.router.navigate(['', {
      outlets: {
        ...this.nounModifierService.attributeSheetRoute[1].outlets,
        outer: 'outer/schema/attribute-values'
      }
    }], {
      queryParamsHandling: 'preserve',
      queryParams: { editValues: true }
    });
  }
}
