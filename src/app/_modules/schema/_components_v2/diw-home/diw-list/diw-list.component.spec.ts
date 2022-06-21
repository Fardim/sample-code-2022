import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { DiwListComponent } from './diw-list.component';

describe('DiwListComponent', () => {
  let component: DiwListComponent;
  let fixture: ComponentFixture<DiwListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiwListComponent ],
      imports: [ RouterTestingModule, HttpClientTestingModule, SharedModule, AppMaterialModuleForSpec],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiwListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
