import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { ValueChainList } from '../value-chain/ValueChainList'
import { NewsFeed } from './NewsFeed'
import { TickerNewsList } from './TickerNewsList'
import Selector, { type SelectorOption } from '@/shared/ui/selector/Selector'
import { useNewsEvent } from '@/features/stock-news/provider/NewsEventProvider'

const tabOptions: SelectorOption<'STREAM' | 'NEWS'>[] = [
  { value: 'NEWS', label: '종목 뉴스' },
  { value: 'STREAM', label: '글로벌 속보' }
];

export const RightNewsPanel = () => {
  const { ticker } = useParams({ strict: false }) as { ticker?: string };
  const { events, connected, isChartVisible = true } = useNewsEvent();
  const [activeTab, setActiveTab] = useState<'STREAM' | 'NEWS'>('NEWS');

  useEffect(() => {
    setActiveTab('NEWS');
  }, [ticker]);

  return (
    <div 
      style={{
        height: isChartVisible ? 'calc(100vh - 113px)' : 'calc(100vh - 171px)'
      }}
      className="w-[340px] bg-primary flex flex-col p-6 mr-[24px] mb-[24px] rounded-lg border border-slate-200/40 shadow-md overflow-hidden transition-all duration-300 ease-in-out mt-[24px]"
    >
      {ticker ? (
        <>
          <div className="mb-5">
            <Selector
              options={tabOptions}
              selected={activeTab}
              onSelect={setActiveTab}
              className="w-full"
              itemClassName="flex-1 text-center"
            />
          </div>

          {activeTab === 'STREAM' ? (
            <>
              <div className="flex flex-col gap-1 mb-5">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  실시간 글로벌 속보 피드
                </h3>
                <p className="text-[10px] text-slate-400">해외 공시 및 외신 실시간 AI 요약 스트리밍</p>
              </div>

              <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
                <ValueChainList
                  ticker={ticker}
                  events={events}
                  connected={connected}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
              <TickerNewsList ticker={ticker} />
            </div>
          )}
        </>
      ) : (
        <NewsFeed />
      )}
    </div>
  );
};
