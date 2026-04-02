import { createContext, useEffect, useRef, useState, useCallback, useContext } from 'react';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

interface StompContextProps {
  isConnected: boolean;
  subscribe: (topic: string, callback: (payload: any) => void) => StompSubscription | null;
}

const StompContext = createContext<StompContextProps | null>(null);

// 
export const StompProvider = ({ url, children }: { url: string; children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // url이 정의되지 않았을 때의 에러 방지
        if (!url) {
          console.warn('⚠️ WebSocket URL is undefined. Waiting for configuration...');
          return;
        }

        // Spring Boot withSockJS()를 사용할 때 네이티브 웹소켓 접속을 위해 /websocket 접미사 추가
        const brokerURL = url.endsWith('/websocket') ? url : `${url}/websocket`;

        console.log('📡 STOMP Connection Attempt:', brokerURL);

        const client = new Client({
          brokerURL: brokerURL,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('✅ STOMP Connected');
            setIsConnected(true);
          },
          onDisconnect: () => {
            console.log('🔌 STOMP Disconnected');
            setIsConnected(false);
          },
          onStompError: (frame) => {
            console.error('❌ STOMP Error:', frame.headers['message']);
          },
          onWebSocketError: (event) => {
            console.error('❌ WebSocket Error:', event);
          }
        });

        client.activate();
        clientRef.current = client;

        return () => {
          client.deactivate();
        };
      }, [url]);


    // subscribe 좀 더 고도화
    const subscribe = useCallback((url: string, onMessage: (payload: any) => void) => {
      if (!clientRef.current || !isConnected) {
        return null;
      }
      
      return clientRef.current.subscribe(url, (socketResponse: IMessage) => {
        try {
          const payload = JSON.parse(socketResponse.body);
          onMessage(payload);
        } catch {
          onMessage(socketResponse.body);
        }
      });
    }, [isConnected]);

    return (
      <StompContext.Provider value={{ isConnected, subscribe }}>
        {children}
      </StompContext.Provider>
    );
};

export const useStomp = () => {
  const context = useContext(StompContext);
  if (!context) {
    throw new Error('useStomp는 StompProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
};
