import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { ListValueResponse } from '@models/list-page/listpage';
import { HierarchyListItem, HierarchyService } from '@modules/list/_components/field/hierarchy-service/hierarchy.service';
import { ActiveForm, Process } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { CoreCrudService } from '@services/core-crud/core-crud.service';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import { forkJoin, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, take, takeUntil } from 'rxjs/operators';

interface HierarchyItemNode {
  expandable: boolean;
  label: string;
  level: number;
  id: number;
  parentNodeId: number;
  isKeyValue: boolean;
  structureId: number;
  parentStructureId: number;
  keyFieldId: string;
  keyFieldValueCode: string;
  keyFieldValueText: string;
  parentKeyFieldId: string;
  parentKeyFieldValueCode: string;
  parentKeyFieldValueText: string;
  isHeader: boolean;
  isMultiField: boolean,
  multiFieldOptions: Array<any>
  radomId: string
}

@Component({
  selector: 'pros-transaction-hierarchy-list',
  templateUrl: './transaction-hierarchy-list.component.html',
  styleUrls: ['./transaction-hierarchy-list.component.scss']
})
export class TransactionHierarchyListComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  moduleId: string;


  @Input()
  isChildDataset: boolean;

  @Input()
  dataControl;

  @Output()
  structureChanged: EventEmitter<number[]> = new EventEmitter();

  @Input()
  activeStructureId;

  @Input()
  relatedDatasets = [];

  @Input()
  process = Process.create;

  @Input()
  recordId: string;

  @Input()
  crId: string;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  treeControl = new FlatTreeControl<any>(
    node => node.level,
    node => node.expandable,
  );

  // Mat tree flattener
  treeFlattener = new MatTreeFlattener(
    treeTransformer,
    node => node.level,
    node => node.expandable,
    node => node.child,
  );

  // Mat tree datasource
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  structureSub: ReplaySubject<any> = new ReplaySubject(1);

  keyField = { id: null, desc: '' };
  multiKeyFields: Array<{fieldId: '', fieldDesc: ''}> = [];
  keyFieldOptionsObs: Observable<any> = of([]);
  isLoadingKeyFieldOptions = false;
  selectedKeyFieldOptions: any = [];

  dropdowOptionsSearchSub: Subject<string> = new Subject();

  keyFieldStructureId: number;
  allRecordList = [];
  recordList: Array<any> = [];
  activeForm: ActiveForm;
  datasetDescription = '';

  hierarchyListSearchTerm = '';
  hierarchyListPageIndex = 0;
  hierarchyListPageSize = 50;
  hierarchyList: HierarchyListItem[] = [];
  subHierarchyList: HierarchyListItem[] = [];

  tenantId: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string,
    private ruleService: RuleService,
    private coreService: CoreService,
    private transactionService: TransactionService,
    private dataControlService: DataControlService,
    private hierarchyService: HierarchyService,
    private userService: UserService,
    private coreCrudService: CoreCrudService,
    private trasientSer: TransientService,

    ) {
      this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes.moduleId && changes.moduleId.previousValue !== changes.moduleId.currentValue) {
      this.getHierarchyList();
    }
  }

  ngOnInit(): void {

    this.structureSub.pipe(
      distinctUntilChanged(),
      switchMap((resp: {node: any, parentNode: any}) => {
        this.keyFieldStructureId = resp?.node.id;
        if (resp?.node?.hasOwnProperty('isMultiField')) {
         if (!resp?.node?.isMultiField) {
          this.keyFieldStructureId = resp?.node?.structureId || resp?.node.id;
         } else if (resp?.node?.isMultiField && resp?.node?.multiFieldOptions?.length){
           this.keyFieldStructureId = resp?.node?.multiFieldOptions[0].structureId;
         }
        }
        this.keyField.id = null;
        this.multiKeyFields = [];
        this.keyFieldOptionsObs = of([]);
        // set already selected key field options
        const node = this.searchNode(this.dataSource.data[0], this.keyFieldStructureId, null, resp?.parentNode?.keyFieldValueCode);
        this.selectedKeyFieldOptions = node?.child?.filter(n => n.isKeyValue) || [];
        return this.getKeyFieldsByStructureId(this.keyFieldStructureId);
      }),
      switchMap(keyFields => {
        if (keyFields.length === 1) {
            const field = keyFields?.find(f => f.structureId === `${this.keyFieldStructureId}`);
            this.keyField.desc = field?.shortText[this.locale]?.description;
            this.keyField.id = field?.fieldId;
            if(this.keyField.id) {
              return this.getDropdownOptions();
            }
        } else if (keyFields.length > 1) {
          const fields = keyFields?.filter(f => f.structureId === `${this.keyFieldStructureId}`);
          this.multiKeyFields = fields.map(field => {
            return {
              fieldId: field.fieldId,
              fieldDesc: field?.shortText[this.locale]?.description
            }
          });
          if(this.multiKeyFields) {
            return this.getMultiFieldDropdownOptions();
          }
        }
        return of(null)
      })
    )
    .subscribe((resp: ListValueResponse) => {
        this.keyFieldOptionsObs = of(resp?.content);
    });

    this.dropdowOptionsSearchSub.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        if (!this.keyField.id && this.multiKeyFields.length !== 0) {
          return this.getMultiFieldDropdownOptions(searchTerm)
        }
        return this.getDropdownOptions(searchTerm)
      })
    ).subscribe((resp: ListValueResponse) => {
      this.keyFieldOptionsObs = of(resp?.content);
    });

    this.dataControlService.activeForm$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((resp: ActiveForm) => {
      if(resp) {
        this.activeForm = resp;
        if(!resp.isPrimary) {
          this.getAllModuleRecords(this.dataControl, resp);
          const dataset = this.relatedDatasets.filter(item => item.childDatasetId === resp.moduleId);
          if(dataset.length) {
            this.datasetDescription = dataset[0].childDescription || dataset[0].childDatasetId;
          }
        }
      }
    });
  }

  getAllModuleRecords(dataControl: FormGroup, activeForm: ActiveForm) {
    const relatedDatasetFGroup = activeForm.referenceRecordDetails ?
     this.dataControlService.getAllReferenceRecords(dataControl, activeForm) :
     this.dataControlService.getAllRecordsOfRelatedDataset(dataControl, activeForm);
    this.allRecordList = Object.keys((relatedDatasetFGroup || {}));
  }

  navigateToNode(node: HierarchyItemNode) {
    const structureId = node.isKeyValue ? node.structureId : node.id;
    if(node.isKeyValue) {
      const keyFieldDetails = {
        structureId,
        parentStructureId: node.parentStructureId,
        keyFieldId: node.keyFieldId,
        keyFieldValueCode: node.keyFieldValueCode,
        keyFieldValueText: node.keyFieldValueText,
        parentKeyFieldId: node.parentKeyFieldId,
        parentKeyFieldValueCode: node.parentKeyFieldValueCode,
        parentKeyFieldValueText: node.parentKeyFieldValueText,
        isMultiField: node.isMultiField,
        multiFieldOptions: node.multiFieldOptions,
        radomId: node.radomId
      };
      this.transactionService.setKeyFieldsDetails(this.activeForm, this.moduleId, keyFieldDetails);
    } else if(node.isHeader) {
      this.transactionService.setKeyFieldsDetails(this.activeForm, this.moduleId, null);
    } else {
      return;
    }
    if(structureId !== this.activeStructureId) {
      const nodeHierarchy = this.getStructureHierarchy(node);
      this.structureChanged.emit(nodeHierarchy);
      this.transactionService.setHierarchyListDetails(this.activeForm, this.moduleId, this.dataSource.data, structureId);
      this.activeStructureId = structureId;
    }
  }

  /**
   * Detect if a node is currently selected
   * @param node Pass the hierarchy node
   * @returns boolean
   */
  isActive(node: HierarchyItemNode): boolean {
    if(node.isHeader) {
        return (this.activeStructureId === this.getHeaderNode()?.id);
    } else if (node.isKeyValue) {
        const keyFieldDetails = this.transactionService.hierarchyKeyFieldDetails.getValue() && this.transactionService.hierarchyKeyFieldDetails.getValue()[this.moduleId];
        if (keyFieldDetails?.isMultiField) {
          return keyFieldDetails && (keyFieldDetails.structureId === node.structureId) && (this.activeStructureId === node.structureId)
          && keyFieldDetails.radomId === node.radomId
        } else {
           return keyFieldDetails && (keyFieldDetails.structureId === node.structureId) && (this.activeStructureId === node.structureId)
           && (keyFieldDetails.keyFieldId === node.keyFieldId) && (keyFieldDetails.keyFieldValueCode === node.keyFieldValueCode)
           && ((!keyFieldDetails.parentKeyFieldId && !node.parentKeyFieldId) || (keyFieldDetails.parentKeyFieldId === node.parentKeyFieldId))
           && ((!keyFieldDetails.parentKeyFieldValueCode && !node.parentKeyFieldValueCode) || (keyFieldDetails.parentKeyFieldValueCode === node.parentKeyFieldValueCode));
        }
    }
    return false;
  }

  hasChild = (_: number, node: HierarchyItemNode) => {
    return node.expandable;
  }

  getHeaderNode() {
    return this.hierarchyList.find(s => s.isHeader);
  }

  getChildsByNode(node: HierarchyItemNode) {
    if(!node) return;
    if (node?.isKeyValue) {
      if (node.isMultiField && node.multiFieldOptions.length) {
        node = node.multiFieldOptions[0];
      }
      const childNode = this.subHierarchyList.filter(data => data.id === node.parentStructureId)[0].child.find(child => child.id === node.structureId).child;
      return childNode;
    }
    const headerNode = this.getHeaderNode();
    const nodeId = node.isKeyValue ? node.structureId : node.id;
    return this.searchNode(headerNode, nodeId)?.child || [];
  }

  searchNode(node, nodeId, keyFieldValueCode?, parentKeyFieldValueCode?){
    if((node?.id === nodeId) && (!parentKeyFieldValueCode || (node.parentKeyFieldValueCode === parentKeyFieldValueCode))){
        return keyFieldValueCode ? node.child?.find(c => c.keyFieldValueCode === keyFieldValueCode) : node;
    } else if (node.child?.length){
         let i;
         let result = null;
         for(i=0; result == null && i < node.child.length; i++){
              result = this.searchNode(node.child[i], nodeId, keyFieldValueCode, parentKeyFieldValueCode);
         }
         return result;
    }
    return null;
  }


  getDropdownOptions(str = '') {
    return this.structureSub.pipe(
      take(1),
      switchMap((resp: {node: any, parentNode: any}) => {
      const request: { searchString: string; parent: any } = {
        searchString: str,
        parent: resp.parentNode?.isKeyValue ? {[resp.parentNode.keyFieldId]: resp.parentNode.keyFieldValueCode} : {}
      };
      this.isLoadingKeyFieldOptions = true;
      return this.ruleService.getDropvals(this.moduleId, this.keyField.id, this.locale, request).pipe(
        finalize(() => this.isLoadingKeyFieldOptions = false)
      );
    }));
  }

  getMultiFieldDropdownOptions(str = '') {
    return this.structureSub.pipe(
      take(1),
      switchMap(resp => {
      this.isLoadingKeyFieldOptions = true;
      const multiKeyFields = this.multiKeyFields.map(field => field.fieldId);
      return this.ruleService.getDropDownDetailsByFieldId(this.moduleId, str, multiKeyFields).pipe(
        map(data => {
          return {content: data}
        }),
        catchError(
          (error) => {
            console.log('MultiField Error:', error)
            return of([]);
          }
        ),
        finalize(() => this.isLoadingKeyFieldOptions = false)
      );
    }));
  }

  getKeyFieldsByStructureId(structureId, searchTerm?) {
    return this.coreService.getKeyFieldsByStructureId(this.moduleId, structureId, 0, 10, searchTerm || '');
  }

  applyKeyFieldValues(parentNode, node) {
    let parentTreeNode = this.searchNode(this.dataSource.data[0], node.id, parentNode.keyFieldValueCode);
    let childs = [];
    if(parentTreeNode) {
      this.selectedKeyFieldOptions.forEach(op => {
        if (op.isMultiField) {
          const index = parentTreeNode.child?.findIndex(n => n.radomId === op.radomId);
          (index === -1) ? childs.push(op) : childs.push(parentTreeNode.child[index])
        } else {
          const index = parentTreeNode.child?.findIndex(n => n.keyFieldValueCode === op.keyFieldValueCode);
          (index === -1) ? childs.push(op) : childs.push(parentTreeNode.child[index]);
        }
      })
      parentTreeNode.child = childs;
    } else {
      const newNode = Object.assign({}, this.searchNode(this.hierarchyList[0], node.id));
      childs = [...this.selectedKeyFieldOptions];
      newNode.parentKeyFieldValueCode = parentNode.keyFieldValueCode;
      newNode.child = childs;
      const parentStructureId = parentNode.isKeyValue ? parentNode.structureId : parentNode.id;
      newNode.parentStructureId = parentStructureId;
      parentTreeNode = this.searchNode(this.dataSource.data[0], parentStructureId, parentNode.keyFieldValueCode);
      parentTreeNode.child ?  parentTreeNode.child.push(newNode) : parentTreeNode.child = [newNode];
    }

    const singleField = childs.filter(child => !child.isMultiField);
    const multiField = childs.filter(child => child.isMultiField);
    const multiFieldArr = [];

    if (singleField.length) {
      this.transactionService.updateHyvsRows(this.activeForm, this.moduleId, null, this.keyFieldStructureId, singleField,false);
    }

    if (multiField.length) {
      multiField.forEach(child => {
        if(child.isMultiField && child.multiFieldOptions.length !== 0) {
          multiFieldArr.push(child.multiFieldOptions);
        }
      })
    }

    if (multiFieldArr.length) {
      this.transactionService.updateHyvsRows(this.activeForm, this.moduleId, null, this.keyFieldStructureId, multiFieldArr,true);
    }

    this.dataSource.data = this.dataSource.data.slice();
    this.transactionService.setHierarchyListDetails(this.activeForm, this.moduleId, this.dataSource.data, this.activeStructureId);
    this.treeControl.expandAll();

  }

  updateKeyFieldValues(option, parentNode, node, isMultiFieldOptions) {
    if (isMultiFieldOptions) {
      const multiFieldArray = [];
      let optionProperties = Object.keys(option);

      for (let prop of optionProperties ) {
        this.multiKeyFields.forEach(field => {
          if (field.fieldId === prop) {
            const optionDesc = {
              code: option[prop].code,
              label: `${field.fieldDesc}:${option[prop].text}`,
              text: option[prop].text,
              fieldId: field.fieldId
            };
            multiFieldArray.push(optionDesc)
          }
        })
      }
      this.updateSelectedFieldOptions(multiFieldArray, parentNode, node);
    } else {
      const optionDesc = {
        code: option.code,
        label: `${this.keyField.desc}:${option.text}`,
        text: option.text,
      };
      this.updateSelectedFieldOptions(optionDesc, parentNode, node);
    }
  }

  updateSelectedFieldOptions(option, parentNode, node) {
    let index;
    let multiField = [];

    if (this.multiKeyFields.length !== 0) {
      index = this.selectedKeyFieldOptions.findIndex(op => op.multiFieldOptions.every(data => Object.keys(option).some(element => option[element].code === data.keyFieldValueCode)));
      if (index === -1) {
        multiField = this.defineMultiFields(option, parentNode, node)
      }
    } else {
      index = this.selectedKeyFieldOptions.findIndex(op => op.keyFieldValueCode === option.code);
    }

    if(index > -1) {
      this.selectedKeyFieldOptions.splice(index, 1);
    } else {
      this.selectedKeyFieldOptions.push({
        label: option?.label,
        isKeyValue: true,
        isMultiField: (multiField.length !== 0),
        parentNodeId: parentNode.isKeyValue ? parentNode.parentNodeId : parentNode.id,
        keyFieldId: this.keyField.id,
        keyFieldValueCode: option?.code,
        keyFieldValueText: option?.text,
        parentKeyFieldId: parentNode.isKeyValue ? parentNode.keyFieldId : null,
        parentKeyFieldValueCode: parentNode.isKeyValue ? parentNode.keyFieldValueCode : null,
        parentKeyFieldValueText: parentNode.isKeyValue ? parentNode.keyFieldValueText : null,
        parentStructureId: parentNode.isKeyValue ? parentNode.structureId : parentNode.id,
        structureId: node.id,
        multiFieldOptions: multiField,
        radomId: Math.random().toString(36).slice(2)
      });
    }
  }

  defineMultiFields(option, parentNode, node) {
    return option.map(element => {
      return {
        label: element?.label,
        isKeyValue: true,
        parentNodeId: parentNode.isKeyValue ? parentNode.parentNodeId : parentNode.id,
        keyFieldId: element?.fieldId,
        keyFieldValueCode: element?.code,
        keyFieldValueText: element?.text,
        multiFieldOptions: [],
        parentKeyFieldId: parentNode.isKeyValue ? parentNode.keyFieldId : null,
        parentKeyFieldValueCode: parentNode.isKeyValue ? parentNode.keyFieldValueCode : null,
        parentKeyFieldValueText: parentNode.isKeyValue ? parentNode.keyFieldValueText : null,
        parentStructureId: parentNode.isKeyValue ? parentNode.structureId : parentNode.id,
        structureId: node.id,
        isMultiField: false
      }
    });
  }

  isMultiOptionChecked(option) {
    return this.selectedKeyFieldOptions.some(op => op.multiFieldOptions.every(data => Object.keys(option).some(data2 => option[data2].code === data.keyFieldValueCode)));
  }

  isOptionChecked(option) {
    return this.selectedKeyFieldOptions.some(op => op.keyFieldValueCode === option.code);
  }

  getNavigationData(node) {
    if(node.isHeader || node.isKeyValue) {
      return {node};
    } else {
      const parentNode = this.searchNode(this.dataSource.data[0], node.parentStructureId);
      return {childNode: node, parentNode};
    }
  }

  setStructureDetails(node) {
    if(!node.isHeader && !node.isKeyValue) {
      const parentNode = this.searchNode(this.dataSource.data[0], node.parentStructureId);
      this.structureSub.next({node, parentNode});
    }
  }

  getStructureHierarchy(node: HierarchyItemNode): number[] {
    const structureId = node.isKeyValue ? node.structureId : node.id;
    if(node.isHeader) {
      return [structureId];
    } else {
      const nextParent = this.searchNode(this.dataSource.data[0], node.parentStructureId);
      return [structureId].concat(this.getStructureHierarchy(nextParent));
    }
  }

  addNewRecord() {
    this.dataControlService.addNewRecord({
        dataControl: this.dataControl,
        moduleId: this.moduleId,
        isNewRecord: true,
        navigateTo: true,
        description: this.datasetDescription
    });
  }

  navigateToRecord(record) {
    let activeForm;
    if(this.activeForm && this.activeForm.referenceRecordDetails) {
       activeForm = {...this.activeForm, referenceRecordDetails: {...this.activeForm.referenceRecordDetails, relatedDatasetObjnr: record}};
    }else {
       activeForm = {...this.activeForm, objnr: record, isNew: false};
    }
    this.dataControlService.activeForm$.next(activeForm);
  }

  buildExistingHierarchy(savedHierarchyList: any[]) {
    const header = JSON.parse(JSON.stringify(this.getHeaderNode()));
    header.child = [];
    savedHierarchyList.forEach(node => {
      this.mapExistingHierarchy(node, header.child, null, header.id);
    });
    return [header];
  }

  mapExistingHierarchy(node, data: any[], structureId?, parentStructureId?, parentKeyFieldId?, parentKeyFieldValueCode?,parentKeyFieldValueText?) {
    let hierarchy;
    if (node.hasOwnProperty('nodeId')) {
      hierarchy = {
        id: +node.nodeId,
        label: node.nodeDesc,
        parentStructureId: +parentStructureId,
        child: [],
      };
      data.push(hierarchy);
      if (node.items?.length) {
        for (const item of node.items) {
          this.mapExistingHierarchy(item, hierarchy.child, hierarchy.id, parentStructureId,parentKeyFieldId,parentKeyFieldValueCode,parentKeyFieldValueText);
        }
      }
    } else if (node.hasOwnProperty('fieldValue')) {
      const value = node.fieldValue[0].vc?.length ? node.fieldValue[0] : { ls: node?.fieldValue[0]?.ls || '', vc: [{c: '', t: '' }]};
      let multiField = [];

      if (node.fieldValue && node.fieldValue.length > 1) {
        const newArr = node.fieldValue.map(field => {
          return {
              code: field.vc[0].c,
              label: `${field.ls}:${field.vc[0].t}`,
              text: field.vc[0].t,
              fieldId: field.fId
          }
        })
        multiField = this.defineExistingMultiFields(newArr,parentStructureId, parentKeyFieldId, parentKeyFieldValueCode, parentKeyFieldValueText,+structureId)
      }

      const isMultiFields = (multiField.length !== 0);
      hierarchy = {
        label: isMultiFields ? '' : (`${value.ls}:${value.vc[0].t || value.vc[0].c}`),
        isKeyValue: true,
        isMultiField: isMultiFields,
        keyFieldId: isMultiFields ? '' : node.fieldValue[0]?.fId,
        keyFieldValueCode: isMultiFields ? '' : value.vc[0].c,
        keyFieldValueText: isMultiFields ? '' : value.vc[0].t,
        structureId: +structureId,
        parentKeyFieldId,
        parentKeyFieldValueCode,
        parentKeyFieldValueText,
        parentStructureId: +parentStructureId,
        child: [],
        multiFieldOptions: multiField,
        radomId: Math.random().toString(36).slice(2)
      };
      data.push(hierarchy);
      if (node.childs?.length) {
        for (const item of node.childs) {
          this.mapExistingHierarchy(item, hierarchy.child, null, structureId, hierarchy.keyFieldId, hierarchy.keyFieldValueCode, hierarchy.keyFieldValueText);
        }
      }
    }
  }

  defineExistingMultiFields(option, parentStructureId, parentKeyFieldId, parentKeyFieldValueCode, parentKeyFieldValueText,structureId) {
    return option.map(element => {
      return {
        label: element?.label,
        isKeyValue: true,
        keyFieldId: element?.fieldId,
        keyFieldValueCode: element?.code,
        keyFieldValueText: element?.text,
        multiFieldOptions: [],
        parentKeyFieldId,
        parentKeyFieldValueCode,
        parentKeyFieldValueText,
        parentStructureId,
        structureId: +structureId,
        isMultiField: false
      }
    });
  }

  getHierarchyList() {
    const hierarchyListObs = this.coreService.getAllStructures(
      this.moduleId,
      this.locale,
      this.hierarchyListPageIndex,
      this.hierarchyListPageSize,
      this.hierarchyListSearchTerm);

    let savedHierarchyListObs;
    if(!this.isChildDataset && (this.process !== Process.create)) {
      savedHierarchyListObs = this.getSavedHierarchyList();
    } else {
      savedHierarchyListObs = of([]);
    }

    forkJoin([hierarchyListObs, savedHierarchyListObs]).subscribe((resp: any) => {
      this.hierarchyList = resp[0]?.length ? this.hierarchyService.transformStructureToHierarchy(resp[0]) : [];
      this.subHierarchyList = resp[0]?.length ? this.hierarchyService.transformStructureToHierarchy(resp[0]) : [];
      const savedHierarchyList = resp[1];
      const alreadyBuiltHierarchyList = this.transactionService.getHierarchyListDetails(this.activeForm, this.moduleId);
      let activeStructureId;
      if(alreadyBuiltHierarchyList) {
        this.dataSource.data = alreadyBuiltHierarchyList?.hierarchyListStructure || [];
        activeStructureId = alreadyBuiltHierarchyList?.activeStructId || (this.dataSource.data[0] && this.dataSource.data[0].id);
      }
      else if(savedHierarchyList?.length && this.hierarchyList.length) {
        this.dataSource.data = this.buildExistingHierarchy(savedHierarchyList);
        activeStructureId = this.dataSource.data?.length ? this.dataSource.data[0].id : null;
      }
      else {
        const header = this.getHeaderNode();
        if(header) {
          this.dataSource.data = [JSON.parse(JSON.stringify({ ...header, child: []}))];
          activeStructureId = header.id;
        } else {
          this.dataSource.data = [];
        }
      }
      if(activeStructureId && this.dataSource.data?.length) {
        const keyFieldDetails = this.transactionService.hierarchyKeyFieldDetails.getValue() && this.transactionService.hierarchyKeyFieldDetails.getValue()[this.moduleId];
        const node = this.searchNode(this.dataSource.data[0], activeStructureId, keyFieldDetails?.keyFieldValueCode, keyFieldDetails?.parentKeyFieldValueCode);
        if(node) {
          this.navigateToNode(node);
        }
        setTimeout(() => this.treeControl.expandAll(), 100);
      }
    });
  }

  getNodeLabel(node) {
    let nodeLabel = '';
    node.forEach(element => {
      nodeLabel += (element.label + '\n');
    });
    return nodeLabel;
  }

  getNodeKeyValueLabel(node) {
    let nodeLabel = '';
    node.forEach(element => {
      nodeLabel += (element.keyFieldValueText + '\n');
    });
    return nodeLabel;
  }

  getSavedHierarchyList() {
    return this.userService
      .getUserDetails()
      .pipe(
        distinctUntilChanged(),
        filter(user => !!user?.plantCode),
        take(1),
        switchMap(user => {
          this.tenantId = user.plantCode;
          return this.coreCrudService.getSavedkeyFieldsHierarchyV2(this.moduleId, this.crId || '', this.recordId, this.tenantId, this.locale)
        })
      );
  }

