import { useEffect, useState } from 'react';
import { Message } from '../../types/agent';

interface LeftPanelProps {
  messages: Message[];
}

export default function LeftPanel({ messages }: LeftPanelProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col text-gray-100">
      {/* Clock Section */}
      <div className="p-4 bg-gray-800/30 rounded-lg mb-4">
        <div className="text-2xl font-bold">
          {currentTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </div>
        <div className="text-sm text-gray-400">
          {currentTime.toLocaleDateString([], { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

     
    </div>
  );
} 