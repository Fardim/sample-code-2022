import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { ConnectionService } from '@services/connection/connection.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SyncFreqComponent } from './sync-freq.component';

describe('SyncFreqComponent', () => {
  let component: SyncFreqComponent;
  let fixture: ComponentFixture<SyncFreqComponent>;
  let connectionService: ConnectionService;

  const syncEvent = {
    formValue: {
      customDate: '2021-12-23',
      ends: 'NEVER',
      every: '12',
      repeat: 'hourly',
      repeatLabel: 'hours',
      repeatMonthDay: 'DOM',
      repeatOnWeek: 'MON',
      starts: ''
    },
    isFormValid: true
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncFreqComponent ],
      imports:  [ SharedModule, RouterTestingModule, AppMaterialModuleForSpec, MdoUiLibraryModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncFreqComponent);
    component = fixture.componentInstance;
    connectionService = fixture.debugElement.injector.get(ConnectionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('scheduleSync(), should get emitted value from schedule sync component', ()=>{
    component.scheduleSync(syncEvent);
    expect(component.isSyncFrequencyFormValid).toEqual(syncEvent.isFormValid);
    expect(component.syncFrequencyData).toEqual(syncEvent.formValue);
  })

  it('save(), save syncfrequency if error', async(() => {
    component.isSyncFrequencyFormValid = false;
    component.save();
    expect(component.showErrorBanner).toBeTruthy();
  }))

  it('save(), should save syncfrequency ', async(() => {
    component.syncFrequencyData = syncEvent.formValue;
    component.isSyncFrequencyFormValid = true;
    spyOn(component,'close');
    spyOn(connectionService, 'saveSyncFrequency').and.returnValue(of({}));
    component.save();
    expect(component.close).toHaveBeenCalled();
  }))
});
