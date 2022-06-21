import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { CheckCodeSidesheetComponent } from './check-code-sidesheet.component';

describe('CheckCodeSidesheetComponent', () => {
    let component: CheckCodeSidesheetComponent;
    let fixture: ComponentFixture<CheckCodeSidesheetComponent>;
    let schemaServiceSpy: SchemaService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CheckCodeSidesheetComponent],
            imports: [MdoUiLibraryModule,
                HttpClientTestingModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule
            ],
            providers: [SchemaDetailsService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CheckCodeSidesheetComponent);
        component = fixture.componentInstance;
        schemaServiceSpy = fixture.debugElement.injector.get(SchemaService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('initializeForm() should init the form', () => {
        component.initializeForm();
        expect(component.form).toBeTruthy();
    });

    it('showValidationError() should display alert', () => {
        component.showValidationError('ErrorMsg');
        expect(component.validationError.status).toBeTrue();
        expect(component.validationError.message).toEqual('ErrorMsg');
    });

    it('closeDialogComponent() should display alert', () => {
        spyOn(component.closeDialog, 'emit');
        component.closeDialogComponent();
        expect(component.closeDialog.emit).toHaveBeenCalled();
    });

    it('save() should save after validating form', () => {
        component.initializeForm();
        component.form.patchValue({
            code: '',
            shortDesc: null
        });
        expect(component.save()).toBeFalsy();
        component.form.patchValue({
            code: 'code1',
            shortDesc: 'Desc1'
        });
        spyOn(schemaServiceSpy, 'saveCheckCode').and.returnValue(of(''));
        expect(component.save()).toBeTrue();
        expect(component.submitted).toBeTrue();
    });
});