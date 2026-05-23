import { useState, useEffect, useRef } from 'react';
import { useNewsQuery } from '@/shared/model/hooks/useNewsQuery';

export const NewsFeed = () => {
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useNewsQuery();

  // 스크롤 감지를 위한 Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleNewsClick = (content: string) => {
    setSelectedNews(content);
  };

  if (isLoading) return <div className="flex items-center justify-center w-full p-4 text-slate-400">뉴스를 불러오는 중...</div>;

  return (
    <div className="flex flex-col w-full rounded-lg overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-foreground text-[24px] flex items-center gap-2">
          실시간 해외 속보
        </h3>
        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {data?.pages.map((page) =>
          page.map((news) => (
            <div 
              key={news.id} 
              onClick={() => handleNewsClick(news.title)}
              className="py-4 cursor-pointer group"
            >
              <div className="text-sm font-semibold text-foreground group-hover:text-trend-down-500 transition-colors duration-200 line-clamp-2 mb-2">
                {news.title}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-secondary">
                <span className="font-medium text-secondary">{news.source}</span>
                <span>•</span>
                <span>
                  {news.time && news.time.length >= 4 
                    ? `${news.time.substring(0, 2)}:${news.time.substring(2, 4)}` 
                    : news.time || '--:--'}
                </span>
              </div>
            </div>
          ))
        )}
        
        {/* 무한 스크롤 바닥 감지 포인트 */}
        <div ref={observerRef} className="p-4 flex justify-center">
          {isFetchingNextPage ? (
            <span className="text-xs text-slate-400 animate-pulse">과거 뉴스 불러오는 중...</span>
          ) : hasNextPage ? (
            <span className="text-xs text-slate-300">스크롤하여 더 보기</span>
          ) : (
            <span className="text-xs text-slate-300">마지막 뉴스입니다.</span>
          )}
        </div>
      </div>

      {/* 뉴스 상세 모달 */}
      {selectedNews && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">속보 상세 내용</h2>
              <button onClick={() => setSelectedNews(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500">&times;</button>
            </div>
            <div className="p-8 overflow-y-auto">
              <div className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {selectedNews}
              </div>
            </div>
            <div className="p-4 border-t border-slate-50 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedNews(null)} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
