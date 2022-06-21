import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldsListByPickListPayload, PicklistFieldsMetadata } from '@models/core/coreModel';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { Metadata } from '@modules/report/edit/container/metadatafield-control/metadatafield-control.component';
import { NumberSettingSavePayload } from '@modules/transaction/model/transaction';
import { CoreCrudService } from '@services/core-crud/core-crud.service';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { SchemaService } from '@services/home/schema.service';
import { TransientService } from 'mdo-ui-library';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
  selector: 'pros-number-settings-form',
  templateUrl: './number-settings-form.component.html',
  styleUrls: ['./number-settings-form.component.scss'],
})
export class NumberSettingsFormComponent implements OnInit, OnDestroy {

  moduleId: string;
  currentNumberSettingId: string;
  submitted = false;
  selectedCriteriaFields = [];
  selectedFieldDropValues = [];
  numberSettingsForm: FormGroup;
  fieldValuesForm: FormArray = new FormArray([]);

  separatorKeysCodes: number[] = [ENTER, COMMA];

  fieldsList: PicklistFieldsMetadata[] = [];
  filteredFldsList: Observable<{} | string | void> = of([]);

  prefixFieldList = [];
  prefixListObs: Observable<any> = of([]);

  suffixFieldList = [];
  suffixListObs: Observable<any> = of([]);

  fieldSearchSub: Subject<{s: string, inputType: string}> = new Subject();

  fieldDropValuesList = [];
  filteredFldDropValues: Observable<{} | string | void> = of([]);

  alternateNumberFieldList = [];
  alternateNumberFieldObs = of([]);

  dataSource = null;
  treeControl = null;
  hasChild = null;
  @ViewChild('fieldsInput') fieldsInput: ElementRef;
  @ViewChild('fieldsInput1') fieldsInput1: ElementRef;

  searchFieldVal: Subject<string> = new Subject();

  subscriptions = [];
  errorMsg = '';
  prefixHelpTxt = 'For data integrity reasons, we do not allow prefix changes in an active number settings. To use a different prefix for the same field value combinations, please create a new number settings and then deactivate the outdated settings.';
  prefixMenuOpen: boolean;
  suffixMenuOpen: boolean;
  generatedNumberMenuOpen: boolean;

