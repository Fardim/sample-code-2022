import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridFields, Heirarchy, MetadataModel } from '@models/schema/schemadetailstable';
import { DisplayCriteria } from '@modules/report/_models/widget';
import { ReportService } from '@modules/report/_service/report.service';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { Observable, of, Subscription } from 'rxjs';
import { isEqual } from 'lodash';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CoreService } from '@services/core/core.service';

@Component({
  selector: 'pros-report-datatable-column-settings',
  templateUrl: './report-datatable-column-settings.component.html',
  styleUrls: ['./report-datatable-column-settings.component.scss']
})


export class ReportDatatableColumnSettingsComponent implements OnInit, OnDestroy {
  /**
   * object number/module id of the report
   */
  objectNumber: string;

  /**
   * Array of the headers meta data
   */
  headers: MetadataModel[] = [];

  /**
   * to store the complete data from shared service
   */
  data = null;

  /**
   * array to store only field Ids of headers
   */
  fieldIdArray = [];

  /**
   * to store search result of headers while searching from search bar
   */
  suggestedHeaders = [];

  /**
   * to store is all checkbox are selected or not
   */
  allCheckboxSelected = false;

  /**
   * to store indeterminate state
   */
  allIndeterminate = false;


  headersObs: Observable<MetadataModel[]> = of([]);

  selectedHeadersObs : Observable<MetadataModel[]> = of([]);

  /**
   * All the http or normal subscription will store in this array
   */
  subscriptions: Subscription[] = [];
  allDisplayCriteria: DisplayCriteria;
  headersCountLimit = 20;
  dataSourceCountLimit = 0;
  displayCriteriaForAll: DisplayCriteria;

  /** system fields for Transactional module dataset */
  systemFields = [
    {
      fieldId: 'STATUS',
      fieldDescri: 'Status',
    } as MetadataModel,
    {
      fieldId: 'USERMODIFIED',
      fieldDescri: 'User Modified',
      picklist: '37',
      dataType: 'AJAX',
    } as MetadataModel, {
      fieldId: 'DATEMODIFIED',
      fieldDescri: 'Update Date',
      picklist: '0',
      dataType: 'DTMS',
    } as MetadataModel, {
      fieldId: 'DATECREATED',
      fieldDescri: 'Creation Date',
      picklist: '0',
      dataType: 'DTMS',
    } as MetadataModel
  ];
  userConfigured: boolean = undefined;
  showConfiguredBanner: boolean;
  tempHeaders: MetadataModel[] = [];

  /**
   * array that stores the data of grid and hierarchy data
   */
  nestedDataSource: any[] = [];

  selectedNestedDataSOurce : any[] = [];

  /**
   * array that stored the gridfields values
   */
  gvsFields: GridFields[] = [];

  /**
   * array to store the data of grid and heirarchy data
   */
  dataSource: any[] =[] ;

  /**
   * array to store all child nodes for hierarchy
   */
  hvyFields: MetadataModel[] = [];

