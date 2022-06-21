import { SharedModule } from '@shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TransientService } from 'mdo-ui-library';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ChipsInputComponent } from './chips-input.component';

describe('ChipsInputComponent', () => {
  let component: ChipsInputComponent;
  let fixture: ComponentFixture<ChipsInputComponent>;
  let transientService: TransientService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChipsInputComponent ],
      imports: [ AppMaterialModuleForSpec, SharedModule],
      providers: [TransientService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipsInputComponent);
    component = fixture.componentInstance;
    transientService = fixture.debugElement.injector.get(TransientService);
    component.inputEl = jasmine.createSpyObj('elRef', ['nativeElement']);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('writeValue(), should change the value of the control', async () => {
    component.writeValue('name');
    expect(component.selectedValues.length).toEqual(1);
    component.selectedValues.length = 0;

    component.writeValue(['name', 'name1']);
    expect(component.selectedValues.length).toEqual(2);
  });

  it('registerOnChange(), should register change', () => {
    const fn = () => {};
    component.registerOnChange(fn);
    expect(component.onChange).toEqual(fn);
  });

  it('registerOnTouched(), should register on touch and call onTouched', () => {
    const fn = () => {};
    component.registerOnTouched(fn);
    expect(component.onTouched).toEqual(fn);
  });

  it('emitValueChange(), should emit the current value', () => {
    spyOn(component.valueChange, 'emit');
    component.selectedValues = ['one', 'two'];
    component.emitValueChange();
    expect(component.valueChange.emit).toHaveBeenCalled();
  });

  it('remove(), should remove items from selected values', () => {
    component.selectedValues = ['one', 'two'];
    component.remove('one');
    expect(component.selectedValues.length).toEqual(1);
    component.remove('two');
    expect(component.selectedValues.length).toEqual(0);
  });

  it('afterKeyPress(), should add values to selected values and emit value change', () => {
    spyOn(component.valueChange, 'emit');
    spyOn(transientService, 'open');
    component.selectedValues = ['one', 'two'];
    component.control.setValue('three');
    component.afterKeyPress({keyCode: 13});
    expect(component.selectedValues.length).toEqual(3);
    expect(component.valueChange.emit).toHaveBeenCalled();

    component.control.setValue('three');
    component.afterKeyPress({keyCode: 13});
    expect(transientService.open).toHaveBeenCalled();
    expect(component.valueChange.emit).toHaveBeenCalled();

    component.control.setValue('');
    component.afterKeyPress({keyCode: 8});
    expect(component.selectedValues.length).toEqual(2);
    expect(component.valueChange.emit).toHaveBeenCalled();
  });
});
