import { Collection, Db, ObjectId } from 'mongodb';
import { ChatSession, Message, COLLECTIONS } from '../models/message';
import { getDatabase } from '../dbclient';

export class MessageRepository {
  private db: Db | null = null;
  private collection: Collection<Message> | null = null;

  private async init() {
    if (!this.db) {
      console.log('Initializing MessageRepository...');
      this.db = await getDatabase();
      this.collection = this.db.collection<Message>(COLLECTIONS.MESSAGES);
      console.log('MessageRepository initialized with collection:', COLLECTIONS.MESSAGES);
    }
  }

  async create(message: Omit<Message, '_id'>): Promise<Message> {
    await this.init();
    console.log('Creating message:', message);
    try {
      const result = await this.collection!.insertOne(message as Message);
      console.log('Message created with ID:', result.insertedId);
      return {
        ...message,
        _id: result.insertedId
      } as Message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async findBySessionId(sessionId: string): Promise<Message[]> {
    await this.init();
    console.log('Finding messages for session:', sessionId);
    try {
      const messages = await this.collection!
        .find({ sessionId: new ObjectId(sessionId) })
        .sort({ timestamp: 1 })
        .toArray();
      console.log(`Found ${messages.length} messages for session:`, sessionId);
      return messages;
    } catch (error) {
      console.error('Error finding messages:', error);
      throw error;
    }
  }

  async findRecentByUserId(userId: string, limit: number = 50): Promise<Message[]> {
    await this.init();
    return await this.collection!
      .find({ 'metadata.userId': userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async updateMetadata(messageId: string, metadata: any): Promise<void> {
    await this.init();
    await this.collection!.updateOne(
      { _id: new ObjectId(messageId) },
      { $set: { metadata } }
    );
  }
}

export class SessionRepository {
  private db: Db | null = null;
  private collection: Collection<ChatSession> | null = null;

  private async init() {
    if (!this.db) {
      this.db = await getDatabase();
      this.collection = this.db.collection<ChatSession>(COLLECTIONS.SESSIONS);
    }
  }

  async create(userId: string, title: string = 'New Chat'): Promise<ChatSession> {
    await this.init();
    const session: Omit<ChatSession, '_id'> = {
      userId,
      title,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection!.insertOne(session as ChatSession);
    return {
      ...session,
      _id: result.insertedId
    } as ChatSession;
  }

  async findById(sessionId: string): Promise<ChatSession | null> {
    await this.init();
    return await this.collection!.findOne({ _id: new ObjectId(sessionId) });
  }

  async findByUserId(userId: string): Promise<ChatSession[]> {
    await this.init();
    return await this.collection!
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async updateLastMessage(sessionId: string, lastMessage: string): Promise<void> {
    await this.init();
    await this.collection!.updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: { 
          lastMessage,
          updatedAt: new Date()
        } 
      }
    );
  }

  async updateTitle(sessionId: string, title: string): Promise<void> {
    await this.init();
    await this.collection!.updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: { 
          title,
          updatedAt: new Date()
        } 
      }
    );
  }

  async delete(sessionId: string): Promise<boolean> {
    await this.init();
    const result = await this.collection!.deleteOne({ _id: new ObjectId(sessionId) });
    return result.deletedCount === 1;
  }
} 