  searchFormControl: FormControl;
  showLoader = false;
  /**
   * Constructor of class
   */
  constructor(private router: Router,
    private schemaDetailsService: SchemaDetailsService,
    private sharedService: SharedServiceService,
    private reportService: ReportService,
    private coreService : CoreService
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * ANGULAR HOOK
   */
  ngOnInit(): void {
    this.searchFormControl = new FormControl('');

    const reportDataTable = this.sharedService.getReportDataTableSetting().subscribe(data => {
      if (data?.isRefresh === false) {
        this.data = data;

        this.setOriginalConfigured();

        this.objectNumber = data.objectType;
        if (!data.isWorkflowdataSet && !data.isCustomdataSet) {
          this.getAllMetaDataFields(this.objectNumber);
        }
        if ((data.isWorkflowdataSet === true) && !data.isCustomdataSetdata) {
          if (data.objectType.includes(',')) {
            const objectType = data.objectType.split(',');
            this.getWorkFlowFields(objectType);
          } else {
            this.getWorkFlowFields(Array(this.objectNumber))
          }
        }
        if ((data.isCustomdataSet === true) && !data.isWorkflowdataSet) {
          this.getCustomFields(this.objectNumber);
        }
      }
    });
    this.subscriptions.push(reportDataTable);
    this.searchFormControl.valueChanges.pipe(debounceTime(500)).subscribe(res => {
      this.searchHeader(res);
    })
  }

  /**
   * function to close side sheet
   */
  close() {
    this.router.navigate(['', { outlets: { sb: null } }])
  }

  /**
   * function to get all metaData
   * @param objectNumber object number of widget
   */
  getAllMetaDataFields(objectNumber: string) {
    this.showLoader = true;
    const metadataFields = this.coreService.getMetadataFieldsByModuleId([objectNumber],this.searchFormControl.value).subscribe(data => {
      this.showLoader = false;
      if (this.data && this.data.selectedColumns && this.data.selectedColumns.length > 0) {
        this.data.selectedColumns.forEach(selectedColumn => {
          const index = Object.keys(data.headers).indexOf(selectedColumn.fieldId);
          if (index > -1) {
            this.headers.push(selectedColumn);
          } else {
            const ind = this.systemFields.findIndex(fields => fields.fieldId === selectedColumn.fieldId)
            if (ind > -1) {
              this.headers.push(selectedColumn);
            }
          }
        });
      }
      /**
       * building array of fieldIds of headers
       * why...because with this we can restrict duplicate entries
       */
      this.fieldIdArray = this.headers.map(header => header.fieldId);

      this.systemFields.forEach(system => {
        const index = this.fieldIdArray.indexOf(system.fieldId);
        if (index === -1) {
          system.displayCriteria = this.data.displayCriteria;
          this.headers.push(system);
        }
      })

      for (const metaData in data.headers) {
        if (data.headers[metaData]) {
          if (this.fieldIdArray.indexOf(data.headers[metaData].fieldId) === -1) {
            data.headers[metaData].displayCriteria = data.headers[metaData].displayCriteria ? data.headers[metaData].displayCriteria : this.data.displayCriteria;
            this.headers.push(data.headers[metaData])
          }
        }
      }
      const inarray = this.fieldIdArray.find(dt => dt === 'objectNumber')
      if (inarray === undefined) {
        const objectnumber: any = { fieldId: 'objectNumber', fieldDescri: 'Object Number' };
        this.headers.unshift(objectnumber)
      }
      this.headersObs = of(this.headers);
      this.selectedHeadersObs = of(this.headers.slice(0,this.headersCountLimit));
      this.prepareNestedDataSource(data);
    }, error => {
      console.error('Error occur while getting meta data fields', error.message)
    });
    this.subscriptions.push(metadataFields);
  }

  prepareNestedDataSource(data){
    const gvs = [];
      const gridsData = data.grids;
      const gridFieldsData = data.gridFields;
      const selectedColumnsList = this.data.selectedColumns;
      Object.keys(gridsData).sort().forEach(item => {
        if (item) {
          const gridNode: any = {};
          gridNode.nodeDesc = gridsData[item].fieldDescri;
          gridNode.nodeId = item;
          const childNodeData = [];
          if (gridFieldsData.hasOwnProperty(item)) {
            selectedColumnsList.forEach(column => {
              const selectedColumn = Object.keys(gridFieldsData[item]).find(key => key === column.fieldId);
              if (selectedColumn) {
                const childNode = gridFieldsData[item][selectedColumn];
                childNode.displayCriteria = column.displayCriteria;
                childNode.nodeDesc = gridFieldsData[item][selectedColumn].fieldDescri;
                childNodeData.push(childNode);
              }
            })
            Object.keys(gridFieldsData[item]).forEach(gridData => {
              const index = selectedColumnsList.findIndex(selectedColumn => selectedColumn.fieldId === gridData);
              if (index === -1) {
                const childNode = gridFieldsData[item][gridData];
                childNode.displayCriteria = this.data.displayCriteria;
                childNode.nodeDesc = gridFieldsData[item][gridData].fieldDescri;
                childNodeData.push(childNode)
              }
            });
            gridNode.child = [...childNodeData]
            this.gvsFields.push(...gridNode.child);
          }
          else {
            gridNode.child = null;
          }
          gvs.push(gridNode);
        }
      })

      const hvysData: Heirarchy[] = [];
      this.hvyFields = [];
      const hierarchyData: any = {};
      const hierarchyList = data.hierarchy;
     const hierarchyFieldData = data.hierarchyFields;
      hierarchyList.forEach((hierarchy: Heirarchy) => {
        hierarchyData.nodeDesc = hierarchy.heirarchyText;
        hierarchyData.nodeId = hierarchy.fieldId;
        const childNodeData = [];
        selectedColumnsList.forEach(column => {
          const selectedColumn = Object.keys(hierarchyFieldData[hierarchy.heirarchyId]).find(key => key === column.fieldId);
          if (selectedColumn) {
            const childNode = hierarchyFieldData[hierarchy.heirarchyId][selectedColumn];
            childNode.displayCriteria = column.displayCriteria;
            childNode.nodeDesc = hierarchyFieldData[hierarchy.heirarchyId][selectedColumn].fieldDescri;
            childNodeData.push(childNode);
          }
        })

        Object.keys(hierarchyFieldData[hierarchy.heirarchyId]).forEach((hierarchydata: string) => {
          const index = selectedColumnsList.findIndex(selectedColumn => hierarchyFieldData[hierarchy.heirarchyId][hierarchydata].fieldId === selectedColumn.fieldId);
          if (index === -1) {
            const childNode = hierarchyFieldData[hierarchy.heirarchyId][hierarchydata];
            childNode.nodeId = hierarchy.fieldId;
            childNode.displayCriteria = this.data.displayCriteria;
            childNode.nodeDesc = hierarchyFieldData[hierarchy.heirarchyId][hierarchydata].fieldDescri;
            childNodeData.push(childNode);
          }
        });

        hierarchyData.child = childNodeData;
        hvysData.push({ ...hierarchyData });
        this.hvyFields.push(...childNodeData);
      })
      this.nestedDataSource = [...gvs, ...hvysData];
      this.selectedNestedDataSOurce = this.nestedDataSource.slice(0,this.dataSourceCountLimit)
      this.dataSource = [...this.nestedDataSource];
      this.manageStateOfCheckbox();
  }

  /**
   * function to get workflow Fields of widget
   * @param objectNumber object number of widget
   */
  getWorkFlowFields(objectNumber: string[]) {
    const workflowFields = this.coreService.getWorkFlowFields(objectNumber).subscribe(data => {
      if (this.data && this.data.selectedColumns && this.data.selectedColumns.length > 0) {
        this.data.selectedColumns.forEach(selectedColumn => {
          this.headers.push(selectedColumn);
        })
      }
      /**
       * building array of fieldIds of headers
       * why...because with this we can restrict duplicate entries
       */
      this.fieldIdArray = this.headers.map(header => header.fieldId);
      const staticHeaders = data.staticFields;
      /**
       * check and push static headers
       */
      staticHeaders.forEach((staticHeader) => {
        const index = this.fieldIdArray.indexOf(staticHeader.fieldId);
        if (index === -1) {
          staticHeader.displayCriteria = staticHeader.displayCriteria ? staticHeader.displayCriteria : this.data.displayCriteria;
          this.headers.push(staticHeader);
        }
      })
      const WorkflowFields = data.workflowFields;
      /**
       * check existance and push dynamic headers
       */
       WorkflowFields.forEach((workflowFields) => {
        if (this.fieldIdArray.indexOf(workflowFields.fieldId) === -1) {
          workflowFields.displayCriteria = workflowFields.displayCriteria ? workflowFields.displayCriteria : this.data.displayCriteria;
          this.headers.push(workflowFields)
        }
      });

      const hierarchyFlds = data.hierarchy;
      /**
       * check existance and push dynamic headers
       */
       hierarchyFlds.forEach((hierechyFld) => {
        if (this.fieldIdArray.indexOf(hierechyFld.fieldId) === -1) {
          this.headers.push(hierechyFld);
        }
      });

      this.headersObs = of(this.headers);
      this.selectedHeadersObs = of(this.headers.slice(0,this.headersCountLimit));
      this.manageStateOfCheckbox();
    }, error => {
      console.error('Error while getting report workflow fields', error.message);
    });
    this.subscriptions.push(workflowFields);
  }

  /**
   * While drag and drop on list elements
   * @param event dragable element
   */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      moveItemInArray(this.headers, event.previousIndex, event.currentIndex);
      moveItemInArray(this.nestedDataSource, event.previousIndex, event.currentIndex);
    }
  }

  /**
   * function to to copy tempHeaders and set all displayCriteria to default displayCriteria
   */
  setOriginalConfigured() {
    if (this.data && this.data.selectedColumns && this.data.selectedColumns.length > 0) {
      this.tempHeaders = JSON.parse(JSON.stringify(this.data.selectedColumns));
      this.tempHeaders.forEach(h => h.displayCriteria = this.data.displayCriteria);
    }
  }

  /**
   * function to trigger on check/uncheck checkbox
   */
  selectionChange(checkbox: MetadataModel) {
    let flag = false;
    let selectedDiplayCriteria : DisplayCriteria;
    this.data.selectedColumns.forEach((selectedColumn, index) => {
      selectedDiplayCriteria = selectedColumn.displayCriteria;
      if (selectedColumn.fieldId === checkbox.fieldId) {
        this.data.selectedColumns.splice(index, 1);
        flag = true;
        // return flag;
      }
    })
    if (flag === false) {
      checkbox.displayCriteria = this.allDisplayCriteria ? this.allDisplayCriteria : selectedDiplayCriteria;
      this.data.selectedColumns.push(checkbox);
    }
    this.setDisplayCriteriaForNestedDataSource();
    this.manageStateOfCheckbox();
    this.setOriginalConfigured();
  }

  /**
   * function to manage the state of checkbox
   */
  manageStateOfCheckbox() {
    if (this.headers.length + this.gvsFields.length + this.hvyFields.length === this.data.selectedColumns.length) {
      this.allCheckboxSelected = true;
      this.allIndeterminate = false;
    }
    if ((this.headers.length + this.gvsFields.length + this.hvyFields.length !== this.data.selectedColumns.length) && this.data.selectedColumns.length !== 0) {
      this.allIndeterminate = true;
      this.allCheckboxSelected = false;
    }
    this.manageAllDisplayCriteria();
  }

  /**
   * function to manage all DisplayCriteria are the same
   */
  manageAllDisplayCriteria() {
    const columns: MetadataModel[] = this.headers;
    if(columns && columns.length > 0) {
      const text = !columns.some(s => s.displayCriteria && s.displayCriteria !== DisplayCriteria.TEXT);
      if (text) {
        this.allDisplayCriteria = DisplayCriteria.TEXT;
        return;
      }

      const code = !columns.some(s => s.displayCriteria && s.displayCriteria !== DisplayCriteria.CODE);
      if (code) {
        this.allDisplayCriteria = DisplayCriteria.CODE;
        return;
      }

      const codeText = !columns.some(s => s.displayCriteria && s.displayCriteria !== DisplayCriteria.CODE_TEXT);
      if (codeText) {
        this.allDisplayCriteria = DisplayCriteria.CODE_TEXT;
        return;
      }
    }
    this.allDisplayCriteria = null;
  }

  /**
   * function to show or not show the Configured Banner
   */
  manageConfigure() {
    if (this.userConfigured === undefined) {
      if (isEqual(this.data.selectedColumns, this.tempHeaders)) {
        this.showConfiguredBanner = false;
      } else {
        this.showConfiguredBanner = true;
      }
    }
  }

  /**
   * function to change all selected column to a DisplayCriteria
   */
  changeAllDisplayCriteria() {
    const selectDisplayCriteria = (row: MetadataModel) => {
      if (row.picklist === '1' || row.picklist === '30' || row.picklist === '37' || row.picklist === '29') {
        row.displayCriteria = this.allDisplayCriteria;
      }
    }
    // this.headers.forEach((row) => { if(this.data.selectedColumns.indexOf(row.fieldId) > -1) { selectDisplayCriteria(row)}});
    // this.dataSource.forEach(data => {
    //   data.child.forEach((row) => {if(this.data.selectedColumns.indexOf(row.fieldId) > -1){ selectDisplayCriteria(row)}});
    // })

    this.setDisplayCriteriaForNestedDataSource();
    this.data.selectedColumns.forEach(row => selectDisplayCriteria(row));
    this.manageConfigure();
  }

  setDisplayCriteriaForNestedDataSource(){
    const selectedColumns = this.data.selectedColumns;
    this.selectedNestedDataSOurce.forEach(data => {
      data.child.forEach((row) => {
        selectedColumns.forEach(column => {
          if(column.fieldId === row.fieldId){
            row.displayCriteria = this.allDisplayCriteria;
          }
        });
      });
    })
  }

  /**
   * function to check that it will be checked or not
   */
  isChecked(header: MetadataModel) {
    const fieldIdArray = [];
    this.data.selectedColumns.forEach(column => {
      fieldIdArray.push(column.fieldId);
    })
    const index = fieldIdArray.indexOf(header.fieldId);
    return index !== -1 ? true : false
  }

  /**
   * function to select all or unselect all checkbox.
   */
  selectAllCheckboxes() {
    if (!this.allCheckboxSelected) {
      const allSelectedData = [];
      this.dataSource.forEach(item => {
        item.child.forEach(data => {
          allSelectedData.push(data);
        })
      })
      this.allIndeterminate = false;
      this.data.selectedColumns = [];
      this.data.selectedColumns = [...JSON.parse(JSON.stringify(this.headers)), ...JSON.parse(JSON.stringify(allSelectedData))];
      this.allCheckboxSelected = true;
    } else {
      this.allIndeterminate = false;
      this.data.selectedColumns = [];
      this.allCheckboxSelected = false;
    }
  }


  /**
   * function to search headers from search bar
   * @param value string to be searched
   */
  searchHeader(value: string) {
    const listData = JSON.parse(JSON.stringify(this.dataSource));
    this.nestedDataSource = [];
    if (value && value.trim() !== '') {
      const headers = this.headers.filter(header => header.fieldDescri.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1);
      this.headersObs = of(headers);
      this.nestedDataSource = value ? this.filtered(listData, value) : listData;
      this.selectedNestedDataSOurce = this.nestedDataSource;
      this.selectedHeadersObs = of(headers);
    } else {
      this.nestedDataSource = this.dataSource;
      this.headersObs = of(this.headers);
      this.selectedNestedDataSOurce = this.nestedDataSource;
      this.selectedHeadersObs = of(this.headers);
    }
  }

  filtered(array, text) {
    const getChildren = (result, object) => {
      const re = new RegExp(text, 'gi');
      if (object.nodeDesc.match(re)) {
        result.push(object);
        return result;
      }
      if (Array.isArray(object.child)) {
        const children = object.child.reduce(getChildren, []);
        if (children.length) result.push({ ...object, child: children });
      }
      return result;
    };
    return array.reduce(getChildren, []);
  }

  /**
   * function to submit column setting
   */
  submitSetting() {
    const fieldId = []
    this.data.selectedColumns.forEach((column) => {
      fieldId.push(column.fieldId);
    })
    const inOrderHeader: MetadataModel[] = [];
    this.headers.forEach((header) => {
      if (fieldId.indexOf(header.fieldId) !== -1) {
        inOrderHeader.push(header);
      }
    })

    this.dataSource.forEach(item => {
      item.child.forEach(data => {
        const index = fieldId.findIndex((el) => el === data.fieldId)
        if (index > -1) {
          inOrderHeader.push(data);
        }
      })
    })

    inOrderHeader.forEach(header => {
      const selectedItemIndex = this.data.selectedColumns.findIndex((el) => el.fieldId === header.fieldId);
      if(selectedItemIndex > -1){
        header.displayCriteria = this.data.selectedColumns[selectedItemIndex].displayCriteria
      }
    });

    this.updateTableView(inOrderHeader);
  }

  /**
   * function to update table view
   */
  updateTableView(headerInOrder: MetadataModel[]) {
    if (this.showConfiguredBanner && this.userConfigured === undefined) {
      this.setUserConfigured(true);
      return;
    }

    const prepareData = [];
    let order = 0;
    headerInOrder.forEach(header => {
      const obj = {
        widgetId: this.data.widgetId,
        fields: header.fieldId,
        sno: header.sno,
        displayCriteria: this.userConfigured ? header.displayCriteria ? header.displayCriteria : this.allDisplayCriteria : null,
        createdBy: this.data.userDetails.userName,
        fieldOrder: order++
      }
      prepareData.push(obj);
    });
    // const saveDisplayCriteria = this.widgetService.saveDisplayCriteria(this.data.widgetId, this.data.widgetType, null, prepareData).subscribe(res => {
    // }, error => {
    //   console.error('Error while updating report data table column settings', error.message);
    // });
    // this.subscriptions.push(saveDisplayCriteria);
    const reportDataTable = this.schemaDetailsService.createUpdateReportDataTable(this.data.widgetId, prepareData).subscribe(response => {
      this.close();
      this.data.isRefresh = true;
      this.sharedService.setReportDataTableSetting(this.data);
      this.sharedService.tableListConfigureSaved.next(true);
    }, error => {
      console.error('Error while updating report data table column settings', error.message);
    });
    this.subscriptions.push(reportDataTable);
  }

  /**
   * function to get Custom Fields of widget
   * @param objectNumber object number of widget
   */
  getCustomFields(objectNumber: string) {
    this.showLoader = true;
    const CustomfldSub = this.reportService.getCustomDatasetFields(objectNumber).subscribe(data => {
      this.showLoader = false;
      if (this.data && this.data.selectedColumns && this.data.selectedColumns.length > 0) {
        this.data.selectedColumns.forEach(selectedColumn => {
          this.headers.push(selectedColumn);
        })
      }
      /**
       * building array of fieldIds of headers
       * why...because with this we can restrict duplicate entries
       */
      this.fieldIdArray = this.headers.map(header => header.fieldId);

      /**
       * check and push static headers
       */
      data.forEach((CustomField) => {
        const index = this.fieldIdArray.indexOf(CustomField.fieldId);
        if (index === -1) {
          this.headers.push(CustomField);
        }
        // if (index !== -1) {
        //   CustomField.displayCriteria = CustomField.displayCriteria ? CustomField.displayCriteria : this.data.displayCriteria;
        //   this.headers[index] = CustomField;
        // }
      });

      this.headersObs = of(this.headers);
      this.selectedHeadersObs = of(this.headers.slice(0,this.headersCountLimit));
      this.manageStateOfCheckbox();
    }, error => {
      this.showLoader = false;
      console.error('Error while getting report workflow fields', error.message);
    });
    this.subscriptions.push(CustomfldSub);
  }

  /**
   * function to set this.userConfigured. If false will set all displayCriteria to the default
   */
  setUserConfigured(value: boolean) {
    this.userConfigured = value;
    if (!this.userConfigured) {
      this.headers.forEach((item) => {
        item.displayCriteria = this.data.displayCriteria;
      });

      this.dataSource.forEach(data => {
        data.child.forEach(item => item.displayCriteria = this.data.displayCriteria);
      })
      this.nestedDataSource.forEach(data => {
        data.child.forEach(item => item.displayCriteria = this.data.displayCriteria);
      })

    }
  }

  changeDisplayCriteria(value) {
    this.dataSource.forEach((data, ind) => {
      const index = data.child.findIndex(item => item.fieldId === value.fieldId);
      if (index > -1) {
        this.dataSource[ind].child[index].displayCriteria = value.displayCriteria;
      }
    })
  }

  /**
   * append data on scroll to improve perfomance
   * @param el elemet refrence of scrolling div
   */
  updateDataOnScroll(el){
    if (el && (el.scrollTop >= ((el.scrollHeight - el.offsetHeight)) * 0.9)) {
      if(this.headers.length > this.headersCountLimit){
        this.updateHeaderData();
      }
      if(this.headers.length < this.headersCountLimit && this.nestedDataSource.length > this.dataSourceCountLimit){
        this.updateNestedDatasourceData();
      }
    }
  }

  // add data in headers list by limit
  updateHeaderData(){
    this.headersCountLimit += 20;
    this.selectedHeadersObs = of(this.headers.slice(0,this.headersCountLimit));
  }

  // update datasource data on scroll by limit
  updateNestedDatasourceData(){
    this.dataSourceCountLimit += 20;
    this.selectedNestedDataSOurce = this.nestedDataSource.slice(0,this.dataSourceCountLimit);
  }
}
