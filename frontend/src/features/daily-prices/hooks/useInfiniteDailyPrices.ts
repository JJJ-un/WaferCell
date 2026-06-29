import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPagedPrices } from "../api/fetchPagedPrices";
import type { DailyPrice } from "@/entities/stock/types/stock.types";


export const useInfiniteDailyPrices = (ticker: string) => {
    return useInfiniteQuery<DailyPrice[], Error>({
        queryKey: ["dailyPrices", ticker],
        queryFn: ({ pageParam = 0 }) => fetchPagedPrices(ticker, pageParam as number, 20),
        initialPageParam: 0,
        // 다음 페이지 번호를 계산하여 백엔드에 넘겨주는 핵심 로직
        getNextPageParam: (lastPage, allPages) => {
            // 마지막 페이지의 데이터 개수가 20개 미만이면 더 이상 불러올 데이터가 없음(종료)
            return lastPage.length === 20 ? allPages.length : undefined;
        }
    });
};
