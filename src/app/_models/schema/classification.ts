export interface Attribute {
    sno: number;
    nounCode: string;
    attrCode: string;
    attrDesc: string;
    prefix: string;
    type: AttributeDataType;
    attFieldLen;
    attFieldType;
    attributeOrder;
    attributeValuesModels: Array<AttributeDefaultValue>;
    descActive: string;
    helpText: string;
    isActive: string;
    isCheckList;
    longPrefix: string;
    longSuffix: string;
    mandtory: string;
    numCode: string;
    sapChars: string;
    suffix: string;
    uom;
    uomValue;
}

export enum AttributeDataType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    LIST = 'PICKLIST'
}

export interface AttributeDefaultValue {
    code: string;
    shortValue: string;
    // UI fields
    codeTemp?: string;
    codeEditable?: boolean;
    shortValueTemp?: string;
    shortValueEditable?: boolean;
}

/* export interface Modifier {
    sno: number;
    nounCode: string;
    nounNumCode: string;
    nounLong: string;
    modeCode: string;
    modNumCode: string;
    modLong: string;
    unspcCode: string;
    gs1Code: string;
    shortDescActive: string;
    active: string;
    plantCode: string;
    objectType: string;
} */

export interface CreateNounModRequest {
    nounCode: string;
    nounNumCode: string;
    nounLong: string;
    modeCode: string;
    modNumCode: string;
    modLong: string;
    unspcCode: string;
    gs1Code: string;
    shortDescActive: string;
    active: string;
    plantCode: string;
    objectType: string;
    matlGroup?: string;
}

export interface AttributesMapping {
    libraryNounCode: string;
    localNounCode: string;
    libraryModCode: string;
    localModCode: string;
    localNounSno?: string;
    attributeMapData: AttributeMapData[];
}

export interface AttributeMapData {
    libraryAttributeCode: string;
    localAttributeCode: string;
}
