import { Collection, Db, ObjectId } from "mongodb";
import { User, COLLECTIONS } from "../models/users";
import { getDatabase } from "../dbclient";

export class UserRepository {
  private db: Db | null = null;
  private collection: Collection<User> | null = null;

  private async init() {
    if (!this.db) {
      this.db = await getDatabase();
      this.collection = this.db.collection<User>(COLLECTIONS.USERS);
      
      // Create indexes if they don't exist
      await this.collection.createIndex({ email: 1 }, { unique: true });
      await this.collection.createIndex({ googleId: 1 });
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    await this.init();
    return this.collection!.findOne({ email });
  }

  async findById(id: string): Promise<User | null> {
    await this.init();
    return this.collection!.findOne({ _id: new ObjectId(id) });
  }

  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await this.init();
    
    const now = new Date();
    const user: Omit<User, '_id'> = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection!.insertOne(user as User);
    return { ...user, _id: result.insertedId } as User;
  }

  async updateUser(id: string, update: Partial<User>): Promise<User | null> {
    await this.init();
    
    const result = await this.collection!.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...update,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  async updateTokens(id: string, accessToken: string, refreshToken?: string, expiresAt?: Date): Promise<void> {
    await this.init();
    
    const update: any = {
      accessToken,
      updatedAt: new Date()
    };

    if (refreshToken) {
      update.refreshToken = refreshToken;
    }

    if (expiresAt) {
      update.tokenExpiresAt = expiresAt;
    }

    await this.collection!.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
  }
}
