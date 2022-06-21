import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '@services/home/schema.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { TransientService } from 'mdo-ui-library';
import { CoreService } from '@services/core/core.service';
import { BusinessRuleType } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { Subscription } from 'rxjs';

@Component({
    selector: 'pros-condition-sidesheet',
    templateUrl: './condition-sidesheet.component.html',
    styleUrls: ['./condition-sidesheet.component.scss']
})

export class ConditionSidesheetComponent implements OnInit, OnDestroy {

    submitted=false;
    selectedCondition: {};
    conditionCriteria: any = [];
    attributeFormat1 = [{key: 'NAME_VALUE',value:'Attribute name and value'},{key: 'VALUE' ,value:'Only Attribute value'}];
    storeClassificationTable: any = [];
    errorBanner = '';
    configurationConditionForm: FormGroup;
    selectedDescSettings = [];
    moduleId;
    locale = 'en';
    subscriptions: Subscription = new Subscription();
    constructor(private transientService: TransientService, private router: Router, private schemaService: SchemaService,private coreService: CoreService, private activatedRoute: ActivatedRoute) { }
    ngOnInit(): void {
        this.conditionCriteria = [];
        const routeSub = this.activatedRoute.params.subscribe(res => {
            this.moduleId = res.moduleId;
        });
        this.subscriptions.add(routeSub);

        const ruleSub = this.coreService.getDatasetBusinessRuleList(0, 50, {}).subscribe((res: any) => {
            this.storeClassificationTable = res?.content;
        },
        (error) => {
            console.error(`Error : ${error.message}`);
        });
        this.subscriptions.add(ruleSub);
        this.creatNewForm();

        const currentDescFieldSub = this.schemaService.currentDescFieldValues.subscribe(response => {
            const selectedDescSettingsArr = response||[];
            selectedDescSettingsArr.forEach(data => {
                if((data.pickList ==='1') || (data.pickList ==='4')){
                    this.getDropDownofPickList(data);
                }
            })
            this.selectedDescSettings = selectedDescSettingsArr
        })

        const conditionSub = this.schemaService.conditionSideSheetDataFunc().subscribe(response => {
            this.conditionCriteria = response;
        })
        this.subscriptions.add(conditionSub);
        if(this.conditionCriteria.length) {
            this.onClickOnListItem(this.conditionCriteria[0]);
        }

        this.subscriptions.add(currentDescFieldSub);
        const fromChangeSub = this.configurationConditionForm.valueChanges.pipe(debounceTime(1000), distinctUntilChanged(isEqual)).subscribe((data) => {
            const cond = 'conditionId';
            const index = this.conditionCriteria.findIndex(item => item.conditionId === this.selectedCondition[cond]);
            if (index > -1) {
                this.errorBanner = '';
                this.conditionCriteria[index] = {
                    conditionId: this.conditionCriteria[index].conditionId,
                    conditionName: this.conditionCriteria[index].conditionName,
                    field1: this.configurationConditionForm.controls.field1.value,
                    field2: this.configurationConditionForm.controls.field2.value,
                    nounModSep: this.configurationConditionForm.controls.nounModSep.value,
                    shortDescSep: this.configurationConditionForm.controls.shortDescSep.value,
                    longDescSep: this.configurationConditionForm.controls.longDescSep.value,
                    attSep: this.configurationConditionForm.controls.attSep.value || '',
                    attrFormatLongDesc: this.configurationConditionForm.controls.attrFormatLongDesc.value,
                    shortDescActive: this.configurationConditionForm.controls.shortDescActive.value || false,
                    longDescActive: this.configurationConditionForm.controls.longDescActive.value || false,
                    manuallyDesc: this.configurationConditionForm.controls.manuallyDesc.value || false,
                    classificationActive: this.configurationConditionForm.controls.classificationActive.value || false
                }
            }
        });

        this.subscriptions.add(fromChangeSub);
        if(this.conditionCriteria.length === 0) {
            this.conditionCriteria = [];
            this.addNewCondition();
        }
    }

    /**
     * method called when click on list items
     * @param filter filtered values for selected filters
     * @param ind index of selected value
     */
    onClickOnListItem(condition, ind?: number) {
        this.selectedCondition = condition;
        const index = this.conditionCriteria.findIndex(item => item.conditionId === condition.conditionId);
        this.configurationConditionForm.controls.field1.setValue(this.conditionCriteria[index].field1 ? this.conditionCriteria[index].field1 : '');
        this.configurationConditionForm.controls.field2.setValue(this.conditionCriteria[index].field2 ? this.conditionCriteria[index].field2 : '');
        this.configurationConditionForm.controls.nounModSep.setValue(this.conditionCriteria[index].nounModSep ? this.conditionCriteria[index].nounModSep : '');
        this.configurationConditionForm.controls.shortDescSep.setValue(this.conditionCriteria[index].shortDescSep ? this.conditionCriteria[index].shortDescSep : '');
        this.configurationConditionForm.controls.longDescSep.setValue(this.conditionCriteria[index].longDescSep ? this.conditionCriteria[index].longDescSep : '');
        this.configurationConditionForm.controls.attSep.setValue(this.conditionCriteria[index].attSep ? this.conditionCriteria[index].attSep : '');
        this.configurationConditionForm.controls.attrFormatLongDesc.setValue(this.conditionCriteria[index].attrFormatLongDesc ? this.conditionCriteria[index].attrFormatLongDesc : '');
        this.configurationConditionForm.controls.shortDescActive.setValue(this.conditionCriteria[index].shortDescActive ? this.conditionCriteria[index].shortDescActive : false);
        this.configurationConditionForm.controls.longDescActive.setValue(this.conditionCriteria[index].longDescActive ? this.conditionCriteria[index].longDescActive : false);
        this.configurationConditionForm.controls.manuallyDesc.setValue(this.conditionCriteria[index].manuallyDesc ? this.conditionCriteria[index].manuallyDesc : false);
        this.configurationConditionForm.controls.classificationActive.setValue(this.conditionCriteria[index].classificationActive ? this.conditionCriteria[index].classificationActive : false);
        this.configurationConditionForm.controls.field1.setValidators([Validators.required]);

        this.configurationConditionForm.controls.field1.updateValueAndValidity();
    }

