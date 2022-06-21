import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { CharacteristicsMutationRowComponent } from './characteristics-mutation-row.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

describe('CharacteristicsMutationRowComponent', () => {
  let component: CharacteristicsMutationRowComponent;
  let fixture: ComponentFixture<CharacteristicsMutationRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharacteristicsMutationRowComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacteristicsMutationRowComponent);
    component = fixture.componentInstance;
    component.fieldTypeList = [
      { name: 'TEXT' },
      { name: 'DROPDOWN' },
      { name: 'DATE' },
      { name: 'TIME' },
      { name: 'CURRENCY' },
      { name: 'RICH TEXT EDITOR' }
    ];
    component.characteristicsForm = new FormGroup({
      selected: new FormControl(false),
      labels: new FormArray([]),
      enableDuplicateCheck: new FormControl(false),
      charCode: new FormControl('', [Validators.required]),
      charDesc: new FormControl('', [Validators.required]),
      numCode: new FormControl('', []),
      fieldType: new FormControl('', [Validators.required]),
      dataType: new FormControl({ value: '', disabled: true }, [Validators.required]),
      length: new FormControl({ value: '', disabled: true }, []),

      // TO FIX, property name with request Payload
      decimal: new FormControl({ value: '', disabled: true }, []),
      currency: new FormControl({ value: '', disabled: true }, []),

      prefix: new FormControl('', []),
      longPrefix: new FormControl('', []),
      suffix: new FormControl('', []),
      longSuffix: new FormControl('', []),

      // TO FIX, property name with request Payload
      isAllowMultipleValue: new FormControl(true, []),

      isManatory: new FormControl(true, []),

      // TO FIX, property name with request Payload
      isAllowValueRange: new FormControl({ value: false, disabled: true }, []),
      isAllowUpperCase: new FormControl({ value: false, disabled: true }, []),
      isAllowNegative: new FormControl({ value: false, disabled: true }, []),
      isAllowNewValue: new FormControl({ value: false, disabled: true }, []),

      dimensionType: new FormControl('', []),

      // TO FIX, property name with request Payload
      defaultUoM: new FormControl('', []),
      status: new FormControl(true, []),
      validFrom: new FormControl('', []),
      validTo: new FormControl('', []),

      helpText: new FormControl('', []),
      sapChars: new FormControl('', []),
    });
    component.selectedLabel = {
      language: 'en',
      label: '',
    };
    const labels = {
      label: 'en',
      language: 'english'
    }
    component.labelsFormArray.push(new FormControl(labels));
    fixture.detectChanges();

  });

  it('onFieldTypeChange()', () => {
    component.onFieldTypeChange({ option: { value: 'TEXT' } });
    expect(component.typeList[0].name).toEqual('CHAR');

    component.onFieldTypeChange({ option: { value: 'CURRENCY' } });
    expect(component.typeList[0].name).toEqual('NUMC');

    component.onFieldTypeChange({ option: { value: 'DROPDOWN' } });
    expect(component.typeList[0].name).toEqual('CHAR');
  });
});