import { Request, Response, NextFunction } from 'express';
import { UserService, CreateUserDto, UpdateUserDto } from '../services/user.services';
import { LogService } from '../services/log.service';
import { LogLevel, LogAction } from '../schemas/log';
import { UserRole } from '../entities/User';
import { AppError } from '../middlewares/error/errorHandler';
import { SUCCESS_MESSAGES } from '../constants/permissions';

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }

      const userData: CreateUserDto = {
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
        managerId: req.body.managerId,
      };

      const user = await UserService.createUser(userData, req.user.role as UserRole);

      // Log user creation
      await LogService.createLog(
        LogLevel.INFO,
        LogAction.CREATE,
        { id: req.user.id, role: req.user.role } as any,
        'user',
        `User ${user.username} created with role ${user.role}`,
        req,
        user.id
      );

      res.status(201).json({
        status: 'success',
        message: SUCCESS_MESSAGES.RESOURCE_CREATED,
        data: {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            managerId: user.managerId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }

      const userId = req.params.userId;
      const updateData: UpdateUserDto = {
        username: req.body.username,
        isActive: req.body.isActive,
        managerId: req.body.managerId,
      };

      const user = await UserService.updateUser(
        userId,
        updateData,
        req.user.role as UserRole,
        req.user.id
      );

      // Log user update
      await LogService.createLog(
        LogLevel.INFO,
        LogAction.UPDATE,
        { id: req.user.id, role: req.user.role } as any,
        'user',
        `User ${user.username} updated`,
        req,
        user.id
      );

      res.status(200).json({
        status: 'success',
        message: SUCCESS_MESSAGES.RESOURCE_UPDATED,
        data: {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            managerId: user.managerId,
            isActive: user.isActive,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }

      const userId = req.params.userId;

      await UserService.deleteUser(
        userId,
        req.user.role as UserRole,
        req.user.id
      );

      // Log user deletion
      await LogService.createLog(
        LogLevel.INFO,
        LogAction.DELETE,
        { id: req.user.id, role: req.user.role } as any,
        'user',
        `User ${userId} deleted`,
        req,
        userId
      );

      res.status(200).json({
        status: 'success',
        message: SUCCESS_MESSAGES.RESOURCE_DELETED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const user = await UserService.getUser(userId);

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            managerId: user.managerId,
            isActive: user.isActive,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        role: req.query.role as UserRole,
        managerId: req.query.managerId as string,
        isActive: req.query.isActive === 'true',
      };

      const users = await UserService.getUsers(filters);

      res.status(200).json({
        status: 'success',
        data: {
          users: users.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            managerId: user.managerId,
            isActive: user.isActive,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}