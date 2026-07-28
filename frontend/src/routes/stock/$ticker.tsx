import { SimpleChart } from "@/widgets/SimpleChart"
import Selector, { type SelectorOption } from "@/shared/ui/selector/Selector"
import { type ChartPeriod } from "@/shared/type/period.type"

const periodOptions: SelectorOption<ChartPeriod>[] = [
    { value: '1분', label: '1분' },
    { value: '5분', label: '5분' },
    { value: '일', label: '일' },
    { value: '주', label: '주' },
    { value: '월', label: '월' },
    { value: '년', label: '년' }
];
import { useState, useEffect, useRef, useCallback } from "react";
import { DailyPriceList } from "@/widgets/DailyPriceList";
import { useParams, createFileRoute } from "@tanstack/react-router";
import { NewsEventProvider, useNewsEvent } from "@/features/stock-news/provider/NewsEventProvider";
import { RightNewsPanel } from "@/widgets/news-feed/RightNewsPanel";
import { useChartData } from "@/features/stock-chart/hook/useChartData";
import { useRealtimeChart } from "@/features/stock-chart/hook/useRealtimeChart";
import { useInfiniteDailyPrices } from "@/features/daily-prices/hooks/useInfiniteDailyPrices";

// 일지 기능 연동을 위해 임포트
import { useJournalQueries, type JournalResponseDto } from "@/features/stock-journal/hooks/useJournalQueries";
import { JournalDrawer } from "@/widgets/journal/JournalDrawer";

// 주요 반도체 종목 티커-한글명 매핑 사전
const tickerNames: Record<string, string> = {
    NVDA: "엔비디아",
    TSM: "TSMC",
    TSMC: "TSMC",
    ASML: "ASML",
    AVGO: "브로드컴",
    AMD: "AMD",
    INTC: "인텔",
    QCOM: "퀄컴",
    MU: "마이크론 테크놀로지",
    TXN: "텍사스 인스트루먼트",
    AMAT: "어플라이드 머티어리얼즈",
    LRCX: "램리서치",
    ARM: "ARM 홀딩스",
    KLAC: "KLA",
    MRVL: "마벨 테크놀로지",
    MCHP: "마이크로칩",
    ADI: "아날로그 디바이스"
};

