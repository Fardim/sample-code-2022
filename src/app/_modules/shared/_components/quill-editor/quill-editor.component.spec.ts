import { SharedModule } from '@modules/shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuillEditorComponent } from './quill-editor.component';
import { FormControl } from '@angular/forms';
import { SimpleChanges } from '@angular/core';

describe('QuillEditorComponent', () => {
  let component: QuillEditorComponent;
  let fixture: ComponentFixture<QuillEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuillEditorComponent ],
      imports: [SharedModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuillEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges(), should detect value change and update accordingly', async () => {
    component.control = new FormControl('');
    const changes: SimpleChanges = {
      value: {
        previousValue: null,
        currentValue: 'Test value',
        firstChange: null,
        isFirstChange: null
      },
      required: {
        previousValue: null,
        currentValue: true,
        firstChange: null,
        isFirstChange: null
      }
    };

    spyOn(component.valueChange, 'emit').and.returnValue(null);
    component.ngOnChanges(changes);
    expect(component.control.value).toEqual('Test value');
    expect(component.isRequired).toBeTrue();
  });

  it('writeValue(), should change the value of the control', async () => {
    component.writeValue('<p>test val</p>');
    expect(component.control.value).toEqual('<p>test val</p>');
  });

  // it('set value(), should set passed value to the form control', async () => {
  //   component.value = 'Initial Value';
  //   expect(component.control.value).toEqual('Initial Value');
  // });

  it('set disabled(), should set form control disable', async () => {
    component.disabled = true;
    expect(component.control.disabled).toBeTrue();
  });

  it('setDisabledState(), should set setDisabledState', async () => {
    component.setDisabledState(true);
    expect(component.control.disabled).toBeTrue();

    component.setDisabledState(false);
    expect(component.control.disabled).toBeFalse();
  });

  it('registerOnTouched(), should register the touch event', () => {
    component.control = new FormControl('');
    spyOn(component.afterBlur, 'emit');

    component.registerOnTouched('focus');
    expect(component.isActive).toBeTrue();

    component.registerOnTouched('blur');
    expect(component.afterBlur.emit).toHaveBeenCalled();
  });

});
