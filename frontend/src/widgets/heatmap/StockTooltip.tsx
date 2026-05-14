import { type StockSnapshot } from "@/entities/stock/types/stock.types";

export interface StockProps {
    data: StockSnapshot;
    x?: number; 
    y?: number; 

}

/**
 * 숫자를 K, M, B 단위로 포맷팅
 */
const formatUnit = (num: number | undefined): string => {
    if (num === undefined) return '-';
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
};

/**
 * 통화 포맷팅 (달러)
 */
const formatCurrency = (num: number | undefined): string => {
    if (num === undefined || num === 0) return '-';
    return '$' + num.toLocaleString();
};

export const StockTooltip = ({ data, x, y }: StockProps) => {
    const { base, price } = data;
    // 상태에 따른 컬러 변수 추출
    const isUp = price.changePercent > 0;
    const isDown = price.changePercent < 0;
    const statusColor = isUp ? 'text-red-400' : isDown ? 'text-blue-400' : 'text-slate-400';

    return (
        <div 
            className="fixed z-[1000] bg-slate-900/95 border border-slate-500 rounded-xl p-4 text-slate-100 shadow-2xl shadow-black/50 min-w-[200px] pointer-events-none backdrop-blur-sm"
            style={{ 
                left: x ? `${x + 15}px` : 'auto', 
                top: y ? `${y + 15}px` : 'auto' 
            }}
        >
            {/* 헤더: 티커 */}
            <div className="flex justify-between items-center font-black text-xl mb-3 border-b border-slate-700 pb-2">
                <span>{base.ticker}</span>
                <span className={`text-[0.9rem] ${statusColor}`}>
                    {isUp ? '▲' : isDown ? '▼' : '-'}
                </span>
            </div>

            {/* 기본 정보 */}
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">현재가</span>
                    <span className="font-bold">{formatCurrency(price.price)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">등락률</span>
                    <span className={`font-bold ${statusColor}`}>
                        {isUp ? '+' : ''}{price.changePercent.toFixed(2)}%
                    </span>
                </div>

                <hr className="border-none border-t border-slate-700 my-2" />

                <div className="flex justify-between">
                    <span className="text-slate-400">전일</span>
                    <span className="font-bold text-slate-300">{formatCurrency(price.prevClose)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">저가/고가</span>
                    <span className="font-bold text-slate-300">{formatUnit(price.lowPrice)} / {formatUnit(price.highPrice)}</span>
                </div>

                <hr className="border-none border-t border-slate-700 my-2" />

                <div className="flex justify-between">
                    <span className="text-slate-400">거래량</span>
                    <span className="font-bold">{formatUnit(price.volume)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">시가총액</span>
                    <span className="font-bold">{formatUnit(base.marketCap)}</span>
                </div>
            </div>
        </div>
    );
}