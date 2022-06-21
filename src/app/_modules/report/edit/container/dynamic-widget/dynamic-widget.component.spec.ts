import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicWidgetComponent } from './dynamic-widget.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SvgIconComponent } from '@modules/shared/_components/svg-icon/svg-icon.component';
import { SharedModule } from '@modules/shared/shared.module';

describe('DynamicWidgetComponent', () => {
  let component: DynamicWidgetComponent;
  let fixture: ComponentFixture<DynamicWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicWidgetComponent, SvgIconComponent ],
      imports:[ MdoUiLibraryModule,
        AppMaterialModuleForSpec,
        HttpClientTestingModule,
        SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicWidgetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
