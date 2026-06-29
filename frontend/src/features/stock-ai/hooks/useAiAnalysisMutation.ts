import { useMutation } from '@tanstack/react-query'; // 기존 TanStack 시스템 연동
import { fetchAiAnalysis } from '../api/fetchAiAnalysis';
import type { AiTextResponse } from '@/entities/ai/types/ai.types';

interface MutationParams {
  ticker: string;
  keyword: string;
}

export const useAiAnalysisMutation = () => {
  return useMutation<AiTextResponse, Error, MutationParams>({
    mutationKey: ['stock', 'ai', 'analysis'],
    mutationFn: ({ ticker, keyword }) => fetchAiAnalysis(ticker, keyword),
  });
};