import express, { Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import cropRoutes from './routes/cropRoutes';
import pricesRoutes from './routes/prices.routes';
import negotiationRoutes from './routes/negotiationRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import qualityRoutes from './routes/qualityRoutes';
import schemeRoutes from './routes/schemeRoutes';
import advisoryRoutes from './routes/advisoryRoutes';
import disputeRoutes from './routes/disputeRoutes';
import demandRoutes from './routes/demandRoutes';
import adminRoutes from './routes/adminRoutes';
import poolingRoutes from './routes/pooling.routes';
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
app.use('/admin', adminRoutes);
app.use('/crops', cropRoutes);
app.use('/negotiations', negotiationRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes);
app.use('/quality', qualityRoutes);
app.use('/schemes', schemeRoutes);
app.use('/advisory', advisoryRoutes);
app.use('/disputes', disputeRoutes);
app.use('/demand', demandRoutes);
app.use('/pooling', poolingRoutes);

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
