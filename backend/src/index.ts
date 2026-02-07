import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import { seedSchemesAndAdvisory } from './utils/seedSchemes';

dotenv.config();

// Connect to Database
connectDB().then(() => {
    // Seed data on startup (for demo purposes)
    seedSchemesAndAdvisory();
});

const PORT = process.env.PORT || 3000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
