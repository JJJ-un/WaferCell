import React, { createContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

interface StompContextProps {
  isConnected: boolean;
  subscribe: (topic: string, callback: (payload: any) => void) => StompSubscription | null;
}

const StompContext = createContext<StompContextProps | null>(null);

export const StompProvider = ({ url, children }: { url: string; children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const client = new Client({
          brokerURL: url,
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
        });

        client.activate();
        clientRef.current = client;

        return () => {
          client.deactivate();
        };
      }, [url]);

    // context에서 value로 넘겨주는 함수는 대게 useCallback TJdigksek. 여러군데에서 구독하기 때문에
    const subscribe = useCallback((topic: string, callback: (payload: any) => void) => {
      if (!clientRef.current || !isConnected) return null;

      return clientRef.current.subscribe(topic, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          callback(payload);
        } catch {
          callback(message.body);
        }
      });
    },
    [isConnected]
    )

    return (
      <StompContext.Provider value={{ isConnected, subscribe }}>
        {children}
      </StompContext.Provider>
    );
};

export const useStomp = () => {
  const context = React.useContext(StompContext);
  if (!context) {
    throw new Error('useStomp는 StompProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
};
