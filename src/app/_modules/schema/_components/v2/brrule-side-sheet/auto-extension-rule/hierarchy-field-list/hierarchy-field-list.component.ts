import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FieldMetaData } from '@models/dependencyRules';
import { TabField } from '@models/list-page/listpage';
import { picklistValues } from '@modules/list/_components/dataset-form/edit-dataset-form/edit-dataset-form.component';
import { AutoExtensionService } from '@services/auto-extension.service';

@Component({
  selector: 'pros-hierarchy-field-list',
  templateUrl: './hierarchy-field-list.component.html',
  styleUrls: ['./hierarchy-field-list.component.scss']
})
export class HierarchyFieldListComponent implements OnInit, OnChanges {

  @Input() structureDetails: { structureId: '', structureDesc: ''};
  @Input() structureFieldList: FieldMetaData[] = [];
  selectedFieldId: string = '';

  constructor(
    private autoExtensionService: AutoExtensionService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.structureFieldList.currentValue !== changes.structureFieldList.previousValue) {
      this.structureFieldList = changes.structureFieldList.currentValue;
    }
  }

  getFieldIcon(field: TabField) {
    const find = picklistValues.find(f => f.dataType === field.dataType && f.pickList === (field?.pickList || field?.picklist));
    return find ? find.icon : 'text';
  }

  onFieldClick(field) {
    this.selectedFieldId = field.fieldId;
    this.autoExtensionService.nextSelectedStructureField(field);
  }
}
