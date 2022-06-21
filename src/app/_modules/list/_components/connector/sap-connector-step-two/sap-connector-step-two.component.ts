import { TreeNode, ExampleFlatNode, TREE_DATA } from './../models/package-hierarchy.model';
import { ConnectorService } from './../services/connector.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-sap-connector-step-two',
  templateUrl: './sap-connector-step-two.component.html',
  styleUrls: ['./sap-connector-step-two.component.scss'],
})
export class SapConnectorStepTwoComponent implements OnInit {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<ExampleFlatNode, TreeNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TreeNode, ExampleFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: ExampleFlatNode | null = null;
  treeFlattener;
  treeControl;

  dataSource;
  /** The selection for checklist */
  checklistSelection = new SelectionModel<ExampleFlatNode>(true /* multiple */);

  constructor(public connectorService: ConnectorService) {
    this.treeFlattener = new MatTreeFlattener(
      this._transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<ExampleFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = TREE_DATA;
  }

  private _transformer = (node: TreeNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.id === node.id
        ? existingNode
        : new ExampleFlatNode();
    flatNode.name = node.name;
    flatNode.id = node.id;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  getLevel = (node: ExampleFlatNode) => node.level;

  isExpandable = (node: ExampleFlatNode) => node.expandable;

  getChildren = (node: TreeNode): TreeNode[] => node.children;

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  hasNoContent = (_: number, _nodeData: ExampleFlatNode) => _nodeData.name === '';

  ngOnInit(): void {}

  setCreateDate(event) {}

  setModifiedDate(event) {}

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: ExampleFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: ExampleFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: ExampleFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: ExampleFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: ExampleFlatNode): void {
    let parent: ExampleFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: ExampleFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: ExampleFlatNode): ExampleFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  filterFields(treeNodes: TreeNode[], value: string) {
    return treeNodes
      .map((d) => {
        if (d && d.children && d.children.length > 0) {
          d.children = this.filterFields(
            d.children.filter((f) => f),
            value
          );
          return d.children.length > 0 ? d : null;
        }
        return this.filterNode(d, value);
      })
      .filter((d) => d);
  }
  filterNode(treeNode: TreeNode, value: string) {
    if (treeNode && treeNode.name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
      return treeNode;
    }
    return null;
  }
}

// export class TreeNode {
//   id: string;
//   name: string;
//   checked: boolean;
//   children?: TreeNode[];
// }
// export class ExampleFlatNode {
//   expandable: boolean;
//   name: string;
//   id: string;
//   level: number;
// }

// export const TREE_DATA: TreeNode[] = [
//   {
//     id: '1',
//     name: 'Fruit',
//     checked: false,
//     children: [
//       { id: '2', name: 'Apple', checked: false, },
//       { id: '3', name: 'Banana', checked: false, },
//       { id: '4', name: 'Fruit loops', checked: false, },
//     ],
//   },
//   {
//     id: '5',
//     name: 'Vegetables',
//     checked: false,
//     children: [
//       {
//         id: '6',
//         name: 'Green',
//         checked: false,
//         children: [
//           { id: '7', name: 'Broccoli', checked: false, },
//           { id: '8', name: 'Brussels sprouts', checked: false, },
//         ],
//       },
//       {
//         id: '9',
//         name: 'Orange',
//         checked: false,
//         children: [
//           { id: '10', name: 'Pumpkins', checked: false, },
//           { id: '11', name: 'Carrots', checked: false, },
//         ],
//       },
//     ],
//   },
// ];
