import { Component, OnInit, OnDestroy } from '@angular/core';
import { ObjectTypeResponse } from '@models/schema/schema';
import { SchemaService } from '@services/home/schema.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateUpdateSchema } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Subscription, combineLatest, BehaviorSubject } from 'rxjs';
import { SchemaListDetails } from '@models/schema/schemalist';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SecondaynavType } from '@models/menu-navigation';

@Component({
  selector: 'pros-create-schema',
  templateUrl: './create-schema.component.html',
  styleUrls: ['./create-schema.component.scss']
})
export class CreateSchemaComponent implements OnInit, OnDestroy {


  moduleList: ObjectTypeResponse[];

  schemaId: string;

  moduleId: string;

  form: FormGroup;

  subscriptions: Subscription[] = [];

  schemaListDetails: SchemaListDetails;

  moduleListOb: BehaviorSubject<ObjectTypeResponse[]> = new BehaviorSubject<ObjectTypeResponse[]>(null);
  schemaInfo: BehaviorSubject<SchemaListDetails> = new BehaviorSubject<SchemaListDetails>(null);

  constructor(
    private schemaSrevice: SchemaService,
    private formBuilder: FormBuilder,
    private router: Router,
    private matSnackBar: MatSnackBar,
    private activatedRouter: ActivatedRoute,
    private schemaListService: SchemalistService,
    private sharedService: SharedServiceService
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this.moduleListOb.complete();
    this.moduleListOb.unsubscribe();
    this.schemaInfo.complete();
    this.schemaInfo.unsubscribe();
  }

  ngOnInit(): void {

    this.activatedRouter.params.subscribe(res => {
      this.schemaId = res.schemaId && res.schemaId === 'new' ? '' : res.schemaId;
      this.moduleId = res.moduleId ? res.moduleId : '';
    });

    this.initForm();

    if (this.moduleId) {
      this.form.patchValue({ moduleId: this.moduleId });
      this.form.get('moduleId').disable({ emitEvent: true, onlySelf: true });
    } else {
      this.getAllObjectType();
    }

    if (this.schemaId) {
      const subs = this.schemaListService.getSchemaDetailsBySchemaId(this.schemaId).subscribe(res => {
        this.schemaListDetails = res;
        this.schemaInfo.next(res);
      }, error => console.error(`Error : ${error}`));
      this.subscriptions.push(subs);
    }

    combineLatest([this.moduleListOb, this.schemaInfo]).subscribe(res => {
      if (res[0] && res[1]) {
        this.form.setValue({ moduleId: this.schemaListDetails.moduleId, schemaDescription: this.schemaListDetails.schemaDescription,
          threshold: this.schemaListDetails.schemaThreshold, schemaCategory: this.schemaListDetails.schemaCategory });
        this.form.get('moduleId').disable({ emitEvent: true, onlySelf: true });
      }
    });

  }

  initForm() {
    this.form = this.formBuilder.group({
      moduleId: new FormControl('', Validators.required),
      schemaCategory:new FormControl('DATAQUALITY_VIEW',Validators.required),
      schemaDescription: new FormControl('', Validators.required),
      threshold: new FormControl(0, Validators.required)
    });
  }

  getAllObjectType() {
    const sub = this.schemaSrevice.getAllObjectType().subscribe(res => {
      this.moduleList = res;
      this.moduleListOb.next(res);
    }, error => console.error('Error : {}', error.message));
    this.subscriptions.push(sub);
  }

  /**
   * method to return the formcontrol
   */
  schemaField(fieldName){
    return this.form.get(fieldName);
  }

  /**
   * Changed schema name ..
   * @param val change value of schema name ...
   */
  changedSchemaName(val: string) {
    this.form.get('schemaDescription').setValue(val);
  }

  /**
   * Close create schema side sheet
   */
  close() {
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  /**
   * Create schema ..
   */
  save() {
    console.log(this.form.value);
    const request: CreateUpdateSchema = new CreateUpdateSchema();
    request.moduleId = this.form.get('moduleId').value;
    console.log(this.form.get('moduleId').value);
    request.discription = this.form.get('schemaDescription').value;
    request.schemaThreshold = this.form.get('threshold').value;
    request.schemaCategory = this.form.get('schemaCategory').value;
    request.schemaId = this.schemaId;
    const sub = this.schemaSrevice.createUpdateSchema(request).subscribe(res => {
      this.matSnackBar.open(`Successfully saved`, `Close`, { duration: 5000 });
      this.close();
      this.sharedService.setRefreshSecondaryNav(SecondaynavType.schema, true, request.moduleId);
    }, error => {
      this.matSnackBar.open(`Something went wrong`, `Close`, { duration: 5000 });
      console.error(`Error : ${error.message}`)
    });
    this.subscriptions.push(sub);
  }


}
