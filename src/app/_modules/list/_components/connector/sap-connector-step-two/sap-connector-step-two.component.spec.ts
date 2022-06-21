import { ConnectorService } from './../services/connector.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SapConnectorStepTwoComponent } from './sap-connector-step-two.component';
import { SharedModule } from '@modules/shared/shared.module';

describe('SapConnectorStepTwoComponent', () => {
  let component: SapConnectorStepTwoComponent;
  let fixture: ComponentFixture<SapConnectorStepTwoComponent>;
  let connectorService: ConnectorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapConnectorStepTwoComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SapConnectorStepTwoComponent);
    component = fixture.componentInstance;
    connectorService = fixture.debugElement.injector.get(ConnectorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
