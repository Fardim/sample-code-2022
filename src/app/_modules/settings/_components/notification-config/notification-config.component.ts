import { Component, OnInit, ViewChild } from '@angular/core';
import { Userdetails } from '@models/userdetails';
import { HomeService } from '@services/home/home.service';
import { Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface NotificationElement {
  eventId: number;
  eventName: string;
  allowDesktopNotification: boolean;
  allowMobileNotification: boolean;
  emailNotification: string;
}

const ELEMENT_DATA: NotificationElement[] = [
  { eventId: 0, eventName: 'Event 1', allowDesktopNotification: false, allowMobileNotification: true, emailNotification: '1' },
  { eventId: 1, eventName: 'Event 2', allowDesktopNotification: true, allowMobileNotification: true, emailNotification: '2' },
  { eventId: 2, eventName: 'Event 3', allowDesktopNotification: true, allowMobileNotification: false, emailNotification: '3' },
  { eventId: 3, eventName: 'Event 4', allowDesktopNotification: false, allowMobileNotification: false, emailNotification: '1' },
];
@Component({
  selector: 'pros-notification-config',
  templateUrl: './notification-config.component.html',
  styleUrls: ['./notification-config.component.scss'],
})
export class NotificationConfigComponent implements OnInit {
  showNotifications = true;
  displayedColumns: string[] = ['eventName', 'allowDesktopNotification', 'allowMobileNotification', 'emailNotification'];
  dataSource = ELEMENT_DATA;
  tableDataSource = new MatTableDataSource(this.dataSource);
  subscription: Subscription = new Subscription();
  userDetails: Userdetails;
  sort: MatSort

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  constructor(private homeservice: HomeService) {}

  ngOnInit(): void {
    // this.getNotificationsList(); TODO: commented for now as api is yet not available
  }

  // get list of notifications on init
  getNotificationsList() {
    this.subscription.add(
      this.homeservice.getNotifications(this.userDetails.userName, 0, +this.userDetails.currentRoleId).subscribe((res) => {
        if (res) {
          this.dataSource = res.length > 0 ? res : this.dataSource;
          this.tableDataSource = new MatTableDataSource(this.dataSource);
        }
      })
    );
  }

  // toggle notifications buttons and related view
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  /**
   * To update params in main event array
   * @param eventId selected event id
   * @param param Changable param name
   * @param value changed value
   */
  masterToggle(eventId, param, value) {
    this.dataSource.forEach((element) => {
      if (element.eventId === eventId) {
        element[param] = value;
      }
    });

    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.tableDataSource.sort = this.sort
  }
}
