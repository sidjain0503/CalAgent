import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import { COLLECTIONS } from './models/message';

class DatabaseClient {
  private static instance: DatabaseClient;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    console.log('Initializing MongoDB client...');

    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  async connect(): Promise<Db> {
    try {
      if (!this.db) {
        console.log('Connecting to MongoDB...');
        await this.client?.connect();
        console.log('Connected to MongoDB server');
        
        this.db = this.client?.db('AutoCalAi');
        console.log('Selected database:', this.db?.databaseName);
        
        // Create collections if they don't exist
        const collections = await this.db?.listCollections().toArray();
        const collectionNames = collections?.map(c => c.name);
        console.log('Existing collections:', collectionNames);

        // Create messages collection if it doesn't exist
        if (!collectionNames?.includes(COLLECTIONS.MESSAGES)) {
          console.log('Creating messages collection...');
          await this.db?.createCollection(COLLECTIONS.MESSAGES);
          // Create indexes for messages
          const messagesCollection = this.db?.collection(COLLECTIONS.MESSAGES);
          await messagesCollection?.createIndex({ sessionId: 1 });
          await messagesCollection?.createIndex({ timestamp: 1 });
          console.log('Created messages collection with indexes');
        }

        // Create sessions collection if it doesn't exist
        if (!collectionNames?.includes(COLLECTIONS.SESSIONS)) {
          console.log('Creating sessions collection...');
          await this.db?.createCollection(COLLECTIONS.SESSIONS);
          // Create indexes for sessions
          const sessionsCollection = this.db?.collection(COLLECTIONS.SESSIONS);
          await sessionsCollection?.createIndex({ userId: 1 });
          await sessionsCollection?.createIndex({ updatedAt: -1 });
          console.log('Created sessions collection with indexes');
        }

        console.log('Database initialization complete');
      }
      return this.db!;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.db = null;
        console.log('Successfully disconnected from MongoDB.');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}

// Export a function to get the database instance
export async function getDatabase(): Promise<Db> {
  const client = DatabaseClient.getInstance();
  return await client.connect();
}

// Export a function to close the database connection
export async function closeDatabase(): Promise<void> {
  const client = DatabaseClient.getInstance();
  await client.disconnect();
} 