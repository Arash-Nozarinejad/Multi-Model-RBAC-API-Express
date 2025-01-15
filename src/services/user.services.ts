import  AppDataSource  from '../config/typeorm.config';
import { User, UserRole } from '../entities/User';
import { AuthService } from './auth.service';
import { AppError } from '../middlewares/error/errorHandler';
import { ERROR_MESSAGES } from '../constants/permissions';

export interface CreateUserDto {
  username: string;
  password: string;
  role: UserRole;
  managerId?: string;
}

export interface UpdateUserDto {
  username?: string;
  isActive?: boolean;
  managerId?: string;
}

export class UserService {
  private static userRepository = AppDataSource.getRepository(User);

  static async createUser(data: CreateUserDto, creatorRole: UserRole): Promise<User> {
    if (!this.canAssignRole(creatorRole, data.role)) {
      throw new AppError(403, ERROR_MESSAGES.INVALID_ROLE);
    }

    const existingUser = await this.userRepository.findOne({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new AppError(400, 'Username already exists');
    }

    if (data.managerId) {
      const manager = await this.userRepository.findOne({
        where: { id: data.managerId, role: UserRole.MANAGER },
      });

      if (!manager) {
        throw new AppError(400, 'Invalid manager ID');
      }
    }

    const hashedPassword = await AuthService.hashPassword(data.password);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  static async updateUser(
    id: string,
    data: UpdateUserDto,
    updaterRole: UserRole,
    updaterId: string
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (!this.canModifyUser(updaterRole, updaterId, user)) {
      throw new AppError(403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (data.managerId) {
      const manager = await this.userRepository.findOne({
        where: { id: data.managerId, role: UserRole.MANAGER },
      });

      if (!manager) {
        throw new AppError(400, 'Invalid manager ID');
      }
    }

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  static async deleteUser(
    id: string,
    deleterRole: UserRole,
    deleterId: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (!this.canModifyUser(deleterRole, deleterId, user)) {
      throw new AppError(403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  static async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  static async getUsers(filters: {
    role?: UserRole;
    managerId?: string;
    isActive?: boolean;
  }): Promise<User[]> {
    return this.userRepository.find({ where: filters });
  }

  private static canAssignRole(assignerRole: UserRole, roleToAssign: UserRole): boolean {
    const roleHierarchy: Record<UserRole, UserRole[]> = {
      [UserRole.ADMIN]: [UserRole.MANAGER, UserRole.OPERATOR],
      [UserRole.MANAGER]: [UserRole.OPERATOR],
      [UserRole.OPERATOR]: [],
    };
  
    return roleHierarchy[assignerRole].includes(roleToAssign);
  }

  private static canModifyUser(
    modifierRole: UserRole,
    modifierId: string,
    targetUser: User
  ): boolean {
    if (modifierRole === UserRole.ADMIN) return true;

    if (modifierRole === UserRole.MANAGER) {
      return targetUser.role === UserRole.OPERATOR && targetUser.managerId === modifierId;
    }

    return modifierRole === UserRole.OPERATOR && modifierId === targetUser.id;
  }
}