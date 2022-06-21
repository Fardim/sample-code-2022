import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { DownloadExecutionDataComponent } from './download-execution-data.component';

describe('DownloadExecutionDataComponent', () => {
  let component: DownloadExecutionDataComponent;
  let fixture: ComponentFixture<DownloadExecutionDataComponent>;
  let schemaService: SchemaService;
  let transientService: TransientService;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadExecutionDataComponent ],
      imports: [ MdoUiLibraryModule, SharedModule, AppMaterialModuleForSpec],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, { provide: MAT_DIALOG_DATA, useValue: {
          schemaId: '1701',
          requestStatus: 'error'
        }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadExecutionDataComponent);
    component = fixture.componentInstance;

    schemaService = fixture.debugElement.injector.get(SchemaService);
    transientService = fixture.debugElement.injector.get(TransientService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should downloadExecutionDetails', () => {

    spyOn(schemaService, 'downloadExecutionDetailsByNodes').and.returnValues(of({message: 'success'}), throwError({message:'api error'}));
    spyOn(transientService, 'open');
    component.downloadExecutionDetails();
    expect(transientService.open).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();

    spyOn(console, 'error');
    component.downloadExecutionDetails();
    expect(console.error).toHaveBeenCalled();
  });

  it('should nodeSelectionChanged', () => {
    component.nodeSelectionChanged('header');
    expect(component.selectedNodes.length).toEqual(1);

    component.nodeSelectionChanged('header');
    expect(component.selectedNodes.length).toEqual(0);
  });

});
