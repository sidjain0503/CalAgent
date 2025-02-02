import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { UserRepository } from '../../../lib/db/repositories/userRepo';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        const userRepo = new UserRepository();
        let dbUser = await userRepo.findByEmail(user.email);

        if (!dbUser) {
          // First time user - create new user
          dbUser = await userRepo.createUser({
            email: user.email,
            name: user.name || '',
            image: user.image,
            googleId: profile.sub,
            accessToken: account?.access_token,
            refreshToken: account?.refresh_token,
            tokenExpiresAt: account?.expires_at 
              ? new Date(account.expires_at * 1000)
              : undefined
          });
        } else {
          // Existing user - update tokens
          await userRepo.updateTokens(
            dbUser._id!.toString(),
            account?.access_token!,
            account?.refresh_token,
            account?.expires_at 
              ? new Date(account.expires_at * 1000)
              : undefined
          );
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        const userRepo = new UserRepository();
        const user = await userRepo.findByEmail(profile.email!);
        
        if (user?._id) {
          token.userId = user._id.toString();
          token.accessToken = account.access_token;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions); 