const StockDetailPageContent = () => {
    const { ticker } = useParams({ from: '/stock/$ticker' }) as { ticker: string };
    const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('일');
    const { events, setActiveDate, isChartVisible, setIsChartVisible } = useNewsEvent();

    // 1. 투자 일지 쿼리 및 드로워 상태 선언
    const { tickerJournals, refetchTicker } = useJournalQueries(ticker);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedJournalDate, setSelectedJournalDate] = useState<string | undefined>(undefined);
    const [selectedJournal, setSelectedJournal] = useState<JournalResponseDto | undefined>(undefined);

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const handleWheel = (e: React.WheelEvent) => {
        const scrollContainer = scrollContainerRef.current;
        if (e.deltaY > 10 && isChartVisible) {
            setIsChartVisible(false);
        } else if (e.deltaY < -10 && !isChartVisible) {
            // 일별 시세 리스트의 스크롤바가 최상단에 도달했을 때만 차트 다시 펼침
            if (scrollContainer && scrollContainer.scrollTop <= 0) {
                setIsChartVisible(true);
            }
        }
    };

    const { data: chartResponse, isLoading: isChartLoading } = useChartData(ticker, selectedPeriod);

    // 실시간 웹소켓 시세 반영 연동
    useRealtimeChart(ticker, selectedPeriod);

    const {
        data: priceResponse,
        isLoading: isPriceLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteDailyPrices(ticker);

    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const currentTarget = observerRef.current;
        if (!currentTarget || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchNextPage();
            }
        }, { threshold: 0.1 });

        observer.observe(currentTarget);
        return () => {
            observer.disconnect();
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, priceResponse]);

    // 드로워가 닫힐 때 최신 일지 목록을 리프레시
    const handleDrawerClose = useCallback(() => {
        setIsDrawerOpen(false);
        setSelectedJournal(undefined);
        setSelectedJournalDate(undefined);
        refetchTicker();
    }, [refetchTicker]);

    // 차트의 일지 마커 클릭 시의 핸들러
    const handleJournalClick = useCallback((date: string) => {
        const matched = tickerJournals.find(j => j.journalDate === date);
        if (matched) {
            setSelectedJournal(matched);
            setSelectedJournalDate(date);
        } else {
            setSelectedJournal(undefined);
            setSelectedJournalDate(date);
        }
        setIsDrawerOpen(true);
    }, [tickerJournals]);

    // 신규 작성 버튼 핸들러
    const handleNewJournalClick = useCallback(() => {
        setSelectedJournal(undefined);
        setSelectedJournalDate(undefined);
        setIsDrawerOpen(true);
    }, []);

    // 최초 진입 시 데이터가 아예 없을 때만 전체 로딩 화면 노출
    const isInitialLoading = (isChartLoading && !chartResponse) || (isPriceLoading && !priceResponse);
    if (isInitialLoading) return <div className="p-24">데이터를 불러오는 중...</div>;
    
    if (!chartResponse || !priceResponse) return <div className="p-24">데이터가 없습니다.</div>;

    const flatDailyPrices = priceResponse?.pages?.flat() || [];

    const latestPriceInfo = flatDailyPrices[0];
    const isMiniPositive = latestPriceInfo ? latestPriceInfo.changeAmount > 0 : false;
    const isMiniNegative = latestPriceInfo ? latestPriceInfo.changeAmount < 0 : false;
    const miniColorClass = isMiniPositive ? "text-trend-up-500" : isMiniNegative ? "text-trend-down-500" : "text-gray-500";
    const miniSign = isMiniPositive ? '+' : '';

    const showMiniHeader = !isChartVisible;

    return (
        <div className="flex flex-1 h-full min-h-0 overflow-hidden">
            <div
                onWheel={handleWheel}
                className={`flex-1 h-full min-h-0 flex flex-col px-[24px] pb-[24px] overflow-hidden transition-all duration-300 ease-in-out ${
                    isChartVisible ? "pt-[24px]" : "pt-[82px]"
                }`}
            >
                {/* 상단 미니 요약 스티키 헤더 (차트가 접혔을 때 Header 바로 아래 고정) */}
                <div
                    className={`fixed top-[65px] left-0 right-0 h-[58px] bg-white/85 backdrop-blur-md border-b border-slate-200/50 shadow-sm z-[190] px-[40px] flex items-center justify-between transition-all duration-300 ease-out transform ${showMiniHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
                        }`}
                >
                    {/* 좌측: 종목명 및 티커 */}
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800 text-sm tracking-wide bg-slate-100 px-2.5 py-0.5 rounded text-slate-600 uppercase">
                            {ticker}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">주가 요약</span>
                    </div>

                    {/* 중앙: 실시간 주가 정보 */}
                    {latestPriceInfo && (
                        <div className="flex items-center gap-4 animate-fadeIn">
                            <span className="font-bold text-slate-900 text-base">
                                {latestPriceInfo.closePrice.toLocaleString()} <span className="text-[11px] font-medium text-slate-400">USD</span>
                            </span>
                            <span className={`text-xs font-bold ${miniColorClass} flex items-center gap-0.5`}>
                                {isMiniPositive ? '▲' : isMiniNegative ? '▼' : ''} {miniSign}{latestPriceInfo.changeAmount.toLocaleString()} ({miniSign}{latestPriceInfo.changeRate}%)
                            </span>
                        </div>
                    )}

                    {/* 우측: 숏컷 일지 작성 버튼 */}
                    <button
                        onClick={handleNewJournalClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition duration-150 cursor-pointer active:scale-95 shadow-md shadow-blue-500/10"
                    >
                        일지 작성
                    </button>
                </div>

                {/* 차트 섹션 (흰색 바탕 카드로 독립 분리) */}
                <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 bg-white border border-slate-200/60 rounded-xl p-[24px] flex flex-col gap-[24px] shadow-md ${isChartVisible
                            ? "h-[420px] opacity-100 mb-[24px] visible"
                            : "h-0 opacity-0 mb-0 py-0 border-0 shadow-none pointer-events-none"
                        }`}
                >
                    {/* 상단 툴바 컨트롤러 영역 - 항상 노출 */}
                    <div className="flex justify-between items-center flex-shrink-0">
                        {/* 좌측: 종목명 및 티커 + Selector */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-extrabold text-slate-800 text-xl tracking-tight uppercase">
                                    {ticker}
                                </span>
                                <span className="text-xs font-semibold text-slate-500/80">
                                    {tickerNames[ticker.toUpperCase()] || ""}
                                </span>
                            </div>
                            <div className="h-4 w-[1px] bg-slate-200/80" />
                            <Selector options={periodOptions} selected={selectedPeriod} onSelect={setSelectedPeriod} />
                        </div>

                        {/* 투자 일지 신규 작성 버튼 (디자인 시스템 파란색, 연필 아이콘 제거) */}
                        <button
                            onClick={handleNewJournalClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95"
                        >
                            일지 작성
                        </button>
                    </div>

                    {/* 차트에 일지 이벤트(B/S/M 마커)와 클릭 이벤트 바인딩 */}
                    <div className="w-full">
                        <SimpleChart
                            chartData={chartResponse.chartData}
                            newsEvents={events}
                            journalEvents={tickerJournals}
                            period={selectedPeriod}
                            onJournalClick={handleJournalClick}
                        />
                    </div>
                </div>

                {/* 일별 시세 리스트 섹션 (독립 카드 분리) */}
                <div className="bg-white border border-slate-200/60 rounded-xl p-[24px] flex flex-col gap-[24px] shadow-md flex-1 min-h-0 overflow-hidden">
                    <DailyPriceList
                        dailyPrices={flatDailyPrices}
                        onDateVisible={setActiveDate}
                        scrollRef={scrollContainerRef}
                    >
                        {/* 감지선 엘리먼트가 테이블 내부 스크롤 영역 최하단에 삽입됨 */}
                        <div ref={observerRef} className="h-10 flex items-center justify-center text-sm text-gray-400 mt-[12px] border-t border-dotted border-slate-200 pt-[12px]">
                            {isFetchingNextPage ? "시세를 더 불러오는 중..." : hasNextPage ? "스크롤하여 시세 더 보기" : "마지막 시세입니다."}
                        </div>
                    </DailyPriceList>
                </div>

                {/* 일지 작성/상세 드로워 마운트 */}
                <JournalDrawer
                    isOpen={isDrawerOpen}
                    onClose={handleDrawerClose}
                    ticker={ticker}
                    initialDate={selectedJournalDate}
                    existingJournal={selectedJournal}
                />
            </div>
            <RightNewsPanel />
        </div>
    )
}

export const Chart = () => {
    return (
        <NewsEventProvider>
            <StockDetailPageContent />
        </NewsEventProvider>
    );
};

export const Route = createFileRoute('/stock/$ticker')({
    component: Chart,
});
