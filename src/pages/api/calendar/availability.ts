import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { GoogleCalendarService } from '../../../lib/calendar/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { timeMin, timeMax } = req.query;
  if (!timeMin || !timeMax) {
    return res.status(400).json({ error: 'timeMin and timeMax are required' });
  }

  const calendarService = new GoogleCalendarService(session.accessToken as string);

  try {
    const isAvailable = await calendarService.getAvailability(
      new Date(timeMin as string),
      new Date(timeMax as string)
    );
    return res.status(200).json({ isAvailable });
  } catch (error) {
    console.error('Calendar API Error:', error);
    return res.status(500).json({ error: 'Failed to check availability' });
  }
} 