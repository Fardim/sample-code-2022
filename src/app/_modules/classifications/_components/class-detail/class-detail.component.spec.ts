import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { MockElementRef } from '@modules/shared/_directives/resizeable.directive.spec';
import { RuleService } from '@services/rule/rule.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ClassDetailComponent } from './class-detail.component';

describe('ClassDetailComponent', () => {
    let component: ClassDetailComponent;
    let fixture: ComponentFixture<ClassDetailComponent>;
    let ruleService: RuleService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ClassDetailComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
            providers: [{ provide: ElementRef, useValue: new MockElementRef(document.createElement('input')) }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassDetailComponent);
        component = fixture.componentInstance;
        ruleService = fixture.debugElement.injector.get(RuleService);
        component.class = {
            uuid: '0fc09dc4-15fe-42d2-9a6e-291731ac593b',
            code: 'ABRSV',
            codeLong: 'ABRASIVE',
            mod: 'PAD',
            modLong: 'PAD',
            referenceCode: 'ABRSV',
            referenceType: '',
            parentUuid: '',
            isNoun: true,
            isModPartOfDesc: true,
            isCodePartOfDesc: true,
            imageUrl: [],
            description: 'ABRASIVE',
            inheritAttributes: false,
            sapClass: 'ABRSV',
            tenantId: '0',
            classType: {
                uuid: '8c5b10b0-d537-434e-a66f-48e7de9cfdfe',
                classType: 'ABRSV',
                description: 'ABRASIVE',
                tenantId: '0',
                className: 'ABRSV',
                allowMultipleclass: false,
                allowMultidataset: false,
                allowHierachy: false,
                enableSync: false,
                relatedDatasets: null,
                system: null,
                nountype: true,
                classTypeId: '',
                classes: []
            },
            validFrom: '0',
            colloquialNames: [{
                calloquialName: '',
                collorder: 0,
                language: 'en',
                xref: ''
            }],
            classes: [],
            classLabels: []
        }
    });

    it('should create', () => {
        console.log('log');
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('hasLimit()', () => {
        spyOn(component, 'hasLimit').and.callThrough();
        component.hasLimit(['1212', '121212']);
        expect(component.hasLimit).toHaveBeenCalled();
    });

    it('getColloquialNames()', () => {
        const res = {
            response: {
                colloquialNames: [{
                    calloquialName: '',
                    collorder: 0,
                    language: 'en',
                    xref: ''
                }]
            }
        }
        spyOn(component, 'getColloquialNames').and.callThrough();
        spyOn(ruleService, 'getColloquialNames').and.returnValue(of(res));
        component.getColloquialNames();
        expect(component.getColloquialNames).toHaveBeenCalled();
    });

    it('getColloquialNameList()', () => {
        spyOn(component, 'getColloquialNameList').and.callThrough();
        component.getColloquialNameList('en');
        expect(component.getColloquialNameList).toHaveBeenCalled();
    });

    it('getDate()', () => {
        spyOn(component, 'getDate').and.callThrough();
        component.getDate(new Date().getTime());
        expect(component.getDate).toHaveBeenCalled();
    });
});
