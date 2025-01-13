import express, { Response, Express } from "express";
import cors from "cors";
import helmet from "helmet";

const app: Express = express();

//Middleware Section
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (res: Response) => {
    res.json({ message: 'RBAC API is running!'});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;