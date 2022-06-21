import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AddDaxe, SaveDaxe, UpdateDaxe } from '@store/actions/daxe.action';
import { DaxeUsage } from '@store/models/daxe.model';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { DAXE_TEST_DATA } from '../_services/daxe.service';

import { DaxeCreationComponent } from './daxe-creation.component';

describe('DaxeCreationComponent', () => {
  let component: DaxeCreationComponent;
  let fixture: ComponentFixture<DaxeCreationComponent>;
  let store: MockStore;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DaxeCreationComponent],
      imports: [AppMaterialModuleForSpec, SharedModule],
      providers: [
        provideMockStore(),
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            daxe: DAXE_TEST_DATA[0],
            mode: 'edit',
            moduleId: '1'
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaxeCreationComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.moduleId).toBe('1');
    expect(component.mode).toBe('edit');
    expect(component.daxeRule).toEqual(DAXE_TEST_DATA[0]);
  });

  it('close(), should close the dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('toggleFullScreenEditor(), should toogle full screen', () => {
    component.toggleFullScreenEditor();
    expect(component.showFullScreenEditor).toBeTruthy();
  });

  it('save(), should save Daxe Rule', () => {
    component.mode = 'new';
    component.form.setValue({
      name: 'test',
      brief: 'test brief',
      whatsNew: '',
      usage: DaxeUsage.TRANSFORMING,
      daxeCode: 'Daxe code'
    });
    let spy = spyOn(store, 'dispatch').and.callThrough();
    component.save(false);
    expect(spy).toHaveBeenCalledWith(new SaveDaxe(component.daxeRule));

    component.moduleId = undefined;
    component.save(true);
    expect(spy).toHaveBeenCalledWith(new AddDaxe(component.daxeRule));

    component.moduleId = undefined;
    component.daxeRule = DAXE_TEST_DATA[0];
    component.mode = 'edit';
    component.save(true);
    expect(spy).toHaveBeenCalledWith(new UpdateDaxe(component.daxeRule));

    component.moduleId = '1';
    component.daxeRule = DAXE_TEST_DATA[0];
    component.mode = 'edit';
    component.save(true);
    expect(spy).toHaveBeenCalledWith(new SaveDaxe(component.daxeRule));
  });
});
