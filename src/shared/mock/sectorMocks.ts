// SectorName 타입이 정의되어 있지 않다면 아래와 같이 가정합니다.
import { type Sector } from "../types/Semiconductor";

export const MOCK_SECTORS: Sector[] = [
  {
    sectorName: 'EDA/IP',
    change: 1500,
    changePercent: 3.45,
    marketCap: 45000000,
    companyCount: 8,
  },
  {
    sectorName: '팹리스',
    change: 2400,
    changePercent: 5.12,
    marketCap: 82000000,
    companyCount: 24,
  },
  {
    sectorName: '파운드리',
    change: -1200,
    changePercent: -0.85,
    marketCap: 350000000,
    companyCount: 2,
  },
  {
    sectorName: 'IDM/메모리',
    change: 8500,
    changePercent: 1.25,
    marketCap: 620000000,
    companyCount: 3,
  },
  {
    sectorName: '소부장',
    change: 450,
    changePercent: 0.65,
    marketCap: 150000000,
    companyCount: 65,
  },
  {
    sectorName: 'OSAT',
    change: 950,
    changePercent: 2.15,
    marketCap: 55000000,
    companyCount: 15,
  },
  {
    sectorName: '수혜주',
    change: 3200,
    changePercent: 8.42,
    marketCap: 25000000,
    companyCount: 12,
  },
];