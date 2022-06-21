import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateTemplate, EmailTemplateReqParam, TemplateModel, TemplateModelResponse } from '@models/notif/notif.model';
import { EndpointsNotifService } from '@services/_endpoints/endpoints-notif.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotifService {

  private emailTemplate: BehaviorSubject<TemplateModel> = new BehaviorSubject<TemplateModel>(null);
  emailTemplate$ = this.emailTemplate.asObservable();

  private pdfTemplateChanged: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  pdfTemplateChanged$ = this.pdfTemplateChanged.asObservable();

  constructor(
    private http: HttpClient,
    private endpointsNotifService: EndpointsNotifService,) { }

    getTemplate(offset: number, limit: number, reqParam?: EmailTemplateReqParam) {
      return this.http.post<TemplateModelResponse>(`${this.endpointsNotifService.getTemplateUrl()}?offset=${offset}&limit=${limit}`, reqParam);
    }
    getTemplateById(templateId: number) {
      return this.http.get<TemplateModel>(`${this.endpointsNotifService.getTemplateByIdUrl(templateId.toString())}`);
    }
    createTemplate(templatePayload: FormData): Observable<any> {
      return this.http.post<any>(this.endpointsNotifService.createTemplateUrl(), templatePayload);
    }
    updateTemplate(updateTemplatePayload: FormData): Observable<any> {
      return this.http.put<any>(this.endpointsNotifService.updateTemplateUrl(), updateTemplatePayload);
    }

    nextEmailTemplate(model: TemplateModel) {
      this.emailTemplate.next(model);
    }
    nextPdfTemplateChanged(action, id) {
      this.pdfTemplateChanged.next({action, id});
    }
    deleteTemplateById(templateId){
      return this.http.delete<any>(this.endpointsNotifService.deleteTemplateById(templateId))
    }
}
