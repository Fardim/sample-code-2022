export class InterfaceDetails {
    dataset: string;
    flows: string;
    interfaceId: string;
    interfaceType: string;
    name: string;
    status: string;
    type: string;
}

export class InterfaceAPIResponse {
    active: string;
    dmsReference: string;
    enhancementNumber: string;
    externalEntity: string;
    fieldId: string;
    filename: string;
    interfaceType: string;
    isSynchronous: boolean;
    jobId: string;
    objectType: string;
    retryError: string;
    retryFrequency: string;
    scenarioAuth: string;
    scenarioDesc: string;
    scenarioId: string;
    schemaRef: string;
    soapVersion: string;
    sourceSystem: string;
    targetEntityType: string;
    targetSystem: string;
    tenantId: string;
    xslFileSNO: string;
}

export class viewInterfaceDetails {
    interfaceName: string;
    datasetName: string;
    interfaceType: { label: string, value: string};
    interfaceStatus: string;
    fileName: string;
}

export interface payloadTestInitialValue {
    existingMappingValue: existingMapping[],
    initialValue: boolean
}

export interface transformedPayloadTestData {
    structureFieldList: payloadField[],
    structureFields: structureInfo[],
    structureId: string;
    structureName: string;
}

export interface structureInfo {
    fieldId: string;
    fieldName: string;
    fieldPickList: string;
    fieldValue: string;
    structureId: string;
    childFields: structurechildFields[]
}

export interface structurechildFields {
    childFieldDetails: any;
    fieldId: string;
    gridFieldValue: any;
    gridRowValue: any;
    newRow: boolean
}
export interface existingMapping {
    description: string;
    fieldlist: payloadField[],
    isHierarchy: string;
    language: string;
    parentStrucId: string;
    strucDesc: string;
    structureid: string
}

export interface payloadField {
    fieldId: string,
    shortText: {
        en: {
            description: string;
            information: string;
        }
    },
    longtexts: {
        en: string;
    },
    dataType: string;
    pickList: number;
    maxChar: number;
    isKeyField: boolean;
    isCriteriaField: boolean;
    isWorkFlow: boolean;
    isGridColumn: boolean;
    isDescription: boolean;
    textCase: string;
    attachmentSize: any;
    fileTypes: any;
    isFutureDate: boolean;
    isPastDate: boolean;
    outputLen: null,
    structureId: number;
    pickService: any;
    moduleId: number;
    parentField: string,
    isReference: boolean;
    isDefault: boolean;
    isHeirarchy: boolean;
    isWorkFlowCriteria: boolean;
    isNumSettingCriteria: boolean;
    isCheckList: boolean;
    isCompBased: boolean;
    dateModified: any;
    decimalValue: any;
    isTransient: boolean;
    isSearchEngine: boolean;
    isPermission: boolean;
    isDraft: boolean;
    isPersisted: true,
    isRejection: boolean;
    isRequest: boolean;
    childfields: payloadField[],
    isSubGrid: boolean;
    isNoun: boolean;
    isMultiSelect: boolean;
    optionsLimit: number;
    description: string;
    helpText: any;
    longText: any;
    language: any;
    refrules: any;
    refDatasetField: string;
    refDataset: string;
    refDatasetStatus: string;
    lookupRuleId: string;
    gridFields?: any;
    fieldValue?: string;
}