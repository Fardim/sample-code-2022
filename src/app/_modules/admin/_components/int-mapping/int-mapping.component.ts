import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA2: FoodNode[] = [
  {
    name: 'CNTRL-ControlData',
    children: [
      {name: 'SNDPRT-LS'},
      {name: 'Banana'},
      {name: 'Fruit loops'},
    ]
  }, {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [
          {name: 'Broccoli'},
          {name: 'Brussel sprouts'},
        ]
      }, {
        name: 'Orange',
        children: [
          {name: 'Pumpkins'},
          {name: 'Carrots'},
        ]
      },
    ]
  },
];
const TREE_DATA: FoodNode[] = [
  {
    name: 'CNTRL-ControlData',
    children: [
      {name: 'SNDPRT-LS'},
      {name: 'Banana'},
      {name: 'Fruit loops'},
    ]
  }, {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [
          {name: 'Broccoli'},
          {name: 'Brussel sprouts'},
        ]
      }, {
        name: 'Orange',
        children: [
          {name: 'Pumpkins'},
          {name: 'Carrots'},
        ]
      },
    ]
  },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'pros-int-mapping',
  templateUrl: './int-mapping.component.html',
  styleUrls: ['./int-mapping.component.scss']
})
export class IntMappingComponent implements OnInit {

  treeControl: FlatTreeControl<ExampleFlatNode>;
  treeFlattener: MatTreeFlattener<FoodNode, ExampleFlatNode>;
  dataSource: MatTreeFlatDataSource<FoodNode, ExampleFlatNode>;
  dataSource2: MatTreeFlatDataSource<FoodNode, ExampleFlatNode>;

  constructor() {
    this.treeControl = new FlatTreeControl<ExampleFlatNode>(node => node.level, node => node.expandable);
    this.treeFlattener = new MatTreeFlattener(
      (node: FoodNode, level: number) => {
        return {
          expandable: !!node.children && node.children.length > 0,
          name: node.name,
          level
        };
      },
      node => node.level,
      node => node.expandable,
      node => node.children
    );
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource2 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = TREE_DATA;
    this.dataSource2.data = TREE_DATA2;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  // hasChild2 = (_: number, node2: ExampleFlatNode2) => node2.expandable2;


  ngOnInit() {
  }

}
