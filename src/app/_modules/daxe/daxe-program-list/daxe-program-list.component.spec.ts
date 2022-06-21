import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { GlobaldialogService } from '@services/globaldialog.service';
import { getDaxeList, getNewDaxeList } from '@store/selectors/daxe.selector';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { DaxeCreationComponent } from '../daxe-creation/daxe-creation.component';
import { DAXE_TEST_DATA } from '../_services/daxe.service';

import { DaxeProgramListComponent } from './daxe-program-list.component';

describe('DaxeProgramListComponent', () => {
  let component: DaxeProgramListComponent;
  let fixture: ComponentFixture<DaxeProgramListComponent>;
  let store: MockStore;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaxeProgramListComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: getDaxeList,
              value: DAXE_TEST_DATA
            },
            {
              selector: getNewDaxeList,
              value: DAXE_TEST_DATA
            }
          ],
        }),
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, {
          provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaxeProgramListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should get Daxe', () => {
    const spy = spyOn(store, 'dispatch').and.callThrough();
    component.data.moduleId = '1';
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('close(), should close the dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('newDaxe(), should open DAXE Creation Side Sheet', () => {
    component.moduleId = '1';
    const spy = spyOn(TestBed.inject(GlobaldialogService), 'openDialog');
    component.newDaxe();
    expect(spy).toHaveBeenCalledWith(DaxeCreationComponent, { mode: 'new', moduleId: '1' } );
  });

  it('editDaxe(), should open DAXE Creation Side Sheet', () => {
    component.moduleId = '1';
    const spy = spyOn(TestBed.inject(GlobaldialogService), 'openDialog');
    component.editDaxe(DAXE_TEST_DATA[0]);
    expect(spy).toHaveBeenCalledWith(DaxeCreationComponent, { mode: 'edit', daxe: DAXE_TEST_DATA[0], moduleId: '1' } );
  });

  it('toggleAssign(), should change toggle', () => {
    component.moduleId = '1';
    const daxe = DAXE_TEST_DATA[0];
    component.toggleAssign(daxe);
    expect(daxe.assignedState).toBeFalsy();
    component.toggleAssign(daxe);
    expect(daxe.assignedState).toBeTruthy();
  });
});
