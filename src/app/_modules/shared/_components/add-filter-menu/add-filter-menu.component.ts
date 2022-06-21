import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges, EventEmitter, Output, ViewChild } from '@angular/core';
import { throwError, BehaviorSubject, Subscription } from 'rxjs';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MetadataModeleResponse, MetadataModel, FilterCriteria } from '@models/schema/schemadetailstable';
import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { AddFilterOutput } from '@models/schema/schema';
import { SchemaService } from '@services/home/schema.service';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CoreService } from '@services/core/core.service';

@Component({
  selector: 'pros-add-filter-menu',
  templateUrl: './add-filter-menu.component.html',
  styleUrls: ['./add-filter-menu.component.scss']
})
export class AddFilterMenuComponent implements OnInit, OnDestroy, OnChanges {


  @Input()
  moduleId: string;

  @Input()
  reInilize: boolean;

  @Input()
  fieldMetadata: any[];

  @Input()
  isSearchEnable = true;

  /**
   * To get initally selected values..
   */
  @Input()
  alreadySelectedValues: FilterCriteria[];

  selectedValues: DropDownValue[] = [];

  /**
   * To hold dropdown values of clicked field id
   */
  dropValues: DropDownValue[] = [];

  /**
   * currently selected fields
   */
  currentFields: BehaviorSubject<any[]> = new BehaviorSubject([]);
  /**
   * Hold all metada control for header , hierarchy and grid fields ..
   */
  metadata: BehaviorSubject<MetadataModeleResponse> = new BehaviorSubject<MetadataModeleResponse>(null);

  /**
   * Metadata drop value
   */
  metadaDrop: MetadataModel[] = [];

  /**
   * Metadata drop value
   */
  searchDrop: MetadataModel[] = [];

  /**
   * Hold info about active element ..
   */
  activateElement: MetadataModel = null;

  /**
   * After applied filter value should emit with
   * fld contrl and selected values ..
   */
  @Output()
  evtReadyForApply: EventEmitter<AddFilterOutput> = new EventEmitter<AddFilterOutput>(null);

  /**
   * To hold selected dropdown values code..
   */
  dropValuesCode: string[];

  /**
   * To hold all the subscriptions.
   */
  subscriptions: Subscription[] = [];

  /**
   * Tree child
   */
  @ViewChild('tree') tree;

  /**
   * tree control
   */
  treeControl = new FlatTreeControl<{ name: string, level: number, expandable: boolean, id: string, parent: string }>(node => node.level, node => node.expandable);

  /**
   * treeFlattener
   */
  treeFlattener = null;

  /**
   * data source
   */
  dataSource = null;

  /**
   * has child
   */
  hasChild = null;

  /**
   * Array to store all Grid And Hirarchy records
   */
  allGridAndHirarchyData = [];

