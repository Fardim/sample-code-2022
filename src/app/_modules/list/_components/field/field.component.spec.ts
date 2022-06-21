// import { SharedModule } from '@modules/shared/shared.module';
// import { GlobaldialogService } from '@services/globaldialog.service';
// import { RuleService } from '@services/rule/rule.service';
// import { FieldsWidgetsComponent } from './../fields-widgets/fields-widgets.component';
// import { FieldControlType, FieldlistContainer, ListValueSaveModel, Fieldlist, ListFieldIdResponse } from '@models/list-page/listpage';
// import { CoreService } from '@services/core/core.service';
// import { ListService } from '@services/list/list.service';
// import { of } from 'rxjs';
// import { RouterTestingModule } from '@angular/router/testing';
// import { AppMaterialModuleForSpec } from './../../../../app-material-for-spec.module';
// import { ActivatedRoute, Router } from '@angular/router';
// import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// // import { async, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';

// import { FieldComponent } from './field.component';
// import { FieldsPropertiesComponent } from '../fields-properties/fields-properties.component';
// import { HierarchyListComponent } from './hierarchy-list/hierarchy-list.component';
// import { DataBuilderNullstateComponent } from '../data-builder-nullstate/data-builder-nullstate.component';

// describe('FieldComponent', () => {
//   let component: FieldComponent;
//   let fixture: ComponentFixture<FieldComponent>;
//   let coreService: CoreService;
//   let ruleService: RuleService;
//   let globalDialogService: GlobaldialogService;
//   let router: Router;
//   const queryParams = { f: '1' };
//   const routeParams = { moduleId: '1005', fieldId: '1' };
//   const panel = 'property-panel';
//   const mockFieldlistContainer: FieldlistContainer = {
//     fieldId: '1',
//     isNew: false,
//     fieldlist: {
//       fieldId: '1',
//       attachmentSize: '',
//       dataType: 'CHAR',
//       dateModified: 0,
//       decimalValue: '',
//       fileTypes: '',
//       pickList: '0',
//       maxChar: 4,
//       isHeirarchy: false,
//       isCriteriaField: false,
//       isWorkFlow: false,
//       isGridColumn: false,
//       parentField: '',
//       isDescription: false,
//       textCase: 'UPPER',
//       isSearchEngine: true,
//       isFutureDate: false,
//       isPastDate: false,
//       helptexts: {
//         en: 'Material Type',
//         fr: 'Material Type Fr',
//       },
//       longtexts: {
//         en: 'Material Type',
//         fr: 'Material Type Fr',
//       },
//       moduleId: '1',
//       shortText: {
//         en: {
//           description: 'Material Type',
//           information: 'Material information',
//         },
//         fr: {
//           description: 'Material Type',
//           information: 'Material Information',
//         },
//         ab: {
//           description: 'Material Type',
//           information: 'Material information',
//         },
//       },
//       optionsLimit: 1,
//       isNoun: false,
//       displayCriteria: null,
//       structureId: '1234',
//       childfields: [],

