import { CalendarAgent } from '../lib/calagent/agent';

describe('CalendarAgent', () => {
  let agent: CalendarAgent;

  beforeEach(() => {
    agent = new CalendarAgent(process.env.OPENAI_API_KEY!);
  });

  test('processes valid message', async () => {
    const response = await agent.processMessage('Hello');
    expect(response).toBeTruthy();
  });
}); 