import 'reflect-metadata'
import express, { Response, Express } from "express";
import cors from "cors";
import config from './config/env.config';
import { initializeDatabase } from './config/database.utils';
import { initializeMongoDB } from './config/mongoose.config';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import { configureSecurityMiddleware } from './middlewares/security/security';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error/errorHandler';

const app: Express = express();

//Basic Middleware Section
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// Logging Middleware
if (config.node_env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Security middleware
configureSecurityMiddleware(app);

//routes
app.use('/api/v1', routes)

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

const startServer = async () => {
    try {
        await Promise.all([
            initializeDatabase(),
            initializeMongoDB()
        ]);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        process.exit(1);
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err);
    process.exit(1);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err);
    process.exit(1);
  });
  

startServer();

export default app;