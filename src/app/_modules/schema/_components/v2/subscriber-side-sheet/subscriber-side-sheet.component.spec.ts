import { MdoUiLibraryModule } from 'mdo-ui-library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SubscriberSideSheetComponent } from './subscriber-side-sheet.component';
import { of, throwError } from 'rxjs';
import { PermissionOn, SchemaDashboardPermission } from '@models/collaborator';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

describe('SubscriberSideSheetComponent', () => {
  let component: SubscriberSideSheetComponent;
  let fixture: ComponentFixture<SubscriberSideSheetComponent>;
  let router: Router;
  let schemaDetailsServiceSpy: SchemaDetailsService;
  let sharedService: SharedServiceService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriberSideSheetComponent, SearchInputComponent],
      imports: [ MdoUiLibraryModule,
        AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule
      ],
      providers: [{
        provide: ActivatedRoute,
        useValue: {params: of({ moduleId: '1005', schemaId: '1701'})}
      }]
    })
      .compileComponents();
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriberSideSheetComponent);
    component = fixture.componentInstance;
    schemaDetailsServiceSpy = fixture.debugElement.injector.get(SchemaDetailsService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close(), should close the sidesheet', () => {
    component.outlet = 'sb';
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { [component.outlet]: null } }])
  })

  it('getSubscribersBySchemaId(), should get subscriber details according to schema id', async () => {
    component.schemaId = '8738297834';
    spyOn(schemaDetailsServiceSpy, 'getCollaboratorDetails').withArgs(component.schemaId).and.returnValue(of({} as SchemaDashboardPermission[]));
    const subscriberData: SchemaDashboardPermission[] = [
      {
        userid: 'Ashish'
      } as SchemaDashboardPermission
    ]
    component.subscribers = [
      {
        userName: 'AshishGoyal'
      }
    ]
    component.collaboratorData = subscriberData;
    component.getSubscribersBySchemaId(component.schemaId);
    expect(component.subscribers.length).toEqual(1);
    expect(schemaDetailsServiceSpy.getCollaboratorDetails).toHaveBeenCalledWith(component.schemaId);
  })

  it('getCollaborators(), should get all collaborators', async () => {
    const queryString = '';

    const response: PermissionOn = {
      users: [
        {
          userId: 'Ashish',
          userName: 'Ashishkr',
          fName: 'Ashish',
          lName: 'Goyal',
          fullName: 'Ashish Goyal',
          email: 'ashish.goyal@prospecta.com'
        }
      ]
    } as PermissionOn;

    component.collaboratorData = [{userid: 'Ashishkr', isViewer: true, schemaId: '1701', isAdmin: false}] as SchemaDashboardPermission[];

    spyOn(schemaDetailsServiceSpy, 'getAllUserDetails').and.returnValue(of(response));

    component.getCollaborators(queryString, 0);
    expect(component.subscribers.length).toEqual(1);
    expect(component.subscribers[0].isAdd).toBeTrue();

    component.getCollaborators(queryString, 1);
    expect(component.subscribers.length).toEqual(2);

  })

  it('shortName(), should return initials of subscriber', () => {
    let fName = 'Ashish';
    let lName = 'Goyal';
    let result = component.shortName(fName, lName);
    expect(result).toEqual('AG');

    fName = 'Ashish';
    lName = '';
    result = component.shortName(fName, lName);
    expect(result).toEqual('')
  })

  it('addSubscriber(), should add subscriber while click on ADD button', async () => {
    component.outlet = 'sb';
    const subscriber = {
      userName: 'AshishKumar',
      fName: 'Ashish',
      lName: 'Kumar',
      fullName: 'Ashish Kumar Goyal'
    };
    component.addSubscriberArr = []
    component.addSubscriber(subscriber);
    expect(component.addSubscriberArr.length).toEqual(1);
  })

  it('uncheckSubscriber(), should uncheck subscriber on click tick mark button', async () => {
    const subscriber = {
      userid: 'AshishKumar',
      fName: 'Ashish',
      lName: 'Kumar',
      fullName: 'Ashish Kumar Goyal'
    };
    component.addSubscriberArr = [
      {
        sno: '12345567',
        schemaId: '1004',
        isAdmin: false,
        isReviewer: false,
        isViewer: false,
        isEditer: false,
        groupid: '',
        roleId: '',
        userid: 'AshishKumar',
        permissionType: 'USER',
        initials: 'AK',
        fullName: 'Ashish Kumar Goyal',
        role: '',
        plantCode: ''
      }
    ]
    component.uncheckSubscriber(subscriber);
    expect(component.addSubscriberArr.length).toEqual(0);
  });

  it('openSubscriberInviteDialog(), should open subscriber invite component', async() => {
    component.outlet = 'outer';
    component.showInviteTemplate = false;
    component.openSubscriberInviteDialog();
    expect(component.showInviteTemplate).toEqual(true);

    component.outlet = 'sb';
    component.moduleId = '1005';
    component.schemaId = '25631';
    spyOn(router, 'navigate');
    component.openSubscriberInviteDialog();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: `outer/schema/invite-subscriber/${component.moduleId}/${component.schemaId}/outer` } }])
  })

  it('should init component', () => {
    spyOn(component, 'getSubscribersBySchemaId');
    component.ngOnInit();
    expect(component.getSubscribersBySchemaId).toHaveBeenCalledWith('1701');
  });

  it('should save()', () => {
    const subs = [{isViewer: true, schemaId: '1701', isAdmin: false}] as SchemaDashboardPermission[];
    component.addSubscriberArr = subs;
    component.outlet = 'sb';

    spyOn(component, 'close');

    spyOn(component, 'createUpdateSubscriber');
    component.save();
    expect(component.createUpdateSubscriber).toHaveBeenCalledWith(subs);

    spyOn(sharedService, 'setAfterSubscriberSave');
    component.outlet = 'outer';
    component.save();
    expect(sharedService.setAfterSubscriberSave).toHaveBeenCalledWith(subs);


    spyOn(component, 'deleteSubscriber');
    component.deleteSubscriberArr = [123];
    component.addSubscriberArr = [];
    component.save();
    expect(component.deleteSubscriber).toHaveBeenCalledWith(component.deleteSubscriberArr);

  });

  it('should createUpdateSubscriber()', () => {
    spyOn(schemaDetailsServiceSpy, 'createUpdateUserDetails').and.returnValues(of([123]), throwError({status: 500}));
    spyOn(sharedService, 'setAfterSubscriberSave');

    const subs = [{isViewer: true, schemaId: '1701', isAdmin: false}] as SchemaDashboardPermission[];

    component.createUpdateSubscriber(subs);
    component.createUpdateSubscriber(subs);
    expect(schemaDetailsServiceSpy.createUpdateUserDetails).toHaveBeenCalledWith(subs);
    expect(sharedService.setAfterSubscriberSave).toHaveBeenCalledTimes(1);

  });

  it('should deleteSubscriber()', () => {
    spyOn(schemaDetailsServiceSpy, 'deleteCollaborator').and.returnValues(of(true), throwError({status: 500}));
    spyOn(sharedService, 'setAfterSubscriberSave');

    component.deleteSubscriber(['123']);
    component.deleteSubscriber(['123']);
    expect(schemaDetailsServiceSpy.deleteCollaborator).toHaveBeenCalledWith(['123']);
    expect(sharedService.setAfterSubscriberSave).toHaveBeenCalledTimes(1);

  })


});
