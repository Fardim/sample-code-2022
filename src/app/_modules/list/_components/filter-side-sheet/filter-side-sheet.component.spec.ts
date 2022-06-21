import { MdoUiLibraryModule, TransientService } from 'mdo-ui-library';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FilterRouteData, FilterSideSheetComponent } from './filter-side-sheet.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { FormInputComponent } from '@modules/shared/_components/form-input/form-input.component';
import { SetupDuplicateRuleComponent } from '@modules/schema/_components/v2/brrule-side-sheet/duplicate-rule-config/setup-duplicate-rule/setup-duplicate-rule.component';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { LookupFields, MetadataModeleResponse, TransformationFormData } from '@models/schema/schemadetailstable';
import { of } from 'rxjs';
import { ApiRulesInfo, BusinessRuleType, CoreSchemaBrInfo, TransformationMappingResponse, TransformationMappingTabResponse, TransformationModel, TransformationRuleType, UDRBlocksModel, UdrModel } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { BlockType } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-cdktree.service';
import { SharedModule } from '@modules/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Regex } from '@modules/admin/_components/module/business-rules/regex-rule/regex-rule.component';
import { TragetInfo } from 'src/app/_constants';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaBrInfo } from 'src/app/_models/schema/schemadetailstable';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { GlobaldialogService } from '@services/globaldialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';


