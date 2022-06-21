export class Userdetails {
  firstName: string;
  lastName: string;
  currentRoleId: string;
  fullName: string;
  plantCode: string;
  userName: string;
  dateformat: string;
  email: string;
  assignedRoles: AssignedRoles[];
  selfServiceUserModel: UserPreferenceDetails;
  defLocs: string[];
  userId?: string;
  orgId?: string;
  hasAdminAccess?: boolean;
}
export class AssignedRoles {
  sno: string;
  roleId: string;
  roleDesc: string;
  defaultRole: string;
  userId: string;
}
export class TokenPayLoadData {
  userName: string;
  fullName: string;
  iss: string;
  exp: string;
  iat: string;
}

export class UserPersonalDetails {
  avtarURL: string;
  digitalSignature: string;
  fb: string;
  name: string;
  fname: string;
  linkedin: string;
  lname: string;
  mname: string;
  pemail: string;
  phone: number;
  droolPassword: string;
  profileKey: {
    tenantId: string;
    userName: string;
  };
  publicName: string;
  semail: string;
  twitter: string;
}

export class UserPreferenceDetails {
  dFormat: string;
  lang: string;
  nFormat: string;
  profileKey: UserPreferenceDetailsProfileKey;
  tFormat: string;
  timeZone: string;
  timezone: string;
  decimal: string;
}

export class UserPreferenceDetailsProfileKey {
  tenantId: string;
  userName: string;
}

export class UserPasswordDetails {
  confirmPassword: string;
  newPassword: string;
  oldPassword: string;
}
export class TagsResponse {
  username: string;
  tenantId: string;
  tags: Tag[];
  totalCount?: number;
}

export class Tag {
  id: string;
  description: string;
  usage?: number;
  edit?: boolean;
}

export class TagActionResponse {
  acknowledge: boolean;
  tagId?: any;
  errorMsg: string;
}

export class MergeTagDTO {
  tagDescription: string;
  tagIds: string[];
}

export class UserPasswordPolicy {
  uuid: string;
  minimumLength: number;
  upperCase: boolean;
  lowerCase: boolean;
  digit: boolean;
  specialCharacterAllowed: boolean;
  initialLoginPaswordReset: boolean;
  historyCount: number;
  maximumAge: number;
  maxloginAttempts: number;
  userDefinedValues?: string[];
  systemDefinedValues?: string[];
  userId: string;
  tenantId: string;
}
export class UserPasswordPolicyDto {
  uuid: string;
  minimumLength: number;
  upperCase: boolean;
  lowerCase: boolean;
  digit: boolean;
  specialCharacterAllowed: boolean;
  initialLoginPaswordReset: boolean;
  historyCount: number;
  maximumAge: number;
  maxloginAttempts: number;
  userDefinedValues: string[];
  systemDefinedValues: string[];
}
export class UserPasswordPolicyActionResponse {
  id: string;
  message: string;
  interrupt: boolean;
}

export class UserImportLogs {
  packageId: number;
  versionId: number;
  importedBy: string;
  importedAt: number;
  packageType: string;
  status: string;
  uuid: string | null;
}

export class UserImportLogsResponse {
  uuid: string;
  packageId: string;
  versionId: string;
  importedBy: string;
  importedAt: number;
  packageType: string;
  status: string;
}


export interface LocationListResponse {
  content: LocationContent[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: string;
  size: number;
  sort: {empty: boolean, unsorted: boolean, sorted: boolean}
  totalElements: number;
  totalPages: number;
}

export interface LocationContent {
  isActive: boolean;
  launchDate: Date;
  logo: string;
  prefixUri: string;
  regionCode: string;
  regionDesc: string;
  regionId: string;
  regionName: string;
  updatedOn: Date;
}

export class tenantDetails {
  tenantName: string;
  orgId: string;
  roleId:string;
  location: LocationContent;
  type: {label: '', value: ''};
}

export interface tenantList {
  master: boolean;
  orgId: string;
  roleId: string;
  status: string;
  tenantName: string;
  tenantRegionId: string;
  type: string;
}

export interface saveTenantResponse {
  id: number;
  interrupt: boolean;
  message: string;
  redirectURI: string;
}

export interface licensingInformation {
  uuid : string;
  orgId : string;
  licenceId : string
  licenceType : string;
  expirationTime : string;
  status : string;
  tenantId : string;
}