import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { AppliedValue, DefaultValuesRequest, GridDefaultValueRequest } from '@models/core/coreModel';
import { FilterFieldModel } from '@models/list-page/listpage';
import { ValidationError } from '@models/schema/schema';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { ActiveForm, MSGFN } from '@modules/transaction/model/transaction';
import { DataControlService } from '@modules/transaction/_service/data-control.service';
import { ServiceInstanceSharingService } from '@modules/transaction/_service/service-instance-sharing.service';
import { TransactionService } from '@modules/transaction/_service/transaction.service';
import { CoreService } from '@services/core/core.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { debounce } from 'lodash';
import { forkJoin } from 'rxjs';
import { picklistValues } from '../dataset-form/edit-dataset-form/edit-dataset-form.component';

interface TreeFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  moduleId?: string;
  fields?: any[];
  fieldId?: string;
  picklist: string;
  dataType: string;
  moduleName?: string;
}

@Component({
  selector: 'pros-applicable-field-sidesheet',
  templateUrl: './applicable-field-sidesheet.component.html',
  styleUrls: ['./applicable-field-sidesheet.component.scss'],
  providers: [TransactionService, DataControlService]
})
export class ApplicableFieldSidesheetComponent implements OnInit, OnDestroy {
  treeFlattener;
  treeControl: FlatTreeControl<TreeFlatNode>;
  dataSource;
  activeFilter: FilterFieldModel;
  suggestedFilters: FilterFieldModel[] = [];
  searchTearm: string;
  moduleId: string;
  formId: string;
  headerDataFieldName: string = 'Header data';
  arrowIcon: string = 'chevron-left';
  /**
   * To hold information about validation errors.
   */
  validationError: ValidationError = {
    status: false,
    message: ''
  }
  /**
     * Search the trans rule from map lib..
     */
  delayedCallForApis = debounce((searchText: string) => {
    this.getModuleFields(this.moduleId, '', searchText);
  }, 400);

