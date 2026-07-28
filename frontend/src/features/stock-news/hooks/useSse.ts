import { useState, useEffect, useRef } from 'react';

export interface StreamEvent {
  type: 'CALENDAR' | 'REALTIME_IMPACT';
  title: string;
  date: string;
  score?: number;
  briefing: string[];
}

/**
 * 실시간 종목 뉴스/일정 SSE 스트리밍 데이터를 구독하고 관리하는 커스텀 훅
 */
export const useSse = (ticker?: string) => {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [connected, setConnected] = useState<boolean>(false);

  // 연결 제어 및 타이머 관리를 위한 Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef<number>(0);

  useEffect(() => {
    if (!ticker) {
      setEvents([]);
      setConnected(false);
      return;
    }

    setEvents([]);
    setConnected(false);

    // 실시간 연결을 수행하는 비동기/재귀 호출 함수
    const connect = () => {
      // 기존 연결이 있다면 안전하게 정리 후 새로 개설
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`/api/stocks/${ticker.toUpperCase()}/value-chain/stream`);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('connect', () => {
        setConnected(true);
        retryCountRef.current = 0; // 연결 성공 시 재시도 횟수 초기화
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
        eventSource.close(); // 소켓 리소스 정리

        // 지수 백오프 대기시간 계산 (1s, 2s, 4s, 8s, 최대 16s)
        const delay = Math.min(16000, 1000 * Math.pow(2, retryCountRef.current));
        console.warn(`📡 SSE 연결 오류 발생. ${delay / 1000}초 후 재연결 시도...`);

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          retryCountRef.current += 1;
          connect(); // 재연결 시도
        }, delay);
      };
    };

    connect();

    // 언마운트 시 클린업
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [ticker]);

  return { events, connected };
};

