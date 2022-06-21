import { ConnectorService } from '@modules/list/_components/connector/services/connector.service';
import {
  Mapping,
  MdoField,
  SegmentMappings,
  MappingRequestBody,
  WsdlDetails,
  MdoFieldMapping,
  MappingData,
  MdoMappings,
  SaveMappingResponse,
  MappingDatasetRequest
} from '@models/mapping';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MappingService } from '@services/mapping/mapping.service';
import { Observable, Subscription } from 'rxjs';
import { TransientService } from 'mdo-ui-library';
import { CoreService } from '@services/core/core.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SapwsService, TableMappingData } from '@services/sapws/sapws.service';
import { SapRequestDTO } from '@models/connector/connector.model';
import { merge, pick } from 'lodash';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { CpiDataScopeComponent } from '../connector/sap-cpi/cpi-data-scope/cpi-data-scope.component';
@Component({
  selector: 'pros-table-mapping',
  templateUrl: './table-mapping.component.html',
  styleUrls: ['./table-mapping.component.scss'],
})
export class TableMappingComponent implements OnInit {
  mdoMappings: MdoMappings[] = [];
  tableForm: FormGroup;
  storeData = [
    { label: 'New dataset', value: 'NEW_DATASET' },
    // { label: 'Existing dataset', value: 'EXISTING_DATASET' },
  ];

  /**
   * keep the dialog subscriptions
   */
  dialogSubscriber = new Subscription();

  mappingSourceLoader = false;
  mappingTargetLoader = false;

  /**
   * Source and Target fields for the list
   */
  sourceFields: MdoField[] = [];
  targetFields: SegmentMappings[] = [];
  saveTargetMappings: MappingRequestBody = null;
  dataSetModules: any[] = [];
  selectedModuleId: string;
  segmentDetails: SegmentMappings;
  updatedNewmapping: SegmentMappings[] = [];
  errortext: string;

  /**
   * To hold the existing mapping in order to prepare the connection between source
   * and target field
   */
  existingMapping: Mapping[] = [];
  wsdlDetails: WsdlDetails[] = [];

  tableMappingData: TableMappingData;
  mappingSaveLoader = false;

  conditions = [];

  constructor(
    private mappingService: MappingService,
    private sapSw: SapwsService,
    private transientService: TransientService,
    private connectorService: ConnectorService,
    private coreService: CoreService,
    private sharedService: SharedServiceService,
    private globaldialogService: GlobaldialogService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  ngOnInit(): void {
    this.createTableForm();
    this.sapSw.tableMappingSubscription.subscribe((response: TableMappingData) => {
      this.tableMappingData = response;
    });
    this.getMdoMappings();
  }

  getMdoMappings() {
    if (this.sapSw.tableMapping) {
      const tableMapping = this.sapSw.tableMapping;
      const body: SapRequestDTO = merge({}, pick(tableMapping, ['pageNo', 'pageSize', 'tableName', 'password', 'url', 'username']));

      this.mappingSaveLoader = true;
      this.getNewDatasetMappings(body).subscribe(
        (mdoMappings: MdoMappings[]) => {
          this.mappingSaveLoader = false;
          if (mdoMappings?.length) {
            this.mdoMappings = mdoMappings || [];
          }
        },
        (err) => {
          this.mappingSaveLoader = false;
        }
      );
    }
  }

  back() {
    this.connectorService.backClicked.next(true);
  }

  onCancelClick() {
    console.log('cancel');
  }

  /**
   * method to initialize Form
   */
  createTableForm() {
    this.tableForm = new FormGroup({
      datasetType: new FormControl('NEW_DATASET'),
      datasetName: new FormControl('', [Validators.required]),
      moduleId: new FormControl(''),
    });

    this.tableForm.valueChanges.subscribe((value) => {
      this.errortext = '';
    });

    this.tableForm.controls.datasetType.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
      if (value === 'EXISTING_DATASET') {
        this.getDatasetModules();
      }
    });

