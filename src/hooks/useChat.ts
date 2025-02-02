import { useState, useEffect, useRef } from 'react';
import { Message } from '../lib/db/models/message';
import { useSession } from 'next-auth/react';

export function useChat(sessionId?: string) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!sessionId) return;
    
    try {
      console.log('Fetching messages for session:', sessionId);
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch messages:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return;
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !session?.user?.id || !sessionId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(errorText || 'Failed to send message');
      }

      const data = await response.json();
      if (data.userMessage && data.assistantMessage) {
        setMessages(prev => [...prev, data.userMessage, data.assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (sessionId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return {
    messages,
    isLoading,
    sendMessage,
    messagesEndRef
  };
} 