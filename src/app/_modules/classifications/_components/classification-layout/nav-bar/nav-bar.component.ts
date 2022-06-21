import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTree, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { debounceTime, distinctUntilChanged, takeWhile } from 'rxjs/operators';
import { RuleService } from '@services/rule/rule.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Class, ClassType } from '@modules/classifications/_models/classifications';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ClassificationLayoutService } from '@modules/classifications/_services/classification-layout.service';


interface ClassTypeNode {
  uuid: string;
  name: string;
  enableSync: boolean;
  children?: ClassTypeNode[];
}

interface LoadMoreFlatNode {
  expandable: boolean;
  uuid: string;
  name: string;
  enableSync: boolean;
  level: number;
}

@Component({
  selector: 'pros-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnChanges, OnInit, OnDestroy {
  @ViewChild('treeSelector') tree: MatTree<ClassTypeNode>;
  @ViewChild('scrollableTree') scrollableTree: CdkVirtualScrollViewport;

  page = 1;
  searchSub = new Subject<string>();
  searchString = '';
  _selectedNode: ClassTypeNode;
  subscriptionEnabled = true;
  reload = false;
  data = [];
  datasetValue = [];
  treeData: ClassTypeNode[] = [];
  treeControl = new FlatTreeControl<LoadMoreFlatNode>(node => node.level, node => node.expandable);
  treeFlattener: MatTreeFlattener<ClassTypeNode, LoadMoreFlatNode>;

  // Flat tree data source
  dataSource: MatTreeFlatDataSource<ClassTypeNode, LoadMoreFlatNode>;

  @Input() selectedDataSet = '';
  @Input() loader = true;
  @Output() selectedNode: EventEmitter<any> = new EventEmitter(null);

  onScroll(event) {
    if (event && !this.reload) {
      const viewPortHeight = event.target.offsetHeight; // height of the complete viewport
      const scrollFromTop = event.target.scrollTop;     // height till user has scrolled
      const sideSheetHeight = event.target.scrollHeight; // complete scrollable height of the side sheet document

      const limit = sideSheetHeight - scrollFromTop;
      if (limit === viewPortHeight) {
        this.page++;
        this.loadData();
      }
    }
  }

  constructor(
    private sharedService: SharedServiceService,
    private ruleService: RuleService,
    private router: Router,
    private classificationLayoutService:ClassificationLayoutService,
  ) {
    this.treeFlattener = new MatTreeFlattener(this._transformer, node => node.level, node => node.expandable, node => node.children);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  private _transformer = (node: ClassTypeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      uuid: node.uuid,
      name: node.name,
      enableSync: node.enableSync,
      level,
    };
  }

  hasChild = (_: number, node: LoadMoreFlatNode) => node.expandable;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.selectedDataSet?.previousValue !== changes?.selectedDataSet?.currentValue) {
      this.datasetValue = [];
      this.dataSource.data = [];
      if (changes?.selectedDataSet?.currentValue) {
        this.datasetValue.push(changes?.selectedDataSet?.currentValue);
      }
      this.filterData();
    }
  }

  ngOnInit(): void {
    this.searchSub.pipe(debounceTime(700)).subscribe((searchText) => {
      this.searchString = searchText;
      this.filterData();
      this.reload = false;
    });

    this.sharedService.ofType('@@INIT').pipe(takeWhile(() => this.subscriptionEnabled)).subscribe(() => {
      console.log('@@INIT');
    });

    this.sharedService.ofType<ClassType>('CLASS_TYPE/CREATED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        console.log('CLASS_TYPE/CREATED', data);
        this.filterData(data.payload.uuid);
      });

    this.sharedService.ofType<ClassType>('CLASS_TYPE/UPDATED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        console.log('CLASS_TYPE/UPDATED', data);
        this.filterData(data.payload.uuid);
      });

    this.sharedService.ofType<Class>('CLASS/CREATED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        this.filterData(data.payload?.uuid);
      });

    this.sharedService.ofType<Class>('CLASS/UPDATED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        this.filterData(data.payload.uuid);
      });

    this.sharedService.ofType<ClassType>('CLASSTYPE/DELETED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        console.log('CLASSTYPE/DELETED', data);
        this.filterData();
      });

    this.sharedService.ofType<ClassType>('ALL_CLASSES/DELETED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        this.filterData();
      });

    this.sharedService.ofType<Class>('CLASS/DELETED').pipe(takeWhile(() => this.subscriptionEnabled))
      .subscribe((data) => {
        this.filterData();
      });
  }

  maintainExpandState() {
    let parent: LoadMoreFlatNode;
    let shouldExpand = false;

    for (const node of this.treeControl.dataNodes) {
      if (node.expandable) {
        parent = node;
      }

      if (node.uuid === this._selectedNode.uuid) {
        shouldExpand = node.expandable || node.level > parent?.level;
      }

      if (parent && shouldExpand) {
        this.treeControl.expand(parent);

        break;
      }
    }
  }

  findNode(children: ClassTypeNode[], id: string): ClassTypeNode | null {
    let data: ClassTypeNode | null;
    for (const item of children || []) {
      data = this.findNodeChild(item, id);

      if (data) {
        break;
      }
    }

    return data;
  }

  findNodeChild(node: ClassTypeNode, id: string): ClassTypeNode | null {
    if (node.uuid === id) {
      return node;
    }

    let data: ClassTypeNode | null;
    for (const item of node.children || []) {
      data = this.findNodeChild(item, id);

      if (data) {
        break;
      }
    }

    return data;
  }

  loadData(selectedId: string = '', autoSelect = true) {
    // this.reload = reload;
    this.ruleService.getAllClassTypes(this.page, 100, this.searchString, this.datasetValue).pipe(debounceTime(1000), distinctUntilChanged(), takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      if (data?.response?.length) {
        const nodes: ClassTypeNode[] = [];
        data.response?.forEach((item: ClassType) => {
          this.data.push(item);
          const createdNode: ClassTypeNode = {
            uuid: item.uuid,
            name: item.className,
            enableSync: item.enableSync,
            children: [],
          }
          nodes.push(createdNode);
          this.bindChildren(createdNode, item.classes);
        });

        this.treeData = nodes;
        this.dataSource.data = this.treeData;

        if (selectedId) {
          const selectedNode = this.findNode(this.treeData, selectedId);
          this._selectedNode = selectedNode || this.treeData[0];;
        } else if (autoSelect) {
          this._selectedNode = this.treeData[0];
        }

        if (this._selectedNode) {
          const index = this.treeControl.dataNodes.findIndex(n => n.uuid === this._selectedNode.uuid);

          if (index >= 0) {
            const node = this.treeControl.dataNodes[index];

            this.onNodeSelect(node);
            this.maintainExpandState();


            this.scrollableTree?.scrollToIndex(index);
          }
        } else {
          this.onNodeSelect(null);
        }
      }

      this.loader = false;
      this.classificationLayoutService.skeletonLoader.next(this.loader);
    });
  }

  bindChildren(item: ClassTypeNode, classes: Class[]) {
    classes?.forEach((c) => {
      const node: ClassTypeNode = {
        uuid: c.uuid,
        name: c.description,
        enableSync: false, // TODO pass class type enableSync?
        children: [],
      }
      item.children.push(node);
      this.bindChildren(node, c.classes || []);
    });
  }

  filterData(selectedId: string = '') {
    this.data = [];
    this.treeData = [];
    this.page = 1;
    this.loadData(selectedId);
  }

  onNodeSelect(node, actionType = null) {
    this._selectedNode = node;
    const item = { ...node, actionType };
    this.selectedNode.emit(item);
  }

  loadChildren(node) {
    // TODO: for lazy loading children
  }

  ngOnDestroy(): void {
    this.subscriptionEnabled = false;
  }

  getClassType(node) {
    let classType = this.data.find(x => x.uuid === node.uuid);
    if (!classType) {
      this.data?.map(x => {
        if (x?.classes?.some(c => c.uuid === node.uuid)) {
          classType = x;
        }
      })
    }
    return classType;
  }

  openDialog(node, mode = null) {
    const classType = this.getClassType(node);
    const params = node.level ? { parent: node.uuid } : {};
    this.router.navigate([{
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/classes/${mode === 'EDIT' ? node.uuid : 'new'}`
      },
    }], { state: { classType }, queryParams: params });
  }
}
