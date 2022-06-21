import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

const TREE_DATA = [
  {
    name: 'Dateset',
    children: [{name: 'Dataset'}],
  },
  {
    name: 'Floc',
    children: [{name: 'Floc'}],
  },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'pros-data-model-hierarchy-level',
  templateUrl: './data-model-hierarchy-level.component.html',
  styleUrls: ['./data-model-hierarchy-level.component.scss']
})
export class DataModelHierarchyLevelComponent implements OnInit {

  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit() {}

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
}
