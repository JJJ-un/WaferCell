import React, { useState, useEffect } from 'react';
import { useJournalMutations, type JournalSavePayload } from '@/features/stock-journal/hooks/useJournalMutations';
import { type JournalResponseDto } from '@/features/stock-journal/hooks/useJournalQueries';
import CalmIcon from "@/shared/asset/icons/calm.svg?react";
import GreedIcon from "@/shared/asset/icons/greed.svg?react";
import FearIcon from "@/shared/asset/icons/fear.svg?react";
import GoodIcon from "@/shared/asset/icons/good.svg?react";

interface JournalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  initialDate?: string; // B/S 마커 클릭 시 해당 날짜로 폼 바인딩
  existingJournal?: JournalResponseDto; // 이미 존재하는 일지 조회/수정용
}

const FEELING_OPTIONS = [
  { value: 'CALM', label: '차분함', icon: GoodIcon, desc: '이성적이고 평온함', color: 'border-blue-500 bg-blue-50/60 text-blue-600' },
  { value: 'GREEDY', label: '탐욕', icon: GreedIcon, desc: '추격 매수 및 과열', color: 'border-emerald-500 bg-emerald-50/60 text-emerald-600' },
  { value: 'FEAR', label: '공포', icon: FearIcon, desc: '불안 및 패닉 셀링', color: 'border-rose-500 bg-rose-50/60 text-rose-600' },
  { value: 'NEUTRAL', label: '평온', icon: CalmIcon, desc: '무감정 및 원칙 매매', color: 'border-slate-500 bg-slate-100/60 text-slate-600' }
];

/**
 * [시간 선택 추가] 주식 종목 페이지에서 일지를 작성하거나 기존 기록을 보는 드로워(모달) 컴포넌트
 */
export const JournalDrawer = ({ isOpen, onClose, ticker, initialDate, existingJournal }: JournalDrawerProps) => {
  const { saveJournal, deleteJournal, isSaving } = useJournalMutations();

  const [date, setDate] = useState('');
  const [time, setTime] = useState(''); // 시간대 상태 추가
  const [actionType, setActionType] = useState<'BUY' | 'SELL' | 'MEMO'>('BUY');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [feeling, setFeeling] = useState<'CALM' | 'GREEDY' | 'FEAR' | 'NEUTRAL'>('CALM');
  const [notes, setNotes] = useState('');

  // 마운트 시 또는 인자 변경 시 초기화
  useEffect(() => {
    if (existingJournal) {
      setDate(existingJournal.journalDate);
      setTime(existingJournal.journalTime || '');
      setActionType(existingJournal.actionType);
      setPrice(existingJournal.price?.toString() || '');
      setQuantity(existingJournal.quantity?.toString() || '');
      setFeeling(existingJournal.feeling);
      setNotes(existingJournal.notes);
    } else {
      const today = new Date().toISOString().substring(0, 10);
      setDate(initialDate || today);

      // 현재 시간을 기본값으로 입력 (HH:mm 포맷)
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${mm}`);

      setActionType('BUY');
      setPrice('');
      setQuantity('');
      setFeeling('CALM');
      setNotes('');
    }
  }, [existingJournal, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert('날짜를 선택해 주세요.');
      return;
    }

    const payload: JournalSavePayload = {
      ticker,
      actionType,
      price: actionType !== 'MEMO' && price ? parseFloat(price) : undefined,
      quantity: actionType !== 'MEMO' && quantity ? parseFloat(quantity) : undefined,
      feeling,
      notes,
      journalDate: date,
      journalTime: time // 시간 추가
    };

    try {
      await saveJournal(payload);
      onClose();
    } catch (err) {
      console.error('일지 저장 오류', err);
      alert('일지 저장에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!existingJournal) return;
    if (!confirm('이 일지를 정말 삭제하시겠습니까?')) return;

    try {
      await deleteJournal(existingJournal.id);
      onClose();
    } catch (err) {
      console.error('일지 삭제 오류', err);
      alert('일지 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex justify-end select-text text-slate-800">
      {/* 백드롭 (클릭 시 닫기) */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-xs" onClick={onClose} />

      {/* 드로워 패널 */}
      <div className="relative w-[380px] h-full bg-white border-l border-slate-200 p-6 flex flex-col shadow-2xl transition-all transform translate-x-0 duration-300">

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            {existingJournal ? '투자 일지 상세 보기' : '신규 투자 일지 작성'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-655 transition cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* 날짜 및 시간 선택 (2열 Grid 레이아웃 적용) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-[15px] text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition w-full font-medium"
                required
                disabled={!!existingJournal}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600">시간</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-[15px] text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition w-full font-medium"
                required
                disabled={!!existingJournal}
              />
            </div>
          </div>

          {/* 종목 표시 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">종목</label>
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-[15px] text-slate-800 font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              {ticker.toUpperCase()}
            </div>
          </div>

          {/* 행동 구분 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">구분</label>
            <div className="grid grid-cols-3 gap-2">
              {(['BUY', 'SELL', 'MEMO'] as const).map((type) => {
                let buttonLabel = '메모';
                if (type === 'BUY') buttonLabel = '매수';
                else if (type === 'SELL') buttonLabel = '매도';

                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setActionType(type)}
                    className={`py-2 text-sm font-bold rounded-lg border transition cursor-pointer
                      ${actionType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-600 font-extrabold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                    disabled={!!existingJournal}
                  >
                    {buttonLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 단가 및 수량 (MEMO가 아닐 때만 노출) */}
          {actionType !== 'MEMO' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-600">매매 단가 (USD)</label>
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-[15px] text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition w-full font-medium"
                  required={actionType !== 'MEMO'}
                  disabled={!!existingJournal}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-600">매매 수량</label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-[15px] text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition w-full font-medium"
                  required={actionType !== 'MEMO'}
                  disabled={!!existingJournal}
                />
              </div>
            </div>
          )}

          {/* 당시 심리 상태 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">당시 심리 상태</label>
            <div className="grid grid-cols-2 gap-2">
              {FEELING_OPTIONS.map((opt) => {
                const isSelected = feeling === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setFeeling(opt.value as any)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer text-left w-full
                      ${isSelected
                        ? `${opt.color} border-2 font-bold shadow-xs`
                        : 'border-slate-200/80 bg-slate-50/50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                    disabled={!!existingJournal}
                  >
                    <opt.icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 투자 일지 및 복기 메모 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">투자 일지 및 복기 메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="매매의 명확한 근거와 오늘의 생각들을 상세히 기록해 보세요..."
              className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-[15px] text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition h-32 resize-none leading-relaxed placeholder-slate-400 font-medium"
              maxLength={3000}
              disabled={!!existingJournal}
            />
          </div>

          {/* 액션 버튼 */}
          <div className="mt-auto pt-4 flex flex-col gap-2">
            {!existingJournal ? (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-[15px] transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '기록 저장'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold py-2.5 rounded-lg text-[15px] transition cursor-pointer"
              >
                일지 삭제
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-150 hover:bg-slate-200 text-slate-500 py-2 rounded-lg text-[15px] transition cursor-pointer border border-slate-200"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
