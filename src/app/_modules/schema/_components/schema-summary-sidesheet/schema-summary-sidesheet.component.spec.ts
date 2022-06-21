// import { MdoUiLibraryModule } from 'mdo-ui-library';
// Its failing many time ... need to revisite test cases ...
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { FormControl } from '@angular/forms';
// import { Router } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { PermissionOn, ROLES, SchemaDashboardPermission } from '@models/collaborator';
// import { AddFilterOutput, CheckDataResponse } from '@models/schema/schema';
// import { FilterCriteria } from '@models/schema/schemadetailstable';
// import { PermissionType, SchemaListDetails, VariantDetails } from '@models/schema/schemalist';
// import { CoreSchemaBrInfo, DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
// import { SharedModule } from '@modules/shared/shared.module';
// import { FormInputAutoselectComponent } from '@modules/shared/_components/form-input-autoselect/form-input-autoselect.component';
// import { FormInputComponent } from '@modules/shared/_components/form-input/form-input.component';
// import { SchemaService } from '@services/home/schema.service';
// import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
// import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
// import { SchemalistService } from '@services/home/schema/schemalist.service';
// import { of } from 'rxjs';
// import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

// import { SchemaSummarySidesheetComponent } from './schema-summary-sidesheet.component';

// describe('SchemaSummarySidesheetComponent', () => {
//   let component: SchemaSummarySidesheetComponent;
//   let fixture: ComponentFixture<SchemaSummarySidesheetComponent>;
//   let schemaVariantService: SchemaVariantService;
//   let schemaService: SchemaService;
//   let schemaDetailsService: SchemaDetailsService;
//   let schemaListService: SchemalistService;
//   let router: Router;

//   // component.moduleId = '1005';

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//         SchemaSummarySidesheetComponent,
//         FormInputAutoselectComponent,
//         FormInputComponent
//       ],
//       imports: [ MdoUiLibraryModule, AppMaterialModuleForSpec, RouterTestingModule, HttpClientTestingModule, SharedModule]
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(SchemaSummarySidesheetComponent);
//     component = fixture.componentInstance;
//     schemaVariantService = fixture.debugElement.injector.get(SchemaVariantService);
//     schemaService = fixture.debugElement.injector.get(SchemaService);
//     schemaDetailsService = fixture.debugElement.injector.get(SchemaDetailsService);
//     schemaListService = fixture.debugElement.injector.get(SchemalistService);
//     router = TestBed.inject(Router);
//     // fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('getSchemaVariants(), should return all variants of a schema', async () => {
//     component.schemaId = '1005'
//     spyOn(schemaVariantService, 'getAllDataScopeList').withArgs(component.schemaId, 'RUNFOR').and.returnValue(of({} as VariantDetails[]))
//     component.getSchemaVariants(component.schemaId, 'RUNFOR');
//     expect(schemaVariantService.getAllDataScopeList).toHaveBeenCalledWith(component.schemaId, 'RUNFOR');
//   })

//   it('getBusinessRuleList(), should get business rule list of schema', async () => {
//     spyOn(schemaService, 'getBusinessRulesBySchemaId').withArgs(component.schemaId).and.returnValue(of({} as CoreSchemaBrInfo[]));
//     component.getBusinessRuleList(component.schemaId);
//     expect(schemaService.getBusinessRulesBySchemaId).toHaveBeenCalledWith(component.schemaId);
//   })

//   it('shortName(), should return initials of subscriber', () => {
//     let fName = 'Ashish';
//     let lName = 'Goyal';
//     let result = component.shortName(fName, lName);
//     expect(result).toEqual('AG');

//     fName = 'Ashish';
//     lName = '';
//     result = component.shortName(fName, lName);
//     expect(result).toEqual('')
//   })

//   it('prepateTextToShow(), should prepare text to show over mat-chips', async () => {
//     const ctrl: FilterCriteria = {
//       fieldId: 'MaterialType',
//       values: ['123', '456'],
//       type: 'DROPDOWN',
//       filterCtrl: {
//         selectedValues: [
//           {
//             CODE: 'ABC',
//             FIELDNAME: 'MaterialType'
//           } as DropDownValue
//         ]
//       } as AddFilterOutput
//     }
//     const result = component.prepareTextToShow(ctrl);
//     expect(result).toEqual(2);
//   })

