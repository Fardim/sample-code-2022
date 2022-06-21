import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFactory, ComponentFactoryResolver, ElementRef, EmbeddedViewRef, Injector, NgModuleRef, SimpleChanges, TemplateRef, ViewContainerRef, ViewRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ContainerRefDirective } from '@modules/shared/_directives/container-ref.directive';
import { MdoUiLibraryModule, TransientService } from 'mdo-ui-library';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HEIRARCHY_OPTIONS, HierarchyListItem, HierarchyService, HIERARCHYTYPES } from '../hierarchy-service/hierarchy.service';
import { EditLabelComponent, UpdateValue } from './edit-label/edit-label.component';

import { HierarchyListComponent } from './hierarchy-list.component';

describe('HierarchyListComponent', () => {
  let component: HierarchyListComponent;
  let fixture: ComponentFixture<HierarchyListComponent>;
  let hierarchyService: HierarchyService;
  let transientService: TransientService;
  let router: Router;
  const queryParams = { f: '1', update: true };
  const routeParams = { moduleId: '1005', fieldId: '1' };
  const panel = 'property-panel';
  const fakeActivatedRoute = {
    params: of(routeParams),
    queryParams: of(queryParams),
    fragment: of(panel),
    snapshot: {}
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HierarchyListComponent, EditLabelComponent ],
      imports: [AppMaterialModuleForSpec, MdoUiLibraryModule, RouterTestingModule],
      providers: [HierarchyService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyListComponent);
    component = fixture.componentInstance;
    hierarchyService = fixture.debugElement.injector.get(HierarchyService);
    transientService = fixture.debugElement.injector.get(TransientService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hierarchyOptions, should have an initial default value', () => {
    expect(component.hierarchyOptions).toEqual(HEIRARCHY_OPTIONS);
  });

  it('nodeInEditMode, should have an initial default value', () => {
    expect(component.nodeInEditMode).toEqual(null);
  });

  it('isActive, should check if a given node is active', () => {
    component.selectedStructureId = '1';
    expect(component.isActive({
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      child: [],
      parentId: 1,
    })).toBeTrue();
  });

  it('drop(), should call reOrderNode ', () => {
    spyOn(hierarchyService, 'reOrderNode');
    const dropEvent = {previousIndex: 0, currentIndex: 1} as CdkDragDrop<HierarchyListItem>;
    const hierarchy = {
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      child: [],
      parentId: 1,
    };
    component.drop(dropEvent, hierarchy);

    expect(hierarchyService.reOrderNode).toHaveBeenCalledWith(dropEvent, hierarchy);
  });

  it('renameHierarchy(), should core service to update structure', (done) => {
    spyOn( hierarchyService, 'saveUpdateStructure').and.returnValue(of({}));
    const hierarchy: HierarchyListItem = {
        id: 1,
        deleted: false,
        label: 'Header Data',
        level: 0,
        child: [],
        parentId: null,
      };
    component.renameHierarchy('test', hierarchy).then((res) => {
      expect(res).toBeTrue();
      done();
    });
  });

  it('renameHierarchy(), should reject with error from api', (done) => {
    spyOn( hierarchyService, 'saveUpdateStructure').and.returnValue(throwError('Invalid'));
    const hierarchy: HierarchyListItem = {
        id: 1,
        deleted: false,
        label: 'Header Data',
        level: 0,
        child: [],
        parentId: null,
      };
    component.renameHierarchy('test', hierarchy).catch((err) => {
      expect(err).toEqual('Invalid');
      done();
    });
  });

  it('selectHeirarchyOption(), should select the appropriate option and call the respective method from hierarchy service', () => {
    const hierarchy = {
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      moduleId: '1',
      child: [],
      parentId: 1
    };
    component.nextStructureId = 2;
    spyOn(hierarchyService, 'saveUpdateStructure').and.returnValue(of(null));
    spyOn(hierarchyService, 'createChild')
      .withArgs({ id: 1, deleted: false, label: 'Hierarchy 1', level: 1, moduleId: '1', child: [  ], parentId: 1 }, component.nextStructureId)
      .and.returnValue(hierarchy);
    spyOn(transientService, 'confirm');
    spyOn(hierarchyService, 'createSibling')
      .withArgs(component.nextStructureId)
      .and.returnValue(hierarchy);
    spyOn(component, 'updateHierarchyNode').withArgs(hierarchy).and.resolveTo(null);


    component.selectHeirarchyOption(HIERARCHYTYPES.SIBLING, hierarchy);
    expect(hierarchyService.createSibling).toHaveBeenCalled();

    component.selectHeirarchyOption(HIERARCHYTYPES.CHILD, hierarchy);
    expect(hierarchyService.createChild).toHaveBeenCalledWith(hierarchy, component.nextStructureId);

    component.selectHeirarchyOption('remove', hierarchy);
    expect(transientService.confirm).toHaveBeenCalled();
  });

  it('deleteHierarchy(), should delete hierarchy node', () => {
    const hierarchy = {
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      moduleId: '1',
      child: [],
      parentId: 1
    };
    spyOn(transientService, 'open').withArgs('ok', 'Dismiss');
    spyOn(component, 'emitValueChange').withArgs(true);
    spyOn(hierarchyService, 'deleteHierarchy').withArgs(hierarchy).and.returnValue(of({acknowledge: true, successMsg: 'ok'}));
    component.deleteHierarchy(hierarchy);
    expect(hierarchyService.deleteHierarchy).toHaveBeenCalledWith(hierarchy);
    expect(transientService.open).toHaveBeenCalledWith('ok', 'Dismiss');
    expect(component.emitValueChange).toHaveBeenCalledWith(true);
  })


  it('isBeingEdited(), should detect if a node is being edited', () => {
    component.nodeInEditMode = {
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      child: [],
      parentId: 1,
    };
    expect(component.isBeingEdited({
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      child: [],
      parentId: 1,
    })).toBeTrue();
  });

  it('getTabs(), should call heirarchy service method to get tabs array', () => {
    spyOn(hierarchyService, 'getTabs');
    const node = {
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      child: [],
      parentId: 1,
    }
    component.getTabs(node);
    expect(hierarchyService.getTabs).toHaveBeenCalledWith(node);
  });

  it('updateHierarchyNode(), should call core service to update hierarchy', (done) => {
    const node = {
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      child: [],
      parentId: 1,
    };

    spyOn(hierarchyService, 'saveUpdateStructure').withArgs(node).and.returnValue(of([]));
    component.updateHierarchyNode(node).then((res) => {
        expect(hierarchyService.saveUpdateStructure).toHaveBeenCalledWith(node);
        done();
    })
  });

  it('updateHierarchyNode(), should throw error', (done) => {
    const node = {
      id: 1,
      deleted: false,
      label: 'Hierarchy 1',
      level: 1,
      child: [],
      parentId: 1,
    };

    spyOn(hierarchyService, 'saveUpdateStructure').withArgs(node).and.returnValue(throwError('Invalid'));
    component.updateHierarchyNode(node).catch((err) => {
        expect(err).toEqual('Invalid');
        done();
    })
  });

  it('ngOnInit(), should call updateModuleId', () => {
    component.moduleId = '1004';
    component.ngOnInit();
    expect(hierarchyService.updatedModuleId).toEqual('1004');
  });

  it('updateModuleId(), should set updated module Id', () => {
    component.updateModuleId('1004');
    expect(hierarchyService.updatedModuleId).toEqual('1004');
  });

  it('activeNode', () => {
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
    hierarchyService.activeHierarchyNode = hierarchy;
    expect(component.activeNode).toEqual(hierarchy);
  });

  it('editCurrentNode(), should edit the selected node', () => {
    const componentfactoryRes = TestBed.inject(ComponentFactoryResolver);
    spyOn(componentfactoryRes, 'resolveComponentFactory').withArgs(EditLabelComponent);
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: 0,
      child: [],
      moduleId: '1',
      parentId: 0
    });

    spyOn(component, 'renameHierarchy').withArgs('ok', hierarchy).and.resolveTo(true);
    spyOn(component, 'emitValueChange').withArgs(true);
    spyOn(transientService, 'open').withArgs('Error while renaming hierarchy', 'Dismiss');

    const vcRef = new MockContainerRef();
    const container = new ContainerRefDirective(vcRef);
    expect(container).not.toBeNull();
    component.editCurrentNode(container, hierarchy);
    hierarchy.level = 1;
    expect(component.editCurrentNode(new ContainerRefDirective(vcRef), hierarchy)).not.toBeNull();
  });

  it('updateName(), should update the hierarchy name',() => {
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: 0,
      child: [],
      moduleId: '1',
      parentId: 0
    });

    const update = {
      currentValue: 'Header Data Modified',
      previousValue: 'Header Data'
    } as UpdateValue;
    spyOn(transientService, 'open').withArgs('Error while renaming hierarchy', 'Dismiss');
    spyOn(component, 'emitValueChange').withArgs(true);
    spyOn(hierarchyService, 'saveUpdateStructure').withArgs({...hierarchy, label: 'Header Data Modified'}).and.throwError('invalid')
    component.updateName(update, hierarchy);
    expect(hierarchyService.saveUpdateStructure).toHaveBeenCalledWith({...hierarchy, label: 'Header Data Modified'});
  });

  it('rename hierarchy should reject a promise in case of error', (done) => {
    const hierarchy = new HierarchyListItem({
      id: 1,
      deleted: false,
      label: 'Header Data',
      language: 'en',
      level: 0,
      child: [],
      moduleId: '1',
      parentId: 0
    });
    spyOn(hierarchyService, 'saveUpdateStructure').withArgs({...hierarchy, label: 'ok'}).and.throwError('invalid')
    spyOn(component, 'renameHierarchy').withArgs('ok', hierarchy).and.rejectWith('invalid');
    component.renameHierarchy('ok', hierarchy).catch((err) => {
      expect(err).toEqual('invalid');
      done();
    })
  });

  it('ngOnChanges(), should detect simple changes', () => {
    const changes: SimpleChanges = {
      moduleId: {
        previousValue: '1',
        currentValue: '2',
        firstChange: null,
        isFirstChange: null
      },
      hierarchyList: {
        previousValue: [],
        currentValue: [{}],
        firstChange: null,
        isFirstChange: null
      },
      selectedStructureId: {
        previousValue: '1',
        currentValue: '2',
        firstChange: null,
        isFirstChange: null
      }
    };
    component.moduleId = '1';
    component.ngOnChanges(changes);
    expect(component.moduleId).toEqual('2');
    expect(hierarchyService.updatedModuleId).toEqual('2');

    expect(component.hierarchyList.length).toEqual(1);
    expect(component.selectedStructureId).toEqual('2');

  });

  it('navigateToNode(), should navigate to the current selected node/structure', () => {
    spyOn(router, 'navigate');
    component.navigateToNode(1);
    expect(router.navigate).toHaveBeenCalled();
  });
});

export class MockContainerRef extends ViewContainerRef {
  get element(): ElementRef<any> {
    return null;
  }
  get injector(): Injector {
    return null;
  }
  get parentInjector(): Injector {
    return null;
  }
  clear(): void {
    return null;
  }
  get(index: number): ViewRef {
    return null;
  }
  get length(): number {
    return null;
  }
  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C> {
    return null;
  }
  createComponent<C>(componentFactory: ComponentFactory<C>, index?: number, injector?: Injector, projectableNodes?: any[][], ngModule?: NgModuleRef<any>): any {
    return {
      instance: {
        value: null,
        valueChange: of({
          currentValue: 'ok',
          previousValue: 'not ok'
        } as UpdateValue)
      }
    }
  }
  insert(viewRef: ViewRef, index?: number): ViewRef {
    return null;
  }
  move(viewRef: ViewRef, currentIndex: number): ViewRef {
    return null;
  }
  indexOf(viewRef: ViewRef): number {
    return null;
  }
  remove(index?: number): void {
    return null;
  }
  detach(index?: number): ViewRef {
    return null;
  }

}
