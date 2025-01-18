import NextAuth, { AuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { GOOGLE_CALENDAR_CONFIG } from '../../../config/calendar';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CALENDAR_CONFIG.clientId,
      clientSecret: GOOGLE_CALENDAR_CONFIG.clientSecret,
      authorization: {
        params: {
          scope: GOOGLE_CALENDAR_CONFIG.scopes.join(' '),
          access_type: 'offline',
          response_type: 'code',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log('JWT Callback:', { 
        hasToken: !!token, 
        hasAccount: !!account,
        hasUser: !!user,
        accessToken: account?.access_token
      });

      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log('Session Callback:', { 
        hasSession: !!session,
        hasToken: !!token,
        hasUser: !!user,
        accessToken: token.accessToken
      });

      return {
        ...session,
        accessToken: token.accessToken as string,
      };
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  debug: true,
};

export default NextAuth(authOptions); 