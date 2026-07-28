import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useParams } from '@tanstack/react-router'

export interface StreamEvent {
  type: 'CALENDAR' | 'REALTIME_IMPACT';
  title: string;
  date: string;
  score?: number;
  briefing: string[];
}

export interface NewsEventContextType {
  events: StreamEvent[];
  connected: boolean;
  activeDate?: string;
  setActiveDate?: (date: string) => void;
  isChartVisible: boolean;
  setIsChartVisible: (visible: boolean) => void;
}

export const NewsEventContext = createContext<NewsEventContextType>({ 
  events: [],
  connected: false,
  isChartVisible: true,
  setIsChartVisible: () => {}
});

export const useNewsEvent = () => useContext(NewsEventContext);

export const NewsEventProvider = ({ children }: { children: ReactNode }) => {
  const { ticker } = useParams({ strict: false }) as { ticker?: string };
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [activeDate, setActiveDate] = useState<string | undefined>(undefined);
  const [isChartVisible, setIsChartVisible] = useState(true);

  // SSE 스트리밍 데이터 수집
  useEffect(() => {
    if (!ticker) {
      setEvents([]);
      setConnected(false);
      return;
    }

    setEvents([]);
    setConnected(false);

    const eventSource = new EventSource(`/api/stocks/${ticker.toUpperCase()}/value-chain/stream`);

    eventSource.addEventListener('connect', () => {
      setConnected(true);
    });

    eventSource.addEventListener('calendar-event', (e) => {
      try {
        const newEvent = JSON.parse(e.data) as StreamEvent;
        setEvents((prev) => {
          if (prev.some((item) => item.title === newEvent.title && item.type === 'CALENDAR')) {
            return prev;
          }
          return [...prev, newEvent];
        });
      } catch (err) {
        console.error('사전 일정 파싱 오류', err);
      }
    });

    eventSource.addEventListener('realtime-impact', (e) => {
      try {
        const newEvent = JSON.parse(e.data) as StreamEvent;
        setEvents((prev) => {
          if (prev.some((item) => item.title === newEvent.title && item.type === 'REALTIME_IMPACT')) {
            return prev;
          }
          return [newEvent, ...prev];
        });
      } catch (err) {
        console.error('실시간 분석 파싱 오류', err);
      }
    });

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [ticker]);

  return (
    <NewsEventContext.Provider 
      value={{ 
        events, 
        connected,
        activeDate, 
        setActiveDate, 
        isChartVisible, 
        setIsChartVisible 
      }}
    >
      {children}
    </NewsEventContext.Provider>
  );
};
