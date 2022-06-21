import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldMetaData } from '@models/dependencyRules';
import { Fieldlist, ListValueResponse } from '@models/list-page/listpage';
import {
  currentConditionMapping,
  FieldMappingRules,
  FieldMappingRulesEnum
} from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { CoreService } from '@services/core/core.service';
import { RuleService } from '@services/rule/rule.service';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, take } from 'rxjs/operators';
import { AutoExtensionService } from '@services/auto-extension.service';
import { ValidationError } from '@models/schema/schema';
import { MatSnackBar } from '@angular/material/snack-bar';
import { uniqBy } from 'lodash';

@Component({
  selector: 'pros-auto-extension-new-condition',
  templateUrl: './auto-extension-new-condition.component.html',
  styleUrls: ['./auto-extension-new-condition.component.scss']
})
export class AutoExtensionNewConditionComponent implements OnInit {
  structureDetails = {
    moduleId: '',
    structureId: '',
    structureDesc: '',
    type: 'new',
    conditionId: ''
  };

  newConditionFormGroup: FormGroup;
  mappingFormGroup: FormGroup;

  keyFieldList = [];
  fieldDropValueList = [];
  selectedStructureFields = [];
  businessRulesList = [];
  UDRRuleList = [];
  fieldMappingRules = FieldMappingRules;
  fieldMappingRulesEnum = FieldMappingRulesEnum;

  keyFieldSearchSub: Subject<{ s: string; type: string; index?: number }> = new Subject();
  fieldDropvalueSearchSub: Subject<{ s: string; type: string; index?: number }> = new Subject();

  keyFieldsListObs: Observable<any> = of([]);
  fieldDropValuesSub: Observable<any> = of([]);
  businessRulesObs: Observable<any> = of([]);
  udrRulesObs: Observable<any> = of([]);
  selectedStructureFieldsObs: Observable<any> = of([]);
  searchSub: Subject<string> = new Subject();

  keyFieldLoading = false;
  valueFieldLoading = false;

  isMappedFieldsSelected = false;

  submitted = false;

  validationError: ValidationError = {
    status: false,
    message: ''
  };

  fetchSize = 1;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private coreService: CoreService,
    private ruleService: RuleService,
    private autoExtensionService: AutoExtensionService,
    private snackBar: MatSnackBar,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.structureDetails.moduleId = params?.moduleId;
      this.structureDetails.structureId = params?.structureId;
      this.structureDetails.type = params?.type || 'new';

