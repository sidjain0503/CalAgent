import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { GoogleCalendarService } from '../../../../lib/calendar/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  const calendarService = new GoogleCalendarService(session.accessToken as string);

  try {
    switch (req.method) {
      case 'PUT':
        const updatedEvent = await calendarService.updateEvent(id, req.body);
        return res.status(200).json(updatedEvent);

      case 'DELETE':
        await calendarService.deleteEvent(id);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Calendar API Error:', error);
    return res.status(500).json({ error: 'Failed to process calendar request' });
  }
} 