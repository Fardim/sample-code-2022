import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaExecutionLogsComponent } from './schema-execution-logs.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';

describe('SchemaExecutionLogsComponent', () => {
  let component: SchemaExecutionLogsComponent;
  let fixture: ComponentFixture<SchemaExecutionLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemaExecutionLogsComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        AppMaterialModuleForSpec,
        SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaExecutionLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
