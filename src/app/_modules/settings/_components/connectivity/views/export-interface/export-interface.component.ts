import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageType, PublishPackage, PublishToConnekthubComponent } from '@modules/connekthub';
import { ConnectionService } from '@services/connection/connection.service';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SapwsService } from '@services/sapws/sapws.service';
import { TransientService } from 'mdo-ui-library';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-export-interface',
  templateUrl: './export-interface.component.html',
  styleUrls: ['./export-interface.component.scss']
})
export class ExportInterfaceComponent implements OnInit, OnDestroy {
  currentConnectionId: string;
  interfaces: MatTableDataSource<any>;
  displayedInterfaceColumns: string[] = ['select', 'name', 'dataset', 'type', 'flows', 'status'];
  selection = new SelectionModel<any>(true, []);
  exportChkSuccessful: boolean;

  subscriptions: Subscription[] = [];
  isExport: boolean;

  constructor(
    private router: Router,
    private coreService: CoreService,
    private connectionService: ConnectionService,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    private globalDialogService: GlobaldialogService,
    private sapwsService: SapwsService,
    private transientService: TransientService,
  ) { }

  ngOnInit(): void {
    if (this.router.url.includes('connectivity/export-interface')) {
      this.isExport = true;
    } else {
      this.isExport = false;
    }

    const routeSub = this.activatedRoute.params.subscribe(params => {
      this.currentConnectionId = params.connectionId;
    });
    this.subscriptions.push(routeSub);

    const interfacesSub = this.connectionService.interfaces$.subscribe(interfaces => {
      if (interfaces) {
        this.interfaces = new MatTableDataSource<any>(interfaces);
      }
    });
    this.subscriptions.push(interfacesSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }

  /**
   * Export interface by showing confirm dialog
   */
  export() {
    const interfaces = this.selection.selected;
    console.log('interfaces', interfaces);
    if (interfaces && interfaces.length > 0) {
      if (this.isExport) {
        this.transientService.confirm({
          data: { dialogTitle: 'Confirmation', confirmationText: 'Export', label: `You will be exporting ${interfaces.length} out of ${this.interfaces.data.length} interfaces to your system as a package. Please select from the below options to proceed with the process.` },
          disableClose: true,
          autoFocus: false,
          width: '600px',
          panelClass: 'create-master-panel',
        }, (response) => {
          if (response && response === 'yes') {
            this.sapwsService.exportInterfaceDetails(interfaces.map(i => i.interfaceId)).subscribe(async blob => {
              const binaryData = [];
              binaryData.push(JSON.stringify(blob));
              if ((window as any).showSaveFilePicker) {
                const handle = await (window as any).showSaveFilePicker({
                  suggestedName: interfaces[0].name + '.json',
                  types: [{
                    description: 'Text documents',
                    accept: {
                      'application/json': ['.json'],
                    },
                  }],
                });
                const writable = await handle.createWritable();
                await writable.write(new Blob(binaryData));
                writable.close();
              } else {
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: '.json' }));
                downloadLink.setAttribute('download', interfaces[0].name + '.json');
                document.body.appendChild(downloadLink);
                downloadLink.click();
              }
            });
          }
        });
        // this.globalDialogService.confirm({ label: `You will be exporting ${interfaces.length} out of ${this.interfaces.data.length} interfaces to your system as a package. Please select from the below options to proceed with the process.` }, (response) => {
        // }, '600px');
      } else {
        const data: PublishPackage = {
          id: this.currentConnectionId,
          type: PackageType.SAP_TRANSPORTS,
          name: interfaces[0].name,
          brief: '',
          scenarioIds: interfaces.map(i => i.interfaceId)
        }

        this.matDialog.open(PublishToConnekthubComponent, {
          data,
          disableClose: true,
          width: '600px',
          minHeight: '250px',
          autoFocus: false,
          minWidth: '765px',
          panelClass: 'create-master-panel'
        }).afterClosed().subscribe((dialogData: any) => {
          if (dialogData.successfully) {
            this.exportChkSuccessful = true;
          }
        })
      }
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.interfaces.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.interfaces.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  search(search: string) {

  }
}