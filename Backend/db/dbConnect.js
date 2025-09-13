import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

const dbConnect = async () => {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    console.log('Connected to PostgreSQL database');
    // Optionally export or return client for queries
    return client;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};

export default dbConnect;