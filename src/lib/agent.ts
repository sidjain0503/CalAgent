import OpenAI from 'openai';
import { Message, Tool } from '../types/agent';

/**
 * CalendarAgent Class
 * 
 * Uses GPT-4 Turbo (gpt-4-0125-preview) - the latest model with:
 * - Improved instruction following
 * - More consistent output
 * - Better JSON mode support
 * - Reduced hallucinations
 * 
 * Architecture:
 * 1. Memory System: Maintains conversation history for context 
 * 2. Tool System: Uses OpenAI's function calling for calendar operations
 * 3. Response Format: Structured outputs for calendar operations
 */
class CalendarAgent {
  private memory: Message[];
  private tools: Map<string, Tool>;
  private openai: OpenAI;
  private readonly MODEL = "gpt-4o";  
  
  // Available functions for the model to call
  private readonly FUNCTIONS = [
    {
      name: "create_calendar_event",
      description: "Create a new calendar event",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of the event" },
          start_time: { type: "string", description: "Start time in ISO format" },
          end_time: { type: "string", description: "End time in ISO format" },
          description: { type: "string", description: "Event description" },
          attendees: { 
            type: "array", 
            items: { type: "string" },
            description: "List of attendee email addresses"
          }
        },
        required: ["title", "start_time"]
      }
    }
  ];

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.memory = [];
    this.tools = new Map();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private prepareMessages(userInput: string): Array<{ role: string; content: string }> {
    const systemPrompt = {
      role: "system",
      content: `You are an advanced AI calendar assistant powered by GPT-4.
      
      Your capabilities:
      - Parse natural language into structured calendar operations
      - Manage events and schedules
      - Provide clear, concise responses
      - Maintain conversation context
      
      Guidelines:
      1. Always confirm critical details before suggesting actions
      2. Use ISO format for dates and times
      3. Be explicit about timezone assumptions
      4. Ask for clarification when details are ambiguous
      
      Example interaction:
      User: "Schedule a meeting with John tomorrow at 2 PM"
      Assistant: "I'll help you schedule that. A few questions:
      1. How long should the meeting be?
      2. Do you have John's email address?
      3. Is this 2 PM in your local timezone?
      4. Would you like me to add any meeting description?"
      `
    };

    const recentMessages = this.memory.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    return [
      systemPrompt,
      ...recentMessages,
    ];
  }

  async processMessage(userInput: string): Promise<string> {
    if (!userInput?.trim()) {
      return "Please provide a valid message.";
    }
    if (userInput.length > 1000) {
      return "Message too long. Please keep it under 1000 characters.";
    }

    const message: Message = {
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    this.memory.push(message);
    
    const response = await this.generateResponse(userInput);
    
    this.memory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    });

    return response;
  }

  private async generateResponse(userInput: string): Promise<string> {
    try {
      const messages = this.prepareMessages(userInput);
      
      const completion = await this.openai.chat.completions.create({
        model: this.MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || "I couldn't generate a response";
      
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        console.error('OpenAI API Error:', error);
        return "I encountered an API error. Please try again in a moment.";
      }
      
      console.error('Unexpected error:', error);
      return "I encountered an unexpected error while processing your request.";
    }
  }
}

export default CalendarAgent; 