import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { EmailTemplateComponent } from './email-template.component';
import { ReportService } from '../../../_service/report.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { EmailTemplate, EmailTemplateBody } from '../../../_models/email';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of, throwError } from 'rxjs'

describe('EmailTemplateComponent', () => {
  let component: EmailTemplateComponent;
  let fixture: ComponentFixture<EmailTemplateComponent>;
  let reportService: ReportService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailTemplateComponent ],
      imports:[ RouterTestingModule,HttpClientTestingModule,AppMaterialModuleForSpec,MdoUiLibraryModule]
    })
    .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    /* Inject report service */
    reportService = fixture.debugElement.injector.get(ReportService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close(), should close the current router' , () => {
    spyOn(router, 'navigate');
    component.close();
    expect(component.close).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/report/send-email/`, outer: null } }]);
  });

  it('updateTemplate(), should update the selected template' , () => {
    const event = {option:{ viewValue: 'Template Test' }} as MatAutocompleteSelectedEvent;
    const templates: EmailTemplate[] =  [{ _id: 'Template 1', desc: 'Subject - Template 1'}];
    spyOn(router, 'navigate');
    spyOnProperty(reportService.selectedTemplate, 'value', 'get').and.returnValue(templates[0]);
    component.updateTemplate(event);
    expect(component.close).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: `sb/report/send-email/`, outer: null } }]);
  });

  it('getDropdownPos(), should return dropdown position' , () => {
    const event = {isOpen: true} as MatAutocomplete;
    const returnedPosition = component.getDropdownPos(event);
    expect(returnedPosition).toEqual('chevron-up');
  });

  it('setupFilteredList(), should filter templates based on id' , () => {
    component.templates = [{ _id: 'Template 1', desc: 'Subject - Template 1'}]
    component.templateFormGrp.controls.templateName.setValue(component.templates[0].desc);
    component.setupFilteredList();
    expect(component.filteredTemplates).toBeTruthy();
  });

  it('getAllTemplates(), should return all templates',()=>{
    const templates: EmailTemplate[] =  [{ _id: 'Template 1', desc: 'Subject - Template 1'}];
    spyOn(reportService,'getAllTemplates').and.returnValues(of(templates), throwError('Error'));
    component.getAllTemplates();
    expect(component.templates.length).toEqual(2);

    component.getAllTemplates();
    expect(component.templates.length).toEqual(2);
  });

  it('getTemplateById(), should return template',()=>{
    const template: EmailTemplateBody =  {emailSubject: 'subject', subType: 'dashboard', emailText: 'subject', templateDescription: 'test' }
    spyOn(reportService,'getTemplateById').and.returnValues(of(template), throwError('Error'), of(null));
    component.getTemplateById('_id');
    expect(component.emailTemplate ).toEqual(template);

    component.getTemplateById('');
    expect(component.getTemplateById).toThrowError();

    component.getTemplateById('');
    expect(component.emailTemplate).toBeDefined();
  });
});
