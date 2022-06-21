import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { FieldConfiguration, LookupData, LookupFormData, LookupFields } from '@models/schema/schemadetailstable';
import { Observable, of } from 'rxjs';
import { isEqual } from 'lodash';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SchemaService } from '@services/home/schema.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

@Component({
  selector: 'pros-lookup-rule',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss']
})
export class LookupRuleComponent implements OnInit, OnChanges {

  /**
   * observable for autocomplete
   */
  filteredFields: Observable<any[]> = of([]);
  selectedFields: LookupFields[] = [];
  selectedFieldsCopy: LookupFields[] = [];

  availableField: FormControl;
  modulesList: LookupData[] = [];
  reload = false;

  @Input()
  initialLookupData: LookupFields[];

  @Input()
  fieldsObject: FieldConfiguration = {
    list: [],
    labelKey: 'fieldDescri',
    valueKey: 'fieldId',
  }

  @Output()
  lookupRuleOutput: EventEmitter<LookupFields[]> = new EventEmitter();

  /**
   * list of event to consider as selection
   */
  separatorKeysCodes: number[] = [ENTER, COMMA];

  /**
   * Array to store all Grid And Hirarchy records
   */
  @Input() allGridAndHirarchyData = [];

  /**
   * Tree child
   */
  @ViewChild('tree') tree = null;

  /**
   * tree control
   */
  treeControl = null;

  /**
   * treeFlattener
   */
  treeFlattener = null;

  /**
   * data source
   */
  dataSource = null;

  /**
   * has child
   */
  hasChild = null;

