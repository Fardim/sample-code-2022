import { Injectable } from '@angular/core';
import { EndpointsAnalyticsService } from '@services/_endpoints/endpoints-analytics.service';
import { EndpointsDataplayService } from '@services/_endpoints/endpoints-dataplay.service';
import { Observable, Subject } from 'rxjs';

import {AttributesDoc, ClassificationMappingRequest, ClassificationMappingResponse, NounModifier} from '@models/schema/noun-modifier';
import { HttpClient } from '@angular/common/http';
import { Modifier } from '@models/schema/schemadetailstable';
import { Attribute, AttributeDefaultValue, AttributesMapping, CreateNounModRequest } from '@models/schema/classification';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';

@Injectable({
  providedIn: 'root'
})
export class NounModifierService {

  attributeValuesModels: Array<AttributeDefaultValue> = [];
  attributeFormValue;
  attributeSheetRoute;
  attributeSaved = new Subject();
  constructor(
    private endpointClassic: EndpointsRuleService,
    private endpointAnalytics: EndpointsAnalyticsService,
    private endpointDataplay: EndpointsDataplayService,
    private http: HttpClient
  ) { }


  /**
   * Get all available nouns .. from local lib..
   * @param plantCode append in parameter required parameter
   * @param fieldId optional for append in conditional ..
   * @param fieldValue optional for append in conditional ..
   * @param searchString  seach noun based on the values ..
   */
  public getLocalNouns(plantCode : string , matlgrp: string, fieldId?: string, fieldValue?: string, searchString?: string): Observable<NounModifier[]> {
    fieldId = fieldId ? fieldId : '';
    fieldValue = fieldValue ? fieldValue : '';
    searchString = searchString ? searchString : '';
    matlgrp = matlgrp ? matlgrp : '';
    return this.http.get<NounModifier[]>(this.endpointClassic.getAvailableNounsUri(), {params:{fieldId, fieldValue, searchString, plantCode, matlgrp}})
  }

  /**
   * Get all available modifiers ..  from local
   * @param plantCode plantCode append in parameter required parameter
   * @param nounCode nounCode must be required while getting modifier ..
   * @param searchString seach modifier based on the values ..
   */
  public getLocalModifier(plantCode : string , nounCode: string, matlgrp: string, searchString?: string): Observable<NounModifier[]> {
    if(!nounCode) {
      throw new Error('Nouncode must be required');
    }
    searchString = searchString ? searchString : '';
    matlgrp = matlgrp ? matlgrp : '';
    return this.http.get<NounModifier[]>(this.endpointClassic.getAvailableModifierUri(), {params:{nounCode, searchString, plantCode, matlgrp}})
  }

  /**
   * Get all available modifiers .. from local lib..
   * @param plantCode plantCode append in parameter required parameter
   * @param nounCode nounCode must be required while getting modifier ..
   * @param searchString seach modifier based on the values ..
   */
  public getLocalAttribute(nounCode: string,  modifierCode: string, plantCode : string , searchString?: string): Observable<AttributesDoc[]> {
     searchString = searchString ? searchString : '';
    return this.http.get<AttributesDoc[]>(this.endpointClassic.getAvailableAttributeUri(), {params:{nounCode, modifierCode, searchString, plantCode}})
  }



  /**
   * Get all available nouns .. from local lib..
   * @param plantCode append in parameter required parameter
   * @param fieldId optional for append in conditional ..
   * @param fieldValue optional for append in conditional ..
   * @param searchString  seach noun based on the values ..
   */
  public getGsnNouns(plantCode : string , fieldId?: string, fieldValue?: string, searchString?: string): Observable<NounModifier[]> {
    fieldId = fieldId ? fieldId : '';
    fieldValue = fieldValue ? fieldValue : '';
    searchString = searchString ? searchString : '';
    return this.http.get<NounModifier[]>(this.endpointDataplay.getAvailableNounsUri(), {params:{fieldId, fieldValue, searchString, plantCode}})
  }

  /**
   * Get all available modifiers ..  from local
   * @param plantCode plantCode append in parameter required parameter
   * @param nounCode nounCode must be required while getting modifier ..
   * @param searchString seach modifier based on the values ..
   */
  public getGsnModifier(plantCode : string , nounCode: string, searchString?: string): Observable<Modifier[]> {
    if(!nounCode) {
      throw new Error('Nouncode must be required ');
    }
    searchString = searchString ? searchString : '';
    return this.http.get<Modifier[]>(this.endpointDataplay.getAvailableNounsUri(), {params:{nounCode, searchString, plantCode}})
  }

