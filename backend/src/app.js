import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { languageMiddleware } from './middleware/lang.js';
import { attachUser } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';

import authRoutes from './routes/auth.routes.js';
import cropsRoutes from './routes/crops.routes.js';
import pricesRoutes from './routes/prices.routes.js';
import decisionRoutes from './routes/decision.routes.js';
import auctionsRoutes from './routes/auctions.routes.js';
import disputesRoutes from './routes/disputes.routes.js';
import ratingsRoutes from './routes/ratings.routes.js';

const app = express();
import cropsRoutes from "./routes/crops.routes.js";
app.use("/api/crops", cropsRoutes);


app.use(cors({
  origin: env.FRONTEND_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// i18n based on Accept-Language
app.use(languageMiddleware);

// Attach req.user if token cookie exists
app.use(attachUser);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/decision', decisionRoutes);
app.use('/api/auctions', auctionsRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/ratings', ratingsRoutes);

// 404 handler with required error format
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
