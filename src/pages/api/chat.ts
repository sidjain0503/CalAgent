import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from "./auth/[...nextauth]";
import CalendarAgent from '../../lib/agent';
import { GoogleCalendarService } from '../../lib/calendar/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const calendarService = new GoogleCalendarService(session.accessToken);
    const agent = new CalendarAgent(process.env.OPENAI_API_KEY!);

    // Track if any calendar operations were performed
    let calendarOperation = null;

    // Intercept calendar operations
    const wrappedCalendarService = {
      ...calendarService,
      createEvent: async (event) => {
        const result = await calendarService.createEvent(event);
        calendarOperation = 'create';
        return result;
      },
      updateEvent: async (eventId, event) => {
        const result = await calendarService.updateEvent(eventId, event);
        calendarOperation = 'update';
        return result;
      },
      deleteEvent: async (eventId) => {
        await calendarService.deleteEvent(eventId);
        calendarOperation = 'delete';
      }
    };

    // Use wrapped service
    const wrappedAgent = new CalendarAgent(process.env.OPENAI_API_KEY!);
    const response = await wrappedAgent.processMessage(
      message,
      session.accessToken
    );

    return res.status(200).json({ 
      response,
      calendarOperation // Include in response if any operation was performed
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 