  constructor(
    private router: Router,
    public readonly route: ActivatedRoute,
    private coreService: CoreService,
    private transientService: TransientService,
    private schemaService: SchemaService,
    private coreCrudService: CoreCrudService,
    private globalDialogService: GlobaldialogService,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  ngOnInit(): void {
    this.createForm();
    this.addBlocks();
    this.subscriptions.push(this.route.params.pipe().subscribe((resp) => {
      if (this.moduleId !== resp.moduleId) {
        this.getFieldsListByPickList(resp.moduleId);
        this.getFieldsByModuleId(resp.moduleId,'');
        this.getAlternateNumberFields();
      }
      this.moduleId = resp.moduleId;
      if (resp?.id && resp.id !== 'new') {
        this.currentNumberSettingId = resp.id;
        this.getCurrentNumberSettingDetails(resp.id)
      }
    }));
    this.subscriptions.push(this.numberSettingsForm.get('fieldValue').valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe((searchStr) => {
      if (!searchStr) {
        this.resetMultiselectDropList();
      } else {
        this.getFieldDropvalues(this.selectedCriteriaFields[0].fieldId, 'field1', searchStr);
      }
    }));

    this.subscriptions.push(this.searchFieldVal.pipe(distinctUntilChanged(), debounceTime(300)).subscribe((str) => {
      console.log(str);
    }));

    this.fieldValuesForm.valueChanges.subscribe((res) => {
      console.log(res);
    });

    this.fieldSearchSub.pipe(
      debounceTime(300)
    ).subscribe(data => {
      this.getFieldsByModuleId(this.moduleId, data.s || '', data.inputType);
    });
  }


  displayFieldFn(obj): string {
    if (obj) {
      return obj.fieldDescri ? obj.fieldDescri : obj.fieldDesc ? obj.fieldDesc : obj.fieldId;
    }
    return '';
  }

  getFieldsByModuleId(moduleId, searchString, inputType?) {
    this.coreService.getMetadataFieldsByModuleId([moduleId], searchString).subscribe((metadataModeleResponse: MetadataModeleResponse) => {
      this.parseMetadataModelResponse(metadataModeleResponse,inputType);
    }, (err) => {
      console.error(`Error:: ${err.message}`);
    });
  }

  initFieldsList(inputValue, inputType: string) {
    this.fieldSearchSub.next({ s: inputValue || '', inputType });
  }

  parseMetadataModelResponse(response: MetadataModeleResponse, inputType: string) {
    const fldGroups = [];
    // for header
    const headerChilds: Metadata[] = [];
    if (response.headers) {
      Object.keys(response.headers).forEach((header) => {
        const res = response.headers[header];
        headerChilds.push({
          fieldId: res.fieldId,
          fieldDescri: res.fieldDescri,
          isGroup: false,
          childs: [],
          moduleId: this.moduleId,
        });
      });
    }
    fldGroups.push({
      fieldId: 'header_fields',
      fieldDescri: 'Header fields',
      isGroup: true,
      childs: headerChilds,
      moduleId: this.moduleId,
    });

    // for grid response transformations
    if (response && response.grids) {
      const childs: Metadata[] = [];
      Object.keys(response.grids).forEach((grid) => {
        if (response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach((fld) => {
            const fldCtrl = response.gridFields[grid][fld];
            childs.push({
              fieldId: fldCtrl.fieldId,
              fieldDescri: fldCtrl.fieldDescri,
              isGroup: false,
              childs: [],
              moduleId: this.moduleId,
            });
          });
        }
        fldGroups.push({
          fieldId: grid,
          fieldDescri: response.grids[grid].fieldDescri,
          isGroup: true,
          childs,
          moduleId: this.moduleId,
        });
      });
    }

    // for hierarchy response transformations
    if (response && response.hierarchyFields) {
      const childs: Metadata[] = [];
      Object.keys(response.hierarchyFields).forEach((hkey) => {
        Object.keys(response.hierarchyFields[hkey]).forEach((fld) => {
          const fldCtrl = response.hierarchyFields[hkey][fld];
          childs.push({
            fieldId: fldCtrl.fieldId,
            fieldDescri: fldCtrl.fieldDescri,
            isGroup: false,
            childs: [],
            moduleId: this.moduleId,
          });
        });
        fldGroups.push({
          fieldId: `Hierarchy_${hkey}`,
          fieldDescri: `Hierarchy ${hkey}`,
          isGroup: true,
          childs,
          moduleId: this.moduleId,
        });
      });
    }

    if (inputType === 'suffix') {
      this.suffixFieldList = fldGroups;
      this.suffixListObs = of(this.suffixFieldList);
    } else if (inputType === 'prefix') {
      this.prefixFieldList = fldGroups;
      this.prefixListObs = of(this.prefixFieldList);
    }
  }

  getCurrentNumberSettingDetails(id: string) {
    this.subscriptions.push(this.coreCrudService.getNumberSettingDetails(this.moduleId, id).subscribe((res) => {
      if (res) {
        this.numberSettingsForm.patchValue({
          ruleName: res.description,
          description: res.details,
          length: res.length,
          prefix: res.prefix,
          isDefaultSetting: res.isDefault,
          rangeStart: res.rangeStart,
          rangeEnd: res.rangeEnd,
          prefixType: res.prefixType,
          suffixType: res.suffixType,
          suffix: res.suffix
        });

        this.updateValidators();

        if (res.criteriaDetails.length) {
          const keys = Object.keys(res.criteriaDetails[0]);
          keys.forEach((fieldId) => {
            const fieldCtrl = res.fieldCtrl[fieldId];
            if (fieldCtrl && fieldCtrl?.description) {
              this.selectField({option: {value: fieldId, viewValue: fieldCtrl?.description}});
            }
          });
          if (keys.length > 1) {
            this.setCurrentFieldValues(res.criteriaDetails, keys);
          } else {
            res.criteriaDetails.forEach((fld) => {
              this.selectedFieldDropValues.push({
                text: fld[keys[0]],
                code: fld[keys[0]]
              });
            });
          }
        }
        if (res.suffixType === 'FIELD' && res.suffixField) {
          const fieldCtrl = res.fieldCtrl[res.suffixField];
          this.numberSettingsForm.patchValue({
            suffixField: {fieldId: fieldCtrl.fieldId, fieldDescri: fieldCtrl.description, moduleId:fieldCtrl.moduleId.toString()}
          })
        }

        if (res.prefixType === 'FIELD' && res.prefixField) {
          const fieldCtrl = res.fieldCtrl[res.prefixField];
          this.numberSettingsForm.patchValue({
            prefixField: {fieldId: fieldCtrl.fieldId, fieldDescri: fieldCtrl.description, moduleId:fieldCtrl.moduleId.toString()}
          })
        }

        if (res.suffixField || res.suffix) {
          this.numberSettingsForm.get('suffixField').disable();
        }

        if (res.prefix || res.prefixField) {
          this.numberSettingsForm.get('prefixField').disable();
        }
      }
    }, (err) => {
      console.log(err);
    }));
  }

  getAlternateNumberFields() {
    this.subscriptions.push(this.coreService.getAlternateNumberField().subscribe(res => {
      if (res) {
        this.alternateNumberFieldObs = of(res);
      }
    }, error => {
      console.log('Error',error)
      this.alternateNumberFieldObs = of([]);
      this.showErrBanner(error?.error?.errorMsg || 'Something went wrong!!!');
    }))
  }

  setCurrentFieldValues(values, keys) {
    for (let i=1; i<values.length; i++) {
      this.addBlocks();
    }

    const formArr = this.fieldValuesForm as FormArray;
    values.forEach((val, ind) => {
      const formGrp = formArr.controls[ind] as FormGroup;
      formGrp.get('field1Val').setValue({code: val[keys[0]], text: val[keys[0]]});
      formGrp.get('field2Val').setValue({code: val[keys[1]], text: val[keys[1]]});
      if (keys.length > 2) {
        formGrp.get('field3Val').setValue({code: val[keys[2]], text: val[keys[2]]});
      }
    });
  }



  getFieldsListByPickList(moduleId: string = this.moduleId, searchStr = '') {
    const payload: FieldsListByPickListPayload = {
      description: searchStr,
      pickList: '1'
    };

    this.subscriptions.push(
      this.coreService.getAllNumberSettingsFields(moduleId, this.locale).subscribe(
        (res) => {this.showErrMsg(res?.errorMsg);

          const fldList = res.map((field) => {
            return {
              description: field?.fieldDesc || field?.description,
              fieldId: field?.fieldId,
              maxChar: field?.maxChar,
            };
          });
          this.fieldsList = fldList;
          this.filteredFldsList = of(fldList);
        },
        (err) => {
          this.filteredFldsList = of(this.fieldsList);
          this.showErrBanner(err?.error?.errorMsg || 'Something went wrong!!!');
        }
      )
    );
  }

  getFieldDropvalues(fldId, fldName = 'field1', searchStr = '') {
    if (!fldId) {
      return;
    }

    this.subscriptions.push(this.schemaService.getFieldDropValues(this.moduleId, fldId, searchStr, 0, 50).subscribe((res) => {
      const values = res || [];
      if (!searchStr) {
        this.fieldDropValuesList.push(values);
        this.resetMultiselectDropList();
      } else {
        this.filteredFldDropValues = of(values);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  createForm() {
    this.numberSettingsForm = new FormGroup({
      fields: new FormControl(''),
      ruleName: new FormControl('', Validators.required),
      description: new FormControl(''),
      length: new FormControl(undefined, Validators.required),
      prefix: new FormControl(''),
      suffix: new FormControl(''),
      isDefaultSetting: new FormControl(false),
      fieldValue: new FormControl(''),
      rangeStart: new FormControl(undefined, Validators.required),
      rangeEnd: new FormControl(undefined, Validators.required),
      prefixType: new FormControl('VALUE'),
      suffixType: new FormControl('VALUE'),
      altnField: new FormControl(''),
      prefixField: new FormControl(''),
      suffixField: new FormControl('')
    });

    this.updateValidators();

    this.subscriptions.push(
      this.numberSettingsForm
        .get('fields')
        .valueChanges.pipe(distinctUntilChanged(), debounceTime(300))
        .subscribe((searchStr) => {
          if (!searchStr) {
            this.filteredFldsList = of(this.fieldsList);
          } else {
            this.filteredFldsList = of(this.filterFieldList(searchStr));
          }
        })
    );
  }

  filterFieldList(search) {
    return this.fieldsList.filter(field => field.description.toLowerCase().includes(search?.toLowerCase()));
  }

  updateValidators() {
    this.numberSettingsForm.get('prefixType').value === 'VALUE'
      ? this.addValidation('prefix')
      : (this.addValidation('prefixField'), this.removeValidation('prefix'));

    this.numberSettingsForm.get('suffixType').value === 'VALUE'
      ? (this.addValidation('suffix'), this.removeValidation('suffixField'))
      : (this.addValidation('suffixField'), this.removeValidation('suffix'));
  }

  staticPrefixToggle($event) {
    $event
      ? this.numberSettingsForm.get('prefixType').setValue('VALUE')
      : this.numberSettingsForm.get('prefixType').setValue('FIELD');
    this.updateValidators();
  }

  staticSuffixToggle($event) {
    $event
      ? this.numberSettingsForm.get('suffixType').setValue('VALUE')
      : this.numberSettingsForm.get('suffixType').setValue('FIELD')
    this.updateValidators();
  }

  addValidation(fieldType) {
    if (fieldType === 'prefix') {
      this.numberSettingsForm.get(fieldType).setValidators([Validators.pattern('^[a-zA-Z0-9]*')]);
    }
    if(fieldType === 'suffix') {
      this.numberSettingsForm.get(fieldType).setValidators([Validators.pattern('^[a-zA-Z0-9]*')]);
    } else {
      this.numberSettingsForm.get(fieldType).setValidators([Validators.required]);
    }
    this.numberSettingsForm.get(fieldType).updateValueAndValidity();
  }

  removeValidation(fieldType) {
    this.numberSettingsForm.get(fieldType).setValidators(null);
    this.numberSettingsForm.get(fieldType).clearValidators();
    this.numberSettingsForm.get(fieldType).updateValueAndValidity();
  }

  addBlocks() {
    const newVal = new FormGroup({
      field1Val: new FormControl('', Validators.required),
      field2Val: new FormControl('', Validators.required),
      field3Val: new FormControl('')
    });
    this.fieldValuesForm.push(newVal);
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }])
  }

  applyValidators() {
    if (!this.numberSettingsForm.valid) {
      return false;
    }

    if (this.isDecimal(this.numberSettingsForm.value.length)) {
      this.showErrBanner('Length cannot be a decimal value');
      return false;
    }

    if (parseInt(this.numberSettingsForm.get('length').value, 10) <= this.numberSettingsForm.get('prefix')?.value?.length) {
      this.showErrBanner('Length should be greater than the prefix length');
      return false;
    }

    if (this.isDecimal(this.numberSettingsForm.value.rangeStart) || this.isDecimal(this.numberSettingsForm.value.rangeEnd)) {
      this.showErrBanner('Range cannot be a decimal value');
      return false;
    }

    if (parseInt(this.numberSettingsForm.get('rangeEnd').value, 10) <= parseInt(this.numberSettingsForm.get('rangeStart').value, 10)) {
      this.showErrBanner('End range should be greater than the start range');
      return false;
    }

    if (this.selectedCriteriaFields.length<=0) {
      this.showErrBanner('Criteria fields cannot be empty');
      return false;
    }

    if (this.selectedCriteriaFields.length > 1 && this.fieldValuesForm.value.length > 0) {
      let isValid = true;
      let isEmpty = false;
      const mergedValues = [];
      this.fieldValuesForm.value.forEach((row, fieldInd) => {
        this.markFieldRowAsDuplicate(fieldInd, null);
        const keys = Object.keys(row);
        let mergedVal = '';
        keys.forEach((key, ind) => {
          if (ind === 2 && this.selectedCriteriaFields.length < 3) {
            return;
          }

          if (isValid) {
            if (row[key]?.code) {
              mergedVal =  row[key]?.code ? `${mergedVal}///${row[key]?.code}` : mergedVal;
            } else {
              isValid = false;
              isEmpty = true;
            }
          }
        });
        if (mergedValues.includes(mergedVal)) {
          isValid = false;
          this.markFieldRowAsDuplicate(fieldInd, {notUnique: true});
        }
        mergedValues.push(mergedVal);
      });

      if (isEmpty) {
        this.showErrBanner('Field values cannot be empty');
        return false;
      }

      if (!isValid) {
        this.showErrBanner('Please remove repeated field values combination');
        return false;
      }
    } else if (this.selectedCriteriaFields.length === 1 && !this.selectedFieldDropValues.length) {
      this.showErrBanner('Field values cannot be empty');
      return false;
    }

    if (this.selectedCriteriaFields.length > 1 && !this.fieldValuesForm.valid) {
      return false;
    }

    return true;
  }

  markFieldRowAsDuplicate(index, error) {
    const formGrp = this.fieldValuesForm.controls[index];
    formGrp.get('field1Val').setErrors(error);
    formGrp.get('field2Val').setErrors(error);
    formGrp.get('field3Val').setErrors(error);
  }

  isDecimal(val) {
    const num = parseFloat(val);
    return !(Math.floor(num) === num);
  }

  save() {
    this.errorMsg = '';
    this.submitted = true;
    const valid = this.applyValidators();

    if (!valid) {
      return;
    }

    const req = new NumberSettingSavePayload();

    if (this.currentNumberSettingId) {
      req.uuid = this.currentNumberSettingId;
    }
    req.moduleId = this.moduleId;
    req.description = this.numberSettingsForm.get('ruleName').value;
    req.details = this.numberSettingsForm.get('description').value;
    req.length = parseInt(this.numberSettingsForm.get('length').value, 10);
    req.prefix = this.numberSettingsForm.get('prefix').value;
    req.isDefault = this.numberSettingsForm.get('isDefaultSetting').value;
    req.rangeStart = parseInt(this.numberSettingsForm.get('rangeStart').value, 10);
    req.rangeEnd = parseInt(this.numberSettingsForm.get('rangeEnd').value, 10);
    req.suffix = this.numberSettingsForm.get('suffix').value;
    req.suffixType = this.numberSettingsForm.get('suffixType').value;
    req.prefixType = this.numberSettingsForm.get('prefixType').value;
    req.suffixField = this.numberSettingsForm.get('suffixField').value?.fieldId && req.suffixType === 'FIELD' ? this.numberSettingsForm.get('suffixField').value?.fieldId : '';
    req.prefixField = this.numberSettingsForm.get('prefixField').value?.fieldId && req.prefixType === 'FIELD' ? this.numberSettingsForm.get('prefixField').value?.fieldId : '';
    req.altnField = this.numberSettingsForm.get('altnField').value?.fieldId ? this.numberSettingsForm.get('altnField').value?.fieldId : '';

    // default values
    req.isUserInput = false;

    if (req.regexPattern) {
      req.isUserInput = true;
    }

    const criteriaDetails = [];
    if (this.selectedCriteriaFields.length === 1) {
      this.selectedFieldDropValues.forEach((fld) => {
        const obj = new Object();
        obj[this.selectedCriteriaFields[0].fieldId] = fld.code;
        criteriaDetails.push(obj);
      });
    } else {
      const fieldValues = this.fieldValuesForm.value;
      fieldValues.forEach((row) => {
        const obj = new Object();
        const keys = Object.keys(row);
        keys.forEach((key, ind) => {
          if (this.selectedCriteriaFields[ind]?.fieldId && row[key]?.code) {
            obj[this.selectedCriteriaFields[ind]?.fieldId] = row[key]?.code;
          }
        });
        criteriaDetails.push(obj);
      });
    }
    req.criteriaDetails = criteriaDetails;

    this.subscriptions.push(this.coreCrudService.saveUpdateNumberSetting(req).subscribe((res) => {
      if (res.acknowledge === true) {
        this.showErrMsg('Number settings saved successfully');
        this.close();
        if (this.currentNumberSettingId) {
          this.coreCrudService.setNumberSettingChange('update', res.uuid);
        } else {
          this.coreCrudService.setNumberSettingChange('add', res.uuid);
        }
      }
    }, (err) => {
      this.showErrBanner((err?.error?.errorMsg || 'Something went wrong!!!'));
    }));
  }

  modifyCriteriaFields(type, event, index) {
    let getConfirmation = (this.selectedCriteriaFields.length === 1 && this.selectedFieldDropValues.length) ? true : false;

    if (this.selectedCriteriaFields.length > 1) {
      const values = this.fieldValuesForm.value;
      if (values.length > 1) {
        getConfirmation = true;
      } else {
        values.forEach((row) => {
          if (!getConfirmation) {
            const keys = Object.keys(row);
            keys.forEach((key) => {
              if (row[key]?.code) {
                getConfirmation = true;
              }
            });
          }
        });
      }
    }

    if (getConfirmation) {
      this.globalDialogService.confirm({ label: 'This will remove all the selected field values. Do you want to continue?' }, (response) => {
        if (response && response === 'yes') {
          this.clearFieldValues();
          this.updateCriteriaFields(type, event, index);
        }
      });
    } else {
      this.updateCriteriaFields(type, event, index);
    }
  }

  updateCriteriaFields(type, event, index) {
    if (type === 'add') {
      this.selectField(event);
    } else {
      this.remove(index);
    }
  }

  clearFieldValues() {
    this.selectedFieldDropValues = [];
    while (this.fieldValuesForm.length !== 0) {
      this.fieldValuesForm.removeAt(0);
    }
    this.addBlocks();
  }

  selectField(event) {
    if (this.selectedCriteriaFields.length >= 3) {
      this.showErrBanner('A maximum of three dropdown fields can be enabled for number settings');
    } else if (event?.option?.value) {
      const alreadyExists = this.selectedCriteriaFields.find(item => item.fieldId === event.option.value);
      if (alreadyExists) {
        this.showErrMsg('This field is already selected');
      } else {
        this.selectedCriteriaFields.push({
          description: event.option.viewValue,
          fieldId: event.option.value
        });
        this.getFieldDropvalues(event.option.value, `field${this.selectedCriteriaFields.length}`);
      }

    }

    this.numberSettingsForm.get('fields').patchValue('');
    const txtfield = document.getElementById('fieldsInput') as HTMLInputElement;
    if (txtfield) {
      txtfield.value = '';
    }
    if (this.fieldsInput) {
      this.fieldsInput.nativeElement.blur();
    }
  }

  selectFieldValue(event) {
    if (event?.option?.value) {
      const alreadyExists = this.selectedFieldDropValues.find(item => item.code === event.option.value);
      if (alreadyExists) {
        this.showErrMsg('This field is already selected');
      } else {
        this.selectedFieldDropValues.push({
          text: event.option.viewValue,
          code: event.option.value
        });
      }
    }

    this.numberSettingsForm.get('fieldValue').patchValue('');
    const txtfield = document.getElementById('fieldsInput1') as HTMLInputElement;
    if (txtfield) {
      txtfield.value = '';
    }
    if (this.fieldsInput1) {
      this.fieldsInput1.nativeElement.blur();
    }
  }

  displayFn(value) {
    return (value?.description || value?.text) || '';
  }

  clickTreeNode(node) {
    //
  }

  remove(index) {
    this.selectedCriteriaFields.splice(index, 1);
    this.fieldDropValuesList.splice(index, 1);
    this.resetMultiselectDropList();
  }

  resetMultiselectDropList() {
    this.filteredFldDropValues = of(this.fieldDropValuesList[0]);
  }

  removeFieldVal(index) {
    this.selectedFieldDropValues.splice(index, 1);
  }

  deleteBlock(index) {
    if (this.fieldValuesForm.value.length > 1) {
      this.fieldValuesForm.removeAt(index);
    }
  }

  /**
   * This closes  all open auto complete panels when user scrolls the screen by clicking on an empty element
   * @param el empty element
   */
  closeDropdowns(el) {
    el.click();
    try {
      const element: any = document.activeElement;
      element.blur();
    } catch (e) {
      console.log(e);
    }
  }

  showErrMsg(errMsg: string) {
    if (errMsg) {
      this.transientService.open(errMsg, null, { duration: 2000, verticalPosition: 'bottom'});
    }
  }

  showErrBanner(msg) {
    this.errorMsg = msg;
    setTimeout(() => {
      this.errorMsg = '';
    }, 5000);
  }

  exportTemplate() {
    if (this.selectedCriteriaFields.length < 1) {
      return;
    }
    const data = this.getCSVHeaders();
    this.downloadAsCSV(data);
  }

  getCSVHeaders() {
    const data = [];
    const obj = new Object();
    this.selectedCriteriaFields.forEach((fld) => {
      obj[fld.fieldId] = fld.description;
    });
    data.push(obj);

    return data;
  }

  downloadAsCSV(data, fileName?: string) {
    /* generate worksheet and workbook */
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Field Values');

    /* create an XLSX file and try to save to Presidents.xlsx */
    XLSX.writeFile(workbook, (fileName || 'Field_values_template.csv'));
  }

  exportToCSV() {
    if ((this.selectedCriteriaFields.length < 1) || (this.fieldValuesForm.value.length < 1)) {
      return;
    }

    const data = this.getCSVHeaders();
    const fieldValues = this.fieldValuesForm.value;
    fieldValues.forEach((row) => {
      const obj = new Object();
      const keys = Object.keys(row);
      keys.forEach((key, ind) => {
        if (this.selectedCriteriaFields[ind]?.fieldId && row[key]?.code) {
          obj[this.selectedCriteriaFields[ind]?.fieldId] = row[key]?.code || '';
        }
      });
      data.push(obj);
    });

    this.downloadAsCSV(data, 'Field_values.csv');
  }

  fileChange(evt, el) {
    if (evt !== undefined) {
      const target: DataTransfer = (evt.target) as unknown as DataTransfer;
      if (target.files.length !== 1) {
        this.showErrMsg('Cannot import multiple files');
        return;
      }
      // check file type
      let fileName = '';
      try {
        fileName = target.files[0].name;
      } catch (ex) {
        console.error(ex)
      }
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
          /* read workbook */
          const bstr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'array' });
          /* grab first sheet */
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];
          /* save data */
          const data = XLSX.utils.sheet_to_json(ws);
          this.importFromCSV(data);
          el.value = null;
        };
        reader.readAsArrayBuffer(target.files[0]);
      } else {
        this.showErrMsg('Unsupported file format, allowed file formats are .xlsx, .xls and .csv');
      }
    }
  }

  importFromCSV(data) {
    const headers = Object.keys(data[0]);
    let isValid = true;
    this.selectedCriteriaFields.forEach((fld) => {
      if (!headers.includes(fld.fieldId)) {
        isValid = false;
      }
    });

    if (this.selectedCriteriaFields.length !== headers.length) {
      isValid = false;
    }

    if (!isValid) {
      this.showErrMsg('Unable to import as the criteria fields are not matching');
    }

    const mergedVals = [];
    if (this.fieldValuesForm.value.length) {
      const fldValKeys = Object.keys(this.fieldValuesForm.value[0]);
      this.fieldValuesForm.value.forEach((val, ind) => {
        if (this.selectedCriteriaFields.length === 3 && (!val[fldValKeys[0]] && !val[fldValKeys[1]] && !val[fldValKeys[2]])) {
          this.fieldValuesForm.removeAt(ind);
        } else if (this.selectedCriteriaFields.length === 2 && (!val[fldValKeys[0]] && !val[fldValKeys[1]])) {
          this.fieldValuesForm.removeAt(ind);
        } else {
          mergedVals.push(`${val[fldValKeys[0]].code}///${val[fldValKeys[1]].code}///${val[fldValKeys[2]]?.code || ''}`);
        }
      });
    }

    const fields = this.selectedCriteriaFields;
    data.forEach((row, ind) => {
      if (ind !== 0) {
        const mergedVal = `${row[fields[0].fieldId] || ''}///${row[fields[1].fieldId] || ''}///${row[fields[2]?.fieldId] || ''}`;
        if (!mergedVals.includes(mergedVal)) {
          this.addBlocks();
          const insertInd = this.fieldValuesForm.value.length - 1;
          const formGrp = this.fieldValuesForm.controls[insertInd] as FormGroup;
          formGrp.get('field1Val').setValue({code: row[fields[0].fieldId], text: row[fields[0].fieldId]});
          formGrp.get('field2Val').setValue({code: row[fields[1].fieldId], text: row[fields[1].fieldId]});
          if (headers.length > 2) {
            formGrp.get('field3Val').setValue({code: row[fields[2].fieldId], text: row[fields[2].fieldId]});
          }
        }
      }
    });
  }

}
