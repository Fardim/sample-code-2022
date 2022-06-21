import { PageEvent } from '@angular/material/paginator';
import { EmailTemplateReqParam } from '@models/notif/notif.model';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NotifService } from '@services/notif/notif.service';
import { TransientService } from 'mdo-ui-library';
import { GlobaldialogService } from '@services/globaldialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PDFTemplateDataSource } from './pdf-template-datasource';
import { Subject } from 'rxjs';
import { Component, OnInit, Inject, LOCALE_ID, OnDestroy } from '@angular/core';
import { UserProfileService } from '@services/user/user-profile.service';
import { RoleRequestDto } from '@models/teams';

@Component({
  selector: 'pros-pdf-template-list',
  templateUrl: './pdf-template-list.component.html',
  styleUrls: ['./pdf-template-list.component.scss']
})
export class PdfTemplateListComponent implements OnInit, OnDestroy {
  formListHasData = false;
  // selected filters
  filterData = {
    searchStr: '',
    userModified: [],
    userCreated: []
  };

  reqParam: EmailTemplateReqParam = {
    dataSet: null,
    modifiedDate: null,
    templateName: null,
    templateType: null,
    modifiedUser: null,
    createdUser: null,
  };

  showSkeleton = false;
  moduleId: string;
  dataSource: PDFTemplateDataSource = undefined;

  displayedColumns: string[] = ['templateName', 'ref_templates', 'modifiedUser', 'modifiedDate'];
  staticColumns: string[] = ['select'];
  columns = formColumns;

  recordsPageIndex = 1;
  recordsPageSize = 10;
  totalCount = 0;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) public locale: string,
    private globalDialogService: GlobaldialogService,
    private transientService: TransientService,
    private userService: UserProfileService,
    private notifService: NotifService) {
      this.dataSource = new PDFTemplateDataSource(notifService);
    }

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.route.params.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
      this.moduleId = resp.moduleId;
      this.dataSource.reset();
      this.getTableData();
    });

    this.dataSource.hasDataSubject.pipe(takeUntil(this.unsubscribeAll$)).subscribe(resp => {
      if(resp) {
        this.formListHasData = true;
      }
    });

    this.dataSource.totalData.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: any) => {
      if (resp) {
        this.totalCount = resp;
      }
    });

    this.notifService.pdfTemplateChanged$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((res) => {
      if (res && res.id) {
        this.dataSource.reset();
        this.getTableData();
      }
    });
  }

  emitReqParam(event) {
    if (event) {
      this.reqParam = event;
      this.dataSource.reset();
      this.recordsPageIndex = 1;
      this.getTableData();
    }
  }

  getTableData() {
    this.dataSource.getData(this.moduleId, this.reqParam, this.recordsPageIndex - 1, this.recordsPageSize);
  }

  createNewPDFTemplate(template) {
    this.router.navigate(
      [
        {
          outlets: {
            sb: `sb/list/dataset-settings/${this.moduleId}/pdf-template-builder/${this.moduleId}`,
            outer: `outer/${this.moduleId}/pdf-templates/${template ? template.id : 0}`
          }
        }
      ],
      { queryParamsHandling: 'preserve' }
    );
  }

  getLabel(dynCol) {
    return this.columns.find((d) => d.id === dynCol).name;
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
    if (this.recordsPageIndex !== event.pageIndex) {
      this.recordsPageIndex = event.pageIndex;
      this.getTableData();
    }
  }

  get displayedRecordsRange(): string {
    const endRecord = this.recordsPageIndex * this.recordsPageSize < this.totalCount ? this.recordsPageIndex * this.recordsPageSize : this.totalCount;
    return this.totalCount ? `${(this.recordsPageIndex - 1) * this.recordsPageSize + 1} to ${endRecord} of ${this.totalCount}` : '';
  }

  shortName(userName: string, lName: string) {
    if (userName.length > 0) {
      const names = userName.split(' ');
      let res = names[0][0];
      if (names.length > 1) {
        res = res + names[1][0];
      }
      return res;
    } else {
      return '';
    }
  }

  gotoEditPage(element) {

  }

  delete(element) {

  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.complete();
  }
}

export const formColumns = [
  {
    id: 'templateName',
    name: $localize`:@@name:Name`,
  },
  {
    id: 'ref_templates',
    name: $localize`:@@ref_templates:Reference email templates`,
  },
  {
    id: 'modifiedUser',
    name: $localize`:@@last_modified_by:Modified By`,
  },
  {
    id: 'modifiedDate',
    name: $localize`:@@modified_on:Modified on`,
  },
];
