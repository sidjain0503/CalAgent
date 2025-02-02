import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatInterface from '../components/ChatInterface';
import ResizableLayout from '../components/Layout/ResizableLayout';
import LeftPanel from '../components/LeftPanel/LeftPanel';
import CalendarView from '../components/Calendar/CalendarView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export default function AppPage() {
  const { data: session, status } = useSession();
  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
  }, [status, session]);

  // Fetch or create initial session
  useEffect(() => {
    const initializeSession = async () => {
      if (session?.user?.id) {
        try {
          console.log('Initializing session for user:', session.user.id);
          // First try to fetch existing sessions
          const response = await fetch('/api/chat/sessions');
          console.log('Fetch sessions response:', response.status);
          const data = await response.json();
          console.log('Sessions data:', data);
          
          if (data.sessions && data.sessions.length > 0) {
            // If there are existing sessions, use the most recent one
            console.log('Using existing session:', data.sessions[0]._id);
            setCurrentSessionId(data.sessions[0]._id.toString());
          } else {
            console.log('No existing sessions, creating new one');
            // If no sessions exist, create a new one
            const createResponse = await fetch('/api/chat/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            console.log('Create session response:', createResponse.status);
            const newSession = await createResponse.json();
            console.log('New session created:', newSession);
            setCurrentSessionId(newSession._id.toString());
          }
        } catch (error) {
          console.error('Error initializing session:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('No user session yet');
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      initializeSession();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-2xl text-white font-medium mb-8">Calendar Agent</h1>
        <button
          onClick={() => signIn('google')}
          className="px-6 py-3 bg-white text-gray-900 rounded-lg font-primary 
                   hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ResizableLayout
        leftPanel={
          <LeftPanel
            onSessionSelect={setCurrentSessionId}
            currentSessionId={currentSessionId}
          />
        }
        chatPanel={
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h1 className="text-xl text-white font-medium pl-5">Calendar Agent</h1>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-white border border-white/20 rounded-lg 
                         hover:bg-white/10 transition-colors"
              >
                Sign out
              </button>
            </div>
            <ChatInterface
              sessionId={currentSessionId}
              onNewSession={() => setCurrentSessionId(undefined)}
            />
          </div>
        }
        calendarPanel={
          <CalendarView 
            onEventDrop={(event, start, end) => {
              console.log('Event dropped:', { event, start, end });
              queryClient.invalidateQueries({ queryKey: ['events'] });
            }}
          />
        }
      />
    </QueryClientProvider>
  );
} 