  activeForm: ActiveForm;

  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private glocalDialogService: GlobaldialogService,
    private coreService: CoreService,
    private snackBar: MatSnackBar,
    private gridDataService: TransactionService,
    private sharedService: SharedServiceService,
    private serviceInstanceSharing: ServiceInstanceSharingService,
    private dataControlService: DataControlService
  ) {

    this.serviceInstanceSharing.setTransactionServiceInstance(this.gridDataService);
    this.serviceInstanceSharing.setDataControlServiceInstance(this.dataControlService);

    this.treeFlattener = new MatTreeFlattener(
      this._transformer,
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.fields
    );
    this.treeControl = new FlatTreeControl<TreeFlatNode>(
      (node) => node.level,
      (node) => node.expandable
    );
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  public get hideSidebar() { return this.arrowIcon === 'chevron-right'; }

  hasChild = (_: number, node: TreeFlatNode) => node.expandable;
  private _transformer = (node: TreeFlatNode, level: number) => {
    return {
      expandable: !!node.fields && node.fields.length > 0,
      name: node.name,
      level,
      moduleId: node.moduleId,
      fieldId: node.fieldId,
      picklist: node.picklist,
      dataType: node.dataType,
      moduleName: node.moduleName
    };
  };

  ngOnInit(): void {
    this.formId = this.activatedRouter.snapshot.params.formId;
    this.moduleId = this.activatedRouter.snapshot.params.moduleId;
    this.activeForm = {
      isPrimary: true,
      isNew: false,
      isReferenceForm: false,
      moduleId: this.moduleId,
      objnr: null,
      referenceRecordDetails: null
    };
    this.getModuleFields(this.moduleId, '', '');
    this.dataControlService.activeForm$.next({moduleId: this.moduleId, isPrimary: true, isNew: false, isReferenceForm: false, objnr: null, referenceRecordDetails: null});
  }

  ngOnDestroy(): void {
    this.gridDataService.resetMasterData();
    this.serviceInstanceSharing.resetServiceInstances();
    this.sharedService.setGridFormViewDetails(null);
    this.gridDataService.resetTransactioinService();
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }

  getFieldIcon(field: FilterFieldModel) {
    const find = picklistValues.find((f) => f.dataType === field.dataType && f.pickList === field.picklist);
    return find ? find.icon : 'text';
  }

  /**
   * Search the transformation rule ...
   * @param searchStr search the rule based on this params
   */
  searchOption(searchStr: string) {
    this.searchTearm = searchStr;
    this.delayedCallForApis(searchStr);
  }

  /**
   * edit filter details on field click
   * @param fieldObj clicked field object details
   */
  setActiveFilter(fieldObj: FilterFieldModel): void {
    const filter = this.suggestedFilters.find(
      (fc) => fc.moduleId === fieldObj.moduleId && fc.fieldId === fieldObj.fieldId
    );
    if (filter) {
      this.activeFilter = JSON.parse(JSON.stringify(filter));
    } else {
      this.activeFilter = this.buildFilter(fieldObj);
      if (fieldObj.picklist === '15') {
        const gridData = this.getGridFieldsById(this.dataSource.data, fieldObj.fieldId);
        this.activeFilter.fieldCtrl = gridData.fieldCtrl;
        if (this.activeFilter.fieldCtrl.grid.length > 0) {
          this.activeFilter.fieldCtrl.grid.forEach((gridField) => {
            if (gridField.picklist === '15') {
              const subGrid = this.getGridFieldsById(this.dataSource.data, gridField.fieldId);
              gridField.grid = subGrid.fieldCtrl.grid;
            }
          });
        }
      }
    }
  }

  buildFilter(fieldObj: FilterFieldModel) {
    const activeFilter = new FilterFieldModel();
    activeFilter.fieldId = fieldObj.fieldId;
    activeFilter.operator = 'EQUAL';
    activeFilter.values = fieldObj.values || [];
    activeFilter.esFieldPath = `hdvs.${fieldObj.fieldId}`;
    activeFilter.moduleName = fieldObj.moduleName;
    activeFilter.moduleId = fieldObj.moduleId;
    activeFilter.name = fieldObj.name;
    activeFilter.description = fieldObj.name;
    activeFilter.dataType = fieldObj.dataType;
    activeFilter.picklist = fieldObj.picklist;
    activeFilter.filterType = 'DYNAMIC';
    activeFilter.selectAll = false;
    activeFilter.showSelected = false;
    activeFilter.serchString = '';
    activeFilter.restrictedVal = fieldObj.restrictedVal || [];
    activeFilter.fieldCtrl = fieldObj.fieldCtrl || {};
    if (fieldObj.picklist === '54') {
      activeFilter.startValue = fieldObj.startValue;
      activeFilter.endValue = fieldObj.endValue;
    } else if (fieldObj.picklist === '38') {
      activeFilter.fieldCtrl = {
        fileTypes: fieldObj.fileTypes,
        isMultiSelect: fieldObj.isMultiSelect || false,
        attachmentSize: fieldObj.attachmentSize
      };
    }
    return activeFilter;
  }

  applyFilter(fieldObj: FilterFieldModel): void {
    if (fieldObj.name === this.headerDataFieldName) {
      return;
    }
    this.setActiveFilter(fieldObj);
    const filter = JSON.parse(JSON.stringify(this.activeFilter));
    const allFiltersIndex = this.suggestedFilters.findIndex(
      (fc) => fc.moduleId === this.activeFilter.moduleId && fc.fieldId === this.activeFilter.fieldId
    );

    if (allFiltersIndex === -1) {
      this.suggestedFilters.push(filter);
      this.activeFilter = this.suggestedFilters.find(
        (fc) => fc.moduleId === this.activeFilter.moduleId && fc.fieldId === this.activeFilter.fieldId
      );
    } else {
      this.suggestedFilters[allFiltersIndex] = filter;
    }
    // this.gridDataService.activeForm$.next(filter);
  }

  /**
   * get field desc based on field id
   * @returns field description
   */
  getFieldDescription(fieldId) {
    const field = this.suggestedFilters.find((f) => f.fieldId === fieldId);
    return field ? field.name || 'Unknown' : 'Unknown';
  }

  /**
   * Remove an applied filter
   * @param fieldObj filter field details
   * @param removeType module/field remove type
   */
  removeFilter(fieldObj: FilterFieldModel) {
    this.glocalDialogService.confirm({ label: 'Are you sure to remove this filter ?' }, (resp) => {
      if (resp && resp === 'yes') {
        if (this.activeFilter && this.activeFilter.fieldId === fieldObj.fieldId) {
          this.activeFilter = null;
        }
        const masterData = this.gridDataService.getMasterData(fieldObj?.moduleId);
        if (
          masterData?.mdoRecordES?.gvs &&
          Object.keys(masterData?.mdoRecordES?.gvs).length &&
          masterData?.mdoRecordES?.gvs[fieldObj?.fieldId]
        ) {
          Object.keys(masterData?.mdoRecordES?.gvs).forEach((record) => {
            if (record === fieldObj?.fieldId) {
              delete masterData?.mdoRecordES?.gvs[record];
            }
          });
          this.gridDataService.setMasterData(this.activeForm, this.moduleId, masterData, false, 0);
        }
        this.suggestedFilters = [...this.suggestedFilters.filter((obj) => obj.fieldId !== fieldObj.fieldId)];
      }
    });
  }

  getModuleFields(moduleId: string, moduleName: string, searchText: string) {
    forkJoin([
      this.coreService.getMetadataFieldsByModuleIds([moduleId], searchText, this.formId),
      this.coreService.getMetadataFieldsData(this.formId, +this.moduleId)
    ]).subscribe((response) => {
      this.dataSource.data = this.buildDataSource(response, moduleName);
      this.treeControl.expandAll();
      if (this.suggestedFilters.length > 0) {
        this.setActiveFilter(this.suggestedFilters[0]);
      }
    });
  }

  buildDataSource(metaDataResponse: any[], moduleName: string) {
    let dataSourceData: { name: string; fields: TreeFlatNode[] }[] = [];
    if (metaDataResponse) {
      const fieldsMetaData = metaDataResponse[0];
      const fieldsExistingData = metaDataResponse[1] as DefaultValuesRequest;
      if (fieldsMetaData?.headers) {
        const headers = fieldsMetaData.headers;
        const dataSourceItem = {
          name: this.headerDataFieldName,
          fields: Object.keys(headers).map((key) => ({
            moduleName,
            ...this.getUpdatedField(headers[key], fieldsExistingData, 2)
          }))
        };
        dataSourceData.push(dataSourceItem);
      }
      if (Array.isArray(fieldsMetaData?.hierarchy) && fieldsMetaData?.hierarchy.length > 0 && fieldsMetaData?.hierarchyFields) {
        fieldsMetaData?.hierarchy.forEach(hierarchy => {
          if (fieldsMetaData?.hierarchyFields[hierarchy.structureId]) {
            const dataSourceItem = {
              name: hierarchy.heirarchyText,
              fields: Object.keys(fieldsMetaData?.hierarchyFields[hierarchy.structureId]).map((key) => ({
                moduleName,
                ...this.getUpdatedField(fieldsMetaData?.hierarchyFields[hierarchy.structureId][key], fieldsExistingData, 2)
              }))
            };
            dataSourceData.push(dataSourceItem);
          }
        })
      }
      dataSourceData = [
        ...dataSourceData,
        ...this.buildGridDataSource(fieldsMetaData, fieldsExistingData, moduleName, 1)
      ];
      this.applyGridData(fieldsExistingData, dataSourceData);
    }
    return dataSourceData;
  }

  buildGridDataSource(fieldsMetaData, fieldsExistingData, moduleName, leval) {
    const dataSourceData = [];
    if (fieldsMetaData?.grids && fieldsMetaData?.gridFields) {
      Object.keys(fieldsMetaData.grids).forEach((gridKey) => {
        const gridField = fieldsMetaData.gridFields[gridKey];
        const grids = fieldsMetaData.grids[gridKey];
        if (gridField) {
          const dataSourceItem = {
            moduleName,
            ...this.getUpdatedField(grids, fieldsExistingData, leval),
            fields: Object.keys(gridField).map((key) => ({
              moduleName,
              ...this.getUpdatedChildField(fieldsMetaData, gridField[key], fieldsExistingData, moduleName, leval + 1)
            }))
          };
          dataSourceData.push(dataSourceItem);
        }
      });
    }
    return dataSourceData;
  }

  getUpdatedChildField(fieldsMetaData, gridField, fieldsExistingData, moduleName, level) {
    if (gridField.pickList === '15') {
      const newFieldsMetaData = {
        grids: {},
        gridFields: fieldsMetaData.gridFields
      };
      newFieldsMetaData.grids[gridField.fieldId] = gridField;
      return this.buildGridDataSource(newFieldsMetaData, fieldsExistingData, moduleName, level)[0];
    } else {
      return this.getUpdatedField(gridField, fieldsExistingData, level);
    }
  }

  applyGridData(data: DefaultValuesRequest, dataSource) {
    if (data.gvs && Object.keys(data.gvs).length > 0) {
      let masterRecord = { mdoRecordES: { gvs: {} } };
      Object.keys(data.gvs).forEach((gridId) => {
        const foundGridFilter = this.suggestedFilters.find(
          (fc) => fc.moduleId == this.moduleId && fc.fieldId === gridId
        );
        if (foundGridFilter) {
          const gridData = this.getGridFieldsById(dataSource, gridId);
          foundGridFilter.fieldCtrl = gridData.fieldCtrl;
          if (!masterRecord.mdoRecordES.gvs[gridId]) {
            masterRecord.mdoRecordES.gvs[gridId] = {
              rows: []
            };
          }
          (data.gvs[gridId]?.rows || []).forEach((row, idx) => {
            const rowData = this.gridDataService.createNewRow(false, null, gridData.gridFields);
            gridData.gridFields.forEach((gridField) => {
              if (rowData.row[gridField.fieldId]) {
                rowData.row[gridField.fieldId].vc = (row[gridField.fieldId.toLowerCase()].fieldVal || []).map(
                  (val) => ({ c: val, t: null })
                );
              }
            });
            masterRecord.mdoRecordES.gvs[gridId].rows.push(rowData.row);
            foundGridFilter['gvs'] = masterRecord.mdoRecordES?.gvs[gridId];
          });
        } else {
          foundGridFilter.fieldCtrl = { grid: [], description: foundGridFilter?.name };
        }
      });
      this.gridDataService.parentDatasetIdSub.next(this.moduleId);
      this.gridDataService.setMasterData (this.activeForm, this.moduleId, masterRecord, false, 0);
    } else {
      const masterRecord = { mdoRecordES: { gvs: {} } };
      this.gridDataService.parentDatasetIdSub.next(this.moduleId);
      this.gridDataService.setMasterData(this.activeForm, this.moduleId, masterRecord, false, 0);
    }
  }

  getGridFieldsById(dataSource, gridId: string) {
    const gridData = dataSource.find((item) => item.fieldId === gridId);
    let gridFields = gridData?.fields || [];
    return {
      fieldCtrl: {
        grid: gridFields.map((item) => {
          item.fieldDescri = item.name;
          item.description = item.name;
          item.permissions = {
            addRow: true,
            editRow: true,
            removeRow: true,
            removeMultipleRow: true,
            copyRow: true,
            export: true,
            import: true,
            sortOrder: 'ASC'
          };
          return item;
        }),
        description: gridData?.description
      },
      gridFields
    };
  }

  getUpdatedField(fieldObj: FilterFieldModel, data: DefaultValuesRequest, level: number): any {
    fieldObj['level'] = level;
    fieldObj['expandable'] = false;
    fieldObj.name = fieldObj.description;
    fieldObj.picklist = fieldObj['pickList'];
    const foundFieldValue: AppliedValue = data.appliedValue.find((item) => item.fieldId === fieldObj.fieldId);
    if (foundFieldValue) {
      if (fieldObj.picklist === '54') {
        const fieldValue =
          Array.isArray(foundFieldValue.fieldVal) && foundFieldValue.fieldVal.length > 0
            ? JSON.parse(foundFieldValue.fieldVal.join(','))
            : null;
        fieldObj.startValue = fieldValue?.startValue || null;
        fieldObj.endValue = fieldValue?.endValue || null;
        fieldObj.values = [];
      } else {
        fieldObj.values = foundFieldValue.fieldVal;
      }
      fieldObj.restrictedVal = foundFieldValue.restrictedVal;
      this.suggestedFilters.push(this.buildFilter(fieldObj));
    }
    if (data.gvs && Object.keys(data.gvs)) {
      Object.keys(data.gvs).forEach((gridId) => {
        const foundFilter = this.suggestedFilters.find((f) => f.fieldId === gridId);
        if (gridId === fieldObj.fieldId && !foundFilter) {
          this.suggestedFilters.push(this.buildFilter(fieldObj));
        }
      });
    }
    return fieldObj;
  }

  updateFilterObjValue(ev: FilterFieldModel): void {
    this.activeFilter.values = ev.values;
    const suggFilterObj = this.suggestedFilters.find(
      (fc) => fc.moduleId === this.activeFilter.moduleId && fc.fieldId === this.activeFilter.fieldId
    );
    suggFilterObj.values = ev.values;
    suggFilterObj.startValue = ev.startValue;
    suggFilterObj.endValue = ev.endValue;
    suggFilterObj.operator = ev.operator;
    // suggFilterObj.serchString = ev.serchString;
    suggFilterObj.showSelected = ev.showSelected;
    suggFilterObj.selectAll = ev.selectAll;
    suggFilterObj.unit = ev.unit;
    suggFilterObj.restrictedVal = ev?.restrictedVal;
  }

  save(): void {
    const request: DefaultValuesRequest = {
      dataSet: this.moduleId,
      formId: this.formId,
      appliedValue: [],
      gvs: {}
    };
    this.suggestedFilters.forEach((filter: FilterFieldModel) => {
      if (filter.picklist !== '15') {
        let fieldVal;
        if (filter.picklist === '54') {
          fieldVal = [JSON.stringify({ startValue: filter.startValue, endValue: filter.endValue })];
        } else if(filter.picklist === '31') {
          const editorOutput: any = {...filter.values };
          fieldVal = [editorOutput?.newValue];
        } else {
          fieldVal = filter.values;
        }
        request.appliedValue.push({
          fieldId: filter.fieldId,
          fieldVal,
          restrictedVal: filter.restrictedVal
        });
      } else if (filter['gvs']) {
        const gridData = this.buildGridRequest(filter);
        request.gvs = { ...request.gvs, ...gridData };
      }
    });
    if (Object.keys(request.gvs).length === 0) {
      delete request.gvs;
    }
    this.coreService.saveDefaultValues(request).subscribe(
      (response) => {
        this.snackBar.open(`Successfully saved !`, 'Close', { duration: 3000 });
      },
      (error) => {
        // this.snackBar.open(`Something went wrong `, 'Close', { duration: 3000 });
        this.showValidationError(error?.error?.errorMsg || 'Something went wrong');
        return;
      }
    );

    this.formatMasterData();
  }

  /**
   * will transform changed master data record to transaction-grid format
   */
  formatMasterData() {
    const masterRecord = this.gridDataService.getMasterData(this.moduleId);
    Object.keys(masterRecord?.mdoRecordES?.gvs).map((key) => {
      const record = masterRecord.mdoRecordES.gvs[key];
      record?.rows.forEach((element) => {
        if (element?.UUID?.hasOwnProperty('fieldId')) {
          element.UUID = this.transformUUID(element.UUID, 'UUID');
          element.MSGFN = {
            bc: null,
            fid: 'MSGFN',
            ls: null,
            oc: null,
            vc: [
              {
                c: MSGFN.create,
                t: ''
              }
            ]
          };
          Object.keys(element).forEach((field) => {
            if (field.toString().includes('FLD_') || field.toString().includes('fld_')) {
              element[field] = this.transformFieldObject(element[field]);
            }
          });
          if (element?.PARENT_UUID?.hasOwnProperty('fieldId')) {
            element.PARENT_UUID = this.transformUUID(element.PARENT_UUID, 'PARENT');
          }
        }
      });
    });
    this.gridDataService.setMasterData(this.activeForm, this.moduleId, masterRecord, false, 0);
  }

  transformFieldObject(field) {
    return {
      bc: null,
      fid: field.fieldId,
      ls: null,
      oc: null,
      vc: field?.fieldVal?.map((fldVal) => {
        return { c: fldVal, t: null };
      })
    };
  }

  transformUUID(uuidElement, type) {
    return {
      bc: null,
      fid: type === 'UUID' ? 'UUID' : 'PARENT_UUID',
      ls: null,
      oc: null,
      vc: [
        {
          c: uuidElement?.fieldVal && uuidElement?.fieldVal[0] ? uuidElement?.fieldVal && uuidElement?.fieldVal[0] : '',
          t: ''
        }
      ]
    };
  }

  /**
   * Grid payload request: generating grid request object for grid and determining
   * whether the grid has any sub grid fields, if yes, recursively building request object
   * and doing the same for sub grid to achieve desired payload format.
   * @param filter FilterFieldModel
   */
  buildGridRequest(filter: FilterFieldModel) {
    let requestGvs = {};
    requestGvs[filter.fieldId] = filter['gvs'];

    if (!requestGvs?.[filter.fieldId]?.rows) return requestGvs;

    requestGvs[filter.fieldId].rows = filter['gvs'].rows.map((rowField) => {
      const fieldRequest: { [key: string]: GridDefaultValueRequest } = {};
      filter?.fieldCtrl?.grid.map((gridField) => {
        if (gridField.picklist === '15') {
          requestGvs = {
            ...requestGvs,
            ...this.buildGridRequest({ ...gridField, fieldCtrl: { grid: gridField.grid } })
          };
        } else {
          fieldRequest['PARENT_UUID'] = {
            fieldId: 'PARENT_UUID',
            fieldVal: []
          };
          fieldRequest['UUID'] = {
            fieldId: 'UUID',
            fieldVal: []
          };
          if (rowField['PARENT_UUID']?.vc?.length > 0) {
            const parentFields = rowField['PARENT_UUID']?.vc.filter((value) => !!value.c).map((value) => value.c);
            if (parentFields.length > 0) {
              fieldRequest['PARENT_UUID'].fieldVal = parentFields;
            }
          } else if (rowField['PARENT_UUID']?.fieldVal) {
            fieldRequest['PARENT_UUID'] = rowField['PARENT_UUID'];
          }
          if (rowField['UUID']?.vc?.length > 0) {
            const fieldUUID = rowField['UUID']?.vc.filter((value) => !!value.c).map((value) => value.c);
            if (fieldUUID.length > 0) {
              fieldRequest['UUID'].fieldVal = fieldUUID;
            }
          } else if (rowField['UUID']?.fieldVal) {
            fieldRequest['UUID'] = rowField['UUID'];
          }
          if (rowField[gridField.fieldId].fieldVal) {
            fieldRequest[gridField.fieldId] = {
              fieldId: gridField.fieldId,
              fieldVal: rowField[gridField.fieldId].fieldVal
            };
          } else {
            fieldRequest[gridField.fieldId] = {
              fieldId: gridField.fieldId,
              fieldVal: rowField[gridField.fieldId].vc.map((value) => value.c)
            };
          }
        }
      });
      return fieldRequest;
    });
    return requestGvs;
  }

  /**
   * Function to hide validation error
   * @param message: error message to display..
   */
  showValidationError(message: string) {
    this.validationError.status = true;
    this.validationError.message = message;
    setTimeout(() => {
      this.validationError.status = false;
    }, 3000);
  }

  toggleSideBar() {
    this.arrowIcon = this.arrowIcon === 'chevron-left' ? 'chevron-right' : 'chevron-left';
  }
}
