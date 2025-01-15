export enum ResourceType {
    USER = 'user',
    POST = 'post',
    LOG = 'log',
  }
  
  export enum ActionType {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    MANAGE = 'manage',
    PUBLISH = 'publish',
  }
  
  export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'You are not authorized to perform this action',
    INVALID_RESOURCE: 'Invalid resource identifier',
    RESOURCE_NOT_FOUND: 'Resource not found',
    NOT_RESOURCE_OWNER: 'You do not own this resource',
    NOT_MANAGER: 'You are not the manager of this resource',
    INVALID_ROLE: 'Invalid role for this action',
  };
  
  export const SUCCESS_MESSAGES = {
    RESOURCE_CREATED: 'Resource created successfully',
    RESOURCE_UPDATED: 'Resource updated successfully',
    RESOURCE_DELETED: 'Resource deleted successfully',
    POST_PUBLISHED: 'Post published successfully',
  };