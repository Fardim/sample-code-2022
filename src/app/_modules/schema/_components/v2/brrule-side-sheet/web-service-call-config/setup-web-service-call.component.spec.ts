import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TargetSystemModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SharedModule } from '@modules/shared/shared.module';
import { SchemaService } from '@services/home/schema.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { SetupWebServiceCallComponent } from './setup-web-service-call.component';

describe('SetupWebServiceCallComponent', () => {
    let component: SetupWebServiceCallComponent;
    let fixture: ComponentFixture<SetupWebServiceCallComponent>;
    let schemaServiceSpy: SchemaService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SetupWebServiceCallComponent],
            imports: [MdoUiLibraryModule,
                HttpClientTestingModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule
            ],
            providers: [SchemaDetailsService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SetupWebServiceCallComponent);
        component = fixture.componentInstance;
        schemaServiceSpy = fixture.debugElement.injector.get(SchemaService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('initializeForm() should init the form', async(() => {
        component.initializeForm();
        expect(component.form).toBeTruthy();
    }));

    it('ngOnChanges() should update the form', async(() => {
        component.initializeForm();
        const coreSchemaBrInfo = {
            lookupRuleMetadata: {
                targetSystem: 't1',
                checkCodes: ['c1'],
                checkCodeDesc: 'desc'
            }
        } as any;
        component.coreSchemaBrInfo = coreSchemaBrInfo;
        const changes = {
            coreSchemaBrInfo
        };
        component.ngOnChanges(changes);
        expect(component.form.value.check_code.code).toEqual('c1');
        delete coreSchemaBrInfo.lookupRuleMetadata.checkCodes;
        component.ngOnChanges(changes);
        expect(component.form.value.check_code.code).toBeUndefined();
    }));

    it('displayTargetSystemFn() should display target system name', () => {
        component.targetSystemList = [{
            connid: 'c1',
            name: 'Name1'
        }, {
            connid: 'c2',
            name: ''
        }];
        expect(component.displayTargetSystemFn('c1')).toEqual('Name1');
        expect(component.displayTargetSystemFn('c2')).toEqual('');
        expect(component.displayTargetSystemFn('c3')).toEqual('');
    });

    it('searchTargetSystem() should search target system name', () => {
        component.targetSystemList = [{
            connid: 'c1',
            name: 'Name1'
        }];
        component.searchTargetSystem('Name');
        expect(component.targetSystemFiltered.length).toEqual(1);
        component.searchTargetSystem('Name11');
        expect(component.targetSystemFiltered.length).toEqual(0);
    });

    it('getTargetSystemList() should load target system list', async(() => {
        const targetList: Array<TargetSystemModel> = [{}] as any;
        spyOn(schemaServiceSpy, 'getTargetSystemList').and.returnValue(of(targetList));
        component.getTargetSystemList();
        expect(schemaServiceSpy.getTargetSystemList).toHaveBeenCalled();
        expect(component.targetSystemList.length).toEqual(1);
    }));
});
