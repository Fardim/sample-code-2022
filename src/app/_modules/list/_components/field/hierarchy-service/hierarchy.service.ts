import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { CoreService } from '@services/core/core.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { get } from 'lodash';

export enum HIERARCHYTYPES {
  SIBLING = 'sibling',
  CHILD = 'child',
}

export class Structure {
  isHeader: boolean;
  language?: string;
  parentStrucId?: number;
  strucDesc?: string;
  structureId: number;
  moduleId?: string;
  order?: number
}

export class HierarchyListItem {
  id: number;
  label: string;
  parentId?: number;
  child?: HierarchyListItem[];
  level: number;
  deleted: boolean;
  language?: string;
  moduleId?: string;
  order?: number;
  isHeader?: boolean;

  getStructure?(): Structure {
    return {
      isHeader: this.isHeader,
      structureId: this.id,
      language: this.language,
      moduleId: this.moduleId,
      parentStrucId: this.parentId,
      strucDesc: this.label,
      order: this.order || null
    }
  }
  setStructure?(value: Structure, level: number = 1) {
    if(value) {
      this.id = value.structureId;
      this.label = value.strucDesc;
      this.level = value.isHeader? 0: level;
      this.parentId = value.parentStrucId;
      this.language = value.language;
      this.moduleId = value.moduleId;
      this.child = [];
      this.deleted = false;
      this.isHeader = value.isHeader;
    }
  }

  constructor(hierarchy: HierarchyListItem = null) {
    if(hierarchy) {
      this.id = hierarchy?.id;
      this.label = hierarchy?.label;
      this.parentId = hierarchy?.parentId;
      this.child = hierarchy?.child;
      this.level = hierarchy?.level;
      this.deleted = hierarchy?.deleted;
      this.language = hierarchy?.language;
      this.moduleId = hierarchy?.moduleId;
      this.isHeader = hierarchy?.isHeader;
    }
  }
}

export const ROOT_HIERARCHY: HierarchyListItem = new HierarchyListItem({
  label: 'Header Data',
  id: 1,
  child: [],
  level: 0,
  deleted: false,
  isHeader: true
});

