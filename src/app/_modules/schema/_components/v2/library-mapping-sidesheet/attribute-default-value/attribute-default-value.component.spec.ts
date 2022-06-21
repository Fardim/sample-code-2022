import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AttributeDefaultValue } from '@models/schema/classification';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { AttributeDefaultValueComponent } from './attribute-default-value.component';
import { GlobaldialogService } from '@services/globaldialog.service';
import { TransientService } from 'mdo-ui-library';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';

describe('AttributeComponent', () => {
  let component: AttributeDefaultValueComponent;
  let fixture: ComponentFixture<AttributeDefaultValueComponent>;
  let globaldialogService: GlobaldialogService;
  let nounModifierService: NounModifierService;
  let transientService: TransientService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AttributeDefaultValueComponent],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
      providers: [
        GlobaldialogService,
        NounModifierService,
        TransientService, {
          provide: ActivatedRoute,
          useValue: { params: of({ nounSno: '1701' }) }
        }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeDefaultValueComponent);
    component = fixture.componentInstance;
    router = fixture.debugElement.injector.get(Router);
    globaldialogService = fixture.debugElement.injector.get(GlobaldialogService);
    nounModifierService = fixture.debugElement.injector.get(NounModifierService);
    transientService = fixture.debugElement.injector.get(TransientService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init component', () => {
    delete nounModifierService.attributeValuesModels;
    component.ngOnInit();
    nounModifierService.attributeValuesModels = [{
      code: '',
      shortValue: ''
    }];
    component.loadValues();
    expect(component.valueList).toBeTruthy();
  });
  it('should check if row is valid', () => {
    const row: AttributeDefaultValue = {
      code: 'test',
      shortValue: 'test'
    };
    expect(component.isValidRow(row)).toBeTruthy();
    delete row.code;
    expect(component.isValidRow(row)).toBeFalsy();
  });

  it('should add new empty row', () => {
    component.valueList = [];
    component.addValueRow();
    expect(component.valueList.length).toEqual(1);
  });

  it('addFirstItem should add new row', () => {
    component.valueList = [];
    component.searchStr = 'test';
    component.addFirstItem();
    expect(component.valueList.length).toEqual(1);
  });

  it('should search using searchstring', () => {
    component.searchStr = '';
    component.doSearch('test');
    expect(component.searchStr).toEqual('test');
  });
  it('should decide if row can be displahyed', () => {
    const row: AttributeDefaultValue = {
      code: 'test',
      shortValue: 'test'
    };
    component.searchStr = '';
    expect(component.canDisplayRow(row)).toBeTrue();
    component.searchStr = 'test';
    expect(component.canDisplayRow(row)).toBeTrue();
    component.searchStr = 'test1';
    expect(component.canDisplayRow(row)).toBeFalse();
  });
  it('should delete a record from list', async () => {
    const row: AttributeDefaultValue = {
      code: 'test',
      shortValue: 'test'
    };
    component.valueList = [row];
    spyOn(globaldialogService, 'confirm').and.callFake((a, b) => b('yes'));
    component.deleteValueRow(0);
    expect(globaldialogService.confirm).toHaveBeenCalled();
    expect(component.valueList.length).toEqual(0);
  });
  it('saveRowValue should save row value', async () => {
    const row: AttributeDefaultValue = {
      code: 'test',
      codeTemp: 'test2',
      codeEditable: true,
      shortValue: 'test'
    };
    component.saveRowValue(row, 'code');
    expect(row.code).toEqual('test2');
  });

  it('editRowValue should edit row value', async () => {
    const row: AttributeDefaultValue = {
      code: 'test',
      codeTemp: '',
      codeEditable: false,
      shortValue: 'test'
    };
    component.editRowValue(row, 'code');
    expect(row.codeTemp).toEqual('test');
    row.codeEditable = true;
    expect(component.editRowValue(row, 'code')).toBeUndefined();
  });

  it('copyData should copy row value', async () => {
    component.valueList = [{
      code: 'test',
      codeTemp: '',
      codeEditable: false,
      shortValue: 'test'
    }];
    component.copyData(0);
    expect(component.valueList.length).toEqual(2);
  });
  it('saveValues should save all values and close sidesheet', async () => {
    component.valueList = [{
      code: 'test',
      codeTemp: '',
      codeEditable: false,
      shortValue: 'test'
    }];
    spyOn(router, 'navigate');
    component.saveValues();
    expect(router.navigate).toHaveBeenCalled();
  });
  it('close should close sidesheet', async () => {
    component.valueList = [{
      code: 'A',
      shortValue: 'A'
    }];
    spyOn(component, 'saveValues');
    component.close();
    expect(component.saveValues).toHaveBeenCalled();
    component.valueList = [{
      code: '',
      shortValue: ''
    }];
    spyOn(transientService, 'confirm').and.callFake((a, b) => b('yes'));
    component.close();
    expect(component.saveValues).toHaveBeenCalled();
  });
});
