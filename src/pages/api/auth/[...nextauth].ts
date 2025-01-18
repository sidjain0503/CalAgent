import NextAuth, { AuthOptions } from 'next-auth';
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
    async jwt({ token, account }) {
      console.log('JWT Callback:', { token, account });
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log('Session Callback:', { session, token });
      session.accessToken = token.accessToken;
      return session;
    },
  },
  debug: true,
};

export default NextAuth(authOptions); 