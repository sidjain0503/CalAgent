import { ObjectId } from 'mongodb';

export type Message = {
  _id?: ObjectId;
  role: "user" | "assistant" | "system" | "function";
  content: string;
  timestamp: Date;
  sessionId: string | ObjectId;  // Allow both string and ObjectId
  name?: string;  // Optional name field for function messages
  metadata?: {
    calendarOperation?: string;
    functionCall?: any;
    functionResult?: any;
  };
};

export interface ChatSession {
  _id?: ObjectId;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
}

// Collection names as constants
export const COLLECTIONS = {
  MESSAGES: 'messages',
  SESSIONS: 'sessions'
} as const; 