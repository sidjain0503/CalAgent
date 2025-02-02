import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { SessionRepository } from '../../../lib/db/repositories/messageRepo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Sessions API called:', {
    method: req.method,
    url: req.url,
    query: req.query
  });

  const session = await getServerSession(req, res, authOptions);
  console.log('Auth session:', {
    userId: session?.user?.id,
    email: session?.user?.email
  });
  
  if (!session?.user?.id) {
    console.log('Unauthorized: No user session');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sessionRepo = new SessionRepository();

  if (req.method === 'GET') {
    try {
      console.log('Fetching sessions for user:', session.user.id);
      const sessions = await sessionRepo.findByUserId(session.user.id);
      console.log('Found sessions:', sessions.length);
      return res.status(200).json({ sessions });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('Creating new session for user:', session.user.id);
      const newSession = await sessionRepo.create(session.user.id);
      console.log('Created session:', newSession);
      return res.status(201).json(newSession);
    } catch (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }
  }

  console.log('Method not allowed:', req.method);
  return res.status(405).json({ error: 'Method not allowed' });
} 