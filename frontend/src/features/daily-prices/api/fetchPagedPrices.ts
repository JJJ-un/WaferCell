import type { DailyPrice } from "@/entities/stock/types/stock.types";

export const fetchPagedPrices = async (ticker: string, page: number, size: number): Promise<DailyPrice[]> => {
    const response = await fetch(`/api/stocks/${ticker}/daily-prices?page=${page}&size=${size}`);
    if (!response.ok) {
        throw new Error("일별 시세 데이터를 가져오지 못했습니다.");
    }
    return response.json();
};