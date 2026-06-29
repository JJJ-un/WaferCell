import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStomp } from '@/shared/model/contexts/StompContext';
import { type ChartPeriod } from '@/shared/type/period.type';
import { type UpdatedStock } from '@/entities/stock/types/stock.types';

export const useRealtimeChart = (ticker: string, period: ChartPeriod) => {
  const queryClient = useQueryClient();
  const { isConnected, subscribe } = useStomp();

  // 특정 주기에 따른 타임스탬프(초 단위)를 반환하는 함수
  const getPeriodTimestamp = useCallback((dateObj: Date, periodType: ChartPeriod): number => {
    const timeMs = dateObj.getTime();
    switch (periodType) {
      case '1분':
        return Math.floor(timeMs / 60000) * 60;
      case '5분':
        return Math.floor(timeMs / 300000) * 300;
      case '일': {
        const utcDate = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()));
        return Math.floor(utcDate.getTime() / 1000);
      }
      case '주': {
        // 이번 주 월요일 기준 (UTC)
        const day = dateObj.getUTCDay();
        const diff = dateObj.getUTCDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), diff));
        return Math.floor(monday.getTime() / 1000);
      }
      case '월': {
        const firstDay = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), 1));
        return Math.floor(firstDay.getTime() / 1000);
      }
      case '년': {
        const firstJan = new Date(Date.UTC(dateObj.getUTCFullYear(), 0, 1));
        return Math.floor(firstJan.getTime() / 1000);
      }
      default:
        return Math.floor(timeMs / 1000);
    }
  }, []);

  const handlePriceUpdate = useCallback((eventData: UpdatedStock) => {
    if (eventData.ticker !== ticker) return;

    queryClient.setQueryData(['chart', ticker, period], (prev: any) => {
      if (!prev || !prev.chartData) return prev;

      const updatedChartData = [...prev.chartData];
      if (updatedChartData.length === 0) return prev;

      // 현재 기준 타임스탬프 계산
      const targetTimestamp = getPeriodTimestamp(new Date(), period);
      const lastPointIndex = updatedChartData.length - 1;
      const lastPoint = updatedChartData[lastPointIndex];

      if (lastPoint && lastPoint.time === targetTimestamp) {
        // 동일한 주기에 속하면 값만 현재가로 업데이트
        updatedChartData[lastPointIndex] = {
          ...lastPoint,
          value: eventData.price.price,
        };
      } else {
        // 새로운 주기(시간)가 시작되었으면 새로운 포인트 추가
        updatedChartData.push({
          time: targetTimestamp,
          value: eventData.price.price,
        });
      }

      return {
        ...prev,
        chartData: updatedChartData,
      };
    });
  }, [ticker, period, queryClient, getPeriodTimestamp]);

  useEffect(() => {
    if (!isConnected || !subscribe) return;

    // 실시간 주가 토픽 구독
    const subscription = subscribe('/topic/stocks', handlePriceUpdate);

    return () => {
      subscription?.unsubscribe();
    };
  }, [isConnected, subscribe, handlePriceUpdate]);
};