//       icon: 'Text',
//       deleted: true,
//       isDraft: true
//     },
//   };
//   // const mockSearchEngineResponse = {
//   //   1: {
//   //     description: 'english description1',
//   //     dataType: 'CHAR',
//   //     pickList: '1',
//   //     maxChar: 4,
//   //     structureId: 1,
//   //   },
//   // };
//   const mockListFieldIdByStructureResponse: ListFieldIdResponse = {
//     acknowledge: true,
//     errorMsg: null,
//     fieldIds: ['1'],
//   };
//   const mockListValueSaveModel: ListValueSaveModel = {
//     moduleId: '1005',
//     fieldId: '1',
//     dropvals: [
//       {
//         code: 'mg',
//         text: 'Miligram',
//         textRef: '272545505559192171',
//       },
//       {
//         code: 'kg',
//         text: 'Kilogram',
//         textRef: '559906146559193266',
//       },
//     ],
//   };
//   const mockGetFieldDetailsResponse: Fieldlist = {
//     fieldId: '1',
//     attachmentSize: '',
//     dataType: 'CHAR',
//     dateModified: 0,
//     decimalValue: '',
//     fileTypes: '',
//     pickList: '0',
//     maxChar: 4,
//     isHeirarchy: false,
//     isCriteriaField: false,
//     isWorkFlow: false,
//     isGridColumn: false,
//     parentField: '',
//     isDescription: false,
//     textCase: 'UPPER',
//     isSearchEngine: true,
//     isFutureDate: false,
//     isPastDate: false,
//     isNoun: false,
//     displayCriteria: null,
//     helptexts: {
//       en: 'Material Type',
//       fr: 'Material Type Fr',
//     },
//     longtexts: {
//       en: 'Material Type',
//       fr: 'Material Type Fr',
//     },
//     moduleId: '1',
//     shortText: {
//       en: {
//         description: 'Material Type',
//         information: 'Material information',
//       },
//       fr: {
//         description: 'Material Type',
//         information: 'Material Information',
//       },
//       ab: {
//         description: 'Material Type',
//         information: 'Material information',
//       },
//     },
//     structureId: '1234',
//     childfields: [
//       {
//         fieldId: '2',
//         attachmentSize: '',
//         dataType: 'datatype',
//         dateModified: 0,
//         decimalValue: '',
//         fileTypes: '',
//         pickList: '0',
//         maxChar: 4,
//         isHeirarchy: false,
//         isCriteriaField: false,
//         isWorkFlow: false,
//         isGridColumn: false,
//         parentField: '',
//         isDescription: false,
//         textCase: 'UPPER',
//         isSearchEngine: true,
//         isFutureDate: false,
//         isPastDate: false,
//         helptexts: {
//           en: 'Material Type',
//           fr: 'Material Type Fr',
//         },
//         longtexts: {
//           en: 'Material Type',
//           fr: 'Material Type Fr',
//         },
//         moduleId: '1',
//         shortText: {
//           en: {
//             description: 'Material Type',
//             information: 'Material information',
//           },
//           fr: {
//             description: 'Material Type',
//             information: 'Material Information',
//           },
//           ab: {
//             description: 'Material Type',
//             information: 'Material information',
//           },
//         },
//         optionsLimit: 1,
//         isNoun: false,
//         displayCriteria: null,
//         structureId: '1234',
//         childfields: [
//           {
//             fieldId: '3',
//             attachmentSize: '',
//             dataType: 'datatype',
//             dateModified: 0,
//             decimalValue: '',
//             fileTypes: '',
//             pickList: '0',
//             maxChar: 4,
//             isHeirarchy: false,
//             isCriteriaField: false,
//             isWorkFlow: false,
//             isGridColumn: false,
//             parentField: '',
//             isDescription: false,
//             textCase: 'UPPER',
//             isSearchEngine: true,
//             isFutureDate: false,
//             isPastDate: false,
//             helptexts: {
//               en: 'Material Type',
//               fr: 'Material Type Fr',
//             },
//             longtexts: {
//               en: 'Material Type',
//               fr: 'Material Type Fr',
//             },
//             moduleId: '1',
//             shortText: {
//               en: {
//                 description: 'Material Type',
//                 information: 'Material information',
//               },
//               fr: {
//                 description: 'Material Type',
//                 information: 'Material Information',
//               },
//               ab: {
//                 description: 'Material Type',
//                 information: 'Material information',
//               },
//             },
//             optionsLimit: 1,
//             isNoun: false,
//             displayCriteria: null,
//             structureId: '1234',
//             childfields: [],
//             icon: 'Text',
//             deleted: true,
//           }
//         ],
//         icon: 'Text',
//         deleted: true,
//       }
//     ],
//     icon: 'Text',
//     deleted: true,
//   };

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [FieldComponent, FieldsWidgetsComponent, FieldsPropertiesComponent, HierarchyListComponent, DataBuilderNullstateComponent],
//       imports: [AppMaterialModuleForSpec, SharedModule, RouterTestingModule],
//       providers: [
//         ListService,
//         GlobaldialogService,
//         { provide: ActivatedRoute, useValue: { params: of(routeParams), queryParams: of(queryParams), fragment: of(panel), snapshot: {} } },
//       ],
//     }).compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(FieldComponent);
//     component = fixture.componentInstance;
//     router = TestBed.inject(Router);
//     coreService = fixture.debugElement.injector.get(CoreService);
//     ruleService = fixture.debugElement.injector.get(RuleService);
//     globalDialogService = fixture.debugElement.injector.get(GlobaldialogService);
//     component.callable = false;
//     component.structureId = '1';
//   });

