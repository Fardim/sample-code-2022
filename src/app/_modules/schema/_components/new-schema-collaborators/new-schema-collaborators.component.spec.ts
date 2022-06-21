import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSchemaCollaboratorsComponent } from './new-schema-collaborators.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { of } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { SharedModule } from '@modules/shared/shared.module';
import { UserMdoModel } from '@models/collaborator';
import { GlobaldialogService } from '@services/globaldialog.service';

const mockDialogRef = {
    close: jasmine.createSpy('close')
};
describe('NewSchemaCollaboratorsComponent', () => {
    let component: NewSchemaCollaboratorsComponent;
    let fixture: ComponentFixture<NewSchemaCollaboratorsComponent>;
    let usersSpy;
    let globalDialogService: GlobaldialogService;
    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                NewSchemaCollaboratorsComponent,
                SearchInputComponent
            ],
            imports: [ MdoUiLibraryModule,
                HttpClientTestingModule,
                HttpClientModule,
                MatSnackBarModule,
                AppMaterialModuleForSpec,
                ReactiveFormsModule,
                SharedModule
            ],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: FormBuilder, useValue: formBuilder },

                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {selectedSubscibersList: ['test']} },
                SchemaDetailsService
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewSchemaCollaboratorsComponent);
        component = fixture.componentInstance;
        globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
        usersSpy = spyOn(component.schemaDetailsService, 'getAllUserDetails').and.callFake(() => {
            return of({
                users: [{
                    userId: null,
                    userName: 'abhilash',
                    fName: 'Abhilash',
                    lName: 'Rajoria',
                    pwd: null,
                    email: 'abhilash.rajoria@prospecta.com',
                    roles: null,
                    status: null,
                    deptId: null,
                    clientId: null,
                    lang: null,
                    application: null,
                    stage: null,
                    dateFormat: null,
                    sso: null,
                    imgUrl: null,
                    ubstitueUse: null,
                    UserStartDat: null,
                    sUserEnddate: null,
                    subsActive: null,
                    keepCopy: null,
                    failedLoginAttempts: 0,
                    noOfLogins: 0,
                    passwordActiveDate: null,
                    fullName: 'Abhilash Rajoria',
                    isPasswordSet: 0,
                    refreshToken: null,
                    adminAccess: 0,
                    digiSignSNO: null,
                    password: null,
                    isServiceAccount: false,
                    selfServiceUserModel: null,
                    userMultiRoleModels: null,
                    userPasswordModel: null,
                    selfService_Remote_Ob: null
                }],
                roles: [],
                groups: []
            })
        })
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call service to get collaobrators', async () => {
        component.getCollaborators('a',0);
        expect(usersSpy).toHaveBeenCalledWith('a',0);
    });

    it('shortName(), should return initials', async() => {
        let fName = 'Ashish';
        let lName = 'Goyal';

        let res = component.shortName(fName, lName);
        expect(res).toEqual('AG');

        fName = '';
        lName = 'Kumar';

        res = component.shortName(fName, lName);
        expect(res).toEqual('');
    });

    it('markSelectedSubscribers(), should mark subscribers', async() => {
        const allSubscribers = [
            {
                email: 'ashish@gmail.com',
                fullName: 'ashish goyal',
                lName: 'goyal',
                userName: 'GoyalAshish'
            },
            {
                email: 'ashish.goyal@prospecta.com',
                fullName: 'Ashish kumar Goyal',
                lName: 'Goyal',
                userName: 'Ashishkr'
            }
        ] as UserMdoModel[];

        const selectedSubscribers = [
            {
                userName: 'Ashishkr'
            },
            {
                userName: 'AshishKumarGoyal'
            }
        ] as any[];

        let res = component.markSelectedSubscribers(allSubscribers, selectedSubscribers);
        expect(res.length).toEqual(2);

        selectedSubscribers.length = 0;
        res = component.markSelectedSubscribers(allSubscribers, selectedSubscribers);
        expect(res.length).toEqual(2);
    });

    it('addOrDeleteCollaborator(), should add/del collaborator', async()=>{
        component.selectedCollaborators = [
            {
                email: 'ashish@gmail.com',
                userName: 'AshishGoyal',
                fName: 'Ashish',
                lName: 'Goyal',
                fullName: 'Ashish Kumar Goyal'
            }
        ] as UserMdoModel[];

        const collaborator = {
            userName: 'AshishkGoyal'
        } as UserMdoModel;

        component.addOrDeleteCollaborator(collaborator);

        expect(component.selectedCollaborators.length).toEqual(2);

        collaborator.userName = 'AshishGoyal';
        component.addOrDeleteCollaborator(collaborator);
        expect(component.selectedCollaborators.length).toEqual(1);
    });

    it('openSubscriberInviteDialog(), should open subscriber invitation dialog', async() => {
        spyOn(globalDialogService, 'openDialog');
        component.openSubscriberInviteDialog();

        expect(globalDialogService.openDialog).toHaveBeenCalled();
    })
});

