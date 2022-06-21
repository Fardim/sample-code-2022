import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Mapping, MappingData, MdoField, MdoFieldMapping, MdoMappings, SegmentMappings } from '@models/mapping';
import MappingUtility from '@modules/mapping/_common/utility-methods';
import { MappingService } from '@services/mapping/mapping.service';
import { SapwsService } from '@services/sapws/sapws.service';
import { TransientService } from 'mdo-ui-library';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ConnectivityDialogComponent } from '../../connectivity-dialog/connectivity-dialog.component';
@Component({
  selector: 'pros-payload-test',
  templateUrl: './payload-test.component.html',
  styleUrls: ['./payload-test.component.scss']
})
export class PayloadTestComponent extends MappingUtility implements OnInit {
  showErrorBanner = false;
  showBanner = {
    error: false,
    success: false,
    errorList: []
  }
  formGroup: FormGroup;

  sourceFields: MdoField[] = [];
  scenarioId: string;
  moduleId: '';
  targetFields: SegmentMappings[] = [];

  showLoader = true;
  showEmptyState = false;

  /**
   * To hold the existing mapping in order to prepare the connection between source
   * and target field
   */
  existingMapping: Mapping[] = [];

  /**
   * Filter controls for the source and target fields
   */
  filteredSourceFields: Observable<MdoField[]>;

