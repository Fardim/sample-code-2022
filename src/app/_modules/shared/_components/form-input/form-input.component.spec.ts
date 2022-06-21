import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputComponent } from './form-input.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormControl, Validators } from '@angular/forms';

describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInputComponent ],
      imports: [AppMaterialModuleForSpec]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onBlur(), with value should update input value', async() => {
    component.control = new FormControl('');
    const emitBlurEventSpy = spyOn(component.emitBlurEvent, 'emit');
    component.onBlur('updated value');
    expect(emitBlurEventSpy).toHaveBeenCalled();
  });

  it('isRequired(), should check if the input field is required', async() => {
    component.control = new FormControl('', Validators.required);
    expect(component.isRequired).toBeTrue();

    component.control = new FormControl('');
    expect(component.isRequired).toBeFalse();
  });
});
