import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateNounModRequest } from '@models/schema/classification';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { TransientService } from 'mdo-ui-library';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-noun',
  templateUrl: './noun.component.html',
  styleUrls: ['./noun.component.scss']
})
export class NounComponent implements OnInit {

  moduleId: string;
  matlGroup: string;

  nounForm: FormGroup;
  submitted = false;

  /**
   * Hold material group ..
   */
  dropValue: DropDownValue[] = [];


  validationError = {status:'success',message:''};

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private schemaService: SchemaService,
    private snackBar: TransientService,
    private nounModifierService: NounModifierService,
    private schemaDetailService: SchemaDetailsService) { }

  ngOnInit(): void {
    this.buildForm();
    this.activatedRoute.params.subscribe(params => {
      this.moduleId = params.moduleId;
      this.matlGroup = params.matlGroup;
    });

    this.getDropValue('');

    this.nounForm.controls.matlGroup.valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe(res=>{
      this.getDropValue(res);
    });
  }

  buildForm() {
    this.nounForm = this.formBuilder.group({
      nounCode: ['', Validators.required],
      nounText: ['', Validators.required],
      nounNumCode: [''],
      nounModeSep: ['', Validators.required],
      shortDescActive: [false],
      active: [false],
      matlGroup: ['', Validators.required]
    })
  }

  /**
   * function to return formField
   */
  formField(field: string){
      return this.nounForm.get(field);
  }

  /**
   * set form control value
   * @param controlName from control name
   * @param value value to be set
   */
  setControlValue(controlName: string, value) {
    this.nounForm.get(controlName).setValue(value);
  }

  /**
   * save new attribute details
   */
  save() {

    this.submitted = true;

    if (this.nounForm.invalid) {
      (Object).values(this.nounForm.controls).forEach(control => {
        if(control.invalid)
        control.markAsTouched()
      });
      // this.snackBar.open('Please enter the missing fields !', 'close', { duration: 3000 });
      this.validationError.message = 'Please enter the missing fields !';
      this.validationError.status = 'error';
      setTimeout(()=>{
        this.validationError.message = '';
        this.validationError.status = '';
      }, 3000);
      return;
    }

    console.log(this.nounForm.value);

    const request: CreateNounModRequest = {
      ...this.nounForm.value,
      shortDescActive: this.nounForm.value.shortDescActive ? '1': '0',
      active: this.nounForm.value.active ? '1': '0',
      plantCode: '0', objectType: this.moduleId
    } as CreateNounModRequest;

    this.nounModifierService.createNounModifier(request, this.matlGroup)
        .subscribe(resp => {
          this.snackBar.open('Successfully created !', 'close', { duration: 3000 });
          this.close();
        },
        error => {
          // this.snackBar.open('Error occured while creating!', 'close', { duration: 3000 });
          this.validationError.message = 'Error occured while creating';
          this.validationError.status = 'error';
          setTimeout(()=>{
            this.validationError.message = '';
            this.validationError.status = '';
          }, 3000);
          console.log('Error occured while creating noun!', error);
        })

  }

  close() {
    this.router.navigate([{ outlets: { [`outer`]: null } }], {
      queryParamsHandling: 'preserve'
    });
  }


  /**
   * Search the drop value based on parameters ...
   * @param searchString serach drop value based on this ...
   */
  getDropValue(searchString?:string) {
    this.schemaService.getFieldDropValues(this.moduleId, 'MATL_GROUP', (searchString ? searchString : '')).subscribe(res=>{
      this.dropValue = res ? res : [];
    });
  }

  /**
   * function to fetch field description from field field id
   * @param value field object
   * @returns field description
   */
   displaySourceFieldFn(value?: string) {
    return value ? this.dropValue.find(field => field.CODE === value)?.TEXT : value;
  }

}