  mdoRecordES = {
    hdvs: {},
    gvs: {},
    hyvs: {}
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private transientService: TransientService,
    private activatedRoute: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string,
    private mappingService: MappingService,
    private sapwsService: SapwsService,
    private matDialog: MatDialog
  ) {
    super();
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      payloadTestData: []
    });

    this.activatedRoute.params.subscribe((params: Params) => {
      if (params?.moduleId) {
        this.moduleId = params.moduleId;
      }
      if (params.moduleId) {
        this.getSourceMapping(this.locale, params.moduleId).subscribe((response: MdoField[]) => {
          this.sourceFields = response;
          this.getMappedFields(params);
        });
      }
    });
  }

  getMappedFields(params) {
    if (params.scenarioId) {
      this.scenarioId = params.scenarioId;
      this.getTargetMapping(params.scenarioId).subscribe((response: SegmentMappings[]) => {
        this.targetFields = response;
        this.applyMappingFilter('mapped');
      });
    }
  }

  applyMappingFilter(filterOption: string) {
    if (['all', 'mapped', 'unmapped', 'transformed'].indexOf(filterOption) > -1) {
      setTimeout(() => {
        this.filteredSourceFields = of(
          this.filterSourceFields(filterOption, [...this.sourceFields], this.existingMapping)
        );
        this.filteredSourceFields.subscribe(response => {
          const filteredFields = response?.sort(
            (a: any, b: any) => a?.structureid - b?.structureid
          );
          this.formGroup.get('payloadTestData').patchValue({
            ...this.formGroup.get('payloadTestData').value,
            initialValue: true,
            existingMappingValue: filteredFields
          });
          if (!filteredFields?.length) {
            this.showEmptyState = true;
          }
          this.showLoader = false;
        })
      }, 100);
    } else {
      console.error('Invalid filter option, valid options are all, mapped, unmapped, transformed');
    }
  }

  getSourceMapping(language: string, moduleId: string | number): Observable<MdoField[]> {
    return new Observable((observer) => {
      this.mappingService.getMdoMappings(language, moduleId).subscribe(
        (response: MdoFieldMapping) => {
          response?.fields?.length ? observer.next(response.fields) : observer.next([]);
        },
        (err) => {
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
    return new Observable((observer) => {
      this.mappingService.getExternalMappings(scenarioId).subscribe(
        (response: MappingData) => {
          if (response.acknowledge) {
            const mappings = this.createExistingMappings(response.response.segmentMappings);
            this.existingMapping = mappings;
            response.response.segmentMappings?.length
              ? observer.next(response.response.segmentMappings)
              : observer.next([]);
          } else {
            this.showLoader = false;
            this.showEmptyState = true;
          }
        },
        (err) => {
          console.error('getTargetMapping error: ', err);
          observer.next([]);
        }
      );
    });
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
            description: field.mdoFieldDesc
          },
          target: {
            uuid: field.uuid,
            description: field.segmentName
          }
        });
      }
    });

    return mappings;
  }

  showErrorModal(content_list) {
    this.matDialog.open(ConnectivityDialogComponent, {
      data: {
        headerLine: `The following errors have been encountered while performing payload test:`,
        contentList: content_list,
        confirmButtonLabel: 'Okay'
      },
      disableClose: true,
      width: '750px',
      minHeight: '250px',
      autoFocus: false,
      panelClass: 'create-master-panel'
    }).afterClosed().subscribe((dialogData: any) => {
      if (dialogData) {
      }
    })
  }

  testPayload() {
    this.showLoader = true;
    this.formGroup.value.payloadTestData.forEach(element => {
      if (element.structureId === '1') {
        element.structureFields.forEach(field => {
          this.transformHDVS(field);
        });
      } else {
        this.mdoRecordES.hyvs[element.structureId] = {
          rows: [
            {
              structures: this.getHYVSDefaultField('structures'),
              status: this.getHYVSDefaultField('status'),
              del_flag: this.getHYVSDefaultField('del_flag')
            }
          ]
        }

        element.structureFields.forEach(field => {
          this.transformHYVS(field,element.structureId);
        });
      }
    });
    const payload = {
      mdoRecordES: this.mdoRecordES,
      controlData: this.getControlData()
    }
    this.sapwsService.testPayload(this.scenarioId, payload)
    .pipe(
      finalize(() => this.showLoader = false)
    )
    .subscribe((response: any) => {
      if (!response?.acknowledge) {
        this.showBanner = {
          error: true,
          success: false,
          errorList: response?.response
        }
      } else {
        this.showBanner = {
          error: false,
          success: true,
          errorList: []
        }
      }
    },error => {
      this.showBanner = {
        error: true,
        success: false,
        errorList: []
      }
      this.transientService.open('Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
    })
  }

  getControlData() {
    return {
      recordNumber: null,
      moduleId: this.moduleId,
      tenantId: null,
      crId: null,
      parentCrId: null,
      processId: null,
      eventId: 0,
      massId: null,
      taskId: null,
      referenceId: null,
      layoutId: null,
      userId: null,
      roleId: null,
      language: null,
      processFlowContainerId: null,
      processFlowId: null,
      draft: false
    }
  }

  transformHDVS(field) {
    if (field?.fieldPickList && this.getFieldType(field.fieldPickList) !== 'GRID') {
      if (field.structureId === '1') {
        this.mdoRecordES.hdvs[field.fieldId] = this.getTransformedFieldValue(field);
      }
    } else {
      this.mdoRecordES.gvs[field.fieldId] = this.transformGVSObject(field);
    }
  }

  transformGVSObject(field) {
    const rows = [];
    field?.childFields.gridRowValue.forEach(childField => {
      const rowValue = {};
      rowValue['msgfn'] = this.getHYVSDefaultField('msgfn');
      rowValue['uuid'] = this.getHYVSDefaultField('uuid');
      Object.keys(childField).forEach(key => {
        rowValue[key] = this.getTransformedFieldValue({
          fieldId: key,
          fieldValue: childField[key]
        })
      })

      rows.push(rowValue);
    });
    return {
      ls: null,
      rows: [
        ...rows
      ],
      gid: field.fieldId
    }
  }

  transformHYVS(field,structureId) {
    if (field?.fieldPickList && this.getFieldType(field.fieldPickList) !== 'GRID') {
      this.mdoRecordES.hyvs[structureId].rows[0] = {
        ...this.mdoRecordES.hyvs[structureId].rows[0],
        [field.fieldId]: this.getTransformedFieldValue(field)
      }
    } else {
      this.mdoRecordES.gvs[field.fieldId] = this.transformGVSObject(field);
    }
  }

  getTransformedFieldValue(field) {
    return {
      vc: [
        {
          c: field?.fieldValue,
          t: null
        }
      ],
      oc: null,
      bc: null,
      ls: null,
      fid: field.fieldId
    }
  }

  getHYVSDefaultField(fieldId) {
    return {
      vc: [
        {
          c: null,
          t: null
        }
      ],
      oc: null,
      bc: null,
      ls: null,
      fid: fieldId
    }
  }

  getFieldType(pickList) {
    switch(pickList) {
      case '1':
      case '37':
        return 'DROPDOWN';
      case '38':
        return 'ATTACHMENT';
      case '15':
        return 'GRID';
      case '4':
        return 'RADIO';
      case '2':
        return 'CHECKBOX';
      case '55':
        return 'URL';
      case '54':
        return 'TIMEPICKER';
      case '52':
        return 'DATEPICKER';
      case '22':
        return 'TEXTAREA';
      case '36':
        return 'TOGGLE';
      case '30':
        return 'DATA-REF';
      case '31':
        return 'HTML-EDITOR'
      default :
        return 'TEXT'
    }
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
}
