import { SapwsService } from '@services/sapws/sapws.service';
import { ConnectorService } from './../../services/connector.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpiStandardPackageComponent } from './cpi-standard-package.component';

describe('CpiStandardPackageComponent', () => {
  let component: CpiStandardPackageComponent;
  let fixture: ComponentFixture<CpiStandardPackageComponent>;
  let sapwsService: SapwsService;
  let connectorService: ConnectorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpiStandardPackageComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpiStandardPackageComponent);
    component = fixture.componentInstance;
    connectorService = fixture.debugElement.injector.get(ConnectorService);
    sapwsService = fixture.debugElement.injector.get(SapwsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