resetNode(node: HierarchyItemNode) {
    const activeForm = this.dataControlService.activeForm$.getValue();
    if(!node?.parentStructureId) {
      this.trasientSer.confirm({
        data: {
          dialogTitle: 'Alert',
          label: 'Resetting the header data will remove all the changes being made to all its underneath hierarchies. Are you sure want to reset?'
        },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel'
      }, (response) => {
        if(response?.toLowerCase() === 'yes')
        this.transactionService.setActiveKey(node, activeForm);
      });
      return;
    }

    if (node?.keyFieldId && node?.keyFieldValueCode) {
      this.trasientSer.confirm({
        data: {
          dialogTitle: 'Alert',
          label: 'Resetting the hierarchy will remove the hierarchy data and related children from the change request permanently. Are you sure want to reset?'
        },
        disableClose: true,
        autoFocus: false,
        width: '600px',
        panelClass: 'create-master-panel'
      }, (response) => {
        if(response?.toLowerCase() === 'yes')
        this.transactionService.setActiveKey(node, activeForm);
      });
      return;
    }
  }

  changeNodeCopyStatus(node: HierarchyItemNode, isCopy: boolean) {
    const activeForm = this.dataControlService.activeForm$.getValue();
    this.transactionService.changeCopyStatus(node, activeForm, isCopy);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}

const treeTransformer = (node: any, level: number) => {
  return {
    expandable: !!node.child && node.child.length > 0,
    label: node.label,
    level,
    id: node.id,
    isKeyValue: node.isKeyValue,
    parentNodeId: node.parentNodeId,
    keyFieldId: node.keyFieldId,
    keyFieldValueCode: node.keyFieldValueCode,
    keyFieldValueText: node.keyFieldValueText,
    structureId: node.structureId,
    parentStructureId: node.parentStructureId || null,
    parentKeyFieldId: node.parentKeyFieldId || null,
    parentKeyFieldValueCode: node.parentKeyFieldValueCode || null,
    parentKeyFieldValueText: node.parentKeyFieldValueText || null,
    isHeader: node.isHeader,
    isMultiField: node.isMultiField,
    multiFieldOptions: node.multiFieldOptions,
    radomId: node?.radomId
  };
};
