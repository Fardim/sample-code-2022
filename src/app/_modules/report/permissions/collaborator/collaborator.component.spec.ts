import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorComponent } from './collaborator.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportDashboardPermission } from '@models/collaborator';
import { SharedModule } from '@modules/shared/shared.module';

describe('CollaboratorComponent', () => {
  let component: CollaboratorComponent;
  let fixture: ComponentFixture<CollaboratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaboratorComponent ],
      imports:[ MdoUiLibraryModule, AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule, SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaboratorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should initilize pre required ',async(()=>{
    // mock data
    const data:ReportDashboardPermission = new ReportDashboardPermission();
    data.isViewable = true; data.isEditable = true; data.isDeleteable = true;

    component.collaborator = data;
    // call actual method
    component.ngOnInit();

    const expectedData = {isViewable: true, isEditable: true, isDeleteable: true};

    expect(component.permissionFrmGrp.value).toEqual(expectedData, 'Controls should equals');

    // mock Data
    const response: ReportDashboardPermission = new ReportDashboardPermission();
    response.roleId = '657658';
    component.collaborator = response;
    // call actual method
    component.ngOnInit();

    const expected = {isViewable: false, isEditable: false, isDeleteable: false};

    expect(component.permissionFrmGrp.value).toEqual(expected, 'Controls should equals');

  }));

  it('updateEmit(), should emit for update request',async(()=>{

    component.updateEmit();

    expect(component.isEditMode).toEqual(false, 'After click on update tiles should be in view mode');
  }));

  it('deleteEmit(), should emit for delete request',async(()=>{
    // mock data
    const data: ReportDashboardPermission = new ReportDashboardPermission();
    data.permissionId = 793729260;
    component.collaborator = data;

    // call actual method
    component.deleteEmit();
    expect(component.deleteEmit).toBeTruthy();
  }));

  it('editPermission(), should edit permission',async(()=>{
    const data: ReportDashboardPermission = new ReportDashboardPermission();
    data.showEditMode = false;
    component.collaborator = data;
    const editPermissionSpy =  spyOn(component.editPermissionEmit, 'emit');

    component.editPermission();
    expect(editPermissionSpy).toHaveBeenCalledWith(component.collaborator);
    expect(component.collaborator.showEditMode).toEqual(true);
    expect(component.isEditDisplay).toEqual(false);
  }));
});