    /**
     * method to add new condition
     */
    addNewCondition() {
        let index = 0;
        if (this.conditionCriteria.length) {
            index = this.conditionCriteria[this.conditionCriteria.length - 1].conditionId + 1;
        }
        this.conditionCriteria.push({ conditionId: index, conditionName: 'Condition ' + index });
        this.selectedCondition = this.conditionCriteria[this.conditionCriteria.length - 1];
        this.configurationConditionForm.reset();
    }

    creatNewForm() {
        this.configurationConditionForm = new FormGroup({
            field1: new FormControl(''),
            field2: new FormControl(''),
            nounModSep: new FormControl(''),
            shortDescSep: new FormControl(''),
            longDescSep: new FormControl(''),
            attSep: new FormControl(''),
            attrFormatLongDesc: new FormControl(''),
            shortDescActive: new FormControl(false),
            longDescActive: new FormControl(false),
            manuallyDesc: new FormControl(false),
            classificationActive: new FormControl(false)
        });
    }

    /**
     * method to remove selected condition
     * @param condition selected condition
     */
    removeSelectedCondition(condition) {
        this.transientService.confirm(
            {
                data: { dialogTitle: 'Confirmation', label: condition.conditionName + ' will be permanently deleted. Please confirm if you would like to delete the condition.' },
                disableClose: true,
                autoFocus: false,
                width: '600px',
                panelClass: 'create-master-panel',
            },
            (response) => {
                if (response && response === 'yes') {
                    const index = this.conditionCriteria.findIndex(item => item.conditionId === condition.conditionId);
                    if (index > -1) {
                        this.conditionCriteria.splice(index, 1);
                    }
                    const cond = this.conditionCriteria[this.conditionCriteria.length - 1];
                    this.onClickOnListItem(cond);
                } else {
                    return;
                }
            }
        );
    }

    onSubmit() {
        this.conditionCriteria.forEach(item => {
            if (!item.field1 && !item.field2 ) {
                this.errorBanner = `please fill required field inside ${item.conditionName}`
                return;
                }
        })

        this.storeClassificationTable.forEach(data => {
            if (data.brType === BusinessRuleType.BR_CLASSIFICATION_RULE) {
                data.descriptionRule?.conditionList.forEach(conditionData => {
                    this.conditionCriteria.forEach(item => {
                        if(conditionData.field1 === item.field1
                            && conditionData.field2 === item.field2 ) {
                                this.errorBanner = 'Defined condition '+ item.conditionName +' conflicts with one of the conditions in rule '+ data.brInfo
                            }
                    })
                })
            }
        })
        if (!this.errorBanner.length) {
            this.conditionCriteria.forEach(item => {
                item.fieldValue = [];
                if(item.field1) {
                    item.fieldValue.push({ fieldId: this.selectedDescSettings[0]?.fieldId, fieldValue: this.fieldValueFormatting(item.field1, 0) });
                }
                if(item.field2) {
                    item.fieldValue.push({ fieldId: this.selectedDescSettings[1]?.fieldId, fieldValue: this.fieldValueFormatting(item.field2, 1) });
                }
            })
            this.schemaService.conditionSideSheetData.next(this.conditionCriteria);
            this.schemaService.isConditionSheetClose.next(true);
            this.router.navigate([{ outlets: { sb3: null } }]);
        }
    }

    closeSidesheet() {
        this.configurationConditionForm = new FormGroup({});
        this.conditionCriteria = [];
        this.selectedCondition = [];
        this.router.navigate([{ outlets: { sb3: null } }]);
    }

    displayWithAttr(data: any) {
        return data ? data.value:'';
    }

    displayWithDescField(data: any) {
        return data ? data : '';
    }

    getDropDownofPickList(field){
        const body={
            parent: {
            },
            searchString: ''
        }
        const dropdown = [];
        const dropdownSub =  this.schemaService.getDropdownOfPickList(this.moduleId, field.fieldId,this.locale, body).subscribe((resp) => {
            resp.content.map(row=> {
            dropdown.push({
                fieldId: field.fieldId,
                code: row.code,
                text: row.text,
                textRef: row.textRef
            });
        })
        field.dropdown = dropdown;
        },(error)=>{});
        this.subscriptions.add(dropdownSub);
    }

    fieldValueFormatting(fieldData, index) {
    const data = this.selectedDescSettings[index];
        if(data && data.pickList ==='52'){
            return fieldData = String(new Date(fieldData).getTime());
        } else {
            return fieldData;
        }
    }

    ngOnDestroy(): void {
        if (this.subscriptions) {
            this.subscriptions.unsubscribe();
        }
    }

    getSelectedDate(field) {
        let date;
        if(this.configurationConditionForm.value[field]) {
            date = new Date(this.configurationConditionForm.value[field]);
        } else {
            date = new Date();
        }
        return date;
    }
}
