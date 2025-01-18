import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import CalendarAgent from '../../lib/agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Use getServerSession instead of getSession
    const session = await getServerSession(req, res, authOptions);
    console.log('API Session:', JSON.stringify(session, null, 2));

    if (!session) {
      console.log('No session found in API route');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!session.accessToken) {
      console.log('No access token found in API route');
      return res.status(401).json({ error: 'No access token' });
    }

    if (req.method !== 'POST') {
      return res.status(405).end();
    }

    const agent = new CalendarAgent(process.env.OPENAI_API_KEY!);
    const response = await agent.processMessage(
      req.body.message,
      session.accessToken
    );

    res.status(200).json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
} 