  /**
   * Get all available modifiers .. from local lib..
   * @param plantCode plantCode append in parameter required parameter
   * @param nounCode nounCode must be required while getting modifier ..
   * @param searchString seach modifier based on the values ..
   */
  public getGsnAttribute(nounCode: string,  modifierCode: string, plantCode : string , searchString?: string): Observable<NounModifier> {
    if(!nounCode) {
      throw new Error('Nouncode must be required ');
    }

    // if(!modifierCode) {
    //   throw new Error('Modifier must be required ');
    // }

    searchString = searchString ? searchString : '';
    return this.http.get<NounModifier>(this.endpointDataplay.getAvailableAttributeUri(), {params:{nounCode, modifierCode, searchString, plantCode}})
  }

  public getClassificationMappingData(request: ClassificationMappingRequest) {
    return this.http.post<ClassificationMappingResponse>(this.endpointDataplay.getClassificationMappingUrl(), request);
  }

  /**
   * Get all suggested noun based on objectNumber ..
   *
   * @param schemaId append as parameter
   * @param runid append as parameter
   * @param objNr append as parameter
   * @param brType append as parameter
   * @param searchString append as parameter
   */
  public getSuggestedNouns(schemaId: string, runid: string, objNr: string, brType: string,matlgrp: string, searchString?: string): Observable<NounModifier[]> {
    searchString = searchString ? searchString : '';
    matlgrp = matlgrp ? matlgrp : '';
    return this.http.get<NounModifier[]>(this.endpointClassic.getSuggestedNounUri(schemaId, runid), {params:{searchString, brType, objNr, matlgrp}})
  }

  /**
   * Get all suggested modifier based on nounCode , objectNumber
   *
   * @param schemaId append as parameter
   * @param runid append as parameter
   * @param objNr append as parameter
   * @param brType append as parameter
   * @param nounCode append as parameter
   * @param searchString append as parameter
   */
  public getSuggestedModifiers(schemaId: string, runid: string, objNr: string, brType: string, nounCode: string,  searchString?: string): Observable<NounModifier[]> {
    if(!nounCode) {
      throw new Error('Nouncode must be required ');
    }
    searchString = searchString ? searchString : '';
    return this.http.get<NounModifier[]>(this.endpointClassic.getSuggestedModifierUri(schemaId, runid), {params:{nounCode, searchString, brType, objNr}})
  }

  /**
   * Get all suggested attributes based nounCode , modifier and objectNumber
   *
   * @param schemaId append as parameter
   * @param runid append as parameter
   * @param objNr append as parameter
   * @param brType append as parameter
   * @param nounCode append as parameter
   * @param modCode append as parameter
   * @param searchString append as parameter
   */
  public getSuggestedAttributes(schemaId: string, runid: string, objNr: string, brType: string, nounCode: string, modCode: string,  searchString?: string): Observable<Modifier[]> {
    if(!nounCode) {
      throw new Error('Nouncode must be required ');
    }

    if(!modCode) {
      throw new Error('Modifier must be required ');
    }

    searchString = searchString ? searchString : '';
    return this.http.get<Modifier[]>(this.endpointClassic.getSuggestedAttributeUri(schemaId, runid), {params:{nounCode, modCode, searchString, brType, objNr}})
  }

  public createNounModifier(request: CreateNounModRequest, matlGroup): Observable<any> {
    return this.http.post<any>(this.endpointClassic.getCreateNounModUrl(), request, {params: {matlGroup}});
  }

  public addAttribute(request: Attribute[], nounCode: string , modCode: string): Observable<any> {
    modCode  = modCode  ? modCode  : '';
    nounCode = nounCode ? nounCode : '';
    return this.http.post(this.endpointClassic.getCreateAttributeUrl(), request, {params:{nounCode, modCode}})
  }

  public saveAttributesMapping(request: AttributesMapping, schemaId: string): Observable<any> {
    return this.http.post<any>(this.endpointClassic.getSaveAttributesMappingUrl(), request, {params:{schemaId}});
  }

  public getAttributesMapping(libnounSno, libmodSno): Observable<AttributesMapping> {
    return this.http.post<any>(this.endpointClassic.getFetchAttributesMappingUrl(), null, {params: {libnounSno, libmodSno}});
  }

  /**
   * Get the connecthub lib attributes ...
   * @param nounCode will be part of the request param
   * @param modifierCode will be part of the request param
   * @param plantCode will be part of the request param
   * @param schemaId will be part of the request param
   * @param searchString will be part of the request param, if it not there will triet as empty
   * @returns will return Observable of NounModifier
   */
  public getConnecthukLibAttroibuteLib(nounCode: string,  modifierCode: string, plantCode : string , schemaId: string, searchString?: string): Observable<NounModifier> {
    searchString = searchString ? searchString : '';
    return this.http.get<NounModifier>(this.endpointClassic.getConnecthukLibAttroibuteLib(), {params:{nounCode, modifierCode, plantCode, schemaId, searchString}});
  }
}
