import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ConnekthubLoginComponent } from './connekthub-login.component';

describe('ConnekthubLoginComponent', () => {
  let component: ConnekthubLoginComponent;
  let fixture: ComponentFixture<ConnekthubLoginComponent>;
  let connekthubService: ConnekthubService;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnekthubLoginComponent ],
      imports: [
        AppMaterialModuleForSpec, RouterTestingModule, SharedModule
      ],
      providers: [
        ConnekthubService,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnekthubLoginComponent);
    component = fixture.componentInstance;
    connekthubService = fixture.debugElement.injector.get(ConnekthubService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('signIn(), should be able to login', () => {
    const res = {
      headers: {
        get: (name) => {
          return name
        }
      }
    }
    spyOn(connekthubService, 'login').and.returnValue(of(res));
    spyOn(component.hasLogined, 'emit');
    component.form.setValue({
      userName: 'user',
      password: 'pass'
    });
    component.signIn();
    expect(connekthubService.login).toHaveBeenCalled();
    expect(component.hasLogined.emit).toHaveBeenCalled();
  });
});
