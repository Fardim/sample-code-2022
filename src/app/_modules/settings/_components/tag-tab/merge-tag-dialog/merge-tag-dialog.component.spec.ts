import { UserProfileService } from './../../../../../_services/user/user-profile.service';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Tag, TagActionResponse } from './../../../../../_models/userdetails';
import { TransientService } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from './../../../../shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeTagDialogComponent } from './merge-tag-dialog.component';
import { FormControl } from '@angular/forms';

describe('MergeTagDialogComponent', () => {
  let component: MergeTagDialogComponent;
  let fixture: ComponentFixture<MergeTagDialogComponent>;
  let userProfileService: UserProfileService;
  let transientService: TransientService;
  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };
  const mockValues: Tag[] = [
    {
      id: '761970969229124980',
      description: 'Material 10',
    },
    {
      id: '604350447228762398',
      description: 'Material 3',
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MergeTagDialogComponent],
      imports: [AppMaterialModuleForSpec, SharedModule],
      providers: [
        TransientService,
        MergeTagDialogComponent,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {tags: mockValues} },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeTagDialogComponent);
    component = fixture.componentInstance;
    userProfileService = fixture.debugElement.injector.get(UserProfileService);
    transientService = fixture.debugElement.injector.get(TransientService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closeDialog(), should close dialog', async(() => {
    component.closeDialog(false);
    expect(mockDialogRef.close).toHaveBeenCalled();
  }));

  it('ngOnInit(), should have tags', async(() => {
    component.ngOnInit();
    expect(component.tags.length).toEqual(2);
  }));

  it('mergeTags(), merge tags', async(() => {
    const successResponse: TagActionResponse = {
      acknowledge: true,
      tagId: '978172559229414259',
      errorMsg: null,
    };
    const failResponse: TagActionResponse = {
      acknowledge: false,
      tagId: null,
      errorMsg: null,
    };
    spyOn(userProfileService, 'mergeTags').and.returnValues(of(successResponse), of(failResponse));
    spyOn(transientService, 'open');
    spyOn(component, 'closeDialog');
    component.ngOnInit();
    component.consolidatedTagName = new FormControl('Merged 9 5');
    component.mergeTags();
    expect(userProfileService.mergeTags).toHaveBeenCalled();
    expect(transientService.open).toHaveBeenCalled();
    expect(component.closeDialog).toHaveBeenCalled();

    component.mergeTags();
    expect(component.banner.merge_tags_banner).toEqual('Tags merge Failed');

  }));
});