describe('FilterSideSheetComponent', () => {
    let component: FilterSideSheetComponent;
    let fixture: ComponentFixture<FilterSideSheetComponent>;
    let schemaDetailsServicespy: SchemaDetailsService;
    let schemaServiceSpy: SchemaService;
    let router: Router;
    let transientService: TransientService;
    let globaldialogService: GlobaldialogService;
    let sharedService: SharedServiceService;
    const mockMatSnackBar = {
        open: jasmine.createSpy('open')
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FilterSideSheetComponent, FormInputComponent, SetupDuplicateRuleComponent],
            imports: [MdoUiLibraryModule,
                HttpClientTestingModule, AppMaterialModuleForSpec, RouterTestingModule, SharedModule
            ],
            providers: [SchemaDetailsService, GlobaldialogService,
                {
                    provide: ActivatedRoute,
                    useValue: { params: of({ moduleId: '1005', schemaId: 'schema1', brId: 'new' }), queryParams: of({ moduleId: '1005', schemaId: 'schema1', brId: 'DRChild', r: 'BR_TRANSFORMATION' }) }
                }, {
                    provide: MatSnackBar,
                    useValue: mockMatSnackBar
                },]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterSideSheetComponent);
        component = fixture.componentInstance;
        component.fieldsList = [
            { fieldId: '1', fieldDescri: 'first name' }
        ];
        schemaDetailsServicespy = fixture.debugElement.injector.get(SchemaDetailsService);
        schemaServiceSpy = fixture.debugElement.injector.get(SchemaService);
        sharedService = fixture.debugElement.injector.get(SharedServiceService);
        transientService = fixture.debugElement.injector.get(TransientService);
        globaldialogService = fixture.debugElement.injector.get(GlobaldialogService);
        router = fixture.debugElement.injector.get(Router);
        window.history.pushState({
            table: {
                filterType: undefined,
                id: 'ITM_ATTR',
                moduleId: 5023,
                name: 'Attribute'
            }, columns: [{ id: 'ITM_ATTR_NM', name: 'Attribute Name', dataType: 'CHAR', maxLength: '2000', selected: true },
            { id: 'ITM_ATTR_VAL', name: 'Attribute Value', dataType: 'CHAR', maxLength: '2000', selected: true }], navigationId: 10
        }, '', '');
    });

    it('should create', () => {
        console.log('log');
        expect(component).toBeTruthy();
    });

    it('should ngOnInit', () => {
        fixture.detectChanges();
        component.buildCommonDataForm();
        expect(component.form).toBeDefined();
        component.brId = '113';
        component.activeOutlet = 'sb3';
        component.isDRChildRule = true;
        spyOn(sharedService, 'gettransSavedBehaviourSub').and.returnValue(of(true));
        spyOn(sharedService, 'getAfterBrSave').and.returnValue(of({}));
        schemaServiceSpy.drChildRequest = null;
        component.ngOnInit();
        component.hasAppliedTransformationCtrl.setValue('test');
        expect(component.ngOnInit).toBeTruthy();
    });

    it('should getAfterBrSave()', () => {
        component.buildCommonDataForm();
        expect(component.form).toBeDefined();
        component.brId = '113';
        component.activeOutlet = 'sb3';
        component.isDRChildRule = true;
        const res = { brType: BusinessRuleType.BR_TRANSFORMATION }
        spyOn(sharedService, 'gettransSavedBehaviourSub').and.returnValue(of(true));
        spyOn(sharedService, 'getAfterBrSave').and.returnValue(of(res));
        schemaServiceSpy.drChildRequest = null;
        component.ngOnInit();
        component.hasAppliedTransformationCtrl.setValue('test');
        expect(component.ngOnInit).toBeTruthy();
    });

    it('should init common data form', () => {

        spyOn(component, 'applyValidatorsByRuleType');

        component.buildCommonDataForm();
        expect(component.form).toBeDefined();

        component.form.controls.rule_type.setValue('BR_CUSTOM_SCRIPT');
        component.form.controls.transformationRuleType.setValue('REGEX');

        expect(component.applyValidatorsByRuleType).toHaveBeenCalledTimes(1);

    });

    it('should initGridAndHierarchyToAutocompleteDropdown', () => {
        const metadataModeleResponse = {
            grids: { ADDINFO: { fieldDescri: 'Additional data for GS1', fieldId: 'ADDINFO' } },
            gridFields: { ADDINFO: { ADD_HEIGHT: { fieldDescri: 'Height', fieldId: 'ADD_HEIGHT' } } },
            hierarchy: [{ fieldId: 'PLANT', heirarchyId: '1', heirarchyText: 'Plant Data', }],
            hierarchyFields: { 1: { ABC_INDIC: { fieldDescri: 'ABC Indicator', fieldId: 'ABC_INDIC' } } }
        } as MetadataModeleResponse;

        component.initGridAndHierarchyToAutocompleteDropdown(metadataModeleResponse);
        expect(component.allGridAndHirarchyData.length).toEqual(2);
    });


    it('should get conditions', () => {
        expect(component.getConditions()[0]).toEqual('And');
        expect(component.getConditions().length).toEqual(2);
    });

    it('formatLabel(), return value in string', async(() => {
        const value = 'Test';
        expect(component.formatLabel(value)).toEqual('Test');
    }));

    it('getCategories(), should call getAllCategoryInfo', () => {
        spyOn(schemaDetailsServicespy, 'getAllCategoryInfo').and.returnValues(of(null), of([{ categoryId: '1', categoryDesc: 'desc' }]));
        component.getCategories();
        component.getCategories();
        expect(schemaDetailsServicespy.getAllCategoryInfo).toHaveBeenCalledTimes(2);
    });

    it('getCategories(), should call getAllCategoryInfo', () => {
        spyOn(schemaDetailsServicespy, 'getAllCategoryInfo').and.returnValue(of([{ categoryId: '1', categoryDesc: 'desc' }]));
        component.buildCommonDataForm();
        component.getCategories();

        expect(schemaDetailsServicespy.getAllCategoryInfo).toHaveBeenCalledTimes(1);
    });

    it('remove(), remove the value', (() => {
        component.selectedFields = ['NDC_TYPE'];
        component.remove('NDC_TYPE', 0);
        expect(component.selectedFields.length).toEqual(0);
    }));

    it('isRegexType, sould return true if selected rule is regex type', (() => {
        component.buildCommonDataForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.BR_REGEX_RULE);
        expect(component.isRegexType).toBeTrue();
    }));

    it('delayedCallWithTransLib', (() => {
        spyOn(component, 'delayedCallWithTransLib').and.callThrough();
        component.delayedCallWithTransLib('test');
        expect(component.delayedCallWithTransLib).toHaveBeenCalled();
    }));

    it('delayedCallForApis ', (() => {
        spyOn(component, 'delayedCallForApis').and.callThrough();
        component.delayedCallForApis('test');
        expect(component.delayedCallForApis).toHaveBeenCalled();
    }));

    it('sourceFieldsFiltered()', async () => {
        await component.buildCommonDataForm();
        component.form.controls.sourceFieldSearchStr.setValue('field');
        component.sourceFieldsObject = {
            list: [
                {
                    fieldId: '123',
                    fieldDescri: 'test'
                }
            ],
            valueKey: 'fieldId',
            labelKey: 'fieldDescri'
        };
        expect(component.sourceFieldsFiltered).toBeTruthy();
    });

    it('filterRuleTypes()', (() => {
        fixture.detectChanges();
        component.filterRuleTypes();
        expect(component.filterRuleTypes).toBeTruthy();
    }));

    it('isTransformationRule, sould return true if selected rule is transformation type', (() => {
        component.buildCommonDataForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.BR_TRANSFORMATION);
        expect(component.isTransformationRule).toBeTrue();
    }));

    it('isMPNI', (() => {
        component.buildCommonDataForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI);
        expect(component.isMPNI).toBeTrue();
    }));

    it('isUDR, sould return true if selected rule is custom script type', (() => {
        component.buildCommonDataForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.BR_CUSTOM_SCRIPT);
        expect(component.isUDR).toBeTrue();
    }));

    it('possibleOperators(), sould return array of all possible operators', (() => {
        const operators = component.possibleOperators();
        expect(operators.length).toEqual(3);
    }));

    it(`createBrObject(), should create business rule object`, async(() => {
        let formData: any = {
            rule_type: 'test',
            rule_name: 'test',
            error_message: 'test',
            standard_function: 'test',
            regex: 'test',
            fields: [],
            udrTreeData: { udrHierarchies: [], blocks: [] },
            weightage: 10,
            categoryId: 'test',
        };

        let brObject = component.createBrObject(formData, formData.udrTreeData);
        expect(brObject).not.toBeUndefined();
        expect(brObject).not.toBeNull();
        expect(brObject.brType).toEqual('test');

        formData = {
            sno: 1,
            refid: 1,
            message: 'test',
            script: 'test',
            brInfo: 'test',
            status: 1,
            brExpose: 1,
            brType: 'test',
            rule_type: 'test',
            rule_name: 'test',
            error_message: 'test',
            standard_function: 'test',
            regex: 'test',
            fields: [],
            udrTreeData: { udrHierarchies: [], blocks: [] },
            weightage: 10,
            brIdStr: 'test',
            percentage: 1,
            plantCode: '1',
            tableName: 'test',
            transformation: 1,
            categoryId: 'test',
            isCopied: true
        };
        brObject = component.createBrObject(formData, formData.udrTreeData);
        expect(brObject).not.toBeUndefined();
        expect(brObject).not.toBeNull();
        expect(brObject.brType).toEqual('test');
        expect(brObject.isCopied).toBeTruthy();
    }));

    it(`initUDRForm(), should create UDR form object`, async(() => {
        component.initUDRForm();
        expect(component.udrNodeForm).not.toBeUndefined();
        expect(component.udrNodeForm).not.toBeNull();
    }));

    it('should getBusinessRuleInfo()', () => {
        const coreSchemaBrInfo = new CoreSchemaBrInfo();
        coreSchemaBrInfo.brType = BusinessRuleType.BR_CUSTOM_SCRIPT;
        coreSchemaBrInfo.isTransformationApplied = true;
        spyOn(component, 'getBusinessRuleInfo').and.callThrough();
        spyOn(schemaServiceSpy, 'getBusinessRuleInfoV2').and.returnValue(of(component.coreSchemaBrInfo));

        component.getBusinessRuleInfo('113');
        expect(component.getBusinessRuleInfo).toHaveBeenCalled();
    });

    it('initiateAutocomplete()', () => {
        component.buildCommonDataForm();
        spyOn(component, 'initiateAutocomplete').and.callThrough();
        component.initiateAutocomplete();
        component.form.controls.target_field.setValue('1');
        component.form.controls.fields.setValue('status');

        expect(component.initiateAutocomplete).toHaveBeenCalled();
    });

    it('saveLookupRule() form invalid', () => {
        const ev = { errorMsg: 'error', data: { lookupRuleMetadata: { sno: '123' }, brId: '', brIdStr: '', brType: '', brInfo: '', message: '', schemaId: '', moduleId: '', brWeightage: '', isCopied: false, copiedFrom: '', dependantStatus: '', order: 0, status: '1' } }
        component.isDRChildRule = null;
        const coreSchemaBrInfo = {} as CoreSchemaBrInfo;
        component.buildCommonDataForm();
        spyOn(component, 'saveLookupRule').and.callThrough();
        spyOn(schemaServiceSpy, 'createBusinessRuleV2').and.returnValue(of(coreSchemaBrInfo));
        component.saveLookupRule(ev);

        expect(component.saveLookupRule).toHaveBeenCalled();
    });


    it('searchApisRules', () => {
        spyOn(component, 'searchApisRules').and.callThrough();
        component.searchApisRules('test');
        expect(component.searchApisRules).toHaveBeenCalled();
    });

    it('reorderTrans when tab equal success', () => {
        const event = { item: { data: {} }, previousContainer: { id: '1' }, container: { id: '2' }, previousIndex: 0, currentIndex: 1 } as CdkDragDrop<CoreSchemaBrInfo>;
        component.attachedTransRules = {
            error: [{ isConfigured: false, isEnabled: true, ruleInfo: { brIdStr: '775755' } as CoreSchemaBrInfo }], success: [
                { isConfigured: false, isEnabled: false, ruleInfo: { brIdStr: '9866757' } as CoreSchemaBrInfo }
            ]
        };
        spyOn(component, 'reorderTrans').and.callThrough();
        component.reorderTrans(event, 'success');
        expect(component.reorderTrans).toHaveBeenCalled();
    });

    it('reorderTrans when tab equal not success', () => {
        const event = { item: { data: {} }, previousContainer: { id: '1' }, container: { id: '2' }, previousIndex: 0, currentIndex: 1 } as CdkDragDrop<CoreSchemaBrInfo>;
        component.attachedTransRules = {
            error: [{ isConfigured: false, isEnabled: true, ruleInfo: { brIdStr: '775755' } as CoreSchemaBrInfo }], success: [
                { isConfigured: false, isEnabled: false, ruleInfo: { brIdStr: '9866757' } as CoreSchemaBrInfo }
            ]
        };
        spyOn(component, 'reorderTrans').and.callThrough();
        component.reorderTrans(event, 'test');
        expect(component.reorderTrans).toHaveBeenCalled();
    });

    it('saveLookupRule() form valid', () => {
        component.buildCommonDataForm();
        component.isDRChildRule = true;
        const coreSchemaBrInfo = {} as CoreSchemaBrInfo;
        component.form.controls.rule_type.setValue('test');
        component.form.controls.rule_name.setValue('test');
        component.form.controls.error_message.setValue('test');
        component.form.controls.weightage.setValue('test');
        component.form.controls.apiSno.setValue('test');
        const ev = { errorMsg: '', data: { lookupRuleMetadata: { sno: '123' }, brId: '', brIdStr: '', brType: '', brInfo: '', message: '', schemaId: '', moduleId: '', brWeightage: '', isCopied: false, copiedFrom: '', dependantStatus: '', order: 0, status: '1' } }
        spyOn(component, 'saveLookupRule').and.callThrough();
        spyOn(schemaServiceSpy, 'createBusinessRuleV2').and.returnValue(of(coreSchemaBrInfo));
        component.saveLookupRule(ev);

        expect(component.saveLookupRule).toHaveBeenCalled();
    });

    it('saveLookupRule() cover else statement', () => {
        component.buildCommonDataForm();
        component.isDRChildRule = null;
        const coreSchemaBrInfo = {} as CoreSchemaBrInfo;
        component.form.controls.rule_type.setValue('test');
        component.form.controls.rule_name.setValue('test');
        component.form.controls.error_message.setValue('test');
        component.form.controls.weightage.setValue('test');
        component.form.controls.apiSno.setValue('test');
        const ev = { errorMsg: '', data: { lookupRuleMetadata: { sno: '123' }, brId: '', brIdStr: '', brType: '', brInfo: '', message: '', schemaId: '', moduleId: '', brWeightage: '', isCopied: false, copiedFrom: '', dependantStatus: '', order: 0, status: '1' } }
        spyOn(component, 'saveLookupRule').and.callThrough();
        spyOn(schemaServiceSpy, 'createBusinessRuleV2').and.returnValue(of(coreSchemaBrInfo));
        component.saveLookupRule(ev);

        expect(component.saveLookupRule).toHaveBeenCalled();
    });

    it('saveLookupRule() error message', () => {
        component.buildCommonDataForm();
        component.isDRChildRule = null;
        const coreSchemaBrInfo = {} as CoreSchemaBrInfo;
        component.form.controls.rule_type.setValue('test');
        component.form.controls.rule_name.setValue('test');
        component.form.controls.error_message.setValue('test');
        component.form.controls.weightage.setValue('test');
        component.form.controls.apiSno.setValue('test');
        const ev = { errorMsg: 'error', data: null }
        spyOn(component, 'saveLookupRule').and.callThrough();
        spyOn(schemaServiceSpy, 'createBusinessRuleV2').and.returnValue(of(coreSchemaBrInfo));
        component.saveLookupRule(ev);

        expect(component.saveLookupRule).toHaveBeenCalled();
    });

    it('save() if statement', () => {
        component.categoryList = [
            {
                categoryId: '12',
                categoryDesc: 'test'
            }
        ];
        component.selectedFields = [{ fieldId: 'fld1' }];
        component.selectedTargetFields = [{ fieldId: 'fld1' }];
        component.buildCommonDataForm();
        component.form.controls.categoryId.setValue('123');
        component.form.controls.fields.setValue('status');
        component.form.controls.transformationRuleType.setValue(component.transformationType.LOOKUP);
        component.isOnlyForTrans = true;
        component.attachedTransRules = {} as TransformationMappingResponse;
        component.isDRChildRule = true;
        component.currentSelectedRule = BusinessRuleType.BR_TRANSFORMATION;
        component.coreSchemaBrInfo.brType = BusinessRuleType.BR_CUSTOM_SCRIPT;
        component.brId = '1701';
        component.coreSchemaBrInfo = { categoryId: '1' } as CoreSchemaBrInfo;
        component.initUDRForm();
        spyOn(component, 'save').and.callThrough();
        spyOn(schemaServiceSpy, 'createBusinessRule').and.returnValue(of(new CoreSchemaBrInfo()));
        spyOn(schemaDetailsServicespy, 'getSchemaBrInfoList').and.returnValue(of([]));
        component.form.patchValue({ rule_type: BusinessRuleType.BR_MANDATORY_FIELDS, fields: 'region', rule_name: 'new br', error_message: 'required', weightage: 25, apiSno: '876785875' },
            { emitEvent: false });
        component.save();
        expect(component.save).toHaveBeenCalled();
    });

    it('save() else statement', () => {
        component.categoryList = [
            {
                categoryId: '123',
                categoryDesc: 'test'
            }
        ];
        component.selectedFields = [{ fieldId: 'fld1' }];
        component.selectedTargetFields = [{ fieldId: 'fld1' }];
        component.buildCommonDataForm();
        component.form.controls.categoryId.setValue('123');
        component.form.controls.fields.setValue('status');
        component.form.controls.transformationRuleType.setValue(component.transformationType.LOOKUP);
        component.isOnlyForTrans = true;
        component.attachedTransRules = {} as TransformationMappingResponse;
        component.isDRChildRule = true;
        component.currentSelectedRule = BusinessRuleType.BR_TRANSFORMATION;
        component.coreSchemaBrInfo.brType = BusinessRuleType.BR_CUSTOM_SCRIPT;
        component.initUDRForm();
        spyOn(component, 'save').and.callThrough();

        component.save();
        expect(component.save).toHaveBeenCalled();
    });

    it('canAllowNewBR() whem brId is there', () => {
        component.brId = '113';
        spyOn(component, 'canAllowNewBR').and.callThrough();
        component.canAllowNewBR();
        expect(component.canAllowNewBR).toHaveBeenCalled();
    });

    it('canAllowNewBR()', () => {
        const response = [] as SchemaBrInfo[];
        spyOn(component, 'canAllowNewBR').and.callThrough();
        spyOn(schemaDetailsServicespy, 'getSchemaBrInfoList').and.returnValue(of(response));
        component.canAllowNewBR();
        expect(component.canAllowNewBR).toHaveBeenCalled();
    });

    it('should loadFields()', () => {
        component.coreSchemaBrInfo = new CoreSchemaBrInfo();
        component.coreSchemaBrInfo.fields = '1,2';
        component.coreSchemaBrInfo.target_field = '1,2';
        component.coreSchemaBrInfo.source_field = '1';
        component.brId = '113';
        component.isOnlyForTrans = true;
        component.fieldsList = [
            { fieldId: '1', fieldDescri: 'first name' }
        ];
        component.buildCommonDataForm();
        spyOn(component, 'loadFields').and.callThrough();
        component.loadFields();
        expect(component.loadFields).toHaveBeenCalled();
    });

    it('should loadFields() else statement', () => {
        component.coreSchemaBrInfo = new CoreSchemaBrInfo();
        component.coreSchemaBrInfo.fields = '1,2';
        component.coreSchemaBrInfo.target_field = '1,2';
        component.coreSchemaBrInfo.source_field = '3';
        component.brId = '113';
        component.isOnlyForTrans = true;
        component.allGridAndHirarchyData = [
            {
                name: 'Test',
                parent: 'Test',
                children: []
            }
        ];
        component.fieldsList = [
            { fieldId: '1', fieldDescri: 'first name' }
        ];
        component.buildCommonDataForm();
        spyOn(component, 'loadFields').and.callThrough();
        component.loadFields();
        expect(component.loadFields).toHaveBeenCalled();
    });

    it('should getFieldsByModuleId()', () => {
        const metadataModeleResponse = new MetadataModeleResponse();
        metadataModeleResponse.headers = { fieldDescri: 'test' + '/' + 'test123', fieldId: 'test1' };
        component.moduleId = '1005';
        component.brId = '113';
        component.coreSchemaBrInfo = new CoreSchemaBrInfo();
        component.coreSchemaBrInfo.fields = 'status';
        component.coreSchemaBrInfo.source_field = 'test';
        component.coreSchemaBrInfo.target_field = 'test123';
        component.isOnlyForTrans = true;
        component.buildCommonDataForm();
        spyOn(component, 'getFieldsByModuleId').and.callThrough();
        spyOn(schemaDetailsServicespy, 'getMetadataFields').and.returnValue(of(metadataModeleResponse));
        component.routeData = {} as FilterRouteData;
        component.routeData.moduleType = 'HEADER';
        component.getFieldsByModuleId();
        expect(component.getFieldsByModuleId).toHaveBeenCalled();
    });

    it('should getFieldsByModuleId() when moduleType equal GRID', () => {
        const metadataModeleResponse = new MetadataModeleResponse();
        metadataModeleResponse.headers = { fieldDescri: 'test' + '/' + 'test123', fieldId: 'test1' };
        component.moduleId = '1005';
        component.brId = '113';
        component.coreSchemaBrInfo = new CoreSchemaBrInfo();
        component.coreSchemaBrInfo.fields = 'status';
        component.coreSchemaBrInfo.source_field = 'test';
        component.coreSchemaBrInfo.target_field = 'test123';
        component.isOnlyForTrans = true;
        component.buildCommonDataForm();
        spyOn(component, 'getFieldsByModuleId').and.callThrough();
        spyOn(schemaDetailsServicespy, 'getMetadataFields').and.returnValue(of(metadataModeleResponse));
        component.routeData = {} as FilterRouteData;
        component.routeData.moduleType = 'GRID';
        component.getFieldsByModuleId();
        expect(component.getFieldsByModuleId).toHaveBeenCalled();
    });

    it('should getFieldsByModuleId() when moduleType equal HIERARCHY', () => {
        const metadataModeleResponse = new MetadataModeleResponse();
        metadataModeleResponse.headers = { fieldDescri: 'test' + '/' + 'test123', fieldId: 'test1' };
        component.moduleId = '1005';
        component.brId = '113';
        component.coreSchemaBrInfo = new CoreSchemaBrInfo();
        component.coreSchemaBrInfo.fields = 'status';
        component.coreSchemaBrInfo.source_field = 'test';
        component.coreSchemaBrInfo.target_field = 'test123';
        component.isOnlyForTrans = true;
        component.buildCommonDataForm();
        spyOn(component, 'getFieldsByModuleId').and.callThrough();
        spyOn(schemaDetailsServicespy, 'getMetadataFields').and.returnValue(of(metadataModeleResponse));
        component.routeData = {} as FilterRouteData;
        component.routeData.moduleType = 'HIERARCHY';
        component.getFieldsByModuleId();
        expect(component.getFieldsByModuleId).toHaveBeenCalled();
    });

    it('should selectTargetField()', () => {
        component.buildCommonDataForm();
        spyOn(component, 'selectTargetField').and.callThrough();
        component.selectedTargetFields = [{ fieldId: 'fld1' }];
        const event = { option: { value: 'fld1', viewValue: 'fld2' } };
        component.selectTargetField(event);
        expect(component.selectTargetField).toHaveBeenCalled();
    });

    it('should selectTargetField() else statement', () => {
        component.buildCommonDataForm();
        spyOn(component, 'selectTargetField').and.callThrough();
        component.selectedTargetFields = [{ fieldId: 'fld3' }];
        const event = { option: { value: 'fld1', viewValue: 'fld2' } };
        component.selectTargetField(event);
        expect(component.selectTargetField).toHaveBeenCalled();
    });

    it('should removeTrans() handling if statement', () => {
        const transformationMappingTabResponse = { ruleInfo: { brIdStr: 'test' } } as TransformationMappingTabResponse;
        component.attachedTransRules = { success: [{ ruleInfo: { brIdStr: 'test' } }], error: [{ ruleInfo: { brIdStr: 'test' } }] } as TransformationMappingResponse;
        spyOn(component, 'removeTrans').and.callThrough();
        spyOn(globaldialogService, 'confirm').and.callFake((a, b) => b('yes'));
        component.removeTrans(transformationMappingTabResponse, 'success');
        expect(globaldialogService.confirm).toHaveBeenCalled();
        expect(component.removeTrans).toHaveBeenCalled();
    });

    it('should removeTrans() handling else statement', () => {
        const transformationMappingTabResponse = { ruleInfo: { brIdStr: 'test' } } as TransformationMappingTabResponse;
        component.attachedTransRules = { success: [{ ruleInfo: { brIdStr: 'test' } }], error: [{ ruleInfo: { brIdStr: 'test' } }] } as TransformationMappingResponse;
        spyOn(component, 'removeTrans').and.callThrough();
        spyOn(globaldialogService, 'confirm').and.callFake((a, b) => b('yes'));
        component.removeTrans(transformationMappingTabResponse, 'test');
        expect(globaldialogService.confirm).toHaveBeenCalled();
        expect(component.removeTrans).toHaveBeenCalled();
    });

    it('getTransRules', () => {
        const response = [] as CoreSchemaBrInfo[];
        spyOn(component, 'getTransRules').and.callThrough();
        spyOn(schemaServiceSpy, 'transformationRules').and.returnValue(of(response))
        component.getTransRules('test');
        expect(component.getTransRules).toHaveBeenCalled();
    });

    it('should setupWebServiceCallFormRef()', () => {
        fixture.detectChanges();
        const controls = {
            rule_type: new FormControl('', [Validators.required]),
            rule_name: new FormControl('', [Validators.required]),
            error_message: new FormControl('', [Validators.required]),
            standard_function: new FormControl(''),
            regex: new FormControl(''),
            fields: new FormControl(''),
            apiKey: new FormControl(''),
            sourceFld: new FormControl(''),
            targetFld: new FormControl(''),
            excludeScript: new FormControl(''),
            includeScript: new FormControl(''),
            udrTreeData: new FormControl(),
            weightage: new FormControl(0, [Validators.required]),
            categoryId: new FormControl(null),
            transformationRuleType: new FormControl(''),
            source_field: new FormControl(''),
            target_field: new FormControl(''),
            accuracyScore: new FormControl(0),
            sourceFieldSearchStr: new FormControl(''),
            apiSno: new FormControl('', [Validators.required])
        };

        const formGrp = new FormGroup(controls);
        component.setupWebServiceCallFormRef(formGrp);
        expect(component.setupWebServiceCallFormRef).toBeTruthy();
    });

    it('should clickTreeNode()', () => {
        component.buildCommonDataForm();
        const selectedNode = {
            fieldDescri: 'test' + '/' + 'test123',
            fieldId: 101
        }
        component.selectedFields = [{ fieldId: 101 }];
        spyOn(component, 'clickTreeNode').and.callThrough();
        component.clickTreeNode(selectedNode);
        expect(component.clickTreeNode).toHaveBeenCalled();
    });

    it(`To get FormControl from fromGroup `, async(() => {
        component.buildCommonDataForm()
        const field = component.formField('rule_name');
        expect(field).toBeDefined();
    }));

    it(`To UPDATE Transformation rule type when lib radio is clicked `, async(() => {
        component.updateTransformationRuleType({ value: true });
        component.buildCommonDataForm()
        component.updateTransformationRuleType({ value: true })
        const field = component.formField('transformationRuleType');
        expect(field).toBeTruthy();
        component.form.controls.transformationRuleType.setValue(false);
        component.updateTransformationRuleType({ value: true });
        const field2 = component.formField('transformationRuleType');
        delete component.form.controls;
        expect(field2.value).toEqual({ value: true });

    }));

    it(`To set form value in a form `, async(() => {
        component.buildCommonDataForm()
        component.getFormValue(true, 'transformationRuleType')
        const field = component.formField('transformationRuleType');
        expect(field).toBeTruthy();
    }));

    it('showValidationError(), should hide validation message', fakeAsync(() => {
        component.validationError = {
            status: false,
            message: ''
        }

        const message = 'Please fill the required fields.'
        component.showValidationError(message);
        expect(component.validationError.status).toEqual(true);
        tick(3500);
        expect(component.validationError.status).toEqual(false);
    }))

    it('shouls get transformationType', () => {
        expect(component.transformationType).toBeDefined();
    })

    it('should get selectedTransformationType', async(() => {
        spyOn(component, 'applyValidatorsByRuleType');
        expect(component.selectedTransformationType).toBeFalsy();
        component.isDRChildRule = true;
        component.buildCommonDataForm();
        component.form.controls.transformationRuleType.setValue('REGEX');
        expect(component.selectedTransformationType).toEqual('REGEX');
    }))

    it('should get selectedTransRuleTypeRadio', async(() => {
        component.buildCommonDataForm();
        let selectedType: any = component.selectedTransRuleTypeRadio;
        expect(selectedType).toEqual(undefined);
        component.form.controls.transformationRuleType.setValue('REGEX', { emitEvent: false });
        selectedType = component.selectedTransRuleTypeRadio;
        expect(selectedType?.value).toEqual('REGEX');
        delete component.form;
        expect(component.selectedTransRuleTypeRadio).toEqual('');
    }))

    it('should get currentweightageValue', () => {
        expect(component.currentweightageValue).toBeFalsy();
    })

    it('should initiateAutocomplete', () => {
        component.fieldsList = [{ fieldId: 'region', fieldDescri: 'region' }];
        component.buildCommonDataForm();
        let filteredFields;
        component.filteredModules.subscribe(fields => filteredFields = fields);
        component.initiateAutocomplete();
        component.form.controls.fields.setValue('status');
        expect(filteredFields.length).toEqual(0);
    })

    it('initiateAutocomplete(), should init autocomplete', async(() => {
        spyOn(component, 'getCategories');
        spyOn(component, 'getFieldsByModuleId');
        spyOn(component, 'getBusinessRuleInfo');
        spyOn(component, 'getMappedTransformationRules');
        spyOn(component, 'getTransRules');
        spyOn(component, 'applyValidatorsByRuleType');

        component.ngOnInit();
        component.form.controls.fields.setValue('email');
        component.allGridAndHirarchyData = [
            {
                name: 'Test',
                parent: 'Test',
                children: []
            }
        ];
        component.fieldsList = [];
        component.initiateAutocomplete();
        component.filteredModules.subscribe((res: any) => {
            expect(res.length).toEqual(0);
        });
    }));

    it('should apply validators by rule type', async(() => {
        component.buildCommonDataForm();

        component.applyValidatorsByRuleType(BusinessRuleType.BR_CUSTOM_SCRIPT);
        expect(component.form.controls.rule_name).toBeDefined();

        component.applyValidatorsByRuleType(BusinessRuleType.BR_REGEX_RULE);
        expect(component.form.controls.rule_name).toBeDefined();

        component.applyValidatorsByRuleType(BusinessRuleType.BR_LOOKUP_RULE);
        expect(component.form.controls.rule_name).toBeDefined();

        component.applyValidatorsByRuleType(BusinessRuleType.BR_MANDATORY_FIELDS);
        expect(component.form.controls.rule_name).toBeDefined();

        component.form.controls.transformationRuleType.setValue('REGEX', { emitEvent: false });
        component.applyValidatorsByRuleType(BusinessRuleType.BR_TRANSFORMATION);
        expect(component.form.controls.rule_name).toBeDefined();

        component.form.controls.transformationRuleType.setValue('LOOKUP', { emitEvent: false });
        component.applyValidatorsByRuleType(BusinessRuleType.BR_TRANSFORMATION);
        expect(component.form.controls.rule_name).toBeDefined();

        component.applyValidatorsByRuleType(BusinessRuleType.MRO_CLS_MASTER_CHECK);
        expect(component.form.controls.rule_name).toBeDefined();

        component.applyValidatorsByRuleType(BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI);
        expect(component.form.controls.rule_name).toBeDefined();

        component.applyValidatorsByRuleType(BusinessRuleType.MRO_GSN_DESC_MATCH);
        expect(component.form.controls.rule_name).toBeDefined();

        component.applyValidatorsByRuleType(BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP);
        expect(component.form.controls.rule_name).toBeDefined();

        component.applyValidatorsByRuleType(BusinessRuleType.BR_DUPLICATE_RULE);
        expect(component.form.controls.rule_name).toBeDefined();

    }));

    it('should setValueToElement', async(() => {

        // mock data
        component.hasAppliedTransformationCtrl = new FormControl(true);

        component.buildCommonDataForm();

        const brInfo = new CoreSchemaBrInfo();
        brInfo.brType = BusinessRuleType.BR_METADATA_RULE;
        brInfo.isTransformationApplied = true;
        component.setValueToElement(brInfo);

        brInfo.isTransformationApplied = false;
        brInfo.brType = BusinessRuleType.BR_METADATA_RULE;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.BR_METADATA_RULE);

        brInfo.brType = BusinessRuleType.BR_CUSTOM_SCRIPT;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.BR_CUSTOM_SCRIPT);

        brInfo.brType = BusinessRuleType.BR_TRANSFORMATION;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.BR_TRANSFORMATION);

        brInfo.brType = BusinessRuleType.BR_REGEX_RULE;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.BR_REGEX_RULE);

        brInfo.brType = BusinessRuleType.BR_MANDATORY_FIELDS;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.BR_MANDATORY_FIELDS);

        brInfo.brType = BusinessRuleType.BR_DUPLICATE_RULE;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.BR_DUPLICATE_RULE);

        brInfo.brType = BusinessRuleType.BR_API_RULE;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.BR_API_RULE);

        brInfo.brType = BusinessRuleType.MRO_CLS_MASTER_CHECK;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.MRO_CLS_MASTER_CHECK);

        brInfo.brType = BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI);

        brInfo.brType = BusinessRuleType.MRO_GSN_DESC_MATCH;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.MRO_GSN_DESC_MATCH);

        brInfo.brType = BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP);

        brInfo.brType = null;
        const previousBrType = component.form.controls.rule_type.value;
        component.setValueToElement(brInfo);
        expect(component.form.controls.rule_type.value).toEqual(previousBrType);



    }));

    it('should patchTransformationFormData', () => {

        let transformationSchema = [{ sourceFld: 'mtl_grp', targetFld: 'mtl_grp' }] as TransformationModel[];
        component.patchTransformationFormData(TransformationRuleType.REGEX, null);
        expect(component.transformationData).toBeUndefined();

        component.patchTransformationFormData(TransformationRuleType.REGEX, transformationSchema);
        expect(component.transformationData.sourceFld).toEqual('mtl_grp');

        component.patchTransformationFormData(TransformationRuleType.LOOKUP, []);
        expect(component.transformationLookUpData.length).toEqual(0);

        component.patchTransformationFormData(TransformationRuleType.LOOKUP, transformationSchema);
        expect(component.transformationLookUpData.length).toEqual(1);

        transformationSchema = [{ udrBlockModel: { conditionFieldId: 'bpkretpy520', conditionValueFieldId: null, objectType: '732014592' } }] as TransformationModel[];
        component.patchTransformationFormData(TransformationRuleType.LOOKUP, transformationSchema);
        expect(component.transformationLookUpData.length).toEqual(1);

    });

    it('should getTrRuleType', () => {
        expect(component.getTrRuleType([])).toBeFalsy();
        const transformationSchema = [{ transformationRuleType: TransformationRuleType.LOOKUP }] as TransformationModel[];

        expect(component.getTrRuleType(transformationSchema)).toEqual(TransformationRuleType.LOOKUP);

        transformationSchema[0].transformationRuleType = TransformationRuleType.REGEX;
        expect(component.getTrRuleType(transformationSchema)).toEqual(TransformationRuleType.REGEX);

        transformationSchema[0].transformationRuleType = undefined;
        expect(component.getTrRuleType(transformationSchema)).toEqual('');
    })


    it('should editUdr', () => {
        component.initUDRForm();
        const brInfo = new CoreSchemaBrInfo();
        brInfo.brIdStr = '1701';
        delete brInfo.udrData;
        component.editUdr(brInfo);
        brInfo.udrData = {
            when: [{
                blockType: null,
                childs: [{

                }]
            }]
        } as any;
        component.editUdr(brInfo);
        brInfo.udrData = {
            when: [{
                id: '1', udrid: '545422479309516179', conditionFieldId: 'bpkretpy520', conditionValueFieldId: null, conditionFieldValue: 'Google',
                conditionFieldStartValue: '', conditionFieldEndValue: '', blockType: BlockType.AND,
                conditionOperator: 'EQUAL', blockDesc: 'And',
                objectType: '732014592', sRegex: '232',
                conditionalFieldValueCtrl: null, targetInfo: TragetInfo.VALUE
            }]
        } as UdrModel;

        component.initUDRForm();
        component.editUdr(brInfo);
        expect(component.udrNodeForm.get('frmArray').value.length).toEqual(1);

    });

    it('should add/remove Parent/child Block', () => {
        component.initUDRForm();
        component.addParentBlock();
        expect(component.udrNodeForm.get('frmArray').value.length).toEqual(2);

        component.addChildBlock(0);
        expect(component.getChildAsControl(0).controls.length).toEqual(1);

        component.removeChildNode(0, 0);
        expect(component.getChildAsControl(0).controls.length).toEqual(0);

        component.addChildBlock(0);
        expect(component.getChildAsControl(0, 0).length).toEqual(0);

        component.removeParentNode(0);
        expect(component.udrNodeArray().controls.length).toEqual(1);
    })

    it('should filter fields list', () => {
        component.fieldsList = [{ fieldId: 'region', fieldDescri: 'region' }];
        expect(component.filter('re').length).toEqual(1);
    });

    it('should selectField', () => {
        component.buildCommonDataForm();

        const event = { option: { value: 'region', viewValue: 'region' } };
        component.selectField(event);
        expect(component.selectedFields.length).toEqual(1);

        const el = document.createElement('input');
        el.setAttribute('id', 'fieldsInput');
        fixture.nativeElement.appendChild(el);
        component.selectField(event);
        expect(component.selectedFields.length).toEqual(1);

        event.option.value = '';
        expect(component.selectField(event)).toBeUndefined();

    });

    it('should close', () => {
        spyOn(router, 'navigate');
        component.close();
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { [`${component.activeOutlet}`]: null } }], { queryParamsHandling: 'preserve' });

        component.isOnlyForTrans = true;
        component.close();
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { [`${component.activeOutlet}`]: null } }]);

        component.isDRChildRule = true;
        expect(component.close()).toBeUndefined();
    });

    it('sould createBrObject', () => {
        expect(component.createBrObject({ brId: '1' }).brId).toEqual('1');
        expect(component.createBrObject({ refId: 1, refid: 1 }).refId).toEqual(1);
        expect(component.createBrObject({ standardFunction: 'Test' }).standardFunction).toEqual('Test');
        expect(component.createBrObject({ brWeightage: 'Test' }).brWeightage).toEqual('Test');
        expect(component.createBrObject({ qryScript: 'Test' }).qryScript).toEqual('Test');
        expect(component.createBrObject({ dependantStatus: 'Test' }).dependantStatus).toEqual('Test');
        expect(component.createBrObject({ when: [''] }).udrData.when.length).toEqual(1);
        expect(component.createBrObject({}).brId).toEqual('');
        expect(component.createBrObject({}, null).udrData.when.length).toEqual(0);
        expect(component.createBrObject({ when: [''] }, null).udrData.when.length).toEqual(1);
    });

    it('should mapTransformationData when lookup data', () => {
        const lookupData = [{ fieldId: 'fld', fieldLookupConfig: { lookupColumn: '', lookupColumnResult: '', moduleId: '1005' } }] as LookupFields[];

        spyOn(component, 'mapTransformationData').and.callThrough();
        component.mapTransformationData({ formData: {}, lookupData }, BusinessRuleType.BR_TRANSFORMATION);
        expect(component.mapTransformationData).toHaveBeenCalled();
    });

    it('should mapTransformationData when no lookup data', () => {
        spyOn(component, 'mapTransformationData').and.callThrough();
        component.mapTransformationData({ formData: {} }, BusinessRuleType.BR_TRANSFORMATION);
        expect(component.mapTransformationData).toHaveBeenCalled();
    });

    it('sould createUDRBlockFromLookup', () => {
        const lookupData = { fieldLookupConfig: { moduleId: '1005', lookupColumnResult: 'region', lookupColumn: 'region' } } as LookupFields;
        const result = component.createUDRBlockFromLookup(lookupData);
        expect(result.objectType).toEqual('1005');
    });

    it('should setRegex', () => {

        component.buildCommonDataForm();
        component.setRegex({ value: 'EMAIL' });
        expect(component.form.controls.regex.value).toEqual('^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}');
    });

    it('should setComparisonValue', () => {
        component.initUDRForm();
        spyOn(component, 'setComparisonValue').and.callThrough();
        spyOn(component, 'setComparisonValueForChild').and.callThrough();
        component.addChildBlock(0);
        component.setComparisonValue('Equal', 0);
        component.setComparisonValueForChild('Not Equal', 0, 0);
        expect(component.setComparisonValue).toHaveBeenCalled();
        expect(component.setComparisonValueForChild).toHaveBeenCalled();
    });

    it('should setComparisonValue when value is object', () => {
        component.initUDRForm();
        spyOn(component, 'setComparisonValue').and.callThrough();
        spyOn(component, 'setComparisonValueForChild').and.callThrough();
        component.addChildBlock(0);
        component.setComparisonValue({ start: '0', end: '3' }, 0);
        component.setComparisonValueForChild({ start: '0', end: '3' }, 0, 0);
        expect(component.setComparisonValue).toHaveBeenCalled();
        expect(component.setComparisonValueForChild).toHaveBeenCalled();
    });

    it('should setComparisonValue when value has fieldId', () => {
        component.initUDRForm();
        spyOn(component, 'setComparisonValue').and.callThrough();
        spyOn(component, 'setComparisonValueForChild').and.callThrough();
        component.addChildBlock(0);
        component.setComparisonValue({ start: '0', end: '3', fieldId: 'fld1' } as any, 0);
        component.setComparisonValueForChild({ start: '0', end: '3', fieldId: 'fld1' } as any, 0, 0);
        expect(component.setComparisonValue).toHaveBeenCalled();
        expect(component.setComparisonValueForChild).toHaveBeenCalled();
    });

    it('should call selectedRuleDesc', () => {
        component.buildCommonDataForm();
        component.form.controls.rule_type.setValue('test');
        expect(component.selectedTransformationType).toBeFalsy();
    });

    it('should setRangeValue', () => {
        component.initUDRForm();
        component.setRangeValue(10, 'start', 0);
        expect(component.udrNodeArray().value[0].conditionFieldStartValue).toEqual(10);

        component.setRangeValue(20, 'end', 0);
        expect(component.udrNodeArray().value[0].conditionFieldEndValue).toEqual(20);


        component.addChildBlock(0);
        component.setRangeValueForChild(10, 'start', 0, 0);
        expect(component.getChildAsControl(0).value[0].conditionFieldStartValue).toEqual(10);

        component.setRangeValueForChild(20, 'end', 0, 0);
        expect(component.getChildAsControl(0).value[0].conditionFieldEndValue).toEqual(20);

    });

    it('isDuplicateType', (() => {
        component.buildCommonDataForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.BR_DUPLICATE_RULE);
        expect(component.isDuplicateType).toBeTrue();
    }));

    it('should setTransformationFormData', () => {

        component.buildCommonDataForm();
        let transformationData = { selectedTargetFields: [] } as TransformationFormData;
        component.setTransformationFormData(transformationData);
        expect(component.form.value.sourceFld).toBeFalsy();

        transformationData = { sourceFld: 'region', excludeScript: 'exclude', includeScript: 'include', selectedTargetFields: [] } as TransformationFormData;
        component.setTransformationFormData(transformationData);
        expect(component.form.value.sourceFld).toEqual('region');
    });

    it('should setLookupData', () => {
        const lookupData = [{ fieldId: 'fld' }] as LookupFields[];
        component.setLookupData(lookupData);
        expect(component.lookupData).toEqual(lookupData);
    });

    it('businessRuleTypesFiltered should get businessRuleTypes Filtered', async () => {
        component.businessRuleTypes = [{
            ruleDesc: 'test',
            ruleId: 'test',
            ruleType: BusinessRuleType.BR_CUSTOM_SCRIPT
        }];
        component.searchRuleTypeStr = '';
        expect(component.businessRuleTypesFiltered.length).toEqual(1);
        component.searchRuleTypeStr = 'test';
        expect(component.businessRuleTypesFiltered.length).toEqual(1);
        component.searchRuleTypeStr = 'test1';
        expect(component.businessRuleTypesFiltered.length).toEqual(0);
        component.searchRuleTypeStr = undefined;
        expect(component.businessRuleTypesFiltered.length).toEqual(0);
        component.searchRuleTypeStr = '';
        component.businessRuleTypes = [{
            ruleDesc: 'test',
            ruleId: 'test',
            ruleType: BusinessRuleType.BR_MANDATORY_FIELDS
        }];
        component.isDRChildRule = true;
        schemaServiceSpy.drChildRequest = {
            isTieBreaker: false
        };
        expect(component.businessRuleTypesFiltered.length).toEqual(0);
        schemaServiceSpy.drChildRequest = {
            isTieBreaker: true
        };
        expect(component.businessRuleTypesFiltered.length).toEqual(1);
        component.businessRuleTypes = [{
            ruleDesc: null,
            ruleId: 'test',
            ruleType: BusinessRuleType.BR_MANDATORY_FIELDS
        }];
        component.searchRuleTypeStr = 'MANDATORY';
        expect(component.businessRuleTypesFiltered.length).toEqual(1);
        component.businessRuleTypes = [{
            ruleDesc: null,
            ruleId: 'test',
            ruleType: null
        }];
        expect(component.businessRuleTypesFiltered.length).toEqual(0);
    });

    it('preDefinedRegexFiltered should get regex functions Filtered', async () => {
        component.preDefinedRegex = [{
            FUNC_NAME: 'test',
            FUNC_CODE: 'test',
            FUNC_TYPE: 'test'
        }];
        component.searchRegexFunctionStr = '';
        expect(component.preDefinedRegexFiltered.length).toEqual(1);
        component.searchRegexFunctionStr = 'test';
        expect(component.preDefinedRegexFiltered.length).toEqual(1);
        component.searchRegexFunctionStr = 'test1';
        expect(component.preDefinedRegexFiltered.length).toEqual(0);
        component.searchRegexFunctionStr = 'test';
        component.preDefinedRegex = [{
            FUNC_NAME: null,
            FUNC_CODE: 'test',
            FUNC_TYPE: 'test'
        }];
        expect(component.preDefinedRegexFiltered.length).toEqual(1);
        component.searchRegexFunctionStr = undefined;
        expect(component.preDefinedRegexFiltered.length).toEqual(0);
        component.preDefinedRegex = [{
            FUNC_NAME: null,
            FUNC_CODE: 'test',
            FUNC_TYPE: null
        }];
        expect(component.preDefinedRegexFiltered.length).toEqual(0);
    });

    it('should displayFn', () => {
        expect(component.displayFn(null)).toBeFalsy();
        expect(component.displayFn({ fieldDescri: 'region' })).toEqual('region');
    });

    it('isDRTieBreaker should display correct value', () => {
        schemaServiceSpy.drChildRequest = {
            isTieBreaker: true
        };
        expect(component.isDRTieBreaker).toBeTruthy();
        delete schemaServiceSpy.drChildRequest.isTieBreaker;
        expect(component.isDRTieBreaker).toBeFalsy();
        delete schemaServiceSpy.drChildRequest;
        expect(component.isDRTieBreaker).toBeFalsy();
    });

    it('should setDuplicateFormRef', () => {
        const form = new FormGroup({});
        component.setDuplicateFormRef(form);
        expect(component.duplicateFormRef).toEqual(form);
    });

    it('should saveDuplicateRule', () => {
        component.buildCommonDataForm();
        spyOn(component, 'saveDuplicateRule').and.callThrough();
        spyOn(schemaServiceSpy, 'saveUpdateDuplicateRule').and.returnValue(of('success'));
        component.duplicateFormRef = new FormGroup({
            addFields: new FormArray([]),
            masterRules: new FormArray([
                new FormGroup({
                    coreSchemBrInfo: new FormGroup({
                        isConfigured: new FormControl(true, [])
                    })
                })
            ])
        });
        const formArray = component.duplicateFormRef.get('addFields') as FormArray;
        formArray.push(new FormGroup({ exclusion: new FormControl('', Validators.required) }));
        component.saveDuplicateRule();

        formArray.at(0).get('exclusion').setValue(1);
        component.saveDuplicateRule();
        expect(mockMatSnackBar.open).toHaveBeenCalled();
        expect(component.saveDuplicateRule).toHaveBeenCalled();
    });

    it('should duplicateFormRef valid', () => {
        component.buildCommonDataForm();
        spyOn(component, 'saveDuplicateRule').and.callThrough();
        spyOn(schemaServiceSpy, 'saveUpdateDuplicateRule').and.returnValue(of('success'));
        component.duplicateFormRef = new FormGroup({
            addFields: new FormArray([]),
            masterRules: new FormArray([
                new FormGroup({
                    coreSchemBrInfo: new FormGroup({
                        isConfigured: new FormControl(true, [])
                    })
                })
            ])
        });
        const formArray = component.duplicateFormRef.get('addFields') as FormArray;
        formArray.push(new FormGroup({ exclusion: new FormControl('', Validators.required) }));
        component.saveDuplicateRule();

        formArray.at(0).get('exclusion').setValue(1);
        component.saveDuplicateRule();
        expect(mockMatSnackBar.open).toHaveBeenCalled();
        expect(component.saveDuplicateRule).toHaveBeenCalled();
    });

    it('should blockCtrl()', () => {

        const udr = { id: '1', udrid: '545422479309516179', conditionFieldId: 'bpkretpy520', conditionValueFieldId: null, conditionFieldValue: 'Google', conditionFieldStartValue: '', conditionFieldEndValue: '', blockType: BlockType.AND, conditionOperator: 'EQUAL', blockDesc: 'And', objectType: '732014592' } as UDRBlocksModel;
        const result = component.blockCtrl(udr);
        component.blockCtrl(udr);
        expect(result.get('conditionFieldValue').value).toEqual('Google');

    });

    it('removeTargetField()', () => {
        component.selectedTargetFields = [{ fieldId: 'fld1' }];
        spyOn(component, 'removeTargetField').and.callThrough();
        component.removeTargetField(0);
        expect(component.removeTargetField).toHaveBeenCalled();
    });

    it('rangeSliderLabelFormat should range slider label format', () => {
        expect(component.rangeSliderLabelFormat(90)).toEqual(`90%`);
    });

    it('isTransEnabled, check whether trans aplicabe for this rule or not', (() => {
        component.buildCommonDataForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.BR_MANDATORY_FIELDS);
        expect(component.isTransEnabled).toBeTrue();
        component.form.controls.rule_type.setValue('');
        component.coreSchemaBrInfo = {
            brType: BusinessRuleType.BR_REGEX_RULE
        } as any;
        expect(component.isTransEnabled).toBeTrue();
        component.coreSchemaBrInfo = {
            brType: ''
        } as any;
        expect(component.isTransEnabled).toBeFalse();
    }));

    it('openTransRuleLib(), open the trans lib .. ', (() => {
        spyOn(router, 'navigate');
        component.openTransRuleLib();
        expect(router.navigate).toHaveBeenCalledWith(['', {
            outlets: {
                sb: `sb/schema/business-rule/${component.moduleId}/${component.schemaId}/${component.brId}`,
                outer: `outer/schema/businessrule-library/${component.moduleId}/${component.schemaId}/outer`
            }
        }], { queryParams: { t: true, s: component.transTabIndex === 0 ? 'success' : 'error' } });

        component.transTabIndex = 1;
        component.openTransRuleLib();
        expect(router.navigate).toHaveBeenCalledWith(['', {
            outlets: {
                sb: `sb/schema/business-rule/${component.moduleId}/${component.schemaId}/${component.brId}`,
                outer: `outer/schema/businessrule-library/${component.moduleId}/${component.schemaId}/outer`
            }
        }], { queryParams: { t: true, s: 'error' } });
    }));

    it('getMappedTransformationRules(), get mapped trans rule inside the main rule', (() => {
        spyOn(schemaServiceSpy, 'getMappedTransformationRules').withArgs(component.brId, component.schemaId, 0, 100, '').and.returnValue(of());
        component.getMappedTransformationRules();
        expect(schemaServiceSpy.getMappedTransformationRules).toHaveBeenCalledWith(component.brId, component.schemaId, 0, 100, '');
    }));

    it('updateTransStatus(), update the transformation added rule status', (() => {
        // mock data
        component.attachedTransRules = {
            error: [{ isConfigured: false, isEnabled: true, ruleInfo: { brIdStr: '775755' } as CoreSchemaBrInfo }], success: [
                { isConfigured: false, isEnabled: false, ruleInfo: { brIdStr: '9866757' } as CoreSchemaBrInfo }
            ]
        };

        component.updateTransStatus({ isConfigured: false, isEnabled: false, ruleInfo: { brIdStr: '9866757' } as CoreSchemaBrInfo } as TransformationMappingTabResponse, 'success', true);

        expect(component.attachedTransRules.success[0].isEnabled).toBeTrue();

        component.updateTransStatus({ isConfigured: false, isEnabled: true, ruleInfo: { brIdStr: '775755' } as CoreSchemaBrInfo } as TransformationMappingTabResponse, 'error', false);

        expect(component.attachedTransRules.error[0].isEnabled).toBeFalse();


    }));

    it('addTransRule(), add the transformation rule ... ', async(() => {
        // mock data
        component.attachedTransRules = {
            error: [{ isConfigured: false, isEnabled: true, ruleInfo: { brIdStr: '775755' } as CoreSchemaBrInfo }], success: [
                { isConfigured: false, isEnabled: false, ruleInfo: { brIdStr: '9866757' } as CoreSchemaBrInfo }
            ]
        };


        spyOn(transientService, 'open').and.callFake(() => of());

        component.addTransRule({ brIdStr: '87676786878' } as CoreSchemaBrInfo, 'success');
        expect(component.attachedTransRules.success.length).toEqual(2);

        component.addTransRule({ brIdStr: '9866757' } as CoreSchemaBrInfo, 'success');
        expect(transientService.open).toHaveBeenCalled();

        component.addTransRule({ brIdStr: '35657637683' } as CoreSchemaBrInfo, 'error');
        expect(component.attachedTransRules.error.length).toEqual(2);

        component.addTransRule({ brIdStr: '775755' } as CoreSchemaBrInfo, 'error');
        expect(transientService.open).toHaveBeenCalled();
    }));

    it('searchTransRules(), search transformation rules ... ', async(() => {
        spyOn(component, 'delayedCallWithTransLib');
        component.searchTransRules('');
        expect(component.delayedCallWithTransLib).toHaveBeenCalledWith('');
    }));

    it('udrFieldSelectionChange()', async(() => {
        spyOn(component, 'udrFieldSelectionChange');
        component.udrFieldSelectionChange([{ fieldDescri: '', fieldId: '' }] as Metadata[], 0, 1, 2);
        expect(component.udrFieldSelectionChange).toHaveBeenCalled();
    }));

    it('editTransRule(), edit the business rule and nav to the edit mode', async(() => {
        spyOn(router, 'navigate');
        component.editTransRule({ ruleInfo: { brIdStr: '8867678658' } as CoreSchemaBrInfo } as TransformationMappingTabResponse, 'success');
        expect(router.navigate).toHaveBeenCalledWith(['', {
            outlets: {
                sb3: `sb3/schema/business-rule/${component.moduleId}/${component.schemaId}/8867678658/sb3`
            }
        }], { queryParams: { r: 'BR_TRANSFORMATION' } });
    }));

    it('openBusinessRuleSideSheet()', async(() => {
        spyOn(router, 'navigate');
        component.openBusinessRuleSideSheet();

        expect(router.navigate).toHaveBeenCalled();
    }));

    it('getMappedTransformationRules()', async(() => {
        const res: TransformationMappingResponse = {
            success: [],
            error: []
        };
        spyOn(schemaServiceSpy, 'getMappedTransformationRules').and.returnValue(of(res));

        component.getMappedTransformationRules();
        expect(component.attachedTransRules.success.length).toEqual(0);
        expect(schemaServiceSpy.getMappedTransformationRules).toHaveBeenCalled();
    }));

    it('displayCategoryFn()', async(() => {
        component.categoryList = [
            {
                categoryId: '123',
                categoryDesc: 'test'
            }
        ];
        const res = component.displayCategoryFn('123');
        expect(res).toEqual('test');
        expect(component.displayCategoryFn('')).toEqual('');
        component.categoryList = [];
        expect(component.displayCategoryFn('')).toEqual('');
    }));

    it('displayRuleFn()', async(() => {
        component.businessRuleTypes = [
            {
                ruleType: BusinessRuleType.BR_MANDATORY_FIELDS,
                ruleId: '123',
                ruleDesc: 'test'
            }
        ];
        const res = component.displayRuleFn(BusinessRuleType.BR_MANDATORY_FIELDS);
        expect(res).toEqual('test');
        expect(component.displayRuleFn('')).toEqual('');
        component.businessRuleTypes = [];
        expect(component.displayRuleFn('')).toEqual('');
    }));

    it('displayRegexFn()', async(() => {
        component.preDefinedRegex = [
            {
                FUNC_CODE: '123',
                FUNC_NAME: 'test',
                FUNC_TYPE: 'typeA'
            }
        ];

        const res = component.displayRegexFn('typeA');
        expect(res).toEqual('test');
        expect(component.displayRegexFn('')).toEqual('');
        component.preDefinedRegex = [];
        expect(component.displayRegexFn('')).toEqual('');
    }));

    it('displaySourceFieldFn()', async(() => {
        component.buildCommonDataForm();
        component.sourceFieldsObject = {
            list: [
                {
                    fieldId: '123',
                    fieldDescri: 'test'
                }
            ],
            valueKey: 'fieldId',
            labelKey: 'fieldDescri'
        };
        const res = component.displaySourceFieldFn('123');
        expect(res).toEqual('test');
        expect(component.displaySourceFieldFn('')).toEqual('');
        component.sourceFieldsObject.list = [];
        expect(component.displaySourceFieldFn('')).toBeFalsy();
    }));

    it(`addTransRules(), add the transformation rule into schema list ()`, async(() => {
        // mock data
        const mockData: CoreSchemaBrInfo[] = [{ brIdStr: '677575757', brInfo: 'Test br  1' } as CoreSchemaBrInfo, { brIdStr: '878575767', brInfo: 'Test br  2' } as CoreSchemaBrInfo];
        component.transTabIndex = 0;
        component.attachedTransRules = { success: [{ ruleInfo: null } as any], error: [{ ruleInfo: null } as any] };

        component.addTransRules(mockData);
        expect(component.attachedTransRules.success.length).toEqual(3);

        mockData[0].brIdStr = '86876875757';
        component.addTransRules(mockData);
        expect(component.attachedTransRules.success.length).toEqual(3);


        component.transTabIndex = 1;
        component.addTransRules(mockData);
        expect(component.attachedTransRules.error.length).toEqual(3);

        mockData[0].brIdStr = '86876875757';
        component.addTransRules(mockData);
        expect(component.attachedTransRules.error.length).toEqual(3);

    }));

    it('getApisRule(), get the all apis .. ', async(() => {

        // mock data
        const apisRules: ApiRulesInfo[] = [{
            description: 'Api 1', sno: '8767757'
        }];

        component.buildCommonDataForm();

        spyOn(schemaServiceSpy, 'getApisRule').withArgs(component.moduleId, '', 0, 10, '76775').and.returnValue(of(apisRules));

        component.getApisRule('', '76775');

        expect(schemaServiceSpy.getApisRule).toHaveBeenCalledWith(component.moduleId, '', 0, 10, '76775');
        expect(component.apiRules.length).toEqual(1);

    }));

    it('displayApisRuleFn(), display api desc for api rules', async(() => {
        // mock data
        const apisRules: ApiRulesInfo[] = [{
            description: 'Api 1', sno: '8767757'
        }];
        component.apiRules = apisRules;
        expect(component.displayApisRuleFn('8767757')).toEqual('Api 1');
        expect(component.displayApisRuleFn('87668778')).toBeUndefined();

    }));

    it('selectSingle(), select single test', async(() => {
        component.buildCommonDataForm();

        // mock data
        const preDefinedRegex: Regex[] = [{ FUNC_CODE: 'www', FUNC_NAME: 'Test', FUNC_TYPE: 'h' }];
        component.preDefinedRegex = preDefinedRegex;

        component.selectSingle(component.form, 'standard_function', { option: { value: 'h' } });
        expect(component.form.controls.regex.value).toEqual('www');
        component.selectSingle(component.form, 'rule_type', { option: { value: 'h' } });


    }));

    it('displayOperatorFn(), should format the output', async(() => {
        expect(component.displayOperatorFn('EQUALS')).toEqual('EQUAL');
        expect(component.displayOperatorFn('start_with')).toEqual('start with');
        expect(component.displayOperatorFn(null)).toEqual('');
        expect(component.displayOperatorFn('LENGTH_GREATER_THEN')).toEqual('LENGTH GREATER THAN');
        expect(component.displayOperatorFn('LENGTH_LESS_THEN')).toEqual('LENGTH LESS THAN');
    }));

    it('udrOperatorSelected(), should set form value', async(() => {
        const udrControl = new FormControl('', Validators.required);
        component.udrOperatorSelected(udrControl, { option: { value: 'test' } });
        expect(udrControl.value).toEqual('test');
    }));

    it('isFormLoading should have updated flag', async(() => {
        component.moduleId = 'Test';
        component.metataData = null;
        expect(component.isFormLoading).toEqual(true);
        component.moduleId = null;
        component.metataData = null;
        expect(component.isFormLoading).toEqual(false);
        component.moduleId = null;
        component.metataData = {} as any;
        expect(component.isFormLoading).toEqual(false);
    }));

    it('filterOperator(), should filter the operator values', async(() => {
        component.operators = [{
            desc: 'group1',
            childs: ['test1', 'test2']
        }, {
            desc: 'group1',
            childs: ['test3', 'test4']
        }];
        component.filterOperator('');
        expect(component.operatorsFiltered.length).toEqual(2);
        component.filterOperator('test3');
        expect(component.operatorsFiltered.length).toEqual(1);
    }));

    it('updateBlocksType(), update parents blocktype', async(() => {
        component.initUDRForm();
        component.addParentBlock();
        const event = {
            value: 'AND'
        }
        component.updateBlocksType(event);
        expect(component.udrNodeArray().value[0].blockType).toEqual('AND');
    }));

    it('updateBlocksDesc(), update childs blockdesc', async(() => {
        component.initUDRForm();
        component.addChildBlock(0);
        const event = {
            value: 'And'
        }
        component.updateBlocksDesc(event, 0);
        expect(component.udrNodeArray().value[0].childs[0].blockDesc).toEqual('And');
    }));

    it('fieldsTooltip(), should display correct tooltip', (() => {
        component.buildCommonDataForm();
        component.form.patchValue({ rule_type: BusinessRuleType.BR_MANDATORY_FIELDS });
        expect(component.fieldsTooltip.includes('missing')).toBeTrue();
        component.form.patchValue({ rule_type: BusinessRuleType.MRO_CLS_MASTER_CHECK });
        expect(component.fieldsTooltip.includes('classification')).toBeTrue();
        component.form.patchValue({ rule_type: BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP });
        expect(component.fieldsTooltip).toContain('manufacturer');
        component.form.patchValue({ rule_type: '' });
        expect(component.fieldsTooltip).toEqual('');
    }));

    it('getDRChildRuleInfo(), should initialize duplicate date', (() => {
        schemaServiceSpy.drChildRequest = undefined;
        expect(component.getDRChildRuleInfo()).toBeUndefined();

        schemaServiceSpy.drChildRequest = {}
        expect(component.getDRChildRuleInfo()).toBeUndefined();

        schemaServiceSpy.drChildRequest = {
            coreSchemBrInfo: {
                brIdStr: '1',
                isEdited: false
            }
        }
        spyOn(component, 'getBusinessRuleInfo');
        spyOn(component, 'setValueToElement');
        spyOn(component, 'getFieldsByModuleId');
        spyOn(component, 'editUdr');
        spyOn(component, 'getApisRule');
        component.getDRChildRuleInfo();
        expect(component.getBusinessRuleInfo).toHaveBeenCalled();
        schemaServiceSpy.drChildRequest = {
            coreSchemBrInfo: {
                brIdStr: '1',
                isEdited: true,
                brType: BusinessRuleType.BR_CUSTOM_SCRIPT
            }
        };
        component.getDRChildRuleInfo();
        expect(component.editUdr).toHaveBeenCalled();
        schemaServiceSpy.drChildRequest = {
            coreSchemBrInfo: {
                brIdStr: '1',
                isEdited: true,
                brType: BusinessRuleType.BR_API_RULE
            }
        };
        component.getDRChildRuleInfo();
        expect(component.getApisRule).toHaveBeenCalled();
    }));
});