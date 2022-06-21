import { CreateTemplate } from '@models/notif/notif.model';
import { EndpointsDmsService } from './../_endpoints/endpoints-dms.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EndpointWebsocketService } from '@services/_endpoints/endpoint-websocket.service';

@Injectable({
  providedIn: 'root'
})
export class DmsService {

  constructor(
    private http: HttpClient,
    private endpointsDmsService: EndpointsDmsService,
    private endpointWebsocketService: EndpointWebsocketService
  ) { }

  dummyCall() {
    return this.http.get<any>(this.endpointsDmsService.dummyUrl());
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(this.endpointsDmsService.upoadFileUrl(), formData);
  }

  uploadFileWithSNo(file: File, fileSno?: string) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.endpointsDmsService.upoadFileUrl()}?fileSno=${fileSno}`, formData);
  }

  downloadFile(sno: string, revision?: number): Observable<Blob> {
    return this.http.get(this.endpointsDmsService.downloadFileUrl(sno, revision), {responseType: 'blob'});
  }

  downloadFiles(sno: any, revision?: number): Observable<any> {
    return this.http.post(this.endpointsDmsService.downloadFileUrls(),sno);
  }

  deleteFile(sno: string, revision?: number): Observable<any> {
    return this.http.post(this.endpointsDmsService.deleteFileUrl(sno, revision),null);
  }

  createTemplate(templatePayload: CreateTemplate): Observable<any> {
    return this.http.post(this.endpointWebsocketService.createTemplate(), templatePayload);
  }

  updateTemplate(templateType: string, updateTemplatePayload: string): Observable<any> {
    return this.http.put(this.endpointWebsocketService.updateTemplate(templateType), updateTemplatePayload);
  }
}
