import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { MessageRepository } from '../../../lib/db/repositories/messageRepo';
import { SessionRepository } from '../../../lib/db/repositories/messageRepo';
import { CalendarAgent } from '../../../lib/calagent/agent';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Messages API called:', {
    method: req.method,
    query: req.query,
    body: req.body
  });

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    console.log('Unauthorized: No user session');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const messageRepo = new MessageRepository();
  const sessionRepo = new SessionRepository();

  // GET /api/chat/messages?sessionId=xxx
  if (req.method === 'GET') {
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      console.log('Bad request: No sessionId provided');
      return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
      console.log('Fetching messages for session:', sessionId);
      const messages = await messageRepo.findBySessionId(sessionId);
      console.log(`Returning ${messages.length} messages`);
      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  // POST /api/chat/messages
  if (req.method === 'POST') {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      console.log('Bad request: Missing message or sessionId');
      return res.status(400).json({ error: 'Message and session ID are required' });
    }

    try {
      console.log('Processing chat message:', { sessionId, message });

      // Save user message
      const userMessage = await messageRepo.create({
        sessionId: new ObjectId(sessionId),
        content: message,
        role: 'user',
        timestamp: new Date()
      });
      console.log('User message saved:', userMessage);

      // Process with agent
      const agent = new CalendarAgent(process.env.OPENAI_API_KEY!);
      const agentResponse = await agent.processMessage(
        message,
        session.accessToken || '',
        sessionId.toString()
      );
      console.log('Agent response:', agentResponse);

      // Save assistant message
      const assistantMessage = await messageRepo.create({
        sessionId: new ObjectId(sessionId),
        content: agentResponse,
        role: 'assistant',
        timestamp: new Date()
      });
      console.log('Assistant message saved:', assistantMessage);

      // Update session with last message
      await sessionRepo.updateLastMessage(sessionId, message);

      return res.status(200).json({
        userMessage,
        assistantMessage
      });
    } catch (error) {
      console.error('Error processing message:', error);
      return res.status(500).json({ error: 'Failed to process message' });
    }
  }

  console.log('Method not allowed:', req.method);
  return res.status(405).json({ error: 'Method not allowed' });
} 