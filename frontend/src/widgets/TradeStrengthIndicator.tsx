import Card from "@/shared/ui/card/Card";

// 무조건 들어와야하는거 아닌가?
interface TradeStrengthIndicatorProps {
  strength: number;
}

const STRENGTH_BASE = 100;
const MAX_OFFSET = 50; 

export const TradeStrengthIndicator = ({ strength }: TradeStrengthIndicatorProps) => {
  // 50% ~ 150% 범위를 0 ~ 100% 비율로 변환
  const bullishRatio = Math.min(Math.max(((strength - (STRENGTH_BASE - MAX_OFFSET)) / (MAX_OFFSET * 2)) * 100, 0), 100);
  
  const isBullish = strength >= STRENGTH_BASE;
  
  // 색상 변수 정의
  const bullColor = 'var(--color-trend-up-700)';
  const bearColor = 'var(--color-trend-down-700)';
  const activeColor = isBullish ? bullColor : bearColor;

  return (
    <Card className="w-[260px] h-[170px] p-5 flex flex-col justify-between bg-primary border-slate-800/60 backdrop-blur-lg">
      <header className="flex justify-between items-end pb-2 border-b border-slate-800/50">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">체결 강도</span>
        <div 
          className="text-2xl font-black tracking-tighter transition-colors duration-500"
          style={{ 
            color: activeColor,
            textShadow: `0 0 15px ${isBullish ? 'rgba(220, 38, 38, 0.4)' : 'rgba(29, 78, 216, 0.4)'}` 
          }}
        >
          {strength.toFixed(1)}<span className="text-xs ml-0.5 opacity-70">%</span>
        </div>
      </header>

      <section className="py-4">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter mb-2">
          <span className={!isBullish ? bearColor : 'text-slate-500'}>Bearish</span>
          <span className="text-slate-400">Neutral</span>
          <span className={isBullish ? bullColor : 'text-slate-500'}>Bullish</span>
        </div>

        {/* 게이지 컨테이너: 배경은 파란색(Bearish) */}
        <div 
          className="relative h-3 w-full rounded-full border border-slate-800/40 shadow-inner overflow-hidden"
          style={{ backgroundColor: bearColor }}
        >
          {/* 상승세 영역: 오른쪽에서 왼쪽으로 차오름 (경계선 이동 방식) */}
          <div 
            className="absolute right-0 h-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ 
              width: `${bullishRatio}%`,
              backgroundColor: bullColor,
              // 우세한 쪽에 광원 효과 추가
              boxShadow: isBullish ? `-10px 0 20px rgba(220, 38, 38, 0.5)` : 'none'
            }}
          />
          
          {/* 중앙 가이드 라인 (Neutral 지점) */}
          <div className="absolute left-1/2 top-0 w-0.5 h-full bg-secondary z-10" />
        </div>
      </section>

      <footer className="text-[10px] text-center font-medium text-slate-500 italic">
        {isBullish 
          ? '매수세가 시장 에너지를 주도하고 있습니다' 
          : '매도세가 시장 에너지를 압도하고 있습니다'}
      </footer>
    </Card>
  );
};