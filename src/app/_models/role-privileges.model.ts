import { FilterCriteria } from '@models/schema/schemadetailstable';
import { PrivilegeModel } from '@modules/settings/_components/roles-permissions/role-privilege/role-privilege.component';
export interface RolePrivilegeDto {
  id?: string;
  status?: boolean;
  roleDescription: RoleDescription[];
  userRole?: any;
  privilegeList: PrivilegeList[];
  admin?: boolean;
}

export interface RoleDescription {
  description: string;
  lang: string;
  details: string;
}

export interface PrivilegeList {
  area: string;
  privileges: Privilege[];
}

export interface Privilege {
  id: string;
  actions: Action[];
  description?: string;
  dataRestrict?: DataRestrictDto[]; // in response it will not be there
}

export interface Action {
  text: string;
  code: string;
}

export interface DataRestrict {
  fieldId: string;
  esFieldPath: string;
  values: string[];
  startValue: string;
  endValue: string;
  type: string;
  operator: string;
  dateRange: any;
  sortDirection: string;
  parentValueMap: any;
  dmsReferenceId: any;
  unit?: string;
  fieldType?: string;
  isUpdated?: boolean;
}

export interface DataRestrictDto {
  moduleId: string;
  criteria: Partial<DataRestrict>[];
}

// Role Privilege response

export type RolePrivilegeRespose = PrivilegeList[];


export interface RolePrivilegeDataRestriction {
    roleId: string;
    privilegeId: string;
    filters: PrivilegeModel;
}
export interface RolePrivilegeDataRestrictionFilters {
    roleId: string;
    privilegeId: string;
    moduleId: string;
    filters: FilterCriteria[];
}
