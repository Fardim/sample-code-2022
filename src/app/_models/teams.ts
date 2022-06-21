export class TeamMember {
  id?: string;
  email: string;
  fname: string;
  joinedDate: string;
  lastActiveDate: string;
  lname: string;
  roles: TeamMemberRole[];
  status: string;
  userName: string;
  datasetId?: string;
  recordNumber?: string;
}
export class TeamMemberRole {
  roleDesc: string
  roleId: string
}
export class TeamMemberResponse {
  acknowledge: boolean;
  errorMsg: string = null;
  userList: UserList = new UserList();
}
export class UserList {
  content: TeamMember[] = [];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}

export class InviteTeamMember {
  email: string;
  roles: string[];
  datasetId?: string;
  recordNumber?: string;
}

export class TeamActionResponse {
  acknowledge: boolean;
  errorMsg: string;
  response?: InviteValidationResult[];
}

export class InviteValidationResult {
  email: string;
  errorMessage: string;
}

// Role response model classes
export class TeamRoleResponse {
  acknowledge: boolean
  errorMsg: any
  listPage: ListPage
}

export class ListPage {
  content: Role[]
  pageable: Pageable
  totalElements: number
  last: boolean
  totalPages: number
  sort: Sort
  number: number
  numberOfElements: number
  first: boolean
  size: number
  empty: boolean
}
export class Role {
  uuid?: string
  roleId: string
  description: string
  lang?: string
  tenantId?: string
}
export class Pageable {
  sort: Sort
  pageNumber: number
  pageSize: number
  offset: number
  paged: boolean
  unpaged: boolean
}
export class Sort {
  sorted: boolean
  unsorted: boolean
  empty: boolean
}
export class UserListRequestDTO {
  pageInfo: PageInfo
  roles: string[]
  searchString: string
  sortingInfo: SortingInfo[]
  status: string[]
  isPartner = false
}
export class PageInfo {
  pageNumer: number
  pageSize: number
}
export class SortingInfo {
  direction: string
  fieldId: string
}
export class RoleRequestDto {
  pageInfo: PageInfo
  searchString: string
}
export class UserInfoListResponse {
  acknowledge: boolean
  errorMsg: any
  listPage: UserInfoListPage
}
export class UserInfoListPage {
  content: UserInfo[]
  pageable: Pageable
  totalElements: number
  last: boolean
  totalPages: number
  sort: Sort
  number: number
  numberOfElements: number
  first: boolean
  size: number
  empty: boolean
}
export class UserInfo {
  userName: string
  fname?: string
  lname?: string
}

export enum UserType {
  Modify = 'Modify',
  Created = 'Created',
  All = 'All'
}
