import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { UsersListComponent } from './users-list.component';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;

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
      declarations: [UsersListComponent],
      imports: [SharedModule, AppMaterialModuleForSpec],
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
    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
