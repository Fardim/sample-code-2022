import { TestBed } from '@angular/core/testing';

import { Any2tsService } from './any2ts.service';

describe('Any2tsService', () => {
  let service: Any2tsService;

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = new Any2tsService();
  });

  it('should be created', () => {
    service = TestBed.inject(Any2tsService);
    expect(service).toBeTruthy();
  });

  it('anyToSchemaListOnLoadResponse() should return', () => {
    const testData = {
      connection: 'test',
      isDataInsight: 'test',
      moduleList: 'test',
      moduleOrdr: 'test',
      plantCode: 'test',
      roleId: 'test',
      userId: 'test'
    }
    expect(service.anyToSchemaListOnLoadResponse(testData)).not.toBe(null)
  });

  it('any2CategoriesList() should return value', () => {
    const testData = [{
      categoryId: 'test',
      categoryDesc: 'test',
      plantCode: 'test',
    }]
    expect(service.any2CategoriesList(testData)).not.toBe(null)
  })

  it('any2SchemaGroupResponse(), should return value',() => {
    const testData = [{
      groupId: '7867687',
      groupName: 'test',
      updateDate: 12012020,
      isEnable: true,
      plantCode: '454544',
      objectIds: ['1005'],
      error: 20,
      total: 100,
      success: 25,
      skipped: 5,
      outdated: 5,
      duplicate: 10,
      correctionValue: 4,
      successTrendValue: 6,
      errorTrendValue: 7,
      errorPercentage: 3,
      successPercentage: 20,
      exeStartDate: 12202010,
      exeEndDate: 15202011,
    }]
    expect(service.any2SchemaGroupResponse(testData)).not.toBe(null);

    const testData1 = [{
      groupId: '7867687',
      groupName: 'test',
      updateDate: 12012020,
      plantCode: '454544',
    }]
    expect(service.any2SchemaGroupResponse(testData1)).toBeTruthy();
  });

  it('any2VariantFieldList() should return value', () => {
    const testData = [{
      fieldId: 'test',
      dataType: 'test',
      shortText: 'test',
    }]
    expect(service.any2VariantFieldList(testData)).not.toBe(null)
  })

  it('any2SchemaDataTableResponse() should return value', () => {
    const testData = {
      fieldList: [{
        dataType: 'test',
        editable: 'test',
        hidden: 'test',
        index: 'test',
        label: 'test',
        name: 'test',
        picklist: 'test',
        width: 'test',
      }]
    }
    expect(service.any2SchemaDataTableResponse(testData)).not.toBe(null)

    const testData1 = {
      fieldList: [{
        index: 'test',
        label: 'test',
        name: 'test',
        width: 'test',
      }]
    }
    expect(service.any2SchemaDataTableResponse(testData1)).not.toBe(null);

    const testData2 = undefined;
    expect(service.any2SchemaDataTableResponse(testData2)).not.toBe(null);

  })

  it('any2SchemaBrInfoList() should return value', () => {
    const testData = {
      selectedBrData: [{
        brDescription: 'test',
        brId: '3334',
        brType: 'TEST',
        dynamicMessage: 'test purpose',
        fields: 'VALUE',
        refId: '3232',
        schemaId: '6235562654236',
        schemaOrder: 12,
        isAssigned: true,
      }],
      unselectedBrData: [{
        brDescription: 'test',
        brId: '3334',
        brType: 'TEST',
        dynamicMessage: 'test purpose',
        fields: 'VALUE',
        refId: '3232',
        schemaId: '6235562654236',
        schemaOrder: 12,
      }]
    }
    expect(service.any2SchemaBrInfoList(testData)).not.toBe(null);

    const testData1 = {}
    expect(service.any2SchemaBrInfoList(testData1)).not.toBe(null);
  });

  it('any2CategoriesResponse() should return value', () => {
    const testData = {
      CATEGORIES:[{
        categoryId: 'test11',
        categoryDesc: 'test',
        plantCode: '454',
      }]

    }
    expect(service.any2CategoriesResponse(testData)).not.toBe(null);

    const testData1 = {}
    expect(service.any2CategoriesResponse(testData1)).not.toBe(null);
  });

  it('any2DependencyResponse() should return value', () => {
    const testData = {
      referenceDrop:[{
        id: 'test11',
        value: 'test',
      }]
    }
    expect(service.any2DependencyResponse(testData)).not.toBe(null);

    const testData1 = {}
    expect(service.any2DependencyResponse(testData1)).not.toBe(null);
  });

  it('any2VariantDetailsScheduleSchema() should return value', () => {
    const testData = {
      data:[{
        variantId: 'test11',
        variantDesc: 'test',
      }]
    }
    expect(service.any2VariantDetailsScheduleSchema(testData)).not.toBe(null);

    const testData1 = {}
    expect(service.any2VariantDetailsScheduleSchema(testData1)).not.toBe(null);
  });

  it('any2VariantAssignedFieldDetails() should return value', () => {
    const testData = {
      data:[{
        fieldId: 'test11',
        fieldDesc: 'test',
        value: 'VALUE'
      }]
    }
    expect(service.any2VariantAssignedFieldDetails(testData)).not.toBe(null);

    const testData1 = {}
    expect(service.any2VariantAssignedFieldDetails(testData1)).not.toBe(null);
  });

  it('any2SchemaDetails() should return value', () => {
    const testData = {
      groupId: '7765',
      groupName: 'TEST',
      createdDate: 12122010,
      updatedDate: 12122011,
      isEnable: true,
      objectIds: ['1005']
    }
    expect(service.any2SchemaDetails(testData)).not.toBe(null);

    expect(service.any2SchemaDetails(null)).not.toBe(null);

  });


  it('any2UserDetails() should return value', () => {
    const testData = {
      userName: 'avm',
      fname: 'apoorv',
      lname: 'mittal',
      email: 'apoorv.mittal@prospecta.com',
      plantCode: '001',
      currentRoleId: '01',
      dateFormat: '19 may 2020',
      fullName: 'apoorv',
      rolesModel: {
        plantCode: '001',
        roleId: '01',
      },
      userMultiRoleModels: [{
        defaultRole: 'GUEST ROLE',
        roleDesc: 'GUEST',
        roleId: 'ROLE12',
        sno: '5456465r767',
        userId: 'harshit'
      }],
      selfServiceUserModel:{
        ECId:'0'
      }
    }
    expect(service.any2UserDetails([testData])).not.toBe(null)

    expect(service.any2UserDetails(null)).not.toBe(null)

  });


  it('any2SchemaGroupCountResposne() should return value', () => {
    const testData = {
      total: '15',
      error: '2',
      duplicate: '4',
      success: '6',
      skipped: '1',
      outdated: '5',
    }
    expect(service.any2SchemaGroupCountResposne(testData)).not.toBe(null)

    const testData1 = {}
    expect(service.any2SchemaGroupCountResposne(testData1)).not.toBe(null)
  });

  it('any2ObjectType() should return value', () => {
    const testData = [{
      objectDecsription: '',
      objectId: '',
    }]
    expect(service.any2ObjectType(testData)).not.toBe(null)
  });

  it('any2GetAllSchemabymoduleidsResponse() should return value', () => {
    const testData = [{
      discription: '',
      moduleId: '',
      schemaId: '',
    }]
    expect(service.any2GetAllSchemabymoduleidsResponse(testData)).not.toBe(null)
  });


  it('any2SchemaGroupWithAssignSchemasResponse() should return value', () => {
    const testData = {
      groupId: '1005',
      groupName: 'Material',
      objectIds: '545',
      schemaGroupMappings: [{
        schemaGroupId: '1089',
        schemaId: 76543,
        updatedDate: 1222010,
        plantCode: '7654',
      }],
    }
    expect(service.any2SchemaGroupWithAssignSchemasResponse(testData)).not.toBe(null)
  });

  it('any2SchemaListView() should return value', () => {
    const testData = [{
      groupId: '',
      groupName: '',
      objectIds: '',
      schemaGroupMappings: [],
    }]
    expect(service.any2SchemaListView(testData)).not.toBe(null)
  });

  it('any2SchemaDetailsWithCount() should return value', () => {
    const testData =  {
      createdBy: '',
      errorValue: '',
      errorPercentage: '',
      schemaDescription: '',
      schemaId: '',
      successValue: '',
      successPercentage: '',
      totalValue: '',
      skippedValue: '',
      correctionValue: '',
      duplicateValue: '',
      variantCount: '',
      executionStartTime: '',
      executionEndTime: '',
      variantId: '',
      runId: '',
      isInRunning: '',
      brInformation: [{
        brId: '',
        error: 76,
        success: 76,
        skipped: 3,
        outdated: 12122010,
        duplicate: 6,
      }]
    }
    expect(service.any2SchemaDetailsWithCount(testData)).not.toBe(null)

    const testData1 = {
      createdBy: 'harshit',
      schemaId : '656465',
    }
    expect(service.any2SchemaDetailsWithCount(testData1)).not.toBe(null)

  });

  // it('any2DataTable() should return value', () => {
  //   const testData1 = [{
  //     key: '',
  //     docCount: '',
  //     hits: {
  //       _do_br_scs_:'',
  //       _do_br_skp_:'',
  //       _do_br_cor_:'',
  //     },
  //   }]
  //   const requestForSchemaDetailsWithBr1 = { schemaId: '', runId: '', brId: '', plantCode: '', variantId: '', requestStatus: '', executionStartDate: '',
  //   selectedFields: [], fetchSize: 1, fetchCount: 2, gridId: [], hierarchy: [],schemaThreshold:0,afterKey:null}
  //   expect(service.any2DataTable(testData1, requestForSchemaDetailsWithBr1)).not.toBe(null)

  //   const testData2 = [{
  //     key: '',
  //     docCount: '',
  //     hits: {
  //       _do_br_err_: {
  //         hdvs:[{fId:'TEST'}]
  //       },
  //       _do_br_scs_:'',
  //       _do_br_skp_:'',
  //       _do_br_cor_:'',
  //     },
  //   }]
  //   const requestForSchemaDetailsWithBr2 = { schemaId: '', runId: '', brId: '', plantCode: '', variantId: '', requestStatus: '', executionStartDate: '',
  //     selectedFields: [], fetchSize: 1, fetchCount: 2, gridId: [], hierarchy: [],schemaThreshold:0,afterKey:null}
  //   expect(service.any2DataTable(testData2, requestForSchemaDetailsWithBr2)).not.toBe(null)

  //   expect(service.any2DataTable(null, requestForSchemaDetailsWithBr1)).not.toBe(null)

  // })

  // it('any2SchemaTableData() should return value', () => {
  //   const testData = [{
  //     id: '',
  //     hdvs: [],
  //     gvs: [],
  //     hyvs: [],
  //     stat: [],
  //     _score:''
  //   }]
  //   const request = {schemaId: '', runId: '', brId: '', plantCode: '', variantId: '', requestStatus: '', executionStartDate: '', selectedFields: [],
  //     gridId: [], hierarchy: [], fetchSize: 1, fetchCount: 1,schemaThreshold:0, afterKey:null }
  //   expect(service.any2SchemaTableData(testData, request)).not.toBe(null)
  // });

  it('any2CategoryInfo() should return value', () => {
    const samepleData = [{
      categoryDesc: 'test',
      categoryId: '1'
    }]
    expect(service.any2CategoryInfo(samepleData)).not.toBe(null);
  })

  it('any2SchemaStatus() should return value ', () => {
    expect(service.any2SchemaStatus(['test1', 'test2'])).not.toBe(null);
  });

  it('any2VaraintListView() should return value', () => {
    const sampleData = [{
      title: 'test',
      variantId: 'test',
      totalValue: 'test',
      errorValue: 'test',
      successValue: 'test',
      skippedValue: 'test',
      correctionValue: 'test',
      duplicateValue: 'test',
      successTrendValue: 'test',
      errorTrendValue: 'test',
      totalUniqueValue: 'test',
      successUniqueValue: 'test',
      errorUniqueValue: 'test',
      skippedUniqueValue: 'test',
      timestamp: 'test',
      isVariant: 'test',
      isInRunning: 'test'
    }];;
    expect(service.any2VaraintListView(sampleData)).not.toBe(null)
  });

  // it('any2SchemaBrInfo() should return value', () => {
  //   const sampleData = [{
  //     brDescription: '',
  //     brId: '',
  //     brType: '',
  //     dynamicMessage: '',
  //     fields: '',
  //     refId: '',
  //     schemaId: '',
  //     schemaOrder: '',
  //   }];
  //   expect(service.any2SchemaBrInfo(sampleData)).not.toBe(null);
  // });

  it('should call any2CategoriesResponse()', () => {
    const sampleData = {
      CATEGORIES: [{
        categoryDesc: '',
        categoryId: '',
        plantCode: '',
      }]
    }
    expect(service.any2CategoriesResponse(sampleData)).not.toBe(null);
  });

  it('any2LatestCorrectedData() should return value', () => {
    const fieldId = 'TEST'
    const rowObjNum = 'DATA'
    const record = {
      hdvs:{TEST:{fId:'TEST', lls: [{lang: 'ENG', label: 'test'}], vls:[{lang:'ENG', valueText: 'test'}]}}
    }
    expect(service.any2LatestCorrectedData(record, fieldId, rowObjNum)).not.toBe(null);
  });
});