  /**
   * transformer = return tree object.
   * @param node node
   * @param level level
   */
  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      id: node.id,
      parent: node.parent,
      allData: node.allData
    };
  }

  constructor(
    private snackBar: MatSnackBar,
    private schemaService: SchemaService,
    private globalDialogService: GlobaldialogService) { }

  ngOnInit(): void {
    this.treeControl = new FlatTreeControl<{ name: string, level: number, expandable: boolean, id: string, parent: string }>(
      node => node.level, node => node.expandable);

    this.treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.children);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.hasChild = (_: number, node: { name: string, level: number, expandable: boolean, id: string, parent: string }) => node.expandable;

    this.initForm();
    this.getObjectTypes();
    this.patchLookupData();
  }

  /**
   * Initialize the form object and Autocomplete on Init
   * Angular hook
   */
  initForm() {
    this.availableField = new FormControl('');
    this.initTargetAutocomplete();
  }

  /**
   * Method to set selected fields for lookup data
   */
  patchLookupData() {
    this.selectedFieldsCopy = [...this.initialLookupData];
    this.selectedFields = [...this.initialLookupData];
    this.emitLookupRuleData(this.selectedFieldsCopy);
  }

  /**
   * remove a field from the list
   * @param index pass index of the item to be removed
   */
  removeField(index) {
    this.globalDialogService.confirm({ label: 'Are you sure to delete this mapping ?' }, (res) => {
      this.removeFieldAfterConfirm(res, index);
    })
  }

  /**
   * Remove selected fields after confirm
   * @param res pass the confirmation
   * @param index pass the index
   */
  removeFieldAfterConfirm(res: string, index: number) {
    if (res === 'yes') {
      this.selectedFields.splice(index, 1);
      this.selectedFieldsCopy.splice(index, 1);
    }
  }


  /**
   * method to get the display value in mat-autocomplete
   * @param value pass the value and return the key to be displayed
   */
  displayFn(value) {
    return value ? value.fieldDescri : '';
  }


  /**
   * method to select a field and add it to an array of selected fields
   * using two arrays here, one to get the data and another to loop the
   * fields in the UI
   * @param event pass the selected field value here
   */
  selectCurrentField(event) {
    const alreadyExists = this.selectedFields.find(item => item.fieldId === event.option.value);
    if (alreadyExists) {
      this.snackBar.open('This field is already selected', 'Okay', { duration: 5000 });
    } else {
      this.selectedFields.push({
        fieldDescri: event.option.viewValue,
        fieldId: event.option.value,
        fieldLookupConfig: null,
        lookupTargetField: '',
        lookupTargetText: '',
        enableUserField: false
      });
      this.selectedFieldsCopy.push({
        fieldDescri: event.option.viewValue,
        fieldId: event.option.value,
        fieldLookupConfig: null,
        lookupTargetField: '',
        lookupTargetText: '',
        enableUserField: false
      });
    }
    this.availableField.setValue('');
  }

  /**
   * While clicking on Tree node
   * @param selectedNode selected node
   */
  clickTreeNode(selectedNode) {
    const selectedNodes = {
      fieldDescri: selectedNode.parent + '/' + selectedNode.name,
      fieldId: selectedNode.id
    }
    const alreadyExists = this.selectedFields.find(item => item.fieldId === selectedNodes.fieldId);
    if (alreadyExists) {
      this.snackBar.open('This field is already selected', 'error', { duration: 5000 });
    } else {
      this.selectedFields.push({
        fieldDescri: selectedNode.parent + '/' + selectedNode.name,
        fieldId: selectedNode.id,
        fieldLookupConfig: null,
        lookupTargetField: '',
        lookupTargetText: '',
        enableUserField: false
      });
      this.selectedFieldsCopy.push({
        fieldDescri: selectedNode.parent + '/' + selectedNode.name,
        fieldId: selectedNode.id,
        fieldLookupConfig: null,
        lookupTargetField: '',
        lookupTargetText: '',
        enableUserField: false
      });
    }
    this.availableField.setValue('');
  }

  /**
   * method to get all object types from the api
   */
  getObjectTypes() {
    this.schemaService.getAllObjectType().subscribe((modules: []) => {
      if (modules && modules.length > 0) {
        this.modulesList.push(...modules);
      }
    });
  }

  /**
   * get the lookup config data from the lookup config component
   * and emit the values from lookup component
   * @param value pass the lookup config for a particular field
   * @param index index of the field in order to update it's value
   */
  setLookupConfig(value: LookupFormData, index: number) {
    const field = { ...this.selectedFieldsCopy[index] };
    field.fieldLookupConfig = value;
    this.selectedFieldsCopy[index] = { ...field };
    this.emitLookupRuleData(this.selectedFieldsCopy);
  }

  /**
   * method to set the user selected fields and entered data
   * @param value pass the manually entered text value
   * @param index pass the field index
   * @param manual boolean value to check if it's a manual input
   */
  setLookupTargetField(value, index: number, manual: boolean = false) {
    const field = { ...this.selectedFieldsCopy[index] };
    // if (value === 'New Field') {
    //   field.enableUserField = true;
    // }

    if (manual) {
      field.lookupTargetText = value;
    } else {
      field.lookupTargetField = value;
    }

    this.selectedFieldsCopy[index] = { ...field };
    this.emitLookupRuleData(this.selectedFieldsCopy);
  }

  /**
   * method to emit the final lookup data
   * @param data pass the lookup output
   */
  emitLookupRuleData(data: LookupFields[]) {
    this.lookupRuleOutput.emit(data);
  }

  /**
   * get the input value by field id
   * @param field pass the field object
   */
  getInputValue(field) {
    if (field && field.fieldLookupConfig && this.modulesList.length > 0) {
      const lookupConfig: LookupFormData = field.fieldLookupConfig;
      const selected: LookupData = this.modulesList.find((module) => module.objectid === lookupConfig.moduleId);
      return selected ? selected.objectdesc : '';
    }
    return '';
  }

  /**
   * Initialize autocomplete for targetfield values
   */
  initTargetAutocomplete() {
    this.filteredFields = this.availableField.valueChanges.pipe(startWith(''), map(keyword => {
      if (keyword) {
        const filterData = [];
        this.allGridAndHirarchyData.forEach(item => {
          if (item.name.toString().toLowerCase().indexOf(keyword) !== -1 || (!!item.parent && item.parent.toString().toLowerCase().indexOf(keyword) !== -1)
            || item.children.filter(child => { return child.name.toString().toLowerCase().indexOf(keyword) !== -1 }).length >= 1) {
            const parentChildData = item;
            if (item.children.filter(child => { return child.name.toString().toLowerCase().indexOf(keyword) !== -1 }).length >= 1) {
              parentChildData.children = item.children.filter(child => { return child.name.toString().toLowerCase().indexOf(keyword) !== -1 });
            }
            filterData.push(parentChildData);
          }
        });
        this.dataSource.data = filterData;
        if (this.tree !== null && this.tree.treeControl !== null) {
          this.tree.treeControl.expandAll();
        }
        return this.fieldsObject.list.filter(item => {
          return item.fieldDescri.toString().toLowerCase().indexOf(keyword) !== -1
        }).length >= 1 || this.dataSource.data.length === 0 ? this.fieldsObject.list.filter(item => {
          return item.fieldDescri.toString().toLowerCase().indexOf(keyword) !== -1
        }) : [{ fieldDescri: 'No header data found', fieldId: null }];
      } else {
        this.dataSource.data = this.allGridAndHirarchyData;
        if (this.tree !== null && this.tree.treeControl !== null) {
          this.tree.treeControl.collapseAll();
        }
        return this.fieldsObject.list;
      }
    }));
  }

  /**
   * get value of a field by key and index
   * @param index field index
   * @param key field key
   */
  getValue(index: number, key: string = null) {
    const obj: LookupFields = this.selectedFieldsCopy[index];
    if (key) {
      return obj[key] ? obj[key] : '';
    } else {
      return obj;
    }
  }

  /**
   * get field label text from field object
   * if not present find the label using field id
   * @param field pass the field object
   */
  getFieldLabel(field: LookupFields) {
    if (field && field.fieldDescri) {
      return field.fieldDescri;
    } else {
      if (field.fieldId) {
        const fieldObj = this.fieldsObject.list.find((fld) => fld.fieldId === field.fieldId);
        if (fieldObj && fieldObj.fieldDescri) {
          return fieldObj.fieldDescri;
        } else {
          const fieldsselected = this.allGridAndHirarchyData.find(parent => { return parent.children.find(child => { return child.id === field.fieldId }) });
          if (fieldsselected && fieldsselected.children.length >= 1) {
            const fieldChild = fieldsselected.children.find(child => child.id === field.fieldId);
            if (fieldChild && fieldChild.parent && fieldChild.name) {
              return `${fieldChild.parent}/${fieldChild.name}`;
            }
          }
        }
      }
    }
  }

  /**
   * method to check if manual input is enabled
   * @param index pass the field index to check that particular field
   */
  isEnabled(index: number) {
    if (this.selectedFieldsCopy.length > 0) {
      const data: LookupFields = this.selectedFieldsCopy[index];
      return data.enableUserField;
    }
    return false;
  }

  /**
   * method to prepare target values
   * @param fieldObject pass the updated object to update
   */
  updateTargetValue({ list, labelKey, valueKey }) {
    this.fieldsObject = {
      labelKey,
      valueKey,
      list
    }
  }

  /**
   * Angular hook to detect changes in the input values
   * @param changes check for change using changes variable
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.fieldsObject && !isEqual(changes.fieldsObject.previousValue, changes.fieldsObject.currentValue)) {
      this.updateTargetValue(changes.fieldsObject.currentValue);
    }
  }
}
