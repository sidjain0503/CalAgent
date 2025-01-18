import { google } from 'googleapis';
import { 
  CalendarEventInput, 
  CalendarResponse, 
  BatchEventInput,
  BatchResponse,
  BatchEventResult
} from '../types/agent';

export class GoogleCalendarService {
  private calendar;
  private readonly BATCH_CHUNK_SIZE = 10; // Process 10 events at a time

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async createEvent(event: CalendarEventInput): Promise<CalendarResponse> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.startDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.endDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          attendees: event.attendees?.map(email => ({ email })),
          location: event.location,
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Event created successfully',
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create event',
      };
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEventInput>): Promise<CalendarResponse> {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: event.startDateTime ? {
            dateTime: event.startDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          } : undefined,
          end: event.endDateTime ? {
            dateTime: event.endDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          } : undefined,
          attendees: event.attendees?.map(email => ({ email })),
          location: event.location,
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Event updated successfully',
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update event',
      };
    }
  }

  async deleteEvent(eventId: string): Promise<CalendarResponse> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      return {
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to delete event',
      };
    }
  }

  async checkAvailability(timeMin: string, timeMax: string): Promise<CalendarResponse> {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          items: [{ id: 'primary' }],
        },
      });

      const busySlots = response.data.calendars?.primary?.busy || [];
      const isAvailable = busySlots.length === 0;

      return {
        success: true,
        data: { isAvailable, busySlots },
        message: isAvailable ? 'Time slot is available' : 'Time slot has conflicts',
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to check availability',
      };
    }
  }

  async getEvents(timeMin: string, timeMax: string): Promise<CalendarResponse> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return {
        success: true,
        data: response.data.items,
        message: 'Events retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch events',
      };
    }
  }

  async createMultipleEvents(batchInput: BatchEventInput): Promise<BatchResponse> {
    const { events, options = { stopOnError: false, validateOnly: false } } = batchInput;
    const results: BatchEventResult[] = [];
    let successful = 0;
    let failed = 0;

    try {
      // Process events in chunks to avoid rate limits
      for (let i = 0; i < events.length; i += this.BATCH_CHUNK_SIZE) {
        const chunk = events.slice(i, i + this.BATCH_CHUNK_SIZE);
        const chunkPromises = chunk.map(async (event) => {
          try {
            if (options.validateOnly) {
              // Validate event data without creating
              this.validateEventInput(event);
              return {
                event,
                status: 'success' as const,
                message: 'Event validation successful'
              };
            }

            const response = await this.calendar.events.insert({
              calendarId: 'primary',
              requestBody: {
                summary: event.summary,
                description: event.description,
                start: {
                  dateTime: event.startDateTime,
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                end: {
                  dateTime: event.endDateTime,
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                attendees: event.attendees?.map(email => ({ email })),
                location: event.location,
              },
            });

            successful++;
            return {
              event,
              status: 'success' as const,
              eventId: response.data.id
            };
          } catch (error) {
            failed++;
            const result: BatchEventResult = {
              event,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            };

            if (options.stopOnError) {
              throw new Error(JSON.stringify(result));
            }

            return result;
          }
        });

        // Wait for all events in the chunk to be processed
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);

        // If stopOnError is true and we had any failures, stop processing
        if (options.stopOnError && failed > 0) {
          break;
        }
      }

      return {
        success: failed === 0,
        results,
        summary: {
          total: events.length,
          successful,
          failed
        },
        message: this.formatBatchSummary(successful, failed, options.validateOnly)
      };

    } catch (error) {
      console.error('Error in batch operation:', error);
      return {
        success: false,
        results,
        summary: {
          total: events.length,
          successful,
          failed: events.length - successful
        },
        message: `Batch operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private validateEventInput(event: CalendarEventInput): void {
    if (!event.summary) {
      throw new Error('Event summary is required');
    }
    if (!event.startDateTime) {
      throw new Error('Start time is required');
    }
    if (!event.endDateTime) {
      throw new Error('End time is required');
    }

    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);

    if (isNaN(start.getTime())) {
      throw new Error('Invalid start time format');
    }
    if (isNaN(end.getTime())) {
      throw new Error('Invalid end time format');
    }
    if (end <= start) {
      throw new Error('End time must be after start time');
    }
  }

  private formatBatchSummary(successful: number, failed: number, wasValidation: boolean): string {
    const operation = wasValidation ? 'validated' : 'created';
    if (failed === 0) {
      return `Successfully ${operation} all ${successful} events.`;
    }
    return `${operation} ${successful} events successfully, ${failed} failed.`;
  }
} 