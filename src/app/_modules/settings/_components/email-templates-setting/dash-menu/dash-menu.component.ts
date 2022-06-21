import { ListPageViewDetails } from '@models/list-page/listpage';
import { take } from 'rxjs/operators';
import { interval, Observable, of } from 'rxjs';
import { MetadataModeleResponse, SchemaTableData } from '@models/schema/schemadetailstable';
import { Component, OnInit, Inject, LOCALE_ID, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CoreService } from '@services/core/core.service';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { DashMenuBaseComponent, IMenuItem, dataTypes, FieldItems, FieldItemsFlatNode } from './dash-menu-base';
import { ListService } from '@services/list/list.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

@Component({
  selector: 'pros-dash-menu',
  templateUrl: './dash-menu.component.html',
  styleUrls: ['./dash-menu.component.scss'],
})
export class DashMenuComponent extends DashMenuBaseComponent implements OnInit, OnChanges, OnDestroy {

  fieldsListObs: Observable<any> = of([]);
  @Input() searchedTermForHeaderData: string = 'none';
  @Input() menuDataType: string = '';
  @Output() selectedFlow = new EventEmitter<any>();
  @Output() closeMenu = new EventEmitter<boolean>();
  currentSelection: IMenuItem = null;
  selectedSteps: IMenuItem[] = [];
  // fetchcount = 0;

  langs = '';

  currentViewId: string = '';
  currentModuleId: string = '';

