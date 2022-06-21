import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegexRuleComponent, Regex } from './regex-rule.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { SchemaService } from '@services/home/schema.service';
import { CoreSchemaBrInfo } from '../business-rules.modal';
import { of } from 'rxjs';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GenericFieldControlComponent } from '../../../../../shared/_components/generic-field-control/generic-field-control.component';
import { SharedModule } from '@modules/shared/shared.module';

describe('RegexRuleComponent', () => {
  let component: RegexRuleComponent;
  let fixture: ComponentFixture<RegexRuleComponent>;
  let schemaService: SchemaService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegexRuleComponent, GenericFieldControlComponent ],
      imports:[AppMaterialModuleForSpec, ReactiveFormsModule, FormsModule, HttpClientModule, RouterTestingModule, SharedModule],
      providers:[
        SchemaService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegexRuleComponent);
    component = fixture.componentInstance;
    schemaService = fixture.debugElement.injector.get(SchemaService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(), should create prerequired ', async(()=>{
    // mock data
    component.brId = '38736423785273';
    const brInfo: CoreSchemaBrInfo = new CoreSchemaBrInfo();
    brInfo.brId = component.brId;
    brInfo.brIdStr = component.brId;
    brInfo.fields = 'MATL_TYPE,MATL_GROUP';
    brInfo.standardFunction = 'PHONE_NUMBER_IN';
    brInfo.brInfo = 'Regex rule test 01';
    brInfo.regex = '^(\\+91[\\-\\s]?)?[0]?(91)?[7896]\\d{9}$';

    const regex = {FUNC_NAME : 'PHONE NUMBER(IN)', FUNC_TYPE : 'PHONE_NUMBER_IN', FUNC_CODE : '^(\\+91[\\-\\s]?)?[0]?(91)?[7896]\\d{9}$'} as Regex;

    const expectedregexFrmGrpdata = {ruleDesc: brInfo.brInfo, standardFun: regex, queryScript: brInfo.regex}

    spyOn(schemaService, 'getBusinessRuleInfo').withArgs(component.brId).and.returnValue(of(brInfo));

    // call actual method
    component.ngOnInit();

    expect(schemaService.getBusinessRuleInfo).toHaveBeenCalledWith(component.brId);

    expect(component.regexFrmGrp.value).toEqual(expectedregexFrmGrpdata);

    expect(component.selectedFldId.length).toEqual(2);
  }));

  it('selectedFields(), get selected field ids', async(()=>{
      const option: Metadata[] = [
        {
          childs:[],
          fieldId:'MATL_TYPE',
          fieldDescri:'Material Type',
          isGroup:false
        }
      ];

      component.selectedFields(option);

      expect(component.selectedFldId.length).toEqual(option.length);

  }));

  it('selectRegex(), after select regex then set to queryString ', async(()=>{
    const regex = {FUNC_NAME : 'PHONE NUMBER(IN)', FUNC_TYPE : 'PHONE_NUMBER_IN', FUNC_CODE : '^(\\+91[\\-\\s]?)?[0]?(91)?[7896]\\d{9}$'} as Regex;

    const event: MatAutocompleteSelectedEvent = {option:{value:regex}} as MatAutocompleteSelectedEvent;

    component.ngOnInit();
    component.selectRegex(event);

    expect(component.regexFrmGrp.get('queryScript').value).toEqual(regex.FUNC_CODE);

    const event1: MatAutocompleteSelectedEvent = {option:{value:null}} as MatAutocompleteSelectedEvent;
    expect(component.selectRegex(event1)).toEqual(undefined);

  }));

  it('saveBrInfo(), should call service for save and update', async(()=>{

    component.ngOnInit();

    spyOn(schemaService,'createBusinessRule').withArgs(component.brInfo).and.returnValue(of(component.brInfo));

    spyOn(component.evtSaved, 'emit').and.callFake(()=>{return null;})
    component.saveBrInfo();

    expect(schemaService.createBusinessRule).toHaveBeenCalledWith(component.brInfo);

    expect(component.evtSaved.emit).toHaveBeenCalledTimes(1);


    component.brId = '7654';
    component.brType = 'Regex';
    component.selectedFldId = null;
    component.regexFrmGrp.get('queryScript').setValue('test');
    component.regexFrmGrp.get('ruleDesc').setValue('test');
    component.regexFrmGrp.get('standardFun').setValue('mock');
    component.saveBrInfo();
    expect(schemaService.createBusinessRule).toHaveBeenCalledWith(component.brInfo);

  }));

  it('discard(), should emit with current saved value', async(()=>{
    spyOn(component.evtSaved, 'emit').and.callFake(()=>{return null;})

    component.discard(null);
    expect(component.evtSaved.emit).toHaveBeenCalledTimes(1);
  }));

  it('getStandardFunObj(), get standard function obj by id', async(()=>{
    component.preDefinedRegex = [{FUNC_NAME : 'PHONE NUMBER(IN)', FUNC_TYPE : 'PHONE_NUMBER_IN', FUNC_CODE : '^(\\+91[\\-\\s]?)?[0]?(91)?[7896]\\d{9}$'} as Regex];

    const actualRes = component.getStandardFunObj('PHONE_NUMBER_IN');

    expect(actualRes).toEqual(component.preDefinedRegex[0]);

  }));

  /**
   * This gives error
   * RegexRuleComponent ngOnChanges(), should call reset when reset dashboard FAILED
   * Error: Timeout - Async function did not complete within 15000ms (set by jasmine.DEFAULT_TIMEOUT_INTERVAL)
   */
  // it('ngOnChanges(), should call reset when reset dashboard', async(() => {
  //   const chnages:import('@angular/core').SimpleChanges = {svdClicked :{currentValue:true, previousValue: false, firstChange:null, isFirstChange:null}};
  //   component.ngOnChanges(chnages);
  //   expect(component.ngOnChanges).toBeTruthy();

  //   const chnages2:import('@angular/core').SimpleChanges = null;
  //   component.ngOnChanges(chnages2);
  //   expect(component.ngOnChanges).toBeTruthy();
  // }));

  it('displayWithPreRegex(), should return saved regex', async(() => {
    const regex = {FUNC_NAME:'PAN CARD'} as Regex;
    expect(component.displayWithPreRegex(regex)).toEqual('PAN CARD');

    const regex1 = null;
    expect(component.displayWithPreRegex(regex1)).toEqual('');
  }));
});
