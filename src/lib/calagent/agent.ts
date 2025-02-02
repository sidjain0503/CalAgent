import OpenAI from "openai";
import {
  Message,
  CalendarFunctionName,
  CalendarFunctionParams,
  AgentMessage,
  CalendarResponse,
} from "../../types/agent";
import { GoogleCalendarService } from "../../services/calendar";
import { Message as MessageModel } from "../db/models/message";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { MessageRepository } from "../db/repositories/messageRepo";
import { CALENDAR_FUNCTIONS } from "./constant";

export class CalendarAgent {
  private calendarService: GoogleCalendarService | null = null;
  private memory: MessageModel[] = [];
  private openai: OpenAI;
  private messageRepo: MessageRepository;
  private readonly MODEL = "gpt-4-0125-preview";
  private userTimezone: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    this.memory = [];
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.messageRepo = new MessageRepository();
    this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private getCurrentDateContext(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    return `Current date and time: ${dateStr} ${timeStr} (${this.userTimezone})`;
  }

  private setCalendarService(accessToken: string) {
    if (!this.calendarService) {
      this.calendarService = new GoogleCalendarService(accessToken);
    }
  }

  private async handleFunctionCall(
    name: CalendarFunctionName,
    args: any
  ): Promise<CalendarResponse> {
    if (!this.calendarService) {
      return {
        success: false,
        error: "Calendar service not initialized",
        message:
          "Please ensure you are authenticated to perform Calendar operations",
      };
    }

    try {
      let result;
      switch (name) {
        case "createEvent":
          result = await this.calendarService.createEvent(args);
          return {
            success: true,
            data: result,
            message: "Event created successfully",
          };

        case "updateEvent":
          result = await this.calendarService.updateEvent(args.eventId, args);
          return {
            success: true,
            data: result,
            message: "Event updated successfully",
          };

        case "deleteEvent":
          await this.calendarService.deleteEvent(args.eventId);
          return {
            success: true,
            message: "Event deleted successfully",
          };

        case "checkAvailability":
          result = await this.calendarService.checkAvailability(
            args.timeMin,
            args.timeMax
          );
          return {
            success: true,
            data: result,
            message: "Availability checked successfully",
          };

        case "listEvents":
          result = await this.calendarService.getEvents(
            args.timeMin,
            args.timeMax
          );
          return {
            success: true,
            data: result,
            message: "Events retrieved successfully",
          };

        default:
          return {
            success: false,
            error: "Unsupported function",
            message: `Function ${name} is not supported`,
          };
      }
    } catch (error) {
      console.error("Error executing function:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to execute calendar operation",
      };
    }
  }

  public async processMessage(
    message: string,
    accessToken: string,
    sessionId?: string
  ): Promise<string> {
    if (!message?.trim()) {
      return "Please provide a valid message.";
    }

    try {
      return await this.processWithAgent(message, accessToken, sessionId);
    } catch (error) {
      console.error("Error processing message:", error);
      return "I encountered an error while processing your request. Please try again.";
    }
  }

  private extractCalendarOperation(response: string): string | null {
    // Look for calendar operation patterns in the response
    const patterns = [
      /create.*event/i,
      /schedule.*meeting/i,
      /update.*event/i,
      /delete.*event/i,
      /check.*availability/i,
    ];

    for (const pattern of patterns) {
      if (pattern.test(response)) {
        return pattern.source;
      }
    }

    return null;
  }

  private async loadConversationHistory(sessionId: string): Promise<void> {
    try {
      // Load messages from the database
      const messages = await this.messageRepo.findBySessionId(sessionId);

      // Sort messages by timestamp to ensure correct order
      this.memory = messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    } catch (error) {
      console.error("Error loading conversation history:", error);
      // Don't throw - we can continue with empty memory if loading fails
      this.memory = [];
    }
  }

  private async processWithAgent(
    message: string,
    accessToken: string,
    sessionId: string
  ): Promise<string> {
    if (!message?.trim()) {
      return "Please provide a valid message.";
    }
    if (message.length > 1000) {
      return "Message too long. Please keep it under 1000 characters.";
    }

    // Load conversation history before processing
    await this.loadConversationHistory(sessionId);

    // Initialize calendar service with access token
    this.setCalendarService(accessToken);

    const messageObj = {
      role: "user" as const,
      content: message,
      timestamp: new Date(),
      sessionId,
    };

    this.memory.push(messageObj);

    try {
      const systemMessage: ChatCompletionMessageParam = {
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
        
        Important:
        - Maintain conversation context and refer to previous messages
        - If user provides partial information, use context from previous messages
        - Ask for clarification only when necessary information is missing from both current and previous messages
        
        For calendar operations, use the appropriate function.
        For general questions or unclear requests, ask for clarification.
        Keep responses concise and professional.`,
      };

      const messages: ChatCompletionMessageParam[] = [
        systemMessage,
        ...this.memory.map((msg): ChatCompletionMessageParam => {
          if (msg.role === "function") {
            return {
              role: msg.role,
              content: msg.content,
              name: msg.name,
            };
          }
          return {
            role: msg.role,
            content: msg.content,
          };
        }),
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.MODEL,
        messages,
        functions: CALENDAR_FUNCTIONS,
        temperature: 0.7,
      });

      const assistantMessage = completion.choices[0]?.message;

      if (!assistantMessage) {
        throw new Error("No response from assistant");
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
          role: "function" as const,
          name,
          content: JSON.stringify(result),
          timestamp: new Date(),
          sessionId,
        });

        // Get final response
        const finalMessages: ChatCompletionMessageParam[] = [
          systemMessage,
          ...this.memory.map((msg): ChatCompletionMessageParam => {
            if (msg.role === "function") {
              return {
                role: msg.role,
                content: msg.content,
                name: msg.name,
              };
            }
            return {
              role: msg.role,
              content: msg.content,
            };
          }),
        ];

        const finalCompletion = await this.openai.chat.completions.create({
          model: this.MODEL,
          messages: finalMessages,
          temperature: 0.7,
        });

        response =
          finalCompletion.choices[0]?.message?.content ||
          "I couldn't process the calendar operation.";
      } else {
        response =
          assistantMessage.content || "I couldn't generate a response.";
      }

      this.memory.push({
        role: "assistant" as const,
        content: response,
        timestamp: new Date(),
        sessionId,
      });

      return response;
    } catch (error) {
      console.error("Error in agent:", error);
      throw error;
    }
  }
}

export default CalendarAgent;
