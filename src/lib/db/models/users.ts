import { ObjectId } from "mongodb";

export type User = {
    _id?: ObjectId;
    email: string;                    // Primary identifier (from Google)
    name: string;                     // User's full name
    image?: string;                   // Profile image URL
    googleId?: string;  // Store Google's sub/ID
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }

export const COLLECTIONS = {
  USERS: "users",
} as const;
