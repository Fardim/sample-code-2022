import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ConnectionDetailsService } from '@services/connection-details.service';
import { TransientService } from 'mdo-ui-library';
import { ConnectionService } from 'src/app/_services/connection/connection.service';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { CoreService } from '@services/core/core.service';
import { NewConnectionFlowComponent } from './new-connection-flow/new-connection-flow.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { ImportSidesheetComponent, PackageType } from '@modules/connekthub';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SapwsService } from '@services/sapws/sapws.service';
import { InterfaceAPIResponse, InterfaceDetails } from './connectivity';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ConnectivityDialogComponent } from './connectivity-dialog/connectivity-dialog.component';

export const ELEMENT_DATA = [
  { header: 'Name', cell: '' },
  { header: 'Description', cell: '' },
  { header: 'Type', cell: '' },
  { header: 'Target', cell: '' },
  { header: 'Status', cell: '' },
  { header: 'No. of Interfaces', cell: 0 },
];
@Component({
  selector: 'pros-connectivity',
  templateUrl: './connectivity.component.html',
  styleUrls: ['./connectivity.component.scss'],
})
export class ConnectivityComponent implements OnInit, OnDestroy {
  connList: any;
  isLoading = false;
  isInterfaceLoading = false;

  selectedConnectionDetail = {
    connId: '',
    connName: '',
    connDesc: ''
  }

  interfaceTypeList = [
    // { label: 'All', value: 'ALL'},
    { label: 'Data upload', value: 'DATA_UPLOAD'},
    { label: 'Dropdown pull', value: 'DROPDOWN'},
    { label: 'Data extraction', value: 'DATA_PULL'},
    { label: 'Sync check', value: 'SYNCCHECK'},
  ];

  interFaceStatusList = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  connections: any[] = [];
  defaultConnections: any[] = [];
  isConnectionTestSuccess = true;
  showTestConnectionMsg = false;
  testConnectionMessage = '';

  showCommonErrorMsg = false;
  commonErrorMessage = '';

  displayedColumns: string[] = ['header', 'cell'];
  dataSource = ELEMENT_DATA;

  interfaces: any;
  // displayedInterfaceColumns: string[] = ['star', 'name', 'dataset', 'type', 'flows', 'status'];
  displayedInterfaceColumns: string[] = ['star', 'name', 'dataset', 'type', 'status'];

  INTERFACES_DATA: any[] = [];

  DEFAULT_INTERFACE_DATA: any[] = [];

  modifybyInfinteScrollLoading = false;

  /**
   * modify dataset list by search
   */
  searchModifyBySub: Subject<string> = new Subject();

  /**
   * dataset filter pageindex
   */
  datasetByPageIndex = 1;

  /**
   * All available options
   */
  allDatasetOptions: any[] = [];

  selectedDataset = [];

  selectedInterfaceType = [];
  selectedInterfaceStatus = [];
  selectedInterfaceStatusDescription: string[] = [];
  selectedDataSetDescription: string[] = [];
  selectedInterfaceTypeDescription: string[] = [];

  datasetList = [];

  /**
   * Hold the filtered options
   */
  filteredOptionsObs: Observable<any>;

  subscriptionsList: Subscription[] = [];

  searchInterfaceSub: Subject<string> = new Subject();
  searchConnectionSub: Subject<string> = new Subject();

  selectedSection = 0;

  constructor(
    private router: Router,
    private transientService: TransientService,
    private matDialog: MatDialog,
    private conService: ConnectionService,
    @Inject(LOCALE_ID) public locale: string,
    private sharedService: SharedServiceService,
    private coreService: CoreService,
    private connDetails: ConnectionDetailsService,
    private globaldialogService: GlobaldialogService,
    private sapwsService: SapwsService,
    private activatedRouter: ActivatedRoute
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.interfaces = this.INTERFACES_DATA;
  }

