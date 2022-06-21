import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateNounModRequest } from '@models/schema/classification';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';

@Component({
  selector: 'pros-modifier',
  templateUrl: './modifier.component.html',
  styleUrls: ['./modifier.component.scss']
})
export class ModifierComponent implements OnInit {

  moduleId: string;
  matlGroup: string;
  nounCode: string;

  modifierForm: FormGroup;
  submitted = false;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private nounModifierService: NounModifierService,
    private schemaDetailService: SchemaDetailsService) { }

  ngOnInit(): void {
    this.buildForm();
    this.activatedRoute.params.subscribe(params => {
      this.moduleId = params.moduleId;
      this.matlGroup = params.matlGroup;
      this.nounCode = params.nounCode;
    })
  }

  buildForm() {
    this.modifierForm = this.formBuilder.group({
      modeCode: ['', Validators.required],
      modLong: [''],
      modNumCode: [''],
      shortDescActive: [false],
      active: [false],
      targetClass: [''],
      unspcCode: [''],
      gs1Code: ['']
    })
  }

  /**
   * function to return formField
   */
  formField(field: string) {
    return this.modifierForm.get(field);
  }

  /**
   * set form control value
   * @param controlName from control name
   * @param value value to be set
   */
  setControlValue(controlName: string, value) {
    this.modifierForm.get(controlName).setValue(value);
  }

  /**
   * save new attribute details
   */
  save() {

    this.submitted = true;

    if (this.modifierForm.invalid) {
      (Object).values(this.modifierForm.controls).forEach(control => {
        if(control.invalid)
        control.markAsTouched()
      });
      this.snackBar.open('Please enter the missing fields !', 'close', { duration: 3000 });
      return;
    }

    console.log(this.modifierForm.value);

    const request: CreateNounModRequest = {
      ...this.modifierForm.value,
      shortDescActive: this.modifierForm.value.shortDescActive ? '1': '0',
      active: this.modifierForm.value.active ? '1': '0',
      nounCode: this.nounCode,
      plantCode: '0', objectType: this.moduleId
    } as CreateNounModRequest;

    this.nounModifierService.createNounModifier(request, this.matlGroup)
        .subscribe(resp => {
          this.snackBar.open('Successfully created !', 'close', { duration: 3000 });
          this.close();
        },
        error => {
          this.snackBar.open('Successfully created !', 'close', { duration: 3000 });
          console.log(error);
        })

  }

  close() {
    this.router.navigate([{ outlets: { [`outer`]: null } }], {queryParamsHandling: 'preserve'});
  }

}
