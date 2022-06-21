export class GenerateDescReq {
    moduleId: string;
    nounCodevc: string;
    nounCodeoc: string;
    modCodevc: string;
    modCodeoc: string;
    attributeCorReqDesList: AttributeCoreReqDesc[];
    languageList: string[];
    recordES: RecordES;
}

export class AttributeCoreReqDesc {
    attributeCodevc: string;
    attributeCodeoc: string;
    attributeValvc: string;
    attributeValoc: string;
    uomCodevc: string;
    uomCodeoc: string;
}

export class RecordES {
    strId: string = '1';
    hdvs: any = {};
    gvs: any= {};
    hyvs: any = {};
}

export class ClassificationDataReq {
    schemaId: string;
    classCode: string;
    classMode: string;
    isMaster: boolean;
    pageNo: number;
    pageSize: number;
}