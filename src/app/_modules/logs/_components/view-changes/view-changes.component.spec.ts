import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ViewChangesComponent } from './view-changes.component';

describe('ViewChangesComponent', () => {
  let component: ViewChangesComponent;
  let fixture: ComponentFixture<ViewChangesComponent>;
  let router: Router;
  let dialog: MatDialog;
  const mockDialogRef = { close: jasmine.createSpy('close'), open: jasmine.createSpy('open'), };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      declarations: [ViewChangesComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewChangesComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('handleClickView(), should open dialog', async(() => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
    spyOn(dialog, 'open').and.returnValues(dialogRefSpyObj);

    component.handleClickView({
      action: 'Deleted'
    });
    expect(dialog.open).toHaveBeenCalled();
  }));

  it('close()', () => {
    spyOn(router, 'navigate');
    component.close();
    expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb3: null } }], {
      preserveFragment: true, queryParamsHandling: 'preserve'
    });
  });

  it('getActionStatus', () => {
    const resultD = component.getActionStatus('Deleted');
    expect(resultD).toEqual('error');

    const resultC = component.getActionStatus('Created');
    expect(resultC).toEqual('success');

    const resultCh = component.getActionStatus('Changed');
    expect(resultCh).toEqual('warning');
  });
});
