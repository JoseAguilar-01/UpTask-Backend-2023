import fs from 'fs';
import https from 'https';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { router as userRouter } from './routes/userRoutes.js';
import { router as projectRouter } from './routes/projectRoutes.js';
import { router as taskRouter } from './routes/taskRoutes.js';
import { connectSocket } from './sockets/socket.js';

const app = express();

const PORT = process.env.PORT || 4000;

const key = fs.readFileSync('cert/key.pem');

const cert = fs.readFileSync('cert/cert.pem');

// Allow receive responses in JSON format
app.use(express.json());

// Configure CORS
const whitelist = ['http://localhost:5173', process.env.FRONTEND_URL];

const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
};

app.use(cors(corsOptions));

// Connect to DB
connectDB();

// Stablish router
app.use('/api/users', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);

// Up node's web server
const server = https
	.createServer({ key: key, cert: cert }, app)
	.listen(PORT, () => console.log(`Server listening in the port: ${PORT}`));

// Socket.io
connectSocket(server, whitelist);
