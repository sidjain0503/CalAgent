import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { GOOGLE_CALENDAR_CONFIG } from '../../../config/calendar';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CALENDAR_CONFIG.clientId,
      clientSecret: GOOGLE_CALENDAR_CONFIG.clientSecret,
      authorization: {
        params: {
          scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'openid',
            'email',
            'profile'
          ].join(' '),
          access_type: 'offline',
          response_type: 'code',
          prompt: 'consent',
        },
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, account }) {
      console.log('JWT Callback:', { token, account });
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback:', { session, token });
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
}); 