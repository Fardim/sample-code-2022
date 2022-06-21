import { MdoUiLibraryModule } from 'mdo-ui-library';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessrulelibraryDialogComponent } from './businessrulelibrary-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SchemaService } from '@services/home/schema.service';
import { CoreSchemaBrInfo } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { of } from 'rxjs';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { HttpClientModule } from '@angular/common/http';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SharedModule } from '@modules/shared/shared.module';

describe('BusinessrulelibraryDialogComponent', () => {
  let component: BusinessrulelibraryDialogComponent;
  let fixture: ComponentFixture<BusinessrulelibraryDialogComponent>;
  let schemaService: jasmine.SpyObj<SchemaService>;

  beforeEach(async(() => {
    const model = {
      selectedRules: [],
    }
    TestBed.configureTestingModule({
      declarations: [BusinessrulelibraryDialogComponent, SearchInputComponent],
      imports: [ MdoUiLibraryModule,
        AppMaterialModuleForSpec,
        HttpClientModule,
        SharedModule],
      providers: [SchemaService,
        { provide: MatDialogRef, useValue: null },
        { provide: MAT_DIALOG_DATA, useValue: model },
      ]
    })
      .compileComponents();
    schemaService = TestBed.inject(SchemaService) as jasmine.SpyObj<SchemaService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessrulelibraryDialogComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`search(), search from available rules`, async(() => {
    component.businessRulesList = [
      { sno: 100295071201799440, brId: '335555169201799400', apiKey: '', brType: 'BR_CUSTOM_SCRIPT', refId: 0, fields: '', regex: '', order: 1, message: '', script: '', brInfo: '', brExpose: 0, status: '1', categoryId: null, standardFunction: '', brWeightage: null, totalWeightage: 100, transformation: 0, tableName: '', qryScript: '', dependantStatus: 'ALL', plantCode: '0', schemaId: null, categoryInfo: null, udrData: null, brIdStr: '335555169201799441', percentage: 0 },
      { sno: 104024870140765550, brId: '450251510140765600', apiKey: '', brType: 'BR_MANDATORY_FIELDS', refId: 0, fields: 'lyxsjyab4751', regex: '', order: 1, message: 'lucknow', script: '', brInfo: 'India', brExpose: 0, status: '1', categoryId: '17052018003', standardFunction: '', brWeightage: '20', totalWeightage: 100, transformation: 0, tableName: '', qryScript: '', dependantStatus: 'ALL', plantCode: '0', schemaId: null, categoryInfo: null, udrData: null, brIdStr: '450251510140765548', percentage: 0 }
    ];
    const searchTerm = 'India';
    component.search(searchTerm);
    expect(component.filteredBusinessRulesList.length).toEqual(1);
  }));

  it(`getAllBusinessRules(), get business rules service`, async(() => {
    const returnData: CoreSchemaBrInfo[] = [];
    spyOn(schemaService, 'getBusinessRulesByModuleId').and.returnValue(of(returnData));
    component.data = {
      moduleId: '1005'
    }

    // call with module Id
    component.getBusinessRulesList(component.data.moduleId, '', '', '0');
    expect(schemaService.getBusinessRulesByModuleId).toHaveBeenCalled();

    // call without module Id
    spyOn(schemaService, 'getAllBusinessRules').and.returnValue(of([]));
    component.getBusinessRulesList(null, '', '', '0');
    expect(schemaService.getAllBusinessRules).toHaveBeenCalled();
  }));

  it(`isSelected(), check if a rule is selected`, async(() => {
    const rules = [
      { sno: 100295071201799440, brId: '335555169201799400', apiKey: '', brType: 'BR_CUSTOM_SCRIPT', refId: 0, fields: '', regex: '', order: 1, message: '', script: '', brInfo: '', brExpose: 0, status: '1', categoryId: null, standardFunction: '', brWeightage: null, totalWeightage: 100, transformation: 0, tableName: '', qryScript: '', dependantStatus: 'ALL', plantCode: '0', schemaId: null, categoryInfo: null, udrDto: null, brIdStr: '335555169201799441', percentage: 0 },
      { sno: 104024870140765550, brId: '450251510140765600', apiKey: '', brType: 'BR_MANDATORY_FIELDS', refId: 0, fields: 'lyxsjyab4751', regex: '', order: 1, message: 'lucknow', script: '', brInfo: 'India', brExpose: 0, status: '1', categoryId: '17052018003', standardFunction: '', brWeightage: '20', totalWeightage: 100, transformation: 0, tableName: '', qryScript: '', dependantStatus: 'ALL', plantCode: '0', schemaId: null, categoryInfo: null, udrDto: null, brIdStr: '450251510140765548', percentage: 0 }
    ];
    component.selectedBusinessRuleCopy.push(rules[0]);
    expect(component.isSelected(rules[0])).toBe(true);

  }));

  it(`search() should search through a rule from a list`, async(() => {
    component.businessRulesList = [{
      brInfo: 'A'
    } as CoreSchemaBrInfo, {
      brInfo: 'B'
    } as CoreSchemaBrInfo];
    component.search('a');
    expect(component.filteredBusinessRulesList.length).toBe(1);
    component.search('');
    expect(component.filteredBusinessRulesList.length).toBe(2);
    component.search('C');
    expect(component.filteredBusinessRulesList.length).toBe(0);
  }));

});
