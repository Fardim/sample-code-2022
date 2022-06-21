import { DropDownValue } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { FilterCriteria } from './schema/schemadetailstable';

export class Collaborator {}
export class ReportDashboardPermission {
  permissionId: number;
  reportId: string;
  userId: string;
  roleId: string;
  groupId: string;
  isEditable: boolean;
  isViewable: boolean;
  isDeleteable: boolean;
  isAdmin: boolean;
  permissionType: PermissionType;
  description: string;
  fullName?: string;
  userMdoModel: UserContent;
  rolesModel: RoleContent;
  groupHeaderModel: GroupHeaderModel;
  showEditMode: boolean;
}

export class SchemaDashboardPermission {
  uuid?: string;
  sno: number | string;
  schemaId: string;
  userid: string;
  roleId: string;
  groupid: string;
  isAdmin: boolean;
  isViewer: boolean;
  isEditer: boolean;
  isReviewer: boolean;
  permissionType?: PermissionType;
  type?: PermissionType;
  description: string;
  userMdoModel: UserMdoModel;
  rolesModel: RolesModel;
  groupHeaderModel: GroupHeaderModel;
  plantCode: string;
  filterCriteria: FilterCriteria[];
  dataAllocation?: Array<DropDownValue>;
  isCopied?: boolean;
  isInvited?: boolean;
}

export enum PermissionType {
  USER = 'USER',
  ROLE = 'ROLE',
  GROUP = 'GROUP',
}

export interface PermissionOnCollaborator {
  users: UserContent[];
  roles: RoleContent[];
  // groups: GroupHeaderModel[];
}
export interface PermissionOn {
  users: UserMdoModel[];
  roles: RolesModel[];
  groups: GroupHeaderModel[];
}

export interface UserMdoModel {
  userId: string;
  userName: string;
  fName: string;
  lName: string;
  fullName: string;
  email: string;
  roleDesc?: string;
  roleId?: string;
  initials?: string;
  selected?: boolean;
  isAdd?: boolean;
  sNo?: string | number;
}

export interface RolesModel {
  roleId: string;
  roleDesc: string;
}
export interface GroupHeaderModel {
  groupId: number;
  groupIdAsStr: string;
  description: string;
}

export interface SchemaCollaborator {
  sno: string;
  schemaId: string;
  isAdmin: boolean;
  isReviewer: boolean;
  isViewer: boolean;
  isEditer: boolean;
  permissionType: string;
  userid: string;
  roleId: string;
  plantCode: string;
  filterFieldIds?: Array<string>;
  dataAllocation?: Array<DropDownValue>;
  filterCriteria?: FilterCriteria[];
}

export interface CreateSchemaSubscriber {
  sno: number;
  isAdmin: boolean;
  isReviewer: boolean;
  isViewer: boolean;
  isEditer: boolean;
  permissionType: string;
  userid: string;
  plantCode: number;
  filterCriteria?: FilterCriteria[];
}

export const ROLES = [
  { code: 'isAdmin', text: 'Admin', value: false },
  { code: 'isEditer', text: 'Editor', value: false },
  { code: 'isReviewer', text: 'Reviewer', value: false },
];

export class WidgetDownloadUser {
  userName: string;
  description?: string;
  email: string;
}

export enum RuleDependentOn {
  ALL = 'ALL',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  SKIPPED = 'SKIPPED',
  OUTDATED = 'OUTDATED',
  DUPLICATE = 'DUPLICATE',
  DRAFT = 'DRAFT',
}
export class WidgetDownloadBody {
  userList: WidgetDownloadUser[];

  filterCriteria: string;
}

export interface ProfileUserModel {
  acknowledge: boolean;
  errorMsg:    string;
  listPage:    UserList;
}

export interface ProfileRoleModel {
  acknowledge: boolean;
  errorMsg:    string;
  listPage:    RoleList;
}

export interface UserList {
  content:          UserContent[];
  empty:            boolean;
  first:            boolean;
  last:             boolean;
  number:           number;
  numberOfElements: number;
  pageable:         Pageable;
  size:             number;
  sort:             Sort;
  totalElements:    number;
  totalPages:       number;
}

export interface RoleList {
  content:          RoleContent[];
  empty:            boolean;
  first:            boolean;
  last:             boolean;
  number:           number;
  numberOfElements: number;
  pageable:         Pageable;
  size:             number;
  sort:             Sort;
  totalElements:    number;
  totalPages:       number;
}

export interface UserContent {
  fname:    string;
  lname:    string;
  userName: string;
  fullName?: string;
}
export interface RoleContent {
  description: string;
  lang:        string;
  roleId:      string;
  tenantId:    string;
  uuid:        string;
}

export interface Pageable {
  offset:     number;
  pageNumber: number;
  pageSize:   number;
  paged:      boolean;
  sort:       Sort;
  unpaged:    boolean;
}

export interface Sort {
  empty:    boolean;
  sorted:   boolean;
  unsorted: boolean;
}

