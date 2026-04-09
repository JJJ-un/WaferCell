import { useEffect } from 'react';
import { useStomp } from '@/shared/model/contexts/StompContext';
import { useUpdateStockData } from './useUpdateStockData';

/**
 * 실시간 웹소켓 데이터를 구독하고 업데이트 훅에 전달하는 역할만 수행합니다.
 */
export const useRealtimeStocks = () => {
  const { isConnected, subscribe } = useStomp();
  const { updateStockData } = useUpdateStockData();

  useEffect(() => {
    if (!isConnected || !subscribe) return;

    // 데이터가 오면 updater에게 책임을 넘깁니다.
    const subscription = subscribe('/topic/stocks', updateStockData);

    return () => {
      subscription?.unsubscribe();
    };
  }, [isConnected, subscribe, updateStockData]);
};


