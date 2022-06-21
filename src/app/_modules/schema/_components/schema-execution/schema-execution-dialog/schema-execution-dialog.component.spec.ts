import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SchemaExecutionDialogComponent } from './schema-execution-dialog.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ThousandconvertorPipe } from 'src/app/_modules/shared/_pipes/thousandconvertor.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaExecutionRequest } from 'src/app/_models/schema/schema-execution';
import { SchemaService } from '@services/home/schema.service';
import { of } from 'rxjs';
import { SchemaExecutionService } from '@services/home/schema/schema-execution.service';
import { SharedModule } from '@modules/shared/shared.module';

describe('SchemaExecutionDialogComponent', () => {
  let component: SchemaExecutionDialogComponent;
  let fixture: ComponentFixture<SchemaExecutionDialogComponent>;
  let schemaService:SchemaService;
  let schemaExecutionService: SchemaExecutionService;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaExecutionDialogComponent, ThousandconvertorPipe],
      imports: [ MatDialogModule, AppMaterialModuleForSpec, HttpClientModule, RouterTestingModule, SharedModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, { provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaExecutionDialogComponent);
    component = fixture.componentInstance;
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaExecutionService = fixture.debugElement.injector.get(SchemaExecutionService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should close the dialog', () => {
    component.closeDialog();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('scheduleSchema()', () => {
    const schemaExecutionReq: SchemaExecutionRequest = new SchemaExecutionRequest();
    schemaExecutionReq.schemaId =  component.data.schemaId;
    schemaExecutionReq.variantId = '0'; // 0 for run all
    const isRunWithCheckedData = false;
    spyOn(schemaExecutionService,'scheduleSChema').withArgs(schemaExecutionReq, isRunWithCheckedData).and.returnValue(of());

    component.scheduleSchema();
    expect(component.scheduleSchema).toBeTruthy();
    expect(schemaExecutionService.scheduleSChema).toHaveBeenCalledWith(schemaExecutionReq, isRunWithCheckedData);
  });

  it('ngOnit(), init preloaded', async(()=>{
    const data = {schemaId:'25364565362'};
    component.data = data;
    spyOn(schemaService,'scheduleSchemaCount').withArgs(component.data.schemaId).and.returnValue(of(241));
    component.ngOnInit();
    expect(schemaService.scheduleSchemaCount).toHaveBeenCalledWith(component.data.schemaId);
  }));
});
