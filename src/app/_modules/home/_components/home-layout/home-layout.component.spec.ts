import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeLayoutComponent } from './home-layout.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbComponent } from '../../../shared/_components/breadcrumb/breadcrumb.component';
import { UserService } from 'src/app/_services/user/userservice.service';
import { Userdetails } from 'src/app/_models/userdetails';
import { of, Subscription } from 'rxjs';
import { SecondaryNavbarComponent } from '@modules/home/_components/secondary-navbar/secondary-navbar.component';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { NavigationDropdownComponent } from '@modules/shared/_components/navigation-dropdown/navigation-dropdown.component';
import { SharedModule } from '@modules/shared/shared.module';
import { PrimaryNavigationComponent } from '../primary-navigation/primary-navigation.component';
import { StoreModule, Store } from '@ngrx/store';

describe('HomeLayoutComponent', () => {
  let component: HomeLayoutComponent;
  let fixture: ComponentFixture<HomeLayoutComponent>;
  let userSvc: jasmine.SpyObj<UserService>;
  const userDetailsobject: Userdetails = {
    userName: 'DemoApp',
    firstName: 'Demo',
    lastName: 'Approver',
    email: 'prostenant@gmail.com',
    plantCode: 'MDO1003',
    currentRoleId: '663065348460318692',
    dateformat: 'dd.mm.yy',
    fullName: 'Demo Approver',
    assignedRoles: [
      {
        defaultRole: '1',
        roleDesc: 'DemoApprover',
        roleId: '663065348460318692',
        sno: '521017956918018560',
        userId: 'DemoApp'
      },
      {
        defaultRole: '0',
        roleDesc: 'DemoApprover2',
        roleId: '143739996174018010',
        sno: '867216031918019200',
        userId: 'DemoApp'
      }
    ]
  } as Userdetails;

  const storeMock = {
    select: jasmine.createSpy().and.returnValue(of({navToggle: {
      isPrimarySidebarOpen: true,
      isSecondarySidebarOpen: true,
    }})),
    dispatch: jasmine.createSpy(),
    pipe: jasmine.createSpy().and.returnValue((of({navToggle: {
      isPrimarySidebarOpen: true,
      isSecondarySidebarOpen: true,
    }})))
  };

  beforeEach(async(() => {
    const userSvcSpy = jasmine.createSpyObj('UserService', ['getUserDetails']);
    TestBed.configureTestingModule({
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule,
        SharedModule,
        StoreModule.forRoot({})
      ],
      providers: [
        { provide: UserService, useValue: userSvcSpy },
        {
          provide: Store,
          useValue: storeMock
        }
      ],
      declarations: [HomeLayoutComponent, BreadcrumbComponent, PrimaryNavigationComponent, SecondaryNavbarComponent,
        SearchInputComponent, NavigationDropdownComponent]
    })
      .compileComponents();
    userSvc = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeLayoutComponent);
    component = fixture.componentInstance;
    component.udSub = new Subscription();
  });

  it('should create', () => {
    const mockUserD = new Userdetails();
    mockUserD.fullName = 'TEST';
    userSvc.getUserDetails.and.returnValue(of(mockUserD));
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.userDetails).toEqual(mockUserD);
    expect(component.userDetails.fullName === mockUserD.fullName).toBeTruthy();
  });

  // it('should call selectedRoleDesc()', () => {
  //   component.userDetails = userDetailsobject;
  //   expect(component.selectedRoleDesc).toBe('DemoApprover');
  //   component.userDetails.assignedRoles[0].roleId = '123';
  //   expect(component.selectedRoleDesc).toBe('663065348460318692');
  //   component.userDetails.currentRoleId = null;
  //   expect(component.selectedRoleDesc).toBe('');
  // })

  it('togglePrimarySideBar(), should toggle primary navigation bar', async() => {
    component.primarySideBarOpened = true;
    component.togglePrimarySideBar();
    const sideNav = document.getElementById('primarySidenav');
    expect(sideNav.style.width).toEqual('60px');
    expect(component.primarySideBarOpened).toEqual(false);

    component.primarySideBarOpened = false;
    component.togglePrimarySideBar();
    expect(component.primarySideBarOpened).toEqual(true);
  })

  // it('toggleSecondarySideBar(), should toggle secondary nav bar', ()=>{
  //   component.secondarySideBarOpened = true;
  //   const hidePrimary = true;
  //   component.toggleSecondarySideBar(hidePrimary);
  //   expect(component.secondarySideBarOpened).toEqual(false);

  //   component.secondarySideBarOpened = false;
  //   component.toggleSecondarySideBar(hidePrimary);
  //   expect(component.secondarySideBarOpened).toEqual(true);
  // })
});
