import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreService } from '@services/core/core.service';
import { BehaviorSubject, of } from 'rxjs';

import { HierarchyListItem, HierarchyService, Structure } from './hierarchy.service';

describe('HierarchyService', () => {
  let service: HierarchyService;
  let coreService: CoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreService],
      imports: [HttpClientModule, RouterTestingModule]
    });
    service = TestBed.inject(HierarchyService);
    coreService = TestBed.inject(CoreService);
    service.hierarchyList = new BehaviorSubject([new HierarchyListItem()]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('hierarchyItems, should get and set hierarchyItems list', () => {
    service.hierarchyItems = [];
    expect(service.hierarchyItems.length).toEqual(0);
    const hierarchy = new HierarchyListItem();
    hierarchy.id = 2;
    hierarchy.label = 'Test'
    service.hierarchyItems = [hierarchy];
    expect(service.hierarchyItems.length).toEqual(1);
  });

  it('deleteHierarchy, should call delete hierarchy service', (done) => {
    const hierarchy: HierarchyListItem = {
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      child: [],
      parentId: 1,
    }
    spyOn(coreService, 'deleteStructure').withArgs(hierarchy.moduleId, hierarchy.id).and.returnValue(of({
      successMsg: 'Success'
    }));
    const deleteSUb = service.deleteHierarchy(hierarchy);
    deleteSUb.subscribe((res) => {
      expect(coreService.deleteStructure).toHaveBeenCalledWith(hierarchy.moduleId, hierarchy.id);
      done();
    });
  });

  it('createChild(), should create a child node', () => {
    const hierarchy: HierarchyListItem[] = [
      {
        id: 1,
        deleted: false,
        label: 'Header Data',
        level: 0,
        child: [
          {
            id: 1,
            deleted: false,
            label: 'Hierarchy 1',
            level: 1,
            child: [],
            parentId: 1,
          }
        ],
        parentId: null,
      }
    ];

    service.hierarchyItems = hierarchy;
    expect(service.hierarchyItems[0].child.length).toEqual(1);
    const child = service.createChild(service.hierarchyItems[0], 2);
    const list = service.updateHierarchyList(child);
    service.hierarchyItems = list;
    expect(service.hierarchyItems[0].child.length).toEqual(2);
  });

  it('createSibling(), should create a sibling node', () => {
    const hierarchy: HierarchyListItem[] = [
      {
        id: 1,
        deleted: false,
        label: 'Header Data',
        level: 0,
        child: [
          {
            id: 1,
            deleted: false,
            label: 'Hierarchy 1',
            level: 1,
            child: [],
            parentId: 1,
          }
        ],
        parentId: null,
      }
    ];

    service.hierarchyItems = hierarchy;
    expect(service.hierarchyItems[0].child.length).toEqual(1);
    const sibling = service.createSibling(2);
    const list = service.updateHierarchyList(sibling);
    service.hierarchyItems = list;
    expect(service.hierarchyItems[0].child.length).toEqual(2);
  });

  it('addOrUpdateHierarchy(), should update update existing hierarchy list', () => {
    const hierarchy: HierarchyListItem[] = [
      {
        id: 1,
        deleted: false,
        label: 'Header Data',
        level: 1,
        child: [],
        parentId: null,
      }
    ];
    expect(hierarchy[0].label).toEqual('Header Data');

    const modified = service.addOrUpdateHierarchy(hierarchy, {
      id: 1,
      deleted: false,
      label: 'Modified Label',
      level: 1,
      child: [],
      parentId: null
    });

    expect(modified[0].label).toEqual('Modified Label');
  });

  it('reOrderNode(), change the sort order of nodes in a list', () => {
    service.hierarchyItems = [
      {
        id: 1,
        deleted: false,
        label: 'Header Data',
        level: 0,
        child: [
          {
            id: 1,
            deleted: false,
            label: 'Hierarchy 1',
            level: 1,
            child: [],
            parentId: 1
          },
          {
            id: 2,
            deleted: false,
            label: 'Hierarchy 2',
            level: 1,
            child: [],
            parentId: 1
          }
        ],
        parentId: null
      }
    ];
    const highList: HierarchyListItem[] = service.hierarchyItems;
    expect(highList[0].child[0].label).toEqual('Hierarchy 1');
    const dropEvent = {
      previousIndex: 0,
      currentIndex: 1
    };
    service.reOrderNode(dropEvent as CdkDragDrop<HierarchyListItem>, highList[0]);
    expect(service.hierarchyItems[0].child[0].label).toEqual('Hierarchy 2');
  });

  it('getTabs(), should return array of given size', () => {
      expect(service.getTabs({
        id: 1,
        deleted: false,
        label: 'Header Data',
        level: 1,
        child: [],
        parentId: null
      }).length).toEqual(1);
  });

  it('HierarchyListItem class, should instantiate a hierarchy element', () => {
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: 1,
      child: [],
      moduleId: '1',
      parentId: 0
    });

    expect(hierarchy.id).toEqual(1);
    expect(hierarchy.label).toEqual('Header Data');
    expect(hierarchy.moduleId).toEqual('1');
    expect(hierarchy.language).toEqual('en');
    expect(hierarchy.parentId).toEqual(0);
  });

  it('HierarchyListItem class, should instantiate a hierarchy element', () => {
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: null,
      child: [],
      moduleId: '1',
      parentId: 0,
      isHeader: false
    });

    const structure: Structure = {
      isHeader: false,
      structureId: 1,
      language: 'en',
      moduleId: '1',
      parentStrucId: 0,
      strucDesc: 'Header Data',
      order: null
    }

    expect(hierarchy.getStructure()).toEqual(structure);
  });

  it('HierarchyListItem class, should instantiate a hierarchy element 2', () => {
    const hierarchy = new HierarchyListItem();
    const structure: Structure = {
      isHeader: false,
      structureId: 1,
      language: 'en',
      moduleId: '1',
      parentStrucId: 0,
      strucDesc: 'Header Data',
      order: null
    }

    hierarchy.setStructure(structure);
    expect(hierarchy.id).toEqual(1);
    expect(hierarchy.label).toEqual('Header Data');
    expect(hierarchy.moduleId).toEqual('1');
    expect(hierarchy.language).toEqual('en');
    expect(hierarchy.parentId).toEqual(0);
  });

  it('hierarchyListSubscription, should return Observable for subscribing to hierarchyList changes', (done) => {
    service.hierarchyItems = [];
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: null,
      child: [],
      moduleId: '1',
      parentId: 0
    });

    service.hierarchyListSubscription.subscribe((res) => {
      if(res?.length) {
        expect(res.length).toEqual(1);
      }
      done();
    });

    service.hierarchyItems = [hierarchy];
  });

  it('activeHierarchyNode, should set and get the active node', () => {
    service.activeHierarchyNode = null;
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: null,
      child: [],
      moduleId: '1',
      parentId: 0
    });

    expect(service.activeHierarchyNode).toBeNull();
    service.activeHierarchyNode = hierarchy;
    expect(service.activeHierarchyNode).toBeTruthy();
  })

  it('activeNodeSubscription, should get the active node subscription', (done) => {
    service.activeHierarchyNode = null;
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: null,
      child: [],
      moduleId: '1',
      parentId: 0
    });

    service.activeNodeSubscription.subscribe((res) => {
      if(res) {
        expect(res).toEqual(hierarchy);
        expect(service.isActive(hierarchy)).toBeTrue();
      }
      done();
    });

    service.activeHierarchyNode = hierarchy;
  })

  it('updatedModuleId, should set and get the updated Module Id', () => {
    service.updatedModuleId = '123';
    expect(service.updatedModuleId).toEqual('123');
  })

  it('saveUpdateStructure, should call core service and return an Observable', () => {
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: null,
      child: [],
      moduleId: '1',
      parentId: 0,
      isHeader: false,
    });

    const structure: Structure = {
      isHeader: false,
      structureId: 1,
      language: 'en',
      moduleId: '1',
      parentStrucId: 0,
      strucDesc: 'Header Data',
      order: null
    };

    spyOn(coreService, 'saveUpdateStructure').withArgs(structure).and.returnValue(of(null));
    service.saveUpdateStructure(hierarchy);
    expect(coreService.saveUpdateStructure).toHaveBeenCalledWith(structure);
  })

  it('hierarchy, should convert a structure to hierarchy', () => {
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: 0,
      child: [],
      moduleId: '1',
      parentId: 0,
      isHeader: false
    });

    const structure: Structure = {
      isHeader: false,
      structureId: 1,
      language: 'en',
      moduleId: '1',
      parentStrucId: 0,
      strucDesc: 'Header Data',
      order: null
    };

    expect(service.convertToHierarchy(structure)).toEqual(hierarchy);
  });

  it('transformStructureToHierarchy(), should transform structure to hierarchy', () => {
    const structures: Structure[] = [
      {
        isHeader: true,
        structureId: 1,
        language: 'en',
        moduleId: '1003',
        parentStrucId: 0,
        strucDesc: 'test parent'
      },
      {
        isHeader: false,
        structureId: 2,
        language: 'en',
        moduleId: '1003',
        parentStrucId: 1,
        strucDesc: 'test child'
      }
    ];

    const hierarchies = service.transformStructureToHierarchy(structures);
    expect(hierarchies.length).toEqual(1);
    expect(hierarchies[0].child.length).toEqual(1);
  })
});
