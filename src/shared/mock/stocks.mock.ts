import { type Stock } from "@/shared/types/Semiconductor";

export const MOCK_STOCKS: Stock[] = [
  { id: 's1', ticker: '삼성전자', value: 4500000, change: 1200, changePercent: 1.65, volume: 15000000, price: 73500, sectorName: "파운드리" },
  { id: 's2', ticker: 'SK하이닉스', value: 1200000, change: 4500, changePercent: 2.85, volume: 3200000, price: 162000, sectorName: "파운드리" },
  { id: 's3', ticker: '한미반도체', value: 150000, change: -1500, changePercent: -1.2, volume: 800000, price: 145000, sectorName: "파운드리" },
  { id: 's4', ticker: 'DB하이텍', value: 250000, change: -200, changePercent: -0.45, volume: 250000, price: 43200, sectorName: "파운드리" },
  { id: 's5', ticker: '리노공업', value: 28000, change: 800, changePercent: 0.35, volume: 120000, price: 215000, sectorName: "팹리스" },
  { id: 's6', ticker: '가온칩스', value: 8500, change: 4200, changePercent: 7.5, volume: 1100000, price: 92000, sectorName: "수혜주" },
];