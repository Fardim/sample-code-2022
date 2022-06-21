import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { EditLabelComponent, UpdateValue } from './edit-label.component';

describe('EditLabelComponent', () => {
  let component: EditLabelComponent;
  let fixture: ComponentFixture<EditLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLabelComponent ],
      imports: [AppMaterialModuleForSpec]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('subscribeinputControl(), should subscribe to input control changes', () => {
      spyOn(component, 'inputBlur').withArgs('Test value');
      component.inputControl = new FormControl('', {updateOn: 'blur'});
      component.subscribeinputControl();
      component.inputControl.setValue('Test value');
      expect(component.inputBlur).toHaveBeenCalledWith('Test value');
  });

  it('inputBlur(), should emit value change', () => {
    const valueUpdate: UpdateValue = {
      currentValue: 'New',
      previousValue: 'Old'
    };
    component.value = 'Old';
    spyOn(component.valueChange, 'emit').withArgs(valueUpdate);
    component.inputBlur('New');
    expect(component.valueChange.emit).toHaveBeenCalledWith(valueUpdate);
  });

  it('emitBlur(), should call inputBlur event', () => {
    spyOn(component, 'inputBlur');
    component.emitBlur();
    expect(component.inputBlur).toHaveBeenCalled()
  })
});
