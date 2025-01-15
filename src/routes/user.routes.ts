import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth/authenticate';
import { userPermissions } from '../middlewares/auth/permissions';
import { checkPermission } from '../middlewares/auth/rbac';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get users (filtered by role, managerId, etc.)
router.get(
  '/',
  checkPermission('read', 'user'),
  UserController.getUsers
);

// Get specific user
router.get(
  '/:userId',
  checkPermission('read', 'user'),
  UserController.getUser
);

// Create new user (Admin can create managers, Manager can create operators)
router.post(
  '/',
  userPermissions.createOperator,
  UserController.createUser
);

// Update user
router.put(
  '/:userId',
  userPermissions.updateUser,
  UserController.updateUser
);

// Delete user (soft delete)
router.delete(
  '/:userId',
  userPermissions.deleteUser,
  UserController.deleteUser
);

export default router;