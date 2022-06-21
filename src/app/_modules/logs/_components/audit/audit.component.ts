import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditExpansion, AuditLogResponse, TableHeader, WfvsDetails } from '@modules/logs/_model/logs';
import { LogsDatasourceService } from '@modules/logs/_service/logs-datasource.service';
import { LogsService } from '@services/logs.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'pros-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss']
})
export class AuditComponent implements OnInit {
  auditList: BehaviorSubject<any[]> = new BehaviorSubject([]);
  displayedColumns: BehaviorSubject<string[]> = new BehaviorSubject([]);
  tableDataSource;
  displayedObjColumns: BehaviorSubject<TableHeader[]> = new BehaviorSubject([]);
  isFetchingData = false;
  pageNo = 0;
  mid: string;
  rid: string;
  constructor(
    private activatedRouter: ActivatedRoute,
    private router: Router,
    @Inject(LOCALE_ID) public locale: string,
    private logsService: LogsService,
    private logsDatasourceService: LogsDatasourceService
  ) {}

  ngOnInit() {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';

    this.activatedRouter.queryParams.subscribe((params) => {
      if (params.mid && params.rid) {
        this.mid = params.mid;
        this.rid = params.rid;
        this.getAuditLogData();
      }
    });
  }

  onScrollEnd() {
    this.pageNo++;
    this.getAuditLogData();
  }

  getAuditLogData() {
    this.isFetchingData = true;
    this.logsService.getModuleLogsAuditData(this.mid, this.rid, this.pageNo, 30, this.locale).subscribe(
      (res: AuditLogResponse[]) => {
        this.isFetchingData = false;
        if (res.length > 0) {
          const convData = this.logsDatasourceService.transformData(res);
          this.logsDatasourceService.setAuditMasaterData(convData);
          this.auditList.next(convData);
        }
      },
      (err) => {
        this.isFetchingData = false;
      }
    );
  }

  handleOpenExpansionPanel(auditObj: AuditExpansion): void {
    console.log('auditObj', auditObj);
    auditObj.isExpanded = true;
    this.tableDataSource = auditObj.wfvs_details;
    const tableHeaderConfig = this.logsDatasourceService.getAuditTableHeader();
    this.displayedColumns.next(tableHeaderConfig.stringColumns);
    this.displayedObjColumns.next(tableHeaderConfig.objectColumns);
  }

  getInitials(name: any): string {
    if (!name) return 'C';
    const fName = name.split(' ')[0];
    const lName = name.split(' ')[1];
    if (fName && lName) {
      return fName[0] + (lName ? lName[0] : '');
    } else {
      return name[0] ? name[0] : 'C';
    }
  }

  showLogChanges(rowObj: WfvsDetails, auditObj: AuditExpansion): void {
    rowObj.staticFields_details = auditObj.staticFields_details;
    this.logsDatasourceService.setViewChangeData(rowObj);
    this.router.navigate(
      [
        {
          outlets: {
            sb: [...(this.router as any).currentUrlTree.root.children.sb.segments.map((m) => m.path)],
            sb3: 'sb3/logs/view-changes'
          }
        }
      ],
      { queryParamsHandling: 'preserve' }
    );
  }

  // showFilterValue(filter) {
  //   const filterValue = filter?.values.join(',');
  //   return filterValue;
  // }

  /**
   * Close audit sidesheet
   */
  close(): void {
    this.router.navigate([{ outlets: { sb: null } }], {
      queryParams: { mid: null, rid: null },
      queryParamsHandling: 'merge'
    });
  }

  accessProcessInstanceDiagram(log) {
    const containerId = log?.staticFields_details?.PROCESSFLOWCONTAINERID || '';
    const instanceId = log?.staticFields_details?.PROCESS_ID || '';
    this.router.navigate(
      [
        {
          outlets: {
            sb: [...(this.router as any).currentUrlTree.root.children.sb.segments.map((m) => m.path)],
            sb3: `sb3/logs/process-instance-diagram/${containerId}/${instanceId}`
          }
        }
      ],
      { queryParamsHandling: 'preserve' }
    );
    console.log(log);
  }
}
