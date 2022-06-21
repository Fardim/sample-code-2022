
export interface FilterRequestObject {
    fieldDesc: string,
    fieldId: string,
    objectDesc: string,
    objectId: string,
    plantCode: string,
    locale: string,
    clientId: number,
    language: string,
    fetchCount: number,
    searchTerm: string,
    fetchSize: number
}

export interface StaticFilter {
    status: string;
    priority: string;
    recieved_date: string;
    region: string;
    due_date: string;
    requested_by: string;
    requested_date: string;
}

export interface DynamicFilter {
    objectType: string;
    objectDesc: string;
    filterFields: Array<FilterListObject>;
    colorActive?: boolean;
}

export interface DilterFieldsObject {
    fieldId: string;
    fieldDesc: string;
    checkBoxlist: FilterList[];
    fetchCount: number;
    objectId: string;
    objectDesc: string;
}

export interface FilterListObject {
    CODE: string;
    TEXT: string;
    checked: boolean;
    fieldDesc: string;
    fieldId: string;
    objectDesc: string;
    objectId: string;
}

export interface FilterListObjectResponse {
    fieldId: string;
    filterList: Array<FilterListObject>
}

export interface FilterList {
    checked: boolean;
    objectId: string;
    fieldId: string;
    fieldDesc: string;
    objectDesc: string;
    checkBoxCode: string;
    checkBoxText: string;
    TEXT: string;
    CODE: string;
}

export interface Tag {
    checkBoxCode: string;
    checkBoxText: string;
    fieldDesc: string;
    fieldId: string;
    objectDesc: string;
    objectId: string;
    text: string;
}

export interface InnerObj {
    objectId: string,
    fieldData: {
        fieldId: string,
        filterList: string[]
    }
}

export interface Filter {
    staticFilters: StaticFilter;
    dynamicFilters?: DynamicFilter[];
    tags: Tag[],
    apiRequestStructure: InnerObj[]
}
export interface TaskListRequest {
    fetchCount: number,
    fetchSize: number,
    filtersMap: object,
    objectToLoad: Array<string>,
    sortField: Array<{}>
}