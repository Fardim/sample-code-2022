import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttachmentDialogComponent } from './attachment-dialog.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('AttachmentDialogComponent', () => {
  let component: AttachmentDialogComponent;
  let fixture: ComponentFixture<AttachmentDialogComponent>;
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
      declarations: [AttachmentDialogComponent],
      imports: [SharedModule, AppMaterialModuleForSpec],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: Store,
          useValue: storeMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
