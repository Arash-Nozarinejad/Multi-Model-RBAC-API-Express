import AppDataSource from "src/config/typeorm.config";
import bcrypt from 'bcrypt';
import { User } from "src/entities/User";
import jwt from 'jsonwebtoken';
import config from "src/config/env.config";
import { AppError } from "src/middlewares/error/errorHandler";

export class AuthService {
    private static userRepository = AppDataSource.getRepository(User);

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    static async comparePasswords(
        candidatePassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(candidatePassword, hashedPassword);
    }
    
    static createToken(user: User): string {
        return jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            config.jwt.secret,
            {
                expiresIn: config.jwt.expiresIn,
            }
        );
    }

    static async login(username: string, password: string): Promise<{ user: User; token: string}> {
        const user = await this.userRepository.findOne({
            where: {username, isActive: true},
        });

        if (!user) {
            throw new AppError(401, 'Invalid credentials');
        }

        const isPasswordValid = await this.comparePasswords(password, user.password);
        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid credentials');
        }

        const token = this.createToken(user);

        return { user, token };
    }

    static async validateToken(token: string): Promise<{id: string; role: string;}> {
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as {
                id: string;
                role: string;
            };

            const user = await this.userRepository.findOne({
                where: {id: decoded.id, isActive: true},
            });

            if (!user) {
                throw new AppError(401, 'User does not exist or is inactive');
            }

            return decoded
        } catch (error) {
            throw new AppError(401, 'Invalud token or token expired');
        }
    }

    static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: {id: userId, isActive: true},
        });

        if (!user) {
            throw new AppError(404, 'user not found');
        }

        const isPasswordValid = await this.comparePasswords(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new AppError(401, 'current password is incorrect');
        }

        user.password = await this.hashPassword(newPassword);

        await this.userRepository.save(user);
    }
}
