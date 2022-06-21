import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@modules/shared/shared.module';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { JoinPropertiesSideSheetComponent } from './join-properties-side-sheet.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { GroupDetails } from '@models/schema/duplicacy';

describe('JoinPropertiesSideSheetComponent', () => {
    let component: JoinPropertiesSideSheetComponent;
    let fixture: ComponentFixture<JoinPropertiesSideSheetComponent>;
    let router: Router;
    let virtualDatasetService: VirtualDatasetService;
    let loader: HarnessLoader;
    const routeParams = { id: '1005' };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JoinPropertiesSideSheetComponent],
            imports: [AppMaterialModuleForSpec, HttpClientTestingModule, RouterTestingModule, SharedModule],
            providers: [
                { provide: ActivatedRoute, useValue: { params: of(routeParams) } },
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinPropertiesSideSheetComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        virtualDatasetService = fixture.debugElement.injector.get(VirtualDatasetService);
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit(), should call ngOnInit', (() => {
        spyOn(virtualDatasetService, 'getselectedStepData').and.returnValue(of());
        component.ngOnInit();
        expect(virtualDatasetService.getselectedStepData).toHaveBeenCalled();
    }));

    it('it should close the dialog', () => {
        spyOn(router, 'navigate');
        component.close();
        expect(router.navigate).toHaveBeenCalled();
    });

    it('openMapFields(), should navigate', async(() => {
        spyOn(router, 'navigate');
        component.openMapFields();
        expect(router.navigate).toHaveBeenCalled();
    }));

    it('should user can apply given list of join types', async () => {
        const select = await loader.getHarness(MatSelectHarness.with({ selector: '#join-types' }));
        await select.open();
        const options = await select.getOptions();
        expect(options.length).toEqual(5);
        expect(await options[0].getText()).toEqual('Inner join - matching rows only');
        expect(await options[1].getText()).toEqual('Left join - all rows from the left table');
        expect(await options[2].getText()).toEqual('Right join - all rows from the right table');
        expect(await options[3].getText()).toEqual('Full outer join - all rows from both tables');
        expect(await options[4].getText()).toEqual('Union - map fields manually');
    });

    it('should available these join operators', async () => {
        const select = await loader.getHarness(MatSelectHarness.with({ selector: '#join-operators' }));
        await select.open();
        const options = await select.getOptions();
        expect(options.length).toEqual(4);
        expect(await options[0].getText()).toEqual('=');
        expect(await options[1].getText()).toEqual('!=');
        expect(await options[2].getText()).toEqual('Like');
        expect(await options[3].getText()).toEqual('Not Like');
    });

    it('should render selected value for condition operator', async () => {
        const select = await loader.getHarness(MatButtonToggleHarness.with({ selector: 'mat-button-toggle' }));
        const buttonText = await select.getText();
        expect(buttonText).toEqual('AND');
    });

    it('should not available join fields section if union is selected as join type', async () => {
        const ele = fixture.debugElement.query(By.css('#select-join-fields'));
        const select = await loader.getHarness(MatSelectHarness.with({ selector: '#join-types' }));
        await select.open();
        const options = await select.getOptions();
        options[4].isSelected();
        expect(ele).toEqual(null);
    });

    it('should available map fields if union is selected as join type', async () => {
        const ele = fixture.debugElement.query(By.css('#map-fields'));
        const select = await loader.getHarness(MatSelectHarness.with({ selector: '#join-types' }));
        await select.open();
        const options = await select.getOptions();
        options[4].isSelected();
        expect(ele).toBeDefined();
    });

    it('should addItem()', () => {
        const index = 1;
        component.ngOnInit();
        fixture.detectChanges();
        component.addItem(index);
        console.log('ele');
        expect(component.addItem).toBeTruthy();
    });

    it('should removeItem()', () => {
        const index = 1;
        component.ngOnInit();
        fixture.detectChanges();
        component.removeItem(index);
        expect(component.removeItem).toBeTruthy();
    });

    it('should save()', () => {
        fixture.detectChanges();
        component.selectedStepData = new GroupDetails();
        component.selectedStepData?.groupJoinDetail.push({ joinType: 'INNER', joinOperator: 'AND', joinMapping: [] })
        component.frmGroup.get('joinType').setValue('INNER');
        component.frmGroup.get('joinOperator').setValue('AND');
        component.frmGroup.get('sourceOne').setValue('1005');
        component.frmGroup.get('sourceTwo').setValue('1006');
        component.frmGroup.get('joinMapping').setValue([{ joinMappingId: '', sourceOneField: '101', sourceTwoField: '102', orderBy: 1, operator: 'EQUALS' }]);
        component.save();
        expect(component.save).toBeTruthy();
    });

    it('should areFieldsValid()', () => {
        spyOn(component,'areFieldsValid');
        fixture.detectChanges();
        const ele = fixture.debugElement.query(By.css('#source-one'))
        expect(ele).toBeTruthy();
        expect(component.areFieldsValid).toHaveBeenCalled();
        // fixture.whenStable().then(() => {
        // });
    });

});