      if (params?.structureId) {
        this.getStructureFields();
        this.getKeyFieldsByStructureId(params?.moduleId, params?.structureId, '');
      }
    });

    this.createNewConditionForm();
    this.getBusinessRuleList('BR_LOOKUP_RULE', '');
    this.getBusinessRuleList('BR_CUSTOM_SCRIPT', '');

    this.keyFieldSearchSub.pipe(debounceTime(300)).subscribe((data) => {
      this.getKeyFieldsByStructureId(this.structureDetails.moduleId, this.structureDetails.structureId, data.s || '');
    });

    this.fieldDropvalueSearchSub.subscribe((data) => {
      let fieldId;
      if (data.type === 'source') {
        fieldId = this.source.at(data.index).get('fieldCtrl').value.fieldId;
      } else {
        fieldId = this.target.at(data.index).get('fieldCtrl').value.fieldId;
      }
      this.getFieldListValues(fieldId, data.s, data.type);
    });

    this.activatedRoute.queryParams.subscribe((queryParam) => {
      this.structureDetails.structureDesc = queryParam?.structureDesc ? queryParam?.structureDesc : '';

      if (queryParam?.conditionId) {
        this.patchConditionValue(queryParam);
      }
    });

    this.newConditionFormGroup
      .get('triggerConId')
      .valueChanges.pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe((res) => {
        this.getBusinessRuleList('BR_CUSTOM_SCRIPT', res?.brInfo || res);
      });

    this.searchSub.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchString) => {
      this.selectedStructureFieldsObs = searchString
        ? of(this._filter(searchString))
        : of(this.selectedStructureFields.slice());
    });

    this.addMappedFields();
  }

  addMappedFields() {
    this.autoExtensionService.structureFieldSelected$.subscribe((field: FieldMetaData) => {
      if (field) {
        let currentMapping = new currentConditionMapping();
        const index = this.mappingsFieldValue.findIndex((mapping) => mapping.fieldId === field.fieldId);
        if (index > -1) {
          currentMapping = { ...this.mappingsFieldValue[index] };
          const lookupRule =
            currentMapping.mappingType === 'LOOKUP'
              ? this.businessRulesList.find((data) => data.brId === +currentMapping.ruleId)
              : '';
          const mappingType = this.fieldMappingRules.find((rule) => rule.ruleValue === currentMapping.mappingType);
          this.createMappingGroup({ ...currentMapping, lookupRule, mappingType });
        } else {
          currentMapping.fieldId = field.fieldId;
          currentMapping.fieldCtrl = {
            ...field
          };
          this.createMappingGroup(currentMapping);
          this.mappingsField.push(this.addMappingField(currentMapping));
        }
        this.autoExtensionService.nextSelectedStructureField(null);
      }
    });
  }

  patchConditionValue(queryParam) {
    this.structureDetails.conditionId = queryParam?.conditionId;
    const conditionValue = this.autoExtensionService.getEditConditionValue(queryParam?.conditionId);
    if (conditionValue) {
      if (conditionValue.mappings.length) {
        conditionValue.mappings.forEach((mapping) => {
          this.mappingsField.push(this.addMappingField(mapping));
        });
      }
      if (conditionValue.source.length) {
        conditionValue.source.forEach((source) => {
          this.source.push(this.addSource(source));
        });
      }
      if (conditionValue.target.length) {
        conditionValue.target.forEach((target) => {
          this.target.push(this.addSource(target));
        });
      }
      this.newConditionFormGroup.patchValue({
        enable: conditionValue.enable,
        name: conditionValue.name,
        triggerConId: conditionValue.triggerConId
      });
    } else {
      this.addSourceField();
      this.addTargetField();
    }
  }

  addMappingField(currentMapping): FormGroup {
    return this.fb.group({
      fieldCtrl: [currentMapping?.fieldCtrl ? currentMapping?.fieldCtrl : {}],
      fieldId: [currentMapping?.fieldId ? currentMapping?.fieldId : ''],
      mappingType: [currentMapping?.mappingType ? currentMapping?.mappingType : '', Validators.required],
      ruleId: [currentMapping?.ruleId ? currentMapping?.ruleId : ''],
      value: [currentMapping?.value ? currentMapping?.value : '']
    });
  }

  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.selectedStructureFields.filter((field) => field?.description?.toLowerCase().indexOf(filterValue) === 0);
  }

  createMappingGroup(mappingValue) {
    this.mappingFormGroup = this.fb.group({
      fieldId: [mappingValue?.fieldId],
      fieldCtrl: [mappingValue?.fieldCtrl],
      mappingType: [mappingValue?.mappingType, Validators.required],
      value: [mappingValue?.value],
      ruleId: [mappingValue.ruleId],
      lookupRule: [mappingValue.lookupRule]
    });

    this.mappingFormGroup
      .get('lookupRule')
      .valueChanges.pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe((res) => {
        this.getBusinessRuleList('BR_LOOKUP_RULE', res?.brInfo || res);
      });
  }

  onScroll() {
   // this.fetchSize = this.fetchSize + 1;
   // this.getStructureFields();
  }

  getStructureFields() {
    this.ruleService
      .getStructureFields(
        this.locale,
        this.structureDetails.moduleId,
        this.fetchSize - 1,
        0,
        +this.structureDetails.structureId
      )
      .subscribe(
        (respFields: FieldMetaData[]) => {
          if (respFields.length) {
            this.selectedStructureFields.push(...respFields);
            const filteredStructureList = uniqBy(this.selectedStructureFields, 'fieldId');
            this.selectedStructureFieldsObs = (filteredStructureList.length) ? of(filteredStructureList) : of(this.selectedStructureFields);
          }
        },
        (error) => {
          console.log('Error:', error);
          if (this.fetchSize !== 1) {
            this.fetchSize--;
          }
          if (!this.selectedStructureFields.length) {
            this.snackBar.open(`Something went wrong while fetching the structure field list!`, 'Close', { duration: 1000 });
          }
        }
      );
  }

  createNewConditionForm() {
    this.newConditionFormGroup = this.fb.group({
      name: ['', Validators.required],
      enable: [true],
      source: this.fb.array([]),
      target: this.fb.array([]),
      mappings: this.fb.array([]),
      triggerConId: ['']
    });

    if (this.structureDetails.type === 'new') {
      this.addTargetField();
      this.addSourceField();
    }
  }

  get target(): FormArray {
    return this.newConditionFormGroup.get('target') as FormArray;
  }

  get source(): FormArray {
    return this.newConditionFormGroup.get('source') as FormArray;
  }

  get mappingsField(): FormArray {
    return this.newConditionFormGroup.get('mappings') as FormArray;
  }

  get mappingsFieldValue() {
    return this.mappingsField.value;
  }

  addTargetField() {
    this.target.push(this.addTarget());
  }

  addSourceField() {
    this.source.push(this.addSource());
  }

  removeTargetField(index: number) {
    if (index !== 0) {
      this.target.removeAt(index);
    } else {
      this.target.at(index).patchValue({
        fieldCtrl: null,
        fieldId: '',
        valueCtrl: null
      });
    }
  }

  removeSourceField(index: number) {
    if (index !== 0) {
      this.source.removeAt(index);
    } else {
      this.source.at(index).patchValue({
        fieldCtrl: null,
        fieldId: '',
        valueCtrl: null
      });
    }
  }

  addTarget(targetValue?): FormGroup {
    return this.fb.group({
      fieldCtrl: [targetValue?.fieldCtrl ? targetValue?.fieldCtrl : {}],
      fieldId: [targetValue?.fieldId ? targetValue?.fieldId : ''],
      order: [targetValue?.order ? targetValue?.order : 0],
      value: [targetValue?.value ? targetValue?.value : ''],
      valueCtrl: [targetValue?.valueCtrl ? targetValue?.valueCtrl : {}]
    });
  }

  addSource(sourceValue?): FormGroup {
    return this.fb.group({
      fieldCtrl: [sourceValue?.fieldCtrl ? sourceValue?.fieldCtrl : {}],
      fieldId: [sourceValue?.fieldId ? sourceValue?.fieldId : ''],
      order: [sourceValue?.order ? sourceValue?.order : 0],
      value: [sourceValue?.value ? sourceValue?.value : ''],
      valueCtrl: [sourceValue?.valueCtrl ? sourceValue?.valueCtrl : {}]
    });
  }

  initKeyFieldList(type, i?) {
    this.keyFieldSearchSub.next({ s: '', type, ...((i === 0 || i) && { index: i }) });
  }

  initDropValueList(type, i?) {
    this.fieldDropvalueSearchSub.next({ s: '', type, ...((i === 0 || i) && { index: i }) });
  }

  getKeyFieldsByStructureId(moduleId, structureId, searchTerm) {
    this.keyFieldLoading = true;
    this.coreService.getKeyFieldsByStructureId(moduleId, structureId, 0, 10, searchTerm || '').subscribe(
      (response: Fieldlist[]) => {
        this.keyFieldLoading = false;
        if (response.length) {
          if (!searchTerm) {
            this.keyFieldList = response;
          }
          this.keyFieldsListObs = of(response);
        }
      },
      (error) => {
        console.log('Error:', error);
        this.keyFieldsListObs = of([]);
        this.keyFieldLoading = false;
      });
  }

  getFieldListValues(fieldId, searchString, fieldType) {
    const dto: { searchString: string; parent: any } = {
      searchString,
      parent: {}
    };
    this.valueFieldLoading = true;
    this.ruleService
      .getDropvals(this.structureDetails.moduleId, fieldId, this.locale, dto)
      .pipe(take(1))
      .subscribe(
        (resp: ListValueResponse) => {
          this.valueFieldLoading = false;
          this.fieldDropValueList = [];
          if (resp.content.length > 0) {
            const content = resp.content.map((dropValue) => {
              return {
                code: dropValue.code,
                text: dropValue.text
              };
            });

            fieldType === 'source'
              ? content.push({
                  code: 'NONE',
                  text: 'none'
                })
              : content.push({
                  code: 'ALL',
                  text: 'all'
                });

            let filteredValues;
            if (this.target.value.length || this.source.value.length) {
              filteredValues = content.filter(
                (data) =>
                  this.target.value.every((data1) => data1.valueCtrl.code !== data.code) &&
                  this.source?.value.every((data1) => data1.valueCtrl.code !== data.code)
              );
            } else {
              filteredValues = [...content];
            }
            this.fieldDropValueList.push(...filteredValues);
          }
        },
        (error) => {
          this.fieldDropValueList = [];
          this.valueFieldLoading = false;
          console.log('Error:', error);
        },
        () => {
          this.fieldDropValuesSub = of(this.fieldDropValueList);
          this.valueFieldLoading = false;
        }
      );
  }

  lookupRuleSelected($event) {
    const index = this.findCurrentMappingFieldId();
    if (index > -1) {
      this.mappingsField.at(index).get('ruleId').setValue($event.option.value.brIdStr);
    }
  }

  applyMappingValue() {
    const index = this.findCurrentMappingFieldId();
    if (index > -1) {
      this.mappingsField.at(index).get('value').setValue(this.mappingFormGroup.get('value').value);
    }
  }

  findCurrentMappingFieldId(): number {
    const fieldId = this.mappingFormGroup.get('fieldId')?.value;
    const index = this.mappingsFieldValue.findIndex((mapping) => mapping.fieldId === fieldId);
    return index;
  }

  mappedFields() {
    this.isMappedFieldsSelected = !this.isMappedFieldsSelected;
    if (this.isMappedFieldsSelected) {
      const mappedFieldList = this.mappingsFieldValue?.map((field) => field.fieldCtrl);
      this.selectedStructureFieldsObs = of(mappedFieldList);
    } else {
      this.selectedStructureFields = [];
      this.fetchSize = 1;
      this.getStructureFields();
    }
    this.mappingFormGroup = undefined;
  }

  displayFieldFn(field): string {
    return field?.shortText?.[this.locale]?.description ? field?.shortText[this.locale]?.description || '' : (field?.fieldDesc ? field?.fieldDesc : '');
  }

  displayDropvalueFn(obj): string {
    return obj ? (obj.text || obj.code ? obj.text || obj.code : '') : '';
  }

  displayFieldMappingRule(rule: { ruleLabel: string; ruleValue: string }) {
    return rule ? rule.ruleLabel : '';
  }

  displayLookupRule(rule) {
    return rule ? rule?.brInfo : '';
  }

  selectedFieldMappingRule($event) {
    const index = this.findCurrentMappingFieldId();
    if (index > -1) {
      this.mappingsField.at(index).get('mappingType').setValue($event.option.value.ruleValue);
    }
  }

  sourceFieldIdSelected($event, index) {
    const fieldValue = $event.option.value;
    const source = this.source.at(index) as FormGroup;
    source.patchValue({
      fieldId: fieldValue.fieldId,
      fieldCtrl: {
        ...fieldValue
      },
      order: index
    });
  }

  targetKeyFieldSelected($event, index) {
    const fieldValue = $event.option.value;
    const target = this.target.at(index) as FormGroup;
    target.patchValue({
      fieldId: fieldValue.fieldId,
      fieldCtrl: {
        ...fieldValue
      },
      order: index
    });
  }

  targetKeyFieldValueSelected($event, index) {
    const fieldValue = $event.option.value;
    const target = this.target.at(index) as FormGroup;
    target.patchValue({
      value: fieldValue.code,
      valueCtrl: {
        code: fieldValue.code,
        text: fieldValue.text
      }
    });
  }

  sourceFieldValueSelected($event, index) {
    const fieldValue = $event.option.value;
    const source = this.source.at(index) as FormGroup;
    source.patchValue({
      value: fieldValue.code,
      valueCtrl: {
        code: fieldValue.code,
        text: fieldValue.text
      }
    });
  }

  getBusinessRuleList(ruleType, searchString) {
    this.ruleService
      .getBrListDaxeUdr(ruleType, 0, 25, this.structureDetails.moduleId, searchString)
      .subscribe((response) => {
        if (!searchString) {
          ruleType === 'BR_LOOKUP_RULE' ? (this.businessRulesList = response) : (this.UDRRuleList = response);
          if (this.UDRRuleList.length && this.newConditionFormGroup?.value?.triggerConId) {
            const udrRule = this.UDRRuleList.find(
              (rule) => rule.brIdStr === this.newConditionFormGroup?.value?.triggerConId
            );
            if (udrRule) {
              this.newConditionFormGroup.patchValue({
                triggerConId: udrRule
              });
            }
          }
        }
        ruleType === 'BR_LOOKUP_RULE' ? (this.businessRulesObs = of(response)) : (this.udrRulesObs = of(response));
      });
  }

  onSave() {
    this.submitted = true;
    if (this.newConditionFormGroup.valid) {
      const payload = {
        ...this.newConditionFormGroup.value,
        triggerConId: this.newConditionFormGroup.value.triggerConId?.brIdStr
      };
      if (this.structureDetails.type !== 'new') {
        this.autoExtensionService.updateRow(this.structureDetails.conditionId, payload);
      } else {
        this.autoExtensionService.addRow(payload);
      }
      this.submitted = false;
      this.snackBar.open(`Successfully saved !`, 'Close', { duration: 3000 });
      this.close();
    } else {
      this.submitted = false;
      this.showValidationError('Please fill the required fields');
    }
  }

  showValidationError(message: string) {
    this.validationError.status = true;
    this.validationError.message = message;
    setTimeout(() => {
      this.validationError.status = false;
    }, 3000);
  }

  close() {
    this.router.navigate([{ outlets: { sb3: null } }], {
      queryParams: null,
      queryParamsHandling: 'preserve'
    });
  }
}
