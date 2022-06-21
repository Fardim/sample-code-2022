import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, take, takeUntil, tap } from 'rxjs/operators';
import { SapwsService, TableMappingData } from '@services/sapws/sapws.service';
import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SapRequestDTO } from '@models/connector/connector.model';
import { Observable, Subject } from 'rxjs';
import { GlobaldialogService } from '@services/globaldialog.service';
import { ConnekthubLoginComponent } from '@modules/connekthub/_components/connekthub-login/connekthub-login.component';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';
import { Package, PackageType } from '@modules/connekthub';

@Component({
  selector: 'pros-cpi-package-selection',
  templateUrl: './cpi-package-selection.component.html',
  styleUrls: ['./cpi-package-selection.component.scss'],
})
export class CpiPackageSelectionComponent implements OnInit, OnDestroy {
  /*** number of chips to show as selected*/
  limit = 5;
  packageLoader: boolean;
  selectedColumns: string[] = [];

  serviceStructureOptions = [
    { label: 'SAP table', value: 'SAP_TABLE' },
    { label: 'Standard package', value: 'STANDARD_PACKAGE' },
  ];

  generateStructureOptions = [
    { label: 'Service URL', value: 'SERVICE_URL' },
    { label: 'File Upload', value: 'FILE_UPLOAD' },
  ];

  standardPackageOptions: Package[] = [];

  sapTableOptions: string[] = [];
  filteredSapTableOptions: string[] = [];

  // pageNo = 1;
  // pageSize = 10;
  // url = '';
  // username = '';
  // password = '';
  searchTerm = '';

  packageOptionControl: FormControl = new FormControl();

  sapTableOptionCtrl = new FormControl();

  stdpkgOptionCtrl = new FormControl();

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  tableMapping: TableMappingData;

  sapTableLoader: boolean;

  selectedSTDPkg: Package = null;

  selectedSAPTable = '';

  syncData:boolean;

  constructor(
    private connectorService: ConnectorService,
    private sapwsService: SapwsService,
    private globalDialogService: GlobaldialogService,
    private connektHubService: ConnekthubService) {}

  ngOnInit(): void {
    this.sapTableOptionCtrl.valueChanges
      .pipe(
        tap((value) => { if(value) { this.sapTableLoader = true; }}),
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this.unsubscribeAll$))
      .subscribe((searchString) => {
        this.searchTerm = searchString || '';
        this.sapwsService.updateTablemappingData({ tableName: this.searchTerm } as TableMappingData);
        this.filteredSapTableOptions = [];
        this.findTableByName(searchString);
      });

      if(this.sapwsService.tableMapping) {
        const tableMapping = {...this.sapwsService.tableMapping};
        this.tableMapping = tableMapping;
        this.syncData = tableMapping.syncData;
        this.sapTableOptionCtrl.setValue(this.tableMapping.tableName);
        this.selectedSAPTable = this.tableMapping.tableName;
        this.selectedSTDPkg = this.tableMapping.standardPkg;
        this.packageOptionControl.setValue(this.tableMapping.selectedPackageOption ? this.tableMapping.selectedPackageOption : 'SAP_TABLE');
        if(!this.tableMapping.selectedPackageOption) {
          this.sapwsService.updateTablemappingData({ selectedPackageOption: 'SAP_TABLE' } as TableMappingData);
        }
          if(!this.sapTableOptions.length) {
            this.fetchSAPTables(tableMapping)
              .subscribe((resp: string[]) => {
              this.sapTableOptions = resp;
              if(!this.searchTerm) {
                this.filteredSapTableOptions = resp;
              }
            });
          }
      }

