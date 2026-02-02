import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import cropRoutes from './routes/cropRoutes';
import { sendResponse } from './utils/response';
import connectDB from './config/db';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
console.log('Mounting auth routes...');
app.use('/auth', authRoutes);
app.use('/crops', cropRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  sendResponse(res, 200, 'FarmSmart Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
