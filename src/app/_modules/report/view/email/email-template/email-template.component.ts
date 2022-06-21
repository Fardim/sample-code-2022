import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportService } from '../../../_service/report.service'
import { EmailTemplate, EmailTemplateBody } from '../../../_models/email';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocomplete,MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'pros-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss']
})
export class EmailTemplateComponent implements OnInit {
  /* Templates list */
  templates: EmailTemplate[] = [{ _id: '0', desc: 'No' }];

  /* Email Template body */
  emailTemplate: EmailTemplateBody;
  /* Form group for the language settings */
  templateFormGrp: FormGroup;
  /*  holds the list of filtered options */
  filteredTemplates: Observable<EmailTemplate[]>;

  subscriptions: Subscription[] = [];

  constructor(private router: Router, private reportService: ReportService) { }

  ngOnInit(): void {
    this.setUpForm();
    this.getAllTemplates();
  }

  /* Close slidesheet */
  close() {
    this.router.navigate([{ outlets: { sb: `sb/report/send-email/`, outer: null } }]);
  }

  /*
   * @param el mat auto complete element
   * @returns icon name
   */
   getDropdownPos(el: MatAutocomplete) {
    let pos = 'chevron-down';
    if (el && el.isOpen) {
      pos = 'chevron-up';
    }
    return pos;
  }

  /* Set Filtered list */
  public setupFilteredList() {
    this.filteredTemplates = this.templateFormGrp.controls.templateName.valueChanges.pipe(
      startWith(''),
      map((template: string | null) => template ? this.filter(template, this.templates) : this.templates?.slice()));
  }

   /* Setup the form*/
  private setUpForm(){
    this.templateFormGrp = new FormGroup({
      templateName: new FormControl(),
    });
    const template = this.reportService.selectedTemplate.getValue();
    const templateDesc = template?.templateDescription ?? 'No';
    this.templateFormGrp.controls.templateName.setValue(templateDesc);
    this.setupFilteredList();
  }

  /**
   * filters data list
   * @param value filter value
   * @param list current list to filter
   */
   private filter(value: string, list: EmailTemplate[]): EmailTemplate[] {
    const filterValue = value?.toLowerCase();
    if (list) {
      return list.filter(temp => temp?.desc?.toLowerCase().indexOf(filterValue) === 0);
    }
  }

  /* Update the template */
  updateTemplate(event: MatAutocompleteSelectedEvent){
    const templateId = event.option.value;
    this.getTemplateById(templateId);
    this.close();
  }

  /* API call to get all templates */
  public getAllTemplates(){
    const templates = this.reportService.getAllTemplates().subscribe((resp)=>{
      if(resp && resp.length > 0){
        this.templates = this.templates.concat(resp);
      }
    },err => {
      console.log('Error while getting all templates');
     })
    this.subscriptions.push(templates);
  }

  /* API call to get template by Id */
  public getTemplateById(_id: string){
    if(!_id) this.emailTemplate = {} as EmailTemplateBody;

    const template = this.reportService.getTemplateById(_id).subscribe((resp) => {
      this.emailTemplate = resp;
      if(!resp){
        this.emailTemplate = {} as EmailTemplateBody
      }
      this.reportService.selectedTemplate.next(this.emailTemplate);
    },err => {
      console.log(`Error while getting template ${_id}`);
     });

    this.subscriptions.push(template);
  }
}
