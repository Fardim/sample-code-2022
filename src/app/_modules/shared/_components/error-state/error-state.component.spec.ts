import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  let component: ErrorStateComponent;
  let fixture: ComponentFixture<ErrorStateComponent>;
  let schemaDetailsService: SchemaDetailsService;
  let sharedService: SharedServiceService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorStateComponent ],
      imports:[
        AppMaterialModuleForSpec,
        HttpClientTestingModule
      ],
      providers:[
        TransientService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorStateComponent);
    component = fixture.componentInstance;
    schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
    sharedService = fixture.debugElement.injector.get(SharedServiceService);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges(), on change hooks check the error code', async(()=>{
    // mock data
    const changes: SimpleChanges = {errorCode:{currentValue:'hello',firstChange:false,isFirstChange:null,previousValue:null}};
    component.ngOnChanges(changes);
    expect(component.errorCode).toEqual('HELLO');
  }));

  it('createQueueAndRerunSchema(), create the queue and execute schema internally ', async(()=>{
    // mock data
    component.schemaId = '1001';
    component.variantId = '0';
    component.queues = ['schema_execute_details','schema_download_queue'];

    spyOn(schemaDetailsService,'createQueueAndRunSchema').withArgs(component.queues,component.schemaId,component.variantId,false).and.returnValue(of('121'));
    spyOn(sharedService,'setSchemaRunNotif').withArgs(true);

    component.createQueueAndRerunSchema();

    expect(schemaDetailsService.createQueueAndRunSchema).toHaveBeenCalledWith(component.queues,component.schemaId,component.variantId,false);
    expect(sharedService.setSchemaRunNotif).toHaveBeenCalledWith(true);



  }));

});
