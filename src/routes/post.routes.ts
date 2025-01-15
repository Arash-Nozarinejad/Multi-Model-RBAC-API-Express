import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticate } from '../middlewares/auth/authenticate';
import { postPermissions } from '../middlewares/auth/permissions';
import { checkPermission } from '../middlewares/auth/rbac';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get posts (filtered by userId, isPublished, etc.)
router.get(
  '/',
  checkPermission('read', 'post'),
  PostController.getPosts
);

// Get specific post
router.get(
  '/:postId',
  checkPermission('read', 'post'),
  PostController.getPost
);

// Create new post
router.post(
  '/',
  postPermissions.createPost,
  PostController.createPost
);

// Update post
router.put(
  '/:postId',
  postPermissions.updatePost,
  PostController.updatePost
);

// Delete post
router.delete(
  '/:postId',
  postPermissions.deletePost,
  PostController.deletePost
);

// Publish post (manager only)
router.patch(
  '/:postId/publish',
  postPermissions.publishPost,
  PostController.publishPost
);

export default router;