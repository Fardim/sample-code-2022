import { Component, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { CancelJobConfirmationComponent } from '../../_components/system-tray/cancel-job-confirmation/cancel-job-confirmation.component';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabGroup } from '@angular/material/tabs';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CustomNotification } from '@models/customNotification';
import { JobQueue } from '@models/jobQueue';
import { Userdetails } from '@models/userdetails';
import { GlobaldialogService } from '@services/globaldialog.service';
import { HomeService } from '@services/home/home.service';
import { UserService } from '@services/user/userservice.service';
import { Subscription } from 'rxjs';
import { TransientService } from 'mdo-ui-library';
import { finalize } from 'rxjs/operators';
import { DmsService } from '@services/dms/dms.service';

@Component({
  selector: 'pros-system-tray',
  templateUrl: './system-tray.component.html',
  styleUrls: ['./system-tray.component.scss']
})
export class SystemTrayComponent implements OnInit {

  /**
   * Variable to store the user details
   */
  userDetails: Userdetails

  /**
   * notification subscription
   */
  notificationSubscription = new Subscription();

  /**
   * variable to store notifications
   */
  notifications: Array<CustomNotification> = [];

  /**
   * loader for notifications
   */
  loader: boolean;

  /**
   * child object to access mat group events
   */

  @ViewChild('matTabgroup') mattabgroup: MatTabGroup;

  jobQueueData: JobQueue[] = [];
  ////
  displayedColumns: string[] = ['jobName', 'status', 'startTime', 'endTime', 'userName', 'enableCancel'];
  // dataSource = ELEMENT_DATA;

  notificationPagination = {
    from: 0,
    to: Math.round(window.innerHeight / 50 * 1.5),
    offset: Math.round(window.innerHeight / 50 * 1.5)
  }

  jobsPagination = {
    fetchCount: 0,
    fetchSize: Math.round(window.innerHeight / 50 * 1.5),
    offset: Math.round(window.innerHeight / 50 * 1.5)
  }
  showNotifications: boolean;
  joblist: any;
  dataSource: MatTableDataSource<JobQueue> = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  /**
   * Constructor of class
   * @param router Router object
   * @param userService User service object
   */
  searchControl = new FormControl();

  isJobsLoading = false;

  /**
   * fieldList pagination size
   */
  recordsPageSize = 5;
  totalCount = 0;
  recordsPageIndex = 1;
  constructor(
    private router: Router,
    public globalDialogService: GlobaldialogService,
    public userService: UserService,
    public homeService: HomeService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private transient: TransientService,
    private dmsService: DmsService
  ) { }

  /*
   * Angular hook
   */
  ngOnInit(): void {
    this.getUser();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.router.url.includes('sb:sb/system-tray/notifications')) {
      this.showNotifications = true;
      this.getNotifications();
    } else {
      this.showNotifications = false;
      this.getJobsQueue();
    }

    this.initSearchControl();
  }


  /**
   * Function to get User details
   */
  getUser() {
    this.userService.getUserDetails()
      .subscribe((user: Userdetails) => {
        this.userDetails = user;
        this.getNotifications();
      })
  }

  cancelJob(jobId) {
    this.homeService.cancelJob(jobId).subscribe((res) => {
      this.getJobsQueue(true);
      this.transient.open('Job cancelled successfully!', 'Dismiss');
    }, (error) => {
      this.transient.open('Couldn\'t cancel the job', 'Dismiss');
    });
  }

  cancel(job: JobQueue) {
    this.dialog.open(CancelJobConfirmationComponent, {
      data: {
        dialogTitle: 'Confirmation',
        label: `Cancelling a job will cancel all the unprocessed batches. Data from Completed batches will not
        be affected. This action cannot be undone. Select "Yes" to continue.`,
      },
      disableClose: true,
      autoFocus: false,
      width: '758px',
      panelClass: 'create-master-panel',
    }).afterClosed().subscribe((result) => {
      console.log(result);
      if(result?.confirmation) {
        this.cancelJob(job.jobId);
      }
    })
  }

  /**
   * Function to get Notifications
   */
  getNotifications(reload = true) {
    if (reload) {
      this.notificationPagination.from = 0;
      this.notificationPagination.to = this.notificationPagination.offset;
    }
    this.loader = true;
    this.notificationSubscription = this.homeService
      .getNotifications(
        this.userDetails.userName,
        this.notificationPagination.from,
        this.notificationPagination.to
      )
      .subscribe((notifications: Array<CustomNotification>) => {
        this.loader = false;
        notifications.forEach((notification) => {
          notification.showMore = false;
        })
        if (reload) {
          this.notifications = [...notifications];
        } else {
          this.notifications.push(...notifications);
        }
      }, () => {
        this.loader = false;
      });
  }
