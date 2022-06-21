export enum PackageType {
    DATASET = 'DATASET',
    INTEGRATION_MAPPINGS = 'INTEGRATION_MAPPINGS',
    FLOW = 'FLOW',
    BUSINESS_RULE = 'BUSINESS_RULE',
    SCHEMA = 'SCHEMA',
    DASHBOARD = 'DASHBOARD',
    ANALYTICS_PAGE = 'ANALYTICS_PAGE',
    SOLUTION = 'SOLUTION',
    SAP_TRANSPORTS = 'SAP_TRANSPORTS'
}

export enum Status {
    DRAFT = 'DRAFT',
    RELEASED = 'RELEASED',
    WITHDRAWN = 'WITHDRAWN',
    SUPERSEEDED = 'SUPERSEEDED'
}

export class Package {
    id: string;
    packageId: number;
    version: number;
    type: PackageType;
    userId: string;
    orgId: string;
    tags: string[];
    name: string;
    brief: string;
    whatsNew: string;
    createdDate: string;
    releaseDate: string;
    imageUrls?: string[];
    videoUrls?: string[];
    docUrls?: string[];
    imgs?: string[];
    vdos?: string[];
    docs?: string[];
    origin: string;
    status: Status;
    releasedByUId: string;
    contentId?: string;
    importLog: any;
}

export class PublishPackage {
    id: number | string;
    type: PackageType;
    name: string;
    brief: string;
    scenarioIds?: string[];
}

export enum PackageOptions {
  GET = 'GET',
  UPDATE = 'UPDATE',
  INSTALLED = 'INSTALLED',
}
