import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchNewsList } from '@/entities/stock/api/fetchNews';
import { useState, useEffect, useRef } from 'react';

/**
 * 실시간 해외 속보 피드 위젯 (무한 스크롤 적용)
 */
export const NewsFeed = () => {
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤을 위한 useInfiniteQuery 사용
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['stocks', 'news'],
    queryFn: ({ pageParam }) => fetchNewsList(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      // 마지막 페이지의 마지막 아이템의 ID(srno)를 다음 페이지 호출 시 파라미터로 사용
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    // 최신 뉴스를 위해 첫 페이지는 주기적으로 자동 갱신 가능 (선택 사항)
    // refetchInterval: 60000, 
  });

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

  if (isLoading) return <div className="p-4 text-slate-400">뉴스를 불러오는 중...</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          실시간 해외 속보
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {data?.pages.map((page) =>
          page.map((news) => (
            <div 
              key={news.id} 
              onClick={() => handleNewsClick(news.title)}
              className="p-4 cursor-pointer hover:bg-blue-50 transition-colors group"
            >
              <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 line-clamp-2 mb-2">
                {news.title}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="font-medium text-slate-500">{news.source}</span>
                <span>•</span>
                <span>{news.time.substring(0, 2)}:{news.time.substring(2, 4)}</span>
                <div className="flex gap-1 ml-auto">
                  {news.tickers.map(ticker => (
                    <span 
                      key={ticker} 
                      className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      ${ticker}
                    </span>
                  ))}
                </div>
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
