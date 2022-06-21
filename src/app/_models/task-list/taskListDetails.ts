export interface TaskListSummaryRequestParams {
    plantCode: string;
    userRole: string;
    taskId: string;
    userId: string;
    wfId: string;
    lang: string;
    objectnumber: string;
    objecttype: string;
    eventCode: string
}

export interface TaskDetailsMetaDataFieldList {
    tcode: string;
    fieldId: string;
    fieldDescri: string;
    dataType: string;
    picklist: number;
    dispCriteria: number;
    strucId: string;
    mandatory: boolean;
    hidden: boolean;
    isCheckList: boolean;
    maxChar: number;
    dependency: string;
    parentField: string;
    locType: string;
    refField: string;
    textAreaWidth: 0;
    structure: string;
    fieldDesc: string;
    checkList: boolean;
    textArealength: number;
    fieldValue: string;
    layoutData?: TaskDetailsLayoutData;
    gridData: any
}

export interface TaskDetailsMetaData {
    fieldsList: Array<TaskDetailsMetaDataFieldList>;
    headerType: string;
    helpLink: string;
    ref_parent_objectId: string;
    tabCode: string;
    tabDesc: string;
}

export interface TaskDetailsLayoutData {
    fieldId: string;
    picklist: number;
    valueCode: string;
    textdisplay: string;
    multiSelect: string;
    imgPath: string;
    allMultiselectvalues: string;
}


export interface ChangeAuditLog {
    labelDescription: string,
    header: Array<{
        fieldId: string;
        fieldDescription: string;
        logValues: {
            oldValue: string,
            newValue: string
        }
    }>
}

export interface AuditLogStep {
    wfId: string;
    user: string;
    role: string;
    receivedOn: string;
    actionedOn: string;
    status: string;
    workflowPath: string;
    stepId: string;
    slaHours: string;
    workflowDescription: string;
    stepText: string;
    eventId: string;
    changeLogData: ChangeAuditLog
}

export interface AuditLog {
    taskId: string;
    crId: string;
    description: string;
    stepDetails: AuditLogStep,
}

export interface CommonGridRequestObject {
    objecttype: string;
    objectNumber?: string;
    eventCode: string;
    plantCode: string;
    lang: string;
    taskId: string;
    wfId: string;
    userRole: string;
    userId: string;
    tabCode?: string;
    tabId?: string;
    fetchSize: number;
    fetchCount: number;
    gridId: string;
}

export interface GridRequestParams {
    objecttype: string;
    tabCode?: string;
    eventCode: string;
    plantCode: string;
    lang: string;
    taskId: string;
    wfId: string;
    userId: string;
    userRole: string;
    fetchCount?: string;
    fetchSize?: string;
    objectNumber?: string;
    gridId?: string;
}

export interface TaskMetaData {
    roleId: string;
    objectNumber: string;
    plantCode: string;
    userName: string;
    taskId: string;
    objectType: string;
    wfid: string;
    eventCode: string;
}

export interface GridMetaDataResponse {
    addRow: boolean;
    allFields: Array<{
        checkList: boolean
        columnWidth: number;
        columnWidthType: string;
        dataType: string;
        defaultDisplay: boolean
        dependency: string;
        fieldDescri: string;
        fieldId: string;
        gridDisplay: boolean
        inlineEdit: boolean
        locType: string;
        mandatory: true
        maxChar: number;
        mobileDisplay: boolean
        parentField: string;
        picklist: number;
        readonlyField: boolean
        refField: string;
        strucId: string;
        textAreaLength: number;
    }>;
    allowSave: boolean;
    attachmentDesc: string;
    catalogId: string;
    classificationTypeGrid: boolean;
    copyRow: boolean;
    delCol: boolean;
    deleteAttachButton: boolean;
    deleteRow: boolean;
    downloadAttachButton: boolean;
    downloadButton: boolean;
    fileTypes: string;
    formHeight: number;
    formView: boolean;
    grdMand: boolean;
    gridDesc: string;
    gridHeight: number;
    gridWidth: number;
    hideGrid: boolean;
    hScroll: string;
    imageMarker: boolean;
    multiDelete: boolean;
    notAllowRemoveRowOn: boolean;
    rowCount: number;
    sortField: boolean;
    sortOrdr: boolean;
    uploadAttachButton: boolean;
    uploadButton: boolean;
    validateButton: string;
}

export interface GridData {
    fieldId: string,
    pickList: number,
    valueCode: string,
    textdisplay: string,
    multiSelect: boolean,
    imgPath: string,
    allMultiselectvalues: string
}

export interface GridDataResponse {
    DATA: Array<{
        String: {
            valueCode: string,
            textdisplay: string,
            multiSelect: boolean,
            imgPath: string,
            allMultiselectvalues: string
        }
    }>,
    HEADER: Array<{
        fieldId: string,
        fieldDescri: string,
        dataType: string,
        picklist: number,
        strucId: string,
        mandatory: boolean,
        maxChar: number,
        dependency: string,
        parentField: string,
        locType: string,
        refField: string,
        textAreaLength: number,
        textAreaWidth?: number,
        columnWidth: number,
        columnWidthType: string,
        gridDisplay: boolean,
        defaultDisplay: boolean,
        readonlyField: boolean,
        mobileDisplay: boolean,
        inlineEdit: boolean,
        checkList: boolean,
    }>
}