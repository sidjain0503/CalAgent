import { google } from "googleapis";
import { CalendarEvent, CalendarService } from "./types";
import { GOOGLE_CALENDAR_CONFIG } from "../../config/calendar";

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
    this.calendar = google.calendar({ version: "v3", auth: this.auth });
  }

  async getEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items as CalendarEvent[];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw new Error("Failed to fetch calendar events");
    }
  }

  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    console.log("=== Starting createEvent ===");
    try {
      console.log("Creating event:", {
        summary: event.summary,
        start: event.start,
        end: event.end,
      });

      const response = await this.calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.start.dateTime,
            timeZone: event.start.timeZone || "UTC",
          },
          end: {
            dateTime: event.end.dateTime,
            timeZone: event.end.timeZone || "UTC",
          },
          attendees: event.attendees,
        },
      });

      console.log("=== Finished createEvent ===");
      return response.data as CalendarEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create calendar event");
    }
  }

  async updateEvent(
    eventId: string,
    event: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.patch({
        calendarId: "primary",
        eventId: eventId,
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
          attendees: event.attendees,
        },
      });

      return response.data as CalendarEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error("Failed to update calendar event");
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
      });

    } catch (error) {
      console.error("Error deleting event:", error);
      throw new Error("Failed to delete calendar event");
    }
  }

  async getAvailability(timeMin: Date, timeMax: Date): Promise<boolean> {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: "primary" }],
        },
      });

      const busySlots = response.data.calendars?.primary?.busy || [];
      return busySlots.length === 0;
    } catch (error) {
      console.error("Error checking availability:", error);
      throw new Error("Failed to check calendar availability");
    }
  }
}