//   it('should create', () => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     fixture.detectChanges();
//     expect(component).toBeTruthy();
//   });

//   it('ngAfterViewInit()', () => {
//     queryParams.f = null;
//     component.ngAfterViewInit();
//     expect(component).toBeTruthy();
//   });

//   it('ngOnDestroy()', () => {
//     spyOn(component.unsubscribeAll$, 'unsubscribe');
//     component.ngOnDestroy();
//     expect(component.unsubscribeAll$.unsubscribe).toHaveBeenCalled();
//   });

//   it('clickOutsideDatasetBuilder()', () => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     fixture.detectChanges();
//     component.showDataSetFieldList = true;
//     component.clickOutsideDatasetBuilder();
//     expect(component.showDataSetFieldList).toBeFalse();
//   });

//   it('addFieldToList()', () => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     spyOn(router, 'navigate');
//     // const mockObject = { acknowledge: true, successMessage: 'Drafted Field Successfully', draftIds: ['ueJqT3sBLATj4rfSHKFD'] };
//     // spyOn(coreService, 'putDraftField').and.returnValues(of(mockObject));
//     const mockFieldType = { displayText: 'Text', value: 'text' };
//     fixture.detectChanges();
//     component.moduleId = null;
//     component.structureId = null;
//     expect(() => component.addFieldToList(mockFieldType)).toThrowError('Module or Structure Ids missing');

//   });

//   it('updateFieldPropertySubject$ next', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     spyOn(component, 'patchFieldList');
//     const mockFieldListUpdate = mockGetFieldDetailsResponse;
//     fixture.detectChanges();
//     coreService.nextUpdateFieldPropertySubject(mockFieldListUpdate);
//     expect(component.patchFieldList).toHaveBeenCalled();
//   }));

//   it('dropvalSubject$ next', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     spyOn(component, 'updateDropvalList');
//     fixture.detectChanges();
//     ruleService.nextDropvalSubject(mockListValueSaveModel);
//     expect(component.updateDropvalList).toHaveBeenCalled();
//   }));

//   it('updateFieldFormValidationStatusSubject$ next', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     spyOn(component, 'patchFieldsWithErrorStatus');
//     fixture.detectChanges();
//     coreService.nextUpdateFieldFormValidationStatusSubject({ fieldId: '1', isValid: true });
//     expect(component.patchFieldsWithErrorStatus).toHaveBeenCalled();
//   }));

//   it('datasetFieldListByFilter(currentFilter: string)', async(() => {
//     component.datasetFieldList = [mockFieldlistContainer];
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     // fixture.detectChanges();
//     component.datasetFieldListByFilter('Deleted');
//     expect(component.filteredDatasetFieldList.length).toEqual(1);

//     component.fieldIdsWithValidationError = [{ fieldId: '1', isValid: true }];
//     component.datasetFieldListByFilter('Changes');
//     expect(component.filteredDatasetFieldList.length).toEqual(1);

//     component.fieldIdsWithError = ['1'];
//     component.datasetFieldListByFilter('Errors');
//     expect(component.filteredDatasetFieldList.length).toEqual(1);
//   }));

//   it('patchFieldsWithErrorStatus(resp: {fieldId: string; isValid: boolean})', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     spyOn(router, 'navigate');

//     fixture.detectChanges();

//     component.patchFieldsWithErrorStatus({ fieldId: '1', isValid: false });
//     expect(component.hasFieldError).toBeTrue();
//     expect(component.fieldIdsWithError.length).toEqual(1);

//     component.patchFieldsWithErrorStatus({ fieldId: '1', isValid: false });
//     expect(component.fieldIdsWithError.length).toEqual(1);