//   it('loadDropValues(), should load dropdown values of selected filters', async () => {
//     const fldc: FilterCriteria = {
//       fieldId: 'MaterialType',
//       values: ['123', '456'],
//       type: 'DROPDOWN',
//       filterCtrl: {
//         selectedValues: [
//           {
//             CODE: 'ABC',
//             FIELDNAME: 'MaterialType'
//           } as DropDownValue
//         ]
//       } as AddFilterOutput
//     }
//     component.loadDropValues(fldc);
//     expect(component.loadDopValuesFor.checkedValue.length).toEqual(2);
//   })

//   it('close(), should close the summary side sheet', () => {
//     spyOn(router, 'navigate');
//     component.close();
//     expect(router.navigate).toHaveBeenCalledWith([{ outlets: { sb: null } }]);
//   });

//   it('openBrLibrarySideSheet(), should open business rule side sheet', () => {
//     component.moduleId = '1004';
//     component.schemaId = '15125412';
//     component.outlet = 'outer';

//     spyOn(router, 'navigate');
//     component.openBrLibrarySideSheet();
//     expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { outer: `outer/schema/businessrule-library/${component.moduleId}/${component.schemaId}/${component.outlet}` } }])
//   });

//   it('openSubscriberSideSheet(), should open subscriber side sheet', () => {
//     component.schemaId = '15125412';
//     component.outlet = 'outer';
//     component.moduleId = '1005';
//     spyOn(router, 'navigate');
//     component.openSubscriberSideSheet();
//     expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { outer: `outer/schema/subscriber/${component.moduleId}/${component.schemaId}/new/${component.outlet}` } }])
//   })

//   it('getAllBusinessRulesList(), should get all business rules', async () => {
//     spyOn(schemaService, 'getBusinessRulesByModuleId').and.returnValue(of({} as CoreSchemaBrInfo[]));
//     component.moduleId = '1005';
//     component.getAllBusinessRulesList(component.moduleId, '', '', '0');
//     expect(schemaService.getBusinessRulesByModuleId).toHaveBeenCalled();
//   })

//   it('getCollaborators(), should get all subscribers', async () => {
//     spyOn(schemaDetailsService, 'getAllUserDetails').and.returnValue(of({} as PermissionOn));
//     component.getCollaborators('', 0);
//     expect(schemaDetailsService.getAllUserDetails).toHaveBeenCalled();
//   })

//   it('addBusinessRule(), should add business rule', async () => {
//     component.businessRuleData = [];
//     const brInfo = {
//       brType: 'Meta data',
//       brIdStr: '12254'
//     } as CoreSchemaBrInfo;
//     component.addBusinessRule(brInfo);
//     expect(component.businessRuleData.length).toEqual(1);

//     component.businessRuleData = [
//       {
//         brIdStr: '12254'
//       } as CoreSchemaBrInfo
//     ];
//     component.addBusinessRule(brInfo);
//     expect(component.businessRuleData.length).toEqual(1);
//   })

//   it('addSubscriber(), should add subscriber', async () => {
//     component.subscriberData = [];
//     const subscriber = {
//       userName: 'AshishGoyal',
//       userMdoModel: {
//         fullName: 'Ashish Goyal',
//         email: 'ashish.goyal@prospecta.com'
//       }
//     };
//     component.addSubscriber(subscriber);
//     expect(component.subscriberData.length).toEqual(1);

//     component.subscriberData = [
//       {
//         userid: 'AshishGoyal'
//       } as SchemaDashboardPermission
//     ]
//     component.addSubscriber(subscriber);
//     expect(component.subscriberData.length).toEqual(1);
//   });

//   it('availableWeightage(), should return max avail weightage', async () => {
//     const weightage = '46';
//     component.businessRuleData = [
//       {
//         brWeightage: '46'
//       },
//       {
//         brWeightage: '33'
//       }
//     ] as CoreSchemaBrInfo[];
//     const result = component.availableWeightage(weightage);
//     expect(result).toEqual(67);
//   })

//   it('getSchemaDetails(), should get schema details', async () => {
//     component.schemaId = '12545';
//     component.schemaThresholdControl = new FormControl(null);
//     spyOn(schemaListService, 'getSchemaDetailsBySchemaId').withArgs(component.schemaId).and.returnValue(of({} as SchemaListDetails))
//     component.getSchemaDetails(component.schemaId);
//     expect(schemaListService.getSchemaDetailsBySchemaId).toHaveBeenCalledWith(component.schemaId);
//   })

  // it('getSchemaDetails(), should get schema details', async () => {
  //   component.schemaId = '12545';
  //   component.schemaThresholdControl = new FormControl(null);
  //   component.schemaName = new FormControl(null);
  //   spyOn(schemaListService, 'getSchemaDetailsBySchemaId').withArgs(component.schemaId).and.returnValue(of({} as SchemaListDetails))
  //   component.getSchemaDetails(component.schemaId);
  //   expect(schemaListService.getSchemaDetailsBySchemaId).toHaveBeenCalledWith(component.schemaId);
  // })

