import { Request, Response, NextFunction } from 'express';
import { PostService, CreatePostDto, UpdatePostDto } from '../services/post.service';
import { LogService } from '../services/log.service';
import { LogLevel, LogAction } from '../schemas/log';
import { UserRole } from '../entities/User';
import { AppError } from '../middlewares/error/errorHandler';
import { SUCCESS_MESSAGES } from '../constants/permissions';

export class PostController {
  static async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }

      const postData: CreatePostDto = {
        title: req.body.title,
        content: req.body.content,
        userId: req.user.id, // Post creator is the authenticated user
      };

      const post = await PostService.createPost(postData);

      // Log post creation
      await LogService.createLog(
        LogLevel.INFO,
        LogAction.CREATE,
        { id: req.user.id, role: req.user.role } as any,
        'post',
        `Post created: ${post.title}`,
        req,
        post.id
      );

      res.status(201).json({
        status: 'success',
        message: SUCCESS_MESSAGES.RESOURCE_CREATED,
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }

      const postId = req.params.postId;
      const updateData: UpdatePostDto = {
        title: req.body.title,
        content: req.body.content,
      };

      const post = await PostService.updatePost(
        postId,
        updateData,
        req.user.role as UserRole,
        req.user.id
      );

      // Log post update
      await LogService.createLog(
        LogLevel.INFO,
        LogAction.UPDATE,
        { id: req.user.id, role: req.user.role } as any,
        'post',
        `Post updated: ${post.title}`,
        req,
        post.id
      );

      res.status(200).json({
        status: 'success',
        message: SUCCESS_MESSAGES.RESOURCE_UPDATED,
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }

      const postId = req.params.postId;

      await PostService.deletePost(
        postId,
        req.user.role as UserRole,
        req.user.id
      );

      // Log post deletion
      await LogService.createLog(
        LogLevel.INFO,
        LogAction.DELETE,
        { id: req.user.id, role: req.user.role } as any,
        'post',
        `Post deleted: ${postId}`,
        req,
        postId
      );

      res.status(200).json({
        status: 'success',
        message: SUCCESS_MESSAGES.RESOURCE_DELETED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async publishPost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }

      const postId = req.params.postId;

      const post = await PostService.publishPost(
        postId,
        req.user.id,
        req.user.role as UserRole
      );

      // Log post publication
      await LogService.createLog(
        LogLevel.INFO,
        LogAction.PUBLISH,
        { id: req.user.id, role: req.user.role } as any,
        'post',
        `Post published: ${post.title}`,
        req,
        post.id
      );

      res.status(200).json({
        status: 'success',
        message: SUCCESS_MESSAGES.POST_PUBLISHED,
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.params.postId;
      const post = await PostService.getPost(postId);

      res.status(200).json({
        status: 'success',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        userId: req.query.userId as string,
        isPublished: req.query.isPublished === 'true',
        managerId: req.query.managerId as string,
      };

      const posts = await PostService.getPosts(filters);

      res.status(200).json({
        status: 'success',
        data: { posts },
      });
    } catch (error) {
      next(error);
    }
  }
}