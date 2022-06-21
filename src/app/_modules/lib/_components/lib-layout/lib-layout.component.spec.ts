import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibLayoutComponent } from './lib-layout.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';

describe('LibLayoutComponent', () => {
  let component: LibLayoutComponent;
  let fixture: ComponentFixture<LibLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AppMaterialModuleForSpec,
        SharedModule
      ],
      declarations: [ LibLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