// shortname//
getShortName(fullName) {
  return fullName.split(' ').map(n => n[0]).join('');
}
  /**
   * function to get jobs
   */
  getJobsQueue(reload = true) {
    if (reload) {
      this.jobsPagination.fetchCount = 0;
      this.jobsPagination.fetchSize = this.jobsPagination.offset;
      this.dataSource = new MatTableDataSource([]);
      this.jobQueueData = [];
    }

    this.isJobsLoading = true;

    this.homeService.getJobs().pipe(finalize(() => this.isJobsLoading = false)).subscribe((jobs: JobQueue[]) => {

      if(jobs.length > 0){
        this.totalCount = jobs.length;

        jobs.forEach((job) => {
          if(job){

            this.jobQueueData.push({
              jobName: job.jobName || 'Untitled',
              endTime: job?.endTime || '-',
              jobId: job?.jobId || 'Unknown',
              startTime: job?.startTime || '-',
              status: job?.status || 'Unknown',
              userName: job?.userName || 'Unknown',
              enableCancel: job?.status === 'running',
              responseData: job?.responseData || 'Unknown'
            });
          }
        });

        // this.jobQueueData = jobs;
        this.dataSource = new MatTableDataSource(this.jobQueueData);
        this.dataSource.sort = this.sort;
      }
    }, () => {
    });
  }

  /**
   * get the correct label style based on status
   * @param status pass the status
   * @returns label status value
   */
  getLabelStatus(status: any) {
    const statuses = {
      failed: 'error',
      cancelled: 'warning',
      completed: 'success',
      running: 'info',
    };

    return statuses[status];
  }

  /**
   * Function to update notification
   * @param notification the selection notification
   */
  updateNotification(notification: CustomNotification) {
    notification.msgUnread = '1';
    this.homeService.updateNotification([notification]).subscribe(() => {
      this.getNotifications();
    })
  }

  /**
   * Delete a notification
   * @param notificationid id of selected notification
   */
  deleteNotification(notificationid: string) {
    this.globalDialogService.confirm({ label: 'Are you sure you want to delete this ?' }, (response) => {
      if (response && response === 'yes') {
        const subscriber = this.homeService.deleteNotification([notificationid]).subscribe(() => {
          this.getNotifications();
          subscriber.unsubscribe();
        });
      }
    });
  }

  /**
   * identify unique items and update on change
   */
  trackByFn(index: number, item: CustomNotification) {
    return item?.id;
  }

  /**
   * Function to paginate notifications
   */
  paginateNotification() {
    this.notificationPagination.from += this.notificationPagination.offset;
    this.notificationPagination.to += this.notificationPagination.offset;
    this.getNotifications(false);
  }

  /**
   * Function to paginate getJobsQueue
   */
  paginateJobs() {
    this.jobsPagination.fetchCount += this.jobsPagination.offset;
    this.jobsPagination.fetchSize += this.jobsPagination.offset;
    this.getJobsQueue(false);
  }

  close() {
    this.router.navigate([{ outlets: { sb: null } }], {
      queryParamsHandling: 'preserve'
    });
  }

  download(link: string) {
    let url = link.includes('/rule/schema/actions/downloadS3') ? `${link}&token=${localStorage.getItem('JWT-TOKEN')}` : `${link}`;
    const downloadLink = document.createElement('a');
    // Only keep url safe strings
    url = url.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]/g, '');
    // Add additional sanitation from DOM Sanitizer
    downloadLink.href = this.sanitizer.sanitize(SecurityContext.URL, url);
    downloadLink.setAttribute('target', '_blank');
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

  downloadTaxonomy(sno: string, fileName: string) {
    if(!sno) {
      return;
    }
    this.dmsService.downloadFile(sno).subscribe(resp => {
      if(resp) {
        const file = new window.Blob([resp], {type: 'application/octet-stream'});
        const downloadAncher = document.createElement('a');
        downloadAncher.style.display = 'none';
        const fileURL = URL.createObjectURL(file);
        downloadAncher.href = fileURL;
        downloadAncher.download = fileName;
        downloadAncher.click();
      }
    },
    error => {
      console.error(`Something went wrong, try later !`);
    });
  }


  initSearchControl() {
    this.searchControl.valueChanges.subscribe((searchText: string) => {
      this.dataSource.filter = searchText.trim().toLowerCase();
    })
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      // this.getTableData();
    }
  }

  // display page records range
  get displayedRecordsRange(): string {
    const endRecord =
      this.recordsPageIndex * this.recordsPageSize < this.totalCount ? this.recordsPageIndex * this.recordsPageSize : this.totalCount;
    return this.totalCount ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }

}