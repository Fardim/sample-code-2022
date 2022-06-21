import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { EndpointsCoreCrudService } from '@services/_endpoints/endpoints-core-crud.service';
import { EndpointsRuleService } from '@services/_endpoints/endpoints-rule.service';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { ObjectStatus } from '../model/transaction';

import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let endpointRuleServiceSpy: jasmine.SpyObj<EndpointsRuleService>;
  let endpointServiceSpy: jasmine.SpyObj<EndpointsCoreCrudService>;
  let httpTestingController: HttpTestingController;

  const fieldObj =  {
    fieldId: 'FLD_1',
    structureId: 1,
    order: 0,
    moduleId: 500,
    fieldType: 'FIELD',
    isMandatory: false,
    isRuleHidden: false,
    description: 'First name',
    isReadOnly: false,
    fieldCtrl: {
        description: 'First name' ,
        dataType: 'CHAR',
        pickList: '2',
        maxChar: 20,
        structureId: 1,
        fieldId: 'FLD_1',
        isCriteriaField: false,
        isWorkFlow: false,
        isGridColumn: false,
        isDescription: false,
        textCase: 'UPPER',
        isFutureDate: false,
        isPastDate: false,
        moduleId: 500,
        isReference: false,
        isDefault: false,
        isHeirarchy: false,
        isWorkFlowCriteria: false,
        isNumSettingCriteria: false,
        isCheckList: false,
        isCompBased: false,
        dateModified: 1640934867149,
        isTransient: false,
        isSearchEngine: false,
        isPermission: false,
        isMandatory: false,
        isKeyField: false,
        structDesc: 'Header Data',
        isReadOnly: false,
    },
    tabDetails: null,
  };

  beforeEach(() => {
    const endpointSpy = jasmine.createSpyObj('EndpointsRuleService', ['getDescriptionUrl', 'getModuleClass']);
    const endpointServiceUrlSpy = jasmine.createSpyObj('EndpointsCoreCrudService', ['deleteNumberSettingUrl']);

    TestBed.configureTestingModule({
      providers: [TransactionService, HttpClientModule, HttpClientTestingModule, {
        provide: EndpointsRuleService,
        useValue: endpointSpy
      }, {
          provide: EndpointsCoreCrudService,
          useValue: endpointServiceUrlSpy
        }],
      imports: [AppMaterialModuleForSpec, HttpClientTestingModule, HttpClientModule],
    });
    service = TestBed.inject(TransactionService);
    httpTestingController = TestBed.inject(HttpTestingController);
    endpointRuleServiceSpy = TestBed.inject(EndpointsRuleService) as jasmine.SpyObj<EndpointsRuleService>;
    endpointServiceSpy = TestBed.inject(EndpointsCoreCrudService) as jasmine.SpyObj<EndpointsCoreCrudService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setMasterData & getMasterData method check', () => {
    const data = {
      childRecord: [],
      controlData: {
        crId: '1',
        draft: false,
        eventId: 1,
        layoutId: '1',
        massId: '1',
        moduleId: '1',
        parentCrId: '1',
        processId: '1',
        processFlowId: '1',
        recordNumber: '1',
        referenceId: '1',
        roleId: '1',
        taskId: '1',
        tenantId: '1',
        userId: '1',
      },
      mdoCRRecordES: {
        crId: '1',
        wfvs: {}
      },
      mdoRecordES: {
        gvs: {},
        hdvs: {
          address: {
            vc: [{ c: '', t: '' }]
          }
        },
        hyvs: {},
        id: '1',
        stat: ObjectStatus.APP,
        strId: '1',
        descriptions: []
      }
    };
    service.setMasterData(data, false);
    expect(service.getMasterData()).not.toBe(null)
  });

  it('setDescriptionFormData & getDescriptionFormData method check', () => {
    service.setDescriptionFormData({ data: true });
    expect(service.getDescriptionFormData()).toEqual({ data: true });
  });

  it('isFieldRuleHidden()', () => {
    service.fieldDetails = {
      address: {
        isRuleHidden: true,
        fieldId: 'address',
        fieldType: 'text',
        isMandatory: true,
        moduleId: 1,
        order: 1,
        structureId: 1,
        isReadOnly: false,
        fieldCtrl: {
          description: 'test',
          dataType: 'test',
          pickList: 'test',
          maxChar: 1,
          structureId: 1,
          fieldId: 'test',
          isCriteriaField: false,
          isWorkFlow: false,
          isGridColumn: false,
          isDescription: false,
          textCase: 'test',
          isFutureDate: false,
          isPastDate: false,
          moduleId: 1,
          isReference: false,
          isDefault: false,
          isHeirarchy: false,
          isWorkFlowCriteria: false,
          isNumSettingCriteria: false,
          isCheckList: false,
          isCompBased: false,
          dateModified: 1,
          isTransient: false,
          isSearchEngine: false,
          isPermission: false,
          isMandatory: true,
          structDesc: 'test',
          isReadOnly: false,
        },
        description: 'test',
        tabDetails: null,
      }
    }

    expect(service.isFieldRuleHidden('address')).toEqual(true);
    expect(service.isFieldRuleHidden('name')).toEqual(null);
  });

  it('updateRuleHidden()', () => {
    service.fieldDetails = {
      address: {
        isRuleHidden: false,
        fieldId: 'address',
        fieldType: 'text',
        isMandatory: true,
        moduleId: 1,
        order: 1,
        structureId: 1,
        isReadOnly: false,
        fieldCtrl: {
          description: 'test',
          dataType: 'test',
          pickList: 'test',
          maxChar: 1,
          structureId: 1,
          fieldId: 'test',
          isCriteriaField: false,
          isWorkFlow: false,
          isGridColumn: false,
          isDescription: false,
          textCase: 'test',
          isFutureDate: false,
          isPastDate: false,
          moduleId: 1,
          isReference: false,
          isDefault: false,
          isHeirarchy: false,
          isWorkFlowCriteria: false,
          isNumSettingCriteria: false,
          isCheckList: false,
          isCompBased: false,
          dateModified: 1,
          isTransient: false,
          isSearchEngine: false,
          isPermission: false,
          isMandatory: true,
          structDesc: 'test',
          isReadOnly: false,
        },
        description: 'test',
        tabDetails: null,
      }
    }
    service.updateRuleHidden('address', true);
    expect(service.fieldDetails.address.isRuleHidden).toEqual(true);

    service.updateRuleHidden('address', false);
    expect(service.fieldDetails.address.isRuleHidden).toEqual(false);
  });

  it('setNumberOfTabs()', () => {
    service.setNumberOfTabs(2);
    expect(service.numberOfTabs).toEqual(2);
    expect(service.numberOfLoadedTabs).toEqual(0);
  });

  it('getFieldValidators()', () => {
    const validators = service.getFieldValidators(fieldObj)

    expect(validators.length).toEqual(2);
  });

  it('updateHdvs() values', () => {
    service.masterData = {
      childRecord: [],
      controlData: {
        crId: '1',
        draft: false,
        eventId: 1,
        layoutId: '1',
        massId: '1',
        moduleId: '1',
        parentCrId: '1',
        processId: '1',
        processFlowId: '1',
        recordNumber: '1',
        referenceId: '1',
        roleId: '1',
        taskId: '1',
        tenantId: '1',
        userId: '1',
      },
      mdoCRRecordES: {
        crId: '1',
        wfvs: {}
      },
      mdoRecordES: {
        gvs: {},
        hdvs: {
          address: {
            vc: [{ c: '', t: '' }]
          }
        },
        hyvs: {},
        id: '1',
        stat: ObjectStatus.APP,
        strId: '1',
        descriptions: []
      }
    }

    service.updateHdvs('address', ['test'], '', [], '');

    expect(service.masterData.mdoRecordES).toEqual({
      gvs: {},
      hdvs: {
        address: {
          vc: [{ c: 'test', t: '' }]
        }
      },
      hyvs: {},
      id: '1',
      stat: ObjectStatus.APP,
      strId: '1',
      descriptions: []
    });
  });

  it('resetTransactioinService()', () => {
    service.resetTransactioinService();

    expect(service.isFormRulesLoaded).toBeFalse();
    expect(service.numberOfLoadedTabs).toBe(undefined);
    expect(service.rules.length).toEqual(0);
  });

  it('updateDescription() should return value', () => {
    service.masterData = {
      childRecord: [],
      controlData: {
        crId: '1',
        draft: false,
        eventId: 1,
        layoutId: '1',
        massId: '1',
        moduleId: '1',
        parentCrId: '1',
        processId: '1',
        processFlowId: '1',
        recordNumber: '1',
        referenceId: '1',
        roleId: '1',
        taskId: '1',
        tenantId: '1',
        userId: '1',
      },
      mdoCRRecordES: {
        crId: '1',
        wfvs: {}
      },
      mdoRecordES: {
        gvs: {},
        hdvs: {},
        hyvs: {},
        id: '1',
        stat: ObjectStatus.APP,
        strId: '1',
        descriptions: [{
          classCode: '1',
          classMode: '1',
          isDesc: true,
          attributes: {
            ['en']: {
              shortDesc: '1',
              longDesc: '1',
              attrs: {
                ['test']: {
                  fId: '1',
                  vc: [{ c: '1', t: '1' }],
                  oc: [],
                  bc: [],
                  uom: {}
                }
              }
            }
          }
        }]
      }
    }
    service.updateDescription('1', '1', 'en', '1', '1', {
      test: {
        fId: '1',
        vc: [{ c: '1', t: '1' }],
        oc: [],
        bc: [],
        uom: {}
      }
    }, '');
    expect(service.getMasterData().mdoRecordES.descriptions).not.toBe(null);
  });


  it('getAllClass()', async(() => {
    const url = `getModuleClass`;
    // mock url
    endpointRuleServiceSpy.getModuleClass.and.returnValue(url);

    const response = {};

    // actual service call
    service.getAllClass('1', '').subscribe((actualResponse) => {
      expect(actualResponse).not.toBe(null);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('GET');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('deleteNumberSetting()', async(() => {
    const url = `deleteNumberSettingUrl`;
    // mock url
    endpointServiceSpy.deleteNumberSettingUrl.and.returnValue(url);

    const response = {};

    // actual service call
    service.deleteNumberSetting('1', 'test').subscribe((actualResponse) => {
      expect(actualResponse).not.toBe(null);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('DELETE');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

  it('getGenDescription()', async(() => {
    const url = `getDescriptionUrl`;
    // mock url
    endpointRuleServiceSpy.getDescriptionUrl.and.returnValue(url);

    const response = {};

    // actual service call
    service.getGenDescription({ data: 'test' }).subscribe((actualResponse) => {
      expect(actualResponse).not.toBe(null);
    });
    // mock http call
    const mockRequst = httpTestingController.expectOne(`${url}`);
    expect(mockRequst.request.method).toEqual('POST');
    expect(mockRequst.request.responseType).toEqual('json');
    mockRequst.flush(response);
    // verify http
    httpTestingController.verify();
  }));

});
