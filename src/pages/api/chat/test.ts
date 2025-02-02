import { NextApiRequest, NextApiResponse } from 'next';
import { ChatService } from '../../../lib/services/chatService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chatService = new ChatService();

    // Create a test session
    const session = await chatService.createSession(
      '123', // Test user ID
      'Test Chat Session'
    );

    // Send a test message
    const message = await chatService.sendMessage(
      session._id!.toString(),
      'Hello, this is a test message!',
      'user',
      { test: true }
    );

    // Get session history
    const history = await chatService.getSessionHistory(session._id!.toString());

    // Return test results
    res.status(200).json({
      success: true,
      data: {
        session,
        message,
        history
      },
      message: 'Test completed successfully'
    });

  } catch (error) {
    console.error('Chat test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    });
  }
} 