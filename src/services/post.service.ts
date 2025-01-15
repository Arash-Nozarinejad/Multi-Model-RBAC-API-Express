import AppDataSource  from '../config/typeorm.config';
import { Post } from '../entities/Post';
import { User, UserRole } from '../entities/User';
import { AppError } from '../middlewares/error/errorHandler';
import { ERROR_MESSAGES } from '../constants/permissions';

export interface CreatePostDto {
  title: string;
  content: string;
  userId: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
}

export class PostService {
  private static postRepository = AppDataSource.getRepository(Post);
  private static userRepository = AppDataSource.getRepository(User);

  static async createPost(data: CreatePostDto): Promise<Post> {
    const user = await this.userRepository.findOne({
      where: { id: data.userId, isActive: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const post = this.postRepository.create({
      ...data,
      isPublished: false,
    });

    return this.postRepository.save(post);
  }

  static async updatePost(
    id: string,
    data: UpdatePostDto,
    updaterRole: UserRole,
    updaterId: string
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    // Check if user has permission to update the post
    if (!this.canModifyPost(updaterRole, updaterId, post)) {
      throw new AppError(403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    Object.assign(post, data);
    return this.postRepository.save(post);
  }

  static async deletePost(
    id: string,
    deleterRole: UserRole,
    deleterId: string
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    // Check if user has permission to delete the post
    if (!this.canModifyPost(deleterRole, deleterId, post)) {
      throw new AppError(403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    await this.postRepository.remove(post);
  }

  static async publishPost(
    id: string,
    publisherId: string,
    publisherRole: UserRole
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    // Only managers and admins can publish posts
    if (publisherRole !== UserRole.ADMIN && publisherRole !== UserRole.MANAGER) {
      throw new AppError(403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    // If manager, check if they manage the post's author
    if (publisherRole === UserRole.MANAGER) {
      const postAuthor = await this.userRepository.findOne({
        where: { id: post.userId },
      });

      if (!postAuthor || postAuthor.managerId !== publisherId) {
        throw new AppError(403, ERROR_MESSAGES.UNAUTHORIZED);
      }
    }

    post.isPublished = true;
    post.publishedAt = new Date();
    post.publishedBy = publisherId;

    return this.postRepository.save(post);
  }

  static async getPost(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    return post;
  }

  static async getPosts(filters: {
    userId?: string;
    isPublished?: boolean;
    managerId?: string;
  }): Promise<Post[]> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user');

    if (filters.userId) {
      queryBuilder.andWhere('post.userId = :userId', { userId: filters.userId });
    }

    if (filters.isPublished !== undefined) {
      queryBuilder.andWhere('post.isPublished = :isPublished', {
        isPublished: filters.isPublished,
      });
    }

    if (filters.managerId) {
      queryBuilder.andWhere('user.managerId = :managerId', {
        managerId: filters.managerId,
      });
    }

    return queryBuilder.getMany();
  }

  private static canModifyPost(
    modifierRole: UserRole,
    modifierId: string,
    post: Post
  ): boolean {
    // Admin can modify any post
    if (modifierRole === UserRole.ADMIN) return true;

    // Manager can modify posts of their operators
    if (modifierRole === UserRole.MANAGER) {
      return post.user.managerId === modifierId;
    }

    // Operators can only modify their own posts
    return modifierRole === UserRole.OPERATOR && post.userId === modifierId;
  }
}