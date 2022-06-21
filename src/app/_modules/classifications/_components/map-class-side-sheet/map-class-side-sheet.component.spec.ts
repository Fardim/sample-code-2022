import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { MapClassSideSheetComponent } from './map-class-side-sheet.component';
import { MappingRequestBody } from '@models/mapping';
import { Location } from '@angular/common';
import { RuleService } from '@services/rule/rule.service';

describe('MapClassSideSheetComponent', () => {
    let component: MapClassSideSheetComponent;
    let fixture: ComponentFixture<MapClassSideSheetComponent>;
    let ruleService: RuleService;
    let location: Location;

    const routeParams = { classId: '1005' };
    const sourceClass = {
        uuid: 'abc123',
        classType: 'test',
        sapClass: ''
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MapClassSideSheetComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
            providers: [
                { provide: ActivatedRoute, useValue: { params: of(routeParams) } },
            ]
        }).compileComponents();
        location = TestBed.inject(Location);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MapClassSideSheetComponent);
        component = fixture.componentInstance;
        ruleService = fixture.debugElement.injector.get(RuleService);
        window.history.pushState({ sourceClass }, '', '');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('getClassMapping()', () => {
        const res = {
            response: {
                mapped: [{
                    sourceChar: { uuid: 'abc123' },
                    targetChar: { uuid: 'test123' }
                }]
            }
        };
        spyOn(component, 'getClassMapping').and.callThrough();
        spyOn(ruleService, 'getClassMapping').and.returnValue(of(res));
        component.getClassMapping();
        expect(component.getClassMapping).toHaveBeenCalled();
    });

    it('getCharacteristics()', () => {
        const res = {
            response: [
                {
                    uuid: 'a001',
                    charCode: 'Test',
                    dataType: 'TEXT',
                    length: '2',
                }
            ]
        };
        spyOn(component, 'getCharacteristics').and.callThrough();
        spyOn(ruleService, 'getCharacteristicsList').and.returnValue(of(res));
        component.getCharacteristics();
        expect(component.getCharacteristics).toHaveBeenCalled();
    });

    it('getAllClasses()', () => {
        const res = [
            { uuid: 'abc123', sapClass: '' }
        ]
        const charRes = {
            response: [
                {
                    uuid: 'a001',
                    charCode: 'Test',
                    dataType: 'TEXT',
                    length: '2',
                }
            ]
        };
        spyOn(component, 'getAllClasses').and.callThrough();
        spyOn(ruleService, 'getAllClasses').and.returnValue(of(res));
        spyOn(ruleService, 'getCharacteristicsList').and.returnValue(of(charRes));
        component.getAllClasses();
        expect(component.getAllClasses).toHaveBeenCalled();
    });

    it('it should close the dialog', () => {
        spyOn(location, 'back');
        component.close();
        expect(location.back).toHaveBeenCalledTimes(1);
    });

    it('it should call saveMapping()', () => {
        spyOn(component, 'saveMapping').and.callThrough();
        spyOn(ruleService, 'saveUpdateClass').and.returnValue(of({}));
        component.saveMapping();
        expect(component.saveMapping).toHaveBeenCalled();
    });

    it('it should call updateMappedTarget()', () => {
        spyOn(component, 'updateMappedTarget').and.callThrough();
        const targetMapping = {
            mappingList: [
                {
                    source: { fieldId: 'ITM_NAME', description: '' },
                    target: { uuid: 'ITM_DESC', description: '' },
                    line: null,
                }
            ]
        } as MappingRequestBody;
        component.updateMappedTarget(targetMapping);
        expect(component.updateMappedTarget).toHaveBeenCalled();
    });

    it('it should call setBannerText()', () => {
        spyOn(component, 'setBannerText').and.callThrough();
        component.setBannerText('test');
        expect(component.setBannerText).toHaveBeenCalled();
    });
});