import { useState } from 'react';
import { useAiAnalysisMutation } from '@/features/stock-ai/hooks/useAiAnalysisMutation';

const AI_KEYWORDS = [
  "갑작스런 급등락일 원인 분석",
  "주가 상승·하락 패턴 진단",
  "기술지표 예측과 반대로 움직인 예외일 분석"
];

export const StockAiPanel = ({ ticker }: { ticker: string }) => {
  const [currentKeyword, setCurrentKeyword] = useState<string | null>(null);
  const { mutate, data, isPending } = useAiAnalysisMutation();

  const handleTagClick = (keyword: string) => {
    setCurrentKeyword(keyword);
    mutate({ ticker, keyword });
  };

  return (
    <div className="bg-primary border border-slate-200/60 rounded-xl p-6 flex flex-col gap-4 shadow-lg">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          AI 애널리스트
        </h3>
        <p className="text-xs text-slate-400">데이터 기반 분석을 원하는 테마 태그를 클릭하세요.</p>
      </div>

      {/* 키워드 태그 스위치 버튼 배열 */}
      <div className="flex flex-wrap gap-2">
        {AI_KEYWORDS.map((kw) => {
          const isSelected = currentKeyword === kw;
          return (
            <button
              key={kw}
              onClick={() => handleTagClick(kw)}
              disabled={isPending}
              className={`px-4 py-2 text-xs font-semibold rounded-full border border-slate-200/60 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected 
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500 font-bold shadow-md shadow-blue-500/10' 
                  : ' text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              {kw}
            </button>
          );
        })}
      </div>

      {/* 💡 핵심: 외부 라이브러리 없이 순수 HTML 컴포넌트로만 구조화 렌더링 수행 */}
      <div className="mt-2 border border-slate-200/60 rounded-xl p-5 min-h-[150px] flex flex-col justify-center">
        {isPending ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400 animate-pulse">
              증권사 공식 데이터와 연계 뉴스 타임라인 동적 분석 중...
            </span>
          </div>
        ) : data?.sections && data.sections.length > 0 ? (
          <div className="flex flex-col gap-5 select-text">
            {data.sections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                {/* AI가 정해준 소제목을 리액트 테마 가이드에 맞춰 예쁘게 바인딩 */}
                <h4 className="text-sm font-bold text-blue-400 border-l-2 border-blue-500 pl-2">
                  {section.title}
                </h4>
                
                {/* 하위 불릿 포인트 배열을 리스트 컴포넌트로 렌더링 */}
                <ul className="list-disc pl-5 text-xs text-black flex flex-col gap-1.5 leading-relaxed">
                  {section.bulletPoints.map((point, pIdx) => (
                    <li key={pIdx} className="marker:text-blue-500/70">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500 py-8 italic">
            분석 리포트를 확인하려면 상단의 실시간 태그 중 하나를 탭해 주세요.
          </div>
        )}
      </div>
    </div>
  );
};