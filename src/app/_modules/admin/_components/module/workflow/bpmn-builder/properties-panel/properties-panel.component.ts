import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'pros-properties-panel',
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent implements OnInit {

  @Input() bpmnElement;
  @Output() updateProperties = new EventEmitter<any>();

  // Bpmn step types
  ELEMENT_TYPES = {
    Activity: 'bpmn:UserTask',
    Determination: 'bpmn:ExclusiveGateway',
    Connection: 'bpmn:SequenceFlow',
    Email_Escalation: 'bpmn:SendTask',
    Background: 'bpmn:ServiceTask'
  }

  constructor() {}

  ngOnInit(): void {}

  /**
   * emit an event in order to update the selected step properties
   */
  updateStepProperties(attributes) {
    this.updateProperties.emit(attributes);
  }

}
