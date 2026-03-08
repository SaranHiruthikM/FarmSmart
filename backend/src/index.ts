import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import { seedSchemesAndAdvisory } from './utils/seedSchemes';
import { createServer } from 'http';
import { initSocket } from './socket';

dotenv.config();

// Connect to Database
connectDB().then(() => {
    // Seed data on startup (for demo purposes)
    seedSchemesAndAdvisory();
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
