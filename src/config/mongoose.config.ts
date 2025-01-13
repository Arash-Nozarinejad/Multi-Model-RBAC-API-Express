import mongoose from 'mongoose';
import config from './env.config';

export const initializeMongoDB = async () => {
    try {
        await mongoose.connect(config.mongodb.uri);

        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                process.exit(0);
            } catch (error) {
                process.exit(1);
            }
        })
    } catch (error) {
        throw error;
    }
}

export const closeMongoDb = async () => {
    try {
        await mongoose.connection.close();
    } catch (error) {
        throw error;
    }
}
