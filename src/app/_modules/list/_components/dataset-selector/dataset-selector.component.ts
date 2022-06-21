import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Heirarchy, MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { ModuleInfo } from '@models/schema/schemalist';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export type ModuleState = {
  module: ModuleInfo;
  moduleItems: MetadataModeleResponse;
  expanded: boolean;
  loading: boolean;
  loaded: boolean;
  hasError: boolean;
  error?: any;
}

export type SelectedModuleItemInfo = {
  id: string;
  desc: string;
  objectType: string;
  structureId: string;
  tableType?: string;
  tableName: string;
}

export type SelectedModuleItemFieldInfo = {
  id: string;
  desc: string;
  dataType: string;
  maxChar: string | number;
}

export type SelectedModuleInfo = {
  type: 'MODULE' | 'GROUP',
  selectedTableType?: 'HEADER' | 'HIERARCHY' | 'GRID',
  groupType?: string;
  moduleId: string;
  id?: string;
  desc: string;
  tableName: string;
  columns: SelectedModuleItemFieldInfo[];
  tempId?: string;
}

@Component({
  selector: 'pros-dataset-selector',
  templateUrl: './dataset-selector.component.html',
})
export class DatasetSelectorComponent implements OnChanges, OnInit, OnDestroy {
  @Input() items: SelectedModuleInfo[] = [];

  @Output()
  selected: EventEmitter<SelectedModuleInfo> = new EventEmitter<SelectedModuleInfo>();

  /**
   * Reference to the search input component for schema
   */
  // @ViewChild('searchInput') searchInput: SearchInputComponent;


  /** All the http or normal subscription will store in this array */
  subscriptions: Subscription[] = [];

  modulesState: ModuleState[] = [];

  /**
   * filtered modules for dataset list
   */
  filteredModulesState: Observable<ModuleState[]> = of([]);

  /**
   * filtered list fo input items
   */
  filteredItems: Observable<SelectedModuleInfo[]> = of([]);

  searchSub = new Subject<string>();

  constructor(
    private schemaService: SchemaService,
    private schemaDetailsService: SchemaDetailsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const itemsChanges = changes.items;

    if (itemsChanges && itemsChanges.currentValue !== itemsChanges.previousValue) {
      this.filteredItems = of(this.items);
    }
  }

  ngOnInit(): void {
    this.loadModules();

    this.filteredItems = of(this.items);

    this.searchSub.pipe(debounceTime(700)).subscribe((searchText) => this.filterData(searchText));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadModules() {
    const subscription = this.schemaService.getAllDataSets().subscribe((res: ModuleInfo[]) => {
      this.modulesState = res.map<ModuleState>((dataset: ModuleInfo) => ({
        module: dataset,
        moduleItems: null,
        expanded: false,
        loading: false,
        loaded: false,
        hasError: false,
      })).sort((a, b) => this.sortText(a.module.moduleDesc, b.module.moduleDesc));

      this.filteredModulesState = of(this.modulesState);
    }, err => { console.error(`Exception : ${err.message}`) });

    this.subscriptions.push(subscription);
  }

  loadModuleDetails(moduleState: ModuleState) {
    const { module: { moduleId } } = moduleState;

    moduleState.loading = true;

    const subscription = this.schemaDetailsService.getMetadataFields(moduleId).subscribe(res => {
      const { headers, hierarchy, grids, hierarchyFields, gridFields } = res;
      moduleState.moduleItems = {
        headers,
        hierarchy: hierarchy.sort((a, b) => this.sortText(a.heirarchyText, b.heirarchyText)),
        grids: Object.keys(grids).map(key => grids[key]).sort((a, b) => this.sortText(a.fieldDescri, b.fieldDescri)),
        hierarchyFields,
        gridFields,
      };
      moduleState.loading = false;
      moduleState.loaded = true;
    }, err => {
      console.error(`Exception : ${err.message}`);
      moduleState.loading = false;
      moduleState.hasError = true;
      moduleState.error = err;
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Function to search modules from module dropdown
   * @param searchString: string to be searched for modules.
   */
  filterData(searchString) {
    if (!searchString) {
      this.filteredItems = of(this.items);
      this.filteredModulesState = of(this.modulesState);
      return;
    }

    this.filteredItems = of(this.items.filter(data => data.desc.toLowerCase().includes(searchString.toLowerCase())));

    this.filteredModulesState = of(this.modulesState.filter(item => {
      item.module.moduleDesc = item.module.moduleDesc || 'untitled';
      return item.module.moduleDesc.toLowerCase().includes(searchString.toLowerCase());
    }));
  }


  openMenu(moduleState: ModuleState) {
    if (!moduleState.loading && !moduleState.loaded) {
      this.loadModuleDetails(moduleState);
    }
  }

  selectHeaders(module: ModuleInfo, headers) {
    const data: SelectedModuleInfo = {
      type: 'MODULE',
      selectedTableType: 'HEADER',
      id: module.moduleId,
      moduleId: module.moduleId,
      tableName: module.moduleId,
      desc: module.moduleDesc,
      columns: Object.values(headers).map((header: any) => ({
        id: header.fieldId,
        desc: header.fieldDescri,
        dataType: header.dataType,
        maxChar: header.maxChar,
      })),
    };

    this.selected.emit(data);
  }

  selectHierarchy(module: ModuleInfo, hierarchy: Heirarchy) {
    const state = this.modulesState.find((moduleState) => moduleState.module === module);
    const hierarchyFields = state.moduleItems.hierarchyFields[hierarchy.heirarchyId];

    const data: SelectedModuleInfo = {
      type: 'MODULE',
      selectedTableType: 'HIERARCHY',
      moduleId: module.moduleId,
      id: hierarchy.fieldId,
      desc: hierarchy.heirarchyText,
      tableName: hierarchy.tableName,
      columns: Object.values(hierarchyFields).map((field: any) => ({
        id: field.fieldId,
        desc: field.fieldDescri,
        dataType: field.dataType,
        maxChar: field.maxChar,
      })),
    };

    this.selected.emit(data);
  }

  selectGrid(module: ModuleInfo, grid) {
    const state = this.modulesState.find((moduleState) => moduleState.module === module);
    const gridFields = state.moduleItems.gridFields[grid.fieldId];

    const data: SelectedModuleInfo = {
      type: 'MODULE',
      selectedTableType: 'GRID',
      moduleId: module.moduleId,
      id: grid.fieldId,
      desc: grid.fieldDescri,
      tableName: grid.tableName,
      columns: Object.values(gridFields).map((field: any) => ({
        id: field.fieldId,
        desc: field.fieldDescri,
        dataType: field.dataType,
        maxChar: field.maxChar,
      })),
    };

    this.selected.emit(data);
  }

  selectTransJoin(data: SelectedModuleInfo) {
    this.selected.emit(data);
  }

  sortText(a: string, b: string): number {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  }
}
