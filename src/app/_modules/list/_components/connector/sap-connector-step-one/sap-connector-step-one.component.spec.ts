import { ConnectorService } from './../services/connector.service';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SapConnectorStepOneComponent } from './sap-connector-step-one.component';

describe('SapConnectorStepOneComponent', () => {
  let component: SapConnectorStepOneComponent;
  let fixture: ComponentFixture<SapConnectorStepOneComponent>;
  let connectorService: ConnectorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapConnectorStepOneComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SapConnectorStepOneComponent);
    component = fixture.componentInstance;
    connectorService = fixture.debugElement.injector.get(ConnectorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
