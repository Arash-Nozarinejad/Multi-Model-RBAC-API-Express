import { Request, Response, NextFunction } from 'express';
import { checkPermission, checkManagerScope, checkResourceOwnership } from './rbac';

export const combineMiddleware = (middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chain = middlewares.reduce((promise, middleware) => {
        return promise.then(() => {
          return new Promise((resolve, reject) => {
            middleware(req, res, (error?: any) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          });
        });
      }, Promise.resolve());

      await chain;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common permission combinations
export const userPermissions = {
  createOperator: combineMiddleware([
    checkPermission('create', 'user'),
    checkManagerScope(req => req.body.managerId)
  ]),
  
  updateUser: combineMiddleware([
    checkPermission('update', 'user'),
    checkResourceOwnership('user', req => req.params.userId)
  ]),
  
  deleteUser: combineMiddleware([
    checkPermission('delete', 'user'),
    checkResourceOwnership('user', req => req.params.userId)
  ])
};

export const postPermissions = {
  createPost: checkPermission('create', 'post'),
  
  updatePost: combineMiddleware([
    checkPermission('update', 'post'),
    checkResourceOwnership('post', req => req.body.userId || req.params.userId)
  ]),
  
  deletePost: combineMiddleware([
    checkPermission('delete', 'post'),
    checkResourceOwnership('post', req => req.params.userId)
  ]),
  
  publishPost: combineMiddleware([
    checkPermission('publish', 'post'),
    checkManagerScope(req => req.params.userId)
  ])
};