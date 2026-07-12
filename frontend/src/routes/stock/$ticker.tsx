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
import { useState, useEffect, useRef, useContext } from "react";
import { DailyPriceList } from "@/widgets/DailyPriceList";
import { useParams, createFileRoute } from "@tanstack/react-router";
import { NewsEventContext } from "../__root";
import { useChartData } from "@/features/stock-chart/hook/useChartData";
import { useRealtimeChart } from "@/features/stock-chart/hook/useRealtimeChart";
import { useInfiniteDailyPrices } from "@/features/daily-prices/hooks/useInfiniteDailyPrices";

// 일지 기능 연동을 위해 임포트
import { useJournalQueries, type JournalResponseDto } from "@/features/stock-journal/hooks/useJournalQueries";
import { JournalDrawer } from "@/widgets/journal/JournalDrawer";

export const Chart = () => {
    const { ticker } = useParams({ from: '/stock/$ticker' }) as { ticker: string };
    const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('일');
    const { events } = useContext(NewsEventContext);

    // 1. 투자 일지 쿼리 및 드로워 상태 선언
    const { tickerJournals, refetchTicker } = useJournalQueries(ticker);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedJournalDate, setSelectedJournalDate] = useState<string | undefined>(undefined);
    const [selectedJournal, setSelectedJournal] = useState<JournalResponseDto | undefined>(undefined);

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
    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setSelectedJournal(undefined);
        setSelectedJournalDate(undefined);
        refetchTicker();
    };

    // 차트의 일지 마커 클릭 시의 핸들러
    const handleJournalClick = (date: string) => {
        const matched = tickerJournals.find(j => j.journalDate === date);
        if (matched) {
            setSelectedJournal(matched);
            setSelectedJournalDate(date);
        } else {
            setSelectedJournal(undefined);
            setSelectedJournalDate(date);
        }
        setIsDrawerOpen(true);
    };

    // 신규 작성 버튼 핸들러
    const handleNewJournalClick = () => {
        setSelectedJournal(undefined);
        setSelectedJournalDate(undefined);
        setIsDrawerOpen(true);
    };

    if (isChartLoading || isPriceLoading) return <div className="p-24">데이터를 불러오는 중...</div>;
    if (!chartResponse || !priceResponse) return <div className="p-24">데이터가 없습니다.</div>;

    const flatDailyPrices = priceResponse?.pages?.flat() || [];

    return (
        <div className="p-[24px] flex flex-col gap-[24px]">
            {/* 차트 섹션 (흰색 바탕 카드로 독립 분리) */}
            <div className="bg-white border border-slate-200/60 rounded-xl p-[24px] flex flex-col gap-[24px] shadow-md overflow-hidden">
                <div className="flex justify-between items-center">
                    <Selector options={periodOptions} selected={selectedPeriod} onSelect={setSelectedPeriod} />
                    
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
            <div className="bg-white border border-slate-200/60 rounded-xl p-[24px] flex flex-col gap-[24px] shadow-md">
                <div className="flex flex-col">
                    <DailyPriceList dailyPrices={flatDailyPrices}>
                        {/* 감지선 엘리먼트가 테이블 내부 스크롤 영역 최하단에 삽입됨 */}
                        <div ref={observerRef} className="h-10 flex items-center justify-center text-sm text-gray-400 mt-[12px] border-t border-dotted border-slate-200 pt-[12px]">
                            {isFetchingNextPage ? "시세를 더 불러오는 중..." : hasNextPage ? "스크롤하여 시세 더 보기" : "마지막 시세입니다."}
                        </div>
                    </DailyPriceList>
                </div>
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
    )
}

export const Route = createFileRoute('/stock/$ticker')({
    component: Chart,
});
