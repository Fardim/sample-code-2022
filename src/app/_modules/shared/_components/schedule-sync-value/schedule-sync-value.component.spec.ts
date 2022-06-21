import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormBuilder } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleSyncValueComponent } from './schedule-sync-value.component';

describe('ScheduleSyncValueComponent', () => {
  let component: ScheduleSyncValueComponent;
  let fixture: ComponentFixture<ScheduleSyncValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleSyncValueComponent ],
      imports:[
        AppMaterialModuleForSpec, RouterTestingModule
      ],
      providers: [FormBuilder]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleSyncValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
