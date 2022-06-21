import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InterfacesComponent } from './interfaces.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';


describe('InterfacesComponent', () => {
  let component: InterfacesComponent;
  let fixture: ComponentFixture<InterfacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        InterfacesComponent
      ],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec],
      providers: [
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfacesComponent);
    component = fixture.componentInstance;
  });

  it('testing ngOnInit', () => {
    component.ngOnInit()
    expect(component.ngOnInit).toBeTruthy();
  })

  it('testing remove', () => {
    component.fruits = ['test', 'tttt']
    component.remove('test');
    component.remove('hhh')
    expect(component.remove).toBeTruthy();
  });

  it('selected(), should select a value for autocomplete', () => {
    component.fruitCtrl = new FormControl(null);
      const event: MatAutocompleteSelectedEvent = {
        option: {
          viewValue: 'Test',
          value: 'test'
        }
      } as MatAutocompleteSelectedEvent;
      component.fruitInput = jasmine.createSpyObj('elRef', ['nativeElement']);
      component.selected(event);
      expect(component.fruits.length).toEqual(2);
  });

  it('remove(), should remove the passed item to selected items array', () => {
    component.fruitCtrl = new FormControl();
    component.fruits = [];
    component.allFruits = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
    const event = {
      option: {
        viewValue: 'Lemon'
      },
      source: null
    } as MatAutocompleteSelectedEvent;
    component.fruitInput = jasmine.createSpyObj('elRef', ['nativeElement']);
    component.selected(event);
    component.remove('Lemon');
    expect(component.fruits.length).toEqual(0);
  });

  it('filter(), should returned filtered values based on the search string', () => {
    component.fruitCtrl = new FormControl();
    component.fruits = [];
    component.allFruits = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
    const values = component._filter('Lemon');
    expect(values.length).toEqual(1);

    component.fruitCtrl.valueChanges.pipe(
      startWith(''),
      map((num: string | null) => {
        expect(num).toEqual('Lemon');
      }));
    component.fruitCtrl.setValue('Lemon');
  });
});
