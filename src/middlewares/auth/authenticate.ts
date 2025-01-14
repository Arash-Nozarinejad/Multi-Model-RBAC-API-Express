import { Request, Response, NextFunction } from "express";
import { AuthService } from "src/services/auth.service";
import { AppError } from "../error/errorHandler";
import { UserRole } from "src/entities/User";
import AppDataSource from "src/config/typeorm.config";
import { User } from "src/entities/User";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
            };
        }
    }
};

export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError(401, 'No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = await AuthService.validateToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

export const authorize = (...roles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            next(new AppError(401, 'Log in'));
            return;
        }

        if (!roles.includes(req.user.role as UserRole)) {
            next(new AppError(403, 'Not sufficient permission'));
            return;
        }

        next();
    };
};

export const checkOwnership = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
        next(new AppError(401, 'Log in'));
        return;
    }

    const resourceUserId = req.params.userId || req.body.userId;

    if (
        req.user.role !== UserRole.ADMIN &&
        req.user.role !== UserRole.MANAGER &&
        req.user.id !== resourceUserId
    ) {
        new AppError(403, 'Not sufficient permission');
        return;
    }

    next();
};

export const checkManagerAccess = async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
        next(new AppError(401, 'Log in'));
        return;
    }

    if (req.user.role === UserRole.ADMIN) {
        next();
        return;
    }

    const resourceUserId = req.params.userId || req.body.userId;

    if (req.user.role === UserRole.MANAGER) {
        const userRepository = AppDataSource.getRepository(User);
        const targetUser = await userRepository.findOne({
            where: {id: resourceUserId}
        });

        if (!targetUser || targetUser.managerId !== req.user.id) {
            next (new AppError(403, 'Not sufficient permission'));
            return;
        }
    }

    next();
};