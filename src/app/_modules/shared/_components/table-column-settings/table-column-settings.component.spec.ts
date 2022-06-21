// import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TableColumnSettingsComponent } from './table-column-settings.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { CrossMappingRule, DetailView, MetadataModel, SchemaTableAction, SchemaTableViewFldMap, SchemaTableViewRequest, TableActionViewType } from 'src/app/_models/schema/schemadetailstable';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { of } from 'rxjs';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SearchInputComponent } from '../search-input/search-input.component';
import { SchemaListDetails } from '@models/schema/schemalist';
import { Router } from '@angular/router';
import { UserService } from '@services/user/userservice.service';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { Userdetails } from '@models/userdetails';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { SchemaService } from '@services/home/schema.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { SchemaExecutionNodeType } from '@models/schema/schema-execution';

describe('TableColumnSettingsComponent', () => {
  let component: TableColumnSettingsComponent;
  let fixture: ComponentFixture<TableColumnSettingsComponent>;
  let schemaDetailsService: SchemaDetailsService;
  let router: Router;
  let userService: UserService;
  let sharedService: SharedServiceService;
  let schemalistService: SchemalistService;
  let schemaService: SchemaService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TableColumnSettingsComponent,
        SearchInputComponent
      ],
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule,
        MdoUiLibraryModule
      ],
      providers: [SchemaDetailsService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableColumnSettingsComponent);
    component = fixture.componentInstance;
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    router = TestBed.inject(Router);
    userService = fixture.debugElement.injector.get(UserService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    schemalistService = fixture.debugElement.injector.get(SchemalistService);
    schemaService = fixture.debugElement.injector.get(SchemaService);

    component.userDetails.userName = 'admin';
    component.schemaInfo = new SchemaListDetails();
    component.schemaInfo.createdBy = 'admin';
    component.data = {
      schemaId: 'schema'
    }

  });


  it('persistenceTableView(), should call http for save table column ', async(()=>{
    component.data = {schemaId:'327', variantId:'736472'};
    const selFld = [{fieldId : 'id', order: 0, editable: true, isEditable:true}];
    // mock data
    const schemaTableViewRequest: SchemaTableViewRequest = new SchemaTableViewRequest();
    schemaTableViewRequest.schemaId = component.data.schemaId;
    schemaTableViewRequest.variantId = component.data.variantId;
    schemaTableViewRequest.schemaTableViewMapping = selFld;

    spyOn(schemaDetailsService,'updateSchemaTableView').withArgs(schemaTableViewRequest).and.returnValue(of({}));
    // spyOn(router, 'navigate');

    component.persistenceTableView(selFld);
    expect(schemaDetailsService.updateSchemaTableView).toHaveBeenCalledWith(schemaTableViewRequest);
    // expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null }}]);
  }));


  it('isChecked(), is checked ', async(()=>{
    component.beforeSaveState = [{fieldId: 'MATL_TYPE', order: 0, editable: true,isEditable: true, isSelected: true}];
    const res = component.isChecked({fieldId:'MATL_TYPE'} as MetadataModel);
    expect(res).toEqual(true);
    expect(component.isChecked({fieldId: 'region'} as MetadataModel)).toBeFalsy();
  }));


  it('submitColumn(), submit selected columns ', async(()=>{
    component.fields = [{
      fieldId:'MATL_TYPE'
    } as SchemaTableViewFldMap];

    component.beforeSaveState  = [{fieldId : 'MATL_TYPE', order: 0, editable: true,isEditable:true, isSelected: true}];

    spyOn(component,'persistenceTableView');
    component.submitColumn();

    expect(component.submitColumn).toBeTruthy();

  }));

  it('should check if user has action config permission', () => {
    expect(component.isActionConfigAllowed).toEqual(true);
  });

  it('should get action view type description', () => {
    expect(component.getActionViewTypeDesc(TableActionViewType.ICON)).toEqual('Icon only');
    expect(component.getActionViewTypeDesc(TableActionViewType.ICON_TEXT)).toEqual('Icon and text');
    expect(component.getActionViewTypeDesc(TableActionViewType.TEXT)).toEqual('Text only');
  });

  it('should get primary actions', () => {
    component.actionsList = [
      {isPrimaryAction: true},
      {isPrimaryAction: false},
    ] as SchemaTableAction[];

    expect(component.primaryActions.length).toEqual(1);
    expect(component.secondaryActions.length).toEqual(1);
  });

  it('should add/remove custom action', async(() => {

    component.addCustomAction();
    expect(component.actionsList.length).toEqual(1);

  }));

  it('should save actions config', () => {

    spyOn(component, 'submitColumn');
    spyOn(schemaDetailsService, 'createUpdateSchemaActionsList').and.returnValue(of([]));

    let activeTabIndex = 2; // nop
    component.save(activeTabIndex);

    activeTabIndex = 0; // columns tab
    component.save(activeTabIndex);
    expect(component.submitColumn).toHaveBeenCalledTimes(1);

    activeTabIndex = 1; // actions tab
    component.save(activeTabIndex);
    expect(schemaDetailsService.createUpdateSchemaActionsList).toHaveBeenCalledWith(component.actionsList);

  });

  it('should close sidesheet', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null }}],  {queryParamsHandling: 'preserve'});
  })

  it('should close on init component', () => {

    spyOn(component, 'close');

    spyOn(userService, 'getUserDetails').and.returnValue(of(new Userdetails()))

    spyOn(sharedService, 'getChooseColumnData').and.returnValue(of(null));
    component.ngOnInit();


    expect(component.close).toHaveBeenCalledTimes(1);
    expect(userService.getUserDetails).toHaveBeenCalledTimes(1);

  });

  it('should not update on init component', () => {

    spyOn(component, 'getSchemaDetails');

    spyOn(userService, 'getUserDetails').and.returnValue(of(new Userdetails()));

    spyOn(sharedService, 'getChooseColumnData').and.returnValue(of({}));
    component.ngOnInit();

    expect(component.getSchemaDetails).toHaveBeenCalledTimes(0);
  });

  it('should update on init component', () => {

    spyOn(component, 'getSchemaDetails');

    spyOn(userService, 'getUserDetails').and.returnValue(of(new Userdetails()))


    spyOn(sharedService, 'getChooseColumnData').and.returnValue(of({editActive: true, selectedFields: [], tableActionsList: []}));
    component.ngOnInit();

    expect(component.getSchemaDetails).toHaveBeenCalledTimes(1);
    /* expect(component.headerDetails).toHaveBeenCalledTimes(1);
    expect(component.manageStateOfCheckBox).toHaveBeenCalledTimes(1); */

  });


  it('should update on field editable change', () => {

    component.data = {selectedFields: [{fieldId: 'region', editable: true}]};

    component.editableChange({fieldId: 'region'} as MetadataModel);
    component.editableChange({fieldId: 'matl_grp'} as MetadataModel);

    expect(component.data.selectedFields[0].editable).toBeTrue();
  });

  it('should check if field is editable', () => {

    component.data = {selectedFields: [{fieldId: 'region', editable: false}]};
    expect(component.isEditEnabled({fieldId: 'region'} as MetadataModel)).toBeFalse();

  });

  it('should get schema details', async(() => {

    const schemaInfo = new SchemaListDetails();
    schemaInfo.schemaId = 'schema';
    spyOn(schemalistService, 'getSchemaDetailsBySchemaId').and.returnValue(of(schemaInfo));

    component.getSchemaDetails();
    expect(component.schemaInfo.schemaId).toEqual('schema');

  }));

  it('should get schema details', async(() => {

    const schemaInfo = new SchemaListDetails();
    schemaInfo.schemaId = 'schema';
    schemaInfo.createdBy = 'admin';

    spyOn(component, 'getSchemaActions');
    spyOn(component, 'getCrossMappingRules');

    spyOn(schemalistService, 'getSchemaDetailsBySchemaId').and.returnValue(of(schemaInfo));
    component.getSchemaDetails();

    expect(component.getSchemaActions).toHaveBeenCalledTimes(1);
    expect(component.getCrossMappingRules).toHaveBeenCalledTimes(1);
  }));

  it('should get cross mapping rules', async(() => {

    const resp = [{sno: '1701'} as CrossMappingRule];
    spyOn(schemaDetailsService, 'getCrossMappingRules').and.returnValue(of(resp));

    component.getCrossMappingRules();
    expect(component.crossMappingRules).toEqual(resp);

  }));

  it('should get schema actions', async(() => {

    const resp = [{sno: '1701'} as SchemaTableAction];
    spyOn(schemaDetailsService, 'getTableActionsBySchemaId').and.returnValue(of(resp));

    component.getSchemaActions();
    expect(component.actionsList).toEqual(resp);

  }));

  it('should get schema actions', async(() => {

    spyOn(component, 'addCommonActions');
    spyOn(schemaDetailsService, 'getTableActionsBySchemaId').and.returnValue(of([]));
    component.getSchemaActions();

    expect(component.addCommonActions).toHaveBeenCalledTimes(1);

  }));

  it('should add common actions', () => {

    component.schemaInfo.schemaCategory = DetailView.DATAQUALITY_VIEW;
    component.addCommonActions();
    expect(component.actionsList.length).toEqual(2);
  });

  it('should update on action change', () => {
    component.addCustomAction();
    component.actionChanged(0, 'actionText', 'new text');
    expect(component.actionsList[0].actionText).toEqual('new text');
  });

  it('should save actions config', async(() => {

    spyOn(component, 'close');
    spyOn(schemaDetailsService, 'createUpdateSchemaActionsList').and.returnValue(of([]));

    component.saveTableActionsConfig();
    expect(component.close).toHaveBeenCalledTimes(1);

  }));

  it('should remove actions after confirmation', () => {

    spyOn(schemaDetailsService, 'deleteSchemaTableAction').and.returnValue(of());

    component.addCustomAction();
    component.removeActionAfterConfirm('no', 0);
    expect(component.actionsList.length).toEqual(1);

    component.removeActionAfterConfirm('yes', 0);
    expect(component.actionsList.length).toEqual(0);

    component.addCustomAction();
    component.actionsList[0].sno = '1701';
    component.removeActionAfterConfirm('yes', 0);
    expect(schemaDetailsService.deleteSchemaTableAction).toHaveBeenCalledTimes(1);

  });

  it('should not edit primary action text', () => {
    component.actionsList = [{actionText: 'Approve', isCustomAction: false} as SchemaTableAction];
    component.editActionText(0);
    expect(component.previousActionText).toBeFalsy();
  });

  it('should handle drop event', () => {

    const previousContainer = {data: ['fields']} as CdkDropList<string[]>;
    const event = {
      previousIndex: 0,
      currentIndex: 1,
      item: undefined,
      container: undefined,
      previousContainer,
      isPointerOverContainer: true,
      distance: { x: 0, y: 0 }} as CdkDragDrop<string[]>;

      component.drop(event);
      expect(event.previousContainer).toEqual(previousContainer);

  });

  it(`selectionChange(), should update checkbox state ... `, async(()=>{
    // mock data
    component.fields = [{fieldId: 'MATL_TYPE', order: 0, editable: true,isEditable: true}];
    component.beforeSaveState = [{fieldId: 'MATL_TYPE', order: 0, editable: true,isEditable: true}];

    component.selectionChange(true , {fieldId:'MATL_TYPE'} as MetadataModel);

    expect(component.beforeSaveState[0].isSelected).toEqual(true);
    expect(component.beforeSaveState[0].isEditable).toEqual(true);

    component.selectionChange(true,{fieldId:'MATL_GRP'} as MetadataModel);

    expect(component.beforeSaveState.length).toEqual(2, 'After push the length should be 2');

  }));

  it(`getFields(), get fields based on nodeid and nodetype`, async(()=>{
    // mock data
    component.data.activeNode = { nodeId: 'header', nodeType: 'HEADER'};
    component.data.schemaId = '3242323423';
    component.data.variantId = '0';

    spyOn(schemaService,'getallFieldsbynodeId').withArgs(component.data && component.data.activeNode ? component.data.activeNode.nodeType : SchemaExecutionNodeType.HEADER,
      component.data && component.data.activeNode ? component.data.activeNode.nodeId : 'header', component.data.schemaId, component.data.variantId, component.ftchCnt,'',false).and
      .returnValue(of({selectedFields:[{
        editable:true,
        fieldId: 'MATL_TYPE',
        isEditable: true,
        order:0,
        isSelected:true
      }], unselectedFields:[{
        fieldId: 'MATL_GRP'
      } as MetadataModel]}));

    component.getFields('', false);
    expect(schemaService.getallFieldsbynodeId).toHaveBeenCalled();

  }));

  it('keepScrolling(), get more fields based on scroll', async(()=>{
    spyOn(component,'getFields');

    component.keepScrolling();
    expect(component.ftchCnt).toEqual(1);
    expect(component.getFields).toHaveBeenCalled();
  }));

  it('fldTrackBy(), track the fields ', async(()=>{
    expect(component.fldTrackBy({fieldId:'MATL_TYPE'} as SchemaTableViewFldMap)).toEqual('MATL_TYPE');
    expect(component.fldTrackBy({} as SchemaTableViewFldMap)).toBeNull();
  }));

});