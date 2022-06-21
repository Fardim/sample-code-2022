import { NotifService } from './../../../../../_services/notif/notif.service';
import { TemplateModel, EmailTemplateReqParam, TemplateModelResponse } from '@models/notif/notif.model';
import { CoreService } from '@services/core/core.service';
import { Dataset } from '@models/schema/schema';
import { debounceTime, distinctUntilChanged, take, catchError, finalize } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, Input, OnInit, Output, EventEmitter, Inject, LOCALE_ID } from '@angular/core';

@Component({
  selector: 'pros-dynamic-attachment',
  templateUrl: './dynamic-attachment.component.html',
  styleUrls: ['./dynamic-attachment.component.scss']
})
export class DynamicAttachmentComponent implements OnInit {

  @Input() frmGrp: FormGroup = null;
  @Output() remove = new EventEmitter<boolean>();
  moduleList: Dataset[] = [];
  moduleFetchSize = 10;
  moduleFetchCount = 0;
  moduleSearch = '';
  moduleLoading = false;
  searchModuleCtrl: FormControl = new FormControl();

  pdfTemplateList: TemplateModel[] = [];
  pdfTemplateFetchSize = 10;
  pdfTemplateFetchCount = 0;
  pdfTemplateSearch = '';
  pdfTemplateLoading = false;
  pdfTempSearchCtrl: FormControl = new FormControl();
  constructor(private coreService: CoreService, private notifService: NotifService, @Inject(LOCALE_ID) public locale: string,) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  ngOnInit(): void {
    this.getModules();
    this.searchModuleCtrl.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      if(!(searchString && searchString.moduleId)) {
        this.moduleSearch = searchString || '';
        this.moduleList = [];
        this.moduleFetchCount = 0;
        this.getModules(this.moduleSearch);
      }
    });
    this.pdfTempSearchCtrl.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      if(!(searchString && searchString.id)) {
        this.pdfTemplateSearch = searchString || '';
        this.pdfTemplateList = [];
        this.pdfTemplateFetchCount = 0;
        const req: EmailTemplateReqParam = this.createPDFPayload();
        this.getPDFTemplates(this.pdfTemplateFetchCount, this.pdfTemplateFetchSize, req);
      }
    });
    if(this.frmGrp.value.dataset) {
      this.getModuleDetails(this.frmGrp.value.dataset);
    }
    if(this.frmGrp.value.templateId) {
      this.getTemplateById(+this.frmGrp.value.templateId);
    }
  }

  getModuleDetails(moduleId: string) {
    this.coreService.getEditObjectTypeDetails(moduleId).pipe(take(1)).subscribe(resp => {
      this.searchModuleCtrl.setValue({moduleId, moduleDesc: resp.moduleDescriptionMap[this.locale][0].description});
    });
  }
  getTemplateById(templateId: number) {
    this.notifService.getTemplateById(templateId).pipe(take(1)).subscribe(resp => {
      this.pdfTempSearchCtrl.setValue(resp)
    });
  }

  getModules(description: string = '') {
    this.moduleLoading = true;
    this.coreService
      .searchAllObjectType({ lang: 'en', fetchsize: this.moduleFetchSize, fetchcount: this.moduleFetchCount, description })
      .pipe(take(1))
      .subscribe(
        (resp) => {
          this.moduleList.push(...resp);
          this.moduleLoading = false;
        },
        (err) => {
          console.log(err);
          this.moduleLoading = false;
        }
      );
  }

  getPDFTemplates(offset: number, limit: number, reqParam?: EmailTemplateReqParam) {
    this.pdfTemplateLoading = true;
    this.notifService
      .getTemplate(offset, limit, reqParam)
      .pipe(
        catchError((err) => {
          console.log(err);
          const emptyResponse = new TemplateModelResponse();
          return of(emptyResponse);
        }),
        finalize(() => this.pdfTemplateLoading=false)
      )
      .subscribe(
        (res: TemplateModelResponse) => {
          this.pdfTemplateList = res.templateModels;
        },
        (error) => {
          console.error(`Error : ${error.message}`);
        }
      );
  }

  displayDatasetFn(dataset): string {
    if (dataset) {
      return dataset.moduleDesc ? dataset.moduleDesc : '';
    }
    return '';
  }

  displayPDFFn(pdfTemp: TemplateModel): string {
    if (pdfTemp) {
      return pdfTemp.templateName ? pdfTemp.templateName : '';
    }
    return '';
  }

  selectRefDataset(event) {
    this.frmGrp.patchValue({dataset: event.option.value.moduleId});
    this.searchModuleCtrl.setValue(event.option.value)

    const req: EmailTemplateReqParam = this.createPDFPayload();
    this.getPDFTemplates(this.pdfTemplateFetchCount, this.pdfTemplateFetchSize, req);
  }

  selectPDFTemplate(event) {
    this.frmGrp.patchValue({templateId: event.option.value.id});
    this.pdfTempSearchCtrl.setValue(event.option.value)
  }

  createPDFPayload() {
    const req: EmailTemplateReqParam = {
      dataSet: this.frmGrp.value.dataset,
      templateName: this.pdfTemplateSearch,
      templateType: 'PDF_TEMPLATE',
      modifiedDate: null,
      modifiedUser: null,
      createdUser: null
    };
    return req;
  }

  removeAttachment() {
    this.remove.emit(true);
  }
}
