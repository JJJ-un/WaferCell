import Card from "@/shared/ui/card/Card";

interface RsiIndicatorProps {
  rsi?: number; // 0 ~ 100 사이의 값
}

export const RsiIndicator = ({ rsi = 50 }: RsiIndicatorProps) => {
  // 1. 상태 및 색상 정의
  const isOverbought = rsi >= 70; // 과매수 (위험/고점)
  const isOversold = rsi <= 30;   // 과매도 (기회/저점)
  
  const getRsiColor = () => {
    if (isOverbought) return '#f87171'; // Red-400
    if (isOversold) return '#60a5fa';   // Blue-400
    return '#34d399';                  // Emerald-400 (안정)
  };

  const rsiColor = getRsiColor();

  return (
    <Card className="w-[260px] h-[170px] p-5 flex flex-col justify-between bg-primary border-slate-800/60 backdrop-blur-lg">
      <header className="flex justify-between items-end pb-2 border-b border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">심리 지표</span>
          <span className="text-[9px] text-slate-500 font-medium">Relative Strength Index</span>
        </div>
        <div 
          className="text-2xl font-black tracking-tighter transition-all duration-500"
          style={{ 
            color: rsiColor,
            textShadow: `0 0 15px ${rsiColor}44`
          }}
        >
          {rsi.toFixed(1)}<span className="text-xs ml-0.5 opacity-70 font-medium text-slate-400">pt</span>
        </div>
      </header>

      <section className="py-4">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-2">
          <span className={isOversold ? 'text-blue-400' : 'text-slate-500'}>Oversold</span>
          <span className="text-slate-400">Neutral</span>
          <span className={isOverbought ? 'text-red-400' : 'text-slate-500'}>Overbought</span>
        </div>

        {/* RSI 게이지 바 */}
        <div className="relative h-3 w-full bg-bg rounded-full border border-slate-800/40 shadow-inner overflow-hidden">
          {/* 안전 영역 배경 (30% ~ 70%) */}
          <div className="absolute left-[30%] right-[30%] h-full bg-white/5" />
          
          {/* 30, 70 지점 구분선 */}
          <div className="absolute left-[30%] top-0 w-px h-full bg-slate-700/50 z-10" />
          <div className="absolute left-[70%] top-0 w-px h-full bg-slate-700/50 z-10" />
          
          {/* 실제 RSI 바 */}
          <div 
            className="absolute left-0 h-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ 
              width: `${rsi}%`,
              backgroundColor: rsiColor,
              boxShadow: `0 0 15px ${rsiColor}66`
            }}
          />
        </div>

        <div className="flex justify-between text-[7px] text-slate-600 mt-1.5 uppercase font-bold tracking-tighter">
          <span>0</span>
          <span>30</span>
          <span>50</span>
          <span>70</span>
          <span>100</span>
        </div>
      </section>

      <footer className="text-[10px] text-center font-medium text-slate-500 italic">
        {isOverbought ? (
          <span className="text-red-400">시장이 과열되었습니다. 조정 가능성에 유의하세요.</span>
        ) : isOversold ? (
          <span className="text-blue-400">과도한 매도세가 발생했습니다. 반등을 기대할 수 있습니다.</span>
        ) : (
          <span>현재 시장 심리가 안정적인 구간에 있습니다.</span>
        )}
      </footer>
    </Card>
  );
};