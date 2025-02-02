export //  function definitions
const CALENDAR_FUNCTIONS = [
  {
    name: "createEvent",
    description: "Create a new calendar event",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Title of the event" },
        startDateTime: {
          type: "string",
          format: "date-time",
          description: "Start time of the event (ISO format)",
        },
        endDateTime: {
          type: "string",
          format: "date-time",
          description: "End time of the event (ISO format)",
        },
        description: {
          type: "string",
          description: "Description of the event",
        },
        attendees: {
          type: "array",
          items: { type: "string" },
          description: "List of attendee email addresses",
        },
        location: { type: "string", description: "Location of the event" },
      },
      required: ["summary", "startDateTime", "endDateTime"],
    },
  },
  {
    name: "updateEvent",
    description: "Update an existing calendar event",
    parameters: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "ID of the event to update" },
        summary: { type: "string", description: "New title of the event" },
        startDateTime: {
          type: "string",
          format: "date-time",
          description: "New start time",
        },
        endDateTime: {
          type: "string",
          format: "date-time",
          description: "New end time",
        },
        description: { type: "string", description: "New description" },
        attendees: { type: "array", items: { type: "string" } },
        location: { type: "string" },
      },
      required: ["eventId"],
    },
  },
  {
    name: "deleteEvent",
    description: "Delete a calendar event",
    parameters: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "ID of the event to delete" },
      },
      required: ["eventId"],
    },
  },
  {
    name: "checkAvailability",
    description: "Check availability for a time slot",
    parameters: {
      type: "object",
      properties: {
        timeMin: {
          type: "string",
          format: "date-time",
          description: "Start of time range",
        },
        timeMax: {
          type: "string",
          format: "date-time",
          description: "End of time range",
        },
      },
      required: ["timeMin", "timeMax"],
    },
  },
  {
    name: "listEvents",
    description: "List calendar events in a time range",
    parameters: {
      type: "object",
      properties: {
        timeMin: {
          type: "string",
          format: "date-time",
          description: "Start of time range",
        },
        timeMax: {
          type: "string",
          format: "date-time",
          description: "End of time range",
        },
      },
      required: ["timeMin", "timeMax"],
    },
  },
  {
    name: "createMultipleEvents",
    description: "Create multiple calendar events in a single batch operation",
    parameters: {
      type: "object",
      properties: {
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              summary: { type: "string", description: "Title of the event" },
              startDateTime: {
                type: "string",
                format: "date-time",
                description: "Start time of the event (ISO format)",
              },
              endDateTime: {
                type: "string",
                format: "date-time",
                description: "End time of the event (ISO format)",
              },
              description: {
                type: "string",
                description: "Description of the event",
              },
              attendees: {
                type: "array",
                items: { type: "string" },
                description: "List of attendee email addresses",
              },
              location: {
                type: "string",
                description: "Location of the event",
              },
            },
            required: ["summary", "startDateTime", "endDateTime"],
          },
        },
        options: {
          type: "object",
          properties: {
            stopOnError: {
              type: "boolean",
              description: "Whether to stop processing if an error occurs",
            },
            validateOnly: {
              type: "boolean",
              description: "Only validate the events without creating them",
            },
          },
        },
      },
      required: ["events"],
    },
  },
];
