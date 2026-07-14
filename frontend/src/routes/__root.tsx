import { createRootRoute, Outlet, useParams, useRouterState } from '@tanstack/react-router'
import { Header } from '@/shared/ui/header/Header'
import { ValueChainList } from '../widgets/value-chain/ValueChainList'
import { NewsFeed } from '../widgets/news-feed/NewsFeed'
import { TickerNewsList } from '../widgets/news-feed/TickerNewsList'
import { useState, useEffect, createContext } from 'react'
import Selector, { type SelectorOption } from '@/shared/ui/selector/Selector'

const tabOptions: SelectorOption<'STREAM' | 'NEWS'>[] = [
  { value: 'NEWS', label: '종목 뉴스' },
  { value: 'STREAM', label: '글로벌 속보' }
];

interface StreamEvent {
  type: 'CALENDAR' | 'REALTIME_IMPACT';
  title: string;
  date: string;
  score?: number;
  briefing: string[];
}

export const NewsEventContext = createContext<{
  events: StreamEvent[];
  activeDate?: string;
  setActiveDate?: (date: string) => void;
  isChartVisible: boolean;
  setIsChartVisible: (visible: boolean) => void;
}>({ 
  events: [],
  isChartVisible: true,
  setIsChartVisible: () => {}
});

/**
 * 전역 레이아웃 컴포넌트
 * 종목 상세 진입 시 '실시간 글로벌 속보'와 '종목 뉴스'를 전환해 볼 수 있는 탭 스위칭을 제공합니다.
 */
const RootComponent = () => {
  const { ticker } = useParams({ strict: false }) as { ticker?: string };
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'STREAM' | 'NEWS'>('NEWS'); // 탭 선택 상태 추가
  const [activeDate, setActiveDate] = useState<string | undefined>(undefined);
  const [isChartVisible, setIsChartVisible] = useState(true);

  // 현재 라우트 경로 감지 (다이어리 페이지 여부 식별용)
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDiaryPage = pathname.startsWith('/diary');
  const isStockPage = pathname.startsWith('/stock/');
  const isDashboardPage = pathname === '/dashboard' || pathname === '/';
  const isViewportLocked = isDashboardPage || isStockPage || isDiaryPage;

  const [isStickyShifted, setIsStickyShifted] = useState(false);

  useEffect(() => {
    if (!isStockPage) {
      setIsStickyShifted(false);
      return;
    }
    const handleScroll = () => {
      if (window.scrollY > 180) {
        setIsStickyShifted(true);
      } else {
        setIsStickyShifted(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isStockPage]);

  // 종목(ticker)이 변경되면 기본적으로 '종목 뉴스' 탭을 띄우도록 설정
  useEffect(() => {
    setActiveTab('NEWS');
  }, [ticker]);

  // 백그라운드에서도 실시간 속보 수집 및 AI 분석 카드가 누적되도록 최상위에서 SSE 연결을 관리합니다.
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
    <div className={`flex flex-col bg-background text-ink-main ${
      isViewportLocked ? "h-screen overflow-hidden" : "min-h-screen"
    }`}>
      <Header />
      <div className={`flex ${
        isViewportLocked ? "flex-1 min-h-0 overflow-hidden" : ""
      }`}>
        <div className={
          isViewportLocked ? "flex-1 h-full min-h-0 overflow-hidden" : "flex-1"
        }>
          <NewsEventContext.Provider value={{ events, activeDate, setActiveDate, isChartVisible, setIsChartVisible }}>
            <Outlet />
          </NewsEventContext.Provider>
        </div>

        {/* 우측 실시간 속보 타임라인 패널 - 다이어리 페이지(/diary)일 경우 숨김 처리 */}
        {!isDiaryPage && (
          <div 
            style={
              isViewportLocked 
                ? { 
                    height: isChartVisible ? 'calc(100vh - 113px)' : 'calc(100vh - 171px)' 
                  } 
                : {
                    top: isStickyShifted ? '147px' : '89px',
                    height: 'calc(100vh - 113px)',
                    willChange: 'top',
                  }
            }
            className={
              isViewportLocked
                ? `w-[340px] bg-primary flex flex-col p-6 mr-[24px] mb-[24px] rounded-lg border border-slate-200/40 shadow-md overflow-hidden transition-all duration-300 ease-in-out ${
                    isChartVisible ? "mt-[24px]" : "mt-[82px]"
                  }`
                : "w-[340px] sticky transition-[top] duration-300 ease-out bg-primary flex flex-col p-6 mt-[24px] mr-[24px] mb-[24px] rounded-lg border border-slate-200/40 shadow-md overflow-hidden"
            }
          >
            
            {ticker ? (
              <>
                {/* 우측 패널용 탭 헤더 컴포넌트 */}
                <div className="mb-5">
                  <Selector
                    options={tabOptions}
                    selected={activeTab}
                    onSelect={setActiveTab}
                    className="w-full"
                    itemClassName="flex-1 text-center"
                  />
                </div>

                {activeTab === 'STREAM' ? (
                  <>
                    <div className="flex flex-col gap-1 mb-5">
                      <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-505"></span>
                        </span>
                        실시간 글로벌 속보 피드
                      </h3>
                      <p className="text-[10px] text-slate-400">해외 공시 및 외신 실시간 AI 요약 스트리밍</p>
                    </div>

                    {/* 실시간 속보 타임라인 렌더링 컨테이너 */}
                    <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
                      <ValueChainList
                        ticker={ticker}
                        events={events}
                        connected={connected}
                      />
                    </div>
                  </>
                ) : (
                  // 종목 관련 한글 뉴스 리스트 렌더링 영역
                  <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
                    <TickerNewsList ticker={ticker} />
                  </div>
                )}
              </>
            ) : (
              // 대시보드(ticker가 없을 때)의 일반 해외 속보 피드 노출
              <NewsFeed />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
