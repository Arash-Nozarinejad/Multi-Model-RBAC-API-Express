import { Router } from "express";
import { AuthController } from "src/controllers/auth.controller";
import { authenticate } from "src/middlewares/auth/authenticate";

const router = Router();

router.post('/login', AuthController.login);

router.use(authenticate);
router.post('/change-password', AuthController.changePassword);
router.get('/validate', AuthController.validateSession);

export default router;