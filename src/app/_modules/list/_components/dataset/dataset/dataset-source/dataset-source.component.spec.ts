import { GlobaldialogService } from '@services/globaldialog.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetSourceComponent } from './dataset-source.component';
import { CoreService } from '@services/core/core.service';

describe('DatasetSourceComponent', () => {
  let component: DatasetSourceComponent;
  let fixture: ComponentFixture<DatasetSourceComponent>;
  let globalDialogService: GlobaldialogService;
  let coreService: CoreService;
  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetSourceComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef,
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetSourceComponent);
    component = fixture.componentInstance;
    coreService = fixture.debugElement.injector.get(CoreService);
    globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
