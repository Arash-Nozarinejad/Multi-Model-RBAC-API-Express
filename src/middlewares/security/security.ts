import config  from "../../config/env.config";
import { Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

export const configureSecurityMiddleware = (app: Express) => {
    app.use(helmet());

    const limiter = rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use(limiter);

    app.set('trust proxy', 1);

    app.use(helmet.frameguard({ action: 'deny' }));

    app.use(helmet.xssFilter());

    app.use(helmet.noSniff());

    app.use(helmet.hsts({
        maxAge:31536000,
        includeSubDomains: true,
        preload: true
    }));

    app.use((req, _, next) => {
        if (req.query) {
            for (const key in req.query) {
                if (Array.isArray(req.query[key])) {
                    req.query[key] = req.query[key][0];
                }
            }
        }
        next();
    });
};