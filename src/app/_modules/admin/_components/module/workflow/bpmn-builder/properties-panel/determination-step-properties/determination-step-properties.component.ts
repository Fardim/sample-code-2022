import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'pros-determination-step-properties',
  templateUrl: './determination-step-properties.component.html',
  styleUrls: ['./determination-step-properties.component.scss']
})
export class DeterminationStepPropertiesComponent implements OnInit, OnChanges {


  @Input() bpmnElement;
  @Output() updateProperties = new EventEmitter<any>();
  determinationForm : FormGroup ;

  constructor(public fb: FormBuilder) { }

  ngOnInit(): void {
  }

  initForm(value?){

    this.determinationForm = this.fb.group({
      name : [ value && value.name ? value.name : '', Validators.required]
    }) ;

    this.determinationForm.valueChanges
        .subscribe(v => this.updateStepProperties(this.determinationForm.value));

    this.determinationForm.markAllAsTouched();
  }


  ngOnChanges(changes): void {
    // console.log(changes.bpmnElement);
    const selectedBpmn = changes.bpmnElement;
    if (selectedBpmn && selectedBpmn.currentValue) {

      // get connection name
      const name = selectedBpmn.currentValue.businessObject.name ;
      this.initForm({name}) ;

      if (Object.keys(selectedBpmn.currentValue.businessObject.$attrs).length === 0) {
        // init attributes values
        this.updateStepProperties(this.determinationForm.value);
      } else {
        // get the allready configured attributes
        const attrs = selectedBpmn.currentValue.businessObject.$attrs;
        console.log(attrs)
      }
    }
  }

  /**
   * emit an event in order to update the selected step properties
   */
  updateStepProperties(attributes) {
    this.updateProperties.emit({...attributes, stepDesc : attributes.name});
  }

}
