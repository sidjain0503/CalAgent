import { ObjectId } from 'mongodb';
import { MessageRepository } from '../db/repositories/messageRepo';
import { SessionRepository } from '../db/repositories/sessionRepo';
import { Message, ChatSession } from '../db/models/message';

export class ChatService {
  private messageRepo: MessageRepository;
  private sessionRepo: SessionRepository;

  constructor() {
    this.messageRepo = new MessageRepository();
    this.sessionRepo = new SessionRepository();
  }

  async createSession(userId: string, title?: string): Promise<ChatSession> {
    return await this.sessionRepo.create(userId, title);
  }

  async sendMessage(
    sessionId: string,
    content: string,
    role: 'user' | 'assistant' | 'system' | 'function',
    metadata?: any
  ): Promise<Message> {
    // Create the message
    const message = await this.messageRepo.create({
      sessionId: new ObjectId(sessionId),
      content,
      role,
      metadata,
      timestamp: new Date()
    });

    // Update session's last message
    await this.sessionRepo.updateLastMessage(sessionId, content);

    return message;
  }

  async getSessionHistory(sessionId: string): Promise<Message[]> {
    return await this.messageRepo.findBySessionId(sessionId);
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    return await this.sessionRepo.findByUserId(userId);
  }

  async getRecentMessages(userId: string, limit?: number): Promise<Message[]> {
    return await this.messageRepo.findRecentByUserId(userId, limit);
  }

  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    await this.sessionRepo.updateTitle(sessionId, title);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.sessionRepo.delete(sessionId);
  }
} 