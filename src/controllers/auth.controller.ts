import { Request, Response, NextFunction } from "express";
import { userInfo } from "os";
import { AppError } from "src/middlewares/error/errorHandler";
import { LogAction, LogLevel } from "src/schemas/log";
import { AuthService } from "src/services/auth.service";
import { LogService } from "src/services/log.service";


export class AuthController {
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                throw new AppError(400, 'Username and password required');
            }

            const { user, token } = await AuthService.login(username, password);

            await LogService.createLog(
                LogLevel.INFO,
                LogAction.LOGIN,
                user,
                'auth',
                'User logged in successfully',
                req
            );

            res.status(200).json({
                status: 'success',
                token,
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { currentPassword, newPasswword } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(401, 'Log in');
            }

            if (!currentPassword || !newPasswword) {
                throw new AppError(400, 'passwords are required');
            }

            await AuthService.changePassword(userId, currentPassword, newPasswword);

            await LogService.createLog(
                LogLevel.INFO,
                LogAction.UPDATE,
                { id: userInfo } as any,
                'auth',
                'User changed password successfully',
                req
            );

            res.status(200).json({
                status: 'success',
                message: 'Password change successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    static async validateSession(req: Request, res: Response) {
        res.status(200).json({
            status: 'success',
            data: {
                user: req.user,
            },
        });
    }
}