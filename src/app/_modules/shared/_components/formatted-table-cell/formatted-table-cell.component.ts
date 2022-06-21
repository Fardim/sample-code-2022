import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Userdetails } from '@models/userdetails';
import { UserService } from '@services/user/userservice.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-formatted-table-cell',
  templateUrl: './formatted-table-cell.component.html',
  styleUrls: ['./formatted-table-cell.component.scss']
})
export class FormattedTableCellComponent implements OnInit, OnDestroy {

  @Input()
  fieldType: string;

  @Input() set cellValue(v) {
    this.value = v?.filter(o => o.t || o.c);
  }

  @ViewChild('textareaContainer') set textareaContainer (v: ElementRef) {
    this.container = v;
    setTimeout(() => this.truncateOverflow(), 10);
  }

  @Input()
  maxAllowedChips = 2;

  DefaultDateFormat = 'DD.MM.YY (hh:mm)';
  value = [];
  userDetails: Userdetails;
  container: ElementRef;
  hasOverflow = false;
  subscription: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.subscription = this.userService.getUserDetails().subscribe(uDetails => {
      this.userDetails = uDetails;
    });
  }

  getDateValue() {
    const dateformat = this.userDetails?.dateformat || this.DefaultDateFormat;
    return moment(+this.value[0].c).format(dateformat);
  }

  truncateOverflow() {
    if (!this.container) return;
    const el = this.container.nativeElement;
    const elheight = el.offsetHeight;
    let eltxt = el.innerHTML;
    while (elheight < el.scrollHeight) {
      eltxt = eltxt.substring(0, eltxt.length - 1);
      el.innerHTML = eltxt + '...';
      this.hasOverflow = true;
    }
  }

  getHiddenOptions(maxAllowedSize) {
    return this.value.slice(maxAllowedSize)
               .map(o => o.t || o.c)
               .join(', ');
  }

  getAttachmentIcon(attachmentName) {
    let attachmentIcon = '';
    const attachmentExt = attachmentName.split('.')[1];
    switch (attachmentExt) {
      case 'docx':
      case 'doc': {
        attachmentIcon = '/assets/images/ext/doc.svg';
        break;
      }
      case 'jpg':
      case 'png':
      case 'jpeg': {
        attachmentIcon = '/assets/images/ext/img.svg';
        break;
      }
      case 'pdf': {
        attachmentIcon = '/assets/images/ext/pdf.svg';
        break;
      }
      case 'pptx':
      case 'ppt': {
        attachmentIcon = '/assets/images/ext/ppt.svg';
        break;
      }
      case 'txt': {
        attachmentIcon = '/assets/images/ext/txt.svg';
        break;
      }
      case 'csv':
      case 'xlxs':
      case 'xls': {
        attachmentIcon = '/assets/images/ext/xls.svg';
        break;
      }
      case 'zip': {
        attachmentIcon = '/assets/images/ext/zip.svg';
        break;
      }
      default: {
        attachmentIcon = '/assets/images/ext/none.svg';
        break;
      }
    }
    return attachmentIcon;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
