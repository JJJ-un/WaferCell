import { type Stock } from "@/shared/types/Semiconductor"

export interface StockProps {
    data: Stock;
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

export const StockTooltip = ({ data }: StockProps) => {
    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #475569',
            borderRadius: '12px',
            padding: '16px',
            color: '#f1f5f9',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            minWidth: '200px',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)'
        }}>
            {/* 헤더: 티커 */}
            <div style={{ 
                fontWeight: '900', 
                fontSize: '1.25rem', 
                marginBottom: '12px', 
                borderBottom: '1px solid #334155', 
                paddingBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>{data.ticker}</span>
                <span style={{ 
                    fontSize: '0.9rem', 
                    color: data.changePercent > 0 ? '#f87171' : data.changePercent < 0 ? '#60a5fa' : '#94a3b8' 
                }}>
                    {data.changePercent > 0 ? '▲' : data.changePercent < 0 ? '▼' : '-'}
                </span>
            </div>

            {/* 기본 정보 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>현재가</span>
                    <span style={{ fontWeight: '700' }}>{formatCurrency(data.price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>등락률</span>
                    <span style={{ 
                        fontWeight: '700', 
                        color: data.changePercent > 0 ? '#f87171' : data.changePercent < 0 ? '#60a5fa' : '#f1f5f9' 
                    }}>
                        {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                    </span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '8px 0' }} />

                {/* 고급 지표 3종 세트 */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>체결강도</span>
                    <span style={{ fontWeight: '700', color: (data.strength || 0) > 100 ? '#f87171' : '#f1f5f9' }}>
                        {data.strength ? data.strength.toFixed(1) + '%' : '-'}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>거래강도</span>
                    <span style={{ fontWeight: '700' }}>
                        {data.volumeIntensity ? data.volumeIntensity.toFixed(2) + '%' : '-'}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>거래대금</span>
                    <span style={{ fontWeight: '700' }}>{formatCurrency(data.tradingValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>누적거래량</span>
                    <span style={{ fontWeight: '700' }}>{formatUnit(data.volume)}</span>
                </div>
            </div>
        </div>
    );
}