    this.sapwsService.updateTablemappingData({ tableName: '' } as TableMappingData);
    this.initializePackageSearch();
  }

  /**
   * Initialize the package search control
   * call the api on text cange with some delay
   */
  initializePackageSearch() {
    const existingValue = this.sapwsService.tableMapping?.standardPkg;
    console.log('existingValue', existingValue);

    this.stdpkgOptionCtrl.valueChanges
    .pipe(
      takeUntil(this.unsubscribeAll$),
      startWith(existingValue?.name  || ''),
      debounceTime(1000),
    )
    .subscribe((value: string) => {
      if(!this.packageLoader) {
        this.getPackages(value);
      }
    });
  }

  findTableByName(tableName: string) {
    const data: TableMappingData = this.tableMapping;
    if(data) {
      data.tableName = tableName;
      data.pageNumber = 1;
      this.fetchSAPTables(data).subscribe((resp: string[]) => {
        this.sapTableOptions = Array.from(new Set([...resp, ...this.sapTableOptions]));
        this.filteredSapTableOptions = this.sapTableOptions.filter((option) => {
          tableName = tableName?.replace(/%/g, '');
          return option.toLowerCase().includes(tableName.toLowerCase());
        });
      });
    }
  }

  // getStandardPackages() {
  //   this.sapwsService
  //     .getStandardPackages()
  //     .pipe(take(1))
  //     .subscribe((resp) => {
  //       this.standardPackageOptions = resp.response;
  //     });
  // }

  fetchSAPTables(data: TableMappingData = this.tableMapping) {
    const dto: SapRequestDTO = {
      pageNo: data.pageNumber,
      pageSize: data.pageSize,
      tableName: data.tableName,
      password: data.password,
      username: data.username,
      url: data.url
    };

    return new Observable((observer) => {
      if(!data || !data.password || !data.username || !data.url) {
        this.sapTableLoader = false;
        return observer.next([]);
      }
      this.sapTableLoader = true;
      return this.sapwsService
      .fetchSAPTables(dto)
      .subscribe((resp: string[]) => {
        this.sapTableLoader = false;
        observer.next(resp);
      }, err => {
        this.sapTableLoader = false;
        observer.next([]);
      });
    });
  }

  standardPkgSelectionChng(event) {
    this.sapwsService.updateTablemappingData({ standardPkg: event.option.value } as TableMappingData);
    this.selectedSTDPkg = event.option.value;
  }

  displayFn(stdPkg: Package) {
    return stdPkg?.name ? stdPkg.name : ''
  }

  saptableSelectionChng(event) {
    this.sapwsService.updateTablemappingData({ tableName: event.option.value } as TableMappingData);
    this.selectedSAPTable = event.option.value;
  }

  selectedOption(event) {
    if(event === 'STANDARD_PACKAGE') {
      if(this.connektHubService.connektHubTokenExists()) {
        this.getPackages();
      } else {
        const dialogref = this.globalDialogService.openCustomDialog(ConnekthubLoginComponent,
          {
            showCloseButton: true,
          }, {
          width: '545px',
          height: '380px',
          panelClass: 'medium-dialog-container',
          hasBackdrop: true,
        });

        dialogref.afterClosed().subscribe((resp: any) => {
          if(resp) {
           this.getPackages();
          }
        });
      }

    }

    this.sapwsService.updateTablemappingData({ selectedPackageOption: event } as TableMappingData);
  }

  /**
   * method to get the available packages
   * @param searchTerm pass the search term to filter the packages
   */
  getPackages(searchTerm: string | any = '') {
    if(typeof searchTerm === 'object') {
      searchTerm = searchTerm?.name || '';
    }

    searchTerm = searchTerm?.toLowerCase() || '';
    this.packageLoader = true;
    this.connektHubService.getPackages(PackageType.SAP_TRANSPORTS, searchTerm).subscribe((resp: Package[]) => {
      this.packageLoader = false;
      if(resp?.length) {
        this.standardPackageOptions = resp;
      }
    }, err => {
      console.error(err);
      this.packageLoader = false;
    });
  }

  /**
   * to check if limit is extended
   */
  hasLimit(isParentDataset): boolean {
    return this.selectedColumns.length > this.limit;
  }

  next() {
    if(this.packageOptionControl.value === 'STANDARD_PACKAGE') {
      this.connectorService.getNextComponent('sap cpi standard package');
    } else {
      this.connectorService.getNextComponent('table mapping');
    }
  }

  back() {
    this.connectorService.backClicked.next(true);
  }

  onCancelClick() {
    this.connectorService.onCancelClick({ toRefreshApis: false, moduleId: null });
  }

  setSyncValue(value: boolean) {
    this.sapwsService.updateTablemappingData({ syncData: value } as TableMappingData);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}

