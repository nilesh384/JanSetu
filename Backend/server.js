import dbConnect from './db/dbConnect.js';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config({path: './.env'});

const PORT = process.env.PORT || 4000;

// Enable permissive CORS for all origins and common methods/headers


// Connect to database and start server
const startServer = async () => {
  try {
    await dbConnect();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
