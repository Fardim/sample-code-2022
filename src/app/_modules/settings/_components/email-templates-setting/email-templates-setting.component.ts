import { EmailTemplateDataSource } from './email-template-data-source';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TransientService } from 'mdo-ui-library';
import { NotifService } from '@services/notif/notif.service';
import { SelectionModel } from '@angular/cdk/collections';
import { TemplateModel, EmailTemplateReqParam } from '@models/notif/notif.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'pros-email-templates-setting',
  templateUrl: './email-templates-setting.component.html',
  styleUrls: ['./email-templates-setting.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class EmailTemplatesSettingComponent implements OnInit {
  displayedColumns: string[] = ['action', 'templateName', 'templateType', 'RelatedFlow', 'modifiedDate', 'modifiedUser'];
  // dataSource = TEMPLATE_DUMMY_DATA;
  dataSource: EmailTemplateDataSource = null;
  selection = new SelectionModel<TemplateModel>(true, []);
  /**
   * table pagesize
   */
  pageSize = 50;
  /**
   * table initail pageindex
   */
  pageIndex = 1;
  totalCount = 0;
  showSkeleton = true;
  showTableSkeleton = true;
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  reqParam: EmailTemplateReqParam = {
    dataSet: null,
    modifiedDate: null,
    templateName: null,
    templateType: null,
    modifiedUser: null,
    createdUser: null,
  };

  constructor(
    private router: Router,
    private transientService: TransientService,
    private notifService: NotifService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.dataSource = new EmailTemplateDataSource(this.notifService, this.locale);
  }

  ngOnInit(): void {
    this.dataSource.loading$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      if (!resp) {
        this.showSkeleton = false;
        this.showTableSkeleton = false;
      }
    });
    this.dataSource.totalCount$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((total) => {
      this.totalCount = total;
    });
    this.showSkeleton = true;
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.dataSource.reset();
    this.getTableData();
  }

  getTableData() {
    this.showTableSkeleton = true;
    this.showSkeleton = true;
    console.log('from req params@@@@@@@@@@@@@@@@2',this.reqParam);
    this.dataSource.getData(this.pageIndex - 1, this.pageSize, this.reqParam);
  }

  getInitials(modifiedUsername: string) {
    if(!modifiedUsername) { return 'UN' };
    const name = modifiedUsername?.split(' ');
    if (name?.length>1) {
      const fName = name[0] ? name[0] : '';
      const lName = name[1] ? name[1] : '';
      return `${fName.charAt(0)}${lName.charAt(0)}`
    } else {
      return `${modifiedUsername.charAt(0)}${modifiedUsername.charAt(1)}`
    }
  }

  emitReqParam(event) {
    console.log('from event########333',event);
    if (event) {
      this.reqParam = event;
      this.dataSource.reset();
      this.pageIndex = 1;
      this.getTableData();
    }
  }

  /**
   * get page records
   */
  onPageChange(event: PageEvent) {
    if (event.pageIndex > event.length) {
      event.pageIndex = event.length;
    } else if (event.pageIndex < 0) {
      event.pageIndex = 1;
    }
    if (this.pageIndex !== event.pageIndex) {
      this.pageIndex = event.pageIndex;
      this.getTableData();
    }
  }

  apply(params: string) {}

  newTemplates() {
    this.router.navigate([{ outlets: { sb: `sb/settings/email-templates/0` } }], { queryParamsHandling: 'preserve' });
  }

  deleteTemplate(element) {
    this.transientService.confirm(
      {
        data: { dialogTitle: 'Confirmation', label: 'Are you sure you want delete the template?' },
        disableClose: true,
        autoFocus: false,
        width: '400px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if (response === 'yes') {
          // Delete Template Handler
          this.notifService.deleteTemplateById(element.id).subscribe((res)=>{
            this.transientService.open('Template Deleted Successfully','Okay',{duration: 2000});
            this.updatePageIndexOnDelete();
          },
          (error)=>{
            this.transientService.open('Something went wrong, please try again later','Okay',{duration: 2000})
          })
        }
      }
    );
  }

  updatePageIndexOnDelete(){
    if((this.totalCount-1) % this.pageSize == 0){
      this.pageSize = (this.totalCount-1)/this.pageSize;
      this.getTableData();
    } else{
      this.getTableData();
    }
  }

  editTemplate(template) {
    this.router.navigate([{ outlets: { sb: `sb/settings/email-templates/${template.id}` } }], { queryParamsHandling: 'preserve' });
  }

  get displayedRecordsRange(): string {
    const endRecord = this.pageIndex * this.pageSize < this.totalCount ? this.pageIndex * this.pageSize : this.totalCount;
    return this.totalCount ? `${(this.pageIndex - 1) * this.pageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }
}
