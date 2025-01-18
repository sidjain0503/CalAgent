import type { NextApiRequest, NextApiResponse } from 'next';
import CalendarAgent from '../../lib/agent';

const agent = new CalendarAgent(process.env.OPENAI_API_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    const response = await agent.processMessage(message);
    
    res.status(200).json({ response });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 