//     component.showFirstFieldWithError();
//     const extras: any = { relativeTo: component.route };
//     extras.queryParams = { f: component.fieldIdsWithError[0], update: true, s: '1' };
//     extras.fragment = 'property-panel';
//     extras.preserveFragment = false,

//     expect(router.navigate).toHaveBeenCalledWith(['./'], extras);

//     component.fieldIdsWithError = [];
//     const result = component.showFirstFieldWithError();
//     expect(result).toBeFalsy();
//   }));

//   it('getObjectTypeDetails()', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     const mockObject = {
//       objectid: 1005,
//       moduleid: 1005,
//       objectdesc: 'Adding a dataset manually',
//       description: 'Adding a dataset manually',
//       information: {
//         en: 'Adding a dataset manually'
//       }
//     };
//     spyOn(coreService, 'getObjectTypeDetails').and.returnValues(of(mockObject), of(mockObject));
//     fixture.detectChanges();

//     component.getObjectTypeDetails();
//     expect(component.objectType.objectid).toEqual(mockObject.moduleid);
//     expect(component.objectType.objectdesc).toEqual(mockObject.description);
//   }));

//   it('updateDropvalList()', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     fixture.detectChanges();
//     component.updateDropvalList(mockListValueSaveModel);
//     expect(component.dropvalsList.length).toEqual(1);

//     component.updateDropvalList(mockListValueSaveModel); // for splice condition
//     expect(component.dropvalsList.length).toEqual(1);
//   }));

//   it('dataSetFieldListVisibiltyChange()', fakeAsync(() => {
//     component.dataSetFieldListVisibiltyChange();
//     tick(10);
//     expect(component.showDataSetFieldList).toBeTrue();
//   }));

//   it('deleteWidget(fieldlistContainer: FieldlistContainer), confirmation dialog return yes, mockFieldlistContainer.isNew=false', fakeAsync(() => {
//     spyOn(component, 'markForDelete');
//     spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
//       expect(typeof cb).toBe('function');
//       cb('yes');
//     });
//     mockFieldlistContainer.isNew = false;
//     component.deleteWidget(mockFieldlistContainer);
//     expect(component.markForDelete).toHaveBeenCalled();
//   }));

//   it('deleteWidget(fieldlistContainer: FieldlistContainer), confirmation dialog return yes, mockFieldlistContainer.isNew=true', fakeAsync(() => {
//     spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
//       expect(typeof cb).toBe('function');
//       cb('yes');
//     });
//     component.datasetFieldList = [mockFieldlistContainer];
//     mockFieldlistContainer.isNew = true;
//     component.deleteWidget(mockFieldlistContainer);
//     expect(component.datasetFieldList.length).toEqual(0);
//   }));

//   it('deleteWidget(fieldlistContainer: FieldlistContainer), confirmation dialog return no', fakeAsync(() => {
//     spyOn(globalDialogService, 'confirm').and.callFake(({}, cb) => {
//       expect(typeof cb).toBe('function');
//       cb('no');
//     });
//     const result = component.deleteWidget(mockFieldlistContainer);
//     expect(result).toBeFalsy();
//   }));

//   it('markForDelete(fieldlistContainer: FieldlistContainer)', async(() => {
//     component.datasetFieldList = [mockFieldlistContainer];
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     // fixture.detectChanges();
//     component.markForDelete(mockFieldlistContainer);
//     expect(component.datasetFieldList[0].fieldlist.deleted).toBeTrue();
//   }));

//   it('onWidgetFieldTypeChanged()', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     fixture.detectChanges();
//     const updatedWidget = {
//       ...mockFieldlistContainer,
//     };
//     updatedWidget.fieldlist.dataType = 'CHAR';
//     updatedWidget.fieldlist.pickList = '1';
//     updatedWidget.fieldlist.fieldType = FieldControlType.LIST;

//     component.onWidgetFieldTypeChanged(updatedWidget);
//     expect(component.datasetFieldList[0].fieldlist.pickList).toEqual('1');
//   }));

