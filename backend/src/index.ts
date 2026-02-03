import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';

dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 3000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
