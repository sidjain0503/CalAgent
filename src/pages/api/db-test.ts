import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase, closeDatabase } from '../../lib/db/dbclient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Try to connect to the database
    const db = await getDatabase();
    
    // Get list of collections
    const collections = await db.listCollections().toArray();
    
    // Try to ping the database
    await db.command({ ping: 1 });
    
    // Return success response
    res.status(200).json({
      status: 'Connected',
      databaseName: db.databaseName,
      collections: collections.map(col => col.name),
      message: 'Successfully connected to MongoDB!'
    });

  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      status: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    });
  } finally {
    // Close the connection after test
    await closeDatabase();
  }
} 