export const HEIRARCHY_OPTIONS = [
  { label: 'Sibling', key: HIERARCHYTYPES.SIBLING },
  { label: 'Child', key: HIERARCHYTYPES.CHILD },
  { label: 'Remove', key: 'remove' },
];

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {

  hierarchyList: BehaviorSubject<HierarchyListItem[]>;
  private activeNode: BehaviorSubject<HierarchyListItem> = new BehaviorSubject(null);
  private moduleId: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private coreService: CoreService) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.hierarchyList = new BehaviorSubject([new HierarchyListItem({...ROOT_HIERARCHY, language: this.locale})]);
  }

  /**
   * Getter for hierrarchy listHierarchyListItem
   */
  get hierarchyListSubscription(): Observable<HierarchyListItem[]> {
    return this.hierarchyList.asObservable();
  }

  /**
   * Getter for hierrarchy listHierarchyListItem
   */
  get hierarchyItems(): HierarchyListItem[] {
    return this.hierarchyList.getValue();
  }

  /**
   * Setter for hierrarchy list
   */
  set hierarchyItems(items: HierarchyListItem[]) {
    this.hierarchyList.next(items);
  }

  /**
   * Getter for active node
   */
  get activeHierarchyNode(): HierarchyListItem {
    return this.activeNode.getValue();
  }

  /**
   * Setter for active node
   */
  set activeHierarchyNode(node: HierarchyListItem) {
    this.activeNode.next(node);
  };

  /**
   * getter for node subscription
   */
  get activeNodeSubscription(): Observable<HierarchyListItem> {
    return this.activeNode.asObservable();
  };

  /**
   * set updated module Id
   */
  set updatedModuleId(moduleId: string) {
    this.moduleId.next(moduleId);
  }

  /**
   * get updated module Id
   * from the current observable value
   */
  get updatedModuleId(): string {
    return this.moduleId.getValue();
  }

  /**
   * Method to delete hierarchy
   * @param hierarchy pass the hierarchy to be deleted
   * @returns HierarchyListItem
   */
  deleteHierarchy(hierarchy: HierarchyListItem): Observable<any> {
    return this.coreService.deleteStructure(hierarchy.moduleId, hierarchy.id);
  }

  /**
   * detect whether a given node is selected or active
   * @param node hierarchy node
   * @returns boolean
   */
  isActive(node: HierarchyListItem): boolean {
    return !!(this.activeHierarchyNode
      && this.activeHierarchyNode.id === node?.id
      && this.activeHierarchyNode.parentId === node?.parentId
      && this.activeHierarchyNode.level === node?.level);
  }

  /**
   * Create a sibling based on the last created node
   * @param lastHierarchyItem pass the last node
   * @returns HierarchyListItem
   */
  createSibling(nextStructureId: number): HierarchyListItem {
    const lastHierarchyItem = this.hierarchyItems[0].child[this.hierarchyItems[0].child.length - 1];
    const childCount = this.hierarchyItems[0].child.length;
    const sibling: HierarchyListItem = new HierarchyListItem({
      child: [],
      deleted: false,
      language: this.locale,
      id: nextStructureId,
      level: lastHierarchyItem.level,
      moduleId: this.moduleId.getValue(),
      parentId: lastHierarchyItem.parentId,
      label: `Hierarchy ${childCount+1}`,
      isHeader: false
    });

    return sibling;
  }

  /**
   * Method to create a child node
   * @param parent pass the parent node
   * @returns HierarchyListItem
   */
  createChild(parent: HierarchyListItem, nextStructureId: number): HierarchyListItem {
    const child: HierarchyListItem = new HierarchyListItem({
      child: [],
      deleted: false,
      parentId: parent.id,
      level: parent.level+1,
      language: this.locale,
      id: nextStructureId,
      moduleId: this.moduleId.getValue(),
      label: `Hierarchy ${parent.child.length+1}`,
      isHeader: false
    });

    return child;
  }

  getUniqueNodeId(arr: HierarchyListItem[] = this.hierarchyItems) {
    let temp = 0;
    arr.map((node) => {
      temp = temp>node.id? temp: node.id;
      if(node?.child?.length) {
        temp = temp>this.getUniqueNodeId(node.child)? temp: this.getUniqueNodeId(node.child);
      }
    });

    return temp+1;
  }

  /**
   * Recursive method to update the hierarchy based on the passed node
   * This method will detect the position of the node automatically in
   * the hierarchy based on the level and will update the hierarchy list
   * it belongs to
   * @param hierarchy pass the node to add/update
   * @param listToUpdate pass the hierarchy list to update
   * @returns HierarchyListItem[]
   */
    updateHierarchyList(hierarchy: HierarchyListItem, listToUpdate = [...this.hierarchyItems]): HierarchyListItem[] | any {
    // In case of siblings; update or push
    if(listToUpdate?.length && listToUpdate[0].level === hierarchy.level && listToUpdate[0].parentId === hierarchy.parentId) {
      return this.addOrUpdateHierarchy(listToUpdate, hierarchy);
    } else {
      return listToUpdate.map((listItem: HierarchyListItem) => {
        if(listItem.id === hierarchy.parentId && (hierarchy.level - listItem.level) === 1) {
          listItem.child = this.addOrUpdateHierarchy(listItem.child, hierarchy);
          return listItem;
        } else {
          listItem.child = this.updateHierarchyList(hierarchy, listItem.child);
          return listItem;
        }
      });
    }
  }

  /**
   * Add or update hierarchy based on the node id
   * @param listToUpdate pass the list to update
   * @param hierarchy pass the node to be updated
   * @returns HierarchyListItem[]
   */
  addOrUpdateHierarchy(listToUpdate: HierarchyListItem[], hierarchy: HierarchyListItem): HierarchyListItem[] {
    const index = listToUpdate.findIndex(item => item.id === hierarchy.id);
    index>-1? listToUpdate[index] = hierarchy: listToUpdate.push({...hierarchy});

    return listToUpdate;
  }


  /**
   * Method to re-order nodes in a hierarchy
   * @param dropEvent drop event
   * @param hierarchy pass the parent hierarchy
   */
  reOrderNode(dropEvent: CdkDragDrop<HierarchyListItem>, hierarchy: HierarchyListItem): void {
    moveItemInArray(hierarchy.child, dropEvent.previousIndex, dropEvent.currentIndex);
    this.hierarchyItems = this.updateHierarchyList(hierarchy);
    this.hierarchyItems = this.addOrderToHierarchyList(this.hierarchyItems);
    console.log(this.hierarchyItems)
  }

  addOrderToHierarchyList(hierarchyItems: HierarchyListItem[]) {
    return hierarchyItems.map((d, index)=> {
      d.order = index;
      d.child = this.addOrderToHierarchyList(d.child)
      return d;
    })
  }

  /**
   * Simple function to create arrays for looping in
   * template based on hierarchy level number
   * @param hierarchy hierarchy data
   * @returns array
   */
  getTabs(hierarchy: HierarchyListItem): any[] {
    const arr = [];
    arr.length = hierarchy.level;
    return arr;
  }

  saveUpdateStructure(hierarchy: HierarchyListItem): Observable<any> {
    const structure = new HierarchyListItem(hierarchy).getStructure();
    return this.coreService.saveUpdateStructure(structure);
  }

  transformStructureToHierarchy(structures: Structure[]): HierarchyListItem[] {
    const hierarchyItems = structures.map((struct) => this.convertToHierarchy(struct));
    return this.buildHierarchyListing(hierarchyItems, 0);
  }

  buildHierarchyListing(hierarchyItems: HierarchyListItem[], parent: number, level = 0): HierarchyListItem[] {
    const finalHierarchy: HierarchyListItem[] = [];
      hierarchyItems.forEach((item) => {
        if(item.parentId === parent) {
            const restHierarchyItems = hierarchyItems.filter((hie)=> hie.id !== item.id);
            const childrens = this.buildHierarchyListing(restHierarchyItems, item.id, level+1);
            if(childrens.length) {
              item.child = childrens;
            }
          item.level = level;
          finalHierarchy.push(item);
        }
      });

      console.log(finalHierarchy);
    return finalHierarchy;
  }

  /**
   * Method to convert a structure to hierarchy
   * @param structure pass the structure
   * @param level define a level of nesting
   * @returns HierarchyListItem
   */
  convertToHierarchy(structure: Structure, level: number = 0): HierarchyListItem {
    const hierarchy = new HierarchyListItem();
    hierarchy.setStructure(structure);
    if(level>-1) { hierarchy.level = level; };
    return hierarchy;
  }

  /**
   * get a hierarchy node based on hierarchy Id
   * @param hierarchyId pass the hierarchy Id
   * @param listOfHierarchies pass the list of hierarchy
   * @returns HierarchyListItem
   */
  getHierarchyByHierarchyId(hierarchyId: string | number, listOfHierarchies: HierarchyListItem[] = this.hierarchyItems): HierarchyListItem | any {
    let selectedHierarchy = null;
    listOfHierarchies.forEach((hierarchy) => {
      if(!selectedHierarchy) {
        if(hierarchy.id === (+hierarchyId)) {
          selectedHierarchy = hierarchy;
        } else {
          selectedHierarchy = this.getHierarchyByHierarchyId(hierarchyId, get(hierarchy, 'child', []));
        }
      }
    });

    return selectedHierarchy;
  }

}
