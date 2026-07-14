interface StreamEvent {
    type: 'CALENDAR' | 'REALTIME_IMPACT';
    title: string;
    date: string;
    score?: number;
    briefing: string[];
}

interface ValueChainListProps {
    ticker: string;
    events: StreamEvent[];
    connected: boolean;
}

import { useEffect, useRef, useContext } from 'react';
import { NewsEventContext } from '@/routes/__root';

export const ValueChainList = ({ ticker, events, connected }: ValueChainListProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { activeDate } = useContext(NewsEventContext);

    useEffect(() => {
        if (!activeDate || !containerRef.current || !events || events.length === 0) return;

        const targetNorm = activeDate.replace(/[^0-9]/g, '');
        if (targetNorm.length !== 8) return;

        const childNodes = containerRef.current.querySelectorAll('[data-news-date]');
        let bestMatchNode: HTMLDivElement | null = null;
        let bestDiff = Infinity;

        childNodes.forEach((node) => {
            const nodeDate = node.getAttribute('data-news-date');
            if (!nodeDate) return;
            const nodeNorm = nodeDate.replace(/[^0-9]/g, '');
            if (nodeNorm.length < 8) return;

            const dateVal = parseInt(nodeNorm.substring(0, 8), 10);
            const targetVal = parseInt(targetNorm, 10);
            const diff = Math.abs(dateVal - targetVal);

            if (diff < bestDiff) {
                bestDiff = diff;
                bestMatchNode = node as HTMLDivElement;
            }
        });

        if (bestMatchNode && bestDiff < 30) {
            const container = containerRef.current;
            const targetOffset = (bestMatchNode as HTMLDivElement).offsetTop;
            container.scrollTo({
                top: targetOffset - 16,
                behavior: 'smooth'
            });
        }
    }, [activeDate, events]);
    if (!connected && events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[320px] text-slate-400 gap-[16px] bg-slate-50/30 rounded-2xl border border-dashed border-slate-200/60 p-[24px] backdrop-blur-sm transition-all duration-300">
                {/* 심플한 미니 도트 형태의 로딩/대기 시각 인디케이터 */}
                <div className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
                </div>

                <div className="flex flex-col items-center gap-[6px] text-center">
                    <span className="font-bold text-slate-700 text-sm">실시간 알림 통로 연결 중</span>
                    <span className="text-[11px] text-slate-400/90 leading-relaxed max-w-[240px]">
                        [{ticker.toUpperCase()}] 종목과 관련된 글로벌 실시간 속보 피드를 대기하고 있습니다.
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative flex flex-col gap-4 py-2 w-full animate-fadeIn overflow-x-hidden scrollbar-hide">
            {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[180px] text-slate-400 bg-slate-50/20 rounded-xl border border-slate-100 p-6 text-center">
                    <span className="text-xs text-slate-500 font-medium">연관 속보가 존재하지 않습니다.</span>
                    <span className="text-[10px] text-slate-400 mt-1">이 종목에 예정된 주요 속보 이슈가 없습니다.</span>
                </div>
            ) : (
                events.map((event, idx) => {
                    const isImpact = event.type === 'REALTIME_IMPACT';
                    
                    return (
                        <div
                            key={idx}
                            id={`news-card-${event.date}`}
                            data-news-date={event.date}
                            className="group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md rounded-2xl p-5 border bg-white/80 backdrop-blur-md border-slate-200/60 hover:border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.01)]"
                        >
                            {/* 카드 관계 배지 영역 */}
                            <div className="flex justify-between items-center mb-3">
                                {isImpact ? (
                                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        실시간 속보
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                        주요 일정
                                    </span>
                                )}

                                {/* 뉴스 발행 날짜 표기 */}
                                <span className="text-[10px] font-bold text-slate-400">
                                    {event.date}
                                </span>
                            </div>

                            {/* 카드 제목 */}
                            <h4 className="font-bold text-slate-800 text-xs mb-3.5 leading-snug tracking-tight">
                                {event.title}
                            </h4>

                            {/* 3줄 분석 내용 리스트 */}
                            <ul className="flex flex-col gap-2.5">
                                {event.briefing.map((bullet, bIdx) => (
                                    <li 
                                        key={bIdx} 
                                        className="text-[11px] text-slate-600 leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[4px] before:h-[4px] before:rounded-full before:bg-slate-400"
                                    >
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })
            )}
        </div>
    );
};

