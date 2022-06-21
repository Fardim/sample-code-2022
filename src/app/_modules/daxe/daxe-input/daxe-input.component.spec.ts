import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { DaxeInputComponent } from './daxe-input.component';
import { DAXE_TEST_DATA } from '../_services/daxe.service';
import { getDaxeList, getNewDaxeList } from '@store/selectors/daxe.selector';
import { MatDialog } from '@angular/material/dialog';
import { DaxeProgramListComponent } from '../daxe-program-list/daxe-program-list.component';
import { GlobaldialogService } from '@services/globaldialog.service';
import { DaxeCreationComponent } from '../daxe-creation/daxe-creation.component';

describe('DaxeInputComponent', () => {
  let component: DaxeInputComponent;
  let fixture: ComponentFixture<DaxeInputComponent>;
  let store: MockStore;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaxeInputComponent ],
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
        })
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaxeInputComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should get Daxe', () => {
    const spy = spyOn(store, 'dispatch').and.callThrough();
    component.moduleId = '1';
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('triggerSearch(), should trigger search', () => {
    const spy = spyOn(console, 'log');
    component.triggerSearch('V0001');
    expect(spy).toHaveBeenCalled();
  });

  it('delete(), should delete Daxe', () => {
    component.selectedDaxeRule = null;
    component.delete();
    expect(component.selectedDaxeRule).toBeUndefined();
  });

  it('selectDaxeRule(), should be selected', () => {
    component.selectDaxeRule(null);
    expect(component.selectedDaxeRule).toBeUndefined();
    component.selectDaxeRule(DAXE_TEST_DATA[0]);
    expect(component.selectedDaxeRule).toEqual(DAXE_TEST_DATA[0]);
  });

  it('openDAXESideSheet(), should open DAXE Side Sheet', () => {
    component.moduleId = '1';
    const spy = spyOn(TestBed.inject(GlobaldialogService), 'openDialog');
    component.openDAXESideSheet();
    expect(spy).toHaveBeenCalledWith(DaxeProgramListComponent, { moduleId: '1' } );
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
});