  ngOnInit(): void {
    this.activatedRouter.queryParams.subscribe(param => {
      if (param?.connId) {
        this.selectedConnectionDetail.connId = param.connId;
      }
    });
    this.getCPIConnections();
    this.getDatasetModules();
    this.checkForInterfaceValueChange();
    this.checkForDatasetSearchOption();
    this.checkForConnectionUpdateChanges();
    this.checkForInterfaceSearchChanges();
    this.checkForSystemSearchChanges();
    this.sharedService.getCpiConnectionsReloadTrigger().subscribe((value: any) => {
      if(value) {
        this.selectedConnectionDetail.connId = value?.connectionId ? value?.connectionId : '';
        this.getCPIConnections();
      }
    })

  }

  setSelectedSection(index: number) {
    this.selectedSection = index;
  }

  checkForSystemSearchChanges() {
    this.searchConnectionSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.connections = searchString ? this._filter(searchString) : this.defaultConnections;
      this.setInitialConnection();
    });
  }

  _filter(value: any) {
    let availableOptions = this.connections;
    if(value){
      const filterValue = value.toLowerCase();
      availableOptions = this.connections.filter((option) => option.connectionName.toString().toLowerCase().includes(filterValue));
    }
    return availableOptions;
  }

  checkForInterfaceSearchChanges() {
    this.searchInterfaceSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      if (searchString) {
        const queryString = `&fieldName=${searchString}`;
        this.getInterfaceDetails(this.selectedConnectionDetail.connId,queryString);
      } else {
        this.INTERFACES_DATA = this.DEFAULT_INTERFACE_DATA;
        this.interfaces = new MatTableDataSource<any>(this.INTERFACES_DATA);
      }
    });
  }

  checkForDatasetSearchOption() {
    this.searchModifyBySub.pipe(debounceTime(300)).subscribe((searchString) => {
      this.datasetByPageIndex = 1;
      this.searchDatasetModules(searchString);
    });
  }

  checkForConnectionUpdateChanges() {
    this.subscriptionsList.push(
      this.conService.updateConnectionDetail$.subscribe((connDetails) => {
        if (connDetails) {
          ELEMENT_DATA[1].cell = connDetails.connectionDescription;
        }
      })
    );
  }

  modifybyScrollEnd() {
    if (!this.modifybyInfinteScrollLoading) {
      this.datasetByPageIndex++;
      this.modifybyInfinteScrollLoading = true;
      this.getDatasetModules();
    } else {
      return null;
    }
  }

  getDatasetModules() {
    this.modifybyInfinteScrollLoading = true;
    this.coreService.getAllObjectType(this.locale, 20, this.datasetByPageIndex - 1).subscribe(
      (response: any[]) => {
        if (response?.length) {
          this.modifybyInfinteScrollLoading = false;
          response.map((module) => {
            this.allDatasetOptions.push({
              moduleId: module.moduleId,
              moduleName: module.moduleDescriptionRequestDTO.description,
            });
            this.filteredOptionsObs = of(this.allDatasetOptions);
            this.datasetList = [...this.allDatasetOptions];
          });
        } else {
          this.clearDatasetList();
        }
      },
      (err) => {
        console.error('error while fetching modules', err);
      }
    );
  }

  clearDatasetList() {
    this.datasetList = [];
    this.filteredOptionsObs = of([]);
  }

  // call through getModifybyUsers to get the user list by search
  searchDatasetModules(searchTerm = '') {
    if (searchTerm === '') {
      this.filteredOptionsObs = of(this.datasetList);
      return;
    }

    const body = {
      lang: this.locale,
      fetchsize: 20,
      fetchcount: this.datasetByPageIndex - 1,
      description: !!searchTerm && typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '',
    };
    this.coreService.searchAllObjectType(body).subscribe(
      (response) => {
        if (response?.length) {
          const filteredOptionList = response.map((module) => {
            this.updateAllOptions(module);
            return {
              moduleId: module.moduleId,
              moduleName: module.moduleDesc,
            };
          })
          this.filteredOptionsObs = of(filteredOptionList);
          return;
        }
        this.filteredOptionsObs = of([]);
      },
      (err) => {
        console.error('error while searching modules', err);
      }
    );
  }

  updateAllOptions(module: any) {
    const isExist = this.allDatasetOptions.find((option) => +option.moduleId === +module.moduleId);
    if (!isExist) {
      this.allDatasetOptions.push({
        moduleName: module.moduleDesc,
        moduleId: module.moduleId,
      });
    }
  }

  getDatasetLabel(datasetId) {
    return this.allDatasetOptions.find(data => +data.moduleId === datasetId)?.moduleName;
  }

  /**
   * will show value in dataset filter chip
   */
  showSelectedDatasetDescription() {
    const filterValuesList = (this.selectedDataSetDescription.length > 2) ?
    (this.selectedDataSetDescription[0] + ', ' + this.selectedDataSetDescription[1] + '+') + (this.selectedDataSetDescription.length - 2)
    : this.selectedDataSetDescription.join(', ');
    return filterValuesList;
  }

  setSelectedModifyby(user: any) {
    if (user) {
      if (!this.selectedDataset) {
        this.selectedDataset = [];
      }

      const index = this.selectedDataset.findIndex((d) => d === +user.moduleId);
      if (index >= 0) {
        this.selectedDataset.splice(index, 1);
        this.selectedDataSetDescription.splice(index, 1);
      } else {
        this.selectedDataset.push(+user.moduleId);
        this.selectedDataSetDescription.push(user.moduleName);
      }
    } else {
      this.selectedDataset = [];
      this.selectedDataSetDescription = [];
    }

    // if(isFilteredDataset) {
    //   this.filteredInterfaceList('dataset');
    // }
  }

  setSelectedInterfaceType(type: any) {
    if (type !== 'all') {
      const index = this.selectedInterfaceType.findIndex((d) => d === type.value);
      if (index >= 0) {
        this.selectedInterfaceType.splice(index, 1);
        this.selectedInterfaceTypeDescription.splice(index, 1);
      } else {
        this.selectedInterfaceType = [type.value];
        this.selectedInterfaceTypeDescription = [type.label];
      }
    } else {
      this.selectedInterfaceType = [];
      this.selectedInterfaceTypeDescription = [];
    }

    if (type === 'all') {
      this.filteredInterfaceList('all');
    }

    // this.filteredInterfaceList('interfaceType');
  }

  setSelectedInterfaceStatus(type: any) {
    if (type) {
      const index = this.selectedInterfaceStatus.findIndex((d) => d === type.value);
      if (index >= 0) {
        this.selectedInterfaceStatus.splice(index, 1);
        this.selectedInterfaceStatusDescription.splice(index, 1);
      } else {
        this.selectedInterfaceStatus = [type.value];
        this.selectedInterfaceStatusDescription = [type.label];
      }
    } else {
      this.selectedInterfaceStatus = [];
      this.selectedInterfaceStatusDescription = [];
    }

    // this.filteredInterfaceList('interfaceStatus');
  }

  filteredInterfaceList(interFaceType?) {
    let queryParams = '';
    const interfaceTypeList = this.selectedInterfaceType.toString();
    if (interfaceTypeList || interFaceType === 'all') {
      queryParams += interfaceTypeList ? `&interfaceType=${interfaceTypeList}` : '';
    }
    const selectedInterfaceStatus = this.selectedInterfaceStatus.toString();
    if (selectedInterfaceStatus) {
      queryParams += selectedInterfaceStatus && selectedInterfaceStatus.indexOf('ALL') < 0 ? `&status=${selectedInterfaceStatus}` : '';
    }

    const selectedDataset = this.selectedDataset.toString();
    if (selectedDataset) {
      queryParams += selectedDataset ? `&dataSetName=${selectedDataset}` : '';
    }

    if (queryParams) {
      this.getInterfaceDetails(this.selectedConnectionDetail.connId, queryParams);
    } else {
      this.INTERFACES_DATA = this.DEFAULT_INTERFACE_DATA;
      this.interfaces = new MatTableDataSource<any>(this.INTERFACES_DATA);
    }
  }

  // afterFilterMenuClosed() {
  //   this.filteredInterfaceList();
  // }

  afterFilterMenuClosed() {
    this.datasetByPageIndex = 1;
    this.filteredInterfaceList();
  }

  getCPIConnections() {
    this.isLoading = true;
    this.conService.getCPIConnections().subscribe(
      (response: any) => {
        this.isLoading = false;
        this.connections = response;
        this.defaultConnections = response;
        this.setInitialConnection();
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  setInitialConnection() {
    if (this.connections.length) {
      if (this.selectedConnectionDetail.connId) {
        const selectedConnection = this.connections.find(connectionDetail => connectionDetail.connectionId === this.selectedConnectionDetail.connId);
        selectedConnection ? this.getConnectionDetails(selectedConnection) : this.getConnectionDetails(this.connections[0]);
      } else {
        this.getConnectionDetails(this.connections[0]);
      }
    }
  }

  getConnectionDetails(connectionDetail) {
    if (connectionDetail) {
      ELEMENT_DATA[0].cell = connectionDetail.connectionName;
      ELEMENT_DATA[1].cell = connectionDetail.connectionDescription ? connectionDetail.connectionDescription : '';
      ELEMENT_DATA[2].cell = connectionDetail.systemType ? connectionDetail.systemType : '';
      ELEMENT_DATA[3].cell = connectionDetail.target ? connectionDetail.target : 'NOT CONFIGURED';
      ELEMENT_DATA[4].cell = connectionDetail.status ? connectionDetail.status : '';
      this.selectedConnectionDetail.connId = connectionDetail.connectionId ? connectionDetail.connectionId : '';
      this.selectedConnectionDetail.connDesc = connectionDetail.connectionDescription ? connectionDetail.connectionDescription : '';
      this.selectedConnectionDetail.connName = connectionDetail.connectionName ? connectionDetail.connectionName : '';
      this.DEFAULT_INTERFACE_DATA = [];
      this.getInterfaceDetails(this.selectedConnectionDetail.connId, '');
    }
  }

  checkForInterfaceValueChange() {
    this.conService.updateInterfaceList$.subscribe((data) => {
      this.getInterfaceDetails(data, '');
    });
  }

  getInterfaceDetails(connectionID, queryParam) {
    this.INTERFACES_DATA = [];
    this.isInterfaceLoading = true;
    this.conService.getInterfaceDetails(connectionID, queryParam)
    .pipe(
      finalize(() => this.isInterfaceLoading = false)
    )
    .subscribe((data: any) => {
      const interfacesList = data.response.content;
      ELEMENT_DATA[5].cell = data.response.content.length > 0 ? data.response.content.length : 0;
      interfacesList.forEach((intf: any) => {
        const interfaceData = this.modifyInterfaceData(intf);
        this.getDatasetName(intf.objectType,interfaceData);
        this.INTERFACES_DATA.push(interfaceData);
        if (queryParam === '' && this.DEFAULT_INTERFACE_DATA.length === 0) {
          this.DEFAULT_INTERFACE_DATA = this.INTERFACES_DATA;
        }
      });
      this.interfaces = new MatTableDataSource<any>(this.INTERFACES_DATA);
      this.conService.updateInterfaces(this.INTERFACES_DATA);
    },error => {
      this.transientService.open('Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
    });
  }

  showInterfaceType(type) {
    const filterType = this.interfaceTypeList.filter(interfaceDetail => interfaceDetail.value === type)[0].label;
    return filterType ? filterType : '';
  }

  modifyInterfaceData(intf: InterfaceAPIResponse) {
    return {
      interfaceType: intf.interfaceType,
      name: intf.scenarioDesc,
      dataset: intf.objectType,
      type: intf.interfaceType,
      flows: '',
      status: intf.active ? 'Active' : 'Inactive',
      interfaceId: intf.scenarioId,
    };
  }

  getDatasetName(moduleId,interfaceData) {
    const sub = this.coreService.searchAllObjectType({ lang: this.locale, fetchsize: 1, fetchcount: 0, description: '' }, [moduleId])
    .subscribe((data) => {
      interfaceData.datasetName = (data.length && data[0].moduleDesc) ? data[0].moduleDesc : 'Untitled';
    },error => {
      interfaceData.datasetName = 'Untitled';
    });
    this.subscriptionsList.push(sub);
  }

  getSelectedConnectionDetails(index: number) {
    this.getConnectionDetails(this.connections[index]);
    this.resetFilters();
  }

  resetFilters() {
    this.selectedInterfaceType = [];
    this.selectedInterfaceStatus = [];
    this.selectedInterfaceStatusDescription = [];
    this.selectedDataSetDescription = [];
    this.selectedInterfaceTypeDescription = [];
  }

  // New Connection flow Dialog for creating new connection
  openNewConnectionFlow() {
    this.matDialog.open(NewConnectionFlowComponent, {
      width: '800px',
      height: '600px',
      panelClass: 'new-connection-dialog',
      disableClose: true,
    });
  }

  // Routing paths for showing different types of sidesheet depending on Menus clicked//
  openTableViewSettings(path: any) {
    if (path === 'preview-map') {
      this.router.navigate([{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/preview-mapping` } }], {
        queryParamsHandling: 'preserve',
      });
    } else if (path === 'data-scope') {
      this.router.navigate([{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/data-scope` } }], {
        queryParamsHandling: 'preserve',
      });
    } else if (path === 'add-daxe') {
      this.router.navigate([{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/add-daxe` } }], {
        queryParamsHandling: 'preserve',
      });
    } else if (path === 'sync-freq') {
      this.router.navigate(
        [{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/sync-freq/${this.selectedConnectionDetail.connId}` } }],
        {
          queryParamsHandling: 'preserve',
        }
      );
    } else if (path === 'payload-test') {
      this.router.navigate([{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/payload-test` } }], {
        queryParamsHandling: 'preserve',
      });
    } else if (path === 'add-interface') {
      this.router.navigate(
        [
          {
            outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/new-interface/${this.selectedConnectionDetail.connId}` },
          },
        ],
        { queryParamsHandling: 'preserve' }
      );
    } else if (path === 'export') {
      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/settings/connectivity`,
              outer: `outer/connectivity/export-interface/${this.selectedConnectionDetail.connId}`,
            },
          },
        ],
        { queryParamsHandling: 'preserve' }
      );
    } else if (path === 'publish') {
      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/settings/connectivity`,
              outer: `outer/connectivity/publish-interface/${this.selectedConnectionDetail.connId}`,
            },
          },
        ],
        { queryParamsHandling: 'preserve' }
      );
    } else if (path === 'ImportCKH') {
      this.router.navigate(
        [
          {
            outlets: {
              sb: `sb/settings/connectivity`,
              outer: `outer/connectivity/connekthub-import/${this.selectedConnectionDetail.connId}`,
            },
          },
        ],
        { queryParamsHandling: 'preserve' }
      );
    }
  }

  editInterface(interfaceDetail, mode) {
    this.router.navigate(
      [{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/new-interface/${this.selectedConnectionDetail.connId}` } }],
      {
        queryParams: {
          t: mode,
          interfaceId: interfaceDetail.interfaceId,
        }
      }
    );
  }

  openEditConnectionSideSheet() {
    this.router.navigate(
      [
        {
          outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/edit-connection/${this.selectedConnectionDetail.connId}` },
        },
      ],
      {
        queryParamsHandling: 'preserve',
      }
    );
    this.conService.nextConnectionDetails(this.selectedConnectionDetail);
  }

  openInterfaceMapping(interfaceDetail) {
    this.router.navigate(
      [
        {
          outlets: {
            sb: `sb/settings/connectivity`,
            outer: `outer/mapping/field-mapping/${interfaceDetail.dataset}/${interfaceDetail.interfaceId}/${true}`,
          },
        },
      ],
      {
        // queryParamsHandling: 'preserve',
        queryParams: {
          descriptionMapping: true,
          controlDataMapping: true
        }
      }
    );
  }

  openDataScope(interfaceDetails) {
    this.router.navigate([{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/data-scope/${interfaceDetails.dataset}/${interfaceDetails.interfaceId}/new/sb` } }], {
      queryParams: { connId: this.selectedConnectionDetail.connId },
      queryParamsHandling: 'preserve',
    });
  }

  openPayloadTest(interfaceDetails) {
    this.router.navigate([{ outlets: { sb: `sb/settings/connectivity`, outer: `outer/connectivity/payload-test/${interfaceDetails.dataset}/${interfaceDetails.interfaceId}` } }], {
      queryParamsHandling: 'preserve',
    });
  }

  testSelectedConnection() {
    this.conService.testSelectedConnection(this.selectedConnectionDetail.connId).subscribe(
      (response: any) => {
        this.showTestConnectionMsg = true;
        if (response && response.acknowledge) {
          this.isConnectionTestSuccess = true;
          this.testConnectionMessage = 'Test connection is successful!';
        } else {
          this.isConnectionTestSuccess = false;
          this.testConnectionMessage = `Unable to reach the ${this.selectedConnectionDetail.connName}. Verify the details and try again`;
        }
      },
      (error) => {
        this.showTestConnectionMsg = true;
        this.isConnectionTestSuccess = false;
        this.testConnectionMessage = `Unable to reach the <b>${this.selectedConnectionDetail.connName}</b>. Verify the details and try again`;
      }
    );
  }

  // Confirmation Dialog for showing different messages dependeing on Menu clicked
  openConfirmation(msg: any, interfaceDetail): void {
    let dialogMsg;

    if (msg === 'conn del') {
      const interfaceName_list = this.INTERFACES_DATA.map((interfaceInfo) => interfaceInfo.name);
      if (interfaceName_list.length) {
        this.deleteConnectionDialog(interfaceName_list);
        return;
      } else {
        dialogMsg = `The connection will get deleted.`;
      }
    } else if (msg === 'interface del') {
      dialogMsg = 'The following flow will be impacted if you delete this interface. \nAre you sure you want to delete this interface?';
    } else if (msg === 'Interface deactive') {
      dialogMsg =
        'The following flow will be impacted if you deactivate this interface. \nAre you sure you want to deactivate this interface?';
    } else if (msg === 'Interface duplicate') {
      dialogMsg = 'Are you sure you wish to duplicate this Interface?';
    }

    this.transientService.confirm(
      {
        data: { dialogTitle: 'Alert', label: dialogMsg },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel',
      },
      (response) => {
        if (response === 'yes') {
          if (msg === 'interface deActive') {
            this.activateInactiveInterface(interfaceDetail);
          } else if (msg === 'interface del') {
            this.deleteInterface(interfaceDetail);
          } else if (msg === 'conn del') {
            this.deleteConnection();
          }
        }
      }
    );
  }

  deleteConnectionDialog(content_list) {
    this.matDialog.open(ConnectivityDialogComponent, {
      data: {
        headerLine: `The following list of interafces will get deleted if you delete this ${this.selectedConnectionDetail.connName}:`,
        contentList: content_list,
        confirmationLine: 'Please confirm that you want to delete this permanently',
        confirmButtonLabel: 'Confirm'
      },
      disableClose: true,
      width: '750px',
      minHeight: '250px',
      autoFocus: false,
      panelClass: 'create-master-panel'
    }).afterClosed().subscribe((dialogData: any) => {
      if (dialogData) {
        this.deleteConnection();
      }
    })
  }

  deleteConnection() {
    this.conService.deleteSystem(this.selectedConnectionDetail.connId).subscribe(
      (res: any) => {
        if (res.acknowledge) {
          this.transientService.open('Successfully deleted!', null, { duration: 1000, verticalPosition: 'bottom' });
          this.connections = this.connections.filter((data) => data.connectionId !== this.selectedConnectionDetail.connId);
          this.getConnectionDetails(this.connections[0]);
        }
      },
      (error) => {
        console.log('Error',error.error.errorMsg);
        this.showErrorBanner(error);
      }
    );
  }

  duplicateInterface(interfaceDetail: InterfaceDetails) {
    this.conService.duplicateInterface(interfaceDetail?.interfaceId).subscribe(
      (res: any) => {
        console.log('response:', res);
        if (res.acknowledge) {
          this.transientService.open('Successfully duplicated interface!', null, { duration: 1000, verticalPosition: 'bottom' });
          const duplicateInterface = res.response;
          const index = this.INTERFACES_DATA.findIndex((interfaceD) => interfaceD?.interfaceId === interfaceDetail?.interfaceId);
          const interfaceData = this.modifyInterfaceData(duplicateInterface);
          index > -1 ? this.INTERFACES_DATA.splice(index, 0, interfaceData) : this.INTERFACES_DATA.push(interfaceData);
          this.interfaces = new MatTableDataSource<any>(this.INTERFACES_DATA);
        }
      },
      (error) => {
        console.log('Duplicate interface Error:', error);
        this.showErrorBanner(error);
      }
    );
  }

  activateInactiveInterface(interfaceDetail) {
    this.conService.setActiveInactiveInterface(interfaceDetail.interfaceId).subscribe((data: any) => {
      if(data.acknowledge) {
        interfaceDetail.status = data.response.active ? 'Active' : 'Inactive';
        const bannerMessage = (interfaceDetail.status === 'Active') ? 'Interface activated successfully' : 'Interface inactivated successfully';
        this.transientService.open(bannerMessage, null, { duration: 1000, verticalPosition: 'bottom' });
      }
    },
    (error) => {
      this.showErrorBanner(error);
    });
  }

  deleteInterface(interfaceDetail) {
    this.conService.deleteConnectionInterface(interfaceDetail.interfaceId).subscribe((res: any) => {
      if (res.response) {
        this.transientService.open('Successfully deleted!', null, { duration: 1000, verticalPosition: 'bottom' });
        this.INTERFACES_DATA = this.INTERFACES_DATA.filter((data) => data.interfaceId !== interfaceDetail.interfaceId);
        this.interfaces = new MatTableDataSource<any>(this.INTERFACES_DATA);
        this.DEFAULT_INTERFACE_DATA = [...this.INTERFACES_DATA];
      }
    },
    (error) => {
      this.showErrorBanner(error);
    });
  }

  showErrorBanner(error) {
    this.showCommonErrorMsg = true;
    this.commonErrorMessage = error?.error?.errorMsg ? error.error.errorMsg : 'Something went wrong';
  }

  ngOnDestroy() {
    this.subscriptionsList.forEach((sub) => sub.unsubscribe());
  }

  publish() {
    this.openTableViewSettings('publish');
  }

  export() {
    this.openTableViewSettings('export');
  }

  ImportCKH() {
    const navigationExtras: NavigationExtras = {
      queryParams: { importType: PackageType.SAP_TRANSPORTS, id: this.selectedConnectionDetail.connId },
      queryParamsHandling: 'merge',
    };

    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/settings/connectivity`,
          outer: `outer/connectHub`,
        },
      },
    ], navigationExtras);
    // open the side sheet for the import from CKH ...
    // this.globaldialogService.openDialog(ImportSidesheetComponent, { importType: PackageType.SAP_TRANSPORTS, id: this.selectedConnectionDetail.connId });
    // this.getInterfaceDetails(this.selectedConnectionDetail.connId, '');
  }

  import(files: FileList) {
    const file = files.item(0);
    if (file.type === 'application/json') {
      this.sapwsService.importInterfaceFile(file, this.selectedConnectionDetail.connId).subscribe((res) => {
        this.getInterfaceDetails(this.selectedConnectionDetail.connId, '');
      });
    } else {
      this.transientService.open('Unsupported file format, allowed file formats are .json', 'Okay', {
        duration: 3000
      });
    }
  }
}
