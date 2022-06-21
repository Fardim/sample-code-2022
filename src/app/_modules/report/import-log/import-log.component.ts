import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransientService } from 'mdo-ui-library';
import { ReportService } from '../_service/report.service';
import { ImportLogs } from '../_models/import-log';

@Component({
  selector: 'pros-import-log',
  templateUrl: './import-log.component.html',
  styleUrls: ['./import-log.component.scss']
})
export class ImportLogComponent implements OnInit {
  displayedColumns: string[] = ['warning', 'category', 'status', 'updated'];

  /**
   * warning status
   */
  status: string[] = ['OPEN', 'CLOSE'];
  warningForm: FormGroup;

  dataSource: ImportLogs[] = [];

  pageSize = 10;
  currentPage = 0;
  reportId: string;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private activatedRoute: ActivatedRoute,
    private toasterService: TransientService
  ) { }


  ngOnInit(): void {
    this.initializeForm();
    this.getWarningList();
  }

  initializeForm() {
    this.activatedRoute.params.subscribe(params => {
      this.reportId = params.reportId
    })
    this.warningForm = this.formBuilder.group({
      statusArray: this.formBuilder.array([])
    })
  }

  /**
   * While click on close should be set sb outlet to null
   */
  close() {
    this.router.navigate([{ outlets: { sb: null } }], { queryParamsHandling: 'preserve' });
  }


  /**
   * change the warning status
   * @param index index of the row in table
   */
  changeStatus(index, value) {
    console.log(index, value);
    this.reportService.updateImportLogStatus(this.dataSource[index].messageId, value).subscribe(res => {
      this.dataSource[index].status = res.status;
    }, error => {
      this.toasterService.open('Something went wrong', 'Close', { duration: 2000 });
    })
  }


  /**
   * get warning list data
   * @param isLoadMore wants to load more data
   */
  getWarningList(isLoadMore?) {
    if (isLoadMore) {
      this.currentPage = this.currentPage + 1;
    }
    const formArray = this.frmArray;
    this.reportService.getImportLogList(this.reportId, this.currentPage, this.pageSize).subscribe((res:ImportLogs[]) => {
      this.dataSource = this.dataSource.concat(...res);
      res.forEach(item => {
        formArray.push(this.formBuilder.group({
          status: item.status
        }))
      })
    }, error => {
      console.log('Error: '+error.error.errorMsg);
    })
  }

  get frmArray() {
    return this.warningForm.get('statusArray') as FormArray;
  }

}
