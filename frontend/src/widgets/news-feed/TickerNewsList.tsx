import { useState } from 'react';
import { useTickerNews, type TickerNewsDto } from '@/features/stock-news/hooks/useTickerNews';

interface TickerNewsListProps {
  ticker: string;
}

/**
 * [Light Theme] 특정 종목 관련 뉴스를 가져와 피드로 렌더링하는 위젯 컴포넌트
 */
export const TickerNewsList = ({ ticker }: TickerNewsListProps) => {
  const { data: newsList, isLoading, isError, error } = useTickerNews(ticker);
  const [selectedNews, setSelectedNews] = useState<TickerNewsDto | null>(null);

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
      <div className="flex-1 overflow-y-auto flex flex-col pr-1 scrollbar-hide divide-y divide-slate-100">
        {newsList.map((news) => (
          <div
            key={news.id}
            onClick={() => setSelectedNews(news)}
            className="py-3.5 first:pt-0 last:pb-0 cursor-pointer group"
          >
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition duration-150 line-clamp-2 leading-relaxed mb-1.5">
              {news.title}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2 font-normal">
              {news.description}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
              <span>{news.source}</span>
              <span>•</span>
              <span>
                {news.date} {news.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 뉴스 상세 모달 레이어 */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[75vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xs font-black text-slate-800">종목 뉴스 상세 보기</h2>
              <button
                onClick={() => setSelectedNews(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 text-sm cursor-pointer transition"
              >
                ✕
              </button>
            </div>
            
            {/* 모달 본문 */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4 text-left">
              <h3 className="text-sm font-extrabold text-slate-900 leading-relaxed">
                {selectedNews.title}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-3.5">
                <span>언론사: {selectedNews.source}</span>
                <span>|</span>
                <span>일시: {selectedNews.date} {selectedNews.time}</span>
              </div>
              <p className="text-slate-650 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                {selectedNews.description}
              </p>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 text-xs cursor-pointer transition shadow-xs"
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
