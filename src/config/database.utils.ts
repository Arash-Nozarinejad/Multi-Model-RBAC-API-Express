import AppDataSource from "./typeorm.config";

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
    } catch (error) {
        throw error;
    }
};