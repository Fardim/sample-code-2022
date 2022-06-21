import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorkflowBuilderService } from '@services/workflow-builder.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'pros-decisions-modal',
  templateUrl: './decisions-modal.component.html',
  styleUrls: ['./decisions-modal.component.scss']
})
export class DecisionsModalComponent implements OnInit, OnDestroy {

  FIELD_TYPE = {
    Input: '0',
    Select: '1'
  }

  decisionForm: FormGroup;


  fieldOptionsParams = {
    plantCode: 'MDO1003',
    objectType:'1005',
    fieldId:'',
    fetchCount:'-1',
    // queryString:'',
    // from: 'WORKFLOW_DEFINITION',
    lang:'en'
  }

  subscriptionsList: Subscription[] = [];

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<DecisionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private wfService : WorkflowBuilderService,
    private route: ActivatedRoute) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {

    // read moduleId from query params
    this.subscriptionsList.push(
      this.route.queryParams.subscribe(params => {
          this.fieldOptionsParams.objectType = params.moduleId;
      })
    )

    // build decision form
    this.decisionForm = this.fb.group({});
    this.data.fields.forEach(field => {
    this.decisionForm.addControl(field.id, this.fb.control(field.value));
      if(field.picklist === this.FIELD_TYPE.Select){
        this.subscriptionsList.push (
          this.getFieldOptions(field.id)
              .subscribe(resp => {
                field.options = resp.DATA || [];

                field.filteredOptions = this.decisionForm.get(field.id).valueChanges
                  .pipe(
                    startWith(''),
                    map(value => this.filterOptions(value, field))
                  );

                const selectedOption = field.options.find(v => v.CODE === field.value);
                const currentValue = {};
                currentValue[field.id] = selectedOption ;
                this.decisionForm.patchValue(currentValue);
              })
        );
      }
    });

  }

  getFieldOptions(id){
    return this.wfService.getFieldOptions({
      ...this.fieldOptionsParams,
      fieldId: id
    }) ;
  }

  getOptionText(option){
    return option ? option.TEXT : '';
  }

  public filterOptions(value, field) {
    const filterValue = value.TEXT ? value.TEXT.toLowerCase() : value.toLowerCase() ;
    return field.options.filter(option => option.TEXT.toLowerCase().includes(filterValue));
  }

  ngOnDestroy(){
    this.subscriptionsList.forEach(sub => sub.unsubscribe());
  }

}
