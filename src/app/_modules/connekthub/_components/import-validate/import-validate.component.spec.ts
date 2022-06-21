import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportValidateComponent } from './import-validate.component';

describe('ImportValidateComponent', () => {
  let component: ImportValidateComponent;
  let fixture: ComponentFixture<ImportValidateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportValidateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportValidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
