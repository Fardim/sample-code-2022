import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CheckCodeModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { CheckCodeControlComponent } from './check-code-control.component';

describe('CheckCodeControlComponent', () => {
    let component: CheckCodeControlComponent;
    let fixture: ComponentFixture<CheckCodeControlComponent>;
    let schemaServiceSpy: SchemaService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CheckCodeControlComponent],
            imports: [ HttpClientTestingModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
            providers: [SchemaDetailsService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CheckCodeControlComponent);
        component = fixture.componentInstance;
        schemaServiceSpy = fixture.debugElement.injector.get(SchemaService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit() should call getCheckCodeList', () => {
        spyOn(component, 'getCheckCodeList');
        component.ngOnInit();
        expect(component.getCheckCodeList).toHaveBeenCalled();
    });

    it('openNewCheckCodeSidesheet() should open the sidesheet', () => {
        component.codeInput = {
            nativeElement: document.createElement('div')
        };
        component.openNewCheckCodeSidesheet('');
        expect(component.displaySidesheet).toBeTrue();
    });

    it('updateCheckcodeSelected() should close the sidesheet', () => {
        component.updateCheckcodeSelected();
        expect(component.displaySidesheet).toBeFalse();
    });

    it('createNewCheckCode() should create new check code', () => {
        component.newCheckCode = 'test';
        component.checkCodeList = [];
        component.createNewCheckCode();
        expect(component.checkCodeList.length).toEqual(1);
    });

    it('searchCode() should search the code', () => {
        spyOn(component.searchStringSub, 'next');
        component.searchCode({value: 'test'});
        expect(component.searchStringSub.next).toHaveBeenCalled();
    });

    it('selectCheckCode() should update check code object', () => {
        component.formGroup = new FormGroup({
            code: new FormControl(''),
            description: new FormControl('')
        });
        const codeObj: CheckCodeModel= {
            code: 'c1',
            shortDesc: 'sd1',
            additionalInfo: ''
        };
        component.selectCheckCode(codeObj);
        expect(component.formGroup.value.code).toEqual('c1');
        expect(component.formGroup.value.description).toEqual('sd1');
    });

    it('getCheckCodeList() should get check code list', () => {
        const list: Array<CheckCodeModel> = [{
            code: 'c1',
            shortDesc: '',
            additionalInfo: ''
        }];
        spyOn(schemaServiceSpy, 'getCheckCodeList').and.returnValue(of(list));
        component.getCheckCodeList();
        expect(schemaServiceSpy.getCheckCodeList).toHaveBeenCalled();
    });

    it('getCheckCodeList() should get check code list error', () => {
        spyOn(schemaServiceSpy, 'getCheckCodeList').and.returnValue(throwError({message:'Error'}));
        component.getCheckCodeList();
        expect(schemaServiceSpy.getCheckCodeList).toHaveBeenCalled();
    });

    it('checkCodeSearchStr() should get last searched string', () => {
        component.searchStringSub.next('Test');
        expect(component.checkCodeSearchStr).toEqual('Test');
    });
});
