import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImportSidesheetComponent, PackageType } from '@modules/connekthub';
import { ImportValidateComponent } from '@modules/connekthub/_components/import-validate/import-validate.component';
import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-dataset-source',
  templateUrl: './dataset-source.component.html',
  styleUrls: ['./dataset-source.component.scss'],
})
export class DatasetSourceComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedDatasetId = 0;
  datasetTypes: { key: string; value: string }[] = [
    {
      key: 'Standard',
      value: 'STD',
    },
    {
      key: 'Virtual',
      value: 'VT',
    },
    {
      key: 'System',
      value: 'SYS',
    },
  ];
  selectedDatasetType = null;

  /**
   * File attach input type ...
   */
  @ViewChild('file_attach') fileAttach: ElementRef<HTMLInputElement>;


  /**
   * List of subscriptions ...
   */
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private matDialog: MatDialog,
    private connectorService: ConnectorService,
    private coreSchema: CoreService,
    private globaldialogService: GlobaldialogService
    ) {}

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }

  ngAfterViewInit(): void {

    // hooks for the file change trace
    this.fileAttach?.nativeElement.addEventListener('change', (ele)=>{
      console.log(ele);
      this.createAModule((ele?.target as any)?.files[0]);
    });
  }

  ngOnInit(): void {}

  /**
   * Close dialog ref
   * @param toRefreshApis to get apis once modal is closed
   */
  onCancelClick(event: { toRefreshApis: boolean; moduleId?: number }): void {
    this.connectorService.onCancelClick(event);
  }

  openManualForm(datasetType) {
    this.selectedDatasetType = datasetType;
    localStorage.setItem('selectedDatasetType', datasetType);
    this.connectorService.getNextComponent('manually');
  }

  openConnectors() {
    this.connectorService.getNextComponent('connectors');
  }

  /**
   * Open the file picker to upload a file ...
   */
  uploadAFile() {
    this.fileAttach?.nativeElement.click();
  }

  /**
   * Create dataset from file ...
   * @param file the file which is uploaded ....
   */
  createAModule(file: File) {
    if(!file) {
      throw new Error(`Error while uploading a file ... ${file} can't be empty or null !!!`);
    }
    const dialogRef1 = this.matDialog.open(ImportValidateComponent, {
      data: { file, importType:  PackageType.DATASET, fromLocal: true},
      width: '600px',
      minHeight: '250px',
      disableClose: false,
    });
    // Reload once import is successfull
    dialogRef1.afterClosed().subscribe(result => {
      console.log(`After message done !! ${result}`);
    });
  }

  importFrmCKH() {
    // open the side sheet for the import from CKH ...
    this.globaldialogService.openDialog(ImportSidesheetComponent, {importType: PackageType.DATASET});

    this.globaldialogService.dialogCloseEmitter.pipe(distinctUntilChanged()).subscribe((response) => {
      console.log(response);
    });
  }
}
