# AI Calendar Agent

## Overview
An intelligent calendar management system powered by OpenAI's GPT models. This agent can understand natural language inputs to help manage your calendar, schedule meetings, and handle various calendar-related tasks.

## Features
- 🤖 Natural language processing for calendar management
- 📅 Intelligent scheduling assistance
- 💬 Contextual conversation memory
- 🛠 Extensible tool system
- 🔄 Real-time response generation

## Tech Stack
- Next.js (Frontend & API routes)
- TypeScript
- OpenAI GPT-4
- TailwindCSS
- MongoDB (coming soon)

## Project Structure
```
calendar-agent/
├── src/
│   ├── lib/
│   │   ├── agent.ts        # Core agent implementation
│   │   └── memory.ts       # Memory management system
│   ├── pages/
│   │   ├── api/
│   │   │   └── chat.ts     # Chat API endpoint
│   │   ├── _app.tsx        # Next.js app configuration
│   │   └── test.tsx        # Test interface
│   ├── styles/
│   │   └── globals.css     # Global styles
│   └── types/
│       └── agent.ts        # TypeScript definitions
├── .env                    # Environment variables
├── package.json           
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- OpenAI API key

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/calendar-agent.git
cd calendar-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000/test](http://localhost:3000/test) to view the test interface

## Usage

### Basic Interaction
```typescript
const agent = new CalendarAgent(process.env.OPENAI_API_KEY);
const response = await agent.processMessage("Schedule a meeting tomorrow at 2 PM");
```

### Example Commands
- "Schedule a meeting with John tomorrow at 2 PM"
- "What's my next meeting?"
- "Move my 3 PM meeting to 4 PM"
- "Show me my calendar for next week"

## Development Roadmap

### Phase 1 (Current)
- ✅ Basic agent implementation
- ✅ Conversation handling
- ✅ OpenAI integration
- ✅ Test interface

### Phase 2 (In Progress)
- 🔄 Google Calendar integration
- 🔄 Enhanced memory system
- 🔄 Tool framework implementation


## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments
- OpenAI for GPT models
- Next.js team for the amazing framework
- Contributors and supporters

## Contact
[@siddharthtwt](https://twitter.com/siddharthtwt)