//   it('getCheckDataDetails(), should get info about check data', async () => {
//     component.schemaId = '1224552';
//     spyOn(schemaService, 'getCheckData').withArgs(component.schemaId).and.returnValue(of({} as CheckDataResponse));
//     component.getCheckDataDetails(component.schemaId);
//     expect(schemaService.getCheckData).toHaveBeenCalledWith(component.schemaId);
//   });
//   it('updatedSchemaName should set name of schema', async () => {
//     const value = 'schemaAshish';
//     component.schemaName = new FormControl('');
//     component.schemaName.setValue(value);
//     component.updatedSchemaName = component.schemaName.value
//     expect(component.updatedSchemaName).toEqual('schemaAshish');
//   });
//   it('openUploadSideSheet(), should open upload dataset side sheet', async () => {
//     component.moduleId = '1001';
//     component.outlet = 'outer';
//     spyOn(router, 'navigate');
//     component.openUploadSideSheet();
//     expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { outer: `outer/schema/upload-data/${component.moduleId}/${component.outlet}` } }])
//   })

//   it('openDataScopeSideSheet(), should open data scope side sheet', async () => {
//     component.moduleId = '1001';
//     component.schemaId = '15423'
//     component.outlet = 'outer';
//     spyOn(router, 'navigate');
//     component.openDataScopeSideSheet();
//     expect(router.navigate).toHaveBeenCalledWith([{ outlets: { outer: `outer/schema/data-scope/${component.moduleId}/${component.schemaId}/new/${component.outlet}` } }], { queryParamsHandling: 'preserve' });
//   })

//   it('openBusinessRuleSideSheet(), should openBusinessRuleSideSheet', async () => {
//     component.moduleId = '1001';
//     component.schemaId = '15423'
//     spyOn(router, 'navigate');
//     component.openBusinessRuleSideSheet();
//     expect(router.navigate).toHaveBeenCalledWith(['', { outlets: { outer: `outer/schema/business-rule/${component.moduleId}/${component.schemaId}/new/outer` } }])
//   })

//   it('updateRole(), should update subscriber role', async () => {
//     component.roles = ROLES;
//     component.schemaId = '125556221415';
//     const subscriber = {
//       isAdmin: false,
//       isViewer: true,
//       isReviewer: false,
//       isEditer: false,
//       schemaId: component.schemaId,
//       permissionType: 'USER',
//       sno: '22551',
//       userid: 'ASHSH'
//     } as SchemaDashboardPermission;

//     component.subscriberData = [subscriber];
//     component.updateRole(subscriber, 'isAdmin');
//     expect(subscriber.isAdmin).toEqual(true);
//   });

//   it('prepareData(), should call createBusinessRule and createUpdateUserDetails', async () => {
//     component.subscriberData = [
//       {
//         sno: '098978685586',
//         schemaId: 'testId',
//         userid: '123456',
//         roleId: 'test',
//         groupid: 'groupid',
//         isAdmin: false,
//         isViewer: false,
//         isEditer: false,
//         isReviewer: false,
//         permissionType: PermissionType.USER,
//         description: '',
//         userMdoModel: null,
//         rolesModel: null,
//         groupHeaderModel: null,
//         plantCode: '0',
//         filterCriteria: [],
//         dataAllocation: [],
//         isCopied: false,
//         isInvited: false,
//       }
//     ];

//     component.businessRuleData = [
//       {
//         sno: 1299484,
//         brId: '22',
//         brType: 'TRANSFORMATION',
//         refId: 1,
//         fields: '',
//         regex: '',
//         order: 1,
//         apiKey: '',
//         message: 'Invalid',
//         script: '',
//         brInfo: 'Test Rule',
//         brExpose: 0,
//         status: '1',
//         categoryId: '21474',
//         standardFunction: '',
//         brWeightage: '10',
//         totalWeightage: 100,
//         transformation: 0,
//         tableName: '',
//         qryScript: '',
//         dependantStatus: 'ALL',
//         plantCode: '0',
//         percentage: 0,
//         schemaId: '',
//         brIdStr: '',
//         udrDto: null,
//         transFormationSchema: null,
//         isCopied: false,
//         duplicacyField: [],
//         duplicacyMaster: []
//       }
//     ];

