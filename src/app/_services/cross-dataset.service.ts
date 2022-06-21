import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { SegmentMappings, WsdlDetails } from '@models/mapping';
import { MetadataModeleResponse } from '@models/schema/schemadetailstable';
import { Utilities } from '@models/schema/utilities';
import { Observable } from 'rxjs';
import { EndpointCrossDatasetService } from './_endpoints/endpoint-cross-dataset.service';

@Injectable({
  providedIn: 'root'
})
export class CrossDatasetService {
  constructor(
    private http: HttpClient,
    private endpointCrossDatasetService: EndpointCrossDatasetService,
    private utilityService: Utilities,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
  }

  public createUpdateCrossDatasetRule(payload, scenarioId) {
    return this.http.post<string>(this.endpointCrossDatasetService.createUpdateCrossDatasetRule(scenarioId), payload);
  }

  public deleteCrossDatasetRule(brId: string): Observable<boolean> {
    return this.http.delete<boolean>(this.endpointCrossDatasetService.deleteCrossDatasetRule(brId));
  }

  public getCrossDatasetRuleInfo(brId): Observable<any> {
    return this.http.get<any>(this.endpointCrossDatasetService.getCrossDatasetRuleInfo(brId));
  }

  public getAllCrossDatasetRuleInfo(payload): Observable<any> {
    return this.http.get<any>(this.endpointCrossDatasetService.getAllCrossDatasetRuleInfo(), {
      params: {ruleSourceModule: payload.ruleSourceModule, size: payload.size, page: payload.number, ...(payload.queryString && {queryString: payload.queryString})},
    });
  }

  public getCrossDatasetRuleByRefId(brId) {
    return this.http.get<any>(this.endpointCrossDatasetService.getCrossDatasetRuleByRefId(brId));
  }

  public addMappingWsdlDetails(structureField):WsdlDetails[] {
    const wsdlValue = structureField.map(structure => {
      return this.addWsdlObject(structure)
    });
    return wsdlValue;
  }

  addWsdlObject(structure): WsdlDetails {
    return {
      uuid: this.utilityService.generate_UUID(),
      messageType: structure?.description,
      basicType: structure?.description,
      serviceClassName: null,
      portMethodName: null,
      serviceMethodName: null,
      baseClassName: null,
      portType: "HTTPS",
      scenarioId: null,
      endPoint: "https://cpi-non-production.apimanagement.ap10.hana.ondemand.com:443",
      fileLocation: null,
      isStubGenerated: null,
      classPackageName: null,
      isComplexChild: null,
      complexTypeName: structure?.structureid,
      nameSpacePrefix: "s0",
      nameSpaceValue: "urn:sap-com:document:sap:rfc:functions",
      tenantId: "0",
      inputType: false
    }
  }


  public transformHierarchyToSegmentJSON(response,segmentHierarchyLevel, subSegmentMainParent, segmentParent = ''): SegmentMappings[] {
    const segMapping = [];
    response.forEach((res,index) => {
      let newMapping: SegmentMappings = {
        ...this.getDefaultSegmentMappingObj(res, segmentHierarchyLevel, segmentParent)
      };

      if (segmentHierarchyLevel === 2) {
        newMapping.sequence = 0;
        subSegmentMainParent = res.description;
        newMapping.messageType = res.description;
        newMapping.basicType = res.description;
        newMapping.segmentParent = '';
        newMapping.orignalSegmentParent = '';
      } else if (subSegmentMainParent) {
        newMapping.messageType = subSegmentMainParent;
        newMapping.basicType = subSegmentMainParent;
        newMapping.segmentParent = segmentParent;
        newMapping.orignalSegmentParent = segmentParent;
      }

      if (segmentHierarchyLevel === 3) {
        newMapping.sequence = index + 1;
      } else if (segmentHierarchyLevel >= 4) {
        newMapping.sequence = 1;
      }

      if (res?.fieldlist) {
        this.setHierarchyFields(res.fieldlist,newMapping, (segmentHierarchyLevel + 1), res.description);
      }

      if (res?.childfields?.length) {
        this.setHierarchyFields(res.childfields,newMapping, (segmentHierarchyLevel + 1), res.description);
      }
      segMapping.push(newMapping);
    })
    return segMapping;
  }

  getDefaultSegmentMappingObj(res, segmentHierarchyLevel, segmentParent) {
    return {
      tenantId: '',
      mdoMappings: [],
      segmentMappings: [],
      hierarchylevel: segmentHierarchyLevel,
      description: res?.pickList === '15' ? res.fieldId : null,
      objectType: null,
      scenarioId: null,
      segmentType: null,
      mdoStructure: res?.structureid || res?.structureId,
      nameSpacevalue: 'urn:sap-com:document:sap:rfc:functions',
      structureType: null,
      enableXsegment: null,
      segmentName: res.description,
      orignalSegmentName: res.description,
      uuid: this.utilityService.generate_UUID(),
      segmentParent,
      orignalSegmentParent: segmentParent,
      ...(res?.hasOwnProperty('fieldId') && {segmentType: 'main-segment', mainStructureId: res.fieldId}),
      ...(res?.hasOwnProperty('parentStrucId') && {segmentType: 'main-segment', mainStructureId: res?.structureid || res?.structureId})
    }
  }

  setHierarchyFields(fieldlist,newMapping,segmentHierarchyLevel, segmentParent) {
    const simpleFields = fieldlist.filter(field => field?.childfields?.length === 0 || !field?.childfields);
    const gridFields = fieldlist.filter(field => field?.childfields?.length);
    newMapping.mdoMappings = this.transformMDOMappings(simpleFields, newMapping, segmentParent);
    newMapping.segmentMappings = this.transformHierarchyToSegmentJSON(gridFields, segmentHierarchyLevel, newMapping.messageType, segmentParent);
  }

  transformMDOMappings(mdoMapping, newMapping, segmentName) {
    return mdoMapping.map((field, index) => {
      return {
        externalFieldId: field.fieldId,
        fieldId: field.fieldId,
        externalFieldDesc: field.description || field?.shortText[this.locale]?.description || 'Untitled',
        uuid: this.utilityService.generate_UUID(),
        externalFieldLength: 240,
        scenarioId: null,
        schemaDataType: null,
        fieldOrder: index + 1,
        nameSpaceValue: 'urn:sap-com:document:sap:rfc:functions',
        tenantId: 0,
        additionalProperty: null,
        messageType: newMapping.messageType,
        basicType: newMapping.messageType,
        objectType: null,
        serverId: 'WebService',
        direction: null,
        labelCode: null,
        segmentName,
        orignalSegmentName: segmentName,
        segmentParent: newMapping?.segmentParent,
        orignalSegmentParent: newMapping?.segmentParent,
        segmentHierarchy: newMapping?.segmentParent ? `${newMapping?.segmentParent} | ${segmentName}` : segmentName,
        shortText: field.shortText,
        mdoStructure: field.structureId,
      }
    });
  }

  getKeyFields(fields) {
    const keyFields = [];
    Object.keys(fields).forEach(element => {
      const hieElement = fields[element];
      if (!hieElement.hasOwnProperty('fieldId')) {
        const keyField = Object.keys(hieElement).filter(data => hieElement[data].isKeyField);
        keyFields.push(...keyField);
      } else if (hieElement.hasOwnProperty('fieldId') && hieElement.isKeyField) {
        keyFields.push(hieElement);
      }
    });
    return keyFields;
  }
}
