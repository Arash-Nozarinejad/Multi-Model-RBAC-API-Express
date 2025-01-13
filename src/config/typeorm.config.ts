import { DataSource } from "typeorm";
import config from './env.config';
import path from 'path';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.postgres.host,
    port: config.postgres.port,
    username: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database,
    synchronize: config.node_env === 'development',
    logging: config.node_env === ' development',
    entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
    migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
    subscribers: [path.join(__dirname, '../subscribers/**/*.{ts,js}')],
});

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
    } catch (error) {
        throw error;
    }
};