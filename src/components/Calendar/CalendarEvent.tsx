import { useDrag } from 'react-dnd';
import { CalendarEvent } from './CalendarView';

interface EventItemProps {
  event: CalendarEvent;
  containerHeight: number;
}

export default function EventItem({ event, containerHeight }: EventItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EVENT',
    item: { id: event.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Calculate position and height
  const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
  const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
  const duration = endMinutes - startMinutes;
  
  const top = (startMinutes * containerHeight) / (24 * 60);
  const height = (duration * containerHeight) / (24 * 60);

  return (
    <div
      ref={drag}
      className={`absolute left-1 right-1 rounded-lg p-2 text-sm ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } bg-teal-600 hover:bg-teal-500 cursor-move transition-colors duration-150`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
    >
      <div className="font-semibold truncate">{event.title}</div>
      <div className="text-xs text-teal-100 truncate">
        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
        {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      {event.description && (
        <div className="text-xs text-teal-100 truncate mt-1">
          {event.description}
        </div>
      )}
    </div>
  );
} 