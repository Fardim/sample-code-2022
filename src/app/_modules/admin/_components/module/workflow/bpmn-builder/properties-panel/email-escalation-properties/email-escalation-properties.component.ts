import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { WorkflowBuilderService } from '@services/workflow-builder.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'pros-email-escalation-properties',
  templateUrl: './email-escalation-properties.component.html',
  styleUrls: ['./email-escalation-properties.component.scss']
})
export class EmailEscalationPropertiesComponent implements OnInit, OnChanges, OnDestroy {

  @Input() bpmnElement;

  emailForm: FormGroup;
  oldFormValue;
  filteredRecipients: Observable<any>;
  recipientSearchControl = new FormControl();
  selectedRecipients = [];
  possibleRecipients = [];
  recipientsList : any = [];
  currentPageIdx = 0;

  subscriptionsList: Subscription[] = [];

  @Output() updateProperties = new EventEmitter<any>();

  recipientsParams = {
    pathName:'WF72',
    stepId:'01',
    recipientType:'USER',
    fetchCount:'0',
    plantCode:'MDO1003',
    clientId:'738',
    lang:'en'
  }

  openedPanel = 1;
  basicDetailsControls = ['name', 'recipientType'];

  constructor(private workflowBuilderService: WorkflowBuilderService,
    private fb: FormBuilder,
    private route: ActivatedRoute) {

    this.initForm();

  }

  ngOnInit(): void {

    // read moduleId and pathname from query params
    this.subscriptionsList.push(
      this.route.queryParams.subscribe(params => {
          this.recipientsParams.pathName = params.pathname;
          this.getRecipientsList();
      })
    )

    // select which panel should be opened first
    if( !this.basicDetailsErrors() && !this.selectedRecipients.length){
      this.openedPanel = 2;
    }
  }

  /**
   * init the email escalation step form group
   */
  initForm(value?) {

    this.emailForm = this.fb.group({
      name: [value && value.name ? value.name : '', Validators.required],
      recipientType: [value && value.recipientType ? value.recipientType : 'USER', Validators.required],
    });

    this.selectedRecipients = [];
    this.possibleRecipients = [];

    this.emailForm.valueChanges
      .subscribe(values => {
        // init the recipients list if the recipient type changes
        if(this.oldFormValue && (this.oldFormValue.recipientType !== values.recipientType)){
          this.selectedRecipients = [];
          this.possibleRecipients = [];
          this.getRecipientsList();
        }
        this.oldFormValue = values;

        // emit an update event
        this.updateStepProperties();
      });

    // for validation purposes
    this.emailForm.markAllAsTouched();
  }

  ngOnChanges(changes): void {
    console.log(changes.bpmnElement);
    const selectedBpmn = changes.bpmnElement;
    if (selectedBpmn && selectedBpmn.currentValue) {
      if (Object.keys(selectedBpmn.currentValue.businessObject.$attrs).length === 0) {
        this.initForm();
        this.updateStepProperties();
      } else {
        // get element configured attributes and map the name to description field
        const attrs = { ...selectedBpmn.currentValue.businessObject.$attrs, name: selectedBpmn.currentValue.businessObject.name };
        console.log('Configured attributes: ', attrs);
        this.initForm(attrs) ;
        this.selectedRecipients = JSON.parse(attrs.recipients);
        this.paginateChip() ;
      }


      // set search control state
      if(!this.selectedRecipients.length){
        this.recipientSearchControl.setValidators(Validators.required);
        this.recipientSearchControl.markAsTouched();
      }

    }

  }


  /**
   * handle recipients selection changes
   * @param event changes data
   */
  recipientSelected(event) {
    const selected = event.option.value;
    if (!this.selectedRecipients.some(r => r.id === selected.id)) {
      this.selectedRecipients.push(selected);
      if (this.currentPageIdx === 0 && this.possibleRecipients.length < 2) {
        this.possibleRecipients.push(selected);
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
    this.selectedRecipients = this.selectedRecipients.filter(recipient => recipient.id !== this.possibleRecipients[index].id);
    this.updateStepProperties();
    this.possibleRecipients.splice(index, 1);
    this.paginateChip();

    // set search control state
    if(!this.selectedRecipients.length){
      this.recipientSearchControl.setValidators(Validators.required);
      this.recipientSearchControl.markAsTouched();
    }
  }


  /**
   * emit an event in order to update the selected step properties
   */
  updateStepProperties() {

    const attributes = { ...this.emailForm.value,
                         stepDesc : this.emailForm.value.name,
                         recipients: JSON.stringify(this.selectedRecipients)
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

  getRecipientsList(){

    const params = {
      ...this.recipientsParams,
      recipientType : this.emailForm.value.recipientType,
      stepId : this.bpmnElement ? this.bpmnElement.id : '01'
    }

    return this.subscriptionsList.push(this.workflowBuilderService.getRecipientList(params)
    .subscribe(recipients => this.recipientsList = recipients.data.allData || []));
  }

  getOptionText(option){
    return option ? option.value : '';
  }

  basicDetailsErrors(){
    return this.basicDetailsControls.some(cName => this.emailForm.controls[cName].invalid) ;
    // return this.emailForm.controls['name'].invalid ||  this.emailForm.controls['recipientType'].invalid ;
  }

  ngOnDestroy() {
    this.subscriptionsList.forEach(sub => sub.unsubscribe());
  }


}
