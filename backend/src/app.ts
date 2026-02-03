import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import cropRoutes from './routes/cropRoutes';
import { sendResponse } from './utils/response';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/crops', cropRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  sendResponse(res, 200, 'FarmSmart Backend is running');
});

export default app;
