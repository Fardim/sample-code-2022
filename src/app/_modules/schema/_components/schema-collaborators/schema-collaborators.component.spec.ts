import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaCollaboratorsComponent } from './schema-collaborators.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { UserMdoModel, RolesModel, GroupHeaderModel, PermissionType, PermissionOn, SchemaDashboardPermission } from '@models/collaborator';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { SharedModule } from '@modules/shared/shared.module';

describe('SchemaCollaboratorsComponent', () => {
  let component: SchemaCollaboratorsComponent;
  let fixture: ComponentFixture<SchemaCollaboratorsComponent>;
  let schemaDetailsSer: SchemaDetailsService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SchemaCollaboratorsComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, ReactiveFormsModule, FormsModule, RouterTestingModule, SharedModule],
      providers: [
        SchemaDetailsService
      ]
    })
      .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaCollaboratorsComponent);
    component = fixture.componentInstance;
    schemaDetailsSer = fixture.debugElement.injector.get(SchemaDetailsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit, loaded pre required', (() => {
    component.searchCollCtrl = new FormControl('');
    component.collaboratorList = [
      {
        sno: '123',
        userMdoModel: {
          fullName: 'Ashish'
        }
      },
      {
        sno: '124',
        userMdoModel: {
          fullName: 'Ankush'
        }
      }
    ] as SchemaDashboardPermission[]

    spyOn(component, 'getCollaboratorPermission');
    component.ngOnInit();

    component.addCollaboratorFrmGrp.controls.addCollaboratorCtrl.setValue('ASHISH');
    expect(component.getCollaboratorPermission).toHaveBeenCalledWith('ASHISH', component.fetchCount);

    component.addCollaboratorFrmGrp.controls.addCollaboratorCtrl.setValue('');
    expect(component.getCollaboratorPermission).toHaveBeenCalledWith('', component.fetchCount);

    component.searchCollCtrl.setValue('ASH');
    component.collaboratorListOb.subscribe((res) => {
      expect(res.length).toEqual(1)
    });


    component.collaboratorList = [
      {
        sno: '123',
        rolesModel: {
          roleDesc: 'ADMIN'
        }
      },
      {
        sno: '1234',
        rolesModel: {
          roleDesc: 'ADMIN'
        }
      }
    ] as SchemaDashboardPermission[]
    component.searchCollCtrl = new FormControl('')

    component.ngOnInit();
    component.searchCollCtrl.setValue('ADMIN')

    component.collaboratorListOb.subscribe((res) => {
      expect(res.length).toEqual(2)
    });


    component.collaboratorList = [
      {
        sno: '123456',
        groupHeaderModel: {
          description: 'ABC'
        }
      },
      {
        sno: '123465',
        groupHeaderModel: {
          description: 'ABD'
        }
      }
    ] as SchemaDashboardPermission[];
    component.searchCollCtrl = new FormControl('');
    component.ngOnInit();

    component.searchCollCtrl.setValue('abc')
    component.collaboratorListOb.subscribe((res) => {
      expect(res.length).toEqual(1)
    });
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('getCollaboratorPermission(), should return for get all user details', async(() => {
    spyOn(schemaDetailsSer, 'getAllUserDetailsV2').and.returnValue(of({} as PermissionOn));
    component.getCollaboratorPermission('', 0);
    expect(schemaDetailsSer.getAllUserDetailsV2).toHaveBeenCalledWith('', 0);
  }));

  it('transformResponse(), should help for transform data', async(() => {
    // mock data
    const users: UserMdoModel[] = [
      { userId: 'harshit', email: 'harshit@gmail.com' } as UserMdoModel,
      { userId: 'admin', fullName: 'admin@gmail.com' } as UserMdoModel
    ];

    const roles: RolesModel[] = [
      { roleId: '23764782874', roleDesc: 'Developer' },
      { roleId: '2753745715', roleDesc: 'admin' }
    ];

    const groups: GroupHeaderModel[] = [
      { groupId: 267364727, description: 'Core Developer', groupIdAsStr: '267364727' }
    ];

    // call actual method
    const actualRes = component.transformResponse({ groups, roles, users });
    expect(actualRes.length).toEqual(3, 'Length should be 3 mean three groups user,roles and groups')
    expect(actualRes[0].childs.length).toEqual(users.length, 'User groups child length should be 2');
    expect(actualRes[1].childs.length).toEqual(roles.length, 'Roles groups child length should be 2');
    expect(actualRes[2].childs.length).toEqual(groups.length, 'Groups groups child length should be 1');
  }));

  it('displayWith(), should return selected collaborators description', async(() => {
    // mock data
    const selectedOption: SchemaDashboardPermission = new SchemaDashboardPermission();
    selectedOption.description = 'Harshit Jain';
    selectedOption.userid = 'harshit';

    // call actual method
    const actualRes = component.displaywith(selectedOption);
    const nullRes = component.displaywith(null);

    expect(actualRes).toEqual(selectedOption.description, 'Description should equals');
    expect(nullRes).toEqual(null);

  }));

  it('onSelectCollaborator(), after select collaborator for add', async(() => {
    // mock data
    component.addCollaboratorFrmGrp = new FormGroup({
      addCollaboratorCtrl: new FormControl('')
    });
    const selectedOption: SchemaDashboardPermission = new SchemaDashboardPermission();
    selectedOption.description = 'Harshit Jain';
    selectedOption.userid = 'harshit';
    selectedOption.permissionType = PermissionType.USER;
    selectedOption.groupid = 'refreshr2',
    selectedOption.roleId = 'ADM'

    const event = {
      option: {
        value: selectedOption
      }
    } as MatAutocompleteSelectedEvent;

    const users: UserMdoModel[] = [
      { userId: 'harshit', email: 'harshit@gmail.com' } as UserMdoModel,
      { userId: 'admin', email: 'admin@gmail.com' } as UserMdoModel
    ];

    const groups = [
      {
        groupIdAsStr: 'refreshR1'
      },
      {
        groupIdAsStr: 'refreshr2'
      }
    ] as GroupHeaderModel[];

    const roles= [
      {
        roleId: 'ADM',
        roleDesc: 'Admin'
      },
      {
        roleId: 'REV',
        roleDesc: 'Reviewer'
      }
    ] as RolesModel[]

    component.permissionOn = { users, groups, roles } as PermissionOn;

    // call actual method
    component.onSelectCollaborator(event);
    expect(component.selectedCollaborators.length).toEqual(1, 'After added successfully then length should be 1');

    selectedOption.permissionType = PermissionType.GROUP;
    component.onSelectCollaborator(event);
    expect(component.selectedCollaborators.length).toEqual(1, 'After added successfully then length should be 1');

    selectedOption.permissionType = PermissionType.ROLE;
    component.onSelectCollaborator(event);
    expect(component.selectedCollaborators.length).toEqual(1, 'After added successfully then length should be 1');

  }));

  it('getExistingCollaboratorDetails() , should return all collaborator detail by using schemaId ', async(() => {
    const schemaId = '87365726767288';
    component.schemaId = schemaId;
    const response: SchemaDashboardPermission[] = [];
    spyOn(schemaDetailsSer, 'getCollaboratorDetails').withArgs(schemaId).and.returnValue(of(response));
    component.getExistingCollaboratorDetails();
    expect(schemaDetailsSer.getCollaboratorDetails).toHaveBeenCalledWith(schemaId);
  }));

  it('paginateChip(), after pagination on chips', async(() => {

    component.selectedCollaborators = [];
    component.currentPageIdx = 1;

    component.paginateChip('prev');
    expect(component.possibleChips.length).toEqual(0, 'Possible chips length should be 0');

    // mock data
    component.selectedCollaborators = [{
      userid: 'harshit'
    },
    {
      roleId: 'developer'
    }
    ] as SchemaDashboardPermission[];
    component.currentPageIdx = 1;

    // call actual function
    component.paginateChip('prev');
    expect(component.possibleChips.length).toEqual(2, 'Possible chips length should be 2');


    // when we are pressing next
    component.currentPageIdx = 0;
    component.paginateChip('next');
    expect(component.possibleChips.length).toEqual(0, 'Possible chips length should be 0');

    component.currentPageIdx = -1;
    component.paginateChip('next');
    expect(component.possibleChips.length).toEqual(2, 'Possible chips length should be 2');

    // when we are not pressing prev/next
    component.currentPageIdx = 0;
    component.paginateChip();
    expect(component.possibleChips.length).toEqual(2, 'Possible chips length should be 2');


    component.selectedCollaborators = [];
    component.currentPageIdx = 0;
    component.paginateChip();
    expect(component.possibleChips.length).toEqual(0);

  }));

  it('remove(), method call at time remove from selected chips', async(() => {
    // mock data
    const removeAble = { userid: 'harshit', permissionType: PermissionType.USER } as SchemaDashboardPermission;
    component.selectedCollaborators = [{ userid: 'harshit' } as SchemaDashboardPermission, { roleId: 'developer' } as SchemaDashboardPermission, {} as SchemaDashboardPermission, {} as SchemaDashboardPermission];
    component.possibleChips = [{ userid: 'harshit' } as SchemaDashboardPermission, { roleId: 'developer' } as SchemaDashboardPermission, {} as SchemaDashboardPermission, {} as SchemaDashboardPermission];

    // call actual componenet method
    component.remove(removeAble);

    expect(component.selectedCollaborators.length).toEqual(3, 'Selected item should remove from selected collaborators');
    expect(component.possibleChips.length).toEqual(2, 'PossibleChips item should remove after selected collaborators');

    const removeAblerole = { roleId: 'harshit', permissionType: PermissionType.ROLE } as SchemaDashboardPermission;
    component.remove(removeAblerole);

    const removeAblegroup = { roleId: 'Demo_init', permissionType: PermissionType.GROUP } as SchemaDashboardPermission;
    component.remove(removeAblegroup);
  }));

  it('close(), should close the current router', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(component.close).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);
  });

  it('updatePermission(), should update collaborator detail', async(() => {
    // mock data
    const permission: SchemaDashboardPermission = new SchemaDashboardPermission();
    permission.userid = 'harshit';
    permission.isAdmin = true;
    const response: number[] = [];

    spyOn(schemaDetailsSer, 'createUpdateUserDetails').and.returnValue(of(response));

    // call actual method
    component.updatePermission(permission);
    expect(schemaDetailsSer.createUpdateUserDetails).toHaveBeenCalledWith([permission]);
  }));

  it('deleteCollaborator(), should delete Collaborator details', async(() => {
    spyOn(schemaDetailsSer, 'deleteCollaborator').withArgs(['3555358571']).and.returnValue(of({} as boolean));
    component.deleteCollaborator('3555358571');
    expect(schemaDetailsSer.deleteCollaborator).toHaveBeenCalledWith(['3555358571']);
  }));

  it('saveCollaborators(), should save Collaborator details', async(() => {
    // mock dta

    component.addCollaboratorFrmGrp = new FormGroup({
      isAdmin: new FormControl(false),
      isEditer: new FormControl(false),
      isViewer: new FormControl(false),
      isReviewer: new FormControl(false)
    })

    component.selectedCollaborators = [{ sno: 1234, userid: 'harshit', schemaId: '1235' }] as SchemaDashboardPermission[];
    spyOn(component, 'getExistingCollaboratorDetails');
    spyOn(schemaDetailsSer, 'createUpdateUserDetails').and.returnValue(of([1234]));

    // call actual method
    component.saveCollaborators();
    expect(schemaDetailsSer.createUpdateUserDetails).toHaveBeenCalled();
    component.addCollaboratorFrmGrp.patchValue({
      isAdmin: true,
      isEditer: true,
      isViewer: true,
      isReviewer: true
    })

    component.saveCollaborators();
    expect(schemaDetailsSer.createUpdateUserDetails).toHaveBeenCalled();
    expect(component.selectedCollaborators.length).toEqual(0);

  }));

  it('enablePreBtn(), should enable/disable prev button accordingly index', async () => {
    component.currentPageIdx = 2;
    expect(component.enablePreBtn).toEqual(false);
  });

  it('enableNextBtn(), should enable/disable next button accordingly index', async () => {
    component.currentPageIdx = 1;
    component.selectedCollaborators = [
      {
        sno: '12345'
      },
      {
        sno: '12346'
      }
    ] as SchemaDashboardPermission[];
    expect(component.enableNextBtn).toEqual(false);

    component.currentPageIdx = 0;
    component.selectedCollaborators = [
      {
        sno: '12345'
      },
      {
        sno: '12346'
      },
      {
        sno: '12347'
      }
    ] as SchemaDashboardPermission[];
    expect(component.enableNextBtn).toEqual(true);
  })
});
