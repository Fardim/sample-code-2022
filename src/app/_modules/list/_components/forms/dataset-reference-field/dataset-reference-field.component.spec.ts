import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetReferenceFieldComponent } from './dataset-reference-field.component';
import { Router, ActivatedRoute } from '@angular/router';

describe('DatasetReferenceFieldComponent', () => {
  let component: DatasetReferenceFieldComponent;
  let fixture: ComponentFixture<DatasetReferenceFieldComponent>;
  let router: Router;
  const queryParams = { f: '1' };
  const routeParams = { moduleId: '91' };
  const panel = 'property-panel';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetReferenceFieldComponent ],
      imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetReferenceFieldComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
