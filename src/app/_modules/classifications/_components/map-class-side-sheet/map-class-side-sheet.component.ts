import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  Mapping,
  MappingRequestBody,
  MdoField,
  MdoFieldlistItem,
  MdoMappings,
  SegmentMappings,
  WsdlDetails,
} from '@models/mapping';
import { TransientService } from 'mdo-ui-library';
import { RuleService } from '@services/rule/rule.service';
import { ActivatedRoute } from '@angular/router';
import { Characteristics, Class, ResultInfo } from '@modules/classifications/_models/classifications';
import { debounceTime, distinctUntilChanged, takeWhile } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'pros-map-class-side-sheet',
  templateUrl: './map-class-side-sheet.component.html',
  styleUrls: ['./map-class-side-sheet.component.scss']
})

export class MapClassSideSheetComponent implements OnInit {
  classes = [];
  classId = '';
  sourceTitle = '';
  targetTitle = '';
  sourceClass = {} as Class;
  targetClass = {} as Class;
  subscriptionEnabled = true;
  selectedTargetCtrl: FormControl = new FormControl();

  /**
   * banner text for showing info to the user
   */
  bannerText: string;

  /**
   * Source and Target fields for the list
   */
  mdoFieldListItems: MdoFieldlistItem[] = [];
  mdoMappings: MdoMappings[] = [];
  sourceFields: MdoField[] = [];
  targetFields: SegmentMappings[] = [];
  saveTargetMappings: MappingRequestBody = null;

  /**
   * loader for source fields
   */
  mappingSourceLoader = false;
  mappingTargetLoader = false;

  /**
   * To hold the existing mapping in order to prepare the connection between source
   * and target field
   */
  existingMapping: Mapping[] = [];
  mappingFields = [];

