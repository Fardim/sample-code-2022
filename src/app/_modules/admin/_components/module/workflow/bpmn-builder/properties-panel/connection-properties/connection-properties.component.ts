import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ConnectionConditionModalComponent } from '../../connection-condition-modal/connection-condition-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'pros-connection-properties',
  templateUrl: './connection-properties.component.html',
  styleUrls: ['./connection-properties.component.scss']
})
export class ConnectionPropertiesComponent implements OnInit, OnChanges {


  @Input() bpmnElement;
  @Output() updateProperties = new EventEmitter<any>();
  conditionsList = [] ;
  connectionForm : FormGroup ;


  constructor(private dialog: MatDialog,
              private fb : FormBuilder) {}


  ngOnInit() {}


  initForm(value?){

    this.connectionForm = this.fb.group({
      name : [ value && value.name ? value.name : ''],
      // rejection : [value && value.rejection ? value.rejection : false]
    }) ;

    this.connectionForm.valueChanges
        .subscribe(v => this.updateStepProperties(this.connectionForm.value));
  }


  ngOnChanges(changes): void {
    // console.log(changes.bpmnElement);
    const selectedBpmn = changes.bpmnElement;
    if (selectedBpmn && selectedBpmn.currentValue) {
      if (Object.keys(selectedBpmn.currentValue.businessObject.$attrs).length === 0) {
        this.conditionsList = [] ;
        this.initForm();
        this.updateStepProperties();
      } else {
        const attrs = {...selectedBpmn.currentValue.businessObject.$attrs, name : selectedBpmn.currentValue.businessObject.name};
        this.initForm(attrs) ;
        console.log(attrs) ;
        // get the allready configured conditions
        this.conditionsList = JSON.parse(attrs.conditions) ;
      }
    }
  }

  openConditionsModal() {

    const dialogRef = this.dialog.open(ConnectionConditionModalComponent, {
      // width: '600px',
      data: this.conditionsList
    });

    dialogRef.afterClosed().subscribe(result => {

      console.log(result) ;

      if (result){
        // this.conditionsList = result.conditions;
        // delete extra keys
        this.conditionsList = result.conditions.map(row => {
                        if (row.picklist === '1'){
                          row.value = row.value.CODE;
                        }
                        delete row.picklist;
                        delete row.options;
                        delete row.filteredOptions;
                        return row;
                      });

        this.updateStepProperties();
      }
        // this.updateStepProperties({...this.connectionForm.value, conditions : JSON.stringify(result.conditions)}) ;

    });
  }

  /**
   * emit an event in order to update the selected step properties
   */
  updateStepProperties(attributes?) {
    this.updateProperties.emit({...this.connectionForm.value, conditions : JSON.stringify(this.conditionsList)});
  }
}
