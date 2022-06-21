import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Dataset } from '@models/schema/schema';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ClassificationLayoutComponent } from './classification-layout.component';

describe('ClassificationLayoutComponent', () => {
    let component: ClassificationLayoutComponent;
    let fixture: ComponentFixture<ClassificationLayoutComponent>;
    let coreService: CoreService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ClassificationLayoutComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassificationLayoutComponent);
        component = fixture.componentInstance;
        coreService = fixture.debugElement.injector.get(CoreService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('onDatasetSelect()', (() => {
        spyOn(component, 'getRelatedDatasets').and.callThrough();
        component.onDatasetSelect('6');
        expect(component.ngOnInit).toBeTruthy();
    }));

    it('getRelatedDatasets()', () => {
        const res = [] as Dataset[];
        spyOn(component, 'getRelatedDatasets').and.callThrough();
        spyOn(coreService, 'getDataSets').and.returnValue(of(res));
        component.getRelatedDatasets('');
        expect(component.getRelatedDatasets).toHaveBeenCalled();
    });

    it('onScroll()', () => {
        const res = [] as Dataset[];
        const event = {
            target: {
                offsetHeight: 30,
                scrollTop: 70,
                scrollHeight: 100
            }
        }
        component.moduleList = [];
        spyOn(component, 'onScroll').and.callThrough();
        spyOn(coreService, 'getDataSets').and.returnValue(of(res));
        component.onScroll(event);
        expect(component.onScroll).toHaveBeenCalled();
    });

    it('selectedNode()', () => {
        spyOn(component,'selectedNode').and.callThrough();
        component.selectedNode({ uuid: 'test123' });
        expect(component.selectedNode).toHaveBeenCalled();
    });
});
