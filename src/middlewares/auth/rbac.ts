import { Request, Response, NextFunction } from 'express';
import { AppError } from '../error/errorHandler';
import { Permission, hasPermission } from '../../config/rbac.config';
import { UserRole } from '../../entities/User';
import { LogService } from '../../services/log.service';
import { LogLevel, LogAction } from '../../schemas/log';

export const checkPermission = (
  action: Permission['action'],
  resource: Permission['resource']
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Please log in');
      }

      const hasAccess = hasPermission(
        req.user.role as UserRole,
        action,
        resource
      );

      if (!hasAccess) {
        await LogService.createLog(
          LogLevel.WARNING,
          LogAction.UPDATE,
          { id: req.user.id, role: req.user.role } as any,
          resource,
          `Unauthorized ${action} attempt on ${resource}`,
          req
        );

        throw new AppError(403, 'You do not have permission to perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkResourceOwnership = (
  resource: Permission['resource'],
  getResourceUserId: (req: Request) => string | undefined
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Please log in');
      }

      const resourceUserId = getResourceUserId(req);

      if (!resourceUserId) {
        throw new AppError(400, 'Invalid resource identifier');
      }

      // Admins bypass ownership check
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      if (req.user.role === UserRole.MANAGER) {
        return next();
      }

      if (req.user.id !== resourceUserId) {
        await LogService.createLog(
          LogLevel.WARNING,
          LogAction.UPDATE,
          { id: req.user.id, role: req.user.role } as any,
          resource,
          `Unauthorized access attempt to ${resource} owned by ${resourceUserId}`,
          req
        );

        throw new AppError(403, 'You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkManagerScope = (getSubordinateId: (req: Request) => string | undefined) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Please log in');
      }

      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      if (req.user.role !== UserRole.MANAGER) {
        throw new AppError(403, 'Only managers can access this resource');
      }

      const subordinateId = getSubordinateId(req);
      
      if (!subordinateId) {
        throw new AppError(400, 'Invalid subordinate identifier');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};