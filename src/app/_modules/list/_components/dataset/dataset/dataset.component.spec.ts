import { ConnectorContainerDirective } from './../../connector/directives/connector-container.directive';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { DatasetComponent } from './dataset.component';

describe('DatasetComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DatasetComponent, ConnectorContainerDirective],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef,
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      imports: [SharedModule, AppMaterialModuleForSpec],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnIt(), should be test with pre required ', async(() => {
    component.data.selectedDatasetId = 1;
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
    expect(component.selectedDatasetId).toBe(1);
  }));

  it('it should close the dialog', () => {
    const event = {toRefreshApis: true, moduleId: 146};
    component.onCancelClick(event);
    expect(mockDialogRef.close).toHaveBeenCalledWith(event);
  });

  it('back(), should show wizard UI', () => {
    component.showManualDatabaseForm = true;
    component.back();
    expect(component.showManualDatabaseForm).toEqual(false);
  });
});