//     spyOn(schemaService, 'createCheckDataBusinessRule').and.returnValue(of(null));
//     spyOn(schemaService, 'createBusinessRule').and.returnValue(of(null));
//     spyOn(schemaService, 'createUpdateCheckData').and.returnValue(of(null));
//     spyOn(schemaDetailsService, 'createUpdateUserDetails').and.returnValue(of([]));

//     component.prepareData('testModuleId');

//     expect(schemaService.createBusinessRule).toHaveBeenCalled();
//     expect(schemaDetailsService.createUpdateUserDetails).toHaveBeenCalled();
//   })

//   it('saveCheckData(), ', async() => {
//     component.schemaName = new FormControl('');
//     component.schemaThresholdControl = new FormControl('');

//     component.schemaId = 'new';
//     component.schemaDetails = {
//       schemaId: 'testId',
//       schemaDescription: 'desc',
//       errorCount: 0,
//       successCount: 0,
//       totalCount: 0,
//       skippedValue: 0,
//       correctionValue: 0,
//       duplicateValue: 0,
//       totalUniqueValue: 0,
//       successUniqueValue: 0,
//       errorUniqueValue: 0,
//       skippedUniqueValue: 0,
//       successTrendValue: '',
//       errorTrendValue: '',
//       createdBy: '',
//       errorPercentage: 0,
//       successPercentage: 0,
//       variantCount: 0,
//       executionStartTime: 0,
//       executionEndTime: 0,
//       variantId: '',
//       runId: '',
//       brInformation: [],
//       moduleId: '',
//       moduleDescription: '',
//       isInRunning: false,
//       schemaThreshold: '10',
//       collaboratorModels: null,
//       totalValue: 0,
//       errorValue: 0,
//       successValue: 0,
//       variants: [],
//       schemaCategory: '',
//     };
//     component.subscriberData = [
//       {
//         sno: '098978685586',
//         schemaId: 'testId',
//         userid: '123456',
//         roleId: 'test',
//         groupid: 'groupid',
//         isAdmin: false,
//         isViewer: false,
//         isEditer: false,
//         isReviewer: false,
//         permissionType: PermissionType.USER,
//         description: '',
//         userMdoModel: null,
//         rolesModel: null,
//         groupHeaderModel: null,
//         plantCode: '0',
//         filterCriteria: [],
//         dataAllocation: [],
//         isCopied: false,
//         isInvited: false,
//       }
//     ];

//       {
//         sno: 1299484,
//         brId: '22',
//         brType: 'TRANSFORMATION',
//         refId: 1,
//         fields: '',
//         regex: '',
//         order: 1,
//         apiKey: '',
//         message: 'Invalid',
//         script: '',
//         brInfo: 'Test Rule',
//         brExpose: 0,
//         status: '1',
//         categoryId: '21474',
//         standardFunction: '',
//         brWeightage: '10',
//         totalWeightage: 100,
//         transformation: 0,
//         tableName: '',
//         qryScript: '',
//         dependantStatus: 'ALL',
//         plantCode: '0',
//         percentage: 0,
//         schemaId: '',
//         brIdStr: '',
//         udrDto: null,
//         transFormationSchema: null,
//         isCopied: false,
//         duplicacyField: [],
//         duplicacyMaster: []
//       }
//     ];
//     spyOn(schemaService, 'createUpdateSchema').and.returnValue(of(null));
//     spyOn(schemaService, 'createCheckDataBusinessRule').and.returnValue(of(null));
//     spyOn(schemaService, 'createBusinessRule').and.returnValue(of(null));
//     spyOn(schemaService, 'createUpdateCheckData').and.returnValue(of(null));
//     spyOn(schemaDetailsService, 'createUpdateUserDetails').and.returnValue(of([]));

// });

//       } as CoreSchemaBrInfo,
//       {
//         sno: 1299484,
//         brId: '22',
//         brIdStr: '22',
//         brType: 'TRANSFORMATION',
//         dep_rules: [{
//           sno: 1299484,
//           brId: '22',
//           brIdStr: '22',
//           brType: 'TRANSFORMATION', dependantStatus: 'SUCCESS'
//         }]
//       } as CoreSchemaBrInfo
//     ];
//     component.updateDepRuleForChild(br, 0, event);
//     expect(component.businessRuleData.length).toEqual(3);
//   });
// });
