import express, { Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import cropRoutes from './routes/cropRoutes';
import pricesRoutes from './routes/prices.routes';
import negotiationRoutes from './routes/negotiationRoutes';
import orderRoutes from './routes/orderRoutes';

import qualityRoutes from './routes/qualityRoutes';
import { sendResponse } from './utils/response';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/crops', cropRoutes);
app.use('/negotiations', negotiationRoutes);
app.use('/orders', orderRoutes);
app.use('/quality', qualityRoutes);

/**
 * Price Comparison & Market Insights
 * Endpoints:
 *  GET /prices/current?crop=
 *  GET /prices/history?crop=&location=
 *  GET /prices/compare?crop=&location=
 */
app.use('/prices', pricesRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  sendResponse(res, 200, 'FarmSmart Backend is running');
});

export default app;
