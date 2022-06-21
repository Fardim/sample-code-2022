import { Component, OnInit, Input, EventEmitter, Output, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { MetadataModeleResponse, MetadataModel, Heirarchy, ParentField } from '@models/schema/schemadetailstable';
import { Observable, of, Subscription } from 'rxjs';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { FormControl } from '@angular/forms';
import { ReportService } from '@modules/report/_service/report.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { CoreService } from '@services/core/core.service';

export interface Metadata {
  fieldId: string;
  fieldDescri: string;
  fieldDesc?: string;
  isGroup: boolean;
  fldCtrl?: MetadataModel;
  childs: Metadata[];
  fieldType?: ParentField;
  moduleName?: string;
  moduleId?: string;
}
@Component({
  selector: 'pros-metadatafield-control',
  templateUrl: './metadatafield-control.component.html',
  styleUrls: ['./metadatafield-control.component.scss']
})
export class MetadatafieldControlComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('autoCompleteInput', { read: MatAutocompleteTrigger })
  autoComplete: MatAutocompleteTrigger;

  @Input()
  moduleId: string;

  /**
   * Pre selected values
   */
  @Input()
  selectedFldId: string;

  /**
   * Is multiSelect dropdown
   */
  @Input()
  isMultiSelection: boolean;

  /**
   * mat-label
   */
  @Input()
  lebel: string;

  /**
   * Widget Type
   */
  @Input()
  widgetType: string;

  /**
   * for checking if it is from field change event
   */
  @Input()
  isGroupWith  = false;

  /**
   * Check Custom data-set is true or not
   */
  @Input()
  isCustomdataset: boolean;

  @Input()
  datasetType: string;

  /**
   * After option selection change event should be emit
   */
  @Output()
  selectionChange: EventEmitter<Metadata> = new EventEmitter<Metadata>();

  /**
   * emit the data type of preselected value
   */
  @Output()
  getpreSelectedFieldDataType: EventEmitter<Metadata | MetadataModel> = new EventEmitter<Metadata | MetadataModel>();


  fields: Metadata[] = [];
  fieldsObs: Observable<Metadata[]> = of([]);
  fieldFrmCtrl: FormControl = new FormControl('');
  preSelectedCtrl: Metadata | MetadataModel;

  customFields: MetadataModel[] = [];
  customFieldsObs: Observable<MetadataModel[]> = of([]);
  // store check isdiwdataset
  isDiwDataSet: boolean;
  /**
   * All the http or normal subscription will store in this array
   */
  subscriptions: Subscription[] = [];

  /**
   * Static system fields
   */
  systemFields: Metadata[] = [
    {
      fieldId: 'STATUS',
      fieldDescri: 'Status',
      childs: [],
      isGroup: false
    },
    {
      fieldId: 'USERMODIFIED',
      fieldDescri: 'User Modified',
      childs: [],
      isGroup: false,
      fldCtrl: {
        picklist: '1',
        dataType: 'AJAX',
        fieldId: 'USERMODIFIED',
      } as MetadataModel
    }, {
      fieldId: 'DATEMODIFIED',
      fieldDescri: 'Update Date',
      childs: [],
      isGroup: false,
      fldCtrl: {
        picklist: '0',
        dataType: 'DTMS',
        fieldId: 'DATEMODIFIED',
      } as MetadataModel
    }, {
      fieldId: 'DATECREATED',
      fieldDescri: 'Creation Date',
      childs: [],
      isGroup: false,
      fldCtrl: {
        picklist: '0',
        dataType: 'DTMS',
        fieldId: 'DATECREATED',
      } as MetadataModel
    }
  ];

  timeseriesFields: Metadata[] = [
    {
      fieldId: 'DATEMODIFIED',
      fieldDescri: 'Update Date',
      childs: [],
      isGroup: false,
      fldCtrl: {
        picklist: '0',
        dataType: 'DTMS',
        fieldId: 'DATEMODIFIED',
      } as MetadataModel
    }, {
      fieldId: 'DATECREATED',
      fieldDescri: 'Creation Date',
      childs: [],
      isGroup: false,
      fldCtrl: {
        picklist: '0',
        dataType: 'DTMS',
        fieldId: 'DATECREATED',
      } as MetadataModel
    }
  ];

  constructor(
    private schemaDetailsService: SchemaDetailsService,
    private reportService: ReportService,
    private coreService : CoreService
  ) { }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (changes && changes.selectedFldId && changes.selectedFldId.currentValue !== changes.selectedFldId.previousValue) {
      if (changes.selectedFldId.currentValue) {
        this.preSelectedCtrl = this.returnSelectedFldCtrl(changes.selectedFldId.currentValue);
        this.fieldFrmCtrl.setValue(this.preSelectedCtrl);
      }
      else {
        this.preSelectedCtrl = null;
        this.fieldFrmCtrl.reset();
      }
    }
    if (changes && changes.moduleId && changes.moduleId.currentValue !== changes.moduleId.previousValue) {
      this.moduleId = changes.moduleId.currentValue;
      // for metric widget add default field value
      this.addDefaultFieldForDIWDataset();
      // allow API calls when dataset is selected(in that case id will come)
      if(this.moduleId && !isNaN(+this.moduleId))
      this.getFields();
    }
  }

  ngOnInit(): void {
    if (this.datasetType === 'diw_dataset') {
      this.isDiwDataSet = true;
    }
    this.fieldFrmCtrl.valueChanges.subscribe(val => {
      if (this.isCustomdataset) {
        if (val && typeof val === 'string' && val.trim() !== '') {
          this.customFieldsObs = of(this.customFields.filter(fil => fil.fieldDescri.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1));
        } else {
          this.customFieldsObs = of(this.customFields);
          // this.selected(null);
        }
      }else {
        if (val && typeof val === 'string' && val.trim() !== '') {
          this.getFields(true,val)
        } else {
          this.fieldsObs = of(this.fields);
          if (typeof val === 'string' && val.trim() === '') {
            this.selected(null);
          }
        }
      }
    })
  }

  /**
   * add default field as 'DIW status' in system fields
   */
  addDefaultFieldForDIWDataset() {
    if (this.datasetType === 'diw_dataset') {
      this.isDiwDataSet = true;
      const diwStatus: any = {
        fieldId: '__DIW_STATUS',
        fieldDescri: 'DIW status'
      }
      this.isDiwDataSet = true;
      this.moduleId = this.moduleId.split('/')[0];
      this.systemFields.unshift(diwStatus);
    } else {
      this.systemFields = this.systemFields.filter(item => item.fieldId !== '__DIW_STATUS');
      this.isDiwDataSet = false;
    }

  }

  filtered(array: Metadata[], text: string): Observable<Metadata[]> {
    const getChildren = (result, object) => {
      const re = new RegExp(text, 'gi');
      if (object.fieldDescri.match(re)) {
        result.push(object);
        return result;
      }
      if (Array.isArray(object.childs)) {
        const children = object.childs.reduce(getChildren, []);
        if (children.length) result.push({ ...object, childs: children });
      }
      return result;
    };
    return of(array.reduce(getChildren, []));
  }

  /**
   * Reopen when user scroll on the outside of the autoComplete box
   */
  openPanel() {
    if (!this.autoComplete.panelOpen) {
      this.autoComplete.openPanel();
    }
  }

  /**
   * Should call http for get all fields
   */
  getFields(isFromSearch = false, searchVal = '') {
    if (this.moduleId) {
      if (this.isCustomdataset) {
        const allfldSub = this.reportService.getCustomDatasetFields(this.moduleId).subscribe(response => {
          const res = this.transformCustomFields(response);
          this.customFields = res;
          this.customFieldsObs = of(res);
          if (this.selectedFldId) {
            this.preSelectedCtrl = this.returnSelectedFldCtrl(this.selectedFldId);
          }
        }, error => {
          console.error(`Error : ${error}`);
        });
        this.subscriptions.push(allfldSub);
      } else {
        const allfldSub = this.coreService.getMetadataFieldsByModuleId([this.moduleId], '').subscribe(response => {
          const res = this.transformFieldRes(response);
          this.fields = res;
          this.fieldsObs = of(res);
          if(isFromSearch){
            const groups = Array.from(this.fields.filter(fil => fil.isGroup));
            this.fieldsObs = this.filtered(groups, searchVal);
          }
          if (this.selectedFldId) {
            this.preSelectedCtrl = this.returnSelectedFldCtrl(this.selectedFldId);
            if (this.getpreSelectedFieldDataType)
              this.getpreSelectedFieldDataType.emit(this.preSelectedCtrl);
          }
        }, error => {
          console.error(`Error : ${error}`);
        });
        this.subscriptions.push(allfldSub);
      }
    }
  }

  /**
   * Help to transform data from MetadataModeleResponse to Metadata[]
   * @param response metadata response from server
   */
  transformFieldRes(response: MetadataModeleResponse): Metadata[] {
    const metadata: Metadata[] = [];
    // system fields
    if (this.widgetType === 'TIMESERIES' && this.isGroupWith) {
      metadata.push({
        fieldId: 'system_fields',
        fieldDescri: 'System fields',
        isGroup: true,
        childs: this.timeseriesFields
      });
    } else {
      metadata.push({
        fieldId: 'system_fields',
        fieldDescri: 'System fields',
        isGroup: true,
        childs: this.systemFields
      });
    }

    // for header
    const headerChilds: Metadata[] = [];
    if (response.headers && this.widgetType === 'TIMESERIES' && this.isGroupWith ) {
      Object.keys(response.headers).forEach(header => {
        const res = response.headers[header];
        if (res.pickList === '52' || res.pickList === '53') {
          headerChilds.push({
            fieldId: res.fieldId,
            fieldDescri: res.fieldDescri,
            isGroup: false,
            fldCtrl: res,
            childs: []
          });
        }
      });
    } else if (response.headers) {
      Object.keys(response.headers).forEach(header => {
        const res = response.headers[header];
        headerChilds.push({
          fieldId: res.fieldId,
          fieldDescri: res.fieldDescri,
          isGroup: false,
          fldCtrl: res,
          childs: []
        });
      });
    }
    metadata.push({
      fieldId: 'header_fields',
      fieldDescri: 'Header fields',
      isGroup: true,
      childs: headerChilds
    });


    if (this.widgetType !== 'Table') {
      this.mapHierarchyFields(response, metadata);

      this.mapGridFields(response, metadata)
    }
    // for grid response transformations
    // if(response && response.grids && this.widgetType === 'TIMESERIES') {
    //   Object.keys(response.grids).forEach(grid=>{
    //     const childs : Metadata[] = [];
    //     if(response.gridFields && response.gridFields.hasOwnProperty(grid)) {
    //       Object.keys(response.gridFields[grid]).forEach(fld=>{
    //         const fldCtrl = response.gridFields[grid][fld];
    //         if(fldCtrl.dataType === 'DATS' || fldCtrl.dataType === 'DTMS') {
    //           childs.push({
    //             fieldId: fldCtrl.fieldId,
    //             fieldDescri: fldCtrl.fieldDescri,
    //             isGroup: false,
    //             fldCtrl,
    //             childs:[]
    //           });
    //         }
    //       });
    //     }
    //     metadata.push({
    //       fieldId: grid,
    //       fieldDescri: response.grids[grid].fieldDescri,
    //       isGroup: true,
    //       childs
    //     });
    //   })
    // } else if(response && response.grids) {
    //   Object.keys(response.grids).forEach(grid=>{
    //     const childs : Metadata[] = [];
    //     if(response.gridFields && response.gridFields.hasOwnProperty(grid)) {
    //       Object.keys(response.gridFields[grid]).forEach(fld=>{
    //         const fldCtrl = response.gridFields[grid][fld];
    //           childs.push({
    //             fieldId: fldCtrl.fieldId,
    //             fieldDescri: fldCtrl.fieldDescri,
    //             isGroup: false,
    //             fldCtrl,
    //             childs:[]
    //           });
    //       });
    //     }
    //     metadata.push({
    //       fieldId: grid,
    //       fieldDescri: response.grids[grid].fieldDescri,
    //       isGroup: true,
    //       childs
    //     });
    //   })
    // }

    // for hierarchy response transformations
    // if(response && response.hierarchy  && this.widgetType === 'TIMESERIES') {
    //   response.hierarchy.forEach(hierarchy => {
    //     const childs: Metadata[] = [];
    //     if(response.hierarchyFields && response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
    //       Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach(fld=>{
    //         const fldCtrl = response.hierarchyFields[hierarchy.heirarchyId][fld];
    //         if(fldCtrl.dataType === 'DATS' || fldCtrl.dataType === 'DTMS') {
    //           childs.push({
    //             fieldId: fldCtrl.fieldId,
    //             fieldDescri: fldCtrl.fieldDescri,
    //             isGroup: false,
    //             fldCtrl,
    //             childs:[]
    //           });
    //         }
    //       });
    //     }
    //     metadata.push({
    //       fieldId: hierarchy.heirarchyId,
    //       fieldDescri: hierarchy.heirarchyText,
    //       isGroup: true,
    //       childs
    //     });
    //   });
    // }
    // else if(response && response.hierarchy) {
    //   response.hierarchy.forEach(hierarchy => {
    //     const childs: Metadata[] = [];
    //     if(response.hierarchyFields && response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
    //       Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach(fld=>{
    //         const fldCtrl = response.hierarchyFields[hierarchy.heirarchyId][fld];
    //           childs.push({
    //             fieldId: fldCtrl.fieldId,
    //             fieldDescri: fldCtrl.fieldDescri,
    //             isGroup: false,
    //             fldCtrl,
    //             childs:[]
    //           });
    //       });
    //     }
    //     metadata.push({
    //       fieldId: hierarchy.heirarchyId,
    //       fieldDescri: hierarchy.heirarchyText,
    //       isGroup: true,
    //       childs
    //     });
    //   });
    // }
    return metadata;
  }

  /**
   * Should return selected field control
   * @param fieldId seldcted field id
   */
  returnSelectedFldCtrl(fieldId: string): Metadata | MetadataModel {
    let returnCtrl = { fieldDescri: '', fieldId: '' } as Metadata | MetadataModel;
    if (this.isCustomdataset) {
      this.customFields.forEach(fld => {
        if (fld.fieldId === fieldId) {
          returnCtrl = fld;
        }
      });
    } else {
      this.fields.forEach(fld => {
        const match = fld.childs.filter(fil => fil.fieldId === fieldId);
        if (match.length) {
          returnCtrl = match[0];
        }
      });
    }
    return returnCtrl;
  }

  /**
   * Should return field descriptions
   * @param obj curret render object
   */
  displayFn(obj: Metadata | MetadataModel): string {
    return obj ? obj.fieldDescri : null;
  }

  /**
   * Should emit after value change
   * @param option selected option from ui
   */
  selected(option: any) {
    this.selectionChange.emit(option);
  }

  // Custom fields should be filtered when groups with
  transformCustomFields(response) {
    const metaData = [];
    if (response && this.widgetType === 'TIMESERIES' && this.isGroupWith) {
      response.forEach(res => {
        if (res.pickList === '52' || res.pickList === '53') {
          metaData.push(res);
        }
      });
    } else {
      response.forEach(res => {
        metaData.push(res);
      });
    }
    return metaData;
  }

  public mapHierarchyFields(response: MetadataModeleResponse, metadata: Metadata[]): void {
    if (response && response.hierarchy && this.widgetType === 'TIMESERIES' && this.isGroupWith ) {
      response.hierarchy.forEach(hierarchy => {
        const hierarchyChilds: Metadata[] = [];
        if (response.hierarchyFields && response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
          Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach(fld => {
            const hierarchyDesc = response.hierarchy.find((x) => { return x.heirarchyId === hierarchy.heirarchyId });
            const fldCtrl = response.hierarchyFields[hierarchy.heirarchyId][fld];
            if (fldCtrl.pickList === '52' || fldCtrl.pickList === '53' || fldCtrl.dataType === 'TIMS') {
              hierarchyChilds.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                fldCtrl,
                childs: [],
                fieldType: this.getHierarchyParentField(hierarchyDesc)
              });
            }
          });
          metadata.push({
            fieldId: hierarchy.heirarchyId,
            fieldDescri: hierarchy.heirarchyText,
            isGroup: true,
            childs: hierarchyChilds
          });
        }
      });
    }
    else if (response && response.hierarchy) {
      response.hierarchy.forEach(hierarchy => {
        const hierarchyChilds: Metadata[] = [];
        if (response.hierarchyFields && response.hierarchyFields.hasOwnProperty(hierarchy.heirarchyId)) {
          Object.keys(response.hierarchyFields[hierarchy.heirarchyId]).forEach(fld => {
            const hierarchyDesc = response.hierarchy.find((x) => { return x.heirarchyId === hierarchy.heirarchyId });
            const fldCtrl = response.hierarchyFields[hierarchy.heirarchyId][fld];
            hierarchyChilds.push({
              fieldId: fldCtrl.fieldId,
              fieldDescri: fldCtrl.fieldDescri,
              isGroup: false,
              fldCtrl,
              childs: [],
              fieldType: this.getHierarchyParentField(hierarchyDesc)
            });
          });
        }

        metadata.push({
          fieldId: hierarchy.heirarchyId,
          fieldDescri: hierarchy.heirarchyText,
          isGroup: true,
          childs: hierarchyChilds
        });
      });
    }
  }

  public mapGridFields(response: MetadataModeleResponse, metadata: Metadata[]): void {

    // for grid response transformations
    if (response && response.grids && this.widgetType === 'TIMESERIES' && this.isGroupWith) {
      Object.keys(response.grids).forEach(grid => {
        const gridChilds: Metadata[] = [];
        if (response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(fld => {
            const gridDesc = this.getGridParentField(response.grids[grid]);
            const fldCtrl = response.gridFields[grid][fld];
            if (fldCtrl.pickList === '52' || fldCtrl.pickList === '53' || fldCtrl.dataType === 'TIMS') {
              gridChilds.push({
                fieldId: fldCtrl.fieldId,
                fieldDescri: fldCtrl.fieldDescri,
                isGroup: false,
                fldCtrl,
                childs: [],
                fieldType: gridDesc
              });
            }
          });
        }
        metadata.push({
          fieldId: grid,
          fieldDescri: response.grids[grid].fieldDescri,
          isGroup: true,
          childs: gridChilds
        });
      })
    } else if (response && response.grids) {
      Object.keys(response.grids).forEach(grid => {
        const gridChilds: Metadata[] = [];
        if (response.gridFields && response.gridFields.hasOwnProperty(grid)) {
          Object.keys(response.gridFields[grid]).forEach(fld => {
            const gridDesc = this.getGridParentField(response.grids[grid]);
            const fldCtrl = response.gridFields[grid][fld];
            gridChilds.push({
              fieldId: fldCtrl.fieldId,
              fieldDescri: fldCtrl.fieldDescri,
              isGroup: false,
              fldCtrl,
              childs: [],
              fieldType: gridDesc
            });
          });
        }
        metadata.push({
          fieldId: grid,
          fieldDescri: response.grids[grid].fieldDescri,
          isGroup: true,
          childs: gridChilds
        });
      })
    }
  }

  getHierarchyParentField(hierarchy: Heirarchy): ParentField {
    const parentField: ParentField = {
      fieldId: hierarchy?.fieldId,
      fieldDescri: hierarchy?.heirarchyText,
    }
    return parentField;
  }

  getGridParentField(grid: MetadataModel) {
    const parentField: ParentField = {
      fieldId: grid?.fieldId,
      fieldDescri: grid?.fieldDescri,
    }
    return parentField;

  }
}