//   it('onWidgetFieldTypeChanged()', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     fixture.detectChanges();
//     component.triggerAddManually(null);
//     expect(component.addManually).toBeTrue();
//   }));

//   it('patchFieldList(fieldlistContainer: Partial<FieldlistContainer>)', async(() => {
//     component.datasetFieldList = [mockFieldlistContainer];
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     // const mockObject = { acknowledge: true, successMessage: 'Drafted Field Successfully', draftIds: ['ueJqT3sBLATj4rfSHKFD'] };
//     // spyOn(coreService, 'putDraftField').and.returnValues(of(mockObject));

//     // fixture.detectChanges();
//     const mockFieldListUpdate = mockGetFieldDetailsResponse;
//     mockFieldListUpdate.attachmentSize = 'attachmentSize';
//     mockFieldListUpdate.dataType = 'dataType';
//     mockFieldListUpdate.decimalValue = 'decimalValue';
//     mockFieldListUpdate.fileTypes = 'fileTypes';
//     mockFieldListUpdate.pickList = 'pickList';
//     mockFieldListUpdate.maxChar = 4;
//     mockFieldListUpdate.isHeirarchy = true;
//     mockFieldListUpdate.isCriteriaField = true;
//     mockFieldListUpdate.isWorkFlow = true;
//     mockFieldListUpdate.isGridColumn = true;
//     mockFieldListUpdate.parentField = 'parentField';
//     mockFieldListUpdate.isDescription = true;
//     mockFieldListUpdate.textCase = 'textCase';
//     mockFieldListUpdate.isSearchEngine = true;
//     mockFieldListUpdate.isFutureDate = true;
//     mockFieldListUpdate.isPastDate = true;
//     mockFieldListUpdate.helptexts = null;
//     mockFieldListUpdate.longtexts = null;
//     mockFieldListUpdate.moduleId = 'moduleId';
//     mockFieldListUpdate.shortText = null;
//     component.patchFieldList({ fieldId: '1', isNew: false, fieldlist: mockFieldListUpdate });
//     expect(component.datasetFieldList[0].fieldlist.dataType).toEqual('dataType');
//   }));

//   // it('patchedDraftedValue', async(() => {
//   //   spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//   //   spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//   //   spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//   //   const mockObject = { acknowledge: true, successMessage: 'Drafted Field Successfully', draftIds: ['ueJqT3sBLATj4rfSHKFD'] };
//   //   spyOn(coreService, 'putDraftField').and.returnValues(of(mockObject));

//   //   fixture.detectChanges();
//   //   const mockFieldListUpdate = mockGetFieldDetailsResponse;
//   //   component.patchFieldList({ fieldId: '1', isNew: false, parentSubGridId:null, childrenId:null, fieldlist: mockFieldListUpdate });
//   //   expect(component.datasetFieldList[0].fieldlist.dataType).toEqual('dataType');
//   // }));

//   // it('putDraftField(fieldlistContainer: Partial<FieldlistContainer>)', async(() => {
//   //   component.datasetFieldList = [mockFieldlistContainer];
//   //   spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//   //   spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//   //   spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//   //   // fixture.detectChanges();
//   //   const mockObject = { acknowledge: true, successMessage: 'Drafted Field Successfully', draftIds: ['ueJqT3sBLATj4rfSHKFD'] };
//   //   const mockFail = { acknowledge: false, errorMsg: 'fardim103 already exists' };
//   //   spyOn(coreService, 'putDraftField').and.returnValues(of(mockObject), of(mockFail));
//   //   spyOn(transientService, 'open');

//   //   component.putDraftField(mockFieldlistContainer);

//   //   component.putDraftField(mockFieldlistContainer);
//   //   expect(transientService.open).toHaveBeenCalled();
//   // }));

