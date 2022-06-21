import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, forwardRef, Inject, Input, LOCALE_ID, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import FormField from '@models/form-field';
import { Mapping, MappingData, MappingRequestBody, MdoField, MdoFieldMapping, MdoMappings, MessageTypes, SegmentMappings, WsdlDetails } from '@models/mapping';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { Utilities } from '@models/schema/utilities';
import { CoreSchemaBrInfo, crossDataRuleInfo, crossDataRuleValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { CONTROL_DATA, DESCRIPTION_MAPPING } from '@modules/mapping/_common/utility-methods';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { CoreService } from '@services/core/core.service';
import { CrossDatasetService } from '@services/cross-dataset.service';
import { SchemaService } from '@services/home/schema.service';
import { MappingService } from '@services/mapping/mapping.service';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'pros-cross-dataset-rule',
  templateUrl: './cross-dataset-rule.component.html',
  styleUrls: ['./cross-dataset-rule.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CrossDatasetRuleComponent)
    }]
})
export class CrossDatasetRuleComponent extends FormField implements OnInit {

  crossDatasetFormGroup: FormGroup;
  translationRuleFormGroup: FormGroup;

  /**
   * reference to the input
   */
  @ViewChild('fieldsInput') fieldsInput: ElementRef;

  @Input() schemaId = '';
  @Input() moduleId = '';

  dataSetModules: any[] = [];

  /**
   * hold the business rules list
   */
  businessRulesList: CoreSchemaBrInfo[] = [];
  businessRuleObs: Observable<any[]> = of([]);

  /**
   * fetch count to fetch business rule data.
   */
   fetchCount = 0;

  /**
   * Source and Target fields for the list
   */
  sourceFields: MdoField[] = [];
  sourceFieldsObs = of([]);
  targetFields = [];
  targetFieldsObs = of([]);

  mappingSourceLoader = false;
  mappingTargetLoader = false;

  existingMapping: Mapping[] = [];
  mappingFilter = 'all';

  mappingDatasetInfo = {
    sourceDataSet: {
      moduleId: '',
      objectInfo: '',
      objectdesc: ''
    },
    targetDataSet: {
      moduleId: '',
      objectInfo: '',
      objectdesc: ''
    }
  }

  checkForFieldsClicked = {
    triggerField: false,
    linkingField: false
  }

  subscriptionsList: Subscription[] = [];
  submitted = false;
  formHasError = false;

  /**
   * list of event to consider as selection
   */
  separatorKeysCodes: number[] = [ENTER, COMMA];

  isTargetFieldSelected = false;

  externalMappingData = {
      wsdlDetails: [],
      segmentMappings: []
  };

  /**
   * observable for autocomplete
   */
  filteredModules: Observable<{} | string | void> = of([]);

  /**
   * array to save the selected fields
   */
  selectedFields = [];

  /**
   * List of fields
   */
  fieldsList = [];

  expandedView = false;

  constructor(
    private fb: FormBuilder,
    private coreService: CoreService,
    private router: Router,
    private mappingService: MappingService,
    private sharedService: SharedServiceService,
    private schemaService: SchemaService,
    private utilityService: Utilities,
    @Inject(LOCALE_ID) public locale: string,
    private snackBar: MatSnackBar,
    private crossDatasetService: CrossDatasetService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createCrossDatasetFormGroup();
    this.getObjectTypeDetails(this.moduleId,'sourceDataSet');

    this.filteredModules = of(this.fieldsList);

    this.subscriptionsList.push(this.crossDatasetFormGroup.controls.targetDataset.valueChanges.pipe(distinctUntilChanged(),debounceTime(500)).subscribe((value) => {
      if (typeof value === 'string' && value?.toString().trim()) {
        this.searchDatasetModules(value);
      }
    }));

    this.subscriptionsList.push(this.crossDatasetFormGroup.controls.linkingField.valueChanges.pipe(distinctUntilChanged(), debounceTime(500)).subscribe((keyword) => {
      keyword = keyword ? keyword?.toLowerCase() : keyword;
      this.coreService.getMetadataFieldsByModuleId([this.mappingDatasetInfo?.targetDataSet?.moduleId], keyword).subscribe((res: MetadataModeleResponse) => {
        const filterModule = this.parseMetadataModelResponse(res, false);
        this.filteredModules = of(filterModule);
      });
    }));

    this.subscriptionsList.push(this.getSourceMapping(this.locale, this.moduleId, 'source').subscribe((response: MdoField[]) => {
      // response = this.addDescriptionMappingStructure(response);
      // response = this.addControlDataStructure(response);
      this.sourceFields = response;
      this.sourceFieldsObs = of(this.sourceFields);
    }));

    this.subscriptionsList.push(this.sharedService.getAfterBrSave().subscribe(res => {
      if (res?.length) {
        this.addTransRule(res[0]);
      }
    }));

    this.subscriptionsList.push(this.sharedService.getTargetFieldDetails().subscribe(resp => {
      if (resp?.type === 'fieldSelected') {
        this.isTargetFieldSelected = true;
      }
    }))
  }

