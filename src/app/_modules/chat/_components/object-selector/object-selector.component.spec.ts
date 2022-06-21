import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ObjectSelectorComponent } from './object-selector.component';

describe('ObjectSelectorComponent', () => {
  let component: ObjectSelectorComponent;
  let fixture: ComponentFixture<ObjectSelectorComponent>;

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
      declarations: [ObjectSelectorComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, StoreModule.forRoot({})],
      providers: [
        {
          provide: Store,
          useValue: storeMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
