import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  Mapping,
  MappingData,
  MappingRequestBody,
  MdoField,
  MdoFieldMapping,
  MdoMappings,
  MessageTypes,
  SaveMappingResponse,
  SegmentMappings
} from '@models/mapping';
import { CONTROL_DATA, DESCRIPTION_MAPPING } from '@modules/mapping/_common/utility-methods';
import { MappingService } from '@services/mapping/mapping.service';
import { TransientService } from 'mdo-ui-library';
import { Observable } from 'rxjs';

@Component({
  selector: 'pros-field-mapping',
  templateUrl: './field-mapping.component.html',
  styleUrls: ['./field-mapping.component.scss'],
})
export class FieldMappingComponent implements OnInit {
  /**
   * banner text for showing info to the user
   */
  bannerText: string;

  /**
   * Source and Target fields for the list
   */
  sourceFields: MdoField[] = [];
  targetFields: SegmentMappings[] = [];
  saveTargetMappings: MappingRequestBody = null;
  isResponseType = false;
  scenarioId: string;

  messageTypes: MessageTypes;

  /**
   * loader for source fields
   */
  mappingSourceLoader = false;
  mappingTargetLoader = false;
  saveMappingLoader = false;
  translationRuleAdded = false;

  /**
   * To hold the existing mapping in order to prepare the connection between source
   * and target field
   */
  existingMapping: Mapping[] = [];

  /**
   * Configuration for Mapping line
   * to connect source and target fields
   */
  lineOptions = {
    dashed: false,
    color: '#339AF0',
    size: 1,
    path: 'straight',
    startPlug: 'disc',
    endPlug: 'arrow1',
    startPlugSize: 3,
    endPlugSize: 3,
    startPlugOutline: 1,
    endPlugOutline: 1,
  };

  tempLine: any;
  droppedOnTarget = false;
  sourceMenuToggle = true;
  targetMenuToggle = true;
  showTranslationRuleSection = false;

  mappingFilter = 'all';
  externalMappingData: MappingData;
  @Input() enableDescriptionMapping;
  @Input() enableControlDataMapping;
  @Input() navigateOnClose  = true;
  @Output() closeMapping: EventEmitter<any> = new EventEmitter();

  translationRuleFormGroup: FormGroup;

  constructor(
    private router: Router,
    private mappingService: MappingService,
    private transientService: TransientService,
    private activatedRoute: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  /**
   * Closes the sidesheet
   */
  close() {
    if(this.navigateOnClose) {
      this.router.navigate([{ outlets: { outer: null } }]);
    } else {
      this.closeMapping.emit('closed');
    }
  }

  setFilters(filterOption: string) {
    this.mappingFilter = filterOption;
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
      this.mappingService.getMdoMappings(language, moduleId).subscribe(
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
  getTargetMapping(scenarioId: number | string): Observable<SegmentMappings[]> {
    this.saveTargetMappings = null;
    return new Observable((observer) => {
      this.mappingTargetLoader = true;
      this.mappingService.getExternalMappings(scenarioId).subscribe(
        (response: MappingData) => {
          this.mappingTargetLoader = false;
          this.externalMappingData = response;
          this.messageTypes = this.separateRequestResponseData(response);
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

  separateRequestResponseData(response: MappingData): MessageTypes {
    const messageTypesForRequest = [];
    const messageTypesForResponse = [];
    response.response.wsdlDetails.forEach((data) => {
      data.inputType? messageTypesForRequest.push(data.messageType): messageTypesForResponse.push(data.messageType)
    });
    return {
      messageTypesForRequest,
      messageTypesForResponse
    }
  }

  /**
   * Call endpoint to save the mapping
   * @param saveMappingBody pass the mapping request body
   */
  saveMapping(saveMappingBody = this.saveTargetMappings) {
    if(!this.scenarioId) {
      console.error('ScenarioId is not available');
      return;
    }
    if(!saveMappingBody) {
      this.transientService.open('Fields not mapped, map some fields to save them', 'Dismiss');
      return;
    }
    this.mappingTargetLoader = true;
    this.saveMappingLoader = true;
    this.mappingSourceLoader = true;
    this.mappingService.saveOrUpdateMapping(saveMappingBody, this.scenarioId).subscribe((response: SaveMappingResponse) => {

      this.mappingTargetLoader = false;
      this.saveMappingLoader = false;
      this.mappingSourceLoader = false;

      if (response.acknowledge) {
        this.existingMapping = this.createExistingMappings(saveMappingBody.segmentMappings);
        this.transientService.open('Mapping successfully saved!', 'Dismiss');
      }
    }, err => {
      this.mappingTargetLoader = false;
      this.saveMappingLoader = false;
      this.mappingSourceLoader = false;
    });
  }
  /********************* API related logic End *********************/

  /**
   * Update the target whenever the mapping changes
   * @param targetMapping pass the updated target mapping
   */
   updateMappedTarget(targetMapping: MappingRequestBody) {
    targetMapping.wsdlDetails = this.externalMappingData.response.wsdlDetails;
    this.saveTargetMappings = targetMapping;
  }

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
   * Set the banner text message on error
   * @param bannertext Pass the banner text
   */
  setBannerText(bannertext: string) {
    this.bannerText = bannertext;
  }

  tabChange(tabIndex: number) {
    this.isResponseType = tabIndex === 1;
  }

  addDescriptionMappingStructure(data: MdoField[]): MdoField[] {
    if(!this.enableDescriptionMapping) {
      return data;
    }
    const descriptionMappingData = DESCRIPTION_MAPPING;
    data.unshift(descriptionMappingData);
    return [...data];
  }

  addControlDataStructure(data: MdoField[]): MdoField[] {
    if(!this.enableControlDataMapping) {
      return data;
    }
    const controlData = CONTROL_DATA;
    data.unshift(controlData);
    return [...data];
  }

  /**
   * Angular on init hook
   * Subscribing to the mapping changes as well as initializing
   * the mapping filter control here
   */
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((queryParams: any) => {
      this.enableControlDataMapping = queryParams.controlDataMapping === 'true';
      this.enableDescriptionMapping = queryParams.descriptionMapping === 'true';
    })
    this.activatedRoute.params.subscribe((params: Params) => {
      if(params.moduleId) {
        this.getSourceMapping(this.locale, params.moduleId).subscribe((response: MdoField[]) => {
          response = this.addDescriptionMappingStructure(response);
          response = this.addControlDataStructure(response);
          this.sourceFields = response;
        });
      }
      if(params.scenarioId) {
        this.scenarioId = params.scenarioId;
        this.getTargetMapping(params.scenarioId).subscribe((response: SegmentMappings[]) => {
          this.targetFields = response;
        });
      }
      if(params?.hasTranslationRuleSection) {
        this.showTranslationRuleSection = true;
        this.translationRuleForm();
      }
    });

    this.translationRuleFormGroup.get('translationRule').valueChanges.subscribe((response: {disableSaveMapping: boolean}) =>{
      this.translationRuleAdded = response?.disableSaveMapping || false;
    })
  }

  translationRuleForm() {
    this.translationRuleFormGroup = new FormGroup({
      translationRule: new FormControl()
    });

    this.translationRuleFormGroup.get('translationRule').valueChanges.subscribe((response: {disableSaveMapping: boolean}) =>{
      this.translationRuleAdded = response?.disableSaveMapping || false;
    })
  }
}