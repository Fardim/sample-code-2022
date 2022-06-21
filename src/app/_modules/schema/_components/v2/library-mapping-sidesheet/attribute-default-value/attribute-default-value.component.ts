import { ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttributeDefaultValue } from '@models/schema/classification';
import { GlobaldialogService } from '@services/globaldialog.service';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-attribute-default-value',
  templateUrl: './attribute-default-value.component.html',
  styleUrls: ['./attribute-default-value.component.scss']
})
export class AttributeDefaultValueComponent implements OnInit {

  valueList: Array<AttributeDefaultValue> = [];
  searchStr = '';

  constructor(private router: Router,
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private globalDialogService: GlobaldialogService,
    private nounModifierService: NounModifierService,
    private transientService: TransientService) { }

  ngOnInit(): void {
    if (!this.nounModifierService.attributeValuesModels) {
      this.nounModifierService.attributeValuesModels = [];
    }
    this.loadValues();
  }

  isValidRow(row: AttributeDefaultValue) {
    return row && row.code && row.shortValue
  }

  close() {
    const isAnyInvalidRow = this.valueList.find(row => !this.isValidRow(row));

    if (isAnyInvalidRow) {
      this.transientService.confirm({
        data: { label: 'Empty entries will not be saved. Click Ok to continue.' },
        disableClose: true,
        autoFocus: false,
      }, (response) => {
        if (response === 'yes') {
          this.saveValues();
        }
      });
    } else {
      this.saveValues();
    }
  }

  loadValues() {
    this.valueList = this.nounModifierService.attributeValuesModels.map(row => ({
      ...row,
      codeEditable: false,
      shortValueEditable: false,
      codeTemp: row.code,
      shortValueTemp: row.shortValue
    }));
  }

  saveValues() {
    const routerCommands = this.nounModifierService.attributeSheetRoute;
    this.nounModifierService.attributeValuesModels = this.valueList
      .filter(this.isValidRow)
      .map(row => ({
        code: row.code,
        shortValue: row.shortValue
      }));
    this.router.navigate(routerCommands, { queryParamsHandling: 'preserve' });
  }

  addValueRow() {
    const valueRow: AttributeDefaultValue = {
      code: '',
      shortValue: ''
    };
    this.valueList.push(valueRow);
  }

  copyData(i: number) {
    const valueRow = this.valueList[i];
    this.valueList.splice(i + 1, 0, { ...valueRow });
  }

  deleteValueRow(i: number) {
    this.globalDialogService.confirm({
      label: 'Are you sure to delete this?'
    }, (response: string) => {
      if (response === 'yes') {
        this.valueList.splice(i, 1);
      }
      if (!this.valueList.length) {
        this.searchStr = '';
      }
    });
  }

  doSearch($event) {
    this.searchStr = $event;
  }

  canDisplayRow(row: AttributeDefaultValue) {
    const searchStr = this.searchStr.toLowerCase();
    return !this.searchStr || row.code.toLowerCase().includes(searchStr) || row.shortValue.toLowerCase().includes(searchStr);
  }

  editRowValue(row: AttributeDefaultValue, field: string) {
    if (row[`${field}Editable`]) {
      return;
    }
    row[`${field}Temp`] = row[`${field}`];
    row[`${field}Editable`] = true;
  }

  saveRowValue(row: AttributeDefaultValue, field: string) {
    row[`${field}`] = row[`${field}Temp`];
    row[`${field}Editable`] = false;
  }

  addFirstItem() {
    const value = this.searchStr;
    if (!value) {
      return;
    }
    const row: AttributeDefaultValue = {
      shortValue: value,
      code: value,
      codeEditable: true,
      shortValueEditable: true,
      codeTemp: value,
      shortValueTemp: value
    };
    this.searchStr = '';
    this.valueList.push(row);
    this.changeDetector.detectChanges();
    this.elementRef.nativeElement.querySelector('#attr-val-0').focus();
  }
}
