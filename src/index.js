import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import { ConnectDB } from './config/connectDB.js';
import Routes from './routes/routes.js';

const app = express();
const PORT = process.env.PORT;

ConnectDB(process.env.MONGO_DB_URI);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', Routes);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
