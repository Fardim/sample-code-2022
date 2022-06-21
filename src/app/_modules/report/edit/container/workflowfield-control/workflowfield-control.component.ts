import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { MetadataModel } from '@models/schema/schemadetailstable';
import { CoreService } from '@services/core/core.service';

export interface Metadata {
  fieldId: string;
  fieldDescri: string;
  fldCtrl?: MetadataModel;
  isGroup: boolean;
  childs: Metadata[];
}
@Component({
  selector: 'pros-workflowfield-control',
  templateUrl: './workflowfield-control.component.html',
  styleUrls: ['./workflowfield-control.component.scss']
})
export class WorkflowfieldControlComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  objectType: string;

  /**
   * Pre selected values
   */
  @Input()
  selectedFldId: string;

  /**
   * control for which this component is being used
   */
  @Input()
  controlFor: string;

  /**
   * Is multiSelect dropdown
   */
  @Input()
  isMultiSelection: boolean;

  /**
   * mat-label
   */
  @Input()
  label: string;

  /**
   * Widget Type
   */
  @Input()
  widgetType: string;

  /**
   * After option selection change event should be emit
   */
  @Output()
  selectionChange: EventEmitter<Metadata> = new EventEmitter<Metadata>();

  fields: Metadata[] = [];
  fieldsObs: Observable<Metadata[]> = of([]);
  fieldFrmCtrl: FormControl = new FormControl('');
  preSelectedCtrl: Metadata;

  /**
   * http subscription array
   */
  subscriptions: Subscription[] = [];



  constructor(
    private coreService : CoreService
  ) { }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub=>{
      sub.unsubscribe();
    })
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if(changes && changes.objectType && changes.objectType.currentValue !== changes.objectType.previousValue){
      this.objectType = changes.objectType.currentValue;
      this.getField();
    }

    if(changes && changes.selectedFldId && changes.selectedFldId.currentValue!==changes.selectedFldId.previousValue){
      this.preSelectedCtrl = this.returnSelectedFldCtrl(changes.selectedFldId.currentValue) ;
    }
  }

  ngOnInit(): void {
    this.fieldFrmCtrl.valueChanges.subscribe(val=>{
      if(val && typeof val === 'string' && val.trim() !== ''){
        const groups = Array.from(this.fields.filter(fil=>fil.isGroup));
        const matchedData: Metadata[] = [];
        groups.forEach(grp=>{
          const changeAble = {isGroup: grp.isGroup, fieldId: grp.fieldId, childs:grp.childs, fieldDescri: grp.fieldDescri};
          const chld: Metadata[] = [];
          changeAble.childs.forEach(child=>{
            if(child.fieldDescri && child.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase())!== -1){
              chld.push(child)
            }
          });
          if(chld.length){
            changeAble.childs = chld;
            matchedData.push(changeAble);
          }
        });
        this.fieldsObs = of(matchedData);
      } else {
        this.fieldsObs = of(this.fields);
        if(typeof val === 'string' && val.trim() === ''){
          this.selected(null);
        }
      }
    })
  }

  /**
   * Should call http for get all fields
   */
  getField(){
    console.log(this.objectType)
    if(this.objectType){
      const allfldSub = this.coreService.getWorkFlowFields(this.objectType.split(',')).subscribe(response=>{
        const res = this.transformFieldRes(response);
        this.fields = res;
        this.fieldsObs = of(res);
        if(this.selectedFldId){
          this.preSelectedCtrl = this.returnSelectedFldCtrl(this.selectedFldId)
        }
      }, error =>{
        console.error(`Error : ${error}`);
      });
      this.subscriptions.push(allfldSub);
    }
  }

  /**
   * Transform data from any to metadata[]
   */

  transformFieldRes(response: any): Metadata[]{
    const metadata: Metadata[] = [];

    // workflow fields
    const allFieldsChild: Metadata[] = [];
    if(response.staticFields && this.widgetType === 'TIMESERIES'){
      response.staticFields.forEach(fields => {
        if((this.controlFor === 'GroupWith' ) && fields.fieldId === 'RCVD_ON' || fields.fieldId === 'EXPD_ON' || fields.fieldId === 'ACTIONED_ON') {
          allFieldsChild.push({
            fieldId: fields.fieldId,
            fieldDescri: fields.fieldDescri,
            isGroup: false,
            fldCtrl: fields,
            childs: []
          });
        } else if(this.controlFor === 'Field' && fields.fieldId !== 'WFID' && fields.fieldId !== 'CRID') {
            allFieldsChild.push({
              fieldId: fields.fieldId,
              fieldDescri: fields.fieldDescri,
              isGroup: false,
              fldCtrl: fields,
              childs: []
            });
          }
        });

      metadata.push({
        fieldId: 'static_fields',
        fieldDescri: 'System fields',
        isGroup: true,
        childs: allFieldsChild
      });
    } else if( response.staticFields && (this.widgetType === 'BAR_CHART'|| this.widgetType === 'STACKED_BAR_CHART' )){
      response.staticFields.forEach(fields => {
        if(fields.fieldId !== 'WFID' && fields.fieldId !== 'CRID' ) {
          allFieldsChild.push({
            fieldId: fields.fieldId,
            fieldDescri: fields.fieldDescri,
            isGroup: false,
            fldCtrl: fields,
            childs: []
          });
        }
      });

      metadata.push({
        fieldId: 'static_fields',
        fieldDescri: 'System fields',
        isGroup: true,
        childs: allFieldsChild
      });
    }
     else if(response.staticFields) {
      response.staticFields.forEach(fields => {
        allFieldsChild.push({
          fieldId: fields.fieldId,
          fieldDescri: fields.fieldDescri,
          isGroup: false,
          fldCtrl: fields,
          childs: []
        });
      });

     metadata.push({
       fieldId: 'static_fields',
       fieldDescri: 'System fields',
       isGroup: true,
       childs: allFieldsChild
     });
    }

    const allFieldsChildDyn: Metadata[] = [];
    if(response.dynamic && this.widgetType === 'TIMESERIES'){
      response.dynamic.forEach(fields => {
        if((this.controlFor === 'GroupWith' ) && fields.pickList === '52' || fields.pickList === '53') {
          allFieldsChildDyn.push({
            fieldId: fields.fieldId,
            fieldDescri: fields.fieldDescri,
            isGroup: false,
            fldCtrl: fields,
            childs: []
          })
        } else if(this.controlFor === 'Field') {
          allFieldsChildDyn.push({
            fieldId: fields.fieldId,
            fieldDescri: fields.fieldDescri,
            isGroup: false,
            fldCtrl: fields,
            childs: []
          })
        }
      });

      metadata.push({
        fieldId: 'workflow_fields',
        fieldDescri: 'Workflow fields',
        isGroup: true,
        childs: allFieldsChildDyn
      });
    } else if(response.workflowFields) {
      response.workflowFields.forEach(fields => {
        allFieldsChildDyn.push({
          fieldId: fields.fieldId,
          fieldDescri: fields.fieldDescri,
          isGroup: false,
          fldCtrl: fields,
          childs: []
        })
      });

      metadata.push({
        fieldId: 'workflow_fields',
        fieldDescri: 'Workflow fields',
        isGroup: true,
        childs: allFieldsChildDyn
      });
    }

    const allFieldsChildHeader: Metadata[] = [];
    if(response.headers && this.widgetType === 'TIMESERIES'){
      response.headers.forEach(fields => {
        if((this.controlFor === 'GroupWith' ) && fields.pickList === '52' || fields.pickList === '53') {
          allFieldsChildHeader.push({
            fieldId: fields.fieldId,
            fieldDescri: fields.fieldDescri,
            isGroup: false,
            fldCtrl: fields,
            childs: []
          })
        } else if(this.controlFor === 'Field') {
          allFieldsChildHeader.push({
            fieldId: fields.fieldId,
            fieldDescri: fields.fieldDescri,
            isGroup: false,
            fldCtrl: fields,
            childs: []
          })
        }
      });

      metadata.push({
        fieldId: 'header_fields',
        fieldDescri: 'Header fields',
        isGroup: true,
        childs: allFieldsChildHeader
      });
    } else if(response.headers) {
      response.headers.forEach(fields => {
        allFieldsChildHeader.push({
          fieldId: fields.fieldId,
          fieldDescri: fields.fieldDescri,
          isGroup: false,
          fldCtrl: fields,
          childs: []
        })
      });

      metadata.push({
        fieldId: 'header_fields',
        fieldDescri: 'Header fields',
        isGroup: true,
        childs: allFieldsChildHeader
      });
    }

    const allFieldsChildhrcy: Metadata[] = [];
    if(response.hierarchy && this.widgetType === 'TIMESERIES'){
      response.hierarchy.forEach(fields => {
        if((this.controlFor === 'GroupWith' ) && fields.pickList === '52' || fields.pickList === '53') {
          allFieldsChildhrcy.push({
            fieldId: fields.fieldId,
            fieldDescri: fields.fieldDescri,
            isGroup: false,
            fldCtrl: fields,
            childs: []
          })
        } else if(this.controlFor === 'Field') {
          allFieldsChildhrcy.push({
            fieldId: fields.fieldId,
            fieldDescri: fields.fieldDescri,
            isGroup: false,
            fldCtrl: fields,
            childs: []
          })
        }
      });

      metadata.push({
        fieldId: 'hierarchy_fields',
        fieldDescri: 'Hierarchy fields',
        isGroup: true,
        childs: allFieldsChildhrcy
      });
    } else if(response.hierarchy) {
      response.hierarchy.forEach(fields => {
        allFieldsChildhrcy.push({
          fieldId: fields.fieldId,
          fieldDescri: fields.fieldDescri,
          isGroup: false,
          fldCtrl: fields,
          childs: []
        })
      });

      metadata.push({
        fieldId: 'hierarchy_fields',
        fieldDescri: 'Hierarchy fields',
        isGroup: true,
        childs: allFieldsChildhrcy
      });
    }
    return metadata;
  }

  /**
   * Should return selected field control
   * @param fieldId seldcted field id
   */
  returnSelectedFldCtrl(fieldId: string): Metadata {
    let returnCtrl;
    this.fields.forEach(fld=>{
      const match = fld.childs.filter(fil=>fil.fieldId === fieldId);
      if(match.length){
        returnCtrl = match[0];
      }
    });
    return returnCtrl;
  }

  /**
   * Should return field descriptions
   * @param obj curret render object
   */
  displayFn(obj: Metadata): string {
    return obj? obj.fieldDescri: null;
  }

  /**
   * Should emit after value change
   * @param option selected option from ui
   */
  selected(option: Metadata){
    this.selectionChange.emit(option);
  }
}
