import { useState, useEffect, useRef, useContext } from 'react';
import { useTickerNews, type TickerNewsDto } from '@/features/stock-news/hooks/useTickerNews';
import { NewsEventContext } from '@/routes/__root';

interface TickerNewsListProps {
  ticker: string;
}

/**
 * [Light Theme] 특정 종목 관련 뉴스를 가져와 피드로 렌더링하는 위젯 컴포넌트
 */
export const TickerNewsList = ({ ticker }: TickerNewsListProps) => {
  const { data: newsList, isLoading, isError, error } = useTickerNews(ticker);
  const [selectedNews, setSelectedNews] = useState<TickerNewsDto | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { activeDate } = useContext(NewsEventContext);

  useEffect(() => {
    if (!activeDate || !containerRef.current || !newsList || newsList.length === 0) return;

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
  }, [activeDate, newsList]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <span className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin"></span>
        <span className="text-xs">관련 뉴스를 검색하는 중...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-rose-500 bg-rose-50 rounded-xl border border-rose-100 text-center">
        <span className="text-xs font-bold mb-1">뉴스 조회 중 오류 발생</span>
        <span className="text-[10px] text-rose-400">{(error as Error)?.message}</span>
      </div>
    );
  }

  if (!newsList || newsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center text-xs text-slate-400 italic">
        검색된 종목 뉴스가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full text-slate-800 select-text">
      
      {/* 뉴스 목록 리스트 */}
      <div ref={containerRef} className="relative flex-1 overflow-y-auto flex flex-col pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] divide-y divide-slate-100">
        {newsList.map((news) => (
          <div
            key={news.id}
            data-news-date={news.date}
            onClick={() => {
              if (news.link) {
                window.open(news.link, '_blank', 'noopener,noreferrer');
              } else {
                setSelectedNews(news);
              }
            }}
            className="py-5 cursor-pointer group"
          >
            <div className="text-sm font-semibold text-foreground group-hover:text-trend-down-500 transition-colors duration-200 line-clamp-2 mb-3">
              {news.title}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-secondary">
              <span className="font-medium text-secondary">{news.source}</span>
              <span>•</span>
              <span>
                {news.date && `${news.date} `}
                {news.time && news.time.includes(':')
                  ? news.time
                  : news.time && news.time.length >= 4
                    ? `${news.time.substring(0, 2)}:${news.time.substring(2, 4)}`
                    : news.time || '--:--'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 뉴스 상세 모달 레이어 */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">종목 뉴스 상세 보기</h2>
              <button
                onClick={() => setSelectedNews(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 text-lg cursor-pointer transition"
              >
                &times;
              </button>
            </div>
            
            {/* 모달 본문 */}
            <div className="p-8 overflow-y-auto flex flex-col gap-5 text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <h3 className="text-xl font-bold text-slate-900 leading-relaxed">
                {selectedNews.title}
              </h3>
              <div className="flex items-center gap-2 text-[12px] text-slate-400 font-semibold border-b border-slate-100 pb-3.5">
                <span>언론사: {selectedNews.source}</span>
                <span>|</span>
                <span>일시: {selectedNews.date} {selectedNews.time}</span>
              </div>
              <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap font-medium">
                {selectedNews.description}
              </p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="p-4 border-t border-slate-50 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 text-sm cursor-pointer transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
