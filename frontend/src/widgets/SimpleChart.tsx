import { useEffect, useRef } from 'react';
import { createChart, type IChartApi, ColorType, LineType, CrosshairMode, createSeriesMarkers, type ISeriesApi, LineSeries } from 'lightweight-charts';

import { type ChartPeriod } from '../shared/type/period.type';
import { type JournalResponseDto } from '@/features/stock-journal/hooks/useJournalQueries';

export interface ChartData {
  time: string | number; // 'YYYY-MM-DD' 형식 또는 유닉스 타임스탬프 (초 단위)
  value: number;
}

interface StreamEvent {
  type: 'CALENDAR' | 'REALTIME_IMPACT';
  title: string;
  date: string;
  score?: number;
  briefing: string[];
}

interface SimpleChartProps {
  chartData: ChartData[];
  newsEvents?: StreamEvent[];
  journalEvents?: JournalResponseDto[];
  period: ChartPeriod;
  onJournalClick?: (date: string) => void;
}

/**
 * 주식 차트를 그리고, 속보 및 매매 일지 기록 지점에 커스텀 마커를 매핑하는 차트 위젯
 */
export const SimpleChart = ({ chartData, newsEvents = [], journalEvents = [], period, onJournalClick }: SimpleChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  
  // newsEvents 및 journalEvents 변경 시 차트 재생성을 막기 위해 useRef로 최신 값 참조
  const newsEventsRef = useRef<StreamEvent[]>(newsEvents);
  const journalEventsRef = useRef<JournalResponseDto[]>(journalEvents);
  const onJournalClickRef = useRef<((date: string) => void) | undefined>(onJournalClick);

  useEffect(() => {
    newsEventsRef.current = newsEvents;
  }, [newsEvents]);

  useEffect(() => {
    journalEventsRef.current = journalEvents;
  }, [journalEvents]);

  useEffect(() => {
    onJournalClickRef.current = onJournalClick;
  }, [onJournalClick]);

  // 1. 차트 인스턴스 초기 생성 및 소멸 (period 변경 시 또는 마운트 시 실행)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const initialWidth = container.clientWidth || 560;

    const chart = createChart(container, {
      width: initialWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' }, // 배경색
        textColor: '#333', // 글자색
        fontSize: 12,
      },
      grid: {
        vertLines: { visible: false }, // 세로 격자 숨김
        horzLines: { color: '#f0f0f0' }, // 가로 격자 색상
      },
      rightPriceScale: {
        borderVisible: false, // 우측 테두리 숨김
      },
      timeScale: {
        borderVisible: false, // 하단 테두리 숨김
        timeVisible: true,    // 시간 표시 여부
        secondsVisible: false,
        fixLeftEdge: true,    // 왼쪽 가장자리 고정
        fixRightEdge: true,   // 오른쪽 가장자리 고정
        tickMarkFormatter: (time, _tickMarkType, _locale) => {
          if (typeof time === 'number') {
            const date = new Date(time * 1000);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            if (period === '일' || period === '주') {
              return `${month}/${day}`; // MM/DD
            } else if (period === '월') {
              return `${String(year).substring(2)}/${month}`; // YY/MM
            } else if (period === '년') {
              return `${year}`; // YYYY
            } else {
              // 분봉 등
              const hours = String(date.getUTCHours()).padStart(2, '0');
              const minutes = String(date.getUTCMinutes()).padStart(2, '0');
              return `${hours}:${minutes}`;
            }
          }
          return '';
        }
      },
      localization: {
        timeFormatter: (time) => {
          if (typeof time === 'number') {
            const date = new Date(time * 1000);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            if (period === '일' || period === '주' || period === '월' || period === '년') {
              return `${year}-${month}-${day}`;
            } else {
              const hours = String(date.getUTCHours()).padStart(2, '0');
              const minutes = String(date.getUTCMinutes()).padStart(2, '0');
              return `${year}-${month}-${day} ${hours}:${minutes}`;
            }
          }
          return String(time);
        }
      },
      crosshair: {
        mode: CrosshairMode.Magnet, // 마우스가 데이터에 자석처럼 붙음
      },
    });

    // 라인 시리즈 생성 (차트 초기화 방식)
    const series = chart.addSeries(LineSeries, {
      color: '#2962FF',        // 선 색상
      lineWidth: 3,            // 선 두께
      lineType: LineType.Curved, // 부드러운 곡선
      crosshairMarkerVisible: true, // 마우스 올렸을 때 점 표시
      lastPriceAnimation: 1,
      lastValueVisible: true,  // 현재가 표시 라벨 노출
      priceLineVisible: false, // 수평 가격선 숨김
    });

    chartApiRef.current = chart;
    seriesRef.current = series;

    // 마커 클릭 시 동작 연동
    chart.subscribeClick((param) => {
      if (!param.time) return;
      
      let clickedTime = '';
      if (typeof param.time === 'number') {
        const date = new Date(param.time * 1000);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        clickedTime = `${year}-${month}-${day}`;
      } else if (typeof param.time === 'string') {
        clickedTime = param.time as string;
      } else if (param.time && typeof param.time === 'object') {
        const bd = param.time as Record<string, any>;
        if (bd.year !== undefined && bd.month !== undefined && bd.day !== undefined) {
          clickedTime = `${bd.year}-${String(bd.month).padStart(2, '0')}-${String(bd.day).padStart(2, '0')}`;
        }
      }

      // 1. 투자 일지 클릭 이벤트가 있을 시 우선적으로 핸들러 트리거
      const matchedJournal = journalEventsRef.current.find(j => j.journalDate === clickedTime);
      if (matchedJournal && onJournalClickRef.current) {
        onJournalClickRef.current(clickedTime);
        return;
      }
 
      // 2. 일지가 없으면 기존 실시간 뉴스 카드로 스크롤 연동
      const matchedEvent = newsEventsRef.current.find(e => e.date === clickedTime);
      if (matchedEvent) {
        const cardElement = document.getElementById(`news-card-${clickedTime}`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          cardElement.classList.add('border-rose-400', 'shadow-[0_0_15px_rgba(244,63,94,0.4)]');
          setTimeout(() => {
            cardElement.classList.remove('border-rose-400', 'shadow-[0_0_15px_rgba(244,63,94,0.4)]');
          }, 2000);
        }
      }
    });
 
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width } = entries[0].contentRect;
      // 너비가 0 이하(차트가 접혔을 때)일 때는 리사이징을 스킵하여 캔버스 드로잉 버퍼를 안전하게 보존합니다.
      if (width <= 0) return;
      chart.resize(width, 300);
    });
    resizeObserver.observe(container);
 
    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartApiRef.current = null;
      seriesRef.current = null;
    };
 
  }, []);

  // 1.1. period 변경 시 차트를 파괴하지 않고 X축 및 툴팁 포맷 옵션만 동적으로 업데이트
  useEffect(() => {
    const chart = chartApiRef.current;
    if (!chart) return;

    chart.applyOptions({
      timeScale: {
        tickMarkFormatter: (time, _tickMarkType, _locale) => {
          if (typeof time === 'number') {
            const date = new Date(time * 1000);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            if (period === '일' || period === '주') {
              return `${month}/${day}`; // MM/DD
            } else if (period === '월') {
              return `${String(year).substring(2)}/${month}`; // YY/MM
            } else if (period === '년') {
              return `${year}`; // YYYY
            } else {
              // 분봉 등
              const hours = String(date.getUTCHours()).padStart(2, '0');
              const minutes = String(date.getUTCMinutes()).padStart(2, '0');
              return `${hours}:${minutes}`;
            }
          }
          return '';
        }
      },
      localization: {
        timeFormatter: (time) => {
          if (typeof time === 'number') {
            const date = new Date(time * 1000);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            if (period === '일' || period === '주' || period === '월' || period === '년') {
              return `${year}-${month}-${day}`;
            } else {
              const hours = String(date.getUTCHours()).padStart(2, '0');
              const minutes = String(date.getUTCMinutes()).padStart(2, '0');
              return `${year}-${month}-${day} ${hours}:${minutes}`;
            }
          }
          return String(time);
        }
      }
    });
  }, [period]);

  // 2. 차트 가격 데이터 주입 (chartData 변경 시 실행)
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartApiRef.current;
    if (!series || !chart || !chartData) return;

    series.setData(chartData as any);
    
    // 차트 화면 피팅
    chart.timeScale().fitContent();
  }, [chartData]);

  // 3. 속보 발생 지점 + 내 매매 시점 마커 세팅
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !chartData || chartData.length === 0) return;

    const allMarkers: any[] = [];

    // 3.1. 실시간 속보 마커 추가
    if (newsEvents && newsEvents.length > 0) {
      newsEvents
        .filter(event => event.type === 'REALTIME_IMPACT')
        .forEach(event => {
          const timestamp = Math.floor(new Date(event.date + 'T00:00:00Z').getTime() / 1000);
          allMarkers.push({
            time: timestamp,
            position: 'aboveBar' as const,
            color: '#f43f5e', // 빨간색 마커
            shape: 'circle' as const,
            text: 'NEWS',
          });
        });
    }

    // 3.2. 유저 매매 일지 마커 추가 (B/S/M)
    if (journalEvents && journalEvents.length > 0) {
      journalEvents.forEach(journal => {
        const timestamp = Math.floor(new Date(journal.journalDate + 'T00:00:00Z').getTime() / 1000);
        
        let markerColor = '#64748b'; // MEMO - 회색
        let markerText = 'M';
        if (journal.actionType === 'BUY') {
          markerColor = '#10b981'; // BUY - 네온 그린
          markerText = 'B';
        } else if (journal.actionType === 'SELL') {
          markerColor = '#2962FF'; // SELL - 로얄 블루
          markerText = 'S';
        }

        allMarkers.push({
          time: timestamp,
          position: 'belowBar' as const,
          color: markerColor,
          shape: 'circle' as const,
          text: markerText,
        });
      });
    }

    // 마커들을 시간 순으로 정렬 (lightweight-charts API 요구사항)
    allMarkers.sort((a, b) => a.time - b.time);

    const markersPlugin = createSeriesMarkers(series);
    markersPlugin.setMarkers(allMarkers);
    
  }, [newsEvents, journalEvents, chartData]);

  return (
    <div ref={chartContainerRef} className="w-full overflow-hidden [&_a]:hidden" />
  );
};
