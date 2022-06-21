import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { WorkflowBuilderService } from '@services/workflow-builder.service';
import { MatDialog } from '@angular/material/dialog';
import { DecisionsModalComponent } from '../../decisions-modal/decisions-modal.component';
import { ActivatedRoute } from '@angular/router';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'pros-activity-step-properties',
  templateUrl: './activity-step-properties.component.html',
  styleUrls: ['./activity-step-properties.component.scss']
})
export class ActivityStepPropertiesComponent implements OnInit, OnChanges, OnDestroy {

  @Input() bpmnElement;

  activityFormGroup: FormGroup;
  filteredRecipients: Observable<any>;
  recipientSearchControl = new FormControl();
  selectedRecipients = [];
  possibleRecipients = [];
  recipientsList : any = [];
  currentPageIdx = 0;

  workflowFields : any = [];
  selectedWorkflowFields = [];
  connectionsList = [];
  filteredWfFields: Observable<any>;
  wfFieldsSearchControl = new FormControl();
  possiblewfFields = [];
  currentWfPageIdx = 0;

  subscriptionsList: Subscription[] = [];

  @Output() updateProperties = new EventEmitter<any>();

  // Bpmn step types
  ELEMENT_TYPES = {
    Activity: 'bpmn:UserTask'
  }

  recipientsParams = {
    pathName:'WF72',
    stepId:'01',
    recipientType:'USER',
    fetchCount:'0',
    plantCode:'MDO1003',
    clientId:'738',
    lang:'en'
  }

  wfParams = {
    moduleId : '1005',
    pathName: 'WF72'
  }

  previousRecipientType = 'USER';

  basicDetailsControls = ['name', 'recipientType', 'approvedBy', 'taskSubject', 'agentDeterminationType', 'stepPriority'];
  rejectionNotifControls = ['slaHrs'];
  expandedPanel = 1;


  constructor(private workflowBuilderService: WorkflowBuilderService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private route: ActivatedRoute) {

    this.initActivityForm();

  }

  ngOnInit(): void {

    // read moduleId and pathname from query params
    this.subscriptionsList.push(
      this.route.queryParams.subscribe(params => {
          this.recipientsParams.pathName = params.pathname;
          this.wfParams.moduleId = params.moduleId;
          this.wfParams.pathName = params.pathname;

          this.getRecipientsList();
          this.getWfFileds();
      })
    )

    // get which panel should be expanded
    if (this.hasValidationError(this.basicDetailsControls)){
      this.expandedPanel = 1;
    } else if(!this.selectedRecipients.length){
      this.expandedPanel = 2;
    } else if (this.hasValidationError(this.rejectionNotifControls)){
      this.expandedPanel = 3;
    }

  }

  /**
   * init the activity step form group
   */
  initActivityForm() {

    this.activityFormGroup = this.fb.group({
      name: ['', Validators.required],
      recipientType: ['USER', Validators.required],
      approvedBy: ['0', Validators.required],
      roleApprovalBy: ['0'],
      taskSubject: ['', Validators.required],
      agentDeterminationType: ['DEFAULT', Validators.required],
      enhancementPoint: ['Select'],
      stepPriority: ['Low', Validators.required],
      // recipients: [''],
      slaHrs: ['', Validators.required],
      reminderGracePeriode: [''],
      reminderInterval: [''],
      reminderOccurrences: [''],
      escalationGracePeriode: [''],
      escalationInterval: [''],
      escalationReoccurring: [false],
      escalationOccurrences: [''],
      // rejectionActivate: [false],
      rejectionMessage: [''],
      rejectionEnhancementPoint: ['Select'],
      rejectionCriteria: ['off'],
      rejectionToStep: [{value :'', disabled : true}],
      rejectionTerminate: [false],
      rejectionSendMe: [false],
      addDecisions: [false],
      fieldOwnerStep: [false],
      reVerificationRequired: [false],
      skipUserAlreadyApproved: [false],
      showUsers: [false],
      priorityEditable: [false],
      // workflowFields: [[]]
    });

    this.selectedRecipients = [];
    this.possibleRecipients = [];
    this.connectionsList = [];
    this.selectedWorkflowFields = [] ;
    this.previousRecipientType = 'USER';

    this.activityFormGroup.valueChanges
      .subscribe(values => {

        // check if recipient type changed
        if (this.previousRecipientType !== values.recipientType){
          console.log(this.previousRecipientType);
          console.log(values.recipientType)
          this.getRecipientsList();
          this.previousRecipientType = values.recipientType;
          this.selectedRecipients = [];
          this.possibleRecipients = [];
        }

        this.previousRecipientType = values.recipientType;
        this.updateStepProperties();
      });

      // validation purposes
      this.activityFormGroup.markAllAsTouched();
  }

