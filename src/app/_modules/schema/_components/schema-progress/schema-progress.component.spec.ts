import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { async, ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaExecutionProgressResponse } from '@models/schema/schema-execution';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SchemaProgressComponent } from './schema-progress.component';


describe('SchemaProgressComponent', () => {
  let component: SchemaProgressComponent;
  let fixture: ComponentFixture<SchemaProgressComponent>;
  let schemaService: SchemaService;
  let schemaDetailsService: SchemaDetailsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaProgressComponent ],
      imports: [
        AppMaterialModuleForSpec,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaProgressComponent);
    component = fixture.componentInstance;
    schemaService = fixture.debugElement.injector.get(SchemaService);
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('schemaExecutionProgressInfo(), should return exuection progress info of schema', async() => {
    const schemaId = '155224'
    spyOn(schemaService, 'getSchemaExecutionProgressDetails').withArgs(schemaId).and.returnValue(of({} as SchemaExecutionProgressResponse));
    component.schemaExecutionProgressInfo(schemaId);
    expect(schemaService.getSchemaExecutionProgressDetails).toHaveBeenCalledWith(schemaId);

    schemaService.getSchemaExecutionProgressDetails(schemaId).subscribe(res => {
      expect(component.schemaProgress).toEqual(res);
    })
  });

  it('getFileUploadProgress(), should return upload progress file', async() => {
    const schemaId = '155224'
    spyOn(schemaDetailsService, 'getUploadProgressPercent').withArgs(schemaId, '').and.returnValue(of({} as any));
    component.getFileUploadProgress(schemaId);
    expect(schemaDetailsService.getUploadProgressPercent).toHaveBeenCalledWith(schemaId, '');

    schemaDetailsService.getUploadProgressPercent(schemaId, '').subscribe((res: any) => {
      expect(component.dataUploadedPercent).toEqual(res);
    });
  });

  it('closeFileUploadProgress(), should emit output', async(() => {
    expect(component.closeFileUploadProgress()).toBeTruthy();
  }));

  it('ngOnchanges(), should called the ngOnchanges', async() => {
    let changes = {
      schemaId : {
        firstChange: true,
        previousValue: undefined,
        currentValue: '155224',
      } as SimpleChange
    } as SimpleChanges;
    component.schemaId = '1256252'
    component.ngOnChanges(changes);

    expect(component.schemaId).toEqual(changes.schemaId.currentValue);

    changes = {} as SimpleChanges;
    component.schemaId = '121356'
    component.ngOnChanges(changes);
    expect(component.schemaId).toEqual('121356')

  })

  it('ngOnInit(), should called ngOnInit function', fakeAsync(() => {
    component.progressHttpCallInterval = 10;
    spyOn(component, 'schemaExecutionProgressInfo');
    component.ngOnInit();

    expect(component.schemaExecutionProgressInfo).toHaveBeenCalledTimes(1);
    tick(component.progressHttpCallInterval);
    expect(component.schemaExecutionProgressInfo).toHaveBeenCalled();
    discardPeriodicTasks();
  }))

  it('ngOnInit(), should call upload progress', fakeAsync(() => {
    spyOn(component, 'getFileUploadProgress');
    component.isFileUploading = true;
    component.ngOnInit();
    expect(component.progressHttpCallInterval).toEqual(3000);

    component.progressHttpCallInterval = 10;
    expect(component.getFileUploadProgress).toHaveBeenCalledTimes(1);
    tick(component.progressHttpCallInterval);
    expect(component.getFileUploadProgress).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('cancleSchema(), cancle the schema execution ', async(()=>{
    component.schemaId = '273737127';
    // spy the service
    spyOn(schemaService, 'cancleSchema').withArgs(component.schemaId).and.returnValue(of({acknowledge:true}, throwError('500')));
    spyOn(component.runCompleted, 'emit');
    component.cancleSchema();

    expect(component.isInLoading).toBeFalse();
    expect(component.runCompleted.emit).toHaveBeenCalled();

    component.cancleSchema();
    expect(component.isInLoading).toBeFalse();

  }));
});
