import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useJournalQueries, type JournalResponseDto } from '@/features/stock-journal/hooks/useJournalQueries';
import { useJournalMutations } from '@/features/stock-journal/hooks/useJournalMutations';
import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import CalmIcon from "@/shared/asset/icons/calm.svg?react";
import GreedIcon from "@/shared/asset/icons/greed.svg?react";
import FearIcon from "@/shared/asset/icons/fear.svg?react";
import GoodIcon from "@/shared/asset/icons/good.svg?react";
import { JournalCalendar } from '@/widgets/journal/JournalCalendar';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';

const FEELING_META = {
  CALM: { icon: GoodIcon, label: '차분함', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', barColor: '#3b82f6' },
  GREEDY: { icon: GreedIcon, label: '탐욕', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', barColor: '#10b981' },
  FEAR: { icon: FearIcon, label: '공포', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', barColor: '#f43f5e' },
  NEUTRAL: { icon: CalmIcon, label: '평온', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-300', barColor: '#64748b' }
};

/**
 * [한글화 적용] 전체 종목의 매매 일지를 타임라인 피드로 모아보고, 감정 비중 통계를 시각화하는 My Diary 페이지 컴포넌트
 */
export const DiaryPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const {
    allJournals,
    isAllLoading,
    refetchAll,
    infiniteJournals,
    isInfiniteLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useJournalQueries();

  const [animate, setAnimate] = useState(false);
  const { deleteJournal } = useJournalMutations();

  // 필터링 관련 상태
  const [filterTicker, setFilterTicker] = useState<string>('ALL');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterFeeling, setFilterFeeling] = useState<string>('ALL');

  // 티커 검색 쿼리 상태
  const [tickerSearchQuery, setTickerSearchQuery] = useState('');

  // 활성 티커 목록 추출
  const activeTickers = useMemo<string[]>(() => {
    return Array.from(new Set(allJournals.map((j) => j.ticker))).sort();
  }, [allJournals]);

  // 필터링 적용된 저널 목록 계산
  const filteredJournals = useMemo(() => {
    return allJournals.filter((journal) => {
      const matchTicker = filterTicker === 'ALL' || journal.ticker === filterTicker;
      const matchAction = filterAction === 'ALL' || journal.actionType === filterAction;
      const matchFeeling = filterFeeling === 'ALL' || journal.feeling === filterFeeling;
      return matchTicker && matchAction && matchFeeling;
    });
  }, [allJournals, filterTicker, filterAction, filterFeeling]);

  const isFiltered = filterTicker !== 'ALL' || filterAction !== 'ALL' || filterFeeling !== 'ALL';

  // 무한스크롤 IntersectionObserver 관측 대상 ref
  const observerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainerRef.current,
      rootMargin: '100px',
      threshold: 0,
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [handleObserver]);

  // 감정 비율 계산 (전체 데이터 기준 - allJournals 사용)
  const total = allJournals.length;
  const counts = allJournals.reduce((acc, journal) => {
    acc[journal.feeling] = (acc[journal.feeling] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const calmPct = total > 0 ? Math.round(((counts['CALM'] || 0) / total) * 100) : 0;
  const greedyPct = total > 0 ? Math.round(((counts['GREEDY'] || 0) / total) * 100) : 0;
  const fearPct = total > 0 ? Math.round(((counts['FEAR'] || 0) / total) * 100) : 0;
  const neutralPct = total > 0 ? Math.round(((counts['NEUTRAL'] || 0) / total) * 100) : 0;

  // SVG 도넛 차트 렌더링에 필요한 속성값 정의
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 약 314.16

  const getStrokeDash = (pct: number) => {
    const strokeLength = (pct / 100) * circumference;
    const spaceLength = circumference - strokeLength;
    return `${strokeLength} ${spaceLength}`;
  };

  useEffect(() => {
    if (total > 0) {
      const timer = setTimeout(() => {
        setAnimate(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [total]);

  const currentFearPct = animate ? fearPct : 0;
  const currentGreedyPct = animate ? greedyPct : 0;
  const currentCalmPct = animate ? calmPct : 0;
  const currentNeutralPct = animate ? neutralPct : 0;

  // 감정 점수에 따른 AI 애널리스트 투자 코멘트 생성
  const getAiMessage = () => {
    if (total === 0) return '일지를 작성하면 오늘의 투자 심리를 AI 애널리스트가 실시간 진단해 드립니다.';

    const maxFeeling = Object.entries(counts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    switch (maxFeeling) {
      case 'GREEDY':
        return '현재 투자 성향에 탐욕(Greedy) 경향이 강하게 지배하고 있습니다. 최근 급등한 팹리스/파운드리 종목의 추격 매수로 인한 오버 슈팅 리스크가 없는지 분석 리포트를 재점검하고 현금 비중을 유지하는 편이 이롭습니다.';
      case 'FEAR':
        return '시장 악재 기사로 인해 공포(Fear) 상태에서의 투매 및 패닉 셀링 비율이 높은 한 달입니다. 공급망 리스크는 일시적인 병목 현상인 경우가 많으니 차분하게 기업 가치 펀더멘털을 재진단해 보시기 바랍니다.';
      case 'CALM':
        return '차분함(Calm)을 기반으로 원칙을 지키며 대단히 이성적인 투자를 이어가고 계십니다. 밸류체인 일정에 맞춘 분할 매수/매도 기법이 잘 작동하고 있으며, 현재의 안정적인 페이스를 유지하십시오.';
      default:
        return '평온함(Neutral)을 잘 유지하고 있습니다. 시장의 노이즈에 휩쓸리지 않고 묵묵히 밸류체인 의존도를 모니터링하며 장기적인 관점에서 매매 시점을 기다리는 훌륭한 자세를 보이고 있습니다.';
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 시의 상세 페이지 이동 방지
    if (!confirm('이 일지를 정말 삭제하시겠습니까?')) return;
    try {
      await deleteJournal(id);
      refetchAll();
    } catch (err) {
      console.error('일지 삭제 실패', err);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 min-h-screen text-slate-800 bg-[#FAFBFD] select-text">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* 좌측 영역: 통계 및 AI Insights */}
        <div className="flex-1 lg:max-w-[400px] flex flex-col gap-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col items-center gap-5">
            <h3 className="text-sm font-semibold text-slate-700 self-start">이달의 투자 감정 분석</h3>

            {total > 0 ? (
              <div className="relative flex items-center justify-center w-48 h-48">
                {/* SVG 기반의 도넛 차트 */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#E5E7EB" strokeWidth="12" />

                  {/* 공포 (Rose) */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f43f5e" strokeWidth="12"
                    strokeDasharray={getStrokeDash(currentFearPct)}
                    strokeDashoffset={0}
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />

                  {/* 탐욕 (Emerald) */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#10b981" strokeWidth="12"
                    strokeDasharray={getStrokeDash(currentGreedyPct)}
                    strokeDashoffset={-(currentFearPct / 100) * circumference}
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />

                  {/* 차분함 (Blue) */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#3b82f6" strokeWidth="12"
                    strokeDasharray={getStrokeDash(currentCalmPct)}
                    strokeDashoffset={-((currentFearPct + currentGreedyPct) / 100) * circumference}
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />

                  {/* 평온 (Slate) */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#64748b" strokeWidth="12"
                    strokeDasharray={getStrokeDash(currentNeutralPct)}
                    strokeDashoffset={-((currentFearPct + currentGreedyPct + currentCalmPct) / 100) * circumference}
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-slate-800">{total}건</span>
                  <span className="text-[10px] text-slate-400">누적 매매 일지</span>
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 rounded-full border border-dashed border-slate-200 flex items-center justify-center text-center p-6 text-xs text-slate-400">
                기록된 투자 일지가 없습니다.
              </div>
            )}

            {/* 범례 가이드 */}
            <div className="w-full grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                <span className="text-slate-600 font-bold">차분함 ({calmPct}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-slate-600 font-bold">탐욕 ({greedyPct}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="text-slate-600 font-bold">공포 ({fearPct}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-500 inline-block"></span>
                <span className="text-slate-600 font-bold">평온 ({neutralPct}%)</span>
              </div>
            </div>
          </div>

          {/* AI 감정 Insights */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <h4>AI 심리 분석 및 피드백</h4>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed bg-slate-50 border border-slate-200/60 p-4 rounded-lg flex-1 flex items-center justify-center text-center">
              {getAiMessage()}
            </p>
          </div>
        </div>

        {/* 우측 영역: 무한스크롤 타임라인 목록 피드 또는 달력 뷰 */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">투자 일지</h3>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition duration-150 cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                타임라인
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition duration-150 cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                달력
              </button>
            </div>
          </div>

          {/* 다중 필터 영역 */}
          <div className="flex flex-wrap gap-2 items-center pb-3 border-b border-slate-100/70 select-none">
            {/* Ticker Search Combobox */}
            <Dropdown className="relative">
              <Dropdown.Trigger className="flex items-center justify-between gap-1.5 px-3 py-1.5 border border-slate-200/90 rounded-lg bg-white text-xs font-semibold text-slate-655 hover:border-slate-350 hover:bg-slate-50/50 transition duration-150 cursor-pointer min-w-[120px]">
                <span className="truncate">{filterTicker === 'ALL' ? '종목: 전체' : filterTicker}</span>
                <span className="text-[9px] text-slate-400 font-normal">▼</span>
              </Dropdown.Trigger>
              
              <Dropdown.Menu className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 flex flex-col gap-1.5 animate-fadeIn">
                <input
                  type="text"
                  placeholder="티커 검색..."
                  value={tickerSearchQuery}
                  onChange={(e) => setTickerSearchQuery(e.target.value.toUpperCase())}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                  onClick={(e) => e.stopPropagation()} // 클릭 시 드롭다운 닫힘 방지
                  autoFocus
                />
                <div className="max-h-36 overflow-y-auto flex flex-col gap-0.5 pl-0.5 pr-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <Dropdown.Option
                    optionId="ALL"
                    onSelect={() => {
                      setFilterTicker('ALL');
                      setTickerSearchQuery('');
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                      filterTicker === 'ALL' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                    }`}
                  >
                    전체 종목
                  </Dropdown.Option>
                  {activeTickers
                    .filter((t: string) => t.toLowerCase().includes(tickerSearchQuery.toLowerCase()))
                    .map((ticker: string) => (
                      <Dropdown.Option
                        key={ticker}
                        optionId={ticker}
                        onSelect={() => {
                          setFilterTicker(ticker);
                          setTickerSearchQuery('');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                          filterTicker === ticker ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                        }`}
                      >
                        {ticker}
                      </Dropdown.Option>
                    ))}
                </div>
              </Dropdown.Menu>
            </Dropdown>

            {/* Action Type Filter */}
            <Dropdown className="relative">
              <Dropdown.Trigger className="flex items-center justify-between gap-1.5 px-3 py-1.5 border border-slate-200/90 rounded-lg bg-white text-xs font-semibold text-slate-655 hover:border-slate-350 hover:bg-slate-50/50 transition duration-150 cursor-pointer min-w-[110px]">
                <span>
                  {filterAction === 'ALL' ? '유형: 전체' :
                   filterAction === 'BUY' ? '매수' :
                   filterAction === 'SELL' ? '매도' : '메모'}
                </span>
                <span className="text-[9px] text-slate-400 font-normal">▼</span>
              </Dropdown.Trigger>
              <Dropdown.Menu className="absolute top-full left-0 mt-1.5 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 flex flex-col gap-0.5 animate-fadeIn">
                <Dropdown.Option
                  optionId="ALL"
                  onSelect={() => setFilterAction('ALL')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                    filterAction === 'ALL' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                  }`}
                >
                  유형: 전체
                </Dropdown.Option>
                <Dropdown.Option
                  optionId="BUY"
                  onSelect={() => setFilterAction('BUY')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                    filterAction === 'BUY' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                  }`}
                >
                  매수
                </Dropdown.Option>
                <Dropdown.Option
                  optionId="SELL"
                  onSelect={() => setFilterAction('SELL')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                    filterAction === 'SELL' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                  }`}
                >
                  매도
                </Dropdown.Option>
                <Dropdown.Option
                  optionId="MEMO"
                  onSelect={() => setFilterAction('MEMO')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                    filterAction === 'MEMO' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                  }`}
                >
                  메모
                </Dropdown.Option>
              </Dropdown.Menu>
            </Dropdown>

            {/* Feeling Filter */}
            <Dropdown className="relative">
              <Dropdown.Trigger className="flex items-center justify-between gap-1.5 px-3 py-1.5 border border-slate-200/90 rounded-lg bg-white text-xs font-semibold text-slate-655 hover:border-slate-350 hover:bg-slate-50/50 transition duration-150 cursor-pointer min-w-[110px]">
                <span>
                  {filterFeeling === 'ALL' ? '감정: 전체' :
                   filterFeeling === 'CALM' ? '차분함' :
                   filterFeeling === 'GREEDY' ? '탐욕' :
                   filterFeeling === 'FEAR' ? '공포' : '평온'}
                </span>
                <span className="text-[9px] text-slate-400 font-normal">▼</span>
              </Dropdown.Trigger>
              <Dropdown.Menu className="absolute top-full left-0 mt-1.5 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 flex flex-col gap-0.5 animate-fadeIn">
                <Dropdown.Option
                  optionId="ALL"
                  onSelect={() => setFilterFeeling('ALL')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                    filterFeeling === 'ALL' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                  }`}
                >
                  감정: 전체
                </Dropdown.Option>
                <Dropdown.Option
                  optionId="CALM"
                  onSelect={() => setFilterFeeling('CALM')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                    filterFeeling === 'CALM' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                  }`}
                >
                  차분함
                </Dropdown.Option>
                <Dropdown.Option
                  optionId="GREEDY"
                  onSelect={() => setFilterFeeling('GREEDY')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                    filterFeeling === 'GREEDY' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                  }`}
                >
                  탐욕
                </Dropdown.Option>
                <Dropdown.Option
                  optionId="FEAR"
                  onSelect={() => setFilterFeeling('FEAR')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                    filterFeeling === 'FEAR' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                  }`}
                >
                  공포
                </Dropdown.Option>
                <Dropdown.Option
                  optionId="NEUTRAL"
                  onSelect={() => setFilterFeeling('NEUTRAL')}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition duration-150 cursor-pointer ${
                    filterFeeling === 'NEUTRAL' ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-655'
                  }`}
                >
                  평온
                </Dropdown.Option>
              </Dropdown.Menu>
            </Dropdown>

            {/* Reset Filters Button */}
            {isFiltered && (
              <button
                onClick={() => {
                  setFilterTicker('ALL');
                  setFilterAction('ALL');
                  setFilterFeeling('ALL');
                }}
                className="px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition duration-150 cursor-pointer font-bold ml-auto"
              >
                필터 초기화
              </button>
            )}
          </div>

          {viewMode === 'timeline' ? (
            isInfiniteLoading ? (
              <div className="text-center py-20 text-sm text-slate-500">데이터를 불러오는 중...</div>
            ) : (isFiltered ? filteredJournals : infiniteJournals).length > 0 ? (
              <div
                ref={scrollContainerRef}
                className="max-h-[660px] overflow-y-auto pl-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <div className="relative pl-6 border-l-2 border-slate-200/85 flex flex-col gap-6 py-2">
                  {(isFiltered ? filteredJournals : infiniteJournals).map((journal: JournalResponseDto) => {
                    const meta = FEELING_META[journal.feeling] || FEELING_META.NEUTRAL;

                    let actionLabel = '메모';
                    if (journal.actionType === 'BUY') actionLabel = '매수';
                    else if (journal.actionType === 'SELL') actionLabel = '매도';

                    return (
                      <div
                        key={journal.id}
                        onClick={() => navigate({ to: '/stock/$ticker', params: { ticker: journal.ticker } })}
                        className="relative group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-350 hover:bg-slate-50/50 transition duration-200 cursor-pointer shadow-xs select-text text-slate-800 animate-fadeIn"
                      >
                        {/* 타임라인 축 포인트 데코레이션 */}
                        <span
                          className="absolute -left-[32px] top-5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 inline-block shadow-sm"
                        ></span>

                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">
                              {journal.journalDate}
                              {journal.journalTime && <span className="ml-1 text-xs text-slate-400 font-normal">({journal.journalTime})</span>}
                            </span>
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{journal.ticker}</span>

                            <span className={`text-xs px-2 py-0.5 rounded border 
                            ${journal.actionType === 'BUY' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                journal.actionType === 'SELL' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                  'bg-slate-50 border-slate-200 text-slate-500'}`}>
                              {actionLabel}
                            </span>
                          </div>

                          {/* 삭제 버튼 */}
                          <button
                            onClick={(e) => handleDelete(journal.id, e)}
                            className="text-slate-400 hover:text-rose-500 transition cursor-pointer text-base p-1"
                            title="일지 삭제"
                          >
                            ✕
                          </button>
                        </div>

                        {/* 수량 / 단가 (MEMO가 아닐 때만 노출) */}
                        {journal.actionType !== 'MEMO' && (
                          <div className="text-sm text-slate-500 flex items-center gap-3 mb-4 bg-slate-50/50 py-2 px-3.5 rounded border border-slate-200 w-fit">
                            <span>수량: {journal.quantity}주</span>
                            <span className="text-slate-300">|</span>
                            <span>단가: ${journal.price}</span>
                          </div>
                        )}

                        {/* 감정 태그 */}
                        <div className="mb-3">
                          <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border ${meta.bg} ${meta.color}`}>
                            <meta.icon className="w-[18px] h-[18px] shrink-0" />
                            <span>{meta.label}</span>
                          </span>
                        </div>

                        {/* 일지 내용 */}
                        <p className="text-base text-slate-650 leading-relaxed whitespace-pre-wrap font-medium">
                          {journal.notes || <span className="text-slate-400 italic font-normal">메모 내용이 없습니다.</span>}
                        </p>
                      </div>
                    );
                  })}

                  {/* 무한스크롤 IntersectionObserver 감지 지점: 필터 적용 시 렌더링 안 함 */}
                  {!isFiltered && (
                    <div ref={observerRef} className="py-4 text-center">
                      {isFetchingNextPage ? (
                        <span className="text-sm text-slate-400 animate-pulse">더 불러오는 중...</span>
                      ) : hasNextPage ? (
                        <span className="text-xs text-slate-300">↓ 스크롤하여 더 보기</span>
                      ) : (
                        <span className="text-xs text-slate-300">모든 일지를 불러왔습니다.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-xs text-slate-400 italic">
                필터 조건에 부합하는 투자 일지가 없습니다.
              </div>
            )
          ) : (
            isAllLoading ? (
              <div className="text-center py-20 text-sm text-slate-500">달력 데이터를 불러오는 중...</div>
            ) : (
              <JournalCalendar allJournals={filteredJournals} onDelete={handleDelete} />
            )
          )}
        </div>

      </div>
    </div>
  );
};

export const Route = createFileRoute('/diary/')({
  component: DiaryPage,
});