  createCrossDatasetFormGroup() {
    this.crossDatasetFormGroup = this.fb.group({
      rule_name: ['',Validators.required],
      usage: [''],
      targetDataset: ['',Validators.required],
      linkingField: [],
      triggerCondition: ['',Validators.required],
      moduleId: [''],
      selectedTriggerConditionId: [''],
      mappings: [''],
      wsdlDetails: [],
      segmentMappings: [],
      isDrawerClosed: [true],
      uuid: ['']
    })

    this.translationRuleFormGroup = new FormGroup({
      translationRule: new FormControl()
    });
  }

  /**
   * function to get the fields on basis of module
   */
   getFieldsByModuleId(moduleId, selectedFields?) {
    if (!moduleId) { return };

    this.coreService.getMetadataFieldsByModuleId([moduleId]).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      const filterModule = this.parseMetadataModelResponse(metadataModeleResponse, selectedFields);
      this.filteredModules = of(filterModule);
    }, (err) => {
        this.filteredModules = of([]);
    });
  }

  /**
   * used for displaying description from field object in UI...
   * @param obj metadata field
   * @returns field description
   */
   displayFn(obj): string {
    let res = null;
    if (obj) {
      const desc = obj.fieldDescri ? obj.fieldDescri : (obj.fieldDesc ? obj.fieldDesc : obj.fieldId);
      res = obj.moduleName ? (!desc.includes(`${obj.moduleName}/`) ? `${obj.moduleName}/${desc}` : desc) : desc;
    }

    return res;
  }


  parseMetadataModelResponse(response: MetadataModeleResponse, selectedFields?) {
    const metadata: Metadata[] = [];
    // for header
    const headerChilds: Metadata[] = [];
    if(response.headers) {
      Object.keys(response.headers).forEach(header=>{
        const res = response.headers[header];
        this.patchSelectedFieldValues(selectedFields, res);
        headerChilds.push({
          fieldId: res.fieldId,
          fieldDescri: res.fieldDescri,
          isGroup: false,
          childs: []
        });
      });
    }

    if (headerChilds.length) {
      metadata.push({
        fieldId: 'header_fields',
        fieldDescri: 'Header fields',
        isGroup: true,
        childs: headerChilds
      });
    }

    // for grid response transformations
    if(response && response.grids) {
      Object.keys(response.grids).forEach(grid=>{
        const childs : Metadata[] = [];
        if(response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(fld=>{
            const fldCtrl = response.gridFields[grid][fld];
            this.patchSelectedFieldValues(selectedFields, fldCtrl);
            if (fldCtrl.structureId === '1' || (fldCtrl.structureId !== '1' && this.crossDatasetService.getKeyFields(response.gridFields[grid]).includes(fldCtrl.fieldId))) {
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[],
                fieldType: {
                  fieldId: grid,
                  fieldDescri: response.grids[grid].fieldDescri
                },
                fldCtrl
              });
            }
          });
        }

        if (childs.length) {
          metadata.push({
            fieldId: grid,
            fieldDescri: response.grids[grid].fieldDescri,
            isGroup: true,
            childs
          });
        }
      })
    }

    // for hierarchy response transformations
    if(response && response.hierarchy) {
      response.hierarchy.forEach(hierarchy => {
        const childs: Metadata[] = [];
        if(response.hierarchyFields && response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
          Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach(fld=>{
            const fldCtrl = response.hierarchyFields[hierarchy.heirarchyId][fld];
            this.patchSelectedFieldValues(selectedFields, fldCtrl);
            if ((this.crossDatasetService.getKeyFields(response.hierarchyFields).includes(fldCtrl.fieldId))) {
              childs.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                childs:[],
                fieldType: {
                  fieldId: hierarchy.heirarchyId,
                  fieldDescri: hierarchy.heirarchyText
                },
                fldCtrl
              });
            }
          });
        }

        if (childs.length) {
          metadata.push({
            fieldId: hierarchy.heirarchyId,
            fieldDescri: hierarchy.heirarchyText,
            isGroup: true,
            childs
          });
        }
      });
    }
    return metadata;
  }

  patchSelectedFieldValues(existedLinkingField, res) {
    if (existedLinkingField) {
      const fldIds = existedLinkingField.split(',') || [];

      if (fldIds?.includes(res?.fieldId) && !this.selectedFields.includes(res?.fieldId)) {
        this.selectedFields.push({
          fieldDescri: res.fieldDescri,
          fieldId: res.fieldId
        })
      }
    }
  }

  getObjectTypeDetails(moduleId,objectType,loadDatasetModule?) {
    const sub = this.coreService.getEditObjectTypeDetails(moduleId)
    .pipe(
      finalize(() => {
        if (loadDatasetModule){}
      })
    ).subscribe(
      (response: any) => {
        this.mappingDatasetInfo[objectType] = {
          moduleId,
          objectInfo: response.moduleDescriptionMap[this.locale][0].information,
          objectdesc: response.moduleDescriptionMap[this.locale][0].description
        }
      },
      (error) => {
        console.log('Error:',error);
      }
    );
    this.subscriptionsList.push(sub);
  }

  getSourceMapping(language: string, moduleId: string | number, type: 'source' | 'target'): Observable<MdoField[] | SegmentMappings[]> {
    return new Observable((observer) => {
      (type === 'source') ? this.mappingSourceLoader = true : this.mappingTargetLoader = true;
      this.mappingService.getMdoMappings(language, moduleId)
      .pipe(
        finalize(() => {
          this.mappingSourceLoader = false;
        })
      )
      .subscribe(
        (response: MdoFieldMapping) => {
          let returnResponse;
          if (type === 'target') {
            const filteredHierarchyData = response?.fields?.filter(field => field?.fieldlist?.length) || [];
            this.externalMappingData.wsdlDetails = [...this.crossDatasetService.addMappingWsdlDetails(filteredHierarchyData)];
            this.crossDatasetFormGroup.get('wsdlDetails').setValue(this.externalMappingData.wsdlDetails);
            returnResponse = this.crossDatasetService.transformHierarchyToSegmentJSON(filteredHierarchyData, 2, '');
          } else {
            returnResponse = response.fields;
          }

          (response?.fields?.length && returnResponse) ? observer.next(returnResponse) : observer.next([]);
        },
        (err) => {
          observer.next([]);
        }
      );
    });
  }

  get getTargetDatasetValue() {
    return +this.crossDatasetFormGroup.get('targetDataset').value;
  }

  selectedDataset(event) {
    this.getObjectTypeDetails(event.toString(),'targetDataSet');
    this.getFieldsByModuleId(event.toString());
    this.getDatasetTargetMapping(event);
    this.selectedFields = [];
    this.targetFields = [];
    this.targetFieldsObs = of([]);
  }

  writeValue(formData): void {
    if (formData?.ruleId) {
      this.getCrossDatasetInfo(formData.ruleId)
    } else {
      this.loadInitialValues();
    }
  }

  loadInitialValues() {
    this.getBusinessRulesList(this.moduleId, '', 'BR_CUSTOM_SCRIPT');
    this.getDatasetModules();
  }

  getCrossDatasetInfo(ruleId) {
    this.crossDatasetService.getCrossDatasetRuleInfo(ruleId).subscribe((response: crossDataRuleInfo) => {
      if (response?.acknowledge) {
        this.patchFormValue(response.response);
      }
    })
  }

  patchFormValue(crossDatasetInfo: crossDataRuleValue) {
    this.getBusinessRulesList(crossDatasetInfo.ruleSourceModule, '', 'BR_CUSTOM_SCRIPT', false,crossDatasetInfo.ruleTrigger);
    this.crossDatasetFormGroup.patchValue({
      rule_name: crossDatasetInfo?.ruleName,
      usage: crossDatasetInfo?.ruleUsage,
      segmentMappings: crossDatasetInfo?.segmentMappings,
      wsdlDetails: crossDatasetInfo?.wsdlDetails,
      uuid: crossDatasetInfo?.uuid
    });

    if (crossDatasetInfo.ruleTargetModule) {
      this.crossDatasetFormGroup.controls.moduleId.setValue(crossDatasetInfo.ruleTargetModule);
      this.crossDatasetFormGroup.controls.targetDataset.setValue(crossDatasetInfo.ruleTargetModule);
      this.getObjectTypeDetails(crossDatasetInfo.ruleTargetModule,'targetDataSet', true);
      this.getDatasetModules()
      this.getFieldsByModuleId(crossDatasetInfo.ruleTargetModule, crossDatasetInfo.ruleLinkField);
      this.getDatasetTargetMapping(crossDatasetInfo.ruleTargetModule, crossDatasetInfo.ruleInterfaceId);
    }
  }

  /**
   * Call endoint to get target(SegmentMappings) list
   * @returns Observable<SegmentMappings[]>
   */
  getSegmentMappingTargetList(scenarioId: number | string): Observable<any[]> {
    return new Observable((observer) => {
      this.mappingService.getExternalMappings(scenarioId).subscribe(
        (response: MappingData) => {
          response.response.segmentMappings?.length ? observer.next(response.response.segmentMappings) : observer.next([]);
          this.updateWsdlSegment(response.response.wsdlDetails);
        },
        (err) => {
          observer.next([{error: err}]);
        }
      );
    });
  }

  updateWsdlSegment(segmentWsdlDetails) {
    this.externalMappingData.wsdlDetails = this.externalMappingData.wsdlDetails.map(wsdlData => {
      const wsdlValue = segmentWsdlDetails.find(segmentWsdl => segmentWsdl.complexTypeName === wsdlData.complexTypeName);
      return (wsdlValue) ? wsdlValue : wsdlData;
    })
  }

  getDatasetTargetMapping(event, ruleInterfaceId?) {
    this.subscriptionsList.push(this.getSourceMapping(this.locale, event, 'target')
    .subscribe((response: SegmentMappings[]) => {
      if (!ruleInterfaceId) {
        this.initializeTargetfields(response, false);
      }

      if (ruleInterfaceId) {
        this.getSegmentMappingTargetList(ruleInterfaceId)
        .subscribe((segmentResponse) => {
          if (segmentResponse.length && segmentResponse[0]?.error) {
            this.initializeTargetfields(response, true);
            this.snackBar.open('Something went wrong while fetching mapped fields', 'close', { duration: 3000 });
          } else {
            const updatedTargetField = this.updateTargetFields(response, segmentResponse);
            this.initializeTargetfields(response, true);
          }
        },error => {
          this.initializeTargetfields(response, true);
        });
      }
    }));
  }

  initializeTargetfields(response, addSegmentValue) {
    this.targetFields = response;
    this.targetFieldsObs = of(this.targetFields);
    this.existingMapping = this.createExistingMappings(response);
    this.mappingTargetLoader = false;
    if (addSegmentValue) {
      if (this.existingMapping.length) {
        this.crossDatasetFormGroup.get('mappings').setValue(this.existingMapping);
      }
      this.crossDatasetFormGroup.get('segmentMappings').setValue(this.targetFields);
    }
  }

  updateTargetFields(targetFields: any[], segmentResponse: any[]) {
    // will update segment mapping field and grid type field
    if (targetFields.length && segmentResponse?.length && targetFields[0].segmentType === 'main-segment' && segmentResponse[0].segmentType === 'main-segment' && !segmentResponse[0]?.field && !targetFields[0]?.field) {
      targetFields = targetFields?.map((targetField, i) => {
        const segmentIndex = segmentResponse.findIndex(segment => !segment.field && targetField.mainStructureId === segment.mdoStructure);
        return (segmentIndex !== -1) ? this.updateSegmentField(targetField, segmentResponse[segmentIndex]) : targetField;
      })
    }

    // will update grid type field
    if (targetFields.length && targetFields[0].segmentType === 'main-segment' && segmentResponse[0].segmentType === 'main-segment' && targetFields[0]?.description && segmentResponse[0]?.description ) {
      targetFields = targetFields.map((targetField) => {
        const gridSegment = segmentResponse.findIndex(segment => segment?.description === targetField.description);
        return (gridSegment !== -1) ? this.updateSegmentField(targetField, segmentResponse[gridSegment]) : targetField;
      })
    }

    else if (targetFields.length && targetFields[0]?.hasOwnProperty('externalFieldId') && segmentResponse?.[0]?.hasOwnProperty('externalFieldId')) {
      // will update segment mapping field
      targetFields = targetFields?.map((targetField, i) => {
        const segmentMdoFieldId = segmentResponse.findIndex(mdoField => mdoField.externalFieldId === targetField.externalFieldId);
        return (segmentMdoFieldId !== -1) ? segmentResponse[segmentMdoFieldId] : targetField;
      })
    }
    return targetFields;
  }

  updateSegmentField(targetField: SegmentMappings, segmentField: SegmentMappings) {
    targetField.uuid = segmentField.uuid;
    targetField.scenarioId = segmentField.scenarioId;

    if (targetField?.mdoMappings && +(targetField?.mdoMappings?.length) !== 0) {
      targetField.mdoMappings = this.updateTargetFields(targetField.mdoMappings, segmentField.mdoMappings);
    }

    if (targetField?.segmentMappings && +(targetField?.segmentMappings?.length) !== 0) {
      targetField.segmentMappings = this.updateTargetFields(targetField.segmentMappings, segmentField.segmentMappings);
    }

    return targetField;
  }

  createExistingMappings(segmentMappings): Mapping[] {
    let mappings = [];
    segmentMappings.forEach((segment: SegmentMappings) => {
      if (segment.mdoMappings?.length) {
        const temp = this.getMappingsFromMdoMappings(segment.mdoMappings);
        if (temp.length) {
          mappings = [...mappings, ...temp];
        }
      }
      if (segment.segmentMappings?.length) {
        const temp = this.createExistingMappings(segment.segmentMappings);
        if (temp.length) {
          mappings = [...mappings, ...temp];
        }
      }
    });

    return mappings;
  }

  getMappingsFromMdoMappings(mdoMappings: MdoMappings[]): Mapping[] {
    const mappings: Mapping[] = [];

    mdoMappings.forEach((field) => {
      if (field.mdoFieldId) {
        mappings.push({
          source: {
            fieldId: field.mdoFieldId,
            description: field.mdoFieldDesc,
          },
          target: {
            uuid: field.uuid,
            description: field.segmentName,
            data: field
          },
        });
      }
    });

    return mappings;
  }

  remove(i) {
    this.selectedFields.splice(i, 1);
  }

  selectField(event) {
    this.crossDatasetFormGroup.get('linkingField').patchValue('');
      const txtfield = document.getElementById('fieldsInput') as HTMLInputElement;
      if (txtfield) {
        txtfield.value = '';
      }

      if (this.fieldsInput) {
        this.fieldsInput.nativeElement.blur();
      }
    if (!!event.option.value && event.option.value?.fieldId) {
      const alreadyExists = this.selectedFields.find(item => item.fieldId === event.option.value.fieldId);
      if (alreadyExists) {
        this.snackBar.open('This field is already selected', 'close', { duration: 3000 });
        return;
      } else if (!alreadyExists) {
        this.selectedFields.push({
          fieldDescri: event.option.viewValue,
          fieldId: event.option.value.fieldId
        });
      }
    }
  }

  fieldClicked(type) {
    this.checkForFieldsClicked[type] = this.crossDatasetFormGroup.get('targetDataset').value ? false : true;
  }

  getBusinessRulesList(moduleId: string, searchString: string, brType: string, loadMore?: boolean, existedBusinessRuleId?: string) {
    if(loadMore) {
      this.fetchCount++;
    } else {
      this.fetchCount = 0;
    }
    this.subscriptionsList.push(this.schemaService.getBusinessRulesByModuleId(moduleId, searchString, brType, '0')
    .pipe(
      finalize(() => {
        this.businessRuleObs = of(this.businessRulesList);
        if (existedBusinessRuleId) {
          const businessRuleInfo = this.businessRulesList.find(rule => rule.brIdStr === existedBusinessRuleId);
          if (businessRuleInfo) {
            this.crossDatasetFormGroup.get('triggerCondition').setValue(businessRuleInfo);
            this.crossDatasetFormGroup.get('selectedTriggerConditionId').setValue(businessRuleInfo?.brId || '');
          }
        }
      })
    )
    .subscribe((rules: CoreSchemaBrInfo[]) => {
      if(loadMore) {
        if(rules && rules.length) {
          this.businessRulesList = [...this.businessRulesList, ...rules];
        } else {
          this.fetchCount--;
        }
      } else {
        this.businessRulesList = rules || [];
      }
    },error => {
      console.log('Error:',error)
    }));
  }

  get targetModuleIdValue() {
    return +(this.crossDatasetFormGroup.get('targetDataset').value);
  }

  getDatasetModules(existedValue?) {
    this.subscriptionsList.push(this.coreService.getAllObjectType(this.locale, 20, 0).subscribe(
      (response: any[]) => {
        if (response?.length) {
          this.dataSetModules = response.map((module) => {
            return {
              moduleId: module.moduleId,
              moduleName: module.moduleDescriptionRequestDTO.description,
            };
          });

          const targetDatasetValue = this.crossDatasetFormGroup.controls.moduleId.value;
          const isTargetDatasetPresent = this.dataSetModules.find(datasetModule => datasetModule.moduleId === +targetDatasetValue);
          if (!isTargetDatasetPresent) {
            this.dataSetModules.push({
              moduleId: this.mappingDatasetInfo.targetDataSet.moduleId,
              moduleName: this.mappingDatasetInfo.targetDataSet.objectdesc
            })
          }
        } else {
          this.dataSetModules = [];
        }
      },
      (err) => {
        this.dataSetModules = [];
      }
    ));
  }

  /**
   * method to search the modules from API
   * @param searchTerm pass the search term
   * @returns Observable<any[]>
   */
   searchDatasetModules(searchTerm = ''): Observable<any[]> {
    const body = {
      lang: this.locale,
      fetchsize: 20,
      fetchcount: 0,
      description: searchTerm?.toLocaleLowerCase(),
    };
    return new Observable((observer) => {
      return this.coreService.searchAllObjectType(body).subscribe(
        (response) => {
          return !response?.length
            ? observer.next([])
            : response.map((module) => {
                return {
                  moduleId: +module.moduleId,
                  moduleName: module.moduleDesc,
                };
              });
        },
        (err) => {
          return observer.next([]);
        }
      );
    });
  }

  openBusinessRuleSideSheet() {
    const selectedConditionId = this.crossDatasetFormGroup.get('selectedTriggerConditionId').value;
    this.router.navigate(['', { outlets: { sb3: `sb3/schema/businessrule-library/${this.moduleId}/${this.schemaId}/sb3` } }], {
      queryParams: {ruleType: 'BR_CUSTOM_SCRIPT', businessRule: 'BR_CROSS_DATASET_RULE', ...(selectedConditionId && {selectedBrRuleId: selectedConditionId})}
    });
  }

  addTransRule($event) {
    this.crossDatasetFormGroup.get('selectedTriggerConditionId').setValue($event?.brId || '');
    this.crossDatasetFormGroup.get('triggerCondition').setValue($event);
  }

  setFilters(filterOption: string) {
    this.mappingFilter = filterOption;
    this.sharedService.setTargetFieldSelected(null);
    this.isTargetFieldSelected = false;
  }

  updateMappedTarget(targetMapping: MappingRequestBody) {
    this.externalMappingData.segmentMappings = targetMapping.segmentMappings;
    this.crossDatasetFormGroup.get('segmentMappings').setValue(targetMapping.segmentMappings);
    this.crossDatasetFormGroup.get('mappings').setValue(targetMapping?.mappingList);
  }

  setBannerText($event) {}

  saveCrossDatasetRule() {
    this.submitted = true;
    const formValue = this.crossDatasetFormGroup.value;
    const linkingFields = this.selectedFields.map(field => field.fieldId);
    const mappingValue = this.crossDatasetFormGroup.get('mappings').value;

    if (this.crossDatasetFormGroup.valid && linkingFields.length) {
      if (this.crossDatasetFormGroup.valid && !mappingValue?.length) {
        this.openMappingErrorMessage();
        return;
      }
      let linkingFieldError = false;
      if (mappingValue.length) {
        const mappedFieldIds = mappingValue?.map(mappedField => mappedField?.target?.data?.fieldId || mappedField?.target?.data?.externalFieldId);
        linkingFields.forEach(linkingfield => {
          if (!mappedFieldIds.includes(linkingfield)) {
            const bannerText = `The field "${this.selectedFields.find(selectedField => selectedField.fieldId === linkingfield)?.fieldDescri || ''}" defined as a linking field should have a defined mapping.`;
            this.snackBar.open(bannerText, 'Close', { duration: 3000 });
            this.submitted = false;
            linkingFieldError = true;
            return;
          }
        })
      } else {
        this.openMappingErrorMessage();
        return;
      }

      const payload = {
        ruleName: formValue.rule_name,
        ruleUsage: formValue?.usage,
        ruleSourceModule: this.moduleId,
        ruleTargetModule: formValue.targetDataset.toString(),
        ruleTrigger: formValue.triggerCondition?.brIdStr,
        ruleLinkField: linkingFields?.toString()?.length ? linkingFields.toString() : '',
        ruleTenantId: 0,
        wsdlDetails: formValue?.wsdlDetails,
        segmentMappings: formValue?.segmentMappings,
        ...(formValue?.uuid && {uuid: formValue?.uuid})
      }
      this.crossDatasetService.createUpdateCrossDatasetRule(payload,'')
      .pipe(
        finalize(() => this.submitted = false)
      )
      .subscribe((data: any) => {
        if (data.acknowledge) {
          this.snackBar.open(`Successfully saved !`, 'Close', { duration: 3000 });
          this.close(true);
          return;
        }
      },error => {
        this.snackBar.open(`Something went wrong`, 'Close', { duration: 5000 });
      })
    } else {
      this.formHasError = true;
      this.submitted = false;
    }
  }

  openMappingErrorMessage() {
    this.snackBar.open('Fields not mapped, map some fields in field mapping section', 'Close', { duration: 2000 });
    this.submitted = false;
  }

  addDescriptionMappingStructure(data: MdoField[]): MdoField[] {
    const descriptionMappingData = DESCRIPTION_MAPPING;
    data.unshift(descriptionMappingData);
    return [...data];
  }

  addControlDataStructure(data: MdoField[]): MdoField[] {
    const controlData = CONTROL_DATA;
    data.unshift(controlData);
    return [...data];
  }

  expandMap(event) {
    this.expandedView = event;
  }
  close(isRuleUpdated) {
    this.crossDatasetFormGroup.get('isDrawerClosed').setValue(true)
    this.onChange({isDrawerClosed: true, isRefreshList: isRuleUpdated});
  }
}
