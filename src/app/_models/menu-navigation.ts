export enum SecondaynavType {
    schema = 'schema',
    dataIntilligence = 'dataIntilligence',
    report = 'report'
}

export class SecondaryNavRefresh {
    activeMenu: SecondaynavType;
    isPageReload: boolean;
    activeMenuItemId?: string;
    schemaId?: string;
    moduleId?: string;
    schemaName?: string;
}
