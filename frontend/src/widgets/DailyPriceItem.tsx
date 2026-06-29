import { useState } from "react";
import { createPortal } from "react-dom";
import { type DailyPrice } from "@/entities/stock/types/stock.types";
import { useParams } from "@tanstack/react-router";
import { apiClient } from "@/shared/api/apiClient";

interface NewsEvent {
  id: number;
  eventName: string;
  eventDate: string;
  estimatedImpact: string; // "||"로 조인된 브리핑 문자열
  eventType: string;
  score?: number;
  newsUrl?: string;
}

export const DailyPriceItem = ({ dailyPrice }: { dailyPrice: DailyPrice }) => {
    const { changeAmount, changeRate, date, closePrice, volume } = dailyPrice;
    const { ticker } = useParams({ strict: false }) as { ticker?: string };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState<NewsEvent[]>([]);

    const isPositive = changeAmount > 0;
    const isNegative = changeAmount < 0;

    const amountSign = isPositive ? '+' : '';
    const rateSign = changeRate > 0 ? '+' : '';

    const colorClass = isPositive ? "text-trend-up-500" : isNegative ? "text-trend-down-500" : "text-gray-500";

    const handleAnalyzeClick = async () => {
        if (!ticker) return;
        setIsModalOpen(true);
        setIsLoading(true);
        try {
            const response = await apiClient.get<NewsEvent[]>(`/stocks/${ticker.toUpperCase()}/events`, {
                params: { date }
            });
            setEvents(response.data || []);
        } catch (error) {
            console.error("당일 이슈 조회 실패", error);
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 select-none">
                <div className="w-24 text-gray-500 flex items-center gap-1.5">
                    <span>{date}</span>
                    {Math.abs(changeRate) >= 3.0 && (
                        <button 
                            onClick={handleAnalyzeClick}
                            title="당일 속보 이슈 보기"
                            className="text-[9px] hover:scale-110 active:scale-95 bg-indigo-50 hover:bg-indigo-100/90 text-indigo-500 hover:text-indigo-600 font-extrabold px-1 py-0.5 rounded cursor-pointer transition-all border border-indigo-100 flex items-center justify-center shrink-0"
                        >
                            📝
                        </button>
                    )}
                </div>
                <div className="w-24 text-right font-semibold text-foreground">
                    {closePrice.toLocaleString()}
                </div>
                <div className={`w-40 text-right ${colorClass} font-medium`}>
                    {amountSign}{changeAmount.toLocaleString()} ({rateSign}{changeRate}%)
                </div>
                <div className="w-32 text-right text-gray-500">
                    {volume.toLocaleString()}
                </div>
            </div>

            {/* 과거 이슈 분석 모달 (React Portal로 Stacking Context 가둠 현상 원천 해결) */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white border border-slate-200 w-full max-w-[400px] rounded-2xl shadow-xl flex flex-col max-h-[500px] overflow-hidden">
                        
                        {/* 모달 헤더 */}
                        <div className="flex justify-between items-center p-[20px] border-b border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-xs font-black text-slate-800">당일 속보 이슈 분석</h3>
                                <span className="text-[10px] text-slate-400 font-semibold">{ticker?.toUpperCase()} | {date}</span>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 모달 바디 */}
                        <div className="flex-1 overflow-y-auto p-[20px] scrollbar-hide">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] text-slate-400 animate-pulse font-semibold">당시 시장 이슈 불러오는 중...</span>
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-[11px] font-medium italic">
                                    이날 수집된 유의미한 시장 속보가 없습니다.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {events.map((event) => (
                                        <div key={event.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                                            <h4 className="text-[11px] font-bold text-slate-800 mb-2.5 leading-snug">
                                                {event.eventName}
                                            </h4>
                                            <ul className="flex flex-col gap-2">
                                                {event.estimatedImpact.split("||").map((bullet, idx) => (
                                                    <li 
                                                        key={idx}
                                                        className="text-[10px] text-slate-600 leading-relaxed pl-3.5 relative before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-[3px] before:h-[3px] before:rounded-full before:bg-slate-400"
                                                    >
                                                        {bullet}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 모달 푸터 */}
                        <div className="p-[16px] border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-slate-800 text-white font-bold text-[10px] rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}