  ngOnChanges(changes): void {
    // console.log(changes.bpmnElement);
    const selectedBpmn = changes.bpmnElement;
    if (selectedBpmn && selectedBpmn.currentValue) {
      if (Object.keys(selectedBpmn.currentValue.businessObject.$attrs).length === 0) {
        this.initActivityForm();
        this.updateStepProperties();
      } else {

        // get element configured attributes and map the name to description field
        const attrs = { ...selectedBpmn.currentValue.businessObject.$attrs, name: selectedBpmn.currentValue.businessObject.name };
        console.log(attrs);
        this.selectedRecipients = JSON.parse(attrs.recipients);
        this.paginateChip() ;
        // get the selected workflow fields
        this.selectedWorkflowFields = JSON.parse(attrs.workflowFields) ;
        this.paginateWfChip() ;
        // get the element outgoing connections in order to populate reject to step list
        this.connectionsList = selectedBpmn.currentValue.outgoing.map(out => {
          const connections = {
            id: out.target.businessObject.id,
            name: out.target.businessObject.name,
            rejection : out.businessObject.$attrs.rejection || false
          }
          return connections;
        });

        /* reset the reject to step attribute if there is no outgoing connections
        if (!this.connectionsList.length || !this.connectionsList.some(con => con.rejection === true)) {
          attrs = { ...attrs, rejectionToStep: '' };
        } else {
          const rejectToStep = this.connectionsList.find(con => con.rejection === true).id ;
          console.log('Rejection to ', rejectToStep)
          attrs = { ...attrs, rejectionToStep: rejectToStep };
        }
        */
        this.activityFormGroup.patchValue(attrs);
      }
    }
    else {
      this.initActivityForm();
    }
  }


  /**
   * handle recipients selection changes
   * @param event changes data
   */
  recipientSelected(event) {
    const selected = event.option.value;
    if (!this.selectedRecipients.some(r => r.recipient.id === selected.id)) {
      // const newRecipient = { recipient : selected, fields : this.selectedWorkflowFields} ;
      const newRecipient = JSON.parse(JSON.stringify({ recipient : selected, fields : this.selectedWorkflowFields})) ;
      // const newRecipient = { recipient : selected, fields : this.selectedWorkflowFields.map(field => Object.assign(field)).slice()} ;
      this.selectedRecipients.push(newRecipient);
      // open the fields config modal if there are some selected fields
      if (this.selectedWorkflowFields.length > 0){
        this.openDecisionsModal(newRecipient);
      }

      if (this.currentPageIdx === 0 && this.possibleRecipients.length < 2) {
        this.possibleRecipients.push(newRecipient);
        this.currentPageIdx = 0;
      }

      this.updateStepProperties();
    }
  }

  /**
   * remove a selected recipient
   * @param index the recipient index
   */
  removeRecipient(index) {
    this.selectedRecipients = this.selectedRecipients.filter(element => element.recipient.id !== this.possibleRecipients[index].recipient.id);
    this.updateStepProperties();
    this.possibleRecipients.splice(index, 1);
    this.paginateChip();
  }