  /**
   * transformer = return tree object.
   * @param node node
   * @param level level
   */
  public _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      id: node.id,
      parent: node.parent,
      allData: node.allData
    };
  }

  /**
   * Constructor of class..
   */
  constructor(
    private schemaDetailService: SchemaDetailsService,
    private schemaService: SchemaService,
    private coreService: CoreService
  ) { }

  /**
   * Angular hook for detecting Input value changes
   * @param changes Input values to watch for changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.moduleId && changes.moduleId.previousValue !== changes.moduleId.currentValue) {
      this.moduleId = changes.moduleId.currentValue;
      if (this.moduleId && this.dataSource) {
        this.getFldMetadata();
      } else {
        this.initMetadata(this.currentFields.getValue());
      }
    }

    if (changes && changes.reInilize && changes.reInilize.previousValue !== changes.reInilize.currentValue) {
      if (this.moduleId) {
        this.metadata.next(this.metadata.getValue());
      }
      this.initMetadata(this.currentFields.getValue());
    }

    if (changes && changes.fieldMetadata && changes.fieldMetadata.previousValue !== changes.fieldMetadata.currentValue) {
      if (changes.fieldMetadata.currentValue) {
        this.currentFields.next(changes.fieldMetadata.currentValue);
        this.initMetadata(changes.fieldMetadata.currentValue);
      }
    }
  }

  /**
   * Clear the active element and selected values and Initialize
   * metadata using fields from the excel row
   * @param fields Excel first row values(Array)
   */
  initMetadata(fields: any[]) {
    this.activateElement = null;
    if (!this.moduleId) {
      this.selectedValues = [];
      if (fields && fields.length > 0) {
        this.metadaDrop = fields;
        this.searchDrop = fields;
      }
    }
  }

  /**
   * Angular hook
   * It will called once before destroying component lifecycle.
   */
  ngOnDestroy(): void {
    this.metadata.complete();
    this.metadata.unsubscribe();

    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    })
  }

  /**
   * Angular hook
   */
  ngOnInit(): void {
    this.metadata.subscribe(fld => {
      if (fld) {
        this.tarnsformMetada(fld);
      }
    });

    this.treeControl = new FlatTreeControl<{ name: string, level: number, expandable: boolean, id: string, parent: string }>(
      node => node.level, node => node.expandable);

    this.treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.hasChild  =(_: number, node: { name: string, level: number, expandable: boolean, id: string, parent: string }) => node.expandable;
    if(this.moduleId) {
      this.getFldMetadata();
    }
  }

  /**
   * Get all fld metada based on module of schema
   */
  getFldMetadata() {
    if (this.moduleId === undefined || this.moduleId.trim() === '') {
      throwError('Module id cant be null or empty');
    }
    const sub = this.coreService.getMetadataFieldsByModuleId([this.moduleId], '').subscribe(response => {
      this.metadata.next(response);
    }, error => {
      console.error(`Error : ${error.message}`);
    });
    this.subscriptions.push(sub);
  }

  /**
   * return grid fields by grid key
   * @param metadataModeleResponse metaData Object
   * @param gridKey grid Key to identify
   * @param parentDesc parent desc name
   */
  getGridFieldsByGridKey(metadataModeleResponse: MetadataModeleResponse, gridKey: string, parentDesc: string) {
    const dataToPush = [];
    for (const key in metadataModeleResponse.gridFields[gridKey]) {
      if (metadataModeleResponse.gridFields[gridKey].hasOwnProperty(key)) {
        const field = metadataModeleResponse.gridFields[gridKey];
        const picklist = field[key]?.picklist || field[key]?.pickList;
        if (picklist === '1' || picklist === '30' || picklist === '37') {
          dataToPush.push({ name: field[key].fieldDescri, id: field[key].fieldId, parent: parentDesc, children: [], allData: field[key] });
        }
      }
    }
    return dataToPush;
  }

  /**
   * return Hierarchy field by key
   * @param metadataModeleResponse meta data object
   * @param hierarchyKey hirechy key
   * @param parentDesc parent dsc name
   * @param heirarchyId heirarchy id
   */
  getHierarchyFieldsByHierarchyKey(metadataModeleResponse: MetadataModeleResponse, hierarchyKey: string, parentDesc: string, heirarchyId: string) {
    const dataToPush = [];
    for (const key in metadataModeleResponse.hierarchyFields[heirarchyId]) {
      if (metadataModeleResponse.hierarchyFields[heirarchyId].hasOwnProperty(key)) {
        const field = metadataModeleResponse.hierarchyFields[heirarchyId];
        const picklist = field[key]?.picklist || field[key]?.pickList;
        if (picklist === '1' || picklist === '30' || picklist === '37') {
          dataToPush.push({ name: field[key].fieldDescri, id: field[key].fieldId, parent: parentDesc, children: [], allData: field[key] });
        }
      }
    }
    return dataToPush;
  }

  /**
   * Initialize grid and hirarcy
   * @param metadataModeleResponse metadata object
   */
  initGridAndHierarchyToAutocompleteDropdown(metadataModeleResponse: MetadataModeleResponse) {
    const data = [];
    for (const key in metadataModeleResponse.grids) {
      if (metadataModeleResponse.grids.hasOwnProperty(key)) {
        const objToPush = {
          name: metadataModeleResponse.grids[key].fieldDescri,
          id: metadataModeleResponse.grids[key].fieldId,
          parent: null,
          allData: metadataModeleResponse.grids[key],
          children: this.getGridFieldsByGridKey(metadataModeleResponse, metadataModeleResponse.grids[key].fieldId, metadataModeleResponse.grids[key].fieldDescri)
        }
        data.push(objToPush)
      }
    }

    for (const key in metadataModeleResponse.hierarchy) {
      if (metadataModeleResponse.hierarchy.hasOwnProperty(key)) {
        const objToPush = {
          name: metadataModeleResponse.hierarchy[key].heirarchyText,
          id: metadataModeleResponse.hierarchy[key].fieldId,
          parent: null,
          allData: metadataModeleResponse.hierarchy[key],
          children: this.getHierarchyFieldsByHierarchyKey(metadataModeleResponse, metadataModeleResponse.hierarchy[key].fieldId, metadataModeleResponse.hierarchy[key].heirarchyText,
            metadataModeleResponse.hierarchy[key].heirarchyId)
        }
        data.push(objToPush)
      }
    }
    this.dataSource.data = data.filter(f => !!f.children && f.children.length >= 1);
    this.allGridAndHirarchyData = data.filter(f => !!f.children && f.children.length >= 1);
  }

  /**
   * Calculate fields based on user view ..
   *
   */
  tarnsformMetada(allMDF: MetadataModeleResponse): void {
    const fields = [];
    for (const headerField in allMDF.headers) {
      if (fields.indexOf(headerField)) {
        const fldCtrl = allMDF.headers[headerField] as MetadataModel;
        const picklist = fldCtrl?.picklist || fldCtrl?.pickList;
        if (picklist === '1' || picklist === '30' || picklist === '37') {
          fields.push(allMDF.headers[headerField]);
        }
      }
    }

    this.initGridAndHierarchyToAutocompleteDropdown(allMDF);
    this.metadaDrop = fields;
    this.searchDrop = fields;
  }

  /**
   * Get field control ..
   * @param fld get control of that field
   */
  ctrlFlds(fld: MetadataModel) {
    this.dropValuesCode = [];
    this.activateElement = fld;
    this.metadaDrop = [];
    if (!this.moduleId) {
      this.schemaService.generateColumnByFieldId(this.activateElement.fieldId);
    }
    else {
      if (this.alreadySelectedValues && this.alreadySelectedValues.length > 0) {
        const sel = this.alreadySelectedValues.filter((selectedValue) => selectedValue.fieldId === fld.fieldId);
        this.dropValuesCode = sel && sel.length ? sel[0].values : [];
      }
    }
  }

  /**
   * Move to previous state
   */
  prevState(event) {
    event.stopPropagation();
    this.activateElement = null;
    if (this.moduleId) {
      const currentMetaData = this.metadata.getValue();
      if (currentMetaData) {
        this.metadata.next(currentMetaData);
      }
    } else {
      this.metadaDrop = this.currentFields.getValue();
    }

  }

  /**
   * Emit selectd field and values ..
   * @param val changed value ..
   */
  emitAppliedFilter(val: DropDownValue[]) {
    this.selectedValues = val;
    this.evtReadyForApply.emit({ fldCtrl: this.activateElement, selectedValues: val });
    this.activateElement = null;
  }

  /**
   * To search metadat fields according to the search field
   * @param searchText string to search with
   */
  searchField(searchText: string) {
    if (searchText.trim()) {
      this.metadaDrop = this.searchDrop.filter((value) => value.fieldDescri.toLowerCase().includes(searchText.toLowerCase()));
      if (this.dataSource != null) {
        const filterData = [];
        this.allGridAndHirarchyData.forEach(item => {
          if (item.name.toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || (!!item.parent && item.parent.toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
            || item.children.filter(child => { return child.name.toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1 }).length >= 1) {
            const parentChildData = item;
            if (item.children.filter(child => { return child.name.toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1 }).length >= 1) {
              parentChildData.children = item.children.filter(child => { return child.name.toString().toLowerCase().indexOf(searchText.toLowerCase()) !== -1 });
            }
            filterData.push(parentChildData);
          }
        });
        this.dataSource.data = filterData;
      }
      if (!!this.tree && this.tree.treeControl !== null && this.tree.treeControl !== undefined) {
        this.tree.treeControl.expandAll();
      }
    } else {
      this.metadaDrop = this.searchDrop;
      if (this.dataSource !== null) {
        this.dataSource.data = this.allGridAndHirarchyData;
      }
      if (!!this.tree && this.tree.treeControl !== null && this.tree.treeControl !== undefined) {
        this.tree.treeControl.collapseAll();
      }
    }
  }

  /**
   * Function to get drop-down values according to field id
   * @param materialId: fieldID/ materialID
   * @param query: query string to be searched if any.
   */
  getDropdownValues(materialId: string, query: string) {
    const sub = this.schemaService.getFieldDropValues(this.moduleId, materialId, query).subscribe((data) => {
      if (data && data.length > 0) {
        this.dropValues = data;
      }
    }, (error) => {
      console.log('Something went wrong while getting dropdown values', error.message);
    });
    this.subscriptions.push(sub);
  }
}

