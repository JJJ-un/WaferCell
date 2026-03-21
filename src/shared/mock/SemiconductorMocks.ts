import { MOCK_SECTORS } from "./sectorMocks";
import { type SemiconductorMarket } from "../types/Semiconductor";

export const MOCK_SEMICONDUCTOR_MARKET: SemiconductorMarket = {
  marketName: "K-Semiconductor Global Index",
  totalMarketCap: 1327000000, // 전체 섹터 시총 합계
  averageChangePercent: 2.88,
  sectors: MOCK_SECTORS,
  lastUpdated: new Date("2026-03-21T16:50:00"),
};