  private _transformer = (node: FieldItems, level: number) => {
    return {
      expandable: !!node.childs && node.childs.length > 0,
      name: node.value,
      level,
      ...node
    };
  };
  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.childs,
  );
  treeControl = new FlatTreeControl<FieldItemsFlatNode>(
    node => node.level,
    node => node.expandable,
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(public coreService: CoreService, @Inject(LOCALE_ID) public locale: string, public listService: ListService) {
    super(coreService, locale)
    this.langs = this.locale.split('-')[0];
  }

  ngOnInit(): void {
    super.ngOnInit()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.searchedTermForHeaderData && changes.searchedTermForHeaderData.previousValue !== changes.searchedTermForHeaderData.currentValue) {
      this.searchedTermForHeaderData = changes.searchedTermForHeaderData.currentValue;
      this.filterHeaderData();
    }
    if(changes && changes.menuDataType && changes.menuDataType.currentValue) {
      this.menuDataType = changes.menuDataType.currentValue;
      this.currentSelection = null;
      this.searchDataset();
    }
  }

  filterHeaderData() {
    this.filteredHeaderData =
      this.searchedTermForHeaderData === 'all'
        ? this.headerData
        : this.searchedTermForHeaderData === 'none'
        ? []
        : this.headerData.filter((d) => d.value.toLowerCase() === this.searchedTermForHeaderData);
  }

  searchDataset() {
    if (this.menuDataType === dataTypes.header) {
      this.selectedSteps = [];
      this.resetvariables();
      this.filterHeaderData();
    }
  }

  getModuleFields(moduleId: string) {
    console.log('getModuleFields');
    this.coreService.getMetadataFieldsByModuleId([moduleId], '').pipe(take(1)).subscribe(
      (res: MetadataModeleResponse) => {
        // this.parseMetadataModelResponse(res);
        console.log('getModuleFields: ', res);
      },
      (error: any) => {
        console.log('getModuleFields: error: ', error);
      }
    );
  }

  getFieldsByModuleId(moduleId, searchString, onLoad = false) {
    if (!moduleId) { return };
    this.isLoading = true;
    this.coreService.getMetadataFieldsByModuleId([moduleId], searchString).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      this.parseMetadataModelResponse(metadataModeleResponse, onLoad, moduleId);
    }, (err) => {
      console.error(`Error:: ${err.message}`);
      this.isLoading = false;
    });
  }

  parseMetadataModelResponse(response: MetadataModeleResponse, onLoad: boolean, moduleId) {
    const fldGroups = [];
    // for header
    const headerChilds: Metadata[] = [];
    if(response.headers) {
      Object.keys(response.headers).forEach(header=>{
        const res = response.headers[header];
        headerChilds.push({
          fieldId: res.fieldId,
          fieldDescri: res.fieldDescri,
          isGroup: false,
          childs: [],
          moduleId
        });
      });
    }
    fldGroups.push({
      fieldId: 'header_fields',
      fieldDescri: 'Header fields',
      isGroup: true,
      childs: headerChilds,
      moduleId
    });

    // for grid response transformations
    if(response && response.grids) {
      Object.keys(response.grids).forEach(grid=>{
        const childs : Metadata[] = [];
        if(response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(fld=>{
            const fldCtrl = response.gridFields[grid][fld];
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[],
                moduleId
              });
          });
        }
        fldGroups.push({
          fieldId: grid,
          fieldDescri: response.grids[grid].fieldDescri,
          isGroup: true,
          childs,
          moduleId
        });
      })
    }

    // for hierarchy response transformations
    if(response && response.hierarchyFields) {
      Object.keys(response.hierarchyFields).forEach(hkey => {
        const childs: Metadata[] = [];
        Object.keys(response.hierarchyFields[hkey]).forEach(fld=>{
          const fldCtrl = response.hierarchyFields[hkey][fld];
          childs.push({
            fieldId: fldCtrl.fieldId,
            fieldDescri: fldCtrl.fieldDescri,
            isGroup: false,
            childs:[],
            moduleId
          });
        });
        fldGroups.push({
          fieldId: `Hierarchy_${hkey}`,
          fieldDescri: `Hierarchy ${hkey}`,
          isGroup: true,
          childs,
          moduleId
        });
      });
    }
    this.fieldsListObs = of(fldGroups);
    this.isLoading = false;
    console.log('fldGroups', fldGroups);
    this.filtereddatasetfieldsItems = fldGroups.map(d=> {
      return {
          id: d.fieldId,
          value: d.fieldDescri,
          dataType: dataTypes.datasetfielditem,
          endnode: false,
          insertText: d.fieldId,
          childs: d.childs && d.childs.length>0 ? this.mapChilds(d.childs) : []
      }
    });
    this.dataSource.data = this.filtereddatasetfieldsItems;
  }
  hasChild = (_: number, node: FieldItemsFlatNode) => node.expandable;
  mapChilds(childs: any[]) {
    return childs.map(d=> {
      return {
        id: d.fieldId,
        value: d.fieldDescri,
        dataType: dataTypes.datasetfielditem,
        endnode: false,
        insertText: d.fieldId,
        childs: d.childs.length > 0 ? this.mapChilds(d.childs) : []
      };
    });
  }

  back() {
    this.selectedSteps.pop();
    this.currentSelection = this.selectedSteps[this.selectedSteps.length - 1];
    this.menuDataType = this.currentSelection ? this.currentSelection.dataType: this.DataTypes.header;
  }
  selectedMenuItem(item: IMenuItem) {
    // this.isLoading = true;
    this.selectedSteps.push(item);
    this.currentSelection = item;
    this.menuDataType = item.dataType;
    // interval(200).pipe(take(1)).subscribe(resp => {
    //   this.isLoading = false;
    // })
    this.nextDataForMenu(item);
    if(item.endnode) {
      this.currentSelection = null;
      this.selectedFlow.emit(this.selectedSteps);
    }
  }
  nextDataForMenu(item: IMenuItem) {

    if (item && item.dataType && item.dataType === dataTypes.datasetlist) {
      this.currentModuleId = item.id;
      this.findViewId(item.id);
      this.getFieldsByModuleId(item.id, '');
      const menuItems: IMenuItem[] = [
        // { id: '1', value: item.value, dataType: dataTypes.datasetinfos, endnode: true, insertText: item.value },
        { id: '1', value: 'Name', dataType: dataTypes.datasetinfos, endnode: true, insertText: item.value },
        { id: '2', value: 'Record No', dataType: dataTypes.recordno, endnode: false, insertText: 'Record No' },
        // { id: 3, value: 'Record Data', dataType: dataTypes.recorddata, endnode: false },
        { id: '4', value: 'Field', dataType: dataTypes.datasetfields, endnode: false, insertText: 'Field' },
      ];
      this.datasetlistItems = [...menuItems];
      this.filtereddatasetlistItems = [...menuItems];
    }

    if (item && item.dataType && item.dataType === dataTypes.datasetfielditem) {
      const menuItems: IMenuItem[] = [
        { id: 'None', value: item.value, dataType: dataTypes.datasetfielditemend, endnode: true, insertText: '' },
        { id: 'ID', value: 'ID', dataType: dataTypes.datasetfielditemend, endnode: true, insertText: 'ID' },
        { id: 'Name', value: 'Name', dataType: dataTypes.datasetfielditemend, endnode: true, insertText: 'Name' },
      ];
      this.datasetfieldendItems = [...menuItems];
      this.filtereddatasetfieldendItems = [...menuItems];
    }

    // if (item && item.dataType && item.dataType === dataTypes.recordnoitem) {
    //   const menuItems: IMenuItem[] = [
    //     { id: 'No', value: 'No', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'No' },
    //     { id: 'Field', value: 'Field', dataType: dataTypes.datasetfields, endnode: false, insertText: 'Field' },
    //     { id: 'LastModifiedOn', value: 'LastModifiedOn', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'LastModifiedOn' },
    //     { id: 'LastModifiedBy', value: 'LastModifiedBy', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'LastModifiedBy' },
    //     { id: 'CreatedBy', value: 'CreatedBy', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'CreatedBy' },
    //     { id: 'CreatedOn', value: 'CreatedOn', dataType: dataTypes.recordnoitemend, endnode: true, insertText: 'CreatedOn' },
    //   ];
    //   this.datasetfieldendItems = [...menuItems]
    //   this.filtereddatasetfieldendItems = [...menuItems]
    // }

    return null;
  }

  findViewId(moduleId: string) {
    const offset = 0;
    this.listService.getAllListPageViews(moduleId, offset).pipe(take(1)).subscribe(
      (views) => {
        if(views && views.userViews) {
          const view = views.userViews.find((v) => v.default);
          this.currentViewId = view && view.viewId ? view.viewId : (views && views.userViews[0] ? views.userViews[0].viewId : 'default');
        } else {
          this.currentViewId = 'default';
        }

        this.getRecords(this.currentModuleId, this.currentViewId);
      },
      (error) => {
        console.error(`Error :: ${error.message}`);
      }
    );
  }

  getRecords(moduleId: string, viewId: string) {
    const pageIndex = 1;
    this.listService.getTableData(moduleId, viewId, pageIndex, [], '').pipe(take(1)).subscribe(res => {
      const result = this.docsTransformation(res);
      this.filteredrecordnoItems = result.map(d=> {
        return {
          id: d.OBJECTNUMBER.fieldData,
          value: d.OBJECTNUMBER.fieldData,
          dataType: dataTypes.recordnoitem,
          endnode: false,
          insertText: d.OBJECTNUMBER.fieldData,
          icon: null,
        };
      });
    }, error => {
        console.error(`Error : ${error.message}`);
    });
  }

  public docsTransformation(res: any): any[] {
    const finalResonse = [];
    if (res && res.length) {

        res.forEach(doc => {
            const rowData: any = {};

            // object number
            const objnr: SchemaTableData = new SchemaTableData();
            objnr.fieldData = doc.id;
            objnr.fieldId = 'OBJECTNUMBER';
            objnr.fieldDesc = 'Object Number';
            objnr.isReviewed = doc.isReviewed ? doc.isReviewed : false;
            rowData.OBJECTNUMBER = objnr;

            const hdvs = doc.hdvs ? doc.hdvs : {};
            for (const hdfld in hdvs) {
                if (hdvs.hasOwnProperty(hdfld)) {
                    const cell: SchemaTableData = new SchemaTableData();
                    cell.fieldId = hdfld;
                    cell.fieldDesc = hdvs[hdfld].ls ? hdvs[hdfld].ls : 'Unknown';

                    // only code is visiable
                    // TODO on based on display criteria
                    let dropVal = hdvs[hdfld].vc ? hdvs[hdfld].vc.map(map => map.t).toString() : '';
                    dropVal = dropVal ?  dropVal :(hdvs[hdfld].vc ? hdvs[hdfld].vc.map(map => map.c).toString() : '');
                    cell.fieldData = dropVal ? dropVal : '';

                    rowData[hdfld] = cell;
                }

            }
            finalResonse.push(rowData);
        });

    }
    return finalResonse;
  }

  close() {
    this.currentSelection = null;
    this.closeMenu.emit(true);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  get DataTypes() {
    return dataTypes;
  }
  get selectedPathText() {
    return this.selectedSteps.map(d=> d.insertText).filter(Boolean).join('.');
  }

  scrolled() {
    this.fetchcount = this.fetchcount + 1;
    this.getModules({
      lang: this.langs || 'en',
      fetchsize: 20,
      fetchcount: this.fetchcount,
      description: this.moduelListCtrl.value === null ? '' : this.moduelListCtrl.value
    }, true)
  }
}
