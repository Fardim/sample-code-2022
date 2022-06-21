import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { DiwViewTabsComponent } from './diw-view-tabs.component';

describe('DiwViewTabsComponent', () => {
  let component: DiwViewTabsComponent;
  let fixture: ComponentFixture<DiwViewTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiwViewTabsComponent ],
      imports: [ HttpClientTestingModule, SharedModule, AppMaterialModuleForSpec],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiwViewTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
