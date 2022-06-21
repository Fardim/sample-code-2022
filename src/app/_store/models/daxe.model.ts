export interface Daxe {
  settings?: string; // Front only

  // Daxe header
  tenantId: string;
  dataSetId?: string;
  id: string;
  name: string;
  version: string;
  assignedState: boolean;
  createdOn: number;
  createdBy: string;
  modifiedOn: number;
  modifiedBy: string;
  status: DaxeStatus;

  // Progrma Detail
  usage: DaxeUsage;
  brief: string;
  whatsNew?: string; // nullable
  daxeCode: string;
}

export interface DaxeRuleResponse {
  content: {
    name: string;
    version: string;
    dateCreated: number;
    dateModified: number;
    daxeCode: string;
    status: DaxeStatus;
    tenantId: string;
    userCreated: string;
    daxeUuid: string;
    helpText: string;
  }[];
}

export interface DaxeInfo {
  dataSetId: string;
  daxeProgrmaDetail: DaxeProgrmaDetail;
  daxeUuid: string;
  helpText: string;
  name: string;
  tenantid: string;
  userModified: string;
}

export interface DaxeProgrmaDetail {
  dateCreated: number;
  dateModified: number;
  daxeCode: string;
  status: string;
  tenantId: string;
  userCreated: string;
  uuid: string;
}

export enum DaxeUsage {
  VALIDATING = 'VALIDATING',
  TRANSFORMING = 'TRANSFORMING'
}

export enum DaxeStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  INACTIVE = 'INACTIVE'
}
