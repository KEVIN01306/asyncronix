import express from 'express';
import cors from 'cors'
import routes from './routes/index.routes.js';
import cookieParser from 'cookie-parser';

const app = express()

app.use(cors({
    origin: ['http://localhost:5001','https://app.asyncronix.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase body size limits to accept base64 image payloads (adjust if needed)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser())

app.use(routes)


export default app;
