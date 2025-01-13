import 'reflect-metadata'
import express, { Response, Express } from "express";
import cors from "cors";
import helmet from "helmet";
import config from './config/env.config';
import { initializeDatabase } from './config/typeorm.config';

const app: Express = express();

//Middleware Section
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (res: Response) => {
    res.json({ message: 'RBAC API is running!'});
});

const PORT = config.port;

const startServer = async () => {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        process.exit(1);
    }
}

startServer();

export default app;