import { SapwsService } from '@services/sapws/sapws.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpiPackageSelectionComponent } from './cpi-package-selection.component';
import { ConnectorService } from '../../services/connector.service';

describe('CpiPackageSelectionComponent', () => {
  let component: CpiPackageSelectionComponent;
  let fixture: ComponentFixture<CpiPackageSelectionComponent>;
  let sapwsService: SapwsService;
  let connectorService: ConnectorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpiPackageSelectionComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpiPackageSelectionComponent);
    component = fixture.componentInstance;
    connectorService = fixture.debugElement.injector.get(ConnectorService);
    sapwsService = fixture.debugElement.injector.get(SapwsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
