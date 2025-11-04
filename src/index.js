import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import { ConnectDB } from './config/connectDB.js';
import Routes from './routes/routes.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT;

ConnectDB(process.env.MONGO_DB_URI);

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://examon-education.vercel.app'];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // allow preflight
    allowedHeaders: ['Content-Type', 'Authorization'], // allow custom headers
    credentials: true,
  }),
);
// app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is running',
  });
});

app.use('/api', Routes);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
