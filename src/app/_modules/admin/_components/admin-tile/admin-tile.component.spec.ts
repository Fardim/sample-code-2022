import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTileComponent } from './admin-tile.component';
import { BreadcrumbComponent } from '../../../shared/_components/breadcrumb/breadcrumb.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';

describe('AdminTileComponent', () => {
  let component: AdminTileComponent;
  let fixture: ComponentFixture<AdminTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule,
        SharedModule
      ],
      declarations: [ AdminTileComponent, BreadcrumbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('linker(), should create', () => {
    component.link = 'test';
    component.link2 = null;
    component.count = 0;
    expect(component.linker()).toEqual('test');

    component.link2 = 'test2';
    component.count = 2;
    expect(component.linker()).toEqual('test2');
  });
});
