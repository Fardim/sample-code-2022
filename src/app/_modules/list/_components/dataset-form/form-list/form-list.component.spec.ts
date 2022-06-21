
import { FormNullstateComponent } from './../form-nullstate/form-nullstate.component';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormListComponent } from './form-list.component';

describe('FormListComponent', () => {
  let component: FormListComponent;
  let fixture: ComponentFixture<FormListComponent>;
  // let router: Router;
  // let coreService: CoreService;
  // let userProfileService: UserProfileService;

  // const mockdata = {
  //   dateCreated: 1631556000000,
  //   dateModified: 1631556000000,
  //   description: 'string',
  //   helpText: 'string',
  //   labels: 'string1, string2, string3',
  //   layoutId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  //   type: 'string',
  //   usage: 'string',
  //   userCreated: 'string',
  //   userModified: 'string',
  // }
  // const mockObject = {
  //   objectid: 1005,
  //   moduleid: 1005,
  //   objectdesc: 'Adding a dataset manually',
  //   description: 'Adding a dataset manually',
  //   information: {
  //     en: 'Adding a dataset manually'
  //   }
  // };
  // const mockUserListResponse: UserInfoListResponse = {
  //   acknowledge: true,
  //   errorMsg: null,
  //   listPage: {
  //     content: [
  //       {
  //         userName: 'parth.rami@icliqsolution.com',
  //         fname: null,
  //         lname: null,
  //       },
  //       {
  //         userName: 'aa',
  //         fname: 'User2',
  //         lname: 'User2 lname',
  //       },
  //     ],
  //     pageable: {
  //       sort: {
  //         unsorted: true,
  //         sorted: false,
  //         empty: true,
  //       },
  //       offset: 0,
  //       pageNumber: 0,
  //       pageSize: 10,
  //       unpaged: false,
  //       paged: true,
  //     },
  //     totalPages: 1,
  //     last: true,
  //     totalElements: 2,
  //     number: 0,
  //     size: 10,
  //     sort: {
  //       unsorted: true,
  //       sorted: false,
  //       empty: true,
  //     },
  //     first: true,
  //     numberOfElements: 2,
  //     empty: false,
  //   },
  // };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormListComponent, FormNullstateComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormListComponent);
    component = fixture.componentInstance;

    // coreService = fixture.debugElement.injector.get(CoreService);
    // userProfileService = fixture.debugElement.injector.get(UserProfileService);
    // router = TestBed.inject(Router);
  });

  // it('should create', () => {
  //   spyOn(coreService, 'getDatasetFormList').and.returnValues(of([mockdata]));
  //   spyOn(coreService, 'getFormsCount').and.returnValues(of({count: 7}));
  //   spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject));
  //   spyOn(userProfileService, 'getUserInfoList').and.returnValues(of(mockUserListResponse), of(mockUserListResponse));

  //   fixture.detectChanges();
  //   expect(component).toBeTruthy();
  // });

  // it('getObjectTypeDetails()', async(() => {
  //   spyOn(coreService, 'getDatasetFormList').and.returnValues(of([mockdata]));
  //   spyOn(coreService, 'getFormsCount').and.returnValues(of({count: 7}));
  //   spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject), throwError({ message: 'api error' }));
  //   spyOn(userProfileService, 'getUserInfoList').and.returnValues(of(mockUserListResponse), of(mockUserListResponse));
  //   fixture.detectChanges();

  //   component.getObjectTypeDetails();
  //   expect(component.objectType.objectid).toEqual(mockObject.moduleid);
  //   expect(component.objectType.objectdesc).toEqual(mockObject.description);

  //   spyOn(console, 'error');
  //   component.getObjectTypeDetails();
  //   expect(console.error).toHaveBeenCalled();
  // }));

  // it('formTypeSelected(type: { id: string; name: string })', async(() => {
  //   spyOn(router, 'navigate');
  //   const extras: any = { relativeTo: component.route };
  //   extras.queryParams = { t: '2' };
  //   extras.fragment = 'property-panel';

  //   component.formTypeSelected({ id: '2', name: 'Flow' })
  //   expect(router.navigate).toHaveBeenCalledWith(['new'], extras);
  // }));

  // it('searchFieldSub next', fakeAsync(() => {
  //   spyOn(coreService, 'getDatasetFormList').and.returnValues(of([mockdata]));
  //   spyOn(coreService, 'getFormsCount').and.returnValues(of({count: 7}));
  //   spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject), throwError({ message: 'api error' }));
  //   spyOn(userProfileService, 'getUserInfoList').and.returnValues(of(mockUserListResponse), of(mockUserListResponse));

  //   spyOn(component, 'getTableData');
  //   component.ngOnInit();

  //   component.searchFieldSub.next('material');
  //   tick(1000);
  //   expect(component.getTableData).toHaveBeenCalled();
  // }));

  // it('searchModifyBySub next', fakeAsync(() => {
  //   spyOn(coreService, 'getDatasetFormList').and.returnValues(of([mockdata]));
  //   spyOn(coreService, 'getFormsCount').and.returnValues(of({count: 7}));
  //   spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject), throwError({ message: 'api error' }));
  //   spyOn(userProfileService, 'getUserInfoList').and.returnValues(of(mockUserListResponse), of(mockUserListResponse));

  //   spyOn(component, 'getModifybyUsers');
  //   component.ngOnInit();

  //   component.searchModifyBySub.next('user');
  //   tick(1000);
  //   expect(component.getModifybyUsers).toHaveBeenCalled();
  // }));

  // it('searchCreatedBySub next', fakeAsync(() => {
  //   spyOn(coreService, 'getDatasetFormList').and.returnValues(of([mockdata]));
  //   spyOn(coreService, 'getFormsCount').and.returnValues(of({count: 7}));
  //   spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject), throwError({ message: 'api error' }));
  //   spyOn(userProfileService, 'getUserInfoList').and.returnValues(of(mockUserListResponse), of(mockUserListResponse));

  //   spyOn(component, 'getCreatedbyUsers');
  //   component.ngOnInit();

  //   component.searchCreatedBySub.next('user');
  //   tick(1000);
  //   expect(component.getCreatedbyUsers).toHaveBeenCalled();
  // }));

  // it('onPageChange(), should call getTableData with updated pagination', async(() => {
  //   spyOn(coreService, 'getDatasetFormList').and.returnValues(of([mockdata]), of([mockdata]));
  //   spyOn(coreService, 'getFormsCount').and.returnValues(of({count: 7}));
  //   spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject), throwError({ message: 'api error' }));
  //   spyOn(userProfileService, 'getUserInfoList').and.returnValues(of(mockUserListResponse), of(mockUserListResponse));

  //   const pageEvent = {
  //     pageIndex: 2,
  //     pageSize: 50,
  //     length: 100,
  //   };
  //   component.ngOnInit();
  //   component.onPageChange(pageEvent);
  //   expect(component.recordsPageIndex).toBe(pageEvent.pageIndex);

  //   const result = component.onPageChange(pageEvent);
  //   expect(result).toBeFalsy();
  // }));

  // it('afterFilterMenuClosed(), should get getTableData on filter applied', async(() => {
  //   spyOn(coreService, 'getDatasetFormList').and.returnValues(of([mockdata]));
  //   spyOn(component, 'getTableData');
  //   component.afterFilterMenuClosed();
  //   expect(component.recordsPageIndex).toEqual(1);
  //   expect(component.getTableData).toHaveBeenCalled();
  // }));

  // it('should displayedRecordsRange()', () => {
  //   spyOn(coreService, 'getFormsCount').and.returnValues(of({count: 7}));
  //   component.getTotalFormsCount();
  //   expect(component.totalCount).toEqual(7);

  //   expect(component.displayedRecordsRange).toEqual('1 to 7 of 7');

  //   component.totalCount = 0;
  //   expect(component.displayedRecordsRange).toEqual('');
  // });

  // it('modifydateChanged(event)', async(() => {
  //   spyOn(coreService, 'getDatasetFormList').and.returnValues(of([mockdata]), of([mockdata]));
  //   spyOn(component.dataSource, 'reset');
  //   spyOn(component, 'getTableData');
  //   component.modifydateChanged(new Date());

  //   expect(component.dataSource.reset).toHaveBeenCalled();
  //   expect(component.getTableData).toHaveBeenCalled();
  // }));

  // it('createdateChanged(event)', async(() => {
  //   spyOn(coreService, 'getDatasetFormList').and.returnValues(of([mockdata]), of([mockdata]));
  //   spyOn(component.dataSource, 'reset');
  //   spyOn(component, 'getTableData');
  //   component.createdateChanged(new Date());

  //   expect(component.dataSource.reset).toHaveBeenCalled();
  //   expect(component.getTableData).toHaveBeenCalled();
  // }));

  // it('modifybyScrollEnd(), should get users on scroll down', async(() => {
  //   spyOn(component, 'getModifybyUsers');
  //   component.modifybyScrollEnd();
  //   expect(component.modifybyPageIndex).toEqual(2);
  //   expect(component.getModifybyUsers).toHaveBeenCalled();

  //   component.modifybyInfinteScrollLoading = true;
  //   const result = component.modifybyScrollEnd();
  //   expect(result).toBeNull();
  // }));

  // it('createdbyScrollEnd(), should get users on scroll down', async(() => {
  //   spyOn(component, 'getCreatedbyUsers');
  //   component.createdbyScrollEnd();
  //   expect(component.createdbyPageIndex).toEqual(2);
  //   expect(component.getCreatedbyUsers).toHaveBeenCalled();

  //   component.modifybyInfinteScrollLoading = true;
  //   const result = component.createdbyScrollEnd();
  //   expect(result).toBeNull();
  // }));

  it('setSelectedFormType(type: { id: string; name: string })', async(() => {
    const formType1 = { id: '2', name: 'Flow' };
    const formType2 = { id: '3', name: 'HTML' };
    component.setSelectedFormType(formType1);
    component.setSelectedFormType(formType2);
    expect(component.selectedTypes.length).toEqual(2);

    component.setSelectedFormType(formType1);
    expect(component.selectedTypes.length).toEqual(1);

    component.setSelectedFormType(null);
    expect(component.selectedTypes.length).toEqual(0);
  }));

  it('setSelectedModifyby(user: any)', async(() => {
    const user1 = { userName: 'prospecta' };
    const user2 = { userName: 'mdo' };
    component.setSelectedModifyby(user1);
    component.setSelectedModifyby(user2);
    expect(component.selectedModifyby.length).toEqual(2);

    component.setSelectedModifyby(user1);
    expect(component.selectedModifyby.length).toEqual(1);

    component.setSelectedModifyby(null);
    expect(component.selectedModifyby.length).toEqual(0);
  }));

  it('setSelectedCreatedby(user: any)', async(() => {
    const user1 = { userName: 'prospecta' };
    const user2 = { userName: 'mdo' };
    component.setSelectedCreatedby(user1);
    component.setSelectedCreatedby(user2);
    expect(component.selectedCreatedby.length).toEqual(2);

    component.setSelectedCreatedby(user1);
    expect(component.selectedCreatedby.length).toEqual(1);

    component.setSelectedCreatedby(null);
    expect(component.selectedCreatedby.length).toEqual(0);
  }));

  it('getLabel(), should find the label of the field of the table column', () => {
    component.columns = [{
      id: 'description', name: 'Form'
    }];

    const label = component.getLabel('description');
    expect(label).toEqual('Form');
  })

  it('getTypeName(), should get type', () => {
    component.formTypes = [
      {id: '2', name: 'Flow'},
      {id: '3', name: 'HTML'},
      {id: '4', name: 'PDF'}
    ];
    const type = component.getTypeName('2');
    expect(type).toEqual('Flow');
  })
});
