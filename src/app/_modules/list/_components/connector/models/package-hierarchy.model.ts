
export class TreeNode {
  id: string;
  name: string;
  checked: boolean;
  children?: TreeNode[];
}
export class ExampleFlatNode {
  expandable: boolean;
  name: string;
  id: string;
  level: number;
}

export const TREE_DATA: TreeNode[] = [
  {
    id: '1',
    name: 'Fruit',
    checked: false,
    children: [
      { id: '2', name: 'Apple', checked: false, },
      { id: '3', name: 'Banana', checked: false, },
      { id: '4', name: 'Fruit loops', checked: false, },
    ],
  },
  {
    id: '5',
    name: 'Vegetables',
    checked: false,
    children: [
      {
        id: '6',
        name: 'Green',
        checked: false,
        children: [
          { id: '7', name: 'Broccoli', checked: false, },
          { id: '8', name: 'Brussels sprouts', checked: false, },
        ],
      },
      {
        id: '9',
        name: 'Orange',
        checked: false,
        children: [
          { id: '10', name: 'Pumpkins', checked: false, },
          { id: '11', name: 'Carrots', checked: false, },
        ],
      },
    ],
  },
];
