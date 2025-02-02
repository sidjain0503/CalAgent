import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email?: string;
      name?: string;
      image?: string;
    } & DefaultSession['user'];
  }
  
  interface User {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  }
} 