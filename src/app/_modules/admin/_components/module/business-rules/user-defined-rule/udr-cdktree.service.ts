import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UDRBlocksModel } from '../business-rules.modal';

export class ItemNode {
  children: ItemNode[];
  item: string;
  nodeId: string;
}
export class ItemNodeInfo {
  item: string;
  level: number;
  expandable = true;
  nodeId: string;
}

export enum BlockType {
  AND = 'AND',
  OR = 'OR',
  COND = 'COND'
}

@Injectable({
  providedIn: 'root'
})
export class UdrCdktreeService {

  public dataSource: BehaviorSubject<ItemNode[]> = new BehaviorSubject<ItemNode[]>([]);

  constructor() {}

  get data(): ItemNode[] {
    return this.dataSource.value;
  }

  initialize(blockType: BlockType, nodeId?:string) {
    const initialNode = blockType === BlockType.AND ? {'And Block':{condition_search: null}} : {'Or Block':{condition_search: null}};
    const data = this.buildFileTree(initialNode, 0, nodeId);

    // Notify the change.
    this.dataSource.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `ItemNode`.
   */
  buildFileTree(obj: {[key: string]: any}, level: number, nodeId?:string): ItemNode[] {
    return Object.keys(obj).reduce<ItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new ItemNode();
      node.item = key;
      node.nodeId = nodeId ? nodeId : String(new Date().getTime());

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /**
   * Use for update children (conditions on parent)
   * @param node node item that will update children
   * @param conlst which is the condition block list that we need to add inside Operator block
   */
  addConBlock(node: ItemNode, conlst: UDRBlocksModel[], isEditMode?:boolean) {
    const previousNodes = this.dataSource.value;
    if(node) {
      if(conlst) {
        if(isEditMode) {
          conlst.forEach(con=>{
            const frstBlock = node.children.filter(fil=> fil.children !== undefined)[0];
            const nodeItem = new ItemNode();
            nodeItem.item = con.blockDesc;
            nodeItem.nodeId = String(con.id);
            if(frstBlock) {
              node.children.splice(node.children.indexOf(frstBlock),0,nodeItem);
            } else {
              node.children.push(nodeItem);
            }

          });
        } else {
          const conNodeLst: ItemNode[] = [];
          const searchNode = node.children.filter(fill => fill.item === 'condition_search')[0];
          conNodeLst.push(searchNode);
          conlst.forEach(con=>{
            const nodeItem = new ItemNode();
            nodeItem.item = con.blockDesc;
            nodeItem.nodeId = String(con.id);
            conNodeLst.push(nodeItem);
          });

          // exiting ope blocks
          const array = node.children.filter(fill=> fill.children ? true : false);
          array.forEach(arr=> conNodeLst.push(arr));
          node.children = conNodeLst;
        }
      } else {
        node.children = [];
      }
    }
    this.dataSource.next(previousNodes);
  }

  insertOperatorBlocks(node: ItemNode, blockType: BlockType, levelSize: number, nodeId?: string) {
    const initialNode = blockType === BlockType.AND ? {'And Block':{condition_search: null}} : {'Or Block':{condition_search: null}};
    const data = this.buildFileTree(initialNode, levelSize, nodeId);
    node.children.push(data[0]);
    this.dataSource.next(this.data);
  }
}
