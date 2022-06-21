import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashMenuComponent } from './dash-menu.component';

describe('DashMenuComponent', () => {
  let component: DashMenuComponent;
  let fixture: ComponentFixture<DashMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashMenuComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
