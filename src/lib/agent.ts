import OpenAI from 'openai';
import { Message, CalendarFunctionName, CalendarFunctionParams, AgentMessage, CalendarResponse } from '../types/agent';
import { GoogleCalendarService } from '../services/calendar';

const CALENDAR_FUNCTIONS = [
  {
    name: 'createEvent',
    description: 'Create a new calendar event',
    parameters: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Title of the event' },
        startDateTime: { type: 'string', format: 'date-time', description: 'Start time of the event (ISO format)' },
        endDateTime: { type: 'string', format: 'date-time', description: 'End time of the event (ISO format)' },
        description: { type: 'string', description: 'Description of the event' },
        attendees: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'List of attendee email addresses'
        },
        location: { type: 'string', description: 'Location of the event' }
      },
      required: ['summary', 'startDateTime', 'endDateTime']
    }
  },
  {
    name: 'updateEvent',
    description: 'Update an existing calendar event',
    parameters: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'ID of the event to update' },
        summary: { type: 'string', description: 'New title of the event' },
        startDateTime: { type: 'string', format: 'date-time', description: 'New start time' },
        endDateTime: { type: 'string', format: 'date-time', description: 'New end time' },
        description: { type: 'string', description: 'New description' },
        attendees: { type: 'array', items: { type: 'string' } },
        location: { type: 'string' }
      },
      required: ['eventId']
    }
  },
  {
    name: 'deleteEvent',
    description: 'Delete a calendar event',
    parameters: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'ID of the event to delete' }
      },
      required: ['eventId']
    }
  },
  {
    name: 'checkAvailability',
    description: 'Check availability for a time slot',
    parameters: {
      type: 'object',
      properties: {
        timeMin: { type: 'string', format: 'date-time', description: 'Start of time range' },
        timeMax: { type: 'string', format: 'date-time', description: 'End of time range' }
      },
      required: ['timeMin', 'timeMax']
    }
  },
  {
    name: 'listEvents',
    description: 'List calendar events in a time range',
    parameters: {
      type: 'object',
      properties: {
        timeMin: { type: 'string', format: 'date-time', description: 'Start of time range' },
        timeMax: { type: 'string', format: 'date-time', description: 'End of time range' }
      },
      required: ['timeMin', 'timeMax']
    }
  },
  {
    name: 'createMultipleEvents',
    description: 'Create multiple calendar events in a single batch operation',
    parameters: {
      type: 'object',
      properties: {
        events: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              summary: { type: 'string', description: 'Title of the event' },
              startDateTime: { type: 'string', format: 'date-time', description: 'Start time of the event (ISO format)' },
              endDateTime: { type: 'string', format: 'date-time', description: 'End time of the event (ISO format)' },
              description: { type: 'string', description: 'Description of the event' },
              attendees: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'List of attendee email addresses'
              },
              location: { type: 'string', description: 'Location of the event' }
            },
            required: ['summary', 'startDateTime', 'endDateTime']
          }
        },
        options: {
          type: 'object',
          properties: {
            stopOnError: { 
              type: 'boolean',
              description: 'Whether to stop processing if an error occurs'
            },
            validateOnly: {
              type: 'boolean',
              description: 'Only validate the events without creating them'
            }
          }
        }
      },
      required: ['events']
    }
  }
];

class CalendarAgent {
  private memory: Message[];
  private openai: OpenAI;
  private calendarService: GoogleCalendarService | null = null;
  private readonly MODEL = "gpt-4-0125-preview";
  private userTimezone: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.memory = [];
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private getCurrentDateContext(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return `Current date and time: ${dateStr} ${timeStr} (${this.userTimezone})`;
  }

  private setCalendarService(accessToken: string) {
    this.calendarService = new GoogleCalendarService(accessToken);
  }

  private async handleFunctionCall(
    name: CalendarFunctionName, 
    args: any
  ): Promise<CalendarResponse> {
    if (!this.calendarService) {
      return {
        success: false,
        error: 'Calendar service not initialized',
        message: 'Please ensure you are authenticated'
      };
    }

    try {
      switch (name) {
        case 'createEvent':
          return await this.calendarService.createEvent(args);
        
        case 'updateEvent':
          return await this.calendarService.updateEvent(args.eventId, args);
        
        case 'deleteEvent':
          return await this.calendarService.deleteEvent(args.eventId);
        
        case 'checkAvailability':
          return await this.calendarService.checkAvailability(args.timeMin, args.timeMax);
        
        case 'listEvents':
          return await this.calendarService.getEvents(args.timeMin, args.timeMax);

        case 'createMultipleEvents':
          return await this.calendarService.createMultipleEvents(args);
        
        default:
          return {
            success: false,
            error: 'Unsupported function',
            message: `Function ${name} is not supported`
          };
      }
    } catch (error) {
      console.error('Error executing function:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to execute calendar operation'
      };
    }
  }

  async processMessage(userInput: string, accessToken: string): Promise<string> {
    if (!userInput?.trim()) {
      return "Please provide a valid message.";
    }
    if (userInput.length > 1000) {
      return "Message too long. Please keep it under 1000 characters.";
    }

    // Initialize calendar service with access token
    this.setCalendarService(accessToken);

    const message: Message = {
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    this.memory.push(message);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.MODEL,
        messages: [
          {
            role: "system",
            content: `You are a helpful calendar assistant. ${this.getCurrentDateContext()}

            Help users manage their calendar by:
            1. Creating single or multiple events
            2. Updating and deleting events
            3. Checking availability
            4. Listing events
            
            When handling dates and times:
            - Use the current date/time as reference for relative times (e.g., "tomorrow", "next week")
            - Always consider the user's timezone: ${this.userTimezone}
            - For ambiguous times, ask for clarification
            - Default meeting duration to 1 hour unless specified
            
            For multiple events:
            - Use createMultipleEvents function when user wants to create several events at once
            - Batch process related events together
            - Validate all event times before creating
            - Provide a summary of successes and failures
            
            For calendar operations, use the appropriate function.
            For general questions or unclear requests, ask for clarification.
            Keep responses concise and professional.`
          },
          ...this.memory.map(msg => ({
            role: msg.role,
            content: msg.content,
            name: msg.name
          }))
        ],
        functions: CALENDAR_FUNCTIONS,
        temperature: 0.7
      });

      const assistantMessage = completion.choices[0]?.message;
      
      if (!assistantMessage) {
        throw new Error('No response from assistant');
      }

      let response: string;

      if (assistantMessage.function_call) {
        // Handle function call
        const { name, arguments: args } = assistantMessage.function_call;
        const result = await this.handleFunctionCall(
          name as CalendarFunctionName,
          JSON.parse(args)
        );

        // Add function result to memory
        this.memory.push({
          role: 'function',
          name,
          content: JSON.stringify(result),
          timestamp: new Date()
        });

        // Get final response
        const finalCompletion = await this.openai.chat.completions.create({
          model: this.MODEL,
          messages: [
            ...this.memory.map(msg => ({
              role: msg.role,
              content: msg.content,
              name: msg.name
            }))
          ],
          temperature: 0.7
        });

        response = finalCompletion.choices[0]?.message?.content || "I couldn't process the calendar operation.";
      } else {
        response = assistantMessage.content || "I couldn't generate a response.";
      }

      this.memory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      return response;

    } catch (error) {
      console.error('Error processing message:', error);
      return "I encountered an error while processing your request. Please try again.";
    }
  }
}

export default CalendarAgent; 