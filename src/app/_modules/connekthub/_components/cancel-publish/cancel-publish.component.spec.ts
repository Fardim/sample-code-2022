import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { CancelPublishComponent } from './cancel-publish.component';

describe('CancelPublishComponent', () => {
  let component: CancelPublishComponent;
  let fixture: ComponentFixture<CancelPublishComponent>;
  let connekthubService: ConnekthubService;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
    open: jasmine.createSpy('open'),
    afterClosed: of({ result: 'yes' }),
    addPanelClass: (abc) => { }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelPublishComponent ],
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        ConnekthubService,
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: { chkPackageId : '1234' }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelPublishComponent);
    connekthubService = fixture.debugElement.injector.get(ConnekthubService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.chkPackageId).toBe('1234');
  });

  it('close(), should close the dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ successfully: false });
  });

  it('cancel(), should call withdraw', () => {
    spyOn(connekthubService, 'withdraw').and.returnValue(of());
    component.cancel();
    expect(connekthubService.withdraw).toHaveBeenCalledWith('1234');
  });
});
