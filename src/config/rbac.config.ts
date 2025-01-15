import { UserRole } from "src/entities/User";

export interface Permission {
    action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'publish';
    resource: 'user' | 'post' | 'log';
}

type RolePermission = {
    [key in UserRole]: Permission[];
};

export const ROLE_PERMISSIONS: RolePermission = {
    [UserRole.ADMIN] : [
        { action: 'manage', resource: 'user' },
        { action: 'manage', resource: 'post' },
        { action: 'read', resource: 'log'},
    ],
    [UserRole.MANAGER]: [
        { action: 'create', resource: 'user' }, 
        { action: 'read', resource: 'user' }, 
        { action: 'update', resource: 'user' },
        { action: 'manage', resource: 'post' },
        { action: 'publish', resource: 'post' },
      ],
      [UserRole.OPERATOR]: [
        { action: 'read', resource: 'user' },
        { action: 'create', resource: 'post' },
        { action: 'read', resource: 'post' }, 
        { action: 'update', resource: 'post' },
        { action: 'delete', resource: 'post' },
      ],
};

export const hasPermission = (
    role: UserRole,
    action: Permission['action'],
    resource: Permission['resource']
): boolean => {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.some(
        (permission) => 
            (permission.action == action || permission.action === 'manage') && 
            permission.resource == resource
    );
};

export const getReousePermissions = (
    role: UserRole,
    resource: Permission['resource']
): Permission['action'][] => {
    return ROLE_PERMISSIONS[role]
        .filter((permission) => permission.resource === resource)
        .map((permission) => permission.action);
};