  wsdlDetails: WsdlDetails[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private transientService: TransientService,
    private ruleService: RuleService,
    public location: Location,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  /**
   * Angular on init hook
   * Subscribing to the mapping changes as well as initializing
   * the mapping filter control here
   */
  ngOnInit(): void {
    this.sourceClass = window.history.state?.sourceClass;
    this.sourceTitle = this.sourceClass?.code;

    this.selectedTargetCtrl.valueChanges.pipe(debounceTime(1000),distinctUntilChanged()).subscribe((val: string) => {
      this.getTargetClassCharacteristics(val);
    })

    this.activatedRoute.params.subscribe((params) => {
      this.classId = params?.classId || '';
      if (this.classId) {
        this.getCharacteristics();
      }
    });

    this.getAllClasses();
  }

  getClassMapping() {
    this.ruleService.getClassMapping(this.classId).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data: any) => {
      const existingMapping = [];
      const mappingFields = [];
      const targetMappedFields: any = Object.values(
        data?.response?.[0]?.mapped?.reduce((x, y) => Object.assign(x, { [y.targetChar.uuid]: y }), {})
      );
      const mapped = [];
      if (targetMappedFields?.length) {
        targetMappedFields.forEach((x) => {
          const targetField = this.targetFields[0]?.mdoMappings.find(m => m.uuid === x.targetChar.uuid);
          if (targetField) {
            mapped.push(x);
          }
        })
      }
      targetMappedFields.forEach(x => {
        mappingFields.push({
          sourceChar: x.sourceChar?.uuid,
          targetChar: x.targetChar?.uuid
        });
        existingMapping.push({
          source: {
            description: '',
            fieldId: x.sourceChar?.uuid,
          },
          target: {
            description: '',
            uuid: x.targetChar?.uuid,
          },
          line: null
        });
      });
      this.mappingFields = mappingFields;
      this.existingMapping = existingMapping;
    });
  }

  getAllClasses() {
    this.ruleService.getAllClasses(0, '', 1000).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res) => {
      console.log('classes', res);
      this.classes = res;
      if (this.classes.length) {
        const targetClass = this.classes.find(x => x.uuid === this.sourceClass?.sapClass);
        this.targetClass = targetClass || res[0];
        this.selectedTargetCtrl.setValue(this.targetClass.uuid);
      }
      this.targetTitle = this.targetClass.code;
    })
  }

  getTargetClassCharacteristics(targetClassId: string) {
    if (targetClassId) {
      this.ruleService.getCharacteristicsList<ResultInfo<Characteristics[]>>(targetClassId, 0, 0).subscribe((data) => {
        if (data?.response?.length) {
          const targetFieldsData: SegmentMappings[] = [];
          const mdoMapingsData: MdoMappings[] = [];
          data.response?.forEach(t => {
            mdoMapingsData.push({
              uuid: t.uuid, tenantId: '0', segmentName: t.charCode, mdoFieldId: '', mdoFieldDesc: '', externalFieldId: '', externalFieldDesc: t.charCode, externalFieldLength: 0
            })
          })
          targetFieldsData.push({
            tenantId: '0', segmentName: '', mdoMappings: mdoMapingsData, segmentMappings: []
          })
          this.targetFields = targetFieldsData;
          this.getClassMapping();
        }
      });
    }
  }

  getCharacteristics() {
    this.ruleService.getCharacteristicsList<ResultInfo<Characteristics[]>>(this.classId, 0, 0).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((data) => {
      console.log('characteristics', data);
      if (data?.response?.length) {
        const sourceFieldList: MdoFieldlistItem[] = [];
        data.response.forEach(s => {
          sourceFieldList.push({
            fieldId: s.uuid,
            description: s.charCode,
            dataType: s.dataType,
            maxChar: s.length as number,
            structureId: '1',
            pickList: '',
            isKeyField: true,
            isCriteriaField: false,
            isWorkFlow: true,
            isGridColumn: true,
            isDescription: true,
            textCase: 'test',
            attachmentSize: '',
            fileTypes: '',
            isFutureDate: true,
            isPastDate: false,
            outputLen: '',
            pickService: '',
            moduleId: 1005,
            parentField: '',
            isReference: false,
            isDefault: false,
            isHeirarchy: false,
            isWorkFlowCriteria: false,
            isNumSettingCriteria: false,
            isCheckList: false,
            isCompBased: false,
            dateModified: 0,
            decimalValue: '',
            isTransient: false,
            isSearchEngine: false,
            isPermission: true,
            isRejection: false,
            isRequest: false,
            isSubGrid: false,
            isNoun: false,
            optionsLimit: '',
            helpText: '',
            longText: '',
            language: '',
            childfields: []
          });
        });
        this.sourceFields = [{
          structureid: '1',
          description: '',
          fieldlist: sourceFieldList
        }];
      }
    })
  }

  /**
   * Closes the sidesheet
   */
  close() {
    this.location.back();
  }

  /**
   * Call endpoint to save the mapping
   * @param saveMappingBody pass the mapping request body
   */
  saveMapping() {
    if (this.mappingFields?.length < 1) {
      this.transientService.open('Fields not mapped, map some fields to save them', 'Dismiss', { duration: 2000, verticalPosition: 'bottom' });
      return;
    }

    const payload = {
      characterstics: this.mappingFields,
      classType: this.sourceClass.classType.classType || '',
      ruleID: '123',
      sourceClassname: this.sourceClass?.uuid,
      targetClassname: this.targetClass?.uuid,
    }
    this.ruleService.saveUpdateClassMapping(payload).subscribe((data) => {
      if (data.response) {
        this.transientService.open('Successfully saved !', null, { duration: 2000, verticalPosition: 'bottom' });
        if (this.sourceClass.sapClass !== this.targetClass.uuid) {
          this.sourceClass.sapClass = this.targetClass.uuid;
          this.sourceClass.colloquialNames = this.sourceClass.colloquialNames || [];
          this.sourceClass.imageUrl = this.sourceClass.imageUrl || [];
          this.sourceClass.inheritAttributes = this.sourceClass.inheritAttributes || false;
          this.sourceClass.isCodePartOfDesc = this.sourceClass.isCodePartOfDesc || false;
          this.sourceClass.isModPartOfDesc = this.sourceClass.isModPartOfDesc || false;
          this.sourceClass.mod =  this.sourceClass.mod || '';
          this.sourceClass.modLong = this.sourceClass.modLong || '';
          this.sourceClass.numCod =  this.sourceClass.numCod || '';
          this.sourceClass.numMod = this.sourceClass.numMod || '';
          this.sourceClass.referenceCode = this.sourceClass.classType?.uuid || '';
          this.sourceClass.referenceType = '';
          this.sourceClass.validFrom = '0';
          this.ruleService.saveUpdateClass(this.sourceClass).pipe(takeWhile(() => this.subscriptionEnabled)).subscribe((res) => {
            console.log(res);
          });
          this.location.back();
        }
      }
    }, (error) => {
      this.transientService.open(error?.message || 'Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
    })
  }

  /**
   * Update the target whenever the mapping changes
   * @param targetMapping pass the updated target mapping
   */
  updateMappedTarget(targetMapping: MappingRequestBody) {
    targetMapping.wsdlDetails = this.wsdlDetails;
    this.saveTargetMappings = targetMapping;
    this.mappingFields = [];
    targetMapping.mappingList?.forEach((x, i) => {
      this.mappingFields.push({
        sourceChar: x.source.fieldId,
        targetChar: x.target.uuid
      })
    })
  }

  /**
   * Set the banner text message on error
   * @param bannertext Pass the banner text
   */
  setBannerText(bannertext: string) {
    this.bannerText = bannertext;
  }
}
