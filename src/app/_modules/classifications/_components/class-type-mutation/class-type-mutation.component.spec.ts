import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { Dataset } from '@models/schema/schema';
import { ClassType } from '@modules/classifications/_models/classifications';
import { SharedModule } from '@modules/shared/shared.module';
import { MockElementRef } from '@modules/shared/_directives/resizeable.directive.spec';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { of, throwError } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ClassTypeMutationComponent } from './class-type-mutation.component';

describe('ClassTypeMutationComponent', () => {
    let component: ClassTypeMutationComponent;
    let fixture: ComponentFixture<ClassTypeMutationComponent>;
    let coreService: CoreService;
    let ruleService: RuleService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ClassTypeMutationComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
            providers: [{ provide: ElementRef, useValue: new MockElementRef(document.createElement('input')) }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassTypeMutationComponent);
        component = fixture.componentInstance;
        coreService = fixture.debugElement.injector.get(CoreService);
        ruleService = fixture.debugElement.injector.get(RuleService);
    });

    it('should create', () => {
        console.log('log');
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('getClassTypeDetails()', () => {
        component.classTypeId = 'gfhg478hgfghf874jhf';
        const res = {
            classType: '',
            className: '',
            description: '',
            relatedDatasets: [],
            nountype: false,
            allowMultipleclass: false,
            enableSync: false,
            system: ''
        } as ClassType;
        spyOn(component, 'getClassTypeDetails').and.callThrough();
        spyOn(ruleService, 'getClassTypeDetails').and.returnValue(of(res));
        component.getClassTypeDetails();
        expect(component.getClassTypeDetails).toHaveBeenCalled();
    });

    it('getRelatedDatasets()', () => {
        const res = [] as Dataset[];
        spyOn(component, 'getRelatedDatasets').and.callThrough();
        spyOn(coreService, 'getDataSets').and.returnValue(of(res));
        component.optionCtrl.setValue('test');
        component.getRelatedDatasets('');
        expect(component.getRelatedDatasets).toHaveBeenCalled();
    });

    it('hasLimit()', () => {
        spyOn(component, 'hasLimit').and.callThrough();
        component.initForm();
        component.classTypeForm.get('relatedDatasets').setValue(['test']);
        component.optionCtrl.setValue('test');
        component.hasLimit();
        expect(component.hasLimit).toHaveBeenCalled();
    });

    it('_filter()', () => {
        spyOn(component, '_filter').and.callThrough();
        component.moduleData = [{ moduleDesc: 'test' }];
        component._filter('test');
        expect(component._filter).toHaveBeenCalled();
    });

    it('closeDialog()', () => {
        spyOn(component, 'closeDialog').and.callThrough();
        component.closeDialog();
        expect(component.closeDialog).toHaveBeenCalled();
    });

    it('selectedRelatedDatasetsValues()', () => {
        spyOn(component, 'selectedRelatedDatasetsValues').and.callThrough();
        const event: MatAutocompleteSelectedEvent = {
            option: {
                viewValue: 'Test',
                value: 'test'
            }
        } as MatAutocompleteSelectedEvent;
        component.relatedDatasetsValuesInput = TestBed.inject(ElementRef);
        component.initForm();
        component.classTypeForm.get('relatedDatasets').setValue(['test']);
        component.selectedRelatedDatasetsValues(event);
        expect(component.selectedRelatedDatasetsValues).toHaveBeenCalled();
    });

    it('removeRelatedDatasetsValues()', () => {
        spyOn(component, 'removeRelatedDatasetsValues').and.callThrough();
        component.initForm();
        component.classTypeForm.get('relatedDatasets').setValue(['test']);
        component.removeRelatedDatasetsValues('test');
        expect(component.removeRelatedDatasetsValues).toHaveBeenCalled();
    });

    it('save(), should form invalid', () => {
        spyOn(component, 'save').and.callThrough();
        spyOn(ruleService, 'saveUpdateClassType').and.returnValue(of({ success: true }));
        component.initForm();
        component.save();
        expect(component.save).toHaveBeenCalled();
    });

    it('save()', () => {
        spyOn(component, 'save').and.callThrough();
        spyOn(ruleService, 'saveUpdateClassType').and.returnValue(of({ success: true }));
        component.initForm();
        component.classTypeForm.get('classType').setValue('test');
        component.classTypeForm.get('className').setValue('test01');
        component.save();
        expect(component.save).toHaveBeenCalled();
    });

    it('save(), should throw error', () => {
        spyOn(component, 'save').and.callThrough();
        spyOn(ruleService, 'saveUpdateClassType').and.returnValue(of(throwError({ message: 'error' })));
        component.initForm();
        component.classTypeForm.get('classType').setValue('test');
        component.classTypeForm.get('className').setValue('test01');
        component.save();
        expect(component.save).toHaveBeenCalled();
    });

});
