import { FormGroup, FormControl } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { FieldValuesBlockComponent } from './field-values-block.component';

describe('FieldValuesBlockComponent', () => {
  let component: FieldValuesBlockComponent;
  let fixture: ComponentFixture<FieldValuesBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldValuesBlockComponent ],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldValuesBlockComponent);
    component = fixture.componentInstance;
    const fg = new FormGroup({
      field1Val: new FormControl(''),
      field2Val: new FormControl(''),
      field3Val: new FormControl(''),
    });
    component.fieldValuesGrp = fg;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
