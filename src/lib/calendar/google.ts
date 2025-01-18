import { google } from 'googleapis';
import { CalendarEvent, CalendarService } from './types';
import { GOOGLE_CALENDAR_CONFIG } from '../../config/calendar';

export class GoogleCalendarService implements CalendarService {
  private auth;
  private calendar;

  constructor(accessToken: string) {
    this.auth = new google.auth.OAuth2(
      GOOGLE_CALENDAR_CONFIG.clientId,
      GOOGLE_CALENDAR_CONFIG.clientSecret,
      GOOGLE_CALENDAR_CONFIG.redirectUri
    );
    this.auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async getEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items as CalendarEvent[];
  }

  // Implement other methods...
} 