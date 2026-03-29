import Card from "@/shared/ui/card/Card";

interface TradingValueIndicatorProps {
  tradingValue?: number;       // 현재 누적 거래대금 (원)
  tradingValueRatio?: number;   // 평소 대비 거래대금 비율 (%)
}

export const TradingValueIndicator = ({ 
  tradingValue = 10000000000, 
  tradingValueRatio = 300 
}: TradingValueIndicatorProps) => {
  // 1. 거래대금 '억' 단위 환산 (소수점 1자리까지)
  const amountInEok = tradingValue / 100_000_000;
  
  // 2. 상태 정의 (100% 돌파 시 활성, 200% 돌파 시 폭발)
  const isActive = tradingValueRatio >= 100;
  const isExplosive = tradingValueRatio >= 200;

  // 3. 색상 로직 (디자인 시스템 변수 활용)
  const getStatusColor = () => {
    if (isExplosive) return 'var(--color-trend-up-700)'; // 강렬한 레드
    if (isActive) return '#f59e0b'; // 활기찬 Amber
    return 'var(--color-slate-500)'; // 정적인 슬레이트
  };

  const statusColor = getStatusColor();

  return (
    <Card className="w-[260px] h-[170px] p-5 flex flex-col justify-between bg-primary border-slate-800/60 backdrop-blur-lg">
      <header className="flex justify-between items-end pb-2 border-b border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">거래대금</span>
          <span className="text-[9px] text-slate-500 font-medium">Trading Value</span>
        </div>
        <div 
          className="text-2xl font-black tracking-tighter text-slate-100 transition-all duration-500"
          style={{ 
            textShadow: isActive ? `0 0 20px ${statusColor}44` : 'none'
          }}
        >
          {amountInEok.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          <span className="text-xs ml-0.5 opacity-70 font-medium text-slate-400">억</span>
        </div>
      </header>

      <section className="py-4">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-2">
          <span className="text-slate-500">평균 대비 강도</span>
          <span 
            style={{ color: statusColor }} 
            className="transition-colors duration-500 font-bold"
          >
            {tradingValueRatio.toFixed(1)}%
          </span>
        </div>

        {/* 게이지 바: 200% 스케일 (중앙 50% 지점이 평소 거래량인 100%) */}
        <div className="relative h-3 w-full bg-bg rounded-full border border-slate-800/40 shadow-inner overflow-hidden">
          {/* 100% (평균) 지점 가이드 라인 */}
          <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white/20 z-10" />
          
          {/* 실제 채워지는 게이지 바 */}
          <div 
            className="absolute left-0 h-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ 
              width: `${Math.min(tradingValueRatio / 2, 100)}%`, 
              backgroundColor: statusColor,
              boxShadow: isActive ? `0 0 15px ${statusColor}66` : 'none'
            }}
          />
        </div>

        <div className="flex justify-between text-[7px] text-slate-600 mt-1.5 uppercase font-bold tracking-tighter">
          <span>0%</span>
          <span className="text-slate-500">100% (Average)</span>
          <span>200%+</span>
        </div>
      </section>

      <footer className="text-[10px] text-center font-medium text-slate-500 italic">
        {isExplosive ? (
          <span className="text-red-400 animate-pulse">⚠️ 역대급 자금 유입! 시장의 주목을 받고 있습니다</span>
        ) : isActive ? (
          <span className="text-amber-400">평균치를 상회하며 에너지가 응집되고 있습니다</span>
        ) : (
          <span>현재 평소와 비슷한 수준의 거래가 진행 중입니다</span>
        )}
      </footer>
    </Card>
  );
};