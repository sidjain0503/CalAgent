import { Collection, Db, ObjectId } from 'mongodb';
import { ChatSession, COLLECTIONS } from '../models/message';
import { getDatabase } from '../dbclient';

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
      userId: new ObjectId(userId),
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
      .find({ userId: new ObjectId(userId) })
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