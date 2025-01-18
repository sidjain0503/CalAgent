import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useQuery } from '@tanstack/react-query';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
}

interface CalendarViewProps {
  onEventDrop?: (event: CalendarEvent, start: Date, end: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const REFETCH_INTERVAL = 10000; // Refetch every 10 seconds

export default function CalendarView({ onEventDrop }: CalendarViewProps) {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Function to fetch events
  const fetchEvents = async () => {
    const timeMin = new Date(currentDate);
    timeMin.setHours(0, 0, 0, 0);
    
    const timeMax = new Date(currentDate);
    if (view === 'week') {
      timeMax.setDate(timeMax.getDate() + 7);
    } else {
      timeMax.setDate(timeMax.getDate() + 1);
    }
    timeMax.setHours(23, 59, 59, 999);

    const response = await fetch(
      `/api/calendar/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const data = await response.json();
    return data.events;
  };

  // Use React Query to manage events data
  const { 
    data: events = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<CalendarEvent[]>({
    queryKey: ['events', view, currentDate.toISOString()],
    queryFn: fetchEvents,
    refetchInterval: REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  const formatHour = (hour: number) => {
    return `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`;
  };

  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    return {
      top: `${(startMinutes * 80) / 60}px`,
      height: `${(durationMinutes * 80) / 60}px`,
      left: '8px',
      right: '8px',
    };
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex gap-2">
            <button 
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded ${
                view === 'day' ? 'bg-teal-600' : 'bg-gray-700'
              }`}
            >
              Day
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded ${
                view === 'week' ? 'bg-teal-600' : 'bg-gray-700'
              }`}
            >
              Week
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}
              className="p-1 hover:bg-gray-700 rounded text-white"
            >
              ←
            </button>
            <span className="font-semibold text-white">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}
              className="p-1 hover:bg-gray-700 rounded text-white"
            >
              →
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400">Loading events...</div>
          </div>
        )}

        {/* Error State */}
        {error instanceof Error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-red-400">{error.message}</div>
          </div>
        )}

        {/* Time Grid */}
        {!isLoading && !error && (
          <div className="flex-1 overflow-y-auto">
            <div className="relative min-h-full">
              {/* Time Labels */}
              <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-gray-700 bg-gray-900/50">
                {HOURS.map(hour => (
                  <div 
                    key={hour}
                    className="h-20 border-b border-gray-700 text-xs text-gray-400 text-right pr-2 pt-1"
                  >
                    {formatHour(hour)}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="ml-16">
                {HOURS.map(hour => (
                  <div 
                    key={hour}
                    className="h-20 border-b border-gray-700 relative group"
                  >
                    <div className="absolute inset-0 group-hover:bg-gray-800/30 transition-colors duration-150" />
                  </div>
                ))}

                {/* Current Time Indicator */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-teal-500 z-10"
                  style={{
                    top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * (80 / 60)}px`
                  }}
                >
                  <div className="absolute -left-3 -top-1.5 w-3 h-3 rounded-full bg-teal-500" />
                </div>

                {/* Events */}
                {events.map(event => (
                  <div
                    key={event.id}
                    className="absolute bg-teal-600/80 rounded p-2 text-sm text-white cursor-pointer hover:bg-teal-600 transition-colors"
                    style={getEventStyle(event)}
                  >
                    <div className="font-medium">{event.summary}</div>
                    {event.description && (
                      <div className="text-xs text-white/80 truncate">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
} 