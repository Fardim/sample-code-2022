import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { RuleService } from '@services/rule/rule.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
    let component: NavBarComponent;
    let fixture: ComponentFixture<NavBarComponent>;
    let ruleService: RuleService;
    let sharedService: SharedServiceService;
    let router: Router;
    let data = {};
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavBarComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
        }).compileComponents();
        router = TestBed.inject(Router);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavBarComponent);
        component = fixture.componentInstance;
        ruleService = fixture.debugElement.injector.get(RuleService);
        sharedService = fixture.debugElement.injector.get(SharedServiceService);
        data = {
            response: [{ uuid: '67jh78ffj87gfhg', classType: 'Class Type A' }],
            classes: [{ uuid: '67jh78ffj87gfhg', code: 'Class A' }]
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        component.ngOnInit();
        spyOn(sharedService, 'ofType').and.returnValue(of());
        spyOn(ruleService, 'getAllClassTypes').and.returnValue(of(data));
        component.searchSub.subscribe();
        component.searchSub.next('test');
        component.subscriptionEnabled = true;
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('filterData()', () => {
        spyOn(component, 'filterData').and.callThrough();
        spyOn(ruleService, 'getAllClassTypes').and.returnValue(of(data));
        component.filterData();
        expect(component.filterData).toHaveBeenCalled();
    });

    it('loadData()', () => {
        component.treeData = [];
        spyOn(component, 'loadData').and.callThrough();
        spyOn(ruleService, 'getAllClassTypes').and.returnValue(of(data));
        component.loadData();
        expect(component.loadData).toHaveBeenCalled();
    });

    it('onScroll()', () => {
        const event = {
            target: {
                offsetHeight: 30,
                scrollTop: 70,
                scrollHeight: 100
            }
        }
        component.treeData = [];
        spyOn(component, 'onScroll').and.callThrough();
        spyOn(ruleService, 'getAllClassTypes').and.returnValue(of(data));
        component.onScroll(event);
        expect(component.onScroll).toHaveBeenCalled();
    });

    it('onNodeSelect()', () => {
        const node = { uuid: '', level: 0 };
        spyOn(component, 'onNodeSelect').and.callThrough();
        component.onNodeSelect(node);
        expect(component.onNodeSelect).toHaveBeenCalled();
    });

    it('getClassType()', () => {
        const node = { uuid: 'test123', level: 0 };
        component.data = [{
            uuid: 'test1234', classType: 'Class Type A', classes: [{ uuid: 'test123', code: 'Class A' }]
        }];
        spyOn(component, 'getClassType').and.callThrough();
        component.getClassType(node);
        expect(component.getClassType).toHaveBeenCalled();
    });

    it('openDialog()', () => {
        const node = { uuid: 'test123', level: 0 }
        component.data = [{
            uuid: 'test123', classType: 'Class Type A'
        }];
        spyOn(component, 'openDialog').and.callThrough();
        spyOn(router, 'navigate');
        component.openDialog(node);
        expect(component.openDialog).toHaveBeenCalled();
    });
});
