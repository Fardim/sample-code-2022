import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, ComponentFactoryResolver, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ContainerRefDirective } from '@modules/shared/_directives/container-ref.directive';
import { TransientService } from 'mdo-ui-library';
import { HEIRARCHY_OPTIONS, HierarchyListItem, HierarchyService, HIERARCHYTYPES } from '../hierarchy-service/hierarchy.service';
import { EditLabelComponent, UpdateValue } from './edit-label/edit-label.component';
import { isEqual } from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'pros-hierarchy-list',
  templateUrl: './hierarchy-list.component.html',
  styleUrls: ['./hierarchy-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HierarchyListComponent implements OnInit, OnChanges {
  hierarchyOptions = HEIRARCHY_OPTIONS;

  @Input()
  hierarchyList: HierarchyListItem[] = [];
  @Input()
  moduleId: string;
  @Input()
  selectedStructureId: string;
  @Input()
  nextStructureId: number;
  @Input()
  searchString: string;

  /**
   * Getting the readonly flag from requested componenet
   */
  @Input()
  readOnlyMode = false;

  nodeInEditMode = null;
  nodeLoading = null;
  @Output() valueChange: EventEmitter<any> = new EventEmitter(null);

  constructor(
    private hierarchyService: HierarchyService,
    private transientService: TransientService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router,
    private route: ActivatedRoute,
    ) { }

  ngOnInit(): void {
    this.updateModuleId(this.moduleId);
  }

  emitValueChange(value: boolean) {
    this.valueChange.emit(value);
  }

  updateModuleId(moduleId: string) {
    this.hierarchyService.updatedModuleId = moduleId;
  }

  /**
   * Detect if a node is currently selected
   * @param node Pass the hierarchy node
   * @returns boolean
   */
  isActive(node: HierarchyListItem): boolean {
    return `${node.id}` === this.selectedStructureId;
  }

  /**
   * on change of the structure clear the f, child, subchild, limit query params.
   */
  navigateToNode(structureId: number) {
    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { update: true, s: structureId },
      });
  }

  /**
   * set a specific node as active node
   * @param node pass the hierarchy node
   */
  get activeNode(): HierarchyListItem {
    return this.hierarchyService.activeHierarchyNode;
  }

  /**
   * method to re order hierachy nodes in a list
   * @param dropEvent pass the cdk drop event
   * @param hierarchy pass the parent hierarchy
   */
  drop(dropEvent: CdkDragDrop<HierarchyListItem>, hierarchy: HierarchyListItem): void {
    this.hierarchyService.reOrderNode(dropEvent, hierarchy);
  }

  /**
   * Method to edit a specific node label
   * It creates a dynamic input component and further
   * calls a promise that resolves in the updated list of hierarchies
   * @param container pass the container reference
   * @param hierarchy pass the hierarchy to be modified
   */
  editCurrentNode(container: ContainerRefDirective, hierarchy: HierarchyListItem): void {
    if(hierarchy.level === 0 || this.readOnlyMode) { return; };
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(EditLabelComponent);
    const componentRef = container.viewContainerRef.createComponent(componentFactory);
    componentRef.instance.value = hierarchy.label;
    this.nodeInEditMode = hierarchy;
    if(componentRef.instance.valueChange !== undefined) {
      componentRef.instance.valueChange
      .subscribe((updatedValue: UpdateValue) => {
        this.updateName(updatedValue, hierarchy);
        this.nodeInEditMode = null;
        container.viewContainerRef.remove();
      });
    }
  }

  /**
   * update hierarchy Name
   * @param updatedValue pass the updated value
   * @param hierarchy pass the hierarchy object
   */
  updateName(updatedValue: UpdateValue, hierarchy: HierarchyListItem): void {
    if (!updatedValue.currentValue.trim()) {
      this.transientService.open('Hierarchy Name cannot be empty!', 'Dismiss');
      return;
    }
    if(updatedValue.currentValue !== updatedValue.previousValue) {
      this.nodeLoading = hierarchy.id;
      this.renameHierarchy(updatedValue.currentValue, hierarchy).then((updated: boolean) => {
        // this.nodeLoading = null;
        if(updated) {
          this.emitValueChange(updated);
        }
      }).catch(() => {
        this.nodeLoading = null;
        this.transientService.open('Error while renaming hierarchy', 'Dismiss');
      });
    }
  }

  /**
   * Method to rename a node and update hierarchylist
   * @param name pass the new name yo update
   * @param hierarchy pass the node
   * @returns Promise<boolean>
   */
  renameHierarchy(name: string, hierarchy: HierarchyListItem): Promise<boolean | any> {
    return new Promise((resolve, reject) => {
      const updatedNode = {...hierarchy, label: name};
      this.hierarchyService.saveUpdateStructure(updatedNode).subscribe((response) => {
        resolve(true);
      }, err => {
        reject(err);
      });
    });
  }

  /**
   * Update the hierarchy node
   */
  updateHierarchyNode(node: HierarchyListItem): Promise<boolean | any> {
    return new Promise((resolve, reject) => {
      this.hierarchyService.saveUpdateStructure(node).subscribe((response) => {
        resolve(true);
        this.emitValueChange(true);
      }, err => {
        reject(err);
      });
    });
  }

  /**
   * Method to add and remove speccific node types
   * @param type pass the node type
   * @param parent pass the parent node item
   */
  selectHeirarchyOption(type: HIERARCHYTYPES | 'remove', parent: HierarchyListItem): void {
    if(type === HIERARCHYTYPES.CHILD) {
      const child = {...this.hierarchyService.createChild(parent, this.nextStructureId)};
      this.updateHierarchyNode(child).then((res) => {
        this.navigateToNode(child.id);
      });
    }

    if(type === HIERARCHYTYPES.SIBLING) {
      const sibling = this.hierarchyService.createSibling(this.nextStructureId);
      this.updateHierarchyNode(sibling).then((res) => {
        this.navigateToNode(sibling.id);
      });
    }

    if(type === 'remove') {
      this.transientService.confirm({
        data: {
          dialogTitle: 'Confirmation',
          label: 'Deleting hierarchy will delete all related fields from the dataset and all the data maintained against it. Do you wish to continue?' },
        disableClose: true,
        autoFocus: false,
        width: '400px',
        panelClass: 'create-master-panel',
      }, (response) => {
        if(response === 'yes') {
          this.deleteHierarchy(parent);
        }
      });
    }
  }

  /**
   * delete hierarchy
   * @param node pass the hierarchy node to delete
   */
  deleteHierarchy(node: HierarchyListItem): void {
    this.hierarchyService.deleteHierarchy(node).subscribe((res) => {
      if(res?.acknowledge) {
        this.transientService.open(res.successMsg, 'Dismiss');
        this.emitValueChange(true);
        this.setActiveHierarchyList(node.parentId, node.id);
      }
    });
  }

  /**
   * Method to check if current node is being edited
   * @param hierarchy pass the node
   * @returns boolean
   */
  isBeingEdited(hierarchy: HierarchyListItem): boolean {
    return this.nodeInEditMode && isEqual(hierarchy, this.nodeInEditMode);
  }

  isNodeLoading (id: number): boolean {
    return this.nodeLoading === id;
  }

  /**
   * Get an array to loop and add tab space
   * @param hierarchy pass the hierarchy node
   * @returns array
   */
  getTabs(hierarchy: HierarchyListItem): any[] {
    return this.hierarchyService.getTabs(hierarchy);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.moduleId && changes.moduleId.currentValue) {
      this.moduleId = changes.moduleId.currentValue;
      this.updateModuleId(this.moduleId);
    }
    if(changes.hierarchyList && changes.hierarchyList.currentValue?.length>-1) {
      this.hierarchyList = changes.hierarchyList.currentValue;
    }
    if(changes.selectedStructureId && changes.selectedStructureId.previousValue !== changes.selectedStructureId.currentValue) {
      this.selectedStructureId = changes.selectedStructureId.currentValue;
    }
  }

  // Set Active Hierarchy Last Root or Child
  setActiveHierarchyList(parentId, childId) {
    const parentHierarchyList = this.hierarchyService.getHierarchyByHierarchyId(parentId);
    const index = parentHierarchyList.child.findIndex((hierarchy) => hierarchy.id === childId);
    if(index !== -1) {
      parentHierarchyList.child.splice(index, 1);
    }

    if(parentHierarchyList.child.length) {
      this.navigateToNode(parentHierarchyList.child[parentHierarchyList.child.length - 1].id);
    }
    else {
      this.navigateToNode(parentHierarchyList.id);
    }

  }
}
