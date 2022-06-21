import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { FieldResponse } from '@modules/transaction/model/transaction';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { TransactionControlComponent } from './transaction-control.component';

describe('TransactionControlComponent', () => {
  let component: TransactionControlComponent;
  let fixture: ComponentFixture<TransactionControlComponent>;
  let tranService: TransactionService;
  const fieldObj: any = [
    {
        fieldId: 'FLD_F397233122',
        structureId: 1,
        order: 0,
        moduleId: 500,
        fieldType: 'FIELD',
        isMandatory: false,
        isRuleHidden: false,
        fieldCtrl: {
            description: 'First name' ,
            dataType: 'CHAR',
            pickList: '0',
            maxChar: 20,
            structureId: 1,
            fieldId: 'FLD_F397233122',
            isCriteriaField: false,
            isWorkFlow: false,
            isGridColumn: false,
            isDescription: false,
            textCase: 'UPPER',
            isFutureDate: false,
            isPastDate: false,
            moduleId: 500,
            isReference: false,
            isDefault: false,
            isHeirarchy: false,
            isWorkFlowCriteria: false,
            isNumSettingCriteria: false,
            isCheckList: false,
            isCompBased: false,
            dateModified: 1640934867149,
            isTransient: false,
            isSearchEngine: false,
            isPermission: false,
            isMandatory: false,
            isKeyField: false,
            structDesc: 'Header Data',
            isReadOnly: false,
        }
    },
    {
        fieldId: 'FLD_1640934837077',
        structureId: 1,
        order: 2,
        moduleId: 500,
        fieldType: 'FIELD',
        description: 'Email',
        fieldCtrl: {
            description: 'Email',
            dataType: 'EMAIL',
            pickList: '0',
            maxChar: 20,
            structureId: 1,
            fieldId: 'FLD_1640934837077',
            isCriteriaField: false,
            isWorkFlow: false,
            isGridColumn: false,
            isDescription: false,
            textCase: 'UPPER',
            isFutureDate: false,
            isPastDate: false,
            moduleId: 500,
            isReference: false,
            isDefault: false,
            isHeirarchy: false,
            isWorkFlowCriteria: false,
            isNumSettingCriteria: false,
            isCheckList: false,
            isCompBased: false,
            dateModified: 1640934867195,
            isTransient: false,
            isSearchEngine: false,
            isPermission: false,
            isMandatory: false,
            isKeyField: false,
            structDesc: 'Header Data',
            isReadOnly: false,
        }
    },
    {
        fieldId: 'FLD_L397233123',
        structureId: 1,
        order: 1,
        moduleId: 500,
        fieldType: 'FIELD',
        fieldCtrl: {
            description: 'Last name',
            dataType: 'CHAR',
            pickList: '0',
            maxChar: 20,
            structureId: 1,
            fieldId: 'FLD_L397233123',
            isCriteriaField: false,
            isWorkFlow: false,
            isGridColumn: false,
            isDescription: false,
            textCase: 'UPPER',
            isFutureDate: false,
            isPastDate: false,
            moduleId: 500,
            isReference: false,
            isDefault: false,
            isHeirarchy: false,
            isWorkFlowCriteria: false,
            isNumSettingCriteria: false,
            isCheckList: false,
            isCompBased: false,
            dateModified: 1640934867194,
            isTransient: false,
            isSearchEngine: false,
            isPermission: false,
            isMandatory: false,
            isKeyField: false,
            structDesc: 'Header Data',
            isReadOnly: false,
        }
    },
    {
      fieldId: 'FLD_L397233124',
      structureId: 1,
      order: 1,
      moduleId: 500,
      fieldType: 'FIELD',
    },
    {
      fieldId: 'FLD_L397233125',
      structureId: 1,
      order: 1,
      moduleId: 500,
      fieldType: 'FIELD',
      fieldCtrl: {
        description: 'Last name',
        dataType: 'CHAR',
        maxChar: 20,
        structureId: 1,
        fieldId: 'FLD_L397233123',
        isCriteriaField: false,
        isWorkFlow: false,
        isGridColumn: false,
        isDescription: false,
        textCase: 'UPPER',
        isFutureDate: false,
        isPastDate: false,
        moduleId: 500,
        isReference: false,
        isDefault: false,
        isHeirarchy: false,
        isWorkFlowCriteria: false,
        isNumSettingCriteria: false,
        isCheckList: false,
        isCompBased: false,
        dateModified: 1640934867194,
        isTransient: false,
        isSearchEngine: false,
        isPermission: false,
        isMandatory: false,
        isKeyField: false,
        structDesc: 'Header Data',
        isReadOnly: false,
      },
    }
  ];

  const fieldErros = [
    {
      errors: {
        required: true,
        invalidNumber: false,
        maxlength: false,
        minlength: false,
        invalidDecimal: false
      }
    },
    {
      errors: {
        required: false,
        invalidNumber: true,
        maxlength: false,
        minlength: false,
        invalidDecimal: false
      }
    },
    {
      errors: {
        required: false,
        invalidNumber: false,
        maxlength: {
          requiredLength: 25
        },
        minlength: false,
        invalidDecimal: false
      }
    },
    {
      errors: {
        required: false,
        invalidNumber: false,
        maxlength: false,
        minlength:  {
          requiredLength: 5
        },
        invalidDecimal: false
      }
    }
  ];

  const fieldErrorsExpected = [
    'This is a required field',
    'Please Enter Number Only',
    'Maximum Letters of 25',
    'Minimum Letters of 5'
  ];


  const onChangesTestCases: Array<SimpleChanges> = [
    {
      generateDescriptionValue: {
        currentValue: 'Test',
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      }
    },
    {
      tabDetails: {
        currentValue: {
          isTabReadOnly: false
        },
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      }
    },
    {
      tabDetails: {
        currentValue: {
          isTabReadOnly: true
        },
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      }
    },
    {
      control: {
        currentValue: new FormControl('Test'),
        previousValue: null,
        firstChange: true,
        isFirstChange:  () => true,
      }
    }
  ]


  // rules = [];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionControlComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tranService = fixture.debugElement.injector.get(TransactionService);

    spyOn(tranService, 'getRules').and.returnValues([
      [{
        conditions: [
         {
           sourceField: 'FLD_1',
           targetField: 'FLD_2'
          },
          {
            sourceField: 'FLD_3',
            targetField: 'FLD_1'
          }
        ],
        mappingId: 1,
      },
      {
        conditions: [
          {
            sourceField: 'FLD_1',
            targetField: 'FLD_3'
           }
         ],
         mappingId: 2,
      }]
    ]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit()', () => {
    const savedRecordDataSpy = spyOn(tranService.savedRecordData$, 'subscribe');
    const runAllRulesSpy = spyOn(tranService.runAllRules$, 'subscribe');

    component.ngOnInit();
    expect(savedRecordDataSpy).toHaveBeenCalled();
    expect(runAllRulesSpy).toHaveBeenCalled();
  });

  it('ngOnChanges() for generate Description', () => {
     component.control = new FormControl('');
     component.ngOnChanges(onChangesTestCases[0]);
     expect(component.control.value).toEqual(onChangesTestCases[0].generateDescriptionValue.currentValue);
  });

  it('ngOnChanges() for tabDetails', () => {
    component.ngOnChanges(onChangesTestCases[1]);
    expect(component.tabDetails).toEqual(onChangesTestCases[1].tabDetails.currentValue);
  });

  it('ngOnChanges() for tabDetails readOnly', () => {
    component.ngOnChanges(onChangesTestCases[2]);
    expect(component.isFieldReadOnly).toEqual(true);
  });

  it('should return correct field type for Date Filed', () => {
    fieldObj.forEach((item: FieldResponse) => {
      if(item?.fieldCtrl?.pickList === '52') {
        expect(component.isDateField()).toEqual(true);
      }else {
        expect(component.isDateField()).toEqual(false);
      }
    })
  });

  it('should return correct field type for List Filed', () => {
    fieldObj.forEach((item: FieldResponse) => {
      if(item?.fieldCtrl?.pickList === '1' || item?.fieldCtrl?.pickList === '37') {
        expect(component.isListField()).toEqual(true);
      }else {
        expect(component.isListField()).toEqual(false);
      }
    })
  });

  it('rulesForControlAsSource() should return rules of Control', () => {
    component.controlName = 'FLD_1';
    const controlRules = component.rulesForControlAsSource();
    console.log('Source: controlRules: ', controlRules);
    expect(controlRules.length).toEqual(2);
  });

  it('rulesForControlAsTarget() should return rules of control as target', () => {
    component.controlName = 'FLD_1';
    const controlRules = component.rulesForControlAsTarget();
    console.log('Target: controlRules: ', controlRules);
    expect(controlRules.length).toEqual(1);
  });

  it('getErrorHint() should return errors hint for errors in control', () => {
    fieldErros.forEach((error: any, index: number) => {
      expect(component.getErrorHint(error, fieldObj[0])).toEqual(fieldErrorsExpected[index]);
    })
  });

  it('validateFieldRules() should trigger rule in case of rule criteria meet', () => {
    const nextSpy = spyOn(tranService.updateValidators, 'next');
    component.controlName = 'FLD_3';
    component.control = new FormControl('Dummy');
    component.validateFieldRules();
    expect(nextSpy).toHaveBeenCalled();
  });

  it('validateFieldRules() should trigger rule in case of rule criteria meet', () => {
    component.controlName = 'FLD_XX';
    expect(component.validateFieldRules()).toBe(undefined);
  });

  // it('customDistinctUntilChanged()', () => {
  //   const testData = [
  //     {
  //       pre: [{
  //         code: 1
  //       }],
  //       curr: [{
  //         code: 1
  //       }],
  //       expect: false
  //     },
  //     {
  //       pre: [{
  //         code: '1'
  //       }],
  //       curr: [{
  //         code: 1
  //       }],
  //       expect: false
  //     },
  //     {
  //       pre: 1,
  //       curr: 1,
  //       expect: false
  //     },
  //     {
  //       pre: [{
  //         code: 1
  //       }],
  //       curr: [{
  //         code: '2'
  //       }],
  //       expect: true
  //     },
  //     {
  //       pre: {},
  //       curr: [{
  //         code: '2'
  //       }],
  //       expect: true
  //     },
  //     {
  //       pre: [{
  //         code: '2'
  //       }],
  //       curr: {},
  //       expect: true
  //     },
  //   ];

  //   testData.forEach((item: any) => {
  //     expect(component.customDistinctUntilChanged(item.pre, item.curr)).toEqual(item.expect);
  //   })
  // });

  it('isRequired getter', () => {
    const testData = [
      {
        control: new FormControl(''),
        expect: false,
      },
      {
        control: new FormControl('', Validators.required),
        expect: true,
      },
      {
        control: new FormControl('', Validators.minLength(5)),
        expect: false,
      },
    ];

    testData.forEach((test: any) => {
      component.control = test.control;
      expect(component.isRequired).toEqual(test.expect);
    });
  });

  it('updateDisplayedValue()', () => {
    const newValue = {};
    const sypObj = spyOn(component, 'updateDisplayedValue');
    component.updateDisplayedValue(newValue);
    expect(sypObj).toHaveBeenCalledWith(newValue);
  });
});
