import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupDetails } from '@models/schema/duplicacy';
import { VirtualDatasetService } from '@services/list/virtual-dataset/virtual-dataset.service';
import { DatasetTableColumn } from '../table-columns/table-columns.component';


@Component({
    selector: 'pros-join-properties-side-sheet',
    templateUrl: './join-properties-side-sheet.component.html',
    styleUrls: ['./join-properties-side-sheet.component.scss']
})

export class JoinPropertiesSideSheetComponent implements OnInit {
    selectedStepData: GroupDetails;
    frmGroup: FormGroup;
    optionsList = [
        { label: 'AND' },
        { label: 'OR' }
    ]
    joinTypes = [
        { label: 'Inner join - matching rows only', value: 'INNER', },
        { label: 'Left join - all rows from the left table', value: 'LEFT', },
        { label: 'Right join - all rows from the right table', value: 'RIGHT', },
        { label: 'Full outer join - all rows from both tables', value: 'FULL', },
        { label: 'Union - map fields manually', value: 'UNION', }
    ]
    joinOperators = [
        { label: '=', value: 'EQUALS', },
        { label: '!=', value: 'NOT_EQUAL', },
        { label: 'Like', value: 'LIKE', },
        { label: 'Not Like', value: 'NOT_LIKE', },
    ]
    error = '';
    leftColumns: DatasetTableColumn[] = [];
    rightColumns: DatasetTableColumn[] = [];

    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private virtualDatasetService: VirtualDatasetService
    ) { }

    ngOnInit(): void {
        this.virtualDatasetService.getselectedStepData().subscribe((data) => {
            this.selectedStepData = data;
        })
        this.frmGroup = this.formBuilder.group({
            joinType: [this.selectedStepData?.groupJoinDetail?.[0]?.joinType || 'INNER', Validators.required],
            joinOperator: [this.selectedStepData?.groupJoinDetail?.[0]?.joinOperator || 'AND', Validators.required],
            sourceOne: [this.selectedStepData?.groupJoinDetail?.[0]?.sourceOne?.split('_')[0], Validators.required],
            sourceTwo: [this.selectedStepData?.groupJoinDetail?.[0]?.sourceTwo?.split('_')[0], Validators.required],
            joinMapping: this.formBuilder.array(this.initMappings())
        });
        this.leftColumns = this.virtualDatasetService.leftColumns;
        this.rightColumns = this.virtualDatasetService.rightColumns;
        this.areFieldsValid();
    }
    initMappings(): any {
        const formArray = [];
        if (this.selectedStepData?.groupJoinDetail?.[0]?.joinMapping?.length) {
            this.selectedStepData?.groupJoinDetail?.[0].joinMapping.map((x, i) => {
                formArray.push(this.createItem(i, x))
            })
        }
        else {
            formArray.push(this.createItem(0, null))
        }
        return formArray;
    }

    close() {
        this.router.navigate([{ outlets: { sb: null } }]);
    }

    openMapFields() {
        this.router.navigate([{ outlets: { sb: `sb/list/vd/join/properties/map/fields` } }]);
    }

    createItem(i, data): FormGroup {
        return this.formBuilder.group({
            joinMappingId: [data?.joinMappingId || ''],
            sourceOneField: [data?.sourceOneField || '', Validators.required],
            sourceTwoField: [data?.sourceTwoField || '', Validators.required],
            orderBy: [data?.orderBy || i + 1],
            operator: [data?.operator || '', Validators.required],
        });
    }

    areFieldsValid() {
        this.error = '';
        const joinMappingFields = this.frmGroup.get('joinMapping').value;
        if (joinMappingFields?.length) {
            joinMappingFields?.forEach(x => {
                if (x?.sourceOneField && x?.sourceTwoField) {
                    const leftColumn = this.leftColumns.find(l => l?.id === x?.sourceOneField);
                    const rightColumn = this.rightColumns.find(l => l?.id === x?.sourceTwoField);
                    if (leftColumn?.dataType !== rightColumn?.dataType || leftColumn?.maxLength !== rightColumn?.maxLength)
                        this.error = 'Data type mismatch in expression!';
                }
            })
        }
    }

    addItem(i): void {
        const frmArray = this.frmGroup.get('joinMapping') as FormArray;
        frmArray.push(this.createItem(i, null));
    }

    removeItem(pos): void {
        const frmArray = this.frmGroup.get('joinMapping') as FormArray;
        if (frmArray.length > 1)
            frmArray.removeAt(pos);
    }

    /***
  * Get form array controles
  */
    get frmArray() {
        return this.frmGroup.get('joinMapping') as FormArray;
    }

    save() {
        if (this.frmGroup.valid) {
            this.selectedStepData.groupJoinDetail[0].joinType = this.frmGroup.get('joinType').value;
            this.selectedStepData.groupJoinDetail[0].joinOperator = this.frmGroup.get('joinOperator').value;
            this.selectedStepData.groupJoinDetail[0].joinMapping = this.frmGroup.get('joinMapping').value;
            this.virtualDatasetService.setselectedStepData(this.selectedStepData);
            this.close();
        }
    }

}