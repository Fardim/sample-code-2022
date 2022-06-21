import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ConnectorDetails } from '@modules/list/_components/connector/connectors.constants';

@Component({
  selector: 'pros-new-connection-flow',
  templateUrl: './new-connection-flow.component.html',
  styleUrls: ['./new-connection-flow.component.scss']
})
export class NewConnectionFlowComponent implements OnInit {
  views: string[] = ['new-system', 'connection-description', 'final-steps'];
  activeView = 'new-system';
  selectedConnection: ConnectorDetails;
  newConnectionDetailsForm: FormGroup;

  constructor(private dialogRef: MatDialogRef<NewConnectionFlowComponent>) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.newConnectionDetailsForm = new FormGroup({});

    this.newConnectionDetailsForm.valueChanges.subscribe(data => {
      console.log('connection description', data);
    });
  }

  setActiveView(componentName: string) {
    if(componentName === 'connection-description') {
      this.newConnectionDetailsForm.addControl('connectionDescription', new FormControl([Validators.required]));
    }
    this.activeView = componentName;
  }

  setActiveConnection(connection: ConnectorDetails) {
    this.selectedConnection = connection;
  }

  createConnectionOutput(output: any) {
    console.log('output', output);
  }

  closeDialog(afterCloseData: null) {
    this.dialogRef.close(afterCloseData);
  }
}
