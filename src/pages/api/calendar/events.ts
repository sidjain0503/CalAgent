import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { GoogleCalendarService } from '../../../lib/calendar/google';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    
    console.log('Session:', {
      exists: !!session,
      hasAccessToken: !!session?.accessToken,
    });
    
    if (!session?.accessToken) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        details: 'No access token found in session'
      });
    }

    const { timeMin, timeMax } = req.query;
    console.log('Time range:', { timeMin, timeMax });

    if (!timeMin || !timeMax) {
      return res.status(400).json({ error: 'Missing timeMin or timeMax parameters' });
    }

    const calendarService = new GoogleCalendarService(session.accessToken);
    
    try {
      const events = await calendarService.getEvents(
        new Date(timeMin as string),
        new Date(timeMax as string)
      );

      console.log(`Successfully fetched ${events.length} events`);
      return res.status(200).json({ events });
    } catch (calendarError) {
      console.error('Calendar service error:', calendarError);
      return res.status(500).json({ 
        error: 'Calendar service error',
        details: calendarError instanceof Error ? calendarError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Calendar API Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({ 
      error: 'Failed to fetch calendar events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 