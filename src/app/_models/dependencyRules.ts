export class Rules{
         uuid: string;
         groupId: string;
         moduleId: string;
         status: string;
         description: string;
}
export class StructuresResponse {
    structureId: number;
    moduleId: string;
    parentStrucId: string;
    isHeader: boolean;
    language: string;
    strucDesc: string;
    Fields:FieldMetaData[]
}
export class SelectedOptionsRule {
    structureId: number;
    StructureFieldDesc: string;
    strucDesc: string;
    FieldId:string;
    pickList:string;
    parentStrucId?: number;
}
export class FieldMetaData {
        fieldId: string;
        shortText: string;
        longtexts: string;
        dataType: string;
        pickList: string;
        maxChar: number;
        isKeyField: boolean;
        isCriteriaField: boolean;
        isWorkFlow: boolean;
        isGridColumn: boolean;
        isDescription: boolean;
        textCase: string;
        attachmentSize: string;
        fileTypes:string;
        isFutureDate: boolean;
        isPastDate: boolean;
        outputLen: string;
        structureId: number;
        pickService: string;
        moduleId: number;
        parentField:string;
        isReference: boolean;
        isDefault: boolean;
        isHeirarchy: boolean;
        isWorkFlowCriteria: boolean;
        isNumSettingCriteria: boolean;
        isCheckList: boolean;
        isCompBased: boolean;
        dateModified: number;
        decimalValue:string;
        isTransient: boolean;
        isSearchEngine: boolean;
        isPermission: boolean;
        isDraft: boolean;
        isPersisted: boolean;
        isRejection: boolean;
        isRequest: boolean;
        childfields: [];
        isSubGrid: boolean;
        optionsLimit: string
}
