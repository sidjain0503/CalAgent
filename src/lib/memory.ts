import { Message } from '../types/agent';

class Memory {
  private shortTerm: Message[];
  private longTerm: Map<string, any>;

  constructor() {
    this.shortTerm = [];
    this.longTerm = new Map();
  }

  add(message: Message): void {
    this.shortTerm.push(message);
  }

  getRecentContext(limit: number = 5): Message[] {
    return this.shortTerm.slice(-limit);
  }
}

export default Memory; 