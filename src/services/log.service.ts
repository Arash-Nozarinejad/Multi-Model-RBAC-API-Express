import { Request } from 'express';
import { Log, LogLevel, LogAction, ILog } from '../schemas/log';
import { User } from '../entities/User';

export class LogService {
  static async createLog(
    level: LogLevel,
    action: LogAction,
    user: User,
    resourceType: string,
    description: string,
    req?: Request,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<ILog> {
    try {
      const logData = {
        level,
        action,
        userId: user.id,
        userRole: user.role,
        resourceType,
        description,
        resourceId,
        metadata,
        ip: req?.ip,
        userAgent: req?.headers['user-agent'],
      };

      const log = new Log(logData);
      await log.save();
      return log;
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  }

  static async queryLogs(filters: {
    userId?: string;
    resourceType?: string;
    action?: LogAction;
    level?: LogLevel;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    try {
      const query: any = {};

      if (filters.userId) query.userId = filters.userId;
      if (filters.resourceType) query.resourceType = filters.resourceType;
      if (filters.action) query.action = filters.action;
      if (filters.level) query.level = filters.level;
      
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      const logs = await Log.find(query)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .exec();

      const total = await Log.countDocuments(query);

      return {
        logs,
        total,
        limit,
        offset,
      };
    } catch (error) {
      console.error('Error querying logs:', error);
      throw error;
    }
  }
}