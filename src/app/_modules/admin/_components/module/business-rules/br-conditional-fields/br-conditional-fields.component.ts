import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MetadataModel, MetadataModeleResponse } from 'src/app/_models/schema/schemadetailstable';
import { ConditionalField } from '../business-rules.modal';
import { Observable, of } from 'rxjs';
import { SchemaDetailsService } from 'src/app/_services/home/schema/schema-details.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'pros-br-conditional-fields',
  templateUrl: './br-conditional-fields.component.html',
  styleUrls: ['./br-conditional-fields.component.scss']
})
export class BrConditionalFieldsComponent implements OnInit {

  @Input()
  schemaId: string;

  @Input()
  moduleId: string;

  @Input()
  isRequired = false;

  /**
   * Pre selected values
   */
  @Input()
  selectedFldId: MetadataModel;

  @Output()
  evtOnchange: EventEmitter<MetadataModel> = new EventEmitter<MetadataModel>();

  fields: ConditionalField[];
  searchFld: Observable<ConditionalField[]> = of([]);
  preSelectedCtrl: MetadataModel[] = [];

  fldFrmGrp: FormGroup;
  constructor(
    private schemaDetailsService: SchemaDetailsService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    // call http to load all fields
    this.getAllFields();

    // make form group
    this.fldFrmGrp = this.formBuilder.group({
      conFld: ['',this.isRequired ? Validators.required : Validators.nullValidator]
    });

    // preselectedfields
    if(this.selectedFldId) {
      this.fldFrmGrp.controls.conFld.setValue(this.selectedFldId);
    }

    // autocomplete search
    this.fldFrmGrp.valueChanges.subscribe(val=>{
      if(val && val.conFld && typeof val.conFld === 'string') {
        this.autoCompleteSearch(val.conFld);
      } else {
        this.evtOnchange.emit(val.conFld);
      }
    });
  }

  getAllFields() {
    this.schemaDetailsService.getMetadataFields(this.moduleId).subscribe(response => {
      this.makeConditionalFields(response);
    }, error => {
      console.error(`Error : ${error}`);
    });
  }

  makeConditionalFields(response: MetadataModeleResponse) {
    const conFields: ConditionalField[] = [];
    // create header block
    if(response && response.headers) {
      const conHeader = new ConditionalField();
      conHeader.fieldId = 'header';
      conHeader.fieldDescription = 'Header Fields';
      conHeader.fields = [];
      if(response.hasOwnProperty('headers')) {
        Object.keys(response.headers).forEach(key=>{
          conHeader.fields.push(response.headers[key]);
        });
      }
      conFields.push(conHeader);
    }

    // create grid block
    if(response && response.grids) {
      Object.keys(response.grids).forEach(grid=>{
        const conGrid = new ConditionalField();
        conGrid.fieldId = grid;
        conGrid.fieldDescription = (response.grids[grid] as MetadataModel).fieldDescri;
        conGrid.fields = [];
        if(response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(key =>{
            conGrid.fields.push(response.gridFields[grid][key]);
          });
        }
        conFields.push(conGrid);
      });
    }

    // create Hierarchy block
    if(response && response.hierarchy) {
      for(const hierarchy of response.hierarchy) {
        const conhierarchy = new ConditionalField();
        conhierarchy.fieldId = hierarchy.heirarchyId;
        conhierarchy.fieldDescription = hierarchy.heirarchyText;
        conhierarchy.fields = [];
        if(response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
          Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach(key=>{
            conhierarchy.fields.push(response.hierarchyFields[hierarchy.heirarchyId][key]);
          });
        }
        conFields.push(conhierarchy);
      }
    }

    // assign to component variable
    this.fields = conFields;
    this.searchFld = of(conFields);
  }

  /**
   * For search field after render
   * @param val queryString / searchable string
   */
  autoCompleteSearch(val: string) {
    if(val && typeof val === 'string' && val.trim() !== '') {
      const groups = Array.from(this.fields.filter(fil =>fil.fields.length >0));
      const matchedData: ConditionalField[] = [];
      groups.forEach(grp=>{
        const changeAble = {fieldId: grp.fieldId, fields: grp.fields,fieldDescription: grp.fieldDescription} as ConditionalField;
        const chld: MetadataModel[] = [];
        changeAble.fields.forEach(child=>{
            if(child.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !==-1) {
              chld.push(child);
            }
          });
          if(chld.length) {
            changeAble.fields = chld;
            matchedData.push(changeAble);
          }
      });
      this.searchFld = of(matchedData);
    } else {
      this.searchFld = of(this.fields);
    }

  }

  displayWith(obj: MetadataModel): string {
    return obj ? obj.fieldDescri : null;
  }

  /**
   * Should return selected field control
   * @param fieldId seldcted field id
   */
  returnSelectedFldCtrl(fieldId: string): MetadataModel[] {
    const returnCtrl: MetadataModel[] = [];
    this.fields.forEach(fld=>{
      const match =fld.fields.filter(fil => fil.fieldId === fieldId);
      if(match.length) {
        returnCtrl.push(match[0]);
      }
    });
    return returnCtrl;
  }
}

