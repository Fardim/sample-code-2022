import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { Store, StoreModule } from '@ngrx/store';
import { ChatEditorComponent } from './chat-editor.component';
import { of } from 'rxjs';

describe('ChatEditorComponent', () => {
  let component: ChatEditorComponent;
  let fixture: ComponentFixture<ChatEditorComponent>;

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
      declarations: [ChatEditorComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, StoreModule.forRoot({})],
      providers: [
        {
          provide: Store,
          useValue: storeMock
        }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
