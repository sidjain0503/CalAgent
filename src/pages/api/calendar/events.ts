import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { GoogleCalendarService } from '../../../lib/calendar/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const calendarService = new GoogleCalendarService(session.accessToken as string);

  try {
    switch (req.method) {
      case 'GET':
        const { timeMin, timeMax } = req.query;
        const events = await calendarService.getEvents(
          new Date(timeMin as string),
          new Date(timeMax as string)
        );
        return res.status(200).json(events);

      case 'POST':
        const newEvent = await calendarService.createEvent(req.body);
        return res.status(201).json(newEvent);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Calendar API Error:', error);
    return res.status(500).json({ error: 'Failed to process calendar request' });
  }
} 