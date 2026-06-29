import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useJournalQueries, type JournalResponseDto } from '@/features/stock-journal/hooks/useJournalQueries';
import { useJournalMutations } from '@/features/stock-journal/hooks/useJournalMutations';
import React from 'react';

const FEELING_META = {
  CALM: { emoji: '😃', label: '차분함', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', barColor: '#3b82f6' },
  GREEDY: { emoji: '🤑', label: '탐욕', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', barColor: '#10b981' },
  FEAR: { emoji: '😨', label: '공포', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', barColor: '#f43f5e' },
  NEUTRAL: { emoji: '😐', label: '평온', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-300', barColor: '#64748b' }
};

/**
 * [한글화 적용] 전체 종목의 매매 일지를 타임라인 피드로 모아보고, 감정 비중 통계를 시각화하는 My Diary 페이지 컴포넌트
 */
export const DiaryPage = () => {
  const navigate = useNavigate();
  const { allJournals, isAllLoading, refetchAll } = useJournalQueries();
  const { deleteJournal } = useJournalMutations();

  // 감정 비율 계산
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
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          나의 투자 일지
        </h2>
        <p className="text-xs text-slate-505">매매 히스토리를 관찰하고, 당시 심리 상태와 AI 애널리스트 피드백을 결산하는 투자 오답노트</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* 좌측 영역: 통계 및 AI Insights */}
        <div className="flex-1 lg:max-w-[400px] flex flex-col gap-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col items-center gap-5">
            <h3 className="text-sm font-bold text-slate-700 self-start">이달의 투자 감정 분석</h3>

            {total > 0 ? (
              <div className="relative flex items-center justify-center w-48 h-48">
                {/* SVG 기반의 도넛 차트 */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#E5E7EB" strokeWidth="12" />

                  {/* 공포 (Rose) */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f43f5e" strokeWidth="12"
                    strokeDasharray={getStrokeDash(fearPct)}
                    strokeDashoffset={0}
                  />

                  {/* 탐욕 (Emerald) */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#10b981" strokeWidth="12"
                    strokeDasharray={getStrokeDash(greedyPct)}
                    strokeDashoffset={-(fearPct / 100) * circumference}
                  />

                  {/* 차분함 (Blue) */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#3b82f6" strokeWidth="12"
                    strokeDasharray={getStrokeDash(calmPct)}
                    strokeDashoffset={-((fearPct + greedyPct) / 100) * circumference}
                  />

                  {/* 평온 (Slate) */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#64748b" strokeWidth="12"
                    strokeDasharray={getStrokeDash(neutralPct)}
                    strokeDashoffset={-((fearPct + greedyPct + calmPct) / 100) * circumference}
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
                <span className="w-3 h-3 rounded-full bg-rose-505 inline-block"></span>
                <span className="text-slate-600 font-bold">공포 ({fearPct}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-500 inline-block"></span>
                <span className="text-slate-600 font-bold">평온 ({neutralPct}%)</span>
              </div>
            </div>
          </div>

          {/* AI 감정 Insights */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span>🤖</span>
              <h4>AI 심리 분석 및 피드백</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200/60 p-4 rounded-lg">
              {getAiMessage()}
            </p>
          </div>
        </div>

        {/* 우측 영역: 타임라인 목록 피드 */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-700">투자 일지 타임라인</h3>

          {isAllLoading ? (
            <div className="text-center py-20 text-sm text-slate-500">데이터를 불러오는 중...</div>
          ) : allJournals.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-slate-200/85 flex flex-col gap-6 py-2">
              {allJournals.map((journal) => {
                const meta = FEELING_META[journal.feeling] || FEELING_META.NEUTRAL;

                let actionLabel = '메모';
                if (journal.actionType === 'BUY') actionLabel = '매수';
                else if (journal.actionType === 'SELL') actionLabel = '매도';

                return (
                  <div
                    key={journal.id}
                    onClick={() => navigate({ to: `/chart/${journal.ticker}` })}
                    className="relative group bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-350 hover:bg-slate-50/50 transition duration-200 cursor-pointer shadow-xs select-text text-slate-800"
                  >
                    {/* 타임라인 축 포인트 데코레이션 */}
                    <span
                      className="absolute -left-[32px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white inline-block shadow-xs"
                      style={{ backgroundColor: meta.barColor }}
                    ></span>

                    <div className="flex justify-between items-start gap-4 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-bold">
                          {journal.journalDate}
                          {journal.journalTime && <span className="ml-1 text-[10px] text-slate-400 font-normal">({journal.journalTime})</span>}
                        </span>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{journal.ticker}</span>

                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border 
                          ${journal.actionType === 'BUY' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                            journal.actionType === 'SELL' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                              'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          {actionLabel}
                        </span>
                      </div>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => handleDelete(journal.id, e)}
                        className="text-slate-400 hover:text-rose-500 transition cursor-pointer text-xs p-1"
                        title="일지 삭제"
                      >
                        ✕
                      </button>
                    </div>

                    {/* 수량 / 단가 (MEMO가 아닐 때만 노출) */}
                    {journal.actionType !== 'MEMO' && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-3 mb-2.5 bg-slate-50/50 py-1 px-2.5 rounded border border-slate-200 w-fit">
                        <span>수량: <strong className="text-slate-700">{journal.quantity}주</strong></span>
                        <span className="text-slate-300">|</span>
                        <span>단가: <strong className="text-slate-700">${journal.price}</strong></span>
                      </div>
                    )}

                    {/* 감정 태그 */}
                    <div className="mb-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
                        <span>{meta.emoji}</span>
                        <span>{meta.label}</span>
                      </span>
                    </div>

                    {/* 일지 내용 */}
                    <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap font-medium">
                      {journal.notes || <span className="text-slate-400 italic font-normal">메모 내용이 없습니다.</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 text-xs text-slate-400 italic">
              작성된 투자 일지가 없습니다. 주식 상세 차트 페이지에서 일지를 작성해 보세요.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export const Route = createFileRoute('/diary/')({
  component: DiaryPage,
});
