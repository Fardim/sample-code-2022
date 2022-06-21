import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WorkflowBuilderService } from '@services/workflow-builder.service';

@Component({
  selector: 'pros-background-step-properties',
  templateUrl: './background-step-properties.component.html',
  styleUrls: ['./background-step-properties.component.scss']
})
export class BackgroundStepPropertiesComponent implements OnInit, OnChanges, OnDestroy {

  @Input() bpmnElement;
  @Output() updateProperties = new EventEmitter<any>();
  backgroundForm : FormGroup ;

  customEvents = [] ;
  crossModules = [] ;

  subscriptions : Subscription[] = [] ;

  loadApisParams = {
    plantCode: 'MDO1003',
    moduleId:'1005'
  }


  constructor(private fb: FormBuilder,
              private workflowBuilderService: WorkflowBuilderService) { }

  ngOnInit() {

    this.loadApis();

  }

  initForm(value?){

    this.backgroundForm = this.fb.group({
      name : [ value && value.name ? value.name : '', Validators.required],
      enhancementPoint : [ value && value.enhancementPoint ? value.enhancementPoint : 'Select'],
      crossModule : [ value && value.crossModule ? value.crossModule : 'Select' ],
      customEvent : [ value && value.customEvent ? value.customEvent : '' ]
    }) ;

    this.backgroundForm.valueChanges
        .subscribe(values => {
          this.updateStepProperties()
        });

    // for validation purposes
    this.backgroundForm.markAllAsTouched();
  }


  ngOnChanges(changes): void {
    // console.log(changes.bpmnElement);
    const selectedBpmn = changes.bpmnElement;
    if (selectedBpmn && selectedBpmn.currentValue) {
      if (Object.keys(selectedBpmn.currentValue.businessObject.$attrs).length === 0) {
        // init attributes values
        this.initForm();
        this.updateStepProperties();
      } else {
        // get element configured attributes and map the name to description field
        const attrs = { ...selectedBpmn.currentValue.businessObject.$attrs, name: selectedBpmn.currentValue.businessObject.name };
        console.log('Configured attributes: ', attrs);
        this.initForm(attrs) ;
      }
    }
  }

  /**
   * emit an event in order to update the selected step properties
   */
  updateStepProperties() {
    this.updateProperties.emit({...this.backgroundForm.value, stepDesc : this.backgroundForm.value.name});
  }

  loadApis(){
    this.subscriptions.push(
      this.workflowBuilderService.getLoadApi(this.loadApisParams)
          .subscribe(api => {
            this.customEvents = api.customEvent ;
            this.crossModules = api.crossModule ;
          })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
