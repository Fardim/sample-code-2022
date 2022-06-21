import { SharedModule } from '@modules/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { NotificationConfigComponent } from './notification-config.component';

describe('NotificationConfigComponent', () => {
  let component: NotificationConfigComponent;
  let fixture: ComponentFixture<NotificationConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationConfigComponent],
      imports: [HttpClientTestingModule, AppMaterialModuleForSpec, SharedModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call toggleNotifications()', () => {
    component.showNotifications = true;
    expect(component.showNotifications).toBe(true);
    component.toggleNotifications();
    expect(component.showNotifications).toBe(false);
  });

  it('should call masterToggle()', () => {
    component.dataSource = [
      { eventId: 0, eventName: 'Event 1', allowDesktopNotification: false, allowMobileNotification: true, emailNotification: '1' },
      { eventId: 1, eventName: 'Event 2', allowDesktopNotification: true, allowMobileNotification: true, emailNotification: '2' },
      { eventId: 2, eventName: 'Event 3', allowDesktopNotification: true, allowMobileNotification: false, emailNotification: '3' },
      { eventId: 3, eventName: 'Event 4', allowDesktopNotification: false, allowMobileNotification: false, emailNotification: '1' },
    ];
    expect(component.dataSource.length).toEqual(4);
    component.masterToggle(0, 'allowDesktopNotification', true);
    expect(component.dataSource[0].allowDesktopNotification).toBe(true);
  });
});
