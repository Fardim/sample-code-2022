import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ManageChatCollaboratorsComponent } from './manage-chat-collaborators.component';

describe('ManageChatCollaboratorsComponent', () => {
  let component: ManageChatCollaboratorsComponent;
  let fixture: ComponentFixture<ManageChatCollaboratorsComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const storeMock = {
    select: jasmine.createSpy().and.returnValue(of({
      messages: [],
      connected: false,
      loadingState: 'loading',
      errorText: '',
      channelId: 'e6e3d836-00b1-489e-a642-0395377ce276'
    })),
    dispatch: jasmine.createSpy(),
    pipe: jasmine.createSpy().and.returnValue((of({
      messages: [],
      connected: true,
      loadingState: 'loaded',
      errorText: '',
      channelId: 'e6e3d836-00b1-489e-a642-0395377ce276'
    })))
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageChatCollaboratorsComponent],
      imports: [SharedModule, AppMaterialModuleForSpec, StoreModule.forRoot({})],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: {}
        },
        {
          provide: Store,
          useValue: storeMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageChatCollaboratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
