import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ClassTypeDetailComponent } from './class-type-detail.component';
import { RuleService } from '@services/rule/rule.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TransientService } from 'mdo-ui-library';
import { CoreService } from '@services/core/core.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

describe('ClassTypeDetailComponent', () => {
    let component: ClassTypeDetailComponent;
    let fixture: ComponentFixture<ClassTypeDetailComponent>;
    let ruleService: RuleService;
    let transientService: TransientService;
    let coreService: CoreService;
    let sharedService: SharedServiceService;
    let router: Router;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ClassTypeDetailComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
        }).compileComponents();
        router = TestBed.inject(Router);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassTypeDetailComponent);
        component = fixture.componentInstance;
        ruleService = fixture.debugElement.injector.get(RuleService);
        transientService = fixture.debugElement.injector.get(TransientService);
        coreService = fixture.debugElement.injector.get(CoreService);
        sharedService = fixture.debugElement.injector.get(SharedServiceService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        spyOn(sharedService, 'ofType').and.returnValue(of());
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('ngOnChanges(), while change rule type', async(()=>{
        const changes: import('@angular/core').SimpleChanges = { classTypeId: { currentValue: 'abc123', previousValue: '123', firstChange: null, isFirstChange: null } };
        spyOn(component, 'ngOnChanges').and.callThrough();
        component.ngOnChanges(changes);
        expect(component.ngOnChanges).toHaveBeenCalled();
      }));

    it('getClassTypeDetails()', () => {
        const res = { relatedDatasets: ['1', '2'] };
        spyOn(component, 'getClassTypeDetails').and.callThrough();
        spyOn(ruleService, 'getClassTypeDetails').and.returnValue(of(res));
        component.getClassTypeDetails('e8b48c9b-f2ab-4fc2-a16f-589089e10fef');
        expect(component.getClassTypeDetails).toHaveBeenCalled();
    });

    it('getClassTypeDetails(), should throw error', () => {
        spyOn(component, 'getClassTypeDetails').and.callThrough();
        spyOn(ruleService, 'getClassTypeDetails').and.returnValue(of(throwError({ message: 'error' })));
        component.getClassTypeDetails('');
        expect(component.getClassTypeDetails).toHaveBeenCalled();
    });

    it('getAllModules()', () => {
        const res = [{ moduleDesc: '101' }];
        spyOn(component, 'getAllModules').and.callThrough();
        spyOn(coreService, 'searchAllObjectType').and.returnValue(of(res));
        component.getAllModules(['1']);
        expect(component.getAllModules).toHaveBeenCalled();
    });

    it('openScheduleSyncDialog()', () => {
        spyOn(component, 'openScheduleSyncDialog').and.callThrough();
        spyOn(router, 'navigate');
        component.openScheduleSyncDialog();
        expect(component.openScheduleSyncDialog).toHaveBeenCalled();
    });

    it('openDialog()', () => {
        spyOn(component, 'openDialog').and.callThrough();
        spyOn(router, 'navigate');
        component.openDialog();
        expect(component.openDialog).toHaveBeenCalled();
    });

    it('confirmHandler()', () => {
        spyOn(component, 'confirmHandler').and.callThrough();
        spyOn(component, 'deleteAllClasses').and.callThrough();
        spyOn(ruleService, 'deleteClasstype').and.returnValue(of({ success: true }));

        spyOn(component, 'deleteClassType').and.callThrough();
        spyOn(ruleService, 'deleteClass').and.returnValue(of({ success: true }));

        component.classTypeId = 'a9c6a64b-17a9-44bf-9285-fed9f79dcd49';
        component.confirmHandler('classtype');
        expect(component.confirmHandler).toHaveBeenCalled();

        component.confirmHandler('classes');
        expect(component.confirmHandler).toHaveBeenCalled();
    });

    it('deleteDialog, should open confirmation popup', () => {
        spyOn(transientService, 'confirm').and.callFake(({ }, cb) => {
            expect(typeof cb).toBe('function');
            cb('yes');
        });
        component.classTypeId = 'a9c6a64b-17a9-44bf-9285-fed9f79dcd49';
        component.deleteDialog('classtype');
        expect(transientService.confirm).toHaveBeenCalled();
    });

    it('alertDialog, should open confirmation popup', () => {
        // spyOn(transientService, 'alert');
        spyOn(transientService, 'alert').and.callFake(({ }, cb) => {
            expect(typeof cb).toBe('function');
        });
        component.classType = {
            classType: '',
            className: 'Test',
            description: '',
            classes: [],
            allowMultipleclass: false,
            relatedDatasets: [],
            enableSync: false,
            nountype: false,
            system: '',
            tenantId: '',
            allowHierachy: false,
            allowMultidataset: false,
            isNountype: false,
            uuid: '',
            classTypeId: '',
        }
        component.alertDialog('classtype', []);
        expect(transientService.alert).toHaveBeenCalled();

        component.alertDialog('classes', []);
        expect(transientService.alert).toHaveBeenCalled();
    });

    it('deleteClassType()', () => {
        spyOn(component, 'deleteClassType').and.callThrough();
        spyOn(ruleService, 'deleteClasstype').and.returnValue(of({ success: true }));
        component.classTypeId = '3c3e58ca-c076-46f2-9e69-fb64b0c093d9';
        component.deleteClassType(true);
        expect(component.deleteClassType).toHaveBeenCalled();

        component.deleteClassType(false);
        expect(component.deleteClassType).toHaveBeenCalled();
    });

    it('deleteAllClasses()', () => {
        spyOn(component, 'deleteAllClasses').and.callThrough();
        spyOn(ruleService, 'deleteClass').and.returnValue(of({ success: true }));
        component.classTypeId = '3c3e58ca-c076-46f2-9e69-fb64b0c093d9';
        component.deleteAllClasses(true);
        expect(component.deleteAllClasses).toHaveBeenCalled();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        component.ngOnInit();
        spyOn(sharedService, 'ofType').and.returnValue(of());
        expect(component.ngOnInit).toBeTruthy();
    }));
});
