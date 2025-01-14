import { Request, Response, NextFunction } from 'express';
import { LogService } from '../../services/log.service';
import { LogLevel, LogAction } from '../../schemas/log';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof AppError) {
    // Log operational errors
    if (err.isOperational && req.user) {
      LogService.createLog(
        LogLevel.ERROR,
        LogAction.UPDATE,
        req.user,
        'error',
        err.message,
        req,
        undefined,
        { stack: err.stack }
      ).catch(console.error);
    }

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Programming or other unknown errors
  console.error('ERROR', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
};