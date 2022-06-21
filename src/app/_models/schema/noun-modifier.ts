export class NounModifier {
    SHORT_DESC: string;
    LONG_DESC: string;
    MANUFACTURER: string;
    PARTNO: string;
    NOUN_LONG: string;
    NOUN_CODE: string;
    NOUN_ID: string;
    NSNO?: string;
    MODE_CODE: string;
    MOD_LONG: string;
    UNSPSC: string;
    UNSPSC_DESC: string;
    MGROUP: string;
    ATTRIBUTES: AttributesDoc[];
}

export class AttributesDoc {
    MANDATORY: string;
    ATTRIBUTE_ID: string;
    ATTR_DESC: string;
    ATTR_CODE: string;
    TEXT_FIELD: string;
    DROPDOWN_FIELD: string;
    ATTRIBUTES_VALUES: AttributesValuesDoc[];
    localAttributeCode?: string;
    localAttributeText?: string;
    status?: string;

}

export class AttributesValuesDoc {
    ATTRIBUTE_ID: string;
    SHORT_VALUE: string;
    CODE: string;
    LONG_VALUE: string;
}

export class ClassificationMappingRequest {
    modCode: string;
    modDesc: string;
    nounCode: string;
    nounDesc: string;
    attrList: Array<{
        attrCode: string;
        attrDesc: string;
    }>;
}

export class AttributeTargetControl {
    MANDATORY: string;
    ATTRIBUTE_ID: string;
    ATTR_DESC: string;
    ATTR_CODE: string;
    TEXT_FIELD: string;
    DROPDOWN_FIELD: string;
    ATTRIBUTES_VALUES: string;
    LENGTH: string;
    DESC_ACTIVE: string;
    FIELD_TYPE: string;
}
export type AttributeStatusType = 'unmatched' | 'suggested' | 'matched';
export class ClassificationMappingResponse {
    noun: {
        source: string;
        targetCtrl: any;
        targetNounSno?: string;
        status: AttributeStatusType;
    };
    modifier: {
        source: string;
        targetCtrl: any;
        status: AttributeStatusType;
    };
    attrLists: Array<{
        source: string;
        targetCtrl: any;
        status: AttributeStatusType;
    }>;
}