//   // it('discard()', async(() => {
//   //   spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse), of(mockListFieldIdByStructureResponse));
//   //   spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse), of(mockGetFieldDetailsResponse));
//   //   spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//   //   fixture.detectChanges();
//   //   const mockResponse:{ deletedFields: string[]; failedFields: string[]; } = {
//   //     deletedFields: ['1'],
//   //     failedFields: []
//   //   };
//   //   spyOn(coreService, 'bulkDeleteDraft').and.returnValues(of(mockResponse));
//   //   // spyOn(transientService, 'open');
//   //   component.structureId = '1';
//   //   component.discard();
//   //   expect(coreService.bulkDeleteDraft).toHaveBeenCalled();
//   //   // expect(transientService.open).toHaveBeenCalled();
//   // }));

//   it('onScrollDown(loadMore: boolean), should get more fields on scroll down', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     spyOn(component, 'getFieldList');
//     // component.ngOnInit();
//     component.onScrollDown(true);
//     expect(component.recordsPageIndex).toEqual(2);
//     expect(component.getFieldList).toHaveBeenCalled();

//     component.infinteScrollLoading = false;
//     component.onScrollDown(false);
//     expect(component.recordsPageIndex).toEqual(1);

//     const result = component.onScrollDown(true);
//     expect(result).toBeNull();
//   }));

//   it('mapFieldTypeFromPicklist()', async(() => {
//     spyOn(coreService, 'getListParentFields').and.returnValues(of(mockListFieldIdByStructureResponse));
//     spyOn(coreService, 'getFieldDetails').and.returnValues(of(mockGetFieldDetailsResponse));
//     // spyOn(coreService, 'getDraftField').and.returnValues(of(mockGetFieldDetailsResponse));
//     fixture.detectChanges();
//     expect(component.mapFieldTypeFromPicklist({ pickList: '0', dataType: 'CHAR' })).toEqual('text');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '0', dataType: 'PASS' })).toEqual('password');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '0', dataType: 'EMAIL' })).toEqual('email');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '0', dataType: 'NUMC' })).toEqual('number');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '0', dataType: 'STATUS' })).toEqual('list');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '0', dataType: 'DEC' })).toEqual('decimal');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '1', dataType: 'CHAR' })).toEqual('list');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '2', dataType: 'CHAR' })).toEqual('checkbox');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '4', dataType: 'CHAR' })).toEqual('radio');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '22', dataType: 'CHAR' })).toEqual('text-area');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '31', dataType: 'CHAR' })).toEqual('html');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '37', dataType: 'CHAR' })).toEqual('list');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '38', dataType: 'CHAR' })).toEqual('attachment');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '40', dataType: 'CHAR' })).toEqual('geolocation');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '44', dataType: 'CHAR' })).toEqual('digital-signature');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '51', dataType: 'CHAR' })).toEqual('radio');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '52', dataType: 'NUMC' })).toEqual('date');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '53', dataType: 'NUMC' })).toEqual('date-time');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '54', dataType: 'TIMS' })).toEqual('time');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '15', dataType: 'CHAR' })).toEqual('grid');
//     expect(component.mapFieldTypeFromPicklist({ pickList: '55', dataType: 'CHAR' })).toEqual('url');
//   }));

//   it('getAllStructures()', () => {
//     spyOn(coreService, 'getAllStructures').withArgs('1005', 'en', 0, 50).and.returnValue(of([]));
//     component.callable = true;
//     component.getAllStructures('1005', 'en');
//     expect(coreService.getAllStructures).toHaveBeenCalledWith('1005', 'en', 0, 50);
//   });

//   it('hierarchyUpdate()', () => {
//     spyOn(coreService, 'getAllStructures').withArgs('1005', 'en', 0, 50).and.returnValue(of([]));
//     component.callable = true;
//     component.getAllStructures('1005', 'en');
//     expect(coreService.getAllStructures).toHaveBeenCalledWith('1005', 'en', 0, 50);
//   });

//   it('editDataSet() should open edit dataset drawer', () => {
//     spyOn(router, 'navigate');
//     component.editDataSet();
//     const extras: any = { relativeTo: component.route };
//     extras.fragment = 'property-panel';
//     extras.queryParams = { f: 'edit' };
//     expect(router.navigate).toHaveBeenCalledWith(['./'], extras);
//     expect(component.isEditDataSet).toEqual(true);
//   });
// });
