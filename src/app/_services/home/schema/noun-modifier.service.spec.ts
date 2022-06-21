import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Attribute, CreateNounModRequest } from '@models/schema/classification';
import { AttributesDoc, NounModifier } from '@models/schema/noun-modifier';
import { Modifier } from '@models/schema/schemadetailstable';
import { EndpointsDataplayService } from '@services/_endpoints/endpoints-dataplay.service';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';

import { NounModifierService } from './noun-modifier.service';

describe('NounModifierService', () => {
  let service: NounModifierService;
  let httpTestingController: HttpTestingController;
  let endpointClassic: EndpointsRuleService;
  let endpointDataplay: EndpointsDataplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(NounModifierService);
    httpTestingController = TestBed.inject(HttpTestingController);
    endpointClassic = TestBed.inject(EndpointsRuleService);
    endpointDataplay = TestBed.inject(EndpointsDataplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getLocalNouns', () => {

    const url = 'getAvailableNounsUri';
    spyOn(endpointClassic, 'getAvailableNounsUri').and.returnValue('getAvailableNounsUri');

    const expectedResponse = [{NOUN_CODE: 'Bearing', MODE_CODE: 'Ball'}] as NounModifier[];

    service.getLocalNouns('0','').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    let mockRequest = httpTestingController.expectOne(`${url}?fieldId=&fieldValue=&searchString=&plantCode=0&matlgrp=`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

    service.getLocalNouns('0', '1005', 'status', 'active', 'active').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    mockRequest = httpTestingController.expectOne(`${url}?fieldId=status&fieldValue=active&searchString=active&plantCode=0&matlgrp=1005`);
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should getLocalModifier', () => {

    const url = 'getAvailableModifierUri';
    const expectedResponse = [{NOUN_CODE: 'Bearing', MODE_CODE: 'Ball'}] as NounModifier[];

    spyOn(endpointClassic, 'getAvailableModifierUri').and.returnValue('getAvailableModifierUri');

    // expect(service.getLocalModifier('0', '','')).toThrow(new Error('Nouncode must be required'));

    service.getLocalModifier('0', 'Bearing','').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?nounCode=Bearing&searchString=&plantCode=0&matlgrp=`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should getLocalAttribute', () => {

    const url = 'getAvailableAttributeUri';
    const expectedResponse = [{ATTR_DESC: 'Length', ATTR_CODE: 'Length'}] as AttributesDoc[];

    spyOn(endpointClassic, 'getAvailableAttributeUri').and.returnValue('getAvailableAttributeUri');


    service.getLocalAttribute('Bearing', 'Ball', '0').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?nounCode=Bearing&modifierCode=Ball&searchString=&plantCode=0`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should getGsnNouns', () => {

    const url = 'getAvailableNounsUri';
    spyOn(endpointDataplay, 'getAvailableNounsUri').and.returnValue('getAvailableNounsUri');

    const expectedResponse = [{NOUN_CODE: 'Bearing', MODE_CODE: 'Ball'}] as NounModifier[];

    service.getGsnNouns('0').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    let mockRequest = httpTestingController.expectOne(`${url}?fieldId=&fieldValue=&searchString=&plantCode=0`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

    service.getGsnNouns('0', 'status', 'active', 'active').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    mockRequest = httpTestingController.expectOne(`${url}?fieldId=status&fieldValue=active&searchString=active&plantCode=0`);
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should getGsnModifier', () => {

    const url = 'getAvailableNounsUri';
    const expectedResponse = [{modCode: 'Ball', modText: 'Ball'}] as Modifier[];

    spyOn(endpointDataplay, 'getAvailableNounsUri').and.returnValue('getAvailableNounsUri');

    expect(() => service.getGsnModifier('0', '')).toThrowError('Nouncode must be required ');

    service.getGsnModifier('0', 'Bearing').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?nounCode=Bearing&searchString=&plantCode=0`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should getGsnAttribute', () => {

    const url = 'getAvailableAttributeUri';
    const expectedResponse = {NOUN_CODE: 'Bearing', MODE_CODE:'Ball', ATTRIBUTES:[{ATTR_DESC: 'Length', ATTR_CODE: 'Length'}]} as NounModifier;

    spyOn(endpointDataplay, 'getAvailableAttributeUri').and.returnValue('getAvailableAttributeUri');

    expect(() => service.getGsnAttribute('', 'Ball', '0')).toThrowError('Nouncode must be required ');
    // expect(() => service.getGsnAttribute('Bearing', '', '0')).toThrowError('Modifier must be required ');

    service.getGsnAttribute('Bearing', 'Ball', '0').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?nounCode=Bearing&modifierCode=Ball&searchString=&plantCode=0`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should getSuggestedNouns', () => {

    const url = 'getSuggestedNounUri';
    spyOn(endpointClassic, 'getSuggestedNounUri').and.returnValue('getSuggestedNounUri');

    const expectedResponse = [{NOUN_CODE: 'Bearing', MODE_CODE: 'Ball'}] as NounModifier[];

    service.getSuggestedNouns('schema1','run1','1701','','').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?searchString=&brType=&objNr=1701&matlgrp=`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should getSuggestedModifiers', () => {

    const url = 'getSuggestedModifierUri';
    const expectedResponse = [{NOUN_CODE: 'Bearing', MODE_CODE: 'Ball'}] as NounModifier[];

    spyOn(endpointClassic, 'getSuggestedModifierUri').and.returnValue('getSuggestedModifierUri');

    expect(() => service.getSuggestedModifiers('schema1', 'run1', '1701','','')).toThrowError('Nouncode must be required ');

    service.getSuggestedModifiers('schema1', 'run1', '1701','','Bearing').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?nounCode=Bearing&searchString=&brType=&objNr=1701`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should getSuggestedAttributes', () => {

    const url = 'getSuggestedAttributeUri';
    const expectedResponse = [{modCode: 'Ball', modText: 'Ball'}] as Modifier[];

    spyOn(endpointClassic, 'getSuggestedAttributeUri').and.returnValue('getSuggestedAttributeUri');

    expect(() => service.getSuggestedAttributes('schema1', 'run1', '1701','','','')).toThrowError('Nouncode must be required ');
    expect(() => service.getSuggestedAttributes('schema1', 'run1', '1701','','Bearing', '')).toThrowError('Modifier must be required ');

    service.getSuggestedAttributes('schema1', 'run1', '1701','','Bearing', 'Ball').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?nounCode=Bearing&modCode=Ball&searchString=&brType=&objNr=1701`);
    expect(mockRequest.request.method).toEqual('GET');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should createNounModifier', () => {

    const url = 'getCreateNounModUrl';
    const expectedResponse = 'success';
    const request = {nounCode: 'Bearing'} as CreateNounModRequest;

    spyOn(endpointClassic, 'getCreateNounModUrl').and.returnValue('getCreateNounModUrl');

    service.createNounModifier(request, 'grp10').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?matlGroup=grp10`);
    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should addAttribute', () => {

    const url = 'getCreateAttributeUrl';
    const expectedResponse = 'success';
    const request = [{nounCode: 'Bearing', attrCode: 'Length'}] as Attribute[];

    spyOn(endpointClassic, 'getCreateAttributeUrl').and.returnValue('getCreateAttributeUrl');

    service.addAttribute(request, '1701','222').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?nounCode=1701&modCode=222`);
    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should saveAttributesMapping', () => {

    const url = 'getSaveAttributesMappingUrl';
    const expectedResponse = 'success';
    const request = {
      libraryNounCode: 'Bearing',
      localNounCode: 'Bearing',
      libraryModCode: 'Ball',
      localModCode: 'Ball',
      attributeMapData: []
    }

    spyOn(endpointClassic, 'getSaveAttributesMappingUrl').and.returnValue('getSaveAttributesMappingUrl');

    service.saveAttributesMapping(request,'8733747').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?schemaId=8733747`);
    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });

  it('should getAttributesMapping', () => {

    const url = 'getFetchAttributesMappingUrl';
    const expectedResponse = {
      libraryNounCode: 'Bearing',
      localNounCode: 'Bearing',
      libraryModCode: 'Ball',
      localModCode: 'Ball',
      attributeMapData: []
    }

    spyOn(endpointClassic, 'getFetchAttributesMappingUrl').and.returnValue('getFetchAttributesMappingUrl');

    service.getAttributesMapping('noun1701', 'mod1701').subscribe(actualReponse => {
      expect(actualReponse).toEqual(expectedResponse);
    });

    const mockRequest = httpTestingController.expectOne(`${url}?libnounSno=noun1701&libmodSno=mod1701`);
    expect(mockRequest.request.method).toEqual('POST');
    mockRequest.flush(expectedResponse);
    httpTestingController.verify();

  });



});
