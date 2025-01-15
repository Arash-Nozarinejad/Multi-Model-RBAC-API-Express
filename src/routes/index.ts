import { Router } from "express";
import { AppError } from "src/middlewares/error/errorHandler";
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

router.get('/health', (_, res) => {
    res.status(200).json({
        status: 'success',
        message: 'searver is healthy',
        timestamp: new Date().toString(),
    });
});

router.get('/version', (_, res) => {
    res.status(200).json({
        version: '1.0.0',
        environment: process.env.NODE_ENV,
    });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

router.get('/', (_, res) => {
    res.status(200).json({
        message: 'Welcome to the RBAC API',
        documentation: '/api/docs'
    });
});

router.all('*', (req, _, next) => {
    next(new AppError(404, `Cannot find ${req.originalUrl} on this server!`));
});

export default router;