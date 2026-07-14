import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { type JournalResponseDto } from '@/features/stock-journal/hooks/useJournalQueries';
import CalmIcon from "@/shared/asset/icons/calm.svg?react";
import GreedIcon from "@/shared/asset/icons/greed.svg?react";
import FearIcon from "@/shared/asset/icons/fear.svg?react";
import GoodIcon from "@/shared/asset/icons/good.svg?react";

const FEELING_META = {
  CALM: { icon: GoodIcon, label: '차분함', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', dotColor: 'bg-blue-500' },
  GREEDY: { icon: GreedIcon, label: '탐욕', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', dotColor: 'bg-emerald-500' },
  FEAR: { icon: FearIcon, label: '공포', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', dotColor: 'bg-rose-500' },
  NEUTRAL: { icon: CalmIcon, label: '평온', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-300', dotColor: 'bg-slate-500' }
};

interface JournalCalendarProps {
  allJournals: JournalResponseDto[];
  onDelete: (id: number, e: React.MouseEvent) => Promise<void>;
}

interface CalendarCell {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  dayNum: number;
}

export const JournalCalendar: React.FC<JournalCalendarProps> = ({ allJournals, onDelete }) => {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11

  // 달력 그리드판 접힘 상태 및 하단 목록 스크롤 레퍼런스 정의
  const [isCalGridVisible, setIsCalGridVisible] = useState(true);
  const detailScrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCalWheel = (e: React.WheelEvent) => {
    // 1. 우측 달력 영역 내의 모든 휠 동작은 좌측 사이드로 절대 버블링되지 않도록 완전 방어!
    e.stopPropagation();

    const detailScroll = detailScrollContainerRef.current;
    
    if (e.deltaY > 10 && isCalGridVisible) {
      // 휠을 내리면 묻지도 따지지도 않고 달력판을 즉시 접어 상세 일지 영역을 넓혀줌!
      setIsCalGridVisible(false);
    } else if (e.deltaY < -10 && !isCalGridVisible) {
      // 하단 일지 목록 스크롤바가 맨 위이거나, 일지가 없어 스크롤 컨테이너가 마운트되지 않았을 때 펼침!
      if (!detailScroll || detailScroll.scrollTop <= 0) {
        setIsCalGridVisible(true);
      }
    }
  };
  
  const todayStr = useMemo(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }, [today]);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // 1. 달력 날짜 그리드 (42칸) 생성 로직
  const calendarCells = useMemo<CalendarCell[]>(() => {
    const cells: CalendarCell[] = [];
    
    // 이번 달 1일 요일 및 전체 일수
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0: 일요일, 6: 토요일
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // 이전 달 정보
    const prevMonthDate = new Date(currentYear, currentMonth, 0);
    const prevTotalDays = prevMonthDate.getDate();
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();
    
    // 다음 달 정보
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextYear = nextMonthDate.getFullYear();
    const nextMonth = nextMonthDate.getMonth();

    // 1-1. 이전 달 날짜 채우기
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevTotalDays - i;
      const date = new Date(prevYear, prevMonth, day);
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ date, dateStr, isCurrentMonth: false, dayNum: day });
    }

    // 1-2. 이번 달 날짜 채우기
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ date, dateStr, isCurrentMonth: true, dayNum: day });
    }

    // 1-3. 다음 달 날짜 채우기 (42칸 기준 남은 빈칸 채우기)
    const remainingCells = 42 - cells.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(nextYear, nextMonth, day);
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ date, dateStr, isCurrentMonth: false, dayNum: day });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // 2. 전체 저널 데이터를 날짜(dateStr)를 키로 하는 맵으로 인덱싱 (성능 최적화)
  const journalMap = useMemo(() => {
    const map = new Map<string, JournalResponseDto[]>();
    allJournals.forEach((journal) => {
      const dateStr = journal.journalDate;
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(journal);
    });
    return map;
  }, [allJournals]);

  // 3. 월 전환 핸들러
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  // 4. 현재 선택된 날짜의 저널 목록
  const selectedJournals = useMemo(() => {
    return journalMap.get(selectedDateStr) || [];
  }, [journalMap, selectedDateStr]);

  // 요일 헤더
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div 
      onWheel={handleCalWheel}
      className="flex flex-col gap-6 w-full h-full min-h-0 overflow-hidden animate-fadeIn"
    >
      {/* 캘린더 메인 컨테이너 */}
      <div 
        className={`bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col gap-4 flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isCalGridVisible 
            ? "h-[430px] opacity-100 mb-0" 
            : "h-0 opacity-0 mb-0 py-0 border-0 shadow-none pointer-events-none"
        }`}
      >
        {/* 달력 헤더 네비게이션 */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-800">
              {currentYear}년 {currentMonth + 1}월
            </h4>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <button
              onClick={handlePrevMonth}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition duration-150 cursor-pointer text-xs font-semibold"
              title="이전 달"
            >
              이전
            </button>
            <button
              onClick={handleGoToday}
              className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition duration-150 cursor-pointer text-xs font-semibold"
            >
              오늘
            </button>
            <button
              onClick={handleNextMonth}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition duration-150 cursor-pointer text-xs font-semibold"
              title="다음 달"
            >
              다음
            </button>
          </div>
        </div>

        {/* 요일 헤더 그리드 */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-600 py-1">
          {weekdays.map((day, idx) => (
            <span
              key={day}
              className={idx === 0 ? 'text-rose-500/80' : idx === 6 ? 'text-blue-500/80' : ''}
            >
              {day}
            </span>
          ))}
        </div>

        {/* 날짜 셀 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, index) => {
            const journals = journalMap.get(cell.dateStr) || [];
            const hasJournals = journals.length > 0;
            const isSelected = selectedDateStr === cell.dateStr;
            const isCellToday = todayStr === cell.dateStr;
            
            // 일요일/토요일 판별
            const dayOfWeek = cell.date.getDay();
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;

            // 셀 내 일지 요약 데이터 (감정 분포, 매수/매도 여부)
            const tradeSummary = journals.reduce((acc, curr) => {
              if (curr.actionType === 'BUY') acc.buy += 1;
              if (curr.actionType === 'SELL') acc.sell += 1;
              if (curr.actionType === 'MEMO') acc.memo += 1;
              return acc;
            }, { buy: 0, sell: 0, memo: 0 });

            // 대표 감정 색상 도트 목록
            const uniqueFeelings = Array.from(new Set(journals.map(j => j.feeling)));

            return (
              <div
                key={cell.dateStr + '-' + index}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`
                  relative min-h-[50px] p-2 border rounded-lg flex flex-col justify-between transition duration-200 cursor-pointer select-none
                  ${cell.isCurrentMonth ? 'bg-white' : 'bg-slate-100/40 opacity-70'}
                  ${isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-100/60 shadow-xs bg-blue-50/5' 
                    : isCellToday
                      ? 'border-slate-400 bg-slate-50/20'
                      : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/30'
                  }
                `}
              >
                {/* 상단: 날짜 표시 */}
                <div className="flex justify-between items-center">
                  <span
                    className={`
                      text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full
                      ${!cell.isCurrentMonth 
                        ? 'text-slate-400 font-medium' 
                        : isCellToday 
                          ? 'bg-blue-600 text-white' 
                          : isSunday 
                            ? 'text-rose-500' 
                            : isSaturday 
                              ? 'text-blue-500' 
                              : 'text-slate-800 font-bold'
                      }
                    `}
                  >
                    {cell.dayNum}
                  </span>
                  
                  {/* 일지 건수 뱃지 */}
                  {hasJournals && (
                    <span className="text-[10px] bg-slate-100 border border-slate-200/65 text-slate-500 font-bold px-1 py-0.25 rounded-md scale-90">
                      {journals.length}
                    </span>
                  )}
                </div>

                {/* 하단: 일지 데이터 요약 표시 */}
                <div className="flex flex-col gap-1 mt-1 shrink-0">
                  {/* 감정 도트 표시 */}
                  {hasJournals && (
                    <div className="flex gap-1 items-center overflow-x-hidden min-h-[6px]">
                      {uniqueFeelings.map((feeling) => {
                        const meta = FEELING_META[feeling] || FEELING_META.NEUTRAL;
                        return (
                          <span
                            key={feeling}
                            className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`}
                            title={meta.label}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* 거래 유형별 뱃지 (미니멀하게 아이콘으로만) */}
                  {hasJournals && (
                    <div className="flex gap-1 items-center flex-wrap">
                      {tradeSummary.buy > 0 && (
                        <span className="text-[8px] font-bold text-rose-600 bg-rose-50/50 border border-rose-200/50 px-0.5 rounded" title={`매수 ${tradeSummary.buy}건`}>
                          ▲
                        </span>
                      )}
                      {tradeSummary.sell > 0 && (
                        <span className="text-[8px] font-bold text-blue-600 bg-blue-50/50 border border-blue-200/50 px-0.5 rounded" title={`매도 ${tradeSummary.sell}건`}>
                          ▼
                        </span>
                      )}
                      {tradeSummary.memo > 0 && (
                        <span className="text-[8px] font-bold text-slate-500 bg-slate-50/50 border border-slate-200/50 px-0.5 rounded" title={`메모 ${tradeSummary.memo}건`}>
                          ●
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 캘린더 상세 리스트 영역 */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
        <h4 className="text-sm font-semibold text-slate-700">
          {selectedDateStr}의 투자 일지
        </h4>

        {selectedJournals.length > 0 ? (
          <div 
            ref={detailScrollContainerRef}
            className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1"
          >
            {selectedJournals.map((journal) => {
              const meta = FEELING_META[journal.feeling] || FEELING_META.NEUTRAL;
              let actionLabel = '메모';
              if (journal.actionType === 'BUY') actionLabel = '매수';
              else if (journal.actionType === 'SELL') actionLabel = '매도';

              return (
                <div
                  key={journal.id}
                  onClick={() => navigate({ to: '/stock/$ticker', params: { ticker: journal.ticker } })}
                  className="relative group bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-350 hover:bg-slate-50/50 transition duration-200 cursor-pointer shadow-xs select-text text-slate-800"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {journal.journalTime ? `${journal.journalTime}` : '시간 미기재'}
                      </span>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                        {journal.ticker}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-semibold
                          ${journal.actionType === 'BUY' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                            journal.actionType === 'SELL' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                              'bg-slate-50 border-slate-200 text-slate-500'}`}
                      >
                        {actionLabel}
                      </span>
                    </div>

                    {/* 일지 삭제 버튼 */}
                    <button
                      onClick={(e) => onDelete(journal.id, e)}
                      className="text-slate-400 hover:text-rose-500 transition cursor-pointer text-sm p-1"
                      title="일지 삭제"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 수량 / 단가 (MEMO가 아닐 때만 노출) */}
                  {journal.actionType !== 'MEMO' && (
                    <div className="text-xs text-slate-500 flex items-center gap-3 mb-3 bg-slate-50/50 py-1.5 px-3 rounded border border-slate-200 w-fit">
                      <span>수량: {journal.quantity}주</span>
                      <span className="text-slate-300">|</span>
                      <span>단가: ${journal.price}</span>
                    </div>
                  )}

                  {/* 감정 태그 */}
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${meta.bg} ${meta.color} font-medium`}>
                      <meta.icon className="w-[14px] h-[14px] shrink-0" />
                      <span>{meta.label}</span>
                    </span>
                  </div>

                  {/* 일지 내용 */}
                  <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-wrap font-medium">
                    {journal.notes || <span className="text-slate-400 italic font-normal">메모 내용이 없습니다.</span>}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-400 italic">
            이 날짜에 작성된 투자 일지가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
