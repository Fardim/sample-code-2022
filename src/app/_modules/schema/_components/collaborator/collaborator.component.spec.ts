import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorComponent } from './collaborator.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SchemaDashboardPermission } from '@models/collaborator';
import { SharedModule } from '@modules/shared/shared.module';

describe('CollaboratorComponent', () => {
  let component: CollaboratorComponent;
  let fixture: ComponentFixture<CollaboratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaboratorComponent ],
      imports:[AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule, SharedModule],
      providers: [FormBuilder]
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
    const data:SchemaDashboardPermission = new SchemaDashboardPermission();
    data.isAdmin = true;
    data.isViewer = true;
    data.isEditer = true;
    data.isReviewer = true;

    component.collaborator = data;
    // call actual method
    component.ngOnInit();

    const expectedData = {isAdmin: true, isViewer: true, isEditer: true, isReviewer: true};

    expect(component.permissionFrmGrp.value).toEqual(expectedData, 'Controls should equals');

    // mock Data
    const response:SchemaDashboardPermission = new SchemaDashboardPermission();
    response.roleId = '657658';
    component.collaborator = response;
    // call actual method
    component.ngOnInit();

    const expected = {isAdmin: false, isViewer: false, isEditer: false, isReviewer: false};

    expect(component.permissionFrmGrp.value).toEqual(expected, 'Controls should equals');


    component.ngOnInit();
    component.permissionFrmGrp.controls.isAdmin.setValue(true);
    expect(component.permissionFrmGrp.controls.isAdmin.value).toEqual(true);

    component.permissionFrmGrp.controls.isAdmin.setValue(false);
    expect(component.permissionFrmGrp.controls.isAdmin.value).toEqual(false);

    component.permissionFrmGrp.controls.isViewer.setValue(true);
    expect(component.permissionFrmGrp.controls.isViewer.value).toEqual(true);

    component.permissionFrmGrp.controls.isEditer.setValue(true);
    expect(component.permissionFrmGrp.controls.isEditer.value).toEqual(true);

    component.permissionFrmGrp.controls.isReviewer.setValue(true);
    expect(component.permissionFrmGrp.controls.isReviewer.value).toEqual(true);

  }));


  it('updateEmit(), should emit for update request',async(()=>{

    component.updateEmit();

    expect(component.isEditMode).toEqual(false, 'After click on update tiles should be in view mode');
  }));

  it('deleteEmit(), should emit for delete request',async(()=>{
    // mock data
    const data:SchemaDashboardPermission = new SchemaDashboardPermission();
    data.sno = 793729260;
    component.collaborator = data;

    // call actual method
    component.deleteEmit();
    expect(component.deleteEmit).toBeTruthy();
  }));
});
