import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import http from 'http';
import { ConnectDB } from './config/connectDB.js';
import Routes from './routes/routes.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 9002;

const server = http.createServer(app);

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://examon-education.vercel.app',
      'http://194.238.18.1',

      'http://mastersaab.co.in',
      'https://mastersaab.co.in',
      'http://www.mastersaab.co.in',
      'https://www.mastersaab.co.in',

      'http://dashboard.mastersaab.co.in',
      'https://dashboard.mastersaab.co.in',
      'http://www.dashboard.mastersaab.co.in',
      'https://www.dashboard.mastersaab.co.in',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  },
});

// STORE IO INSTANCE GLOBALLY
global._io = io;

// SOCKET EVENTS
io.on('connection', (socket) => {
  // console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
  });
});

// CONNECT TO MONGO
ConnectDB(process.env.MONGO_DB_URI);

// CORS CONFIG

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://examon-education.vercel.app',
  'http://194.238.18.1',

  'http://palgharhome.com',
  'https://palgharhome.com',
  'http://www.palgharhome.com',
  'https://www.palgharhome.com',

  'http://dashboard.palgharhome.com',
  'https://dashboard.palgharhome.com',
  'http://www.dashboard.palgharhome.com',
  'https://www.dashboard.palgharhome.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ROUTES
app.use('/api', Routes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// START SERVER (Socket.IO + Express)
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running with Socket.IO on http://localhost:${PORT}`);
});

