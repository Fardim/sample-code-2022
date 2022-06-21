import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ConnectorService } from '../../services/connector.service';

import { CpiInterimActivitiesComponent } from './cpi-interim-activities.component';

describe('CpiInterimActivitiesComponent', () => {
  let component: CpiInterimActivitiesComponent;
  let fixture: ComponentFixture<CpiInterimActivitiesComponent>;
  let connectorService: ConnectorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpiInterimActivitiesComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpiInterimActivitiesComponent);
    component = fixture.componentInstance;
    connectorService = fixture.debugElement.injector.get(ConnectorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
