import { ChatCompletionMessageParam } from 'openai/resources/chat';

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  name?: string;
  timestamp: Date;
};

export type CalendarEventInput = {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendees?: string[];
  location?: string;
};

export type BatchEventOptions = {
  stopOnError?: boolean;
  validateOnly?: boolean;
};

export type BatchEventInput = {
  events: CalendarEventInput[];
  options?: BatchEventOptions;
};

export type BatchEventResult = {
  event: CalendarEventInput;
  status: 'success' | 'failed';
  error?: string;
  eventId?: string;
};

export type BatchResponse = {
  success: boolean;
  results: BatchEventResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  message: string;
};

export type CalendarFunctionName = 
  | 'createEvent'
  | 'updateEvent'
  | 'deleteEvent'
  | 'checkAvailability'
  | 'listEvents'
  | 'createMultipleEvents';

export type CalendarFunctionParams = {
  createEvent: CalendarEventInput;
  updateEvent: CalendarEventInput & { eventId: string };
  deleteEvent: { eventId: string };
  checkAvailability: { timeMin: string; timeMax: string };
  listEvents: { timeMin: string; timeMax: string };
  createMultipleEvents: BatchEventInput;
};

export type CalendarResponse = {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
};

export type AgentMessage = ChatCompletionMessageParam & {
  timestamp?: Date;
}; 