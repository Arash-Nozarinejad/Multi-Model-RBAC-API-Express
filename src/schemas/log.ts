import mongoose, { Schema, Document } from 'mongoose';

export enum LogLevel {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error'
}

export enum LogAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
    PUBLISH = 'publish'
}

export interface ILog extends Document {
    timestamp: Date;
    level: LogLevel;
    action: LogAction;
    userId: string;
    userRole: string;
    resourceType: string;
    resourceId?: string;
    description: string;
    metadata?: Record<string, any>;
    ip?: string;
    userAgent?: string;
}

const LogSchema: Schema = new Schema({
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    level: {
      type: String,
      enum: Object.values(LogLevel),
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(LogAction),
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ip: String,
    userAgent: String,
  }, {
    timestamps: true,
    versionKey: false,
});

LogSchema.index({ timeStamp: -1});
LogSchema.index({ action: 1, reSourceType: 1});
LogSchema.index({ userId: 1, timeStamp: -1});

export const Log = mongoose.model<ILog>('Log', LogSchema);
  