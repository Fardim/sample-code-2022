import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { TransactionTextareaComponent } from './transaction-textarea.component';

describe('TransactionTextareaComponent', () => {
  let component: TransactionTextareaComponent;
  let fixture: ComponentFixture<TransactionTextareaComponent>;
  let tranService: TransactionService;

  const fieldObj =  {
    fieldId: 'FLD_1',
    structureId: 1,
    order: 0,
    moduleId: 500,
    fieldType: 'FIELD',
    isMandatory: false,
    isRuleHidden: false,
    description: 'First name',
    isReadOnly: false,
    fieldCtrl: {
        description: 'First name' ,
        dataType: 'CHAR',
        pickList: '2',
        maxChar: 20,
        structureId: 1,
        fieldId: 'FLD_1',
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
    },
    tabDetails: null,
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionTextareaComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule, HttpClientTestingModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionTextareaComponent);
    component = fixture.componentInstance;
    component.control = new FormControl('');
    component.controlName = 'FLD_1';
    component.fieldObj = fieldObj;
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
        mappingId: 1
      },
      {
        conditions: [
          {
            sourceField: 'FLD_1',
            targetField: 'FLD_3'
           }
         ],
         mappingId: 2
      }]
    ]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('ngOnInit()', () => {
    const spyLocaleObj = spyOn(component.transService, 'getLocale');
    const spySaveRecordObj =  spyOn(component.transService.savedRecordData$, 'subscribe');

    component.ngOnInit();
    expect(spyLocaleObj).toHaveBeenCalled();
    expect(spySaveRecordObj).toHaveBeenCalled();
  });

  it('afterBlur()', () => {
    const validateRuleSpyObj = spyOn(component.transService.updateValidators, 'next');
    component.afterBlur();
    expect(validateRuleSpyObj).toHaveBeenCalled();
  });
});