  /**
   * emit an event in order to update the selected step properties
   */
  updateStepProperties() {

    const attributes = { ...this.activityFormGroup.getRawValue(),
                         stepDesc : this.activityFormGroup.value.name,
                         recipients: JSON.stringify(this.selectedRecipients),
                         workflowFields : JSON.stringify(this.selectedWorkflowFields)
                       };

    this.updateProperties.emit(attributes);
  }

  paginateChip(where?: string) {

    const reverseSelected = this.selectedRecipients;
    if (where === 'prev' && this.currentPageIdx > 0) {
      this.possibleRecipients = [];
      if (reverseSelected[(this.currentPageIdx * 2) - 2])
        this.possibleRecipients.push(reverseSelected[(this.currentPageIdx * 2) - 2]);
      if (reverseSelected[(this.currentPageIdx * 2) - 1])
        this.possibleRecipients.push(reverseSelected[(this.currentPageIdx * 2) - 1]);
      this.currentPageIdx--;
    }
    else if (where === 'next' && this.currentPageIdx < this.selectedRecipients.length) {
      this.possibleRecipients = [];
      this.currentPageIdx++;
      if (reverseSelected[this.currentPageIdx * 2])
        this.possibleRecipients.push(reverseSelected[this.currentPageIdx * 2]);
      if (reverseSelected[(this.currentPageIdx * 2) + 1])
        this.possibleRecipients.push(reverseSelected[(this.currentPageIdx * 2) + 1]);
    } else {
      this.possibleRecipients = [];
      if (reverseSelected[this.currentPageIdx * 2])
        this.possibleRecipients.push(reverseSelected[this.currentPageIdx * 2]);
      if (reverseSelected[(this.currentPageIdx * 2) + 1])
        this.possibleRecipients.push(reverseSelected[(this.currentPageIdx * 2) + 1]);
    }

  }

  /**
   * To check / enable previuos button
   */
  get enablePreBtn() {
    return this.currentPageIdx <= 0;
  }
  /**
   * To check / enable next button
   */
  get enableNextBtn() {
    return ((this.currentPageIdx * 2 + 2) < this.selectedRecipients.length && this.selectedRecipients.length > 2);
  }

  fieldSelectionChange(event){
    if(event.option.selected){
      const fieldAttributes = this.workflowFields.filter(field => field.id === event.option.value)[0] ;

      this.selectedWorkflowFields.push({...fieldAttributes, value : ''}) ;

      // add the selected field for all selected recipients
      this.selectedRecipients.forEach(element => {
        element.fields.push(Object.assign({...fieldAttributes, value : ''})) ;
      }) ;

    } else {
      this.selectedWorkflowFields = this.selectedWorkflowFields.filter(field => field.id !== event.option.value) ;

      // remove the unchecked field from all selected recipients
      this.selectedRecipients.forEach(element => {
        element.fields = element.fields.filter(field => field.id !== event.option.value) ;
      }) ;


    }

    this.updateStepProperties() ;
  }

  isFieldSelected(id){
    return this.selectedWorkflowFields.some(field => field.id === id) ;
  }

