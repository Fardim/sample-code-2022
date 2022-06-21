import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Router } from '@angular/router';
import { Userdetails } from '@models/userdetails';
import { TableHeader } from '@modules/logs/_model/logs';
import { CoreCrudService } from '@services/core-crud/core-crud.service';
import { UserService } from '@services/user/userservice.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LogsDatasourceService } from '../../_service/logs-datasource.service';
import { ViewChangesDetailComponent } from '../view-changes-detail/view-changes-detail.component';

interface HierarchyItemNode {
  expandable: boolean;
  label: string;
  level: number;
  id: string;
  nodeType: string;
  vcc: string;
}

@Component({
  selector: 'pros-view-changes',
  templateUrl: './view-changes.component.html',
  styleUrls: ['./view-changes.component.scss']
})
export class ViewChangesComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  treeControl = new FlatTreeControl<HierarchyItemNode>(
    (node) => node.level,
    (node) => node.expandable
  );
  treeFlattener;
  dataSource;
  displayedColumns: BehaviorSubject<string[]> = new BehaviorSubject([]);
  tableDataSource = [];
  displayedObjColumns: BehaviorSubject<TableHeader[]> = new BehaviorSubject([]);
  activeTabId: number;
  widthOfHierarchies = 276;
  arrowIcon = 'chevron-left';
  selectedNodeId: string;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) public locale: string,
    private userService: UserService,
    private logsDatasourceService: LogsDatasourceService,
    private coreCrudService: CoreCrudService
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.treeTransformer,
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.child
    );
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    const changeData = this.logsDatasourceService.getViewChangeData();
    this.handleClickHierercyLabel({ nodeType: 'header', id: 'header-data' });
    if (changeData && changeData.staticFields_details) {
      const { staticFields_details } = changeData;
      this.subscription = this.userService.getUserDetails().subscribe((response: Userdetails) => {
        this.coreCrudService
          .getSavedkeyFieldsHierarchy(
            staticFields_details.MODULEID,
            staticFields_details.CRID,
            '',
            response.plantCode,
            this.locale
          )
          .subscribe((res) => {
            this.setTreeData(changeData, res);
          });
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  treeTransformer = (node: any, level: number) => {
    return {
      expandable: !!node.child && node.child.length > 0,
      label: node.label,
      level,
      id: node.id,
      nodeType: node.nodeType,
      parentId: node.parentId,
      vcc: node.vcc
    };
  };
  /**
   * Detect if a node is currently selected
   * @param node Pass the hierarchy node
   * @returns boolean
   */
  isActive(node: HierarchyItemNode): boolean {
    return this.selectedNodeId === node.id;
  }

  hasChild = (_: number, node: HierarchyItemNode) => {
    return node.expandable;
  };

  setTreeData(changeData, data): void {
    let treeDataChild: Array<any> = data.map((obj) => {
      const child = obj.items.map((itemObj) => {
        const itemChild = itemObj.childs.map((itemChildObj) => {
          const itemChildItems = itemChildObj.items.map((itemChildItemsObj) => {
            return {
              label: itemChildItemsObj.value,
              nodeType: 'child',
              id: itemChildItemsObj.fieldId,
              parentId: itemChildObj.nodeId,
              child: []
            };
          });
          return {
            label: itemChildObj.nodeDesc,
            id: itemChildItems.length === 0 ? itemChildObj.fieldId : undefined,
            child: itemChildItems
          };
        });
        // Check if the child has data, otherwise return an empty object.
        const childData = changeData.chngfldData.hyvs[obj.nodeId];

        if (childData) {
          return {
            label: itemObj.fieldValue.vc[0].t || itemObj.fieldValue.vc[0].c,
            child: itemChild,
            parentId: obj.nodeId,
            id: itemObj.fieldValue.fId,
            nodeType: itemChild.length === 0 ? 'child' : '',
            vcc: itemObj.fieldValue.vc[0].c
          };
        }
        return {};
      });
      return {
        label: obj.nodeDesc,
        child
      };
    });

    let treeData = [
      {
        label: 'Header Data',
        nodeType: 'header',
        child: treeDataChild,
        id: 'header-data'
      }
    ];
    // Trim tree data branches.
    treeDataChild = this.trimTreeNodes(treeDataChild);
    treeData = this.trimTreeNodes(treeData, this.logsDatasourceService.transformHdvsData(changeData.chngfldData.hdvs));

    if (changeData.chngfldData && changeData.chngfldData.gvs) {
      const gridNames = this.logsDatasourceService.getHiererchyGridNames(changeData.chngfldData.gvs);
      treeData.push(...gridNames);
    }

    this.dataSource.data = treeData;
  }

  trimTreeNodes(treeDataChild, headerData?) {
    for (let i = 0; i < treeDataChild.length; i++) {
      const children = treeDataChild[i];
      for (let childIndex = 0; childIndex < children.child.length; childIndex++) {
        const child = children.child[childIndex];
        // Check to see if the child is empty, if it is, slice and remove so it dosn't show up in node.
        if (JSON.stringify(child) == '{}') {
          children.child.splice(childIndex, 1);
        }
      }

      if (children.child.length == 0 && (headerData == undefined || headerData.length == 0)) {
        treeDataChild.splice(i, 1);
      }
    }
    return treeDataChild;
  }

  /**
   * opens view change details dialog
   */
  handleClickView(rowObj): void {
    if (!rowObj.action) {
      rowObj = { ...rowObj };
      rowObj.action = 'created';
    }
    this.dialog.open(ViewChangesDetailComponent, {
      width: '500px',
      data: {
        actionType: rowObj.action.toLowerCase(),
        rowDetails: rowObj.rows
      },
      autoFocus: false
    });
  }

  /**
   * close the side sheet
   */
  close() {
    this.logsDatasourceService.clearViewChangeData();
    this.router.navigate([{ outlets: { sb3: null } }], { preserveFragment: true, queryParamsHandling: 'preserve' });
  }

  /**
   * Get the selected index from tabs...
   */
  // get selectedIndex() {
  //   return this.tabList && this.tabList.indexOf(this.tabList.find(f => f.id === this.activeTabId));
  // }

  setTableHeader(nodeType: string, gridRowDataObj?): void {
    let tableHeaderConfig = this.logsDatasourceService.getViewChangesTableHeader();
    if (nodeType === 'grid') {
      tableHeaderConfig = this.logsDatasourceService.getViewChangesGridTableHeader(gridRowDataObj);
    }
    this.displayedColumns.next(tableHeaderConfig.stringColumns);
    this.displayedObjColumns.next(tableHeaderConfig.objectColumns);
  }

  getActionStatus(action: string): string {
    if (!action) return '';

    let status = 'warning';
    switch (action.toLowerCase()) {
      case 'deleted':
        status = 'error';
        break;
      case 'created':
        status = 'success';
        break;
    }
    return status;
  }

  handleClickHierercyLabel(nodeObj) {
    const changeData = this.logsDatasourceService.getViewChangeData();

    if (changeData && changeData.chngfldData) {
      if (nodeObj.nodeType === 'header') {
        this.setTableHeader(nodeObj.nodeType);
        this.tableDataSource = this.logsDatasourceService.transformHdvsData(changeData.chngfldData.hdvs);
      } else if (nodeObj.nodeType === 'child') {
        this.setTableHeader(nodeObj.nodeType);
        this.tableDataSource = [];
        if (changeData.chngfldData.hyvs && changeData.chngfldData.hyvs[nodeObj.parentId]) {
          const transformedData = this.logsDatasourceService.transformHyvsRowData(
            nodeObj,
            changeData.chngfldData.hyvs[nodeObj.parentId].rows
          );
          this.tableDataSource = transformedData;
        }
      } else if (nodeObj.nodeType === 'grid') {
        if (changeData.chngfldData && changeData.chngfldData.gvs && changeData.chngfldData.gvs[nodeObj.id]) {
          this.setTableHeader(nodeObj.nodeType, changeData.chngfldData.gvs[nodeObj.id].rows[0]);
          this.tableDataSource = this.logsDatasourceService.transformGvsColumnWiseData(
            changeData.chngfldData.gvs[nodeObj.id].rows
          );
        }
      }

      if (nodeObj.nodeType === 'header' || nodeObj.nodeType === 'child' || nodeObj.nodeType === 'grid')
        this.selectedNodeId = nodeObj.id;
    }
  }

  toggleSideBar(): void {
    if (this.arrowIcon === 'chevron-left') {
      this.arrowIcon = 'chevron-right';
      this.widthOfHierarchies = 0;
    } else {
      this.arrowIcon = 'chevron-left';
      this.widthOfHierarchies = 276;
    }
  }
}
