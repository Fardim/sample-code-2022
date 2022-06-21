import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { NewBusinessRulesComponent } from './new-business-rules.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { CategoryInfo, LookupFields, MetadataModeleResponse, TransformationFormData } from '@models/schema/schemadetailstable';
import { of } from 'rxjs';
import { BusinessRuleType, CoreSchemaBrInfo, PRE_DEFINED_REGEX, TransformationModel, UDRObject } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedModule } from '@modules/shared/shared.module';
import { BlockType } from '@modules/admin/_components/module/business-rules/user-defined-rule/udr-cdktree.service';
import { BusinessRules } from '@modules/admin/_components/module/schema/diw-create-businessrule/diw-create-businessrule.component';
import { MdoUiLibraryModule } from 'mdo-ui-library';
import { Regex } from '@modules/admin/_components/module/business-rules/regex-rule/regex-rule.component';

describe('NewBusinessRulesComponent', () => {
    let component: NewBusinessRulesComponent;
    let fixture: ComponentFixture<NewBusinessRulesComponent>;
    let schemaDetailsServicespy: SchemaDetailsService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NewBusinessRulesComponent],
            imports: [AppMaterialModuleForSpec, SharedModule, MdoUiLibraryModule],
            providers: [
                HttpClientTestingModule,
                SchemaDetailsService,
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: [] },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewBusinessRulesComponent);
        component = fixture.componentInstance;
        component.data.fields = [];
        schemaDetailsServicespy = fixture.debugElement.injector.get(SchemaDetailsService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('formatLabel(), return value in string', async(() => {
        const value = 'Test';
        expect(component.formatLabel(value)).toEqual('Test');
    }));

    it('displayFn(), has return field description', async(() => {
        const value = { fieldDescri: 'NDC TYPE', fieldId: 'NDC_TYPE' };
        expect(component.displayFn(value)).toEqual('NDC TYPE');
        const value1 = null;
        expect(component.displayFn(value1)).toEqual('');
    }));

    it('createDSByFields(), create fields on the basis of excel file', async(() => {
        component.data = { fields: [{ fieldId: 'MAL_TL', fieldDescri: 'MATERIIAL Description' }] };
        component.createDSByFields();
        expect(component.fieldsList.length).toEqual(1);
    }));

    it('getFieldsByModuleId(), get the fields on basis of module', (() => {
        spyOn(component, 'patchFieldvalues');
        component.data = {
            moduleId: '1005',
        };
        const metadataModeleResponse = { headers: [{ fieldId: 'MATL', fieldDescri: 'material location' }] } as MetadataModeleResponse;
        spyOn(schemaDetailsServicespy, 'getMetadataFields').withArgs(component.data.moduleId).and.returnValue(of(metadataModeleResponse))
        component.getFieldsByModuleId();
        expect(schemaDetailsServicespy.getMetadataFields).toHaveBeenCalledWith(component.data.moduleId);

        component.data = {
            moduleId: '1005',
            createRuleFormValues: {
                fields: 'email'
            }
        };
        component.getFieldsByModuleId();
        expect(schemaDetailsServicespy.getMetadataFields).toHaveBeenCalledWith(component.data.moduleId);
    }));

    it('remove(), remove the value', (() => {
        component.selectedFields = ['NDC_TYPE'];
        component.remove('NDC_TYPE', 0);
        expect(component.selectedFields.length).toEqual(0);
    }));

    it('addBlock(), should add the values', async(() => {
        const parent = {
            id: 123,
            childs: []
        }
        component.udrBlocks = [{ id: '76675675',udrid: '', objectType: '', conditionValueFieldId: '', sRegex: '',blockDesc:BlockType.AND, blockType: BlockType.AND, conditionFieldId: 'NDC_TYPE', conditionOperator: 'EQUAL', conditionFieldValue: '78', conditionFieldStartValue: '', conditionFieldEndValue: '', childs: [] },
        { id: '76675685', sRegex: '', udrid: '', conditionFieldValue: '', objectType: '', blockDesc:BlockType.AND, blockType: BlockType.AND, conditionFieldId: 'ND_TYPE', conditionOperator: 'EQUAL', conditionValueFieldId: '78', conditionFieldStartValue: '', conditionFieldEndValue: '', childs: [] }]
        component.addBlock(true, parent, 2);
        expect(component.udrBlocks.length).toEqual(2);

        component.addBlock(false, parent, 2);
        expect(component.udrBlocks.length).toEqual(3);

        const nestedParent = {
            id: '1701',
            childs: [
                {id:'1702', childs:[]}
            ]
        }
        component.addBlock(true, nestedParent.childs[0],2, 0);
        expect(nestedParent.childs[0].childs.length).toEqual(1);

    }));

    it('getCategories(), should call getAllCategoryInfo', () => {
        spyOn(schemaDetailsServicespy, 'getAllCategoryInfo').and.callFake(() => of(null));
        component.getCategories();
        expect(schemaDetailsServicespy.getAllCategoryInfo).toHaveBeenCalled();
    });

    it('createDSByFields(), should add fields to target and source fields', () => {
        component.data.fields = [
            {
                fieldDescri: 'test',
                fieldId: '123'
            }
        ];
        component.createDSByFields();
        expect(component.targetFieldsObject.list.length).toEqual(1);
        expect(component.sourceFieldsObject.list.length).toEqual(1);
    });

    it('isRegexType, sould return true if selected rule is regex type', (() => {
        component.initializeForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.BR_REGEX_RULE);
        expect(component.isRegexType).toBeTrue();
    }));

    it('isTransformationRule, sould return true if selected rule is transformation type', (() => {
        component.initializeForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.BR_TRANSFORMATION);
        expect(component.isTransformationRule).toBeTrue();
    }));

    it('isUDR, sould return true if selected rule is custom script type', (() => {
        component.initializeForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.BR_CUSTOM_SCRIPT);
        expect(component.isUDR).toBeTrue();
    }));

    it('possibleOperators(), sould return array of all possible operators', (() => {
        const operators = component.possibleOperators();
        expect(operators.length).toEqual(3);
    }));

    it('isDuplicateType, sould return true if selected rule is duplicate rule type', (() => {
        component.initializeForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.BR_DUPLICATE_RULE);
        expect(component.isDuplicateType).toBeTrue();
    }));

    it('should set duplicacy rule form reference', () => {
        const form = new FormGroup({});
        component.setDuplicateFormRef(form);
        expect(component.duplicateFormRef).toEqual(form);
    });

    it('should patch duplicacy rule data', () => {
        const data = null;
        component.duplicacyRuleData = {} as CoreSchemaBrInfo;
        component.patchDuplicacyData(data);
        expect(component.duplicacyRuleData).toEqual({} as CoreSchemaBrInfo)


        const duplicacyField = [{
            fieldId: 'fid',
            criteria: 'Exact_Match',
            exclusion: '0',
            inverse: '0',
            weightage: '0',
            ival: 'customer',
            sval: 'vendor:supplier'
        }];

        const duplicacyMaster = [{
            ruleType: 'OLDEST',
            fieldId: 'USERMODIFIED',
            RuleId: 'OLDEST1',
            sno: ''
        }];

        const br = new CoreSchemaBrInfo();
        br.duplicacyField = duplicacyField;
        br.duplicacyMaster = duplicacyMaster;

        component.patchDuplicacyData(br);
        expect(component.duplicacyRuleData).toEqual(br);

    });

    it(`To get FormControl from fromGroup `, async(() => {
        component.initializeForm()
        const field = component.formField('rule_name');
        expect(field).toBeDefined();
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
    }));

    it('getConditions(), should return conditions accordingly', async () => {
        const res = component.getConditions();
        expect(res.length).toEqual(2)
    });

    it('setLookupData(), should set lookup rule', async () => {
        const lookupData = [
            {
                fieldId: 'L2'
            }
        ] as LookupFields[];

        component.setLookupData(lookupData);
        expect(component.lookupData).toEqual(lookupData)
    });

    it('getBlockType(), should return block type', async () => {
        const type = 'When';
        const res = component.getBlockType(type);

        expect(res).toEqual(BlockType.AND);


        const type2 = 'And';
        const res2 = component.getBlockType(type2);

        expect(res2).toEqual('AND')
    });

    it('getTrRuleType(), should return transformation rule types information', async () => {
        const transformationSchema = [
            {
                brId: '1234',
                transformationRuleType: component.transformationType.LOOKUP
            }
        ] as TransformationModel[];

        let res = component.getTrRuleType(transformationSchema);
        expect(res).toEqual(component.transformationType.LOOKUP);

        transformationSchema[0].transformationRuleType = component.transformationType.REGEX;
        res = component.getTrRuleType(transformationSchema);

        expect(res).toEqual(component.transformationType.REGEX);
    });

    it('setRangeValue(), should set range value', async () => {
        const parentBlockIndex = 0;
        let rangeText = 'start';
        const value = '21';
        component.udrBlocks = [
            {
                conditionFieldStartValue: '12',
                conditionFieldEndValue: '24'
            }
        ] as any[];

        component.setRangeValue(value, rangeText, parentBlockIndex);
        expect(component.udrBlocks[parentBlockIndex].conditionFieldStartValue).toEqual(value);

        rangeText = 'end';
        component.setRangeValue(value, rangeText, parentBlockIndex);
        expect(component.udrBlocks[parentBlockIndex].conditionFieldEndValue).toEqual(value);
    });

    it('deleteParentBlock(), should delete parent block of user defined', async () => {
        component.udrBlocks = [
            {
                id: '1'
            }
        ] as any[];

        component.deleteParentBlock(0);
        expect(component.udrBlocks.length).toEqual(0)
    })

    it('setRangeValue(), should set range value', async () => {
        let rangeText = 'start';
        const value = '21';
        const childObject = {
            rangeEndValue: '10',
            rangeStartValue: '10'
        } as UDRObject;

        component.setRangeValueForChild(value, rangeText, childObject);
        expect(component.setRangeValueForChild).toBeTruthy();

        rangeText = 'end';
        component.setRangeValueForChild(value, rangeText, childObject);
        expect(component.setRangeValueForChild).toBeTruthy();
    });

    it('setTransformFormData(), should set data to transformation rule while editing transformation rule', async () => {
        const transformationData = {
            sourceFld: 'material',
            excludeScript: 'ashish kumar goyal',
            includeScript: 'ashish goyal',
            selectedTargetFields: ['datascope v1', 'mobile number']
        } as TransformationFormData;
        component.form = new FormGroup({
            sourceFld: new FormControl(''),
            excludeScript: new FormControl(''),
            includeScript: new FormControl(''),
            targetFld: new FormControl('')
        });

        component.setTransformationFormData(transformationData);
        expect(component.form.controls.sourceFld.value).toEqual('material');

        transformationData.sourceFld = '';
        transformationData.excludeScript = '';
        transformationData.includeScript = '';

        component.setTransformationFormData(transformationData);
        expect(component.setTransformationFormData).toBeTruthy();
    });

    it('deleteFromChildArray(), should delete from child array', async () => {
        const parentBlockIndex = 0;
        const childIndex = 0;
        const child = {
            id: '034349'
        };

        component.udrBlocks = [
            {
                childs: [
                    {
                        id: '13435A'
                    }
                ]
            }
        ] as any[];
        component.deleteFromChildArray(parentBlockIndex, childIndex, child);

        component.udrBlocks = [
            {
                childs: [
                    {
                        id: '13435A'
                    }
                ]
            }
        ] as any[];
        component.deleteFromChildArray(parentBlockIndex, childIndex, child);
        expect(component.udrBlocks[0].childs.length).toEqual(0);
    });

    it('setParentBlockTypeText(), should set the type of parent block', async () => {
        const event = {
            value: 'AshishK'
        };
        const i = 0;
        component.udrBlocks = [
            {
                blockType: 'AshishKumarGoyal'
            }
        ] as any[];

        component.setParentBlockTypeText(event, i);
        expect(component.udrBlocks[i].blockType).toEqual(event.value);
    });

    it('setInitialCondition(), should set the type of parent block', async () => {
        const event = {
            value: 'AshishK'
        };
        const i = 0;
        component.udrBlocks = [
            {
                blockType: 'AshishKumarGoyal'
            }
        ] as any[];

        component.setInitialCondition(event, i);
        expect(component.udrBlocks[i].blockType).toEqual(event.value);
    });

    it('setComparisonValue(), should set comparision value for user defined business rule', async () => {
        const value = 'AshishK'

        const index = 0;
        component.udrBlocks = [
            {
                conditionFieldValue: 'AshishKumarGoyal'
            }
        ] as any[];

        component.setComparisonValue(value, index);
        expect(component.udrBlocks[index].conditionFieldValue).toEqual(value);
    });

    it('setComparisonValueForChild(), should set the comparision value for child block of user defined', async () => {
        const value = 'AshishK'

        // const index = 0;
        const child = {
            comparisonValue: 'AshishKumarGoyal'
        }


        component.setComparisonValueForChild(value, child);
        expect(component.setComparisonValueForChild).toBeTruthy();
    });

    it('getFormValue(), should set value into the form field', async()=>{
        const value = 'Ashish Goyal Kumar';
        const field = 'sourceFld';

        component.form = new FormGroup({
            sourceFld: new FormControl(''),
        });
        component.getFormValue(value, field);
        expect(component.form.controls.sourceFld.value).toEqual(value);
    });

    it('setRegex(), should set regex into form regex field', async()=>{
        component.preDefinedRegex = PRE_DEFINED_REGEX;
        const event = {
            value: 'EMAIL'
        };
        component.form = new FormGroup({
            regex: new FormControl(''),
        });
        component.setRegex(event);

        expect(component.form.controls.regex.value).toEqual('^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}')
    });

    it('patchFieldValues(), should set field values', async() => {
        let fields = 'email,address';
        component.fieldsList = [{
            fieldId: 'email'
        }];

        component.patchFieldvalues(fields);
        expect(component.selectedFields.length).toEqual(1);

        component.selectedFields = [];
        fields = '';
        component.patchFieldvalues(fields);
        expect(component.selectedFields.length).toEqual(0)
    });

    it('initiateAutocomplete(), should initiate autocomplete', async()=>{
        component.form = new FormGroup({
            fields: new FormControl(''),
            target_field: new FormControl('')
        });
        component.fieldsList = [
            {
                fieldDescri: 'email'
            }
        ]

        component.initiateAutocomplete();
        component.form.controls.fields.setValue('email');

        component.filteredModules.subscribe(res => {
            expect(res).toEqual(component.fieldsList);
        })
    });

    it('patchTransformationFormData(), should patch transformation rule data', fakeAsync(() => {
        const transformationSchema = [
            {
                brId: '1234',
                transformationRuleType: component.transformationType.LOOKUP,
                sourceFld: 'ashish',
                udrBlockModel: {
                    conditionFieldId: 'ashish',
                    conditionValueFieldId: '123',
                    objectType: 'MatGrp'
                },
                targetFld: 'ashishkumar'
            }
        ] as TransformationModel[];
        component.form = new FormGroup({
            transformationRuleType: new FormControl('')
        })
        spyOn(component, 'getTrRuleType').and.returnValue(((component.transformationType.LOOKUP)));

        component.patchTransformationFormData(transformationSchema);

        expect(component.getTrRuleType).toHaveBeenCalled();
        expect(component.form.controls.transformationRuleType.value).toEqual(component.transformationType.LOOKUP);

        transformationSchema.length = 0;
        component.form = new FormGroup({
            transformationRuleType: new FormControl('')
        })
        component.patchTransformationFormData(transformationSchema);

        expect(component.getTrRuleType).toHaveBeenCalled();
    }));

    it('patchTransformationFormData(), should patch transformation rule data', async() => {
        const transformationSchema = [
            {
                brId: '1234',
                transformationRuleType: component.transformationType.REGEX,
                sourceFld: 'ashish',
                udrBlockModel: {
                    conditionFieldId: 'ashish',
                    conditionValueFieldId: '123',
                    objectType: 'MatGrp'
                },
                targetFld: 'ashishkumar'
            }
        ] as TransformationModel[];
        component.form = new FormGroup({
            transformationRuleType: new FormControl('')
        })
        spyOn(component, 'getTrRuleType').and.returnValue(((component.transformationType.REGEX)));

        component.patchTransformationFormData(transformationSchema);

        expect(component.getTrRuleType).toHaveBeenCalled();
        expect(component.form.controls.transformationRuleType.value).toEqual(component.transformationType.REGEX);

        transformationSchema.length = 0;
        component.form = new FormGroup({
            transformationRuleType: new FormControl('')
        })
        component.patchTransformationFormData(transformationSchema);

        expect(component.getTrRuleType).toHaveBeenCalled();
    });

    it('ngOnInit(), should call oninit after component setup', async()=>{
        spyOn(component, 'getFieldsByModuleId');
        spyOn(component, 'patchSelectedFields');
        spyOn(component, 'patchTransformationFormData');
        spyOn(component, 'patchDuplicacyData');
        spyOn(component, 'possibleOperators');
        spyOn(component, 'getCategories');

        component.data = {
            maxWeightageLimit: 90,
            createRuleFormValues: {
                rule_type: 'metadata rule',
                rule_name: 'businessrule',
                error_message: 'error_not',
                standard_function: 'sdfgt34@#$%^',
                regex: 'hkjdfh',
                fields: 'email',
                apiKey: 'ajksdjdjjdnfhnw3434',
                udrTreeData: {
                    blocks: [{
                        id: 1,
                        blockDesc: 'blockoe',
                        conditionFieldId: 12334,
                        conditionOperator: 'AND',
                        conditionFieldValue: 'AshishMaterialGrp',
                        rangeStartValue: 12,
                        rangeEndValue: 98,
                        children: ''
                    }],
                    udrHierarchies: [
                        {
                            parentId: '',
                            blockRefId: 1,
                            leftIndex: 1
                        }
                    ]
                },
                weightage: 90,
                categoryId: '13133',
                transformationSchema: '',
                duplicacyRuleData: ''
            },
            // moduleId: '1334',
            tempId: '12314'
        }

        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();

        component.data = {
            maxWeightageLimit: 90,
            createRuleFormValues: {
                rule_type: 'metadata rule',
                rule_name: 'businessrule',
                error_message: 'error_not',
                standard_function: 'sdfgt34@#$%^',
                regex: 'hkjdfh',
                fields: 'email',
                apiKey: 'ajksdjdjjdnfhnw3434',
                udrTreeData: {
                    blocks: [{
                        id: 1,
                        blockDesc: 'blockoe',
                        conditionFieldId: 12334,
                        conditionOperator: 'AND',
                        conditionFieldValue: 'AshishMaterialGrp',
                        rangeStartValue: 12,
                        rangeEndValue: 98,
                        children: ''
                    }],
                    udrHierarchies: [
                        {
                            parentId: '',
                            blockRefId: 1,
                            leftIndex: 1
                        }
                    ]
                },
                weightage: 90,
                categoryId: '13133',
                transformationSchema: '',
                duplicacyRuleData: ''
            },
            moduleId: '1334',
            tempId: '12314'
        }

        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();

        component.data = {
            maxWeightageLimit: 90,
            createRuleFormValues: {
                rule_type: 'metadata rule',
                rule_name: 'businessrule',
                error_message: 'error_not',
                standard_function: 'sdfgt34@#$%^',
                regex: 'hkjdfh',
                fields: 'email',
                apiKey: 'ajksdjdjjdnfhnw3434',
                udrTreeData: {
                    blocks: [{
                        id: 1,
                        blockDesc: 'blockoe',
                        conditionFieldId: 12334,
                        conditionOperator: 'AND',
                        conditionFieldValue: 'AshishMaterialGrp',
                        rangeStartValue: 12,
                        rangeEndValue: 98,
                        children: ''
                    }],
                    udrHierarchies: [
                        {
                            parentId: '1334',
                            blockRefId: 1,
                            leftIndex: 1
                        }
                    ]
                },
                weightage: 90,
                categoryId: '13133',
                transformationSchema: '',
                duplicacyRuleData: ''
            },
            moduleId: '1334',
            tempId: '12314'
        }

        // component.data.createRuleFormValues.udrTreeData.udrHierarchies[0].parentId = '1323';
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();

        component.data = {
            maxWeightageLimit: 90,
            createRuleFormValues: {
                rule_type: 'metadata rule',
                rule_name: 'businessrule',
                error_message: 'error_not',
                standard_function: 'sdfgt34@#$%^',
                regex: 'hkjdfh',
                fields: 'email',
                apiKey: 'ajksdjdjjdnfhnw3434',
                udrTreeData: {
                    blocks: [{
                        id: 1,
                        blockDesc: 'blockoe',
                        conditionFieldId: 12334,
                        conditionOperator: 'AND',
                        conditionFieldValue: 'AshishMaterialGrp',
                        rangeStartValue: 12,
                        rangeEndValue: 98,
                        children: ''
                    }],
                    udrHierarchies: [
                        {
                            parentId: '1334',
                            blockRefId: 1,
                            leftIndex: 1
                        }
                    ]
                },
                weightage: 90,
                categoryId: '13133',
                transformationSchema: '',
                duplicacyRuleData: ''
            },
            moduleId: '1334',
            // tempId: '12314'
        }
        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();


        component.data = {
            maxWeightageLimit: 90,
            createRuleFormValues: {
                rule_type: 'metadata rule',
                rule_name: 'businessrule',
                error_message: 'error_not',
                standard_function: 'sdfgt34@#$%^',
                regex: 'hkjdfh',
                fields: 'email',
                apiKey: 'ajksdjdjjdnfhnw3434',
                udrTreeData: {},
                weightage: 90,
                categoryId: '13133',
                transformationSchema: '',
                duplicacyRuleData: ''
            },
            moduleId: '1334',
            // tempId: '12314'
        }

        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();

        component.data = null;

        component.ngOnInit();
        expect(component.ngOnInit).toBeTruthy();

    });

    it('selectedTransformationType(), should get selected transformation rule type', async()=> {
        component.form = null;
        const res = component.selectedTransformationType;
        expect(res).toEqual('');
    });
    it('selectSingle(), should set Single field', async()=> {
        component.initializeForm();
        component.selectSingle(component.form, 'categoryId', {option: {value: 1}});
        expect(component.form.controls.categoryId.value).toEqual(1);

        component.preDefinedRegex = [
            {
                FUNC_NAME: 'Test',
                FUNC_TYPE: 'EMAIL',
                FUNC_CODE: '[0-9]'
            }
        ];
        component.selectSingle(component.form, 'standard_function', {option: {value: 'EMAIL'}});
        expect(component.form.controls.regex.value).toEqual('[0-9]');
    });
    it('displayRuleFn(), should display Rule name', async()=> {
        let result = component.displayRuleFn('');
        expect(result).toEqual('');
        component.businessRuleTypes = [{
            ruleDesc: 'test',
            ruleType: BusinessRuleType.BR_CUSTOM_SCRIPT
        } as BusinessRules];
        result = component.displayRuleFn(BusinessRuleType.BR_CUSTOM_SCRIPT);
        expect(result).toEqual('test');
        result = component.displayRuleFn('Test1');
        expect(result).toBeUndefined();
    });

    it('displayCategoryFn(), should display category name', async()=> {
        let result = component.displayCategoryFn('');
        expect(result).toEqual('');
        component.categoryList = [{
            categoryDesc: 'test',
            categoryId: 'Test'
        } as CategoryInfo];
        result = component.displayCategoryFn('Test');
        expect(result).toEqual('test');
        result = component.displayCategoryFn('Test1');
        expect(result).toBeUndefined();
    });

    it('displayRegexFn(), should display regex name', async()=> {
        let result = component.displayRegexFn('');
        expect(result).toEqual('');
        component.preDefinedRegex = [{
            FUNC_NAME: 'test',
            FUNC_TYPE: 'Test'
        } as Regex];
        result = component.displayRegexFn('Test');
        expect(result).toEqual('test');
        result = component.displayRegexFn('Test1');
        expect(result).toBeUndefined();
    });

    it('updateTransformationRuleType(), should update transformation rule type', async()=> {
        component.initializeForm();
        component.updateTransformationRuleType({value:'test'});
        expect(component.form.value.transformationRuleType).toEqual('');
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
    });

    it('patchTargetFieldValues()', async(() => {
        component.fieldsList = [
            {
                fieldId: '1234',
                fieldDescri: 'test'
            }
        ];
        const fields = '1234,2345';
        component.patchTargetFieldValues(fields);

        expect(component.selectedTargetFields.length).toEqual(1);
    }));

    it('selectedField()', async(() => {
        component.form = new FormGroup({
            fields: new FormControl('')
        });
        const ev = {
            option: {
                value: '123',
                viewValue: 'Test'
            }
        }
        component.selectedFields = [
            {
                fieldId: '123',
                fieldDescri: 'Test'
            }
        ];
        const el = document.createElement('input');
        el.setAttribute('id', 'fieldsInput');
        fixture.nativeElement.appendChild(el);
        component.selectedField(ev);

        expect(component.selectedFields.length).toEqual(1);
    }));

    it('selectTargetField()', async(() => {
        component.form = new FormGroup({
            target_field: new FormControl('')
        });
        const ev = {
            option: {
                value: '123',
                viewValue: 'Test'
            }
        }
        component.selectedTargetFields = [
            {
                fieldId: '123',
                fieldDescri: 'Test'
            }
        ];
        const el = document.createElement('input');
        el.setAttribute('id', 'targetFieldsInput');
        fixture.nativeElement.appendChild(el);
        component.selectTargetField(ev);

        expect(component.selectedTargetFields.length).toEqual(1);
    }));

    it('sourceFieldFiltered should get source fields Filtered', async () => {
        component.sourceFieldsObject = {
            list: [{
                fieldId: 'test',
                fieldDescri: 'test'
            }],
            labelKey: 'fieldDescri',
            valueKey: 'fieldId'
        };
        component.searchSourceFieldStr = '';
        expect(component.sourceFieldFiltered.length).toEqual(1);
        component.searchSourceFieldStr = 'test';
        expect(component.sourceFieldFiltered.length).toEqual(1);
    });
    it('displayFieldFn should display the field description', async () => {
        component.fieldsList = [{
                fieldId: 'test',
                fieldDescri: 'Test'
        }];
        expect(component.displayFieldFn('test')).toBe('Test');
        expect(component.displayFieldFn('')).toBe('');
    });
    it('filterField should filter the fieldList', async () => {
        component.fieldsList = [{
                fieldId: 'test',
                fieldDescri: 'Test'
        }];
        component.filterField('test');
        expect(component.fieldsListFiltered.length).toEqual(1);
        component.filterField('test1');
        expect(component.fieldsListFiltered.length).toEqual(0);
    });

    it('filterOperator(), should filter the operator values', async(()=>{
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

    it('updateBlocksType(), should update same level bloc type', (()=>{
        const parent = {
            id: 123,
            childs: [
                {id:'1701', blockDesc:'And'},
                {id:'1701', blockDesc:'Or'}
            ]
        };
        const event = {
            value: 'Or'
        };
        component.updateBlocksType(event, parent);
        expect(parent.childs[0].blockDesc).toEqual('Or');
    }));

    it('isMPNI, sould return true if selected rule is Manufacturer Part Number Identification', (() => {
        component.initializeForm();
        component.form.controls.rule_type.setValue(BusinessRuleType.MRO_MANU_PRT_NUM_IDENTI);
        expect(component.isMPNI).toBeTrue();
    }));

    it('displaySourceFieldFn(), should display source field name', (()=> {
        component.sourceFieldsObject = {
            list: [{
                fieldId: 'test',
                fieldDescri: 'test'
            }],
            labelKey: 'fieldDescri',
            valueKey: 'fieldId'
        };
        expect(component.displaySourceFieldFn()).toBeFalsy();
        expect(component.displaySourceFieldFn('test')).toEqual('test');
    }));

    it('setupWebServiceCallFormRef(), should setup form', (()=> {
        const webServiceCallFormRef: FormGroup = new FormGroup({});
        component.setupWebServiceCallFormRef(webServiceCallFormRef);
        expect(component.webServiceCallFormRef).toEqual(webServiceCallFormRef);
    }));

    it('displayOperatorFn(), should display operator function', (()=> {
        expect(component.displayOperatorFn('EQUAL')).toEqual('EQUALS');
        expect(component.displayOperatorFn('EQUALS_TO')).toEqual('EQUALS TO');
        expect(component.displayOperatorFn(null)).toEqual('');
    }));

    it('isDRTieBreaker(), should be true for tie breaker rules', (()=> {
        component.data = {
            isTieBreaker: true
        };
        expect(component.isDRTieBreaker).toBeTruthy();
        delete component.data;
        expect(component.isDRTieBreaker).toBeFalsy();
    }));

    it('isWebServiceCall(), should be tru for web service call rule', (()=> {
        component.initializeForm();
        component.form.patchValue({
            rule_type: BusinessRuleType.BR_SAP_CHECK_CODE_RULE
        });
        expect(component.isWebServiceCall).toBeTrue();
        component.form.patchValue({
            rule_type: null
        });
        expect(component.isWebServiceCall).toBeFalse();
    }));

    it('fieldsTooltip(), should display correct tooltip', (()=> {
        component.initializeForm();
        component.form.patchValue({rule_type: BusinessRuleType.BR_MANDATORY_FIELDS});
        expect(component.fieldsTooltip.includes('missing')).toBeTrue();
        component.form.patchValue({rule_type: BusinessRuleType.MRO_CLS_MASTER_CHECK});
        expect(component.fieldsTooltip.includes('classification')).toBeTrue();
        component.form.patchValue({rule_type: BusinessRuleType.MRO_MANU_PRT_NUM_LOOKUP});
        component.form.patchValue({rule_type: ''});
        expect(component.fieldsTooltip).toEqual('');
    }));
});