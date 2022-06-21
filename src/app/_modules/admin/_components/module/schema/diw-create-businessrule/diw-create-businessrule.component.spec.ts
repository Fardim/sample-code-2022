import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiwCreateBusinessruleComponent } from './diw-create-businessrule.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BusinessRuleType, CoreSchemaBrInfo } from '../../business-rules/business-rules.modal';
import { SharedModule } from '@modules/shared/shared.module';

describe('DiwCreateBusinessruleComponent', () => {
  let component: DiwCreateBusinessruleComponent;
  let fixture: ComponentFixture<DiwCreateBusinessruleComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiwCreateBusinessruleComponent ],
      imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule, SharedModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, { provide: MAT_DIALOG_DATA, useValue: {}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiwCreateBusinessruleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), test prerequired ', async(()=>{
      const dialogData = {
        moduleId : '1004',
        schemaId: '35343',
        brId: '32535',
        brType: 'BR_REGEX_RULE'
      };

      component.dialogData = dialogData;

      component.ngOnInit();
      expect(component.moduleId).toEqual(dialogData.moduleId);
      expect(component.schemaId).toEqual(dialogData.schemaId);
      expect(component.brId).toEqual(dialogData.brId);
      expect(component.selectedBrType).toEqual(dialogData.brType);

      expect(component.possibleBrs.length).toEqual(9,'Total brs is 9');

      const dialogData1 = {
        moduleId : '1004',
        schemaId: '35343',
        brId: '32535',
        brType: null
      };

      component.dialogData = dialogData1;
      component.ngOnInit();
      expect(component.brId).toEqual(dialogData1.brId);

      component.dialogData = null;
      component.ngOnInit();
      expect(component.ngOnInit).toBeTruthy();
  }));

  it('businessRuleTypeDef(), get busines rule definations', async(()=>{
    component.stepOneCtrl = new FormGroup({
      brType: new FormControl(BusinessRuleType.BR_MANDATORY_FIELDS)
    });

    let data =  component.businessRuleTypeDef;
    expect(data).toEqual('Missing Rule');

    component.stepOneCtrl = new FormGroup({
      brType: new FormControl(BusinessRuleType.BR_METADATA_RULE)
    });

    data =  component.businessRuleTypeDef;
    expect(data).toEqual('Metadata Rule');

    component.stepOneCtrl = new FormGroup({
      brType: new FormControl(BusinessRuleType.BR_CUSTOM_SCRIPT)
    });

    data =  component.businessRuleTypeDef;
    expect(data).toEqual('User Defined Rule');

    component.stepOneCtrl = new FormGroup({
      brType: new FormControl(BusinessRuleType.BR_DEPENDANCY_RULE)
    });

    data =  component.businessRuleTypeDef;
    expect(data).toEqual('Dependency Rule');

    component.stepOneCtrl = new FormGroup({
      brType: new FormControl(BusinessRuleType.BR_DUPLICATE_RULE)
    });

    data =  component.businessRuleTypeDef;
    expect(data).toEqual('Duplicate Rule');

    component.stepOneCtrl = new FormGroup({
      brType: new FormControl(BusinessRuleType.BR_API_RULE)
    });

    data =  component.businessRuleTypeDef;
    expect(data).toEqual('API Rule');

    component.stepOneCtrl = new FormGroup({
      brType: new FormControl(BusinessRuleType.BR_EXTERNALVALIDATION_RULE)
    });

    data =  component.businessRuleTypeDef;
    expect(data).toEqual('External Validation Rule');

    component.stepOneCtrl = new FormGroup({
      brType: new FormControl(BusinessRuleType.BR_REGEX_RULE)
    });

    data =  component.businessRuleTypeDef;
    expect(data).toEqual('Regex Rule');
  }));

  it('closeDialog() should close the dialog', async(() => {
    component.closeDialog();
    expect(component.closeDialog).toBeTruthy();
  }));

  it('clickSaved() After click saved rule', async(() => {
    component.clickSaved();
    expect(component.svdClicked).toEqual(true);

    component.svdClicked = true;
    component.clickSaved();
    expect(component.svdClicked).toEqual(false);
  }));

  it('udrClickSaved() Call while clicked use defined rule finish process', async(() => {
    component.udrClickSaved();
    expect(component.finishUdrCreProcess ).toEqual(true);

    component.finishUdrCreProcess = true;
    component.udrClickSaved();
    expect(component.finishUdrCreProcess ).toEqual(false);
  }));

  it('afterSaved(), After saved business rule', async(() => {
    const brInfo : CoreSchemaBrInfo  = {sno:8765} as CoreSchemaBrInfo;

    component.afterSaved(brInfo);
    expect(component.closeDialog).toBeTruthy();

    const brInfo1 = null;
    component.afterSaved(brInfo1);
    expect(component.afterSaved(brInfo1)).toBeFalsy();
  }));

  it('controlStepChange() step change manage required', async(()=> {
    const evt = {selectedIndex:2};
    component.controlStepChange(evt);
    expect(component.needCondRef ).toEqual(true);

    component.svdClicked = true;
    component.controlStepChange(evt);
    expect(component.needCondRef ).toEqual(false);

    const evt1 = {selectedIndex:1};
    component.controlStepChange(evt1);
    expect(component.needCondRef ).toEqual(false);
  }));
});