  openDecisionsModal(recipient) {

    if (!this.activityFormGroup.value.addDecisions || !this.selectedWorkflowFields.length)
      return;

    const dialogRef = this.dialog.open(DecisionsModalComponent, {
      width: '600px',
      data:   JSON.parse(JSON.stringify(recipient))
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result)
        return;

      recipient.fields.forEach(field => {
        field.value = field.picklist === '0' ? result[field.id] || '' : result[field.id].CODE || '' ;
      });
      console.log(this.selectedWorkflowFields ) ;
      this.updateStepProperties() ;


    });
  }

  getRecipientsList(){
    const params = {
      ...this.recipientsParams,
      recipientType : this.activityFormGroup.value.recipientType,
      stepId : this.bpmnElement ? this.bpmnElement.id : '01'
    }
    this.subscriptionsList.push(this.workflowBuilderService.getRecipientList(params)
      .subscribe(recipients => this.recipientsList = recipients.data.allData || []));
  }

  getOptionText(option){
    return option ? option.value : '';
  }


  getWfFileds(){
    this.subscriptionsList.push(this.workflowBuilderService.getWorkflowFields(this.wfParams)
      .subscribe(fields => {
        this.workflowFields = fields.allWFfield || [] ;

        this.filteredWfFields = this.wfFieldsSearchControl.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filterWfFields(value))
          );

      }));
  }

  isFirstStep(){
    return this.bpmnElement.incoming.some(node => node.source.type === 'bpmn:IntermediateCatchEvent');
  }

  getWfFieldText(option){
    return option ? option.label : '';
  }

  wfFieldSelected(event){
    const selected = event.option.value;

    if(!this.selectedWorkflowFields.some(field => field.id === selected.id)){

      this.selectedWorkflowFields.push({...selected, value : ''}) ;

      // add the selected field for all selected recipients
      this.selectedRecipients.forEach(element => {
        element.fields.push(Object.assign({...selected, value : ''})) ;
      }) ;

      if (this.currentWfPageIdx === 0 && this.possiblewfFields.length < 2) {
        this.possiblewfFields.push(selected);
        this.currentWfPageIdx = 0;
      }

      this.updateStepProperties();

    }
  }

  private filterWfFields(value): string[] {
    const filterValue = value.label ? value.label.toLowerCase() : value.toLowerCase() ;
    return this.workflowFields.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  /**
   * To check / enable previuos button
   */
  get enableWfPreBtn() {
    return this.currentWfPageIdx <= 0;
  }
  /**
   * To check / enable next button
   */
  get enableWfNextBtn() {
    return ((this.currentWfPageIdx * 2 + 2) < this.selectedWorkflowFields.length && this.selectedWorkflowFields.length > 2);
  }

  paginateWfChip(where?: string) {

    const reverseSelected = this.selectedWorkflowFields;
    if (where === 'prev' && this.currentWfPageIdx > 0) {
      this.possiblewfFields = [];
      if (reverseSelected[(this.currentWfPageIdx * 2) - 2])
        this.possiblewfFields.push(reverseSelected[(this.currentWfPageIdx * 2) - 2]);
      if (reverseSelected[(this.currentWfPageIdx * 2) - 1])
        this.possiblewfFields.push(reverseSelected[(this.currentWfPageIdx * 2) - 1]);
      this.currentWfPageIdx--;
    }
    else if (where === 'next' && this.currentWfPageIdx < this.selectedWorkflowFields.length) {
      this.possiblewfFields = [];
      this.currentWfPageIdx++;
      if (reverseSelected[this.currentWfPageIdx * 2])
        this.possiblewfFields.push(reverseSelected[this.currentWfPageIdx * 2]);
      if (reverseSelected[(this.currentWfPageIdx * 2) + 1])
        this.possiblewfFields.push(reverseSelected[(this.currentWfPageIdx * 2) + 1]);
    } else {
      this.possiblewfFields = [];
      if (reverseSelected[this.currentWfPageIdx * 2])
        this.possiblewfFields.push(reverseSelected[this.currentWfPageIdx * 2]);
      if (reverseSelected[(this.currentWfPageIdx * 2) + 1])
        this.possiblewfFields.push(reverseSelected[(this.currentWfPageIdx * 2) + 1]);
    }

  }

  /**
   * remove a selected wfField
   * @param index of the field
   */
  removeWfField(index) {
    this.selectedWorkflowFields = this.selectedWorkflowFields.filter(element => element.id !== this.possiblewfFields[index].id);

    // remove the field from all selected recipients
    this.selectedRecipients.forEach(element => {
      element.fields = element.fields.filter(field => field.id !== this.possiblewfFields[index].id) ;
    }) ;

    this.updateStepProperties();
    this.possiblewfFields.splice(index, 1);
    this.paginateWfChip();
  }

  hasValidationError(controls : string[]){
    return controls.some(control => this.activityFormGroup.get(control).invalid);
  }



  ngOnDestroy() {
    this.subscriptionsList.forEach(sub => sub.unsubscribe());
  }

}
