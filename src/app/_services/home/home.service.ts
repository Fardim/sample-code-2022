import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomNotification } from '@models/customNotification';
import { EndpointsClassicService } from '@services/_endpoints/endpoints-classic.service';
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(
    private http: HttpClient,
    public endpointService: EndpointsClassicService
  ) { }

  /**
   * Service to get notifications
   * @param userName logged in username
   * @param from pagination from value
   * @param to pagination to value
   */
  getNotifications(userName: string, from: number, to: number): Observable<any> {
    return this.http.get(this.endpointService.getNotificationsUrl(userName, from.toString(), to.toString()))
  }

  /**
   * function to update notification
   * @param notifications notigication object
   */
  updateNotification(notifications: CustomNotification[]): Observable<any> {
    return this.http.post(this.endpointService.getUpdateNotificationUrl(), notifications)
  }

  /**
   * function to delete notification
   * @param notificationIds notification id
   */
  deleteNotification(notificationIds: string[]): Observable<any> {
    return this.http.post(this.endpointService.getDeleteNotificationUrl(), notificationIds)
  }

  /**
   * Function to call the api to get the job queue
   * @param userName userid of logged in user
   * @param plantCode plantcode of loggedin user
   */
  getJobQueue(userName: string, plantCode: string, fetchData: any = null) {
    return this.http.get(this.endpointService.getJobQueueUrl(userName, plantCode, fetchData))
  }

  /**
   * Function to get notifiucation count
   * @param userName username of logged in user
   */
  getNotificationCount(userName: string): Observable<any> {
    return this.http.get(this.endpointService.getNotificationsCount(userName))
  }

  cancelJob(jobId: string): Observable<any> {
    return this.http.delete(this.endpointService.getCancelJobUrl(jobId));
  }

  getJobs(): Observable<any> {
    return this.http.get(this.endpointService.getJobs());
  }
}
