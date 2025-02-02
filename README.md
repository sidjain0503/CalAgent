# AI Calendar Agent

## Overview

An intelligent calendar management system powered by OpenAI's GPT models. This agent can understand natural language inputs to help manage your calendar, schedule meetings, and handle various calendar-related tasks through a modern, real-time interface.

## Demo

![AI Calendar Agent Demo](/public/Calagent.mp4)

## Features

- 🤖 Natural language processing for calendar management
- 📅 Intelligent scheduling assistance
- 💬 Contextual conversation memory
- 🔄 Real-time calendar updates
- 🎨 Modern, responsive UI
- 🔒 Secure Google Calendar integration

## Tech Stack

- Next.js 14
- TypeScript
- OpenAI GPT-4
- TailwindCSS
- React Query
- NextAuth.js
- Google Calendar API

## Project Structure

```
calendar-agent/
├── src/
│   ├── components/
│   │   ├── Calendar/       # Calendar components
│   │   ├── Layout/         # Layout components
│   │   └── LeftPanel/      # Left panel components
│   ├── lib/
│   │   ├── agent/         # Agent implementation
│   │   └── calendar/      # Calendar service
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── calendar/  # Calendar endpoints
│   │   │   └── chat.ts    # Chat endpoint
│   │   └── test.tsx       # Main application page
│   └── types/
│       └── agent.ts       # TypeScript definitions
├── .env                   # Environment variables
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- OpenAI API key
- Google Cloud Project with Calendar API enabled

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret
   OPENAI_API_KEY=your-openai-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000/test](http://localhost:3000/test)

## Features

### Calendar View

- Day/Week view support
- Real-time updates
- Event visualization
- Current time indicator
- Interactive time grid

### Chat Interface

- Natural language processing
- Context-aware responses
- Real-time message updates
- Markdown support
- Error handling

### Google Calendar Integration

- OAuth2 authentication
- Event management
- Real-time sync
- Availability checking

## Development Status

### Completed

- ✅ Basic agent implementation
- ✅ Google Calendar integration
- ✅ Real-time calendar updates
- ✅ Modern UI implementation
- ✅ Authentication system

### In Progress

- 🔄 Week view enhancement
- 🔄 Event creation UI
- 🔄 Drag-and-drop support
- 🔄 Mobile optimization

## Contributing

Contributions are welcome! Please read our contributing guidelines for details.

## License

This project is licensed under the MIT License.

## Contact

[@siddharthtwt](https://twitter.com/siddharthtwt)
