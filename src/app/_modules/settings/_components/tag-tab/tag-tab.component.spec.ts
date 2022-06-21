import { GlobaldialogService } from '@services/globaldialog.service';
import { UserProfileService } from './../../../../_services/user/user-profile.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MergeTagDialogComponent } from './merge-tag-dialog/merge-tag-dialog.component';
import { TransientService } from 'mdo-ui-library';
import { TagsResponse, TagActionResponse, Tag } from './../../../../_models/userdetails';
import { SharedModule } from '@modules/shared/shared.module';
import { async, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { TagTabComponent } from './tag-tab.component';
import { of } from 'rxjs';

describe('TagTabComponent', () => {
  let component: TagTabComponent;
  let fixture: ComponentFixture<TagTabComponent>;
  let userProfileService: UserProfileService;
  let toasterService: TransientService;
  let dialog: MatDialog;
  let globalDialogService: GlobaldialogService;
  const mockDialogRef = {​​​​​​​​ close: jasmine.createSpy('close'), open: jasmine.createSpy('open'), }​​​​​​​​;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TagTabComponent],
      imports: [AppMaterialModuleForSpec, SharedModule],
      providers: [TransientService, MergeTagDialogComponent, {​​​​​​​​ provide: MatDialogRef, useValue: mockDialogRef }​​​​​​​​,],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagTabComponent);
    component = fixture.componentInstance;
    userProfileService = fixture.debugElement.injector.get(UserProfileService);
    toasterService = fixture.debugElement.injector.get(TransientService);
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    dialog = TestBed.inject(MatDialog);

    const response: TagsResponse = {
      username: 'initiator',
      tenantId: '0',
      tags: [
        {
          id: '761970969229124980',
          description: 'Material 10',
        },
        {
          id: '604350447228762398',
          description: 'Material 3',
        },
      ],
    };
    const emptyResponse: TagsResponse = {
      username: 'initiator',
      tenantId: '0',
      tags: [],
    };
    spyOn(userProfileService, 'getAllTags').withArgs(0, 15).and.callFake(() => of(response));
    spyOn(userProfileService, 'searchTags').withArgs(0, 15, 'Material').and.callFake(() => of(emptyResponse));

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getTags(), should get All tags', async(() => {
    component.ngOnInit();
    expect(userProfileService.getAllTags).toHaveBeenCalled();

    expect(component.tags.length).toEqual(2);
    expect(component.infinteScrollLoading).toEqual(false);
    expect(component.hasMoreData).toEqual(true);

    component.fieldsSearchString = 'Material';
    component.getTags();
    expect(userProfileService.searchTags).toHaveBeenCalled();
    expect(component.hasMoreData).toEqual(false);
  }));

  it('searchFieldSub emit value', fakeAsync(() => {
    component.ngOnInit();
    component.searchFieldSub.next('Material');
    tick(1005);
    expect(component.fieldsSearchString).toEqual('Material');
    expect(component.recordsPageIndex).toEqual(0);

    component.searchFieldSub.next('');
    tick(1005);
    expect(component.fieldsSearchString).toEqual('');
    flush();
  }));

  it('scroll(), should get tags on scroll down', async(() => {
    spyOn(component, 'getTags');
    component.ngOnInit();
    component.scroll(true);
    expect(component.recordsPageIndex).toEqual(1);
    expect(component.getTags).toHaveBeenCalled();

    component.infinteScrollLoading = false;
    component.scroll(false);
    expect(component.recordsPageIndex).toEqual(0);

    const result = component.scroll(true);
    expect(result).toBeNull();
  }));

  it('deleteTag(), should delete Tab by Id', async(() => {
    const successResponse: TagActionResponse = {
      acknowledge: true,
      tagId: '978172559229414259',
      errorMsg: null,
    };
    const failResponse: TagActionResponse = {
      acknowledge: false,
      tagId: '978172559229414259',
      errorMsg: null,
    };
    const tag: Tag = { id: '761970969229124980', description: 'Material 10' };
    spyOn(userProfileService, 'deleteByTagId').and.returnValues(of(successResponse), of(failResponse));
    spyOn(component, 'getTags');
    spyOn(toasterService, 'open');

    component.ngOnInit();
    component.deleteTag([tag]);

    expect(userProfileService.deleteByTagId).toHaveBeenCalledWith([tag.id]);
    expect(component.getTags).toHaveBeenCalled();

    component.deleteTag([tag]);
    expect(toasterService.open).toHaveBeenCalled();
  }));

  it('deleteSelectedTags(), confirmation dialog return yes', fakeAsync(() => {
    spyOn(component, 'deleteTag');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb)=> {
      expect(typeof cb).toBe('function');
      cb('yes');
    });
    const tag: Tag = {
      id: '761970969229124980',
      description: 'Material 10',
    }
    component.selection.toggle(tag);
    component.deleteSelectedTags();
    expect(component.deleteTag).toHaveBeenCalledWith([tag]);

    component.deleteSelectedTags(tag);
    expect(component.deleteTag).toHaveBeenCalledWith([tag]);
  }));

  it('deleteSelectedTags(), confirmation dialog return no', fakeAsync(() => {
    spyOn(component, 'deleteTag');
    component.ngOnInit();
    spyOn(globalDialogService, 'confirm').and.callFake(({}, cb)=> {
      expect(typeof cb).toBe('function');
      cb('no');
    });
    const tag: Tag = {
      id: '761970969229124980',
      description: 'Material 10',
    }
    const result = component.deleteSelectedTags(tag);
    expect(result).toBeFalsy();

  }));

  it('addNewTag(), should add new tag in tags list at top', () => {
    spyOn(toasterService, 'open');
    const tags: Tag[] = [
        {
          id: '761970969229124980',
          description: 'Material 10',
        },
        {
          id: '604350447228762398',
          description: 'Material 3',
        },
      ];
    component.ngOnInit();
    component.tags = tags;
    component.addNewTag();
    expect(component.tags.length).toEqual(3);

    component.addNewTag();
    expect(toasterService.open).toHaveBeenCalled();
  });

  it('isAllSelected(), check all the tags are selected', () => {
    const tags: Tag[] = [
        {
          id: '761970969229124980',
          description: 'Material 10',
        },
        {
          id: '604350447228762398',
          description: 'Material 3',
        },
      ];
    component.ngOnInit();
    component.tags = tags;
    component.selection.toggle({
      id: '761970969229124980',
      description: 'Material 10',
    });
    let result = component.isAllSelected();
    expect(result).toBeFalse();

    component.selection.toggle({
      id: '604350447228762398',
      description: 'Material 3',
    });

    result = component.isAllSelected();
    expect(result).toBeTrue();
  });

  it('masterToggle(), check all the tags are selected', () => {
    const tags: Tag[] = [
        {
          id: '761970969229124980',
          description: 'Material 10',
        },
        {
          id: '604350447228762398',
          description: 'Material 3',
        },
      ];
    component.ngOnInit();
    component.tags = tags;
    component.selection.toggle(tags[0]);
    component.masterToggle();
    expect(component.selection.selected.length).toEqual(2);

    component.masterToggle();
    expect(component.selection.selected.length).toEqual(0);
  });

  it('tagName(), trackBy', () => {
    const tags: Tag[] = [
        {
          id: '761970969229124980',
          description: 'Material 10',
        },
        {
          id: '604350447228762398',
          description: 'Material 3',
        },
      ];
    component.ngOnInit();
    const result = component.tagName(0, tags[0]);
    expect(result).toEqual('Material 10');
  });

  it('updateTagName(), should call to update or create tag', async(() => {
    const tags: Tag[] = [
        {
          id: '761970969229124980',
          description: 'Material 10',
        },
        {
          id: '604350447228762398',
          description: 'Material 3',
        },
        {
          id: '',
          description: 'New Tag',
        },
    ];
    const response: TagActionResponse = {
      acknowledge: true,
      tagId: '761970969229124980',
      errorMsg: null
    };
    const failresponse: TagActionResponse = {
      acknowledge: false,
      tagId: null,
      errorMsg: null
    };
    spyOn(toasterService, 'open');
    spyOn(userProfileService, 'saveUpdateTag').and.returnValues(of(response), of(response), of(failresponse));
    component.ngOnInit();
    component.tags = tags;
    component.updateTagName('Updated Tag Name', tags[0]);
    expect(component.tags[0].description).toEqual('Updated Tag Name');

    component.updateTagName('New Tag Name Inserted', tags[2]);
    expect(component.tags[2].description).toEqual('New Tag Name Inserted');
    expect(component.tags[2].id).toEqual('761970969229124980');

    component.updateTagName('Updated Tag Name 2', tags[0]);
    expect(toasterService.open).toHaveBeenCalled();

    const result = component.updateTagName('', tags[0]);
    expect(result).toBeFalsy();
  }));

  it('mergeTags(), merge tag dialog returns true', async(() => {
    const obj = {
      afterClosed: () => {
        return of(true);
      }
    }
    spyOn(dialog, 'open').and.returnValues(obj as MatDialogRef<MergeTagDialogComponent>);
    component.mergeTags();
    expect(dialog.open).toHaveBeenCalled();
  }));
  it('mergeTags(), merge tag dialog returns false', async(() => {
    const obj = {
      afterClosed: () => {
        return of(false);
      }
    }
    spyOn(dialog, 'open').and.returnValues(obj as MatDialogRef<MergeTagDialogComponent>);
    const result = component.mergeTags();
    expect(result).toBeFalsy();
  }));
});
