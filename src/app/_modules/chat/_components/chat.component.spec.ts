import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { Store, StoreModule } from '@ngrx/store';
import { ChatComponent } from './chat.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  const storeMock = {
    select: jasmine.createSpy().and.returnValue(of([])),
    dispatch: jasmine.createSpy(),
    pipe: jasmine.createSpy().and.returnValue((of([])))
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatComponent],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterModule.forRoot([]), StoreModule.forRoot(storeMock), HttpClientTestingModule],
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
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
