import { ConnectorService } from './../services/connector.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { SapOdataLoginComponent } from './sap-odata-login.component';

describe('SapOdataLoginComponent', () => {
  let component: SapOdataLoginComponent;
  let fixture: ComponentFixture<SapOdataLoginComponent>;
  let connectorService: ConnectorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapOdataLoginComponent ],
      imports:[ AppMaterialModuleForSpec, SharedModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SapOdataLoginComponent);
    component = fixture.componentInstance;
    connectorService = fixture.debugElement.injector.get(ConnectorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
