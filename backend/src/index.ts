import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';
import { createServer } from 'http';
import { initSocket } from './socket';

// Connect to Database
connectDB().then(() => {
    console.log("Database connected.");
});

const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Start Server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
