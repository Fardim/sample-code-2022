import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BusinessRuleType } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SharedModule } from '@modules/shared/shared.module';
import { CoreService } from '@services/core/core.service';
import { MdoUiLibraryModule, TransientService } from 'mdo-ui-library';
import { of } from 'rxjs';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ConditionSidesheetComponent } from './condition-sidesheet.component'

describe('ConditionSidesheetComponent', () => {
    let component: ConditionSidesheetComponent;
    let fixture: ComponentFixture<ConditionSidesheetComponent>;
    let transientService: TransientService;
    let router: Router;
    let coreService: CoreService

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConditionSidesheetComponent],
            imports: [MdoUiLibraryModule,
                HttpClientTestingModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule
            ],
            providers: []
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConditionSidesheetComponent);
        component = fixture.componentInstance;
        transientService = fixture.debugElement.injector.get(TransientService);
        router = TestBed.inject(Router);
        coreService = fixture.debugElement.injector.get(CoreService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('creatNewForm(),method to add new rule settings', async () => {
        component.creatNewForm();
        expect(component.creatNewForm).toBeTruthy();
    });

    it('removeSelectedCondition(), method to remove selected condition', async() => {
        component.creatNewForm();
        spyOn(transientService, 'confirm').and.callFake((a, b) => b('yes'));
        component.conditionCriteria = [{ conditionId: 2, conditionName: 'Condition 2', field1: '1',
                                         field2: '2', nounModSep: '()', shortDescSep: '+',
                                         longDescSep: '-', attSep: '{', attrFormatLongDesc: 'New',
                                         shortDescActive: 'true', longDescActive: 'false',
                                         manuallyDesc: 'true', classificationActive: 'false' },
                                         { conditionId: 1, conditionName: 'Condition 1', field1: '1',
                                         field2: '2', nounModSep: '()', shortDescSep: '+',
                                         longDescSep: '-', attSep: '{', attrFormatLongDesc: 'New',
                                         shortDescActive: 'true', longDescActive: 'false',
                                         manuallyDesc: 'true', classificationActive: 'false' }];

        component.removeSelectedCondition({conditionName:'Test1',conditionId: 1});
        expect(transientService.confirm).toHaveBeenCalled();
    });

    it('addNewCondition(), should add new condition', async()=>{
        component.configurationConditionForm = new FormGroup({});
        component.conditionCriteria = [{ conditionId: 1, conditionName: 'Condition 1' }]
        component.addNewCondition();
        expect(component.conditionCriteria.length).toEqual(2);
        expect(component.selectedCondition).toEqual({ conditionId: 2, conditionName: 'Condition 2' })
    });

    it('onClickOnListItem()', async() => {
        component.creatNewForm();
        component.conditionCriteria = [{ conditionId: 2, conditionName: 'Condition 2', field1: '1',
                                         field2: '2', nounModSep: '()', shortDescSep: '+',
                                         longDescSep: '-', attSep: '{', attrFormatLongDesc: 'New',
                                         shortDescActive: 'true', longDescActive: 'false',
                                         manuallyDesc: 'true', classificationActive: 'false' },
                                        {conditionId: 1, conditionName: 'Condition 1', field1: '1',
                                         field2: '2', nounModSep: '()', shortDescSep: '+',
                                         longDescSep: '-', attSep: '{', attrFormatLongDesc: 'New',
                                         shortDescActive: 'true', longDescActive: 'false',
                                         manuallyDesc: 'true', classificationActive: 'false' }];
        const condition = { conditionId: 1, conditionName: 'Condition 1' };
        component.onClickOnListItem(condition,0);
        expect(component.selectedCondition).toEqual({ conditionId: 1, conditionName: 'Condition 1' });
    });

    it('onSubmit(), on submit', async() => {
        component.conditionCriteria = [{ conditionId: 2, conditionName: 'Condition 2', field1: '1',
                                         field2: '2', nounModSep: '()', shortDescSep: '+',
                                         longDescSep: '-', attSep: '{', attrFormatLongDesc: 'New',
                                         shortDescActive: 'true', longDescActive: 'false',
                                         manuallyDesc: 'true', classificationActive: 'false' },
                                        {conditionId: 1, conditionName: 'Condition 1', field1: '1',
                                         field2: '2', nounModSep: '()', shortDescSep: '+',
                                         longDescSep: '-', attSep: '{', attrFormatLongDesc: 'New',
                                         shortDescActive: 'true', longDescActive: 'false',
                                         manuallyDesc: 'true', classificationActive: 'false' }];

        component.storeClassificationTable = [{brType: BusinessRuleType.BR_CLASSIFICATION_RULE,brInfo:'New', descriptionRule: {conditionList: [{conditionId: 1, conditionName: 'Condition 1', field1: '1',
                                              field2: '2', nounModSep: '()', shortDescSep: '+', longDescSep: '-', attSep: '{', attrFormatLongDesc: 'New',
                                              shortDescActive: 'true', longDescActive: 'false', manuallyDesc: 'true', classificationActive: 'false' }]}}];

        component.onSubmit();
        expect(component.onSubmit).toBeTruthy();

        component.storeClassificationTable = [{brType: BusinessRuleType.BR_CLASSIFICATION_RULE,brInfo:'New', descriptionRule: {conditionList: [{conditionId: 1, conditionName: 'Condition 1', field1: '2',
                                              field2: '3', nounModSep: '()', shortDescSep: '+', longDescSep: '-', attSep: '{', attrFormatLongDesc: 'New',
                                              shortDescActive: 'true', longDescActive: 'false', manuallyDesc: 'true', classificationActive: 'false' }]}}];

        component.onSubmit();
        expect(component.onSubmit).toBeTruthy();
    });

    it('displayWithAttr(), to display value', async() => {
        const result = component.displayWithAttr({key: 'KEY', value: 'VALUE'});
        expect(result).toEqual('VALUE');
    });

    it('closeSidesheet(),should close sidesheet', () => {
        spyOn(router, 'navigate');
        component.creatNewForm();
        component.closeSidesheet();
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb3: null } }]);
    });

    it('ngOnInit()', async() => {
        const response = {content: [{brType: BusinessRuleType.BR_CLASSIFICATION_RULE}]} as any;
        spyOn(coreService,'getDatasetBusinessRuleList').withArgs(0,50,{}).and.returnValue(of(response));
        component.conditionCriteria = [{ conditionId: 2, conditionName: 'Condition 2', field1: '1',
                                         field2: '2', nounModSep: '()', shortDescSep: '+',
                                         longDescSep: '-', attSep: '{', attrFormatLongDesc: 'New',
                                         shortDescActive: 'true', longDescActive: 'false',
                                         manuallyDesc: 'true', classificationActive: 'false' }];
        component.ngOnInit();
        expect(component.storeClassificationTable.length).toEqual(1);
    });
});