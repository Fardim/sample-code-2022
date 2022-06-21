export class RolesResponse {
    acknowledge: boolean;
    roleId: string;
    errorMsg: string;
}

export class RolesDetail {
    admin?: boolean;
    id?: string;
    status?: boolean;
    roleDescription: RoleDescription[];
    userRole?: UserRole;
}

export class RoleDescription {
    description: string;
    lang: string;
    details?: string
}

export class UserRole {
    default: boolean;
    userId: string;
}

export class RolesDescription {
    roleDescription: RolesList[];
}

export class RolesList {
    dateCreated: Date;
    dateModified: Date;
    roleId: string;
    roleName: string;
    status: boolean;
}

export class RoleUsersCount {
    roleId: string;
    countOfUsers: number;
}

export class GetRolesPost {
    pageNumer?: number;
    pageSize?: number;
}