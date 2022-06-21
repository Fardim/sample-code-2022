import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRadioButtonGroupComponent } from './form-radio-button-group.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { FormControl } from '@angular/forms';
import { ReportService } from '@modules/report/_service/report.service';
import { DropDownValues } from '@modules/report/_models/widget';
import { of } from 'rxjs';
import { SimpleChanges } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MdoUiLibraryModule } from 'mdo-ui-library';

describe('FormRadioButtonGroupComponent', () => {
  let component: FormRadioButtonGroupComponent;
  let fixture: ComponentFixture<FormRadioButtonGroupComponent>;
  let reportService: jasmine.SpyObj<ReportService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormRadioButtonGroupComponent],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, MdoUiLibraryModule],
      providers: [ReportService]
    })
      .compileComponents();
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormRadioButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getDropDownValue(), should return dropdown values', async(() => {
    const returnData: DropDownValues[] = [{
      sno: 1,
      CODE: 'first',
      TEXT: 'test',
      langu: '',
      display: '',
      FIELDNAME: ''
    }];
    component.formFieldId = 'MATL_GROUP';
    component.optionList = [];

    spyOn(reportService, 'getDropDownValues')
      .withArgs(component.formFieldId, 'first').and.returnValue(of(returnData));

    component.displayCriteria = 'CODE';
    component.getDropDownValue('first');

    component.displayCriteria = 'CODE_TEXT';
    component.getDropDownValue('first');

    component.displayCriteria = 'TEXT';
    component.getDropDownValue('first');

    expect(component.optionList.length).toEqual(1);
  }));


  it('ngOnIt()', async(() => {
    component.ngOnInit();
    expect(component.ngOnInit).toBeTruthy();
  }));

  it('ngOnChanges()', async(() => {
    component.control = new FormControl();
    component.control.setValue('test1')
    component.optionList = [{key:'test1',value:'test1'}];
    const changes: SimpleChanges = {};
    component.ngOnChanges(changes);
    expect(component.ngOnChanges).toBeTruthy();
    const change1: SimpleChanges = {
      formFieldId: {
        previousValue: 'activityCheck',
        currentValue: 'column',
        firstChange: false,
        isFirstChange() { return false }
      },
      control : {
        previousValue : false,
        currentValue: true,
        firstChange: false,
        isFirstChange() { return false }
      },
      value : {
          previousValue: false,
          currentValue: true,
          firstChange: false,
          isFirstChange() { return false }
      }
    };

    component.ngOnChanges(change1);
    expect(component.formFieldId).toEqual('column')
  }));

  it('applyFilter()', async ()=>{
    component.formFieldId = 'MATL_GROUP';
    component.control = new FormControl();
    component.control.setValue('test1')
    component.optionList = [{key:'test1',value:'test1'}];

    const emitEventSpy = spyOn(component.valueChange, 'emit');
    component.applyFilter();
    expect(component.previousSelectedValue).toEqual('test1');
    expect(emitEventSpy).toHaveBeenCalled();
  })

});