    this.tableForm.controls.datasetName.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (value?.trim() && this.tableForm.controls.datasetType.value === 'EXISTING_DATASET') {
        this.searchDatasetModules(value);
      } else {
        this.sapSw.updateTablemappingData({ datasetName: value } as TableMappingData);
      }
    });

    this.tableForm.controls.moduleId.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (this.tableForm.controls.datasetType.value === 'EXISTING_DATASET') {
        this.getSourceMapping(this.locale, value).subscribe((response: MdoField[]) => {
          this.sourceFields = response;
        });

        this.getTargetMapping(2).subscribe((response: SegmentMappings[]) => {
          this.targetFields = response;
        });
      }
    });
  }

  getDatasetModules() {
    this.coreService.getAllObjectType(this.locale, 20, 0).subscribe(
      (response: any[]) => {
        if (response?.length) {
          this.dataSetModules = response.map((module) => {
            return {
              moduleId: module.moduleId,
              moduleName: module.moduleDescriptionRequestDTO.description,
            };
          });
        } else {
          this.dataSetModules = [];
        }
      },
      (err) => {
        console.error('error while fetching modules', err);
        this.dataSetModules = [];
      }
    );
  }

  /**
   * method to search the modules from API
   * @param searchTerm pass the search term
   * @returns Observable<any[]>
   */
  searchDatasetModules(searchTerm = ''): Observable<any[]> {
    const body = {
      lang: this.locale,
      fetchsize: 20,
      fetchcount: 0,
      description: searchTerm?.toLocaleLowerCase(),
    };
    return new Observable((observer) => {
      return this.coreService.searchAllObjectType(body).subscribe(
        (response) => {
          return !response?.length
            ? observer.next([])
            : response.map((module) => {
                return {
                  moduleId: module.moduleId,
                  moduleName: module.moduleDesc,
                };
              });
        },
        (err) => {
          console.error('error while searching modules', err);
          return observer.next([]);
        }
      );
    });
  }

  /**
   * method to open sidesheet
   */
  openSideSheet() {
    console.log('open sidesheet');
  }

  /**
   * Toggle for datascope
   */
  openDataScope() {
    const data = {
      segmentMappings: this.mdoMappings.map(mdoData => {
        return {
          segmentName: mdoData.externalFieldDesc,
          externalFieldId: mdoData.externalFieldId,
          mdoFieldId: mdoData.mdoFieldId,
          FIELDID: mdoData.externalFieldId,
          VALUE1: '',
          VALUE2: '',
          BLOCKTYPE: 'AND',
          CONDITIONOPERATOR: 'EQ'
        }
      }),
      conditions: this.conditions
      // segmentMappings: TARGET_FIELD,
      // segmentMappings: this.targetFields,
    };
    const config = {
      panelClass: 'data-scoping-dialog',
    };

    this.globaldialogService.openDialog(CpiDataScopeComponent, data, config);
    this.dialogSubscriber = this.globaldialogService.dialogCloseEmitter.subscribe((responseData: any) => {
      if (responseData) {
        this.conditions = responseData;
      }
    });
  }

  /**
   * Update the target whenever the mapping changes
   * @param targetMapping pass the updated target mapping
   */
  updateMappedTarget(targetMapping: MappingRequestBody) {
    targetMapping.wsdlDetails = this.wsdlDetails;
    this.saveTargetMappings = targetMapping;
  }

  /********************* API related logic Start *********************/

  /**
   * Cann endpoint to get source(MdoFields) fields
   * @param language pass the language
   * @param moduleId pass the module id
   * @returns Observable<MdoField[]>
   */
  getSourceMapping(language: string, moduleId: string | number): Observable<MdoField[]> {
    return new Observable((observer) => {
      this.mappingSourceLoader = true;
      this.mappingService.getMdoMappings(language, moduleId, 0, 0).subscribe(
        (response: MdoFieldMapping) => {
          this.mappingSourceLoader = false;
          response?.fields?.length ? observer.next(response.fields) : observer.next([]);
        },
        (err) => {
          this.mappingSourceLoader = false;
          console.error('getSourceMapping error: ', err);
          observer.next([]);
        }
      );
    });
  }

  /**
   * Call endoint to get target(SegmentMappings) list
   * @returns Observable<SegmentMappings[]>
   */
  getTargetMapping(scenarioId: string | number): Observable<SegmentMappings[]> {
    this.saveTargetMappings = null;
    return new Observable((observer) => {
      this.mappingTargetLoader = true;
      this.mappingService.getExistingMappings(scenarioId).subscribe(
        (response: MappingData) => {
          this.mappingTargetLoader = false;
          this.wsdlDetails = response.response.wsdlDetails;
          const mappings = this.createExistingMappings(response.response.segmentMappings);
          this.existingMapping = mappings;
          response.response.segmentMappings?.length ? observer.next(response.response.segmentMappings) : observer.next([]);
        },
        (err) => {
          this.mappingTargetLoader = false;
          console.error('getTargetMapping error: ', err);
          observer.next([]);
        }
      );
    });
  }

  /**
   * Call endpoint to save the mapping
   * @param saveMappingBody pass the mapping request body
   */
  saveExistingMapping(saveMappingBody = this.saveTargetMappings) {
    if (!saveMappingBody) {
      this.transientService.open('Fields not mapped, map some fields to save them', 'Dismiss');
      return;
    }
    this.mappingTargetLoader = true;
    // this.mappingSaveLoader = true;
    this.mappingService.saveOrUpdateMapping(saveMappingBody, 2).subscribe(
      (response: SaveMappingResponse) => {
        // this.mappingSaveLoader = false;
        if (response.acknowledge) {
          this.targetFields = [];
          this.getTargetMapping(2).subscribe((res: SegmentMappings[]) => {
            this.mappingTargetLoader = false;
            // this.mappingSaveLoader = false;
            this.targetFields = res;
          });
          this.errortext = '';
          this.transientService.open('Mapping successfully saved!', 'Dismiss');
        }
      },
      (err) => {
        // this.mappingSaveLoader = false;
        this.mappingTargetLoader = false;
      }
    );
  }

  saveNewMapping() {
    if (!this.tableForm.controls.datasetName.value) {
      console.error('Dataset name is required');
      return;
    }
    const body: MappingDatasetRequest = {
      dataScope: {
        conditions: this.conditions.map(selection => {
          return {
            FIELDID: selection.FIELDID,
            VALUE1: selection.VALUE1,
            VALUE2: selection.VALUE2,
            BLOCKTYPE: selection.BLOCKTYPE,
            CONDITIONOPERATOR: selection.CONDITIONOPERATOR
          }
        }),
        dateCreated: '',
        dateModified: '',
        hierarchy: '',
        recordNumbers: [],
        isSyncData: this.sapSw.tableMapping.syncData,
        isUpdateDataInSystem: false,
      },
      connection: {
        connectionId: this.tableMappingData.connectionId,
        hostName: this.tableMappingData.url,
        noOfInterface: 0,
        password: this.tableMappingData.password,
        status: 'COMPLETED',
        user: this.tableMappingData.username,
        uuid: this.updatedNewmapping[0]?.uuid || null,
      },
      mapping: {
        segmentMappings: this.updatedNewmapping,
        wsdlDetails: [],
      },
      datasetName: this.tableForm.controls.datasetName.value,
      tableName: this.tableMappingData.tableName,
    };
    this.mappingService.createNewDatasetMapping(body).subscribe(
      (response: any) => {
        if (response.acknowledge) {
          this.transientService.open('Mapping successfully saved!', 'Dismiss');
          this.sharedService.reloadDatasetModulesTrigger = true;
          this.errortext = '';
          this.close();
        } else {
          this.errortext = 'Error while saving new mapping';
          console.error('error while saving new mapping', response);
        }
      },
      (err) => {
        this.errortext = 'Error while saving new mapping';
        console.error('error while saving new mapping', err);
      }
    );
  }

  saveMappings() {
    if (this.tableForm.controls.datasetType.value === 'EXISTING_DATASET') {
      this.saveExistingMapping();
    } else {
      this.saveNewMapping();
    }
  }

  close() {
    this.connectorService.onCancelClick({ toRefreshApis: false, moduleId: null });
  }

  /********************* API related logic End *********************/

  /**
   * Create a list of mappings found from the target fields
   * @param segmentMappings pass the target data or SegmenMappings
   * @returns Mapping[]
   */
  createExistingMappings(segmentMappings: SegmentMappings[]): Mapping[] {
    let mappings = [];
    segmentMappings.forEach((segment: SegmentMappings) => {
      if (segment.mdoMappings?.length) {
        const temp = this.getMappingsFromMdoMappings(segment.mdoMappings);
        if (temp.length) {
          mappings = [...mappings, ...temp];
        }
      }
      if (segment.segmentMappings?.length) {
        const temp = this.createExistingMappings(segment.segmentMappings);
        if (temp.length) {
          mappings = [...mappings, ...temp];
        }
      }
    });

    return mappings;
  }

  /**
   * get source and target details from the mdoMappings
   * @param mdoMappings pass the mdoMappings
   * @returns Mapping[]
   */
  getMappingsFromMdoMappings(mdoMappings: MdoMappings[]): Mapping[] {
    const mappings: Mapping[] = [];

    mdoMappings.forEach((field) => {
      if (field.mdoFieldId) {
        mappings.push({
          source: {
            fieldId: field.mdoFieldId,
            description: field.mdoFieldDesc,
          },
          target: {
            uuid: field.uuid,
            description: field.segmentName,
          },
        });
      }
    });

    return mappings;
  }

  /**
   * get dataset mappings from the API
   * @param body pass the mapping request body
   * @returns Observable<MdoMappings[]>
   */
  getNewDatasetMappings(body: SapRequestDTO): Observable<MdoMappings[]> {
    return new Observable((observer) => {
      this.sapSw.getNewDatasetMappings(body).subscribe(
        (response: any) => {
          if (response?.response?.segmentMappings?.length) {
            const segmentMapping: SegmentMappings = response?.response?.segmentMappings[0];
            const temp: SegmentMappings = { ...segmentMapping };
            temp.mdoMappings = [];
            this.segmentDetails = temp;
            observer.next(segmentMapping?.mdoMappings || []);
          } else {
            observer.next([]);
          }
        },
        (err) => {
          observer.next([]);
        }
      );
    });
  }

  setUpdatedmapping(segmentMappings: MdoMappings[]) {
    this.segmentDetails.mdoMappings = segmentMappings;
    this.updatedNewmapping = [this.segmentDetails];
  }
}
