import { apiClient } from '@/shared/api/apiClient'; // 기존 axios 클라이언트 호출
import type { KeywordRequest, AiTextResponse } from '@/entities/ai/types/ai.types';

export const fetchAiAnalysis = async (ticker: string, keyword: string): Promise<AiTextResponse> => {
  const { data } = await apiClient.post<AiTextResponse>(`/ai/stock/${ticker}/keyword`, {
    keyword,
  } as KeywordRequest);
  return data;
};