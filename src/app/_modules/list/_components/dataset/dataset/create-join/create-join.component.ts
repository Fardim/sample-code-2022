import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TabScrollData, VirtualDatasetDetails } from '@models/list-page/virtual-dataset/virtual-dataset';
import { GroupDetails, GroupJoinDetail } from '@models/schema/duplicacy';
import { ModuleInfo } from '@models/schema/schemalist';
import { SelectedModuleInfo } from '@modules/list/_components/dataset-selector/dataset-selector.component';
import { DatasetTable, DatasetTableColumn } from '@modules/list/_components/table-columns/table-columns.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'pros-create-join',
  templateUrl: './create-join.component.html',
  styleUrls: ['./create-join.component.scss']
})
export class CreateJoinComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tabsListRef') tabsListRef: ElementRef;
  @Input() virtualDatasetDetails: VirtualDatasetDetails;
  @Input() dmlType: string;

  modules: ModuleInfo[] = [];

  cachedModuleData: {
    [key: string]: SelectedModuleInfo;
  } = {};

  /** All the http or normal subscription will store in this array */
  subscriptions: Subscription[] = [];

  selectedStepData: GroupDetails;

  // form
  virtualDatasetForm: FormGroup;

  // for error banner
  formErrMsg = '';
  showErrorBanner = false;

  // counter for dmlType
  joinCounter = 1;
  transformCounter = 1;

  tabScroll: TabScrollData = new TabScrollData();

  transJoins: SelectedModuleInfo[] = [];

  tables: DatasetTable[] = [];
  columns: DatasetTableColumn[][] = [[], []];
  filterCounts: number[] = [];

  isTablesSelectionCompleteSub = new Subject<boolean>();

  constructor(
    private router: Router,
    private sharedService: SharedServiceService,
    private schemaService: SchemaService,
    private schemaDetailsService: SchemaDetailsService,
    private virtualDatasetService: VirtualDatasetService,
  ) {
    this.loadModules();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const virtualDatasetDetailsChanges = changes.virtualDatasetDetails;

    if (virtualDatasetDetailsChanges && virtualDatasetDetailsChanges.currentValue !== virtualDatasetDetailsChanges.previousValue) {
      if (this.virtualDatasetDetails?.groupDetails) {

        this.virtualDatasetDetails?.groupDetails?.forEach((groupDetails, i) => {
          groupDetails.tempId = `tmp_${Date.now()}_${i}`;
        });

        this.selectedStepData = this.virtualDatasetDetails.groupDetails[this.virtualDatasetDetails.groupDetails.length - 1];

        this.loadTransJoin();
        this.loadColumns();
      }
    }
  }

  ngOnInit() {
    this.registerUdrPub();
    this.createVirtualDatasetForm();

    if (this.dmlType) {
      this.updateDmlTypeList(this.dmlType);
    }

    this.virtualDatasetService.getselectedStepData().subscribe(res => {
      if (res) {
        if (res) {
          this.selectedStepData = res;
          console.log('selectedStepData', this.selectedStepData)
        }
      }
    });
  }

  ngAfterViewInit() {
    this.calculateTabsScroll();
  }

  loadModules(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.schemaService.getAllDataSets().toPromise().then((modules) => {
        this.modules = modules;
        resolve(true);
      });
    });
  }

  registerUdrPub() {
    const subscription = this.sharedService.getFilterTableBrData().subscribe((res) => {
      if (res?.value) {
        const { index, value } = res;

        const groupJoinDetail = this.selectedStepData?.groupJoinDetail?.[0];

        if (groupJoinDetail) {
          if (index === 0) {
            groupJoinDetail.sourceOneScopeUdr = value;
          } else if (index === 1) {
            groupJoinDetail.sourceTwoScopeUdr = value;
          }
        }
      }
      console.log('this.selectedStepData', this.selectedStepData);
    });

    this.subscriptions.push(subscription);
  }

  calculateTabsScroll() {
    if (this.tabsListRef.nativeElement) {
      const tabListEle: HTMLDivElement = this.tabsListRef.nativeElement;
      const clientRect = tabListEle.getClientRects()[0];
      this.tabScroll.containerWidth = clientRect?.width || 0;
      this.tabScroll.itemsWidth = 0;
      for (const childItem of Array.from(tabListEle.children)) {
        this.tabScroll.itemsWidth += childItem.clientWidth;
      }
      this.tabScroll.scrollWidth = (this.tabScroll.itemsWidth / tabListEle.children.length) * 1.5;
      if (this.tabScroll.containerWidth > this.tabScroll.itemsWidth) {
        this.tabScroll.disableNext = true;
      }
    }
  }

  tabScrollPrevClick() {
    if (this.tabsListRef.nativeElement) {
      const tabListEle: HTMLDivElement = this.tabsListRef.nativeElement;
      const leftValue = isNaN(parseInt(tabListEle.style.left, 10)) ? 0 : parseInt(tabListEle.style.left, 10);
      if (leftValue < 0) {
        tabListEle.style.left = `${leftValue + this.tabScroll.scrollWidth}px`;
        if (this.tabScroll.itemsWidth > this.tabScroll.containerWidth) {
          this.tabScroll.disableNext = false;
        }
      } else {
        tabListEle.style.left = `0px`;
        this.tabScroll.disablePrev = true;
      }
    }
  }

  tabScrollNextClick() {
    if (this.tabsListRef.nativeElement) {
      const tabListEle: HTMLDivElement = this.tabsListRef.nativeElement;
      const leftValue = isNaN(parseInt(tabListEle.style.left, 10)) ? 0 : parseInt(tabListEle.style.left, 10);
      if ((this.tabScroll.itemsWidth - this.tabScroll.containerWidth) > leftValue * -1) {
        tabListEle.style.left = `${leftValue - this.tabScroll.scrollWidth}px`;
        this.tabScroll.disablePrev = false;
      } else {
        tabListEle.style.left = `-${this.tabScroll.itemsWidth - this.tabScroll.containerWidth + 50}px`;
        this.tabScroll.disableNext = true;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  isTablesSelectionComplete(): boolean {
    const detail = this.selectedStepData?.groupJoinDetail?.[0];

    return !!(detail?.sourceOne && detail?.sourceTwo);
  }

  get isAnyTableSelected(): boolean {
    const detail = this.selectedStepData?.groupJoinDetail?.[0];

    return !!(detail?.sourceOne || detail?.sourceTwo);
  }

  onDatasetSelect(data: SelectedModuleInfo): void {
    let detail = this.selectedStepData?.groupJoinDetail?.[0];
    if (!detail) {
      detail = new GroupJoinDetail();
      this.selectedStepData.groupJoinDetail.push(detail);
    }

    if (data.type === 'MODULE') {
      const key = `${data.moduleId}-${data.tableName}`;
      this.cachedModuleData[key] = data;
    }

    this.mapData(detail, data);
    this.virtualDatasetService.setselectedStepData(this.selectedStepData);
  }

  // will create form on init
  createVirtualDatasetForm() {
    this.virtualDatasetForm = new FormGroup({
      vdName: new FormControl(this.virtualDatasetDetails?.vdName, [Validators.required]),
      vdDescription: new FormControl(this.virtualDatasetDetails?.vdDescription),
    });
  }

  updateDmlTypeList(type: string) {
    const groupName = this.getNewName(type, type === 'Join' ? this.joinCounter : this.transformCounter);
    const groupDetails: GroupDetails = {
      groupType: type.toUpperCase(),
      order: this.virtualDatasetDetails.groupDetails.length > 0 ? this.virtualDatasetDetails.groupDetails.length + 1 : 1,
      tenantId: 0,
      groupName,
      groupDescription: '',
      groupJoinDetail: [],
      // joinColumns: [],
      tempId: `tmp_${Date.now()}`,
    };

    this.virtualDatasetDetails.groupDetails.push(groupDetails);
    this.selectedStepData = groupDetails;
    this.loadTransJoin();

    setTimeout(() => this.calculateTabsScroll(), 1000);
  }

  getNewName(type: string, counter: number) {
    if (type === 'Join') {
      this.joinCounter++;
    } else {
      this.transformCounter++;
    }
    const newName = this.virtualDatasetDetails.groupDetails.find(item => item.groupName && item.groupName.toLowerCase().trim() === `${type.toLowerCase()} ${counter}`)
    if (newName) {
      return this.getNewName(type, counter + 1);
    }
    return `${type} ${counter}`;
  }

  editDmlType(idx: number) {
    console.log('editDmlType', this.virtualDatasetDetails.groupDetails[idx]);
  }

  deleteDmlType(idx: number) {
    this.virtualDatasetDetails.groupDetails = this.virtualDatasetDetails.groupDetails.filter((item, index) => index !== idx).map((item, index) => {
      item.order = index + 1;
      return item;
    });
    setTimeout(() => this.calculateTabsScroll(), 1000);
  }

  saveJoin() {
    this.virtualDatasetService.saveUpdateVirtualDataSet({ ...this.virtualDatasetDetails, ...this.virtualDatasetForm.value }).subscribe(data => console.log(data));
  }

  setSelectedStepData(data: GroupDetails) {
    this.selectedStepData = data;

    this.tables = null;
    this.columns = [];

    this.loadTransJoin();
    this.loadColumns();
  }

  loadTransJoin() {
    const transJoins: SelectedModuleInfo[] = [];
    const index = this.virtualDatasetDetails?.groupDetails?.findIndex((item) => item === this.selectedStepData);

    if (index >= 0) {
      for (let i = 0; i < index; i++) {
        const detail = this.virtualDatasetDetails?.groupDetails?.[i];

        if (detail) {
          transJoins.push({
            type: 'GROUP',
            groupType: detail.groupType,
            moduleId: '',
            id: detail.groupId,
            tableName: detail.groupName,
            desc: detail.groupName,
            columns: [],
            tempId: detail.tempId,
          });
        }
      }
    }

    this.transJoins = transJoins
      .sort((a, b) => a.groupType === 'JOIN' ? 1 : -1)
      .sort((a, b) => a.desc.localeCompare(b.desc));
  }

  async loadColumns() {
    const joinDetail = this.selectedStepData?.groupJoinDetail?.[0];
    let module1: SelectedModuleInfo;
    let module2: SelectedModuleInfo;

    if (joinDetail?.sourceOneType === 'MODULE' && joinDetail?.sourceOne) {
      const { sourceOne, sourceOneModule } = joinDetail;
      module1 = await this.loadColumnsByModuleId(sourceOne, sourceOneModule);
    }

    if (joinDetail?.sourceTwoType === 'MODULE' && joinDetail?.sourceTwo) {
      const { sourceTwo, sourceTwoModule } = joinDetail;
      module2 = await this.loadColumnsByModuleId(sourceTwo, sourceTwoModule);
    }

    if (module1) {
      const { table, columns } = this.mapTableColumns(module1);

      this.tables = [table];
      this.columns = [columns];
    } else if (joinDetail) {
      const item: SelectedModuleInfo = {
        type: 'GROUP',
        id: this.selectedStepData.groupId,
        moduleId: '',
        desc: joinDetail.sourceOne,
        tableName: joinDetail.sourceOne,
        columns: [],
        tempId: joinDetail.sourceOneTempId,
      };

      const { table, columns } = await this.getTransJoinsColumns(item);
      this.tables = [table];
      this.columns = [columns];
    }

    if (module2) {
      const { table, columns } = this.mapTableColumns(module2);

      this.tables = [this.tables[0], table];
      this.columns = [this.columns[0], columns];
    } else if (joinDetail) {
      const item: SelectedModuleInfo = {
        type: 'GROUP',
        id: this.selectedStepData.groupId,
        moduleId: '',
        desc: joinDetail.sourceTwo,
        tableName: joinDetail.sourceTwo,
        columns: [],
        tempId: joinDetail.sourceTwoTempId,
      };

      const { table, columns } = await this.getTransJoinsColumns(item);
      this.tables = [this.tables[0], table];
      this.columns = [this.columns[0], columns];
    }
  }

  loadColumnsByModuleId(id: string, moduleId: string): Promise<SelectedModuleInfo> {
    const key = `${moduleId}-${id}`;

    return new Promise<SelectedModuleInfo>((resolve, reject) => {

      const module = this.cachedModuleData[key];

      if (module) {
        return resolve(module);
      }

      const subscription = this.schemaDetailsService.getMetadataFields(moduleId).subscribe(res => {
        const { headers, hierarchy, grids, hierarchyFields, gridFields } = res;
        const data: SelectedModuleInfo = {
          type: 'MODULE',
          moduleId,
          tableName: '',
          desc: '',
          columns: [],
        };

        let fields;

        if (id === moduleId) {
          fields = headers;
          data.tableName = moduleId;
          data.desc = this.modules.find((m) => m.moduleId === moduleId)?.moduleDesc;
        }

        if (!fields) {
          const hierarchyReField = hierarchy.find((h) => h.tableName === id);

          if (hierarchyReField?.fieldId) {
            data.id = hierarchyReField.fieldId;
            data.tableName = hierarchyReField.tableName;
            data.desc = hierarchyReField.heirarchyText;

            fields = hierarchyFields[hierarchyReField.heirarchyId];
          } else {
            const gridRefFields: any = Object.values(grids).find((g: any) => g.tableName === id);

            if (gridRefFields?.fieldId) {
              data.id = gridRefFields.fieldId,
                data.desc = gridRefFields.fieldDescri,
                data.tableName = gridRefFields.tableName,

                fields = gridFields[gridRefFields.fieldId];
            }
          }
        }

        if (fields) {
          data.columns = Object.values(fields).map((field: any) => ({
            id: field.fieldId,
            desc: field.fieldDescri,
            dataType: field.dataType,
            maxChar: field.maxChar,
          }));
        }

        this.cachedModuleData[key] = data;

        resolve(data);
      }, err => {
        console.error(`Exception : ${err.message}`);
        reject(err);
      });

      this.subscriptions.push(subscription);
    });
  }

  async mapData(detail: GroupJoinDetail, data: SelectedModuleInfo) {
    if (!detail?.sourceOne) {
      detail.sourceOne = data.tableName;
      detail.sourceOneType = data.type;
      detail.sourceOneModule = data.moduleId;
      detail.sourceOneTempId = data.tempId;

      const { table: t, columns: c } = await this.getTransJoinsColumns(data);

      const [, t2] = this.tables || [];
      const [, c2] = this.columns || [];

      this.tables = [t];
      this.columns = [c];

      if (t2) {
        this.tables.push(t2);
        this.columns.push(c2);
      }

      return;
    }

    detail.sourceTwo = data.tableName;
    detail.sourceTwoType = data.type;
    detail.sourceTwoModule = data.moduleId;
    detail.sourceTwoTempId = data.tempId;

    const { table, columns } = await this.getTransJoinsColumns(data);

    this.tables = [this.tables[0], table];
    this.columns = [this.columns[0], columns];
  }

  async getTransJoinsColumns(data: SelectedModuleInfo): Promise<{ table: DatasetTable; columns: DatasetTableColumn[] }> {
    const groupDetail = this.virtualDatasetDetails?.groupDetails?.find((detail) => (detail.groupId && detail.groupId === data.id) || detail.tempId === data.tempId);

    if (groupDetail) {
      const { groupJoinDetail } = groupDetail;

      const joinDetail = groupJoinDetail[0];

      if (joinDetail) {
        let moduleData1: SelectedModuleInfo;
        let moduleData2: SelectedModuleInfo;

        if (joinDetail.sourceOneType === 'GROUP') {
          const item: SelectedModuleInfo = {
            type: 'GROUP',
            id: joinDetail.sourceOne,
            moduleId: '',
            desc: joinDetail.sourceOne,
            tableName: joinDetail.sourceOne,
            columns: [],
            tempId: joinDetail.sourceOneTempId,
          };

          const { table, columns } = await this.getTransJoinsColumns(item);
          moduleData1 = {
            id: table.id,
            desc: table.name,
            moduleId: '',
            tableName: table.name,
            type: 'MODULE',
            groupType: '',
            columns: columns.map(({ id, name, dataType, maxLength }) => ({
              id,
              desc: name,
              dataType,
              maxChar: maxLength,
            })),
            tempId: joinDetail.sourceOneTempId,
          };
        } else {   // joinDetail.sourceOneType === 'MODULE'
          const key1 = `${joinDetail.sourceOneModule}-${joinDetail.sourceOne}`
          moduleData1 = this.cachedModuleData[key1];

          if (!moduleData1) {
            moduleData1 = await this.loadColumnsByModuleId(joinDetail.sourceOne, joinDetail.sourceOneModule)
          }
        }

        if (joinDetail.sourceTwoType === 'GROUP') {
          const item: SelectedModuleInfo = {
            type: 'GROUP',
            id: joinDetail.sourceTwo, // TODO
            moduleId: '',
            desc: joinDetail.sourceTwo,
            tableName: joinDetail.sourceTwo,
            columns: [],
            tempId: joinDetail.sourceTwoTempId,
          };

          const { table, columns } = await this.getTransJoinsColumns(item);
          moduleData2 = {
            id: table.id,
            desc: table.name,
            moduleId: '',
            tableName: table.name,
            type: 'MODULE',
            groupType: '',
            columns: columns.map(({ id, name, dataType, maxLength }) => ({
              id,
              desc: name,
              dataType,
              maxChar: maxLength,
            })),
            tempId: joinDetail.sourceTwoTempId,
          };
        } else { // joinDetail.sourceTwoType === 'MODULE'
          const key2 = `${joinDetail.sourceTwoModule}-${joinDetail.sourceTwo}`
          moduleData2 = this.cachedModuleData[key2];

          if (!moduleData2) {
            moduleData2 = await this.loadColumnsByModuleId(joinDetail.sourceTwo, joinDetail.sourceTwoModule)
          }
        }

        const columns1 = moduleData1.columns.map((column) => ({
          ...column,
          desc: column.desc,
          // desc: `${moduleData1.tableName}.${column.desc}`,
        }));

        const columns2 = moduleData2.columns.map((column) => ({
          ...column,
          desc: column.desc,
          // desc: `${moduleData2.tableName}.${column.desc}`,
        }));

        const moduleInfo: SelectedModuleInfo = {
          ...data,
          columns: [...columns1, ...columns2],
        };

        return this.mapTableColumns(moduleInfo);
      }
    }

    return this.mapTableColumns(data);
  }

  mapTableColumns(data: SelectedModuleInfo): { table: DatasetTable; columns: DatasetTableColumn[] } {
    const table = {
      id: data.id,
      name: data.desc,
      filterType: data.selectedTableType,
      moduleId: data.moduleId,
    };

    const columns = data.columns?.map(({ id, desc, dataType, maxChar }) => ({
      id,
      name: desc,
      dataType,
      maxLength: maxChar,
      selected: true, // field selection is not supported by the api yet hence making it true
    }));

    return { table, columns };
  }

  onFilterClick({ index, table }: { index: number; table: DatasetTable }) {
    /*  const tableType = index === 0 ? 'Left' : 'Right';
      this.selectedStepData
      this.router.navigate([{ outlets: { sb: `sb/list/vd/filter/${tableType}/${this.virtualDatasetDetails.vdName}/${table.filterType}/${table.moduleId}/${table.id || ''}` } }]);*/

      // console.log(this.tables[index]);
      // console.log(this.columns[index]);

      const groupJoinDetail = this.selectedStepData?.groupJoinDetail?.[0];
      // let brId = '503397920115354573';
      let brId = 'new';

      if (index === 0 && groupJoinDetail?.sourceOneScopeUdr) {
        brId = groupJoinDetail.sourceOneScopeUdr;
      } else if (index === 1 && groupJoinDetail?.sourceTwoScopeUdr) {
        brId = groupJoinDetail.sourceTwoScopeUdr;
      }

      this.router.navigate([{
        outlets: {
          sb: `sb/list/vd/table-filter/${ brId }`,
        }
      }], {
        state: { table, columns: this.columns[index] },
        queryParams: {
          tindex: index,
        },
      });
  }

  deleteTable(index: number, table: DatasetTable) {
    const groupJoinDetail = this.selectedStepData?.groupJoinDetail?.[0]

    if (index === 0 /* && groupJoinDetail?.sourceOne === table.id */) {
      groupJoinDetail.sourceOne = '';
      groupJoinDetail.sourceOneModule = '';
      groupJoinDetail.sourceOneType = null;
      groupJoinDetail.sourceOneTempId = null;
      groupJoinDetail.sourceOneScopeUdr = '';

      const [, t] = this.tables;

      this.tables = [null, t];
    } else if (index === 1 /* && groupJoinDetail?.sourceTwo === table.id */) {
      groupJoinDetail.sourceTwo = '';
      groupJoinDetail.sourceTwoModule = '';
      groupJoinDetail.sourceTwoType = null;
      groupJoinDetail.sourceTwoTempId = null;
      groupJoinDetail.sourceTwoScopeUdr = '';

      const [t] = this.tables;

      this.tables = [t];